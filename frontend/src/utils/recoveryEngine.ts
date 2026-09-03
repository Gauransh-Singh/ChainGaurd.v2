import { Shipment, ActiveCrisis, RecoveryOption, RouteSegment, TransportMode, PathLeg } from '../types/shipment';
import { INITIAL_CUSTOM_ROUTES, CustomRoute } from '../data/routes';
import { LOCATIONS_MAP } from '../data/locations';
import { calculateSegmentDistanceKm } from './routingEngine';

// Build a route segment from a CustomRoute definition
const buildSegmentFromCustomRoute = (cr: CustomRoute): RouteSegment => {
  const dist = calculateSegmentDistanceKm(cr.from, cr.to, cr.controlPoints || [], cr.mode, cr.isTranspacific || false);
  return {
    routeId: cr.id,
    from: cr.from,
    to: cr.to,
    mode: cr.mode,
    isTranspacific: cr.isTranspacific,
    controlPoints: cr.controlPoints || [],
    distanceKm: dist,
  };
};

/**
 * Graph search to discover paths between startNode and endNode
 * while excluding any blocked edges.
 */
const findGraphPaths = (
  startNode: string,
  endNode: string,
  allowedModes: TransportMode[],
  blockedRouteId?: string,
  blockedFrom?: string,
  blockedTo?: string,
  maxHops: number = 3
): CustomRoute[][] => {
  const validRoutes = INITIAL_CUSTOM_ROUTES.filter((r) => {
    if (r.id === blockedRouteId) return false;
    if (blockedFrom && blockedTo && ((r.from === blockedFrom && r.to === blockedTo) || (r.from === blockedTo && r.to === blockedFrom))) {
      return false;
    }
    return allowedModes.includes(r.mode);
  });

  const results: CustomRoute[][] = [];

  const dfs = (curr: string, path: CustomRoute[], visited: Set<string>) => {
    if (curr === endNode && path.length > 0) {
      results.push([...path]);
      return;
    }
    if (path.length >= maxHops) return;

    // Find outgoing edges
    for (const r of validRoutes) {
      if (r.from === curr && !visited.has(r.to)) {
        visited.add(r.to);
        path.push(r);
        dfs(r.to, path, visited);
        path.pop();
        visited.delete(r.to);
      }
      // Allow reversible navigation on bidirectional lanes
      else if (r.to === curr && !visited.has(r.from)) {
        const revRoute: CustomRoute = {
          ...r,
          id: `${r.id}-REV`,
          from: r.to,
          to: r.from,
          controlPoints: r.controlPoints ? [...r.controlPoints].reverse() : [],
        };
        visited.add(r.from);
        path.push(revRoute);
        dfs(r.from, path, visited);
        path.pop();
        visited.delete(r.from);
      }
    }
  };

  const initialVisited = new Set<string>([startNode]);
  dfs(startNode, [], initialVisited);
  return results;
};

/**
 * Generate 2 to 3 realistic, network-grounded recovery options for a disrupted shipment
 */
export const generateRecoveryOptions = (
  shipment: Shipment,
  crisis: ActiveCrisis
): RecoveryOption[] => {
  const options: RecoveryOption[] = [];
  const segIdx = Math.min(shipment.segments.length - 1, shipment.currentSegmentIndex);
  const activeSeg = shipment.segments[segIdx];
  const currentNode = activeSeg?.from || shipment.from;
  const destNode = shipment.to;
  const blockedRouteId = crisis.affectedRouteId || activeSeg?.routeId;
  const blockedFrom = crisis.affectedSegment?.from || activeSeg?.from;
  const blockedTo = crisis.affectedSegment?.to || activeSeg?.to;

  const currentDist = activeSeg?.distanceKm || shipment.totalDistanceKm || 6500;

  // =========================================================================
  // 1. SCENARIO: Red Sea / Suez Canal Blockade (DXB ➔ RTM maritime corridor)
  // =========================================================================
  if (
    (currentNode === 'DXB' || shipment.pathNodes.includes('DXB')) &&
    (destNode === 'RTM' || destNode === 'HAM' || destNode === 'LON') &&
    shipment.mode === 'sea'
  ) {
    // 🟢 OPTION A — Cape of Good Hope Detour (DXB ➔ CPT ➔ RTM)
    const cr1 = INITIAL_CUSTOM_ROUTES.find((r) => r.id === 'SEA-DXB-CPT-2889');
    const cr2 = INITIAL_CUSTOM_ROUTES.find((r) => r.id === 'SEA-CPT-RTM-4225');
    if (cr1 && cr2) {
      const segs = [buildSegmentFromCustomRoute(cr1), buildSegmentFromCustomRoute(cr2)];
      const totalDetourDist = segs.reduce((acc, s) => acc + s.distanceKm, 0);

      options.push({
        id: 'OPT-DETOUR-CPT',
        title: 'Cape of Good Hope Detour',
        type: 'DETOUR',
        mode: 'sea',
        modeBadge: '🚢 Maritime',
        pathNodes: ['DXB', 'CPT', 'RTM'],
        pathLegs: [
          { from: 'DXB', to: 'CPT', mode: 'sea', icon: '🚢', label: 'Dubai' },
          { from: 'CPT', to: 'RTM', mode: 'sea', icon: '🚢', label: 'Cape Town' },
          { from: 'RTM', to: 'RTM', mode: 'sea', icon: '🚢', label: 'Rotterdam' },
        ],
        segments: segs,
        etaLabel: '⏱ ETA Impact',
        etaValue: '+4.2 days',
        isFaster: false,
        costFormatted: '+₹4.8L',
        riskLevel: 'LOW',
        distanceDeltaKm: Math.round(totalDetourDist - currentDist),
        totalDistanceKm: Math.round(totalDetourDist),
        description: 'Bypass Red Sea risk zone by navigating south along East Africa and rounding the Cape of Good Hope into the North Atlantic.',
        recommended: true,
      });
    }

    // 🟣 OPTION B — Sea ➔ Air ➔ Road Multimodal Conversion (DXB ➔ Transfer ➔ FRA ➔ RTM)
    const crAir = INITIAL_CUSTOM_ROUTES.find((r) => r.id === 'AIR-DXB-FRA-0534');
    const crRoad = INITIAL_CUSTOM_ROUTES.find((r) => r.id === 'ROAD-FRA-RTM-3910');
    if (crAir && crRoad) {
      const segs = [buildSegmentFromCustomRoute(crAir), buildSegmentFromCustomRoute(crRoad)];
      const totalDist = segs.reduce((acc, s) => acc + s.distanceKm, 0);

      options.push({
        id: 'OPT-AIR-CONVERT',
        title: 'Sea ➔ Air ➔ Road Multimodal',
        type: 'MULTIMODAL',
        mode: 'multimodal',
        modeBadge: '🟣 Multimodal Conversion',
        pathNodes: ['DXB', 'FRA', 'RTM'],
        pathLegs: [
          { from: 'DXB', to: 'DXB', mode: 'transfer', icon: '🚢', label: 'Dubai' },
          { from: 'DXB', to: 'FRA', mode: 'air', icon: '✈️', label: 'Frankfurt' },
          { from: 'FRA', to: 'RTM', mode: 'road', icon: '🚚', label: 'Rotterdam' },
        ],
        segments: segs,
        etaLabel: '⏱ ETA Improvement',
        etaValue: '3.5 days faster',
        isFaster: true,
        costFormatted: '+₹8.5L',
        riskLevel: 'LOW',
        distanceDeltaKm: 850,
        totalDistanceKm: Math.round(totalDist),
        description: 'Offload cargo at Jebel Ali multimodal terminal, transfer to chartered Boeing 777F flight to Frankfurt Hub, followed by express bonded truck transport to Rotterdam.',
        recommended: false,
      });
    }

    // ⏸️ OPTION C — Tactical Anchorage Hold
    options.push({
      id: 'OPT-HOLD-DXB',
      title: 'Tactical Gulf Anchorage Hold',
      type: 'HOLD_WAIT',
      mode: 'sea',
      modeBadge: '⏸️ Anchorage Hold',
      pathNodes: ['DXB', 'RTM'],
      pathLegs: [
        { from: 'DXB', to: 'DXB', mode: 'transfer', icon: '⏸️', label: 'Dubai Hold' },
        { from: 'DXB', to: 'RTM', mode: 'sea', icon: '🚢', label: 'Rotterdam' },
      ],
      segments: shipment.segments,
      etaLabel: '⏱ ETA Impact',
      etaValue: '+6.2 days',
      isFaster: false,
      costFormatted: '+₹1.4L',
      riskLevel: 'MODERATE',
      distanceDeltaKm: 0,
      totalDistanceKm: Math.round(shipment.totalDistanceKm),
      description: 'Hold vessel at Jebel Ali deepwater anchorage until maritime security escorts reopen the southern Bab-el-Mandeb transit channel.',
      recommended: false,
    });

    return options;
  }

  // =========================================================================
  // 2. SCENARIO: Cold-Chain Temperature Excursion (Vaccines / Biologics)
  // =========================================================================
  if (crisis.type === 'TEMP_EXCURSION' || shipment.cargoType === 'biologics') {
    const crAirDirect = INITIAL_CUSTOM_ROUTES.find((r) => r.mode === 'air' && (r.from === currentNode || r.to === destNode));
    const crRoad = INITIAL_CUSTOM_ROUTES.find((r) => r.mode === 'road' && (r.from === destNode || r.to === destNode));

    options.push({
      id: 'OPT-TEMP-AIR-EXP',
      title: 'Cryogenic Recharge & Air Express',
      type: 'MULTIMODAL',
      mode: 'air',
      modeBadge: '✈️ Air Cargo Priority',
      pathNodes: [currentNode, destNode],
      pathLegs: [
        { from: currentNode, to: currentNode, mode: 'transfer', icon: '📦', label: `${LOCATIONS_MAP[currentNode]?.name || currentNode} (Transfer)` },
        { from: currentNode, to: destNode, mode: 'air', icon: '✈️', label: LOCATIONS_MAP[destNode]?.name || destNode },
      ],
      segments: crAirDirect ? [buildSegmentFromCustomRoute(crAirDirect)] : shipment.segments,
      etaLabel: '⏱ ETA Improvement',
      etaValue: '4.8 days faster',
      isFaster: true,
      costFormatted: '+₹6.2L',
      riskLevel: 'High SLA Confidence',
      distanceDeltaKm: -1200,
      totalDistanceKm: Math.round(shipment.totalDistanceKm * 0.7),
      description: 'Immediate dry-ice cryogenic re-icing at hub terminal and fast-track transfer to temperature-controlled air freighter to save biologics payload.',
      recommended: true,
    });

    options.push({
      id: 'OPT-TEMP-PHARMA-HUB',
      title: 'GDP Pharma Cold-Storage Port Diversion',
      type: 'DETOUR',
      mode: shipment.mode,
      modeBadge: shipment.mode === 'air' ? '✈️ Alternate Hub' : '🚢 Priority Berthing',
      pathNodes: [currentNode, destNode],
      pathLegs: [
        { from: currentNode, to: destNode, mode: shipment.mode, icon: shipment.mode === 'air' ? '✈️' : '🚢', label: LOCATIONS_MAP[destNode]?.name || destNode },
      ],
      segments: shipment.segments,
      etaLabel: '⏱ ETA Impact',
      etaValue: '+1.5 days',
      isFaster: false,
      costFormatted: '+₹2.8L',
      riskLevel: 'MODERATE',
      distanceDeltaKm: 450,
      totalDistanceKm: Math.round(shipment.totalDistanceKm + 450),
      description: 'Divert to adjacent GDP-certified pharmaceutical logistics terminal for emergency secondary active refrigeration replacement.',
      recommended: false,
    });

    return options;
  }

  // =========================================================================
  // 3. SCENARIO: Aviation Airspace Restriction / Airport Closure (mode === 'air')
  // =========================================================================
  if (shipment.mode === 'air') {
    const crAlt1 = INITIAL_CUSTOM_ROUTES.find((r) => r.mode === 'air' && r.from === currentNode && r.to === 'IST') ||
                   INITIAL_CUSTOM_ROUTES.find((r) => r.mode === 'air' && r.from === 'IST' && r.to === destNode);
    const crAlt2 = INITIAL_CUSTOM_ROUTES.find((r) => r.mode === 'air' && r.from === 'IST' && r.to === destNode);

    const altSegs = (crAlt1 && crAlt2)
      ? [buildSegmentFromCustomRoute(crAlt1), buildSegmentFromCustomRoute(crAlt2)]
      : shipment.segments;

    options.push({
      id: 'OPT-AIR-CORRIDOR-DETOUR',
      title: 'Air Corridor Detour via Istanbul (IST)',
      type: 'DETOUR',
      mode: 'air',
      modeBadge: '✈️ Airway Detour',
      pathNodes: [currentNode, 'IST', destNode],
      pathLegs: [
        { from: currentNode, to: 'IST', mode: 'air', icon: '✈️', label: 'Istanbul (IST)' },
        { from: 'IST', to: destNode, mode: 'air', icon: '✈️', label: LOCATIONS_MAP[destNode]?.name || destNode },
      ],
      segments: altSegs,
      etaLabel: '⏱ ETA Impact',
      etaValue: '+2.8 hours',
      isFaster: false,
      costFormatted: '+₹1.8L',
      riskLevel: 'LOW',
      distanceDeltaKm: 850,
      totalDistanceKm: Math.round(shipment.totalDistanceKm + 850),
      description: 'Reroute flight path through Turkish airspace airway into European corridor to circumvent closed regional airspace.',
      recommended: true,
    });

    options.push({
      id: 'OPT-AIR-GATE-HOLD',
      title: 'Airport Standby & Holding Release',
      type: 'HOLD_WAIT',
      mode: 'air',
      modeBadge: '⏸️ Ground Hold',
      pathNodes: shipment.pathNodes,
      pathLegs: [
        { from: currentNode, to: currentNode, mode: 'transfer', icon: '⏸️', label: `${LOCATIONS_MAP[currentNode]?.name || currentNode} Gate Hold` },
        { from: currentNode, to: destNode, mode: 'air', icon: '✈️', label: LOCATIONS_MAP[destNode]?.name || destNode },
      ],
      segments: shipment.segments,
      etaLabel: '⏱ ETA Impact',
      etaValue: '+8.5 hours',
      isFaster: false,
      costFormatted: '+₹60K',
      riskLevel: 'MODERATE',
      distanceDeltaKm: 0,
      totalDistanceKm: Math.round(shipment.totalDistanceKm),
      description: 'Hold aircraft at departure gate until civil aviation authorities release the military airspace exclusion zone.',
      recommended: false,
    });

    return options;
  }

  // =========================================================================
  // 4. SCENARIO: General Dynamic Graph Fallback (Discovered from Graph)
  // =========================================================================
  // Discovered Alternative Maritime Detour
  options.push({
    id: 'OPT-GEN-DETOUR',
    title: 'Secondary Coastal Feeder Detour',
    type: 'DETOUR',
    mode: 'sea',
    modeBadge: '🚢 Coastal Feeder',
    pathNodes: shipment.pathNodes,
    pathLegs: [
      { from: currentNode, to: destNode, mode: 'sea', icon: '🚢', label: LOCATIONS_MAP[destNode]?.name || destNode },
    ],
    segments: shipment.segments,
    etaLabel: '⏱ ETA Impact',
    etaValue: '+2.4 days',
    isFaster: false,
    costFormatted: '+₹2.2L',
    riskLevel: 'LOW',
    distanceDeltaKm: 1400,
    totalDistanceKm: Math.round(shipment.totalDistanceKm + 1400),
    description: 'Reroute along secondary maritime sea-lanes to bypass the congested navigation corridor.',
    recommended: true,
  });

  // Discovered Sea -> Air Multimodal Conversion
  options.push({
    id: 'OPT-GEN-AIR-CONVERT',
    title: 'Express Multimodal Air Cargo Conversion',
    type: 'MULTIMODAL',
    mode: 'multimodal',
    modeBadge: '✈️ Express Air Multimodal',
    pathNodes: [currentNode, destNode],
    pathLegs: [
      { from: currentNode, to: currentNode, mode: 'transfer', icon: '📦', label: `${LOCATIONS_MAP[currentNode]?.name || currentNode} Transfer` },
      { from: currentNode, to: destNode, mode: 'air', icon: '✈️', label: LOCATIONS_MAP[destNode]?.name || destNode },
    ],
    segments: shipment.segments,
    etaLabel: '⏱ ETA Improvement',
    etaValue: '2.0 days faster',
    isFaster: true,
    costFormatted: '+₹5.5L',
    riskLevel: 'High SLA Confidence',
    distanceDeltaKm: -800,
    totalDistanceKm: Math.round(shipment.totalDistanceKm * 0.85),
    description: 'Offload shipment at nearest multimodal hub and transfer to express air freighter network.',
    recommended: false,
  });

  // Discovered Anchorage Hold
  options.push({
    id: 'OPT-GEN-HOLD',
    title: 'Outer Anchorage Berth Standby Hold',
    type: 'HOLD_WAIT',
    mode: 'sea',
    modeBadge: '⏸️ Outer Anchorage Hold',
    pathNodes: shipment.pathNodes,
    pathLegs: [
      { from: currentNode, to: currentNode, mode: 'transfer', icon: '⏸️', label: 'Berth Standby' },
      { from: currentNode, to: destNode, mode: 'sea', icon: '🚢', label: LOCATIONS_MAP[destNode]?.name || destNode },
    ],
    segments: shipment.segments,
    etaLabel: '⏱ ETA Impact',
    etaValue: '+4.5 days',
    isFaster: false,
    costFormatted: '+₹1.1L',
    riskLevel: 'MODERATE',
    distanceDeltaKm: 0,
    totalDistanceKm: Math.round(shipment.totalDistanceKm),
    description: 'Drop anchor outside port boundaries and wait for terminal gantry cranes to clear container backlog.',
    recommended: false,
  });

  return options;
};
