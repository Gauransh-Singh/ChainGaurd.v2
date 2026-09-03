import { Shipment, ActiveCrisis, TransportMode, RiskLevel } from '../types/shipment';
import { LOCATIONS_MAP } from '../data/locations';

export interface ChokepointGeo {
  id: string;
  name: string;
  category: 'canal' | 'strait' | 'cape';
  applicableRouteIds: string[];
  applicableNodePairs: [string, string][];
  title: string;
  desc: string;
  etaImpact: string;
  riskScore: number;
}

// 1. Precise Maritime Chokepoint Geography
export const MARITIME_CHOKEPOINTS: ChokepointGeo[] = [
  {
    id: 'suez',
    name: 'Suez Canal',
    category: 'canal',
    applicableRouteIds: ['SEA-DXB-RTM-6848'],
    applicableNodePairs: [['DXB', 'RTM'], ['RTM', 'DXB'], ['DXB', 'IST'], ['IST', 'DXB']],
    title: 'Red Sea & Suez Canal Maritime Blockade',
    desc: 'Drone threats and naval security alerts halted all container transit through the Suez Canal corridor.',
    etaImpact: '+8.2 Days',
    riskScore: 88,
  },
  {
    id: 'babelmandeb',
    name: 'Bab-el-Mandeb Strait',
    category: 'strait',
    applicableRouteIds: ['SEA-DXB-RTM-6848'],
    applicableNodePairs: [['DXB', 'RTM'], ['RTM', 'DXB']],
    title: 'Bab-el-Mandeb Strait Security Closure',
    desc: 'High-risk military exclusion zone declared at the southern entrance of the Red Sea.',
    etaImpact: '+6.5 Days',
    riskScore: 85,
  },
  {
    id: 'hormuz',
    name: 'Strait of Hormuz',
    category: 'strait',
    applicableRouteIds: ['SEA-BOM-DXB-0913', 'SEA-CMB-DXB-1854'],
    applicableNodePairs: [['DXB', 'BOM'], ['BOM', 'DXB'], ['DXB', 'CMB'], ['CMB', 'DXB']],
    title: 'Strait of Hormuz Naval Security Alert',
    desc: 'Regional naval standoff declared at the entrance of the Persian Gulf, halting scheduled feeder departures.',
    etaImpact: '+4.0 Days',
    riskScore: 80,
  },
  {
    id: 'panama',
    name: 'Panama Canal',
    category: 'canal',
    applicableRouteIds: ['SEA-NYC-LAX-4981'],
    applicableNodePairs: [['NYC', 'LAX'], ['LAX', 'NYC'], ['SSZ', 'LAX']],
    title: 'Panama Canal Low-Draft Transit Restrictions',
    desc: 'Severe Gatun Lake drought reducing daily vessel transit slots, forcing multi-day booking delays.',
    etaImpact: '+5.5 Days',
    riskScore: 79,
  },
  {
    id: 'taiwan_strait',
    name: 'Taiwan Strait & SCS',
    category: 'strait',
    applicableRouteIds: ['SEA-SHA-PUS-7816', 'SEA-SHA-SIN-6634', 'SEA-PUS-TYO-4009'],
    applicableNodePairs: [['SHA', 'PUS'], ['PUS', 'SHA'], ['SHA', 'SIN'], ['SIN', 'SHA'], ['PUS', 'TYO'], ['TYO', 'PUS']],
    title: 'South China Sea Super Typhoon Warning',
    desc: 'Category 4 Super Typhoon generating 11-meter wave swells along the Taiwan Strait and East China Sea corridor.',
    etaImpact: '+3.5 Days',
    riskScore: 82,
  },
  {
    id: 'english_channel',
    name: 'English Channel',
    category: 'strait',
    applicableRouteIds: ['SEA-RTM-HAM-0589', 'SEA-RTM-NYC-1743'],
    applicableNodePairs: [['RTM', 'HAM'], ['HAM', 'RTM'], ['LON', 'RTM'], ['RTM', 'LON']],
    title: 'English Channel & North Sea Winter Gale',
    desc: 'Dense fog and 60-knot gale winds halting vessel navigation and berthing operations in Rotterdam and Hamburg.',
    etaImpact: '+2.8 Days',
    riskScore: 74,
  },
  {
    id: 'cape_good_hope',
    name: 'Cape of Good Hope',
    category: 'cape',
    applicableRouteIds: ['SEA-DXB-CPT-2889', 'SEA-CPT-RTM-4225', 'SEA-CPT-SSZ-3257'],
    applicableNodePairs: [['DXB', 'CPT'], ['CPT', 'DXB'], ['CPT', 'RTM'], ['RTM', 'CPT'], ['CPT', 'SSZ'], ['SSZ', 'CPT']],
    title: 'Cape of Good Hope Severe Southern Ocean Storm',
    desc: 'Severe frontal wave depression rounding the southern tip of Africa, forcing vessels to heave-to at reduced speed.',
    etaImpact: '+3.8 Days',
    riskScore: 75,
  },
  {
    id: 'gibraltar',
    name: 'Strait of Gibraltar',
    category: 'strait',
    applicableRouteIds: ['SEA-DXB-RTM-6848', 'SEA-CPT-RTM-4225'],
    applicableNodePairs: [['DXB', 'RTM'], ['RTM', 'DXB'], ['CPT', 'RTM'], ['RTM', 'CPT']],
    title: 'Strait of Gibraltar Emergency Channel Blockage',
    desc: 'Disabled bulk carrier adrift in the main separation scheme, temporarily closing the Mediterranean entrance.',
    etaImpact: '+3.2 Days',
    riskScore: 77,
  }
];

// Helper: Get Regional Ocean Name for Sea Segments
const getRegionalSeaName = (fromId: string, toId: string): string => {
  const pair = [fromId, toId].sort().join('-');
  if (pair === 'CMB-SIN') return 'Bay of Bengal Tropical Cyclone & Wave Surge';
  if (pair === 'CMB-DXB' || pair === 'BOM-DXB') return 'Arabian Sea Monsoon Squall & 9m Swells';
  if (pair === 'CPT-DXB') return 'Mozambique Channel Deep Ocean Storm';
  if (pair === 'SIN-SYD') return 'Timor Sea Severe Tropical Cyclone';
  if (pair === 'CPT-SSZ') return 'South Atlantic Roaring Forties Gale';
  if (pair === 'NYC-SSZ') return 'Mid-Atlantic Tropical Wave Depression';
  if (pair === 'HAM-RTM' || pair === 'LON-RTM') return 'North Sea Cold-Front Storm';
  if (pair === 'PUS-SHA' || pair === 'PUS-TYO') return 'East China Sea Rough Wave State';
  return 'Open-Ocean Severe Wave Storm & Squall';
};

/**
 * EXACT CONTEXT-AWARE SELECTION LOGIC:
 * - Canal crisis: only if route segment actually passes that canal.
 * - Port congestion / strike: only when approaching (segmentProgress >= 0.4) or entering the port.
 * - Airport closure: only if destination/transfer airport on this flight leg.
 * - Airspace restriction: only along active flight airway.
 * - Cold-chain: strictly for temperature-sensitive cargo (biologics/vaccines/pharma).
 * - Mechanical failure: can occur on the relevant carrier vehicle anywhere.
 */
export const generateSmartCrisis = (shipment: Shipment): ActiveCrisis => {
  const segIdx = Math.min(shipment.segments.length - 1, shipment.currentSegmentIndex);
  const activeSeg = shipment.segments[segIdx];
  const fromId = activeSeg?.from || shipment.from;
  const toId = activeSeg?.to || shipment.to;
  const fromLoc = LOCATIONS_MAP[fromId];
  const toLoc = LOCATIONS_MAP[toId];
  const segProgress = shipment.segmentProgress || 0;

  const candidatePool: ActiveCrisis[] = [];

  // ==========================================
  // 1. 🚢 MARITIME SHIP SHIPMENT (mode === 'sea')
  // ==========================================
  if (shipment.mode === 'sea') {
    // 1. Canal Crisis -> ONLY if the active segment physically traverses that canal/strait
    const matchedChokepoints = MARITIME_CHOKEPOINTS.filter((cp) => {
      const routeMatch = activeSeg?.routeId && cp.applicableRouteIds.includes(activeSeg.routeId);
      const nodeMatch = cp.applicableNodePairs.some(([u, v]) => (u === fromId && v === toId) || (u === toId && v === fromId));
      return routeMatch || nodeMatch;
    });

    matchedChokepoints.forEach((cp) => {
      candidatePool.push({
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'ROUTE_BLOCKAGE',
        title: cp.title,
        affectedRouteId: activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: shipment.id,
        locationNodeId: cp.id,
        locationName: cp.name,
        etaImpact: cp.etaImpact,
        riskScore: cp.riskScore,
        description: cp.desc,
        timestamp: new Date().toLocaleTimeString(),
        status: 'ROUTE BLOCKED',
      });
    });

    // 2. Open-Ocean Severe Weather -> Dynamic regional sea naming
    candidatePool.push({
      id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SEVERE_WEATHER',
      title: getRegionalSeaName(fromId, toId),
      affectedRouteId: activeSeg?.routeId,
      affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
      affectedShipmentId: shipment.id,
      locationNodeId: fromId,
      locationName: `${fromLoc?.name || fromId} ➔ ${toLoc?.name || toId}`,
      etaImpact: '+2.6 Days',
      riskScore: 72,
      description: `Extreme wave swells and gale-force headwinds along the active maritime path forced speed reduction to safety heave-to.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'SPEED HALTED',
    });

    // 3. Vessel Mechanical Failure -> Anywhere on the carrier
    candidatePool.push({
      id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SEVERE_WEATHER',
      title: `Vessel Main Propulsion Failure (${shipment.vesselName})`,
      affectedRouteId: activeSeg?.routeId,
      affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
      affectedShipmentId: shipment.id,
      locationNodeId: fromId,
      locationName: `${fromLoc?.name || fromId} ➔ ${toLoc?.name || toId}`,
      etaImpact: '+4.2 Days',
      riskScore: 78,
      description: `Auxiliary generator failure and main engine turbocharger fault forced vessel into dead-in-the-water maintenance hold.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'SPEED HALTED',
    });

    // 4. Port Congestion / Strike -> ONLY when approaching the port (segProgress >= 0.35) or at port/hub
    if (segProgress >= 0.35 || shipment.phase === 'HUB_WAIT' || shipment.phase === 'DESTINATION_WAIT') {
      candidatePool.push({
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'PORT_CONGESTION',
        title: `Port Terminal Congestion & Berth Delay at ${toLoc?.name || toId}`,
        affectedRouteId: activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: shipment.id,
        locationNodeId: toId,
        locationName: `${toLoc?.name || toId} Port`,
        etaImpact: '+4.8 Days',
        riskScore: 75,
        description: `Container yard gridlock and dockworker crane outage creating a 36-vessel holding queue outside ${toLoc?.name || toId}.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PORT CONGESTION',
      });

      candidatePool.push({
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'PORT_CONGESTION',
        title: `Port Terminal Infrastructure Closure at ${toLoc?.name || toId}`,
        affectedRouteId: activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: shipment.id,
        locationNodeId: toId,
        locationName: `${toLoc?.name || toId} Port`,
        etaImpact: '+5.2 Days',
        riskScore: 81,
        description: `Dockworker union strike and gantry crane power blackout rendered ${toLoc?.name || toId} terminal completely unavailable.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PORT CONGESTION',
      });
    }

    // 5. Cold-Chain Temperature Excursion -> ONLY for temperature-sensitive cargo
    if (shipment.cargoType === 'biologics' || shipment.cargoType === 'pharmaceutical' || shipment.cargo.toLowerCase().includes('vaccine')) {
      candidatePool.push({
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'TEMP_EXCURSION',
        title: `Cold-Chain Temperature Excursion (${shipment.cargo})`,
        affectedRouteId: activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: shipment.id,
        locationNodeId: fromId,
        locationName: `${fromLoc?.name || fromId} Oceanic Sector`,
        etaImpact: 'Immediate Multimodal Air Conversion Required',
        riskScore: 94,
        description: `IoT sensor alert: Reefer unit temp spiked to +4.2°C (safe baseline: ${shipment.temperature.toFixed(1)}°C). Active biological spoilage risk!`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'CARGO AT RISK',
      });
    }
  }

  // ==========================================
  // 2. ✈️ AIR CARGO FLIGHT (mode === 'air')
  // ==========================================
  if (shipment.mode === 'air') {
    // 1. Airspace Restriction -> Intersects active flight leg
    candidatePool.push({
      id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'ROUTE_BLOCKAGE',
      title: `${fromLoc?.name || fromId} Air Corridor Airspace Restriction`,
      affectedRouteId: activeSeg?.routeId,
      affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
      affectedShipmentId: shipment.id,
      locationNodeId: fromId,
      locationName: `${fromLoc?.name || fromId} Air Corridor`,
      etaImpact: '+8.5 Hours',
      riskScore: 84,
      description: `Civil Aviation Authority declared an immediate airspace exclusion zone along the airway, closing the active flight path.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'ROUTE BLOCKED',
    });

    // 2. High-Altitude Jetstream Storm -> Active airway
    candidatePool.push({
      id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SEVERE_WEATHER',
      title: `Upper-Atmosphere Convective Storm & Jetstream Windshear`,
      affectedRouteId: activeSeg?.routeId,
      affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
      affectedShipmentId: shipment.id,
      locationNodeId: fromId,
      locationName: `${fromLoc?.name || fromId} ➔ ${toLoc?.name || toId} Airway`,
      etaImpact: '+6.5 Hours',
      riskScore: 74,
      description: `Severe squall lines and CAT III turbulence along flight airway forced aircraft to enter holding pattern.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'SPEED HALTED',
    });

    // 3. Airport Closure -> ONLY if approaching or landing at the destination/transfer airport of this leg
    if (segProgress >= 0.35 || shipment.phase === 'HUB_WAIT' || shipment.phase === 'DESTINATION_WAIT') {
      candidatePool.push({
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'PORT_CONGESTION',
        title: `Emergency Ground Stop & Closure at ${toLoc?.name || toId} Airport`,
        affectedRouteId: activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: shipment.id,
        locationNodeId: toId,
        locationName: `${toLoc?.name || toId} Airport`,
        etaImpact: '+11.0 Hours',
        riskScore: 78,
        description: `Runway equipment failure and dense freezing fog shut down all landing operations at ${toLoc?.name || toId}. Diversion required.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'PORT CONGESTION',
      });
    }

    // 4. Aircraft Avionics & Mechanical Fault -> Anywhere on the carrier
    candidatePool.push({
      id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'SEVERE_WEATHER',
      title: `Aircraft Avionics & Pressurization Mechanical Fault (${shipment.vesselName})`,
      affectedRouteId: activeSeg?.routeId,
      affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
      affectedShipmentId: shipment.id,
      locationNodeId: fromId,
      locationName: `${fromLoc?.name || fromId} Airspace`,
      etaImpact: '+5.0 Hours',
      riskScore: 80,
      description: `Secondary hydraulic advisory and cabin pressurization sensor fault required flight speed reduction and holding clearance.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'SPEED HALTED',
    });

    // 5. Cold-Chain Excursion -> ONLY for temperature-sensitive cargo
    if (shipment.cargoType === 'biologics' || shipment.cargoType === 'pharmaceutical' || shipment.cargo.toLowerCase().includes('vaccine')) {
      candidatePool.push({
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'TEMP_EXCURSION',
        title: `Active Temperature Excursion (${shipment.cargo})`,
        affectedRouteId: activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: shipment.id,
        locationNodeId: fromId,
        locationName: `${fromLoc?.name || fromId} Airspace`,
        etaImpact: 'Emergency Landing & Cold Recharge Required',
        riskScore: 96,
        description: `Active dry-ice sublimation telemetry alert: Cargo temperature climbed to +4.2°C (baseline: ${shipment.temperature.toFixed(1)}°C)!`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'CARGO AT RISK',
      });
    }
  }

  // Randomly select ONE valid candidate
  const selectedIndex = Math.floor(Math.random() * candidatePool.length);
  return candidatePool[selectedIndex];
};
