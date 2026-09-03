import { TransportMode, RouteSegment, Shipment, ShipmentStatus, ShipmentPhase } from '../types/shipment';
export { LOCATIONS, LOCATIONS_MAP } from '../data/locations';
import { LOCATIONS, LOCATIONS_MAP } from '../data/locations';
import { INITIAL_CUSTOM_ROUTES, CustomRoute } from '../data/routes';


const EARTH_RADIUS_KM = 6371.0;
const deg2rad = (deg: number): number => (deg * Math.PI) / 180;

export const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const phi1 = deg2rad(lat1);
  const phi2 = deg2rad(lat2);
  const dphi = deg2rad(lat2 - lat1);
  let dlambda = deg2rad(lon2 - lon1);

  if (Math.abs(lon2 - lon1) > 180) {
    dlambda = deg2rad(360 - Math.abs(lon2 - lon1));
  }

  const a =
    Math.sin(dphi / 2) * Math.sin(dphi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) * Math.sin(dlambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

// Calculate physical geographic distance based on Great Circle & actual shipping lane curvature
export const calculateSegmentDistanceKm = (
  fromId: string,
  toId: string,
  controlPoints: { xPct: number; yPct: number }[] = [],
  mode: TransportMode = 'sea',
  isTranspacific: boolean = false
): number => {
  const fromNode = LOCATIONS_MAP[fromId];
  const toNode = LOCATIONS_MAP[toId];
  if (!fromNode || !toNode) return 1000;

  const directGcKm = haversineKm(fromNode.lat, fromNode.lng, toNode.lat, toNode.lng);

  // Air routes: Great Circle path with standard airway routing factor (+4%)
  if (mode === 'air') {
    return parseFloat((directGcKm * 1.04).toFixed(1));
  }

  // Maritime routes: ratio of custom curved spline vs straight line
  let startX = fromNode.xPct;
  const startY = fromNode.yPct;
  let endX = toNode.xPct;
  const endY = toNode.yPct;

  if (isTranspacific) {
    if (startX > endX) endX += 100;
    else startX += 100;
  }

  const straightDist2D = Math.hypot(endX - startX, endY - startY);

  const pts: { x: number; y: number }[] = [{ x: startX, y: startY }];
  for (const cp of controlPoints) {
    let cpX = cp.xPct;
    if (isTranspacific) {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      if (cpX < minX && cpX + 100 <= maxX + 20) {
        cpX += 100;
      }
    }
    pts.push({ x: cpX, y: cp.yPct });
  }
  pts.push({ x: endX, y: endY });

  let pathLen2D = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    pathLen2D += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
  }

  let curvatureRatio = pathLen2D / Math.max(0.1, straightDist2D);
  // Realistic oceanic detour factor bounds (between 1.08 and 2.1)
  curvatureRatio = Math.min(2.1, Math.max(1.08, curvatureRatio));

  return parseFloat((directGcKm * curvatureRatio).toFixed(1));
};

export interface GraphEdge {
  neighbor: string;
  route: CustomRoute;
  isForward: boolean;
}

export const buildGraph = (mode: TransportMode): Record<string, GraphEdge[]> => {
  const adj: Record<string, GraphEdge[]> = {};
  for (const r of INITIAL_CUSTOM_ROUTES) {
    if (r.mode === mode) {
      const u = r.from;
      const v = r.to;
      if (!adj[u]) adj[u] = [];
      if (!adj[v]) adj[v] = [];

      adj[u].push({ neighbor: v, route: r, isForward: true });
      adj[v].push({ neighbor: u, route: r, isForward: false });
    }
  }
  return adj;
};

export const SEA_GRAPH = buildGraph('sea');
export const AIR_GRAPH = buildGraph('air');

export const findShortestPath = (
  fromId: string,
  toId: string,
  mode: TransportMode
): { pathNodes: string[]; segments: RouteSegment[]; totalDistanceKm: number } | null => {
  if (fromId === toId) return null;
  const graph = mode === 'sea' ? SEA_GRAPH : AIR_GRAPH;
  if (!graph[fromId] || !graph[toId]) return null;

  const queue: { current: string; path: string[]; edges: GraphEdge[] }[] = [
    { current: fromId, path: [fromId], edges: [] },
  ];
  const visited = new Set<string>([fromId]);

  while (queue.length > 0) {
    const { current, path, edges } = queue.shift()!;
    if (current === toId) {
      let totalDist = 0;
      const segments: RouteSegment[] = edges.map((edge) => {
        const r = edge.route;
        let controlPoints = r.controlPoints || [];
        if (!edge.isForward) {
          controlPoints = [...controlPoints].reverse();
        }
        const segDist = calculateSegmentDistanceKm(
          edge.isForward ? r.from : r.to,
          edge.isForward ? r.to : r.from,
          controlPoints,
          r.mode,
          Boolean(r.isTranspacific)
        );
        totalDist += segDist;

        return {
          routeId: r.id,
          from: edge.isForward ? r.from : r.to,
          to: edge.isForward ? r.to : r.from,
          mode: r.mode,
          isTranspacific: r.isTranspacific,
          controlPoints,
          distanceKm: segDist,
        };
      });
      return { pathNodes: path, segments, totalDistanceKm: parseFloat(totalDist.toFixed(1)) };
    }

    for (const edge of graph[current] || []) {
      if (!visited.has(edge.neighbor)) {
        visited.add(edge.neighbor);
        queue.push({
          current: edge.neighbor,
          path: [...path, edge.neighbor],
          edges: [...edges, edge],
        });
      }
    }
  }

  return null;
};

// Interpolate exact (xPct, yPct, heading) along active segment
export const evaluateShipmentPosition = (
  shipment: Shipment
): { xPct: number; yPct: number; headingDeg: number; activeHopIndex: number } => {
  const { segments, phase, currentSegmentIndex, segmentProgress } = shipment;

  if (phase === 'ORIGIN_WAIT' || !segments || segments.length === 0) {
    const loc = LOCATIONS_MAP[shipment.from];
    return { xPct: loc?.xPct || 50, yPct: loc?.yPct || 50, headingDeg: 0, activeHopIndex: 0 };
  }

  if (phase === 'DESTINATION_WAIT' || phase === 'COMPLETED') {
    const loc = LOCATIONS_MAP[shipment.to];
    return { xPct: loc?.xPct || 50, yPct: loc?.yPct || 50, headingDeg: 0, activeHopIndex: segments.length };
  }

  if (phase === 'HUB_WAIT') {
    const seg = segments[Math.min(segments.length - 1, currentSegmentIndex)];
    const loc = LOCATIONS_MAP[seg.from];
    return { xPct: loc?.xPct || 50, yPct: loc?.yPct || 50, headingDeg: 0, activeHopIndex: currentSegmentIndex };
  }

  const segIdx = Math.min(segments.length - 1, Math.max(0, currentSegmentIndex));
  const tLocal = Math.max(0, Math.min(1, segmentProgress));

  const seg = segments[segIdx];
  const fromNode = LOCATIONS_MAP[seg.from];
  const toNode = LOCATIONS_MAP[seg.to];
  if (!fromNode || !toNode) {
    return { xPct: 50, yPct: 50, headingDeg: 0, activeHopIndex: segIdx };
  }

  let startX = fromNode.xPct;
  const startY = fromNode.yPct;
  let endX = toNode.xPct;
  const endY = toNode.yPct;

  if (seg.isTranspacific) {
    if (startX > endX) {
      endX += 100;
    } else {
      startX += 100;
    }
  }

  const coords: { x: number; y: number }[] = [];
  coords.push({ x: startX, y: startY });

  for (const cp of seg.controlPoints) {
    let cpX = cp.xPct;
    if (seg.isTranspacific) {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      if (cpX < minX && cpX + 100 <= maxX + 20) {
        cpX += 100;
      }
    }
    coords.push({ x: cpX, y: cp.yPct });
  }
  coords.push({ x: endX, y: endY });

  let curX = startX;
  let curY = startY;
  let dx = 1;
  let dy = 0;

  if (coords.length === 2) {
    curX = startX + (endX - startX) * tLocal;
    curY = startY + (endY - startY) * tLocal;
    dx = endX - startX;
    dy = endY - startY;
  } else if (coords.length === 3) {
    const p0 = coords[0];
    const p1 = coords[1];
    const p2 = coords[2];
    const u = 1 - tLocal;
    curX = u * u * p0.x + 2 * u * tLocal * p1.x + tLocal * tLocal * p2.x;
    curY = u * u * p0.y + 2 * u * tLocal * p1.y + tLocal * tLocal * p2.y;
    dx = 2 * (1 - tLocal) * (p1.x - p0.x) + 2 * tLocal * (p2.x - p1.x);
    dy = 2 * (1 - tLocal) * (p1.y - p0.y) + 2 * tLocal * (p2.y - p1.y);
  } else {
    const numSub = coords.length - 1;
    const subScaled = tLocal * numSub;
    const subIdx = Math.min(numSub - 1, Math.floor(subScaled));
    const subT = subScaled - subIdx;

    const p0 = coords[subIdx === 0 ? 0 : subIdx - 1];
    const p1 = coords[subIdx];
    const p2 = coords[subIdx + 1];
    const p3 = coords[subIdx + 2 < coords.length ? subIdx + 2 : subIdx + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    const u = 1 - subT;
    curX =
      u * u * u * p1.x +
      3 * u * u * subT * cp1x +
      3 * u * subT * subT * cp2x +
      subT * subT * subT * p2.x;
    curY =
      u * u * u * p1.y +
      3 * u * u * subT * cp1y +
      3 * u * subT * subT * cp2y +
      subT * subT * subT * p2.y;

    dx =
      3 * u * u * (cp1x - p1.x) +
      6 * u * subT * (cp2x - cp1x) +
      3 * subT * subT * (p2.x - cp2x);
    dy =
      3 * u * u * (cp1y - p1.y) +
      6 * u * subT * (cp2y - cp1y) +
      3 * subT * subT * (p2.y - cp2y);
  }

  let headingDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  let finalX = curX % 100;
  if (finalX < 0) finalX += 100;

  return {
    xPct: parseFloat(finalX.toFixed(2)),
    yPct: parseFloat(curY.toFixed(2)),
    headingDeg: parseFloat(headingDeg.toFixed(1)),
    activeHopIndex: segIdx,
  };
};

const CARGO_CATALOG = [
  {
    cargo: 'Cryogenic mRNA Vaccine Serum',
    type: 'biologics' as const,
    temp: -20.42,
    targetTempRange: { min: -25.0, max: -15.0 },
    tempPolicyText: 'Policy: -20.4°C (-25°C to -15°C Ultra-Cold Deep Freeze)',
    batchInfo: 'Batch: 120,000 Vials (45,000 Patients Dependent)',
    clinicalPriority: 'Critical Clinical Allocation - Deep Freeze Cryo Transit',
    escrowAmountUSD: 2400000,
    reeferBatteryHours: 142,
    impactShockG: 0.10,
    risk: 'LOW' as const,
  },
  {
    cargo: 'Cryogenic Cellular Immunotherapy & Blood Plasma',
    type: 'biologics' as const,
    temp: -20.03,
    targetTempRange: { min: -25.0, max: -15.0 },
    tempPolicyText: 'Policy: -20.4°C (-25°C to -15°C Ultra-Cold Deep Freeze)',
    batchInfo: 'Batch: 8,000 Vials (12,500 Patients Dependent)',
    clinicalPriority: 'Urgent Autologous Cell Therapy Delivery',
    escrowAmountUSD: 3800000,
    reeferBatteryHours: 158,
    impactShockG: 0.09,
    risk: 'LOW' as const,
  },
  {
    cargo: 'Monoclonal Antibodies & Insulin',
    type: 'pharmaceutical' as const,
    temp: 4.01,
    targetTempRange: { min: 2.0, max: 8.0 },
    tempPolicyText: 'Policy: +2.0°C to +8.0°C (Refrigerated Cold-Chain SLA)',
    batchInfo: 'Batch: 50,000 Doses (Hospital Replenishment)',
    clinicalPriority: 'High Priority - Cold Store Dock Receipt',
    escrowAmountUSD: 850000,
    reeferBatteryHours: 94,
    impactShockG: 0.12,
    risk: 'LOW' as const,
  },
  {
    cargo: 'Advanced Semiconductor Wafers & Sensors',
    type: 'electronics' as const,
    temp: 21.20,
    targetTempRange: { min: 18.0, max: 24.0 },
    tempPolicyText: 'Policy: +18.0°C to +24.0°C (Nitrogen-Purged Climate Controlled)',
    batchInfo: 'Batch: 500 Silicon Ingot Trays (Tier-1 Fab)',
    clinicalPriority: 'Automotive & High-Tech Manufacturing Assembly',
    escrowAmountUSD: 1650000,
    reeferBatteryHours: 180,
    impactShockG: 0.08,
    risk: 'LOW' as const,
  },
  {
    cargo: 'Lithium Battery Modules (Hazmat Class 9)',
    type: 'industrial' as const,
    temp: 19.80,
    targetTempRange: { min: 15.0, max: 25.0 },
    tempPolicyText: 'Policy: +15.0°C to +25.0°C (Hazmat Class 9 Dry Storage)',
    batchInfo: 'Batch: 2,400 Prismatic Cells',
    clinicalPriority: 'Automotive EV Power Pack Line',
    escrowAmountUSD: 1200000,
    reeferBatteryHours: 210,
    impactShockG: 0.11,
    risk: 'LOW' as const,
  },
];

export const MARITIME_FLEET = [
  { vesselName: 'Ever Ace (ULCV 24k TEU)', vesselType: 'Ultra Large Container Vessel', speedKmH: 24.2 },
  { vesselName: 'Maersk Mc-Kinney (Triple-E)', vesselType: 'Fast Container Ship', speedKmH: 26.0 },
  { vesselName: 'CMA CGM Palais Royal', vesselType: 'Container Ship', speedKmH: 22.5 },
  { vesselName: 'MSC Gülsün Mega Liner', vesselType: 'Heavy Container Carrier', speedKmH: 21.8 },
  { vesselName: 'Hapag-Lloyd Berlin Express', vesselType: 'Fast Container Ship', speedKmH: 25.4 },
  { vesselName: 'ONE Continuity (Ocean Feeder)', vesselType: 'Feeder Container Ship', speedKmH: 19.5 },
  { vesselName: 'COSCO Shipping Universe', vesselType: 'Cold-Chain Reefer Vessel', speedKmH: 23.0 },
  { vesselName: 'Pacific Vanguard Reefer', vesselType: 'Specialized Pharma Vessel', speedKmH: 20.8 },
];

export const AIR_FLEET = [
  { vesselName: 'Boeing 777F SkyCargo', vesselType: 'Long-Range Heavy Freighter', speedKmH: 845.0 },
  { vesselName: 'Boeing 747-8F Cargo Freighter', vesselType: 'Quad-Engine High Capacity Freighter', speedKmH: 825.0 },
  { vesselName: 'Airbus A330-200F Express', vesselType: 'Twin-Engine Cargo Jet', speedKmH: 790.0 },
  { vesselName: 'McDonnell Douglas MD-11F', vesselType: 'Tri-Jet Express Freighter', speedKmH: 810.0 },
  { vesselName: 'Boeing 767-300ER Freighter', vesselType: 'Dedicated Pharma Express Air', speedKmH: 830.0 },
];

export const SIMULATION_SECONDS_PER_REAL_DAY = 5.0;

export const assembleShipment = (
  idStr: string,
  fromId: string,
  toId: string,
  mode: TransportMode,
  cargoItem: (typeof CARGO_CATALOG)[0],
  forcedVehicle?: { vesselName: string; vesselType: string; speedKmH: number },
  phase: ShipmentPhase = 'ORIGIN_WAIT',
  initialWaitTimer: number = 5.0
): Shipment | null => {
  const pathData = findShortestPath(fromId, toId, mode);
  if (!pathData) return null;

  let vehicle = forcedVehicle;
  if (!vehicle) {
    if (mode === 'sea') {
      vehicle = MARITIME_FLEET[Math.floor(Math.random() * MARITIME_FLEET.length)];
    } else {
      vehicle = AIR_FLEET[Math.floor(Math.random() * AIR_FLEET.length)];
    }
  }

  const speedKmH = vehicle.speedKmH;
  const transitHours = pathData.totalDistanceKm / speedKmH;

  const numIntermediateHubs = Math.max(0, pathData.pathNodes.length - 2);
  const hubHandlingHours = numIntermediateHubs * (mode === 'sea' ? 12.0 : 4.0);

  const totalRealHours = transitHours + hubHandlingHours;
  const totalRealDays = totalRealHours / 24.0;

  const baseSimSeconds =
    mode === 'sea'
      ? Math.max(25.0, totalRealDays * SIMULATION_SECONDS_PER_REAL_DAY)
      : Math.max(15.0, totalRealDays * SIMULATION_SECONDS_PER_REAL_DAY * 4.0);

  const progressPerSecond = 100.0 / baseSimSeconds;
  const speedPerTick = progressPerSecond / 60.0;

  const etaStr =
    totalRealDays >= 1.0
      ? `${totalRealDays.toFixed(1)} Days`
      : `${totalRealHours.toFixed(1)} Hours`;

  const originName = LOCATIONS_MAP[fromId]?.name || fromId;
  const isAir = mode === 'air';

  const initialStatus: ShipmentStatus = isAir ? 'AIRPORT DOCKED' : 'PORT DOCKED';
  const initialWaitMessage = isAir
    ? `At ${originName} Airport (${initialWaitTimer.toFixed(0)}s)`
    : `At ${originName} Port (${initialWaitTimer.toFixed(0)}s)`;

  const s: Shipment = {
    id: idStr,
    cargo: cargoItem.cargo,
    cargoType: cargoItem.type,
    from: fromId,
    to: toId,
    mode,
    pathNodes: pathData.pathNodes,
    segments: pathData.segments,
    vesselName: vehicle.vesselName,
    vesselType: vehicle.vesselType,
    baseSpeedKmH: speedKmH,
    currentSpeedKmH: speedKmH,
    speedCondition: 'NOMINAL',
    phase,
    waitTimer: initialWaitTimer,
    currentSegmentIndex: 0,
    segmentProgress: 0.0,
    waitMessage: initialWaitMessage,
    totalDistanceKm: pathData.totalDistanceKm,
    transitHours: parseFloat(transitHours.toFixed(1)),
    hubHandlingHours: parseFloat(hubHandlingHours.toFixed(1)),
    totalRealHours: parseFloat(totalRealHours.toFixed(1)),
    totalRealDays: parseFloat(totalRealDays.toFixed(1)),
    simDurationSeconds: parseFloat(baseSimSeconds.toFixed(1)),
    progress: 0,
    speed: speedPerTick,
    status: initialStatus,
    eta: etaStr,
    temperature: cargoItem.temp || 2.4,
    actualSensorTemp: cargoItem.temp || 2.4,
    reportedTemp: cargoItem.temp || 2.4,
    isTemperatureManipulated: false,
    targetTempRange: cargoItem.targetTempRange || (cargoItem.type === 'electronics' ? { min: 18.0, max: 24.0 } : { min: 2.0, max: 8.0 }),
    tempPolicyText: cargoItem.tempPolicyText,
    batchInfo: cargoItem.batchInfo,
    clinicalPriority: cargoItem.clinicalPriority,
    reeferBatteryHours: cargoItem.reeferBatteryHours || 142,
    impactShockG: cargoItem.impactShockG || 0.10,
    sealStatus: 'INTACT',
    reportedSealStatus: 'INTACT',
    isSealManipulated: false,
    escrowAmountUSD: cargoItem.escrowAmountUSD || 1800000,
    escrowStatus: 'LOCKED',
    blockchainSensorHash: '0x' + Array.from(idStr + Date.now().toString(16)).map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('').padEnd(64, '0').slice(0, 64),
    riskLevel: cargoItem.risk,
    currentCoord: { xPct: 50, yPct: 50, headingDeg: 0 },
    activeHopIndex: 0,
  };

  s.currentCoord = evaluateShipmentPosition(s);
  return s;
};

export const generateRandomShipment = (idNum: number, forcedMode?: TransportMode): Shipment | null => {
  const mode: TransportMode = forcedMode || (Math.random() > 0.45 ? 'sea' : 'air');
  const graph = mode === 'sea' ? SEA_GRAPH : AIR_GRAPH;
  const nodeIds = Object.keys(graph);
  if (nodeIds.length < 2) return null;

  let attempts = 0;
  while (attempts < 30) {
    attempts++;
    const from = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    const to = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    if (from === to) continue;

    const cargoItem = CARGO_CATALOG[Math.floor(Math.random() * CARGO_CATALOG.length)];
    const s = assembleShipment(`ORD-${1000 + idNum}`, from, to, mode, cargoItem, undefined, 'ORIGIN_WAIT', 5.0);
    if (s) return s;
  }
  return null;
};

export const createInitialShipments = (): Shipment[] => {
  const results: Shipment[] = [];
  const startIdBase = Math.floor(1000 + Math.random() * 8000);
  
  // Create 3 diverse, randomized initial shipments (2 Sea + 1 Air or 1 Sea + 2 Air)
  const modes: TransportMode[] = Math.random() > 0.5 ? ['sea', 'air', 'sea'] : ['air', 'sea', 'sea'];
  
  for (let i = 0; i < 3; i++) {
    const s = generateRandomShipment(startIdBase + i, modes[i]);
    if (s) {
      // Stagger initial origin wait times (e.g. 5s, 3.5s, 2s)
      s.waitTimer = parseFloat((5.0 - i * 1.2).toFixed(1));
      results.push(s);
    }
  }

  return results.length === 3 ? results : results;
};
