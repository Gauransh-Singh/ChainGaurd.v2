const API_BASE = "http://localhost:8000/api";

export const api = {
  async getState() {
    const res = await fetch(`${API_BASE}/state`);
    return res.json();
  },

  async getBlockchain() {
    const res = await fetch(`${API_BASE}/blockchain`);
    return res.json();
  },

  async startSimulation() {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: "POST" });
    return res.json();
  },

  async pauseSimulation() {
    const res = await fetch(`${API_BASE}/simulation/pause`, { method: "POST" });
    return res.json();
  },

  async resetSimulation() {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: "POST" });
    return res.json();
  },

  async setSpeed(speed: number) {
    const res = await fetch(`${API_BASE}/simulation/speed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ speed }),
    });
    return res.json();
  },

  async setMode(mode: "manual" | "auto") {
    const res = await fetch(`${API_BASE}/simulation/mode`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },

  async triggerCrisis(crisis_type: string, shipment_id: string = "ORD-5415") {
    const res = await fetch(`${API_BASE}/simulation/trigger-crisis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crisis_type, shipment_id }),
    });
    return res.json();
  },

  async approveRoute(shipment_id: string, option_id: string) {
    const res = await fetch(`${API_BASE}/simulation/approve-route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipment_id, option_id }),
    });
    return res.json();
  },

  async acceptDelivery(shipment_id: string) {
    const res = await fetch(`${API_BASE}/simulation/accept-delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipment_id }),
    });
    return res.json();
  },

  async tamperBlockchain(block_index: number = 1, fake_data?: any) {
    const res = await fetch(`${API_BASE}/simulation/tamper-block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ block_index, fake_data }),
    });
    return res.json();
  },

  async restoreBlockchain() {
    const res = await fetch(`${API_BASE}/simulation/restore-chain`, {
      method: "POST",
    });
    return res.json();
  },

  async startDemo() {
    const res = await fetch(`${API_BASE}/simulation/start-demo`, {
      method: "POST",
    });
    return res.json();
  },
};
