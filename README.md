# ChainGuard - Real-Time Cold-Chain Resilience & Cryptographic Verification Platform

ChainGuard is an enterprise supply-chain resilience and verification platform with real-time AIS/satellite tracking, automated crisis detection, dynamic multi-modal rerouting, multi-stakeholder consensus nodes, and a tamper-evident cryptographic blockchain ledger.

---

## System Architecture

```
                                  [ REACT FRONTEND (Vite + Tailwind + Leaflet) ]
                                                        |
                                                 WebSocket & REST
                                                        v
                                       [ FASTAPI PYTHON BACKEND ]
                                                        |
    +-----------------------------+---------------------+-------------------------------+
    |                             |                     |                               |
[ SIMULATION ENGINE ]     [ EVENT BUS (19 Types) ]  [ RULE-BASED ENGINES ]     [ SHA-256 BLOCKCHAIN ]
- Waypoint Interpolation   - Pub/Sub Hub             (Future AI Agent Shells)   - Prev-Hash Linking
- 3 Active Consignments    - Real-Time Broadcast     - DisruptionDetector       - Real Tamper Detector
- Dynamic Speed (0.5x-5x)  - Stakeholder Sync        - ImpactCalculator         - Escrow Freeze Engine
                                                     - RoutePlanner
                                                     - RecoveryPlanner
```

---

## Active Shipments Seed Data

1. **ORD-5415**: *Sterile Bio-Resorbable Cardiac Stents*
   - Route: Shanghai -> Singapore -> Dubai -> Rotterdam -> St. Jude Regional Hospital
   - Priority: Critical | Temp: 20.9°C | Escrow: $1,250,000
2. **ORD-4741**: *Ultra-Cold Pediatric mRNA Vaccines*
   - Route: Berlin -> Rotterdam -> Dubai -> Regional Medical Center
   - Priority: Critical | Temp: -20.3°C | Escrow: $2,100,000
3. **ORD-3928**: *Emergency Medical Supplies*
   - Route: Mumbai -> Jebel Ali -> Rotterdam -> European Distribution Hub
   - Priority: High | Temp: 18.5°C | Escrow: $680,000

---

## Quick Start Instructions

### 1. Start Backend
```bash
python run_backend.py
```
Backend runs at: `http://localhost:8000` (WebSocket at `ws://localhost:8000/ws`)

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## Key Stakeholder Nodes & Pages

1. **Master Hub (`/`)**: Executive overview with interactive Dark Leaflet GIS map, live moving vessel markers, KPI metrics bar, AI Agent Pipeline shell, and live event stream.
2. **Carrier Node (`/carrier`)**: Fleet operations, cold-chain telemetry, active crisis interruption alert with side-by-side interactive recovery strategy cards (Option A: Sea-Air Hybrid, Option B: Cape Bypass, Option C: Air Freight) and one-click consensus authorization.
3. **Customs Gate (`/customs`)**: Cross-border compliance, digital manifest inspection, automated route amendment logs, IoT seal verification.
4. **Receiver Hospital (`/hospital`)**: Biomedical custody intake, temperature compliance checklist, **[VERIFY & ACCEPT SHIPMENT]** action, automated smart-contract escrow settlement / freeze.
5. **Blockchain Ledger (`/ledger`)**: SHA-256 block hash explorer, previous hash verification, **[SIMULATE DATA TAMPERING]** and **[RESTORE CHAIN]** zero-trust audit suite.
6. **Simulation Controller (`/controls`)**: Start/Pause/Reset, 0.5x-5x speed, Manual/Auto mode, 6 crisis triggers, and **[START 17-PHASE DEMO]**.
