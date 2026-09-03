export interface Waypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country: string;
  type: "PORT" | "ORIGIN" | "HOSPITAL" | "DISTRIBUTION";
}

export interface Crisis {
  id: string;
  type: string;
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  location: string;
  affected_shipment_ids: string[];
  affected_segment: [string, string] | null;
  coordinates: {
    lat: number;
    lng: number;
    radius_km: number;
  };
  probability: number;
  expected_delay_days: number;
  cost_impact_usd: number;
  human_impact: string;
  description: string;
  status: string;
  created_at: string;
}

export interface RouteOption {
  id: string;
  shipment_id: string;
  name: string;
  mode: string;
  risk_score: number;
  delay_days: number;
  cost_delta_usd: number;
  feasibility_score: number;
  waypoint_ids: string[];
  route_path: string;
  description: string;
  highlights: string[];
  status: string;
}

export interface VerificationChecklist {
  seal_intact: boolean;
  temp_compliant: boolean;
  cargo_valid: boolean;
  shipment_valid: boolean;
  route_history_valid: boolean;
  chain_valid: boolean;
}

export interface Shipment {
  id: string;
  cargo: string;
  origin: string;
  destination: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  current_temp: number;
  target_temp: number;
  temp_min: number;
  temp_max: number;
  battery_pct: number;
  container_seal: string;
  status: "IN_TRANSIT" | "AT_RISK" | "CRITICAL" | "ARRIVED" | "ACCEPTED" | "REJECTED";
  risk: number;
  escrow_usd: number;
  escrow_status: "ESCROWED" | "RELEASED" | "FROZEN";
  eta_days: number;
  waypoint_ids: string[];
  current_segment_index: number;
  segment_progress: number;
  total_progress: number;
  current_lat: number;
  current_lng: number;
  speed_knots: number;
  active_disruption: Crisis | null;
  alternative_routes: RouteOption[];
  route_history: string[];
  verification_checklist: VerificationChecklist;
}

export interface Block {
  index: number;
  timestamp: string;
  event_type: string;
  shipment_id: string;
  actor: string;
  data: Record<string, any>;
  previous_hash: string;
  hash: string;
  signature: string;
}

export interface ChainStatus {
  is_valid: boolean;
  block_count: number;
  latest_hash: string;
  corruption_details: Record<string, any> | null;
}

export interface KPIs {
  active_shipments: number;
  at_risk: number;
  critical: number;
  active_disruptions: number;
  successful_recoveries: number;
  integrity_breaches: number;
  total_escrow_secured: number;
  avg_delay_avoided_days: number;
  cost_saved_m: number;
}

export interface AppEvent {
  id: string;
  type: string;
  shipment_id: string;
  timestamp: string;
  actor: string;
  severity: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  payload: Record<string, any>;
}

export interface SimulationState {
  running: boolean;
  speed: number;
  mode: "manual" | "auto";
  demo_active: boolean;
  demo_phase: number;
  kpis: KPIs;
  chain_status: ChainStatus;
  shipments: Shipment[];
  active_crises: Crisis[];
  waypoints: Record<string, Waypoint>;
  recent_events: AppEvent[];
}

export * from './shipment';
