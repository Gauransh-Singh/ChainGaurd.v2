export type TransportMode = 'sea' | 'air' | 'road' | 'rail';

export type ShipmentStatus =
  | 'IN TRANSIT'
  | 'AT RISK'
  | 'DISRUPTED'
  | 'AWAITING APPROVAL'
  | 'APPROVED'
  | 'REROUTING'
  | 'RECOVERED'
  | 'DELIVERED'
  | 'PORT DOCKED'
  | 'AIRPORT DOCKED'
  | 'TRANSSHIPMENT'
  | 'AIRPORT TRANSIT';

export type ShipmentPhase =
  | 'ORIGIN_WAIT'
  | 'IN_TRANSIT'
  | 'HUB_WAIT'
  | 'DESTINATION_WAIT'
  | 'COMPLETED';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type CrisisType = 'ROUTE_BLOCKAGE' | 'SEVERE_WEATHER' | 'PORT_CONGESTION' | 'TEMP_EXCURSION';

export interface ActiveCrisis {
  id: string; // e.g. "CRS-8012"
  type: CrisisType;
  title: string; // e.g. "Red Sea Maritime Blockade"
  affectedRouteId?: string; // e.g. "SEA-DXB-RTM-6848"
  affectedSegment?: { from: string; to: string; mode: TransportMode };
  affectedShipmentId: string; // e.g. "ORD-1001"
  locationNodeId: string; // e.g. "DXB"
  locationName: string; // e.g. "Jebel Ali / Dubai"
  etaImpact: string; // e.g. "+6.2 Days"
  riskScore: number; // e.g. 84
  description: string;
  timestamp: string;
  status: 'ROUTE BLOCKED' | 'SPEED HALTED' | 'CARGO AT RISK' | 'PORT CONGESTION' | 'APPROVED_REROUTING';
  approvedOptionTitle?: string;
}

export interface RouteSegment {
  routeId?: string;
  from: string;
  to: string;
  mode: TransportMode;
  isTranspacific?: boolean;
  controlPoints: { xPct: number; yPct: number }[];
  distanceKm: number;
}

export interface PathLeg {
  from: string;
  to: string;
  mode: TransportMode | 'transfer';
  icon: string; // '🚢' | '✈️' | '🚚' | '📦'
  label: string; // 'Dubai' | 'Transfer' | 'Frankfurt' | 'Rotterdam'
}

export interface RecoveryOption {
  id: string; // e.g. "OPT-A", "OPT-B", "OPT-C"
  title: string; // e.g. "Cape of Good Hope Maritime Detour"
  type: 'DETOUR' | 'MULTIMODAL' | 'HOLD_WAIT';
  mode: TransportMode | 'multimodal';
  modeBadge: string; // "🚢 Maritime Detour" | "✈️ Multimodal Air Express" | "⏸️ Tactical Anchorage Hold"
  pathNodes: string[]; // e.g. ["DXB", "CPT", "RTM"]
  pathLegs: PathLeg[];
  segments: RouteSegment[];
  etaLabel: string; // "⏱ ETA Impact" or "⏱ ETA Improvement"
  etaValue: string; // "+4.2 days" or "3.5 days faster"
  isFaster?: boolean;
  costFormatted: string; // "+₹4.8L" or "+₹8.5L"
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'High SLA Confidence';
  distanceDeltaKm: number; // +3200
  totalDistanceKm: number;
  description: string;
  score?: number;
  recommended?: boolean;
}

export interface Shipment {
  id: string;
  cargo: string;
  cargoType: 'pharmaceutical' | 'electronics' | 'medical' | 'biologics' | 'industrial';
  from: string;
  to: string;
  mode: TransportMode;
  pathNodes: string[];
  segments: RouteSegment[];
  
  // Vessel / Aircraft Carrier Info
  vesselName: string;
  vesselType: string;
  baseSpeedKmH: number;
  currentSpeedKmH: number;
  speedCondition: 'NOMINAL' | 'WEATHER_SLOWDOWN' | 'PORT_HOLD' | 'BLOCKED';
  
  // Phase & Stopover State Machine
  phase: ShipmentPhase;
  waitTimer: number;
  currentSegmentIndex: number;
  segmentProgress: number;
  waitMessage?: string;
  
  // Real-world & Distance Telemetry
  totalDistanceKm: number;
  transitHours: number;
  hubHandlingHours: number;
  totalRealHours: number;
  totalRealDays: number;
  simDurationSeconds: number;
  
  progress: number;
  speed: number;
  status: ShipmentStatus;
  eta: string;
  // Extra IoT & Clinical Metadata
  batchInfo?: string;
  clinicalPriority?: string;
  reeferBatteryHours?: number;
  reportedBatteryHours?: number;
  isBatteryManipulated?: boolean;
  impactShockG?: number;
  reportedImpactShockG?: number;
  isShockManipulated?: boolean;
  customsCleared?: boolean;
  tempPolicyText?: string;
  // Cold-Chain & Tamper Telemetry
  temperature: number;
  actualSensorTemp: number;
  reportedTemp: number;
  isTemperatureManipulated: boolean;
  targetTempRange: { min: number; max: number };

  // Digital Security Seal
  sealStatus: 'INTACT' | 'TAMPERED' | 'BROKEN';
  reportedSealStatus: 'INTACT' | 'TAMPERED' | 'BROKEN';
  isSealManipulated: boolean;

  // Blockchain Escrow
  escrowAmountUSD: number;
  escrowStatus: 'LOCKED' | 'RELEASED' | 'FROZEN';
  blockchainSensorHash: string;
  riskLevel: RiskLevel;
  currentCoord: { xPct: number; yPct: number; headingDeg: number };
  activeHopIndex: number;
  hasHadCrisis?: boolean;
  approvedRecovery?: {
    optionId: string;
    title: string;
    mode: TransportMode | 'multimodal';
    rerouteProgress: number;
  };
}
