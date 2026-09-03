// SAP Cloud Application Programming Model (CAP) & SAP HANA Cloud API Client

const CAP_BASE_URL = 'http://localhost:4004/chain-guard';

export interface CapNode {
  ID: string;
  name: string;
  country: string;
  sea: boolean;
  air: boolean;
  xPct: number;
  yPct: number;
  latitude: number;
  longitude: number;
}

export interface CapRoute {
  ID: string;
  fromNode: string;
  toNode: string;
  mode: string;
  distanceKm: number;
  isTranspacific: boolean;
  corridorName: string;
}

export interface CapShipment {
  ID: string;
  cargo: string;
  cargoType: string;
  origin: string;
  destination: string;
  mode: string;
  currentNode: string;
  currentCoordX: number;
  currentCoordY: number;
  progress: number;
  speed: number;
  status: string;
  riskLevel: string;
  eta: string;
  batchInfo?: string;
  clinicalPriority?: string;
  reeferBatteryHours?: number;
  impactShockG?: number;
  actualSensorTemp: number;
  reportedTemp: number;
  isTemperatureManipulated: boolean;
  tempPolicyText?: string;
  sealStatus: string;
  reportedSealStatus: string;
  isSealManipulated: boolean;
  escrowAmountUSD: number;
  escrowStatus: string;
  blockchainSensorHash: string;
}

export interface CapCrisis {
  ID: string;
  shipmentID: string;
  type: string;
  title: string;
  severity: string;
  status: string;
  locationNodeId: string;
  locationName: string;
  etaImpact: string;
  riskScore: number;
  description: string;
  timestamp: string;
}

export interface CapRecoveryPlan {
  ID: string;
  shipmentID: string;
  title: string;
  type: string;
  mode: string;
  modeBadge: string;
  routeCorridor: string;
  etaValue: string;
  costFormatted: string;
  riskLevel: string;
  description: string;
  recommended: boolean;
  approvalStatus: string;
}

export const capApi = {
  // Check CAP Server Health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${CAP_BASE_URL}/$metadata`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Fetch all Nodes from SAP CAP / HANA
  async getNodes(): Promise<CapNode[]> {
    try {
      const res = await fetch(`${CAP_BASE_URL}/Nodes`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.value || [];
    } catch (err) {
      console.warn('[SAP CAP] Falling back to local nodes:', err);
      return [];
    }
  },

  // Fetch all Routes from SAP CAP / HANA
  async getRoutes(): Promise<CapRoute[]> {
    try {
      const res = await fetch(`${CAP_BASE_URL}/Routes`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.value || [];
    } catch (err) {
      console.warn('[SAP CAP] Falling back to local routes:', err);
      return [];
    }
  },

  // Fetch all Shipments from SAP CAP / HANA
  async getShipments(): Promise<CapShipment[]> {
    try {
      const res = await fetch(`${CAP_BASE_URL}/Shipments`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.value || [];
    } catch (err) {
      console.warn('[SAP CAP] Falling back to local initial shipments:', err);
      return [];
    }
  },

  // Action: Approve Recovery Plan in SAP CAP / HANA
  async approveRecoveryPlan(shipmentID: string, planID: string) {
    try {
      const res = await fetch(`${CAP_BASE_URL}/approveRecoveryPlan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentID, planID }),
      });
      const text = await res.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (err) {
      console.error('[SAP CAP] approveRecoveryPlan failed:', err);
      return null;
    }
  },

  // Action: Tamper Telemetry in SAP CAP / HANA
  async tamperTelemetry(shipmentID: string, fakedTemp: number, fakedSeal: string) {
    try {
      const res = await fetch(`${CAP_BASE_URL}/tamperTelemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentID, fakedTemp, fakedSeal }),
      });
      const text = await res.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (err) {
      console.error('[SAP CAP] tamperTelemetry failed:', err);
      return null;
    }
  },

  // Action: Verify and Release Escrow in SAP CAP / HANA
  async verifyAndReleaseEscrow(shipmentID: string) {
    try {
      const res = await fetch(`${CAP_BASE_URL}/verifyAndReleaseEscrow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipmentID }),
      });
      const text = await res.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (err) {
      console.error('[SAP CAP] verifyAndReleaseEscrow failed:', err);
      return null;
    }
  },
};
