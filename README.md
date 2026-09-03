# 🛡️ ChainGuard v2.4 — Autonomous AI Supply Chain Resilience & Zero-Trust Verification Platform

![ChainGuard Banner](frontend/src/assets/hero.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![SAP CAP](https://img.shields.io/badge/SAP_CAP-8.x-0A6ED1?logo=sap&logoColor=white)](https://cap.cloud.sap/)
[![SAP HANA Cloud](https://img.shields.io/badge/SAP_HANA-Cloud_Ready-008FD3?logo=sap&logoColor=white)](https://www.sap.com/products/technology-platform/hana.html)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time_Sync-FF6C37)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

> **ChainGuard** is a real-time, enterprise-grade autonomous supply chain resilience and cryptographic zero-trust verification platform. It combines an autonomous **4-Agent AI Cascade**, **Product-Specific Cold-Chain Physics**, **Dynamic Multi-Modal Rerouting**, **Cryptographic Merkle Proofs**, and a native **SAP CAP (Cloud Application Programming Model)** backend built for **SAP HANA Cloud**.

---

## 📑 Table of Contents

- [Key Value Proposition](#-key-value-proposition)
- [System Architecture](#-system-architecture)
- [Autonomous AI Multi-Agent Cascade](#-autonomous-ai-multi-agent-cascade)
- [Product-Specific Physical Telemetry Profiles](#-product-specific-physical-telemetry-profiles)
- [Stakeholder Portals & UI Views](#-stakeholder-portals--ui-views)
- [SAP CAP & HANA Cloud Integration](#-sap-cap--hana-cloud-integration)
- [Installation & Quick Start](#-installation--quick-start)
- [Repository Structure](#-repository-structure)
- [Contributing & License](#-contributing--license)

---

## 💡 Key Value Proposition

Global supply chains face severe structural fragilities: maritime choke-point blockades (Suez, Bab-el-Mandeb, Malacca, Panama), ultra-cold pharmaceutical spoilage, and insider carrier fraud where local database logs are secretly manipulated to claim escrow settlement funds.

**ChainGuard solves this through four core pillars:**
1. **Autonomous 4-Agent Cascade**: Sentinel ➔ Impact ➔ Strategy ➔ Recovery agents detect disruptions, model physical delay physics, discover graph detours, and orchestrate recovery.
2. **Clinical Medicine Prioritization**: Lifesaving consignments (mRNA vaccines, cellular immunotherapy, insulin) are elevated to **Priority 1 (Critical Life-Saving SLA)** with 3.5× vulnerability weighting and prioritized multi-modal air detours.
3. **Zero-Trust Consignee Verification Gate**: Incoming consignments are cryptographically evaluated against hardware root hashes (Block `#14,895`) to prevent data tampering fraud.
4. **Enterprise SAP CAP + HANA Cloud Foundation**: Persistent OData v4 service layer enabling seamless connectivity to SAP S/4HANA ERP systems.

---

## 🏛️ System Architecture

```
                                  REACT / VITE FRONTEND (Port 5173)
                   [ Global Map • Carrier Fleet Cockpit • Receiver Hospital Gate • AI Pipeline ]
                                      │                             │
                        HTTP / OData v4 REST                  WebSocket (ws://)
                                      ▼                             ▼
                           SAP CAP BACKEND (Port 4004)    FASTAPI RELAY (Port 8000)
                          [ chainguard-backend/server.js ]   [ backend/main.py ]
                                      │                             │
                     ┌────────────────┴────────────────┐            │
                     ▼                                 ▼            ▼
             SQLite (Local Dev)             SAP HANA CLOUD (Prod)  Pub/Sub Event Bus
             [ db/schema.cds ]              [ .cdsrc.json: hana ]  [ 19 Event Types ]
                     │                                              │
                     └──────────────────────────────────────────────┘
                                              │
                                              ▼
                                 SHA-256 MERKLE BLOCKCHAIN
                                 [ Cryptographic State Ledger ]
```

---

## 🤖 Autonomous AI Multi-Agent Cascade

ChainGuard runs an autonomous 4-agent cascade orchestrating intelligence across every consignment:

```
┌──────────────────────────────────────────────┐
│             1. SENTINEL AGENT                │
│    Autonomous Threat & Anomaly Detection     │
│  • Continuous GPS, AIS & 60 FPS Telemetry    │
│  • Statistical False-Positive Verification   │
│  • Priority 1 Medical Triage Elevation       │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             2. IMPACT AGENT                  │
│    Physics Delay & Clinical Risk Modeling    │
│  • Mode-Specific Transit Physics (Air vs Sea)│
│  • Demurrage & Fuel Penalty Calculation      │
│  • 3.5x Clinical Vulnerability Multiplier    │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             3. STRATEGY ENGINE               │
│       Graph Detour Discovery & Scoring       │
│  • Breadth-First Graph Traversal (17 Hubs)   │
│  • Multi-Modal Conversion (Sea ➔ Air Express)│
│  • Deduplicated ETA & Cost Trade-Off Scoring │
└──────────────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             4. RECOVERY AGENT                │
│   Consensus Governance & Autonomous Dispatch │
│  • Spline Trajectory Tracking in Simulation  │
│  • Smart Contract Escrow Lock / Allocation   │
│  • Blockchain Notarization (Block #14,897)   │
└──────────────────────────────────────────────┘
```

---

## 🌡️ Product-Specific Physical Telemetry Profiles

All shipment telemetry, thermal oscillations ($\pm 0.04^\circ	ext{C}$ jitter at 60 FPS), excursion hazard spikes, and customs auditing are strictly calibrated to the physical product category:

| Consignment Cargo | Category | Baseline Temp | Nominal SLA Window | Excursion Spike | Policy & Customs Classification |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Cryogenic mRNA Vaccine Serum** | `biologics` | **`-20.42°C`** | `[-25.0°C to -15.0°C]` | `+6.8°C` | `HS 3002.20.00` • Ultra-Cold Deep Freeze |
| **Cellular Immunotherapy & Blood Plasma** | `biologics` | **`-20.03°C`** | `[-25.0°C to -15.0°C]` | `+6.8°C` | `HS 3002.20.00` • Autologous Cryo Preservation |
| **Monoclonal Antibodies & Insulin** | `pharmaceutical` | **`+4.01°C`** | `[+2.0°C to +8.0°C]` | `+14.5°C` | `HS 3004.90.00` • Cold-Chain Refrigerated Storage |
| **Advanced Semiconductor Wafers & Sensors** | `electronics` | **`+21.20°C`** | `[+18.0°C to +24.0°C]` | `+42.0°C` | `HS 8542.31.00` • Nitrogen-Purged Climate Controlled |
| **Lithium Battery Modules (Hazmat Class 9)** | `industrial` | **`+19.80°C`** | `[+15.0°C to +25.0°C]` | `+48.0°C` | `HS 8507.60.00` • Dry-Pack Controlled Ambient |

---

## 🌐 Stakeholder Portals & UI Views

### 1. 📊 Master Hub & Global Monitor (`/`)
* **2:1 Equirectangular GIS Map**: Real-time rendering of all global maritime corridors, flight paths, vessel markers with smooth interpolation, and strategic choke points (Suez, Bab-el-Mandeb, Malacca, Panama, Strait of Hormuz).
* **Live Fleet Status**: Real-time KPIs, active alerts stream, and quick simulation triggers.

### 2. 🚚 Carrier Fleet Dispatch Cockpit (`/carrier`)
* **High-Fidelity Telemetry Cards**: Core Storage Temp (with dynamic SLA gauge), Container Digital E-Seal (`LOCKED` vs `BREACHED`), Reefer Cryo-Battery Reserve (`142h`), and 3-Axis Impact Shock Accelerometer ($< 2.5g$ SLA).
* **Insider Fraud Studio**: Simulates rogue carrier operators altering local database logs to conceal temperature excursions or broken seals. Overriding a value **locks the KPI card** (`🔒 LOCKED`) and halts oscillations.
* **Exact Generated Recovery Plans**: Renders side-by-side alternative route options (Air Express Bridge vs Deep-Sea Detour) with distinct ETA/cost deltas and one-click consensus authorization.

### 3. 🏥 Receiver Consignee Hospital Intake Gate (`/receiver`)
* **Inbound Consignments Dispatch**: Full roster of arriving clinical and high-value consignments.
* **4-Step Milestone Stepper**: Origin Formulation $	o$ Multi-Modal Transit $	o$ Customs Clearance (Interactive Toggle) $	o$ Dock Receipt.
* **4-Point Zero-Trust Cryptographic Audit Checklist**:
  1. Continuous Temperature SLA Compliance
  2. Physical Container E-Seal Integrity
  3. Port Customs Digital Stamp & International HS Code
  4. SHA-256 Merkle Hash-Chain & ECDSA Hardware Signature Proof
* **Forensic Hash Discrepancy Evidence**: Expands a side-by-side **Old Authentic Genesis Hash (Block #14,895)** vs **Current Mutated Delivery Hash** only when data tampering occurs.
* **Settlement Actions**: Instant **Release Escrow** (Block `#14,897`) vs **Reject Consignment & Freeze Escrow** (terminates compromised cargo from active fleet on Block `#14,898`).

### 4. 🤖 AI Agent Pipeline (`/agents`)
* **Streamlined Multi-Agent Inspector**: Interactive consignment selector highlighting **Priority 1: Critical Medicine** vs Priority 2: Commercial cargo.
* **Sequential Agent Breakdown**: Clear, intuitive cards detailing what Sentinel, Impact, Strategy, and Recovery agents executed for each consignment.

### 5. 📦 Blockchain Ledger Explorer (`/ledger`)
* Immutable SHA-256 block ledger explorer tracking human consensus authorizations, threat fingerprints, and cryptographic custody notary records.

---

## 🔌 SAP CAP & HANA Cloud Integration

The backend is built with the **SAP Cloud Application Programming Model (`@sap/cds`)**:

### OData v4 Service Endpoints:
* **Metadata**: `GET http://localhost:4004/chain-guard/$metadata`
* **Nodes (17 Global Hubs)**: `GET http://localhost:4004/chain-guard/Nodes`
* **Shipments**: `GET http://localhost:4004/chain-guard/Shipments`
* **Corridor Routes**: `GET http://localhost:4004/chain-guard/Routes`

### Custom Enterprise Actions:
```http
# Approve Reroute Plan
POST http://localhost:4004/chain-guard/approveRecoveryPlan
Content-Type: application/json
{ "shipmentID": "ORD-5415", "planID": "OPT-A" }

# Log Tampering Audit
POST http://localhost:4004/chain-guard/tamperTelemetry
Content-Type: application/json
{ "shipmentID": "ORD-5415", "fakedTemp": 19.81, "fakedSeal": "INTACT" }

# Zero-Trust Delivery Verification & Escrow Release
POST http://localhost:4004/chain-guard/verifyAndReleaseEscrow
Content-Type: application/json
{ "shipmentID": "ORD-5415" }
```

---

## 🚀 Installation & Quick Start

### Prerequisites
* **Node.js**: `v18.x` or `v20.x`
* **Python**: `v3.10` or higher
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/ChainGaurd.v2.git
cd ChainGaurd.v2
```

### 2. Setup & Launch All 3 Services

#### Option A: Terminal 1 — Python WebSocket Relay (Port 8000)
```bash
pip install -r requirements.txt
python run_backend.py
```

#### Option B: Terminal 2 — SAP CAP OData Backend (Port 4004)
```bash
cd chainguard-backend
npm install
node server.js
```

#### Option C: Terminal 3 — Frontend React / Vite UI (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Repository Structure

```
ChainGaurd.v2/
├── backend/                        # Python FastAPI Backend
│   ├── api/routes.py               # REST API Endpoints
│   ├── blockchain/chain.py         # SHA-256 Merkle Ledger Implementation
│   ├── simulation/engine.py        # 60 FPS Physics Simulation Engine
│   └── websocket/manager.py        # Real-time WebSocket Broadcaster
│
├── chainguard-backend/             # SAP CAP (Cloud Application Programming) Backend
│   ├── db/
│   │   ├── schema.cds              # CDS Entity Data Model
│   │   └── data/*.csv              # Seed Data for Nodes, Routes, Shipments
│   ├── srv/
│   │   ├── chainguard-service.cds  # OData v4 Service Definition & Actions
│   │   └── chainguard-service.js   # Enterprise Business Logic Handlers
│   ├── .cdsrc.json                 # SAP HANA Cloud & SQLite Profile Configuration
│   └── server.js                   # CAP Server Bootstrap
│
├── frontend/                       # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── agents/                 # Autonomous AI Agent Implementations
│   │   │   ├── sentinelAgent.ts    # Threat Detection & Triage
│   │   │   ├── impactAgent.ts      # Delay & Vulnerability Physics
│   │   │   └── strategyAgent.ts    # Graph Detour Discovery & Scoring
│   │   ├── components/             # Reusable UI & Monitoring Components
│   │   │   ├── GlobalSupplyChainMonitor.tsx # Master 2:1 Equirectangular Map
│   │   │   ├── RecoveryPlansPanel.tsx       # Side-by-Side Recovery Cards
│   │   │   └── Sidebar.tsx                  # Clean Master Navigation
│   │   ├── context/
│   │   │   └── SimulationContext.tsx        # Central State & 60 FPS Physics Loop
│   │   ├── pages/                  # Stakeholder Views
│   │   │   ├── DashboardView.tsx   # Master Hub
│   │   │   ├── CarrierNode.tsx     # Carrier Fleet Cockpit & Fraud Studio
│   │   │   ├── ReceiverHospital.tsx# Consignee Gate & Zero-Trust Audit
│   │   │   ├── AgentsView.tsx      # Streamlined AI Agent Pipeline
│   │   │   └── BlockchainLedger.tsx# Cryptographic Block Explorer
│   │   └── services/
│   │       ├── api.ts              # Python Relay REST API Client
│   │       └── capApi.ts           # SAP CAP OData v4 Typed API Client
│   └── package.json
│
├── requirements.txt                # Python Dependencies
├── run_backend.py                  # Python Backend Entrypoint
├── .gitignore                      # Git Ignore Configuration
└── README.md                       # Comprehensive Platform Documentation
```



---

<div align="center">
  <sub>Built with ❤️ by the ChainGuard Core Engineering Team.</sub>
</div>
