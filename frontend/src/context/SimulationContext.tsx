import { capApi } from '../services/capApi';
export interface HistoricalCrisis {
  id: string;
  title: string;
  type: string;
  affectedShipmentId: string;
  locationName: string;
  etaImpact: string;
  resolvedAt: string;
  recoveryOptionTitle: string;
  txHash: string;
}

import { strategyAgent, StrategyResult } from '../agents/strategyAgent';
import { impactAgent, ImpactResult } from '../agents/impactAgent';
import { sentinelAgent, SentinelResult } from '../agents/sentinelAgent';
import { generateRecoveryOptions } from '../utils/recoveryEngine';
import { RecoveryOption } from '../types/shipment';
import { generateSmartCrisis } from '../utils/crisisEngine';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Shipment, TransportMode, ShipmentPhase, ShipmentStatus, ActiveCrisis, CrisisType, RiskLevel } from '../types/shipment';
import { createInitialShipments, generateRandomShipment, evaluateShipmentPosition, LOCATIONS_MAP } from '../utils/routingEngine';

export interface ChokepointCrisisDef {
  id: string;
  name: string;
  type: CrisisType;
  title: string;
  desc: string;
  locationNodeId: string;
  locationName: string;
  etaImpact: string;
  riskScore: number;
  status: 'ROUTE BLOCKED' | 'SPEED HALTED' | 'CARGO AT RISK' | 'PORT CONGESTION';
  routeId: string;
  applicableNodes: string[];
}

export const STRATEGIC_CHOKEPOINTS_DATA: ChokepointCrisisDef[] = [
  {
    id: "suez",
    name: "Suez Canal",
    type: "ROUTE_BLOCKAGE",
    title: "Red Sea & Suez Canal Maritime Blockade",
    desc: "Security alert and military drone activity halted all container vessel passage through the Suez Canal & Bab-el-Mandeb.",
    locationNodeId: "DXB",
    locationName: "Suez Canal",
    etaImpact: "+6.2 Days",
    riskScore: 88,
    status: "ROUTE BLOCKED",
    routeId: "SEA-DXB-RTM-6848",
    applicableNodes: ["DXB", "RTM", "IST"]
  },
  {
    id: "babelmandeb",
    name: "Bab-el-Mandeb Strait",
    type: "ROUTE_BLOCKAGE",
    title: "Bab-el-Mandeb Maritime Security Closure",
    desc: "Naval conflict & commercial transit suspension at the southern gateway to the Red Sea.",
    locationNodeId: "DXB",
    locationName: "Bab-el-Mandeb Strait",
    etaImpact: "+5.5 Days",
    riskScore: 85,
    status: "ROUTE BLOCKED",
    routeId: "SEA-DXB-RTM-6848",
    applicableNodes: ["DXB", "RTM", "CMB"]
  },
  {
    id: "malacca",
    name: "Strait of Malacca",
    type: "PORT_CONGESTION",
    title: "Strait of Malacca Chokepoint Congestion",
    desc: "Extreme container ship saturation and customs IT outage causing a 42-vessel anchorage queue.",
    locationNodeId: "SIN",
    locationName: "Strait of Malacca",
    etaImpact: "+4.2 Days",
    riskScore: 76,
    status: "PORT CONGESTION",
    routeId: "SEA-SIN-DXB-5559",
    applicableNodes: ["SIN", "BOM", "CMB", "SHA"]
  },
  {
    id: "hormuz",
    name: "Strait of Hormuz",
    type: "ROUTE_BLOCKAGE",
    title: "Strait of Hormuz Navigational Restriction",
    desc: "Emergency naval standoff and exclusion zone declared at the entrance of the Persian Gulf.",
    locationNodeId: "DXB",
    locationName: "Strait of Hormuz",
    etaImpact: "+4.0 Days",
    riskScore: 80,
    status: "ROUTE BLOCKED",
    routeId: "SEA-DXB-RTM-6848",
    applicableNodes: ["DXB", "BOM"]
  },
  {
    id: "panama",
    name: "Panama Canal",
    type: "ROUTE_BLOCKAGE",
    title: "Panama Canal Low-Draft Restrictions",
    desc: "Severe seasonal drought reducing Gatun Lake water levels, imposing emergency daily transit limits.",
    locationNodeId: "NYC",
    locationName: "Panama Canal",
    etaImpact: "+5.0 Days",
    riskScore: 79,
    status: "ROUTE BLOCKED",
    routeId: "SEA-NYC-LAX-4981",
    applicableNodes: ["NYC", "LAX", "SSZ"]
  },
  {
    id: "taiwan_strait",
    name: "Taiwan Strait & SCS",
    type: "SEVERE_WEATHER",
    title: "South China Sea Super Typhoon Warning",
    desc: "Category 4 Super Typhoon generating 10-meter wave swells along the Taiwan Strait maritime corridor.",
    locationNodeId: "SHA",
    locationName: "Taiwan Strait & SCS",
    etaImpact: "+3.5 Days",
    riskScore: 82,
    status: "ROUTE BLOCKED",
    routeId: "SEA-SHA-SIN-6634",
    applicableNodes: ["SHA", "PUS", "TYO", "SIN"]
  },
  {
    id: "cape_good_hope",
    name: "Cape of Good Hope",
    type: "SEVERE_WEATHER",
    title: "Cape of Good Hope South Atlantic Gale",
    desc: "Severe southern ocean rough sea state affecting long-haul transshipment detours around Africa.",
    locationNodeId: "CPT",
    locationName: "Cape of Good Hope",
    etaImpact: "+3.8 Days",
    riskScore: 75,
    status: "SPEED HALTED",
    routeId: "SEA-CPT-RTM-4225",
    applicableNodes: ["CPT", "RTM", "DXB", "SSZ"]
  },
  {
    id: "gibraltar",
    name: "Strait of Gibraltar",
    type: "ROUTE_BLOCKAGE",
    title: "Strait of Gibraltar Emergency Closure",
    desc: "Container ship disabled in main shipping channel, temporarily halting transit into Mediterranean.",
    locationNodeId: "RTM",
    locationName: "Strait of Gibraltar",
    etaImpact: "+3.2 Days",
    riskScore: 77,
    status: "ROUTE BLOCKED",
    routeId: "SEA-DXB-RTM-6848",
    applicableNodes: ["RTM", "DXB", "NYC", "IST"]
  },
  {
    id: "english_channel",
    name: "English Channel",
    type: "SEVERE_WEATHER",
    title: "North Sea & English Channel Winter Storm",
    desc: "Dense fog and gale-force winds causing berthing suspensions across Rotterdam and Hamburg.",
    locationNodeId: "RTM",
    locationName: "English Channel",
    etaImpact: "+2.5 Days",
    riskScore: 73,
    status: "SPEED HALTED",
    routeId: "SEA-RTM-HAM-0589",
    applicableNodes: ["LON", "RTM", "HAM"]
  },
  {
    id: "bosphorus",
    name: "Bosphorus Strait",
    type: "PORT_CONGESTION",
    title: "Bosphorus Strait Vessel Backlog",
    desc: "Maritime pilot strike and high current navigation restrictions backing up regional traffic.",
    locationNodeId: "IST",
    locationName: "Bosphorus Strait",
    etaImpact: "+2.9 Days",
    riskScore: 71,
    status: "PORT CONGESTION",
    routeId: "AIR-IST-FRA-0138",
    applicableNodes: ["IST", "RTM"]
  }
];

interface SimulationContextType {
  shipments: Shipment[];
  activeCrises: ActiveCrisis[];
  historicalCrises: HistoricalCrisis[];
  activeCrisis: ActiveCrisis | null;
  selectedCrisisId: string | null;
  isSimulating: boolean;
  selectedShipmentId: string | null;
  simulationSpeed: number;
  recoveryOptions: RecoveryOption[];
  selectedRecoveryOptionId: string | null;
  previewOption: RecoveryOption | null;
  successfulRecoveriesCount: number;
  sentinelResult: SentinelResult | null;
  sentinelStage: 'MONITORING' | 'ANALYZING' | 'VERIFIED' | 'IGNORED';
  impactResult: ImpactResult | null;
  impactAgentStatus: 'IDLE' | 'PROCESSING' | 'READY';
  strategyResult: StrategyResult | null;
  strategyAgentStatus: 'IDLE' | 'PROCESSING' | 'READY';
  authorizedDecision: {
    blockNumber: number;
    optionTitle: string;
    shipmentId: string;
    txHash: string;
    authorizedAt: string;
  } | null;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  restartSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  selectShipment: (id: string | null) => void;
  selectCrisis: (crisisId: string) => void;
  selectRecoveryOption: (optionId: string | null) => void;
  previewRecoveryOption: (optionId: string) => void;
  applyRecoveryOption: (shipmentId: string, optionId: string) => void;
  addRandomShipment: (mode?: TransportMode) => void;
  triggerRandomCrisis: (type?: CrisisType) => void;
  triggerCrisisAtChokepoint: (chokepointId: string) => void;
  clearCrisis: (crisisId?: string) => void;
  clearAllCrises: () => void;
  injectTemperatureSpike: (shipmentId: string, spikeTemp?: number) => void;
  breakCargoSeal: (shipmentId: string) => void;
  manipulateCarrierTelemetry: (
    shipmentId: string,
    fakeTemp?: number,
    fakeSeal?: 'INTACT' | 'TAMPERED' | 'BROKEN',
    fakeBattery?: number,
    fakeShock?: number
  ) => void;
  resetShipmentTelemetry: (shipmentId: string) => void;
  terminateAndRemoveShipment: (shipmentId: string) => void;
  verifyAndAcceptDelivery: (shipmentId: string) => {
    success: boolean;
    reason?: string;
    discrepancies?: string[];
    escrowReleasedUSD?: number;
  };
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // SAP CAP & HANA Cloud Data Connection
  useEffect(() => {
    capApi.checkHealth().then((isLive) => {
      if (isLive) {
        console.log('🚀 [SAP CAP] Connected to SAP Cloud Application Programming Model & HANA Database Layer');
      } else {
        console.info('[SAP CAP] Local CAP server offline, running in autonomous browser mode');
      }
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Real-Time Multi-Node WebSocket Sync (Master Hub <-> Carrier <-> Receiver)
  // ---------------------------------------------------------------------------
  const wsRef = React.useRef<WebSocket | null>(null);

  const broadcastWsEvent = useCallback((eventPayload: any) => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(eventPayload));
      }
    } catch (err) {
      console.error('[WS Send Error]:', err);
    }
  }, []);

  React.useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      const host = window.location.hostname || 'localhost';
      const wsUrl = `ws://${host}:8000/ws`;
      console.log(`[WebSocket] Connecting to ${wsUrl}...`);

      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`[WebSocket] Connected to ChainGuard Real-Time Hub at ${wsUrl}`);
        };

        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (!data || !data.type) return;

            if (data.type === 'INJECT_TEMP_SPIKE') {
              setShipments((prev) =>
                prev.map((s) => {
                  if (s.id === data.shipmentId) {
                    return {
                      ...s,
                      actualSensorTemp: data.spikeTemp,
                      temperature: data.spikeTemp,
                      reportedTemp: s.isTemperatureManipulated ? s.reportedTemp : data.spikeTemp,
                      status: 'AT RISK' as ShipmentStatus,
                      riskLevel: 'CRITICAL' as RiskLevel,
                      waitMessage: `⚠️ Temperature Excursion (+${data.spikeTemp}°C) Detected!`,
                    };
                  }
                  return s;
                })
              );
            } else if (data.type === 'BREAK_CARGO_SEAL') {
              setShipments((prev) =>
                prev.map((s) => {
                  if (s.id === data.shipmentId) {
                    return {
                      ...s,
                      sealStatus: 'BROKEN' as const,
                      reportedSealStatus: s.isSealManipulated ? s.reportedSealStatus : ('BROKEN' as const),
                      status: 'AT RISK' as ShipmentStatus,
                      riskLevel: 'HIGH' as RiskLevel,
                      waitMessage: '🚨 Digital Container Seal Broken!',
                    };
                  }
                  return s;
                })
              );
            } else if (data.type === 'MANIPULATE_CARRIER_TELEMETRY') {
              setShipments((prev) =>
                prev.map((s) => {
                  if (s.id === data.shipmentId) {
                    const updatedTemp = data.fakeTemp !== undefined ? data.fakeTemp : s.reportedTemp;
                    const updatedSeal = data.fakeSeal !== undefined ? data.fakeSeal : s.reportedSealStatus;
                    const updatedBattery = data.fakeBattery !== undefined ? data.fakeBattery : (s.reportedBatteryHours ?? s.reeferBatteryHours);
                    const updatedShock = data.fakeShock !== undefined ? data.fakeShock : (s.reportedImpactShockG ?? s.impactShockG);

                    return {
                      ...s,
                      reportedTemp: updatedTemp,
                      isTemperatureManipulated: data.fakeTemp !== undefined ? true : s.isTemperatureManipulated,
                      reportedSealStatus: updatedSeal,
                      isSealManipulated: data.fakeSeal !== undefined ? true : s.isSealManipulated,
                      reportedBatteryHours: updatedBattery,
                      isBatteryManipulated: data.fakeBattery !== undefined ? true : s.isBatteryManipulated,
                      reportedImpactShockG: updatedShock,
                      isShockManipulated: data.fakeShock !== undefined ? true : s.isShockManipulated,
                    };
                  }
                  return s;
                })
              );
            } else if (data.type === 'TERMINATE_SHIPMENT') {
              setShipments((prev) => prev.filter((s) => s.id !== data.shipmentId));
              setActiveCrises((prev) => prev.filter((c) => c.affectedShipmentId !== data.shipmentId));
            } else if (data.type === 'RESET_TELEMETRY') {
              setShipments((prev) =>
                prev.map((s) => {
                  if (s.id === data.shipmentId) {
                    let nominalTemp = -20.42;
                    if (s.cargoType === 'biologics') {
                      nominalTemp = s.cargo.toLowerCase().includes('plasma') || s.cargo.toLowerCase().includes('immunotherapy') ? -20.03 : -20.42;
                    } else if (s.cargoType === 'pharmaceutical') {
                      nominalTemp = 4.01;
                    } else if (s.cargoType === 'electronics') {
                      nominalTemp = 21.20;
                    } else if (s.cargoType === 'industrial') {
                      nominalTemp = 19.80;
                    } else if (s.cargoType === 'medical') {
                      nominalTemp = 20.50;
                    }
                    return {
                      ...s,
                      actualSensorTemp: nominalTemp,
                      temperature: nominalTemp,
                      reportedTemp: nominalTemp,
                      isTemperatureManipulated: false,
                      sealStatus: 'INTACT' as const,
                      reportedSealStatus: 'INTACT' as const,
                      isSealManipulated: false,
                      riskLevel: 'LOW' as RiskLevel,
                      waitMessage: undefined,
                    };
                  }
                  return s;
                })
              );
            } else if (data.type === 'APPLY_RECOVERY_OPTION') {
              // Apply recovery option across all nodes
              const { shipmentId, optionId } = data;
              setShipments((prev) =>
                prev.map((s) => {
                  if (s.id === shipmentId) {
                    return {
                      ...s,
                      status: 'REROUTING' as ShipmentStatus,
                      speedCondition: 'NOMINAL',
                      waitMessage: '🟢 Resumed: Navigating Approved Recovery Route',
                      hasHadCrisis: true,
                    };
                  }
                  return s;
                })
              );
            } else if (data.type === 'VERIFY_DELIVERY') {
              const { shipmentId, success, escrowReleasedUSD } = data;
              setShipments((prev) =>
                prev.map((s) => {
                  if (s.id === shipmentId) {
                    return {
                      ...s,
                      status: (success ? 'DELIVERED' : 'RECOVERED') as ShipmentStatus,
                      escrowStatus: (success ? 'RELEASED' : 'FROZEN') as 'RELEASED' | 'FROZEN',
                      progress: success ? 100 : s.progress,
                      waitMessage: success
                        ? `✓ Verified & Escrow Released ($${(escrowReleasedUSD / 1000000).toFixed(2)}M)`
                        : '❌ Rejected: Cryptographic Integrity Breach',
                    };
                  }
                  return s;
                })
              );
            }
          } catch (e) {
            // Ignore parse errors on raw messages
          }
        };

        ws.onclose = () => {
          console.log('[WebSocket] Connection closed. Retrying in 2.5s...');
          reconnectTimeout = setTimeout(connectWebSocket, 2500);
        };

        ws.onerror = (err) => {
          console.warn('[WebSocket] Warning:', err);
          ws?.close();
        };
      } catch (err) {
        console.error('[WebSocket Init Error]:', err);
        reconnectTimeout = setTimeout(connectWebSocket, 2500);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  const [shipments, setShipments] = useState<Shipment[]>(() => createInitialShipments());
  const [activeCrises, setActiveCrises] = useState<ActiveCrisis[]>([]);
  const [historicalCrises, setHistoricalCrises] = useState<HistoricalCrisis[]>([
    {
      id: 'CRS-HIST-104',
      title: 'Malacca Strait Monsoon Gale Surge',
      type: 'SEVERE_WEATHER',
      affectedShipmentId: 'ORD-1002',
      locationName: 'Malacca Strait',
      etaImpact: '+3.8 Days',
      resolvedAt: '10:42:15 AM',
      recoveryOptionTitle: 'Singapore ➔ Jakarta High-Speed Sea Diversion',
      txHash: '0x8f2a9b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f90',
    },
    {
      id: 'CRS-HIST-102',
      title: 'Suez Canal Container Ship Grounding',
      type: 'ROUTE_BLOCKAGE',
      affectedShipmentId: 'ORD-1001',
      locationName: 'Suez Canal & Red Sea',
      etaImpact: '+8.2 Days',
      resolvedAt: '09:15:30 AM',
      recoveryOptionTitle: 'Cape of Good Hope Maritime Detour',
      txHash: '0x4e7b1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a',
    }
  ]);
  const [selectedCrisisId, setSelectedCrisisId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);

  // State for AI Agents and Recoveries
  const [successfulRecoveriesCount, setSuccessfulRecoveriesCount] = useState<number>(0);
  const [sentinelResult, setSentinelResult] = useState<SentinelResult | null>(null);
  const [sentinelStage, setSentinelStage] = useState<'MONITORING' | 'ANALYZING' | 'VERIFIED' | 'IGNORED'>('MONITORING');
  const [impactResult, setImpactResult] = useState<ImpactResult | null>(null);
  const [impactAgentStatus, setImpactAgentStatus] = useState<'IDLE' | 'PROCESSING' | 'READY'>('IDLE');
  const [strategyResult, setStrategyResult] = useState<StrategyResult | null>(null);
  const [strategyAgentStatus, setStrategyAgentStatus] = useState<'IDLE' | 'PROCESSING' | 'READY'>('IDLE');
  const [authorizedDecision, setAuthorizedDecision] = useState<{
    blockNumber: number;
    optionTitle: string;
    shipmentId: string;
    txHash: string;
    authorizedAt: string;
  } | null>(null);

  // Getter for active selected crisis
  const activeCrisis: ActiveCrisis | null = activeCrises.find((c) => c.id === selectedCrisisId) || activeCrises[0] || null;

  const [selectedRecoveryOptionId, setSelectedRecoveryOptionId] = useState<string | null>(null);

  // Compute 2-3 recovery options using Strategy Agent dynamically for whichever crisis is currently active
  const recoveryOptions: RecoveryOption[] = React.useMemo(() => {
    if (!activeCrisis) return [];
    const targetShipment = shipments.find((s) => s.id === activeCrisis.affectedShipmentId);
    if (!targetShipment) return [];

    if (
      strategyResult &&
      strategyResult.shipmentId === targetShipment.id &&
      strategyResult.allAlternatives &&
      strategyResult.allAlternatives.length > 0
    ) {
      return strategyResult.allAlternatives;
    }

    try {
      const sRes = sentinelAgent(targetShipment, activeCrisis);
      const impRes = impactAgent(sRes, targetShipment);
      const stratRes = strategyAgent(targetShipment, impRes);
      return stratRes.allAlternatives;
    } catch {
      return generateRecoveryOptions(targetShipment, activeCrisis);
    }
  }, [activeCrisis, shipments, strategyResult]);

  const previewOption: RecoveryOption | null =
    recoveryOptions.find((opt) => opt.id === selectedRecoveryOptionId) ||
    recoveryOptions.find((opt) => opt.recommended) ||
    recoveryOptions[0] ||
    null;

  const selectRecoveryOption = useCallback((optionId: string | null) => {
    setSelectedRecoveryOptionId(optionId);
  }, []);

  const selectCrisis = useCallback((crisisId: string) => {
    setSelectedCrisisId(crisisId);
    setSelectedRecoveryOptionId(null);
    const cr = activeCrises.find((c) => c.id === crisisId);
    if (cr) {
      const targetShipment = shipments.find((s) => s.id === cr.affectedShipmentId);
      if (targetShipment) {
        try {
          const sRes = sentinelAgent(targetShipment, cr);
          setSentinelResult(sRes);
          setSentinelStage('VERIFIED');
          const impRes = impactAgent(sRes, targetShipment);
          setImpactResult(impRes);
          setImpactAgentStatus('READY');
          const stratRes = strategyAgent(targetShipment, impRes);
          setStrategyResult(stratRes);
          setStrategyAgentStatus('READY');
        } catch (e) {
          console.error('Error re-evaluating agents on selectCrisis:', e);
        }
      }
    }
  }, [activeCrises, shipments]);

  // Preview recovery option without applying it yet
  const previewRecoveryOption = useCallback((optionId: string) => {
    setSelectedRecoveryOptionId(optionId);
    setShipments((prev) =>
      prev.map((s) => {
        if (activeCrisis && s.id === activeCrisis.affectedShipmentId && s.status === 'DISRUPTED') {
          return {
            ...s,
            status: 'AWAITING APPROVAL' as ShipmentStatus,
            waitMessage: '⏳ Awaiting Human Authorization for Plan',
          };
        }
        return s;
      })
    );
  }, [activeCrisis]);

  // Authorize & Apply chosen recovery option: enters REROUTING state, moves vessel, commits blockchain decision, and resolves crisis
  const applyRecoveryOption = useCallback((shipmentId: string, optionId: string) => {
    const targetCrisis = activeCrises.find((c) => c.affectedShipmentId === shipmentId) || activeCrisis;
    const option = recoveryOptions.find((o) => o.id === optionId) || previewOption;

    if (!option || !targetCrisis) return;

    // 1. Determine vehicle mode and segments for the approved plan
    const isHold = option.type === 'HOLD_WAIT';
    const isAir = option.mode === 'air' || (option.mode === 'multimodal' && option.segments.some((seg) => seg.mode === 'air'));

    // 2. Update Shipment state immediately so vessel starts navigating
    setShipments((prevShipments) =>
      prevShipments.map((s) => {
        if (s.id === shipmentId) {
          const newSpeed = isAir ? 840.0 : (s.baseSpeedKmH || 24.0);
          const newSegments = (option.segments && option.segments.length > 0) ? option.segments : s.segments;

          if (isHold) {
            return {
              ...s,
              status: 'IN TRANSIT' as ShipmentStatus,
              speedCondition: 'NOMINAL',
              currentSpeedKmH: s.baseSpeedKmH,
              waitMessage: `⏸️ Standby Hold Active (${option.title})`,
              waitTimer: 10.0,
              hasHadCrisis: true,
            };
          }

          return {
            ...s,
            mode: isAir ? 'air' : s.mode,
            pathNodes: option.pathNodes,
            segments: newSegments,
            currentSegmentIndex: 0,
            segmentProgress: 0.05,
            phase: 'IN_TRANSIT',
            status: 'REROUTING' as ShipmentStatus,
            speedCondition: 'NOMINAL',
            currentSpeedKmH: newSpeed,
            riskLevel: option.riskLevel === 'LOW' ? 'LOW' : 'MODERATE',
            waitMessage: `🟢 Resumed: Navigating via ${option.title}`,
            hasHadCrisis: true,
            approvedRecovery: {
              optionId: option.id,
              title: option.title,
              mode: option.mode,
              rerouteProgress: 0.05,
            },
          };
        }
        return s;
      })
    );

    // Sync plan approval to SAP CAP / HANA Cloud
    capApi.approveRecoveryPlan(shipmentId, option.id);

    // 3. Notarize the Human Authorization onto the immutable blockchain ledger
    const pseudoTxHash = '0x' + Array.from('AUTH' + shipmentId + option.id + Date.now().toString(16))
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 40);

    setAuthorizedDecision({
      blockNumber: 14896,
      optionTitle: option.title,
      shipmentId,
      txHash: pseudoTxHash,
      authorizedAt: new Date().toLocaleTimeString(),
    });

    // 4. Mark crisis as approved
    setActiveCrises((prev) =>
      prev.map((c) => {
        if (c.id === targetCrisis.id) {
          return {
            ...c,
            status: 'APPROVED_REROUTING' as const,
            approvedOptionTitle: option.title,
          };
        }
        return c;
      })
    );

    // 5. Timed resolution: clear disruption after brief confirmation, increment recoveries count
    setTimeout(() => {
      setSuccessfulRecoveriesCount((prev) => prev + 1);
      
      // Record into immutable historical crises archive
      const resolvedEntry: HistoricalCrisis = {
        id: targetCrisis.id,
        title: targetCrisis.title,
        type: targetCrisis.type,
        affectedShipmentId: shipmentId,
        locationName: targetCrisis.locationName,
        etaImpact: targetCrisis.etaImpact,
        resolvedAt: new Date().toLocaleTimeString(),
        recoveryOptionTitle: option.title,
        txHash: pseudoTxHash,
      };
      setHistoricalCrises((prev) => [resolvedEntry, ...prev]);

      setActiveCrises((prev) => {
        const remaining = prev.filter((c) => c.id !== targetCrisis.id);
        if (remaining.length > 0) {
          setSelectedCrisisId(remaining[0].id);
          setSelectedRecoveryOptionId(null);
          
          // Re-evaluate agents for next remaining active crisis
          const nextTarget = shipments.find((s) => s.id === remaining[0].affectedShipmentId);
          if (nextTarget) {
            try {
              const sRes = sentinelAgent(nextTarget, remaining[0]);
              setSentinelResult(sRes);
              setSentinelStage('VERIFIED');
              const impRes = impactAgent(sRes, nextTarget);
              setImpactResult(impRes);
              setImpactAgentStatus('READY');
              const stratRes = strategyAgent(nextTarget, impRes);
              setStrategyResult(stratRes);
              setStrategyAgentStatus('READY');
            } catch (err) {
              console.error(err);
            }
          }
        } else {
          setSelectedCrisisId(null);
          setSelectedRecoveryOptionId(null);
          setSentinelStage('MONITORING');
          setImpactAgentStatus('IDLE');
          setStrategyAgentStatus('IDLE');
          setImpactResult(null);
          setStrategyResult(null);
        }
        return remaining;
      });

      // Ensure shipment continues nominal transit
      setShipments((prevShipments) =>
        prevShipments.map((s) => {
          if (s.id === shipmentId) {
            return {
              ...s,
              status: 'IN TRANSIT' as ShipmentStatus,
              waitMessage: undefined,
            };
          }
          return s;
        })
      );
    }, 1800);
  }, [activeCrises, activeCrisis, recoveryOptions, previewOption]);

  const orderCounterRef = useRef<number>(1004);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const nextCrisisTimerRef = useRef<number>(18.0); // Natural random crisis every 18-35s

  // Trigger context-aware crisis strictly on a qualifying moving shipment
  const triggerRandomCrisis = useCallback((_forcedType?: CrisisType) => {
    setShipments((prevShipments) => {
      // Find a moving shipment in the 30%–60% window that is not already in activeCrises
      let target = prevShipments.find(
        (s) => (s.status === 'IN TRANSIT' || s.phase === 'IN_TRANSIT') &&
               s.progress >= 28 &&
               s.progress <= 65 &&
               !s.hasHadCrisis
      );

      if (!target) {
        target = prevShipments.find(
          (s) => (s.status === 'IN TRANSIT' || s.phase === 'IN_TRANSIT') &&
                 s.progress >= 20 &&
                 s.progress <= 85 &&
                 !s.hasHadCrisis
        );
      }

      if (!target) {
        target = prevShipments.find((s) => s.status === 'IN TRANSIT' || s.phase === 'IN_TRANSIT') || prevShipments[0];
      }

      if (!target) return prevShipments;

      const newCrisis = generateSmartCrisis(target);

      // STEP 1: Pass raw simulation event & target shipment to Sentinel Agent
      setSentinelStage('ANALYZING');
      const sResult = sentinelAgent(target, newCrisis);
      setSentinelResult(sResult);

      // STEP 2: If Sentinel verifies the threat, pass to Impact Agent
      if (sResult.verified) {
        setSentinelStage('VERIFIED');
        setImpactAgentStatus('PROCESSING');

        // STEP 3: Impact Agent calculates Delay, Financial Cost, Risk, & Cargo Impact
        const impResult = impactAgent(sResult, target);
        setImpactResult(impResult);
        setImpactAgentStatus('READY');

        // STEP 4: Strategy Agent searches graph, excludes blocked corridor, scores & ranks alternative recovery plans
        setStrategyAgentStatus('PROCESSING');
        const stratResult = strategyAgent(target, impResult);
        setStrategyResult(stratResult);
        setStrategyAgentStatus('READY');

        setActiveCrises((prev) => {
          const exists = prev.some((c) => c.affectedShipmentId === target!.id);
          if (exists) return prev;
          return [...prev, newCrisis];
        });
        setSelectedCrisisId(newCrisis.id);

        return prevShipments.map((s) => {
          if (s.id === target!.id) {
            const isTempExcursion = newCrisis.type === 'TEMP_EXCURSION';
            return {
              ...s,
              hasHadCrisis: true,
              status: (isTempExcursion ? 'AT RISK' : 'DISRUPTED') as ShipmentStatus,
              speedCondition: 'BLOCKED' as const,
              currentSpeedKmH: 0,
              riskLevel: (isTempExcursion ? 'CRITICAL' : impResult.riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH') as RiskLevel,
              temperature: isTempExcursion ? 8.6 : s.temperature,
              waitMessage: `📊 Impact: ${impResult.delayFormatted} Delay • ${impResult.costFormatted} Cost`,
            };
          }
          return s;
        });
      } else {
        // Sentinel ignored this event as irrelevant to this shipment
        setSentinelStage('IGNORED');
        setImpactResult(null);
        setImpactAgentStatus('IDLE');
        return prevShipments;
      }
    });
  }, []);

  const triggerCrisisAtChokepoint = useCallback((chokepointId: string) => {
    const cp = STRATEGIC_CHOKEPOINTS_DATA.find((c) => c.id === chokepointId);
    if (!cp) return;

    setShipments((prevShipments) => {
      // Find the sea vessel passing through or nearest to this chokepoint
      const target = prevShipments.find((s) => s.mode === 'sea' && s.pathNodes.some((n) => cp.applicableNodes.includes(n))) ||
                     prevShipments.find((s) => s.mode === 'sea') ||
                     prevShipments[0];

      if (!target) return prevShipments;

      const segIdx = Math.min(target.segments.length - 1, target.currentSegmentIndex);
      const activeSeg = target.segments[segIdx];

      const newCrisis: ActiveCrisis = {
        id: `CRS-${Math.floor(1000 + Math.random() * 9000)}`,
        type: cp.type,
        title: cp.title,
        affectedRouteId: cp.routeId || activeSeg?.routeId,
        affectedSegment: activeSeg ? { from: activeSeg.from, to: activeSeg.to, mode: activeSeg.mode } : undefined,
        affectedShipmentId: target.id,
        locationNodeId: cp.locationNodeId,
        locationName: cp.locationName,
        etaImpact: cp.etaImpact,
        riskScore: cp.riskScore,
        description: cp.desc,
        timestamp: new Date().toLocaleTimeString(),
        status: cp.status,
      };

      setActiveCrises((prev) => [...prev.filter((c) => c.affectedShipmentId !== target.id), newCrisis]);
      setSelectedCrisisId(newCrisis.id);

      return prevShipments.map((s) => {
        if (s.id === target.id) {
          return {
            ...s,
            status: 'DISRUPTED' as ShipmentStatus,
            speedCondition: 'BLOCKED' as const,
            currentSpeedKmH: 0,
            riskLevel: 'HIGH' as RiskLevel,
            waitMessage: `🚨 ${cp.title} - Shipment Paused`,
          };
        }
        return s;
      });
    });
  }, []);

  // Clear specific crisis by ID, or currently selected crisis
  const clearCrisis = useCallback((crisisId?: string) => {
    setActiveCrises((prevCrises) => {
      const targetId = crisisId || selectedCrisisId || (prevCrises[0]?.id);
      if (!targetId) return prevCrises;

      const targetCrisis = prevCrises.find((c) => c.id === targetId);
      const remaining = prevCrises.filter((c) => c.id !== targetId);

      if (remaining.length === 0) {
        setSelectedCrisisId(null);
        nextCrisisTimerRef.current = 20.0 + Math.random() * 10.0;
      } else if (selectedCrisisId === targetId) {
        setSelectedCrisisId(remaining[0].id);
      }

      // Resume ONLY the shipment affected by this specific crisis
      if (targetCrisis) {
        setShipments((prevShipments) =>
          prevShipments.map((s) => {
            if (s.id === targetCrisis.affectedShipmentId) {
              return {
                ...s,
                status: 'IN TRANSIT' as ShipmentStatus,
                speedCondition: 'NOMINAL' as const,
                currentSpeedKmH: s.baseSpeedKmH,
                riskLevel: 'LOW' as RiskLevel,
                waitMessage: undefined,
              };
            }
            return s;
          })
        );
      }

      return remaining;
    });
  }, [selectedCrisisId]);

  const clearAllCrises = useCallback(() => {
    setActiveCrises([]);
    setSelectedCrisisId(null);
    nextCrisisTimerRef.current = 20.0 + Math.random() * 10.0;
    setShipments((prev) =>
      prev.map((s) => {
        if (s.status === 'DISRUPTED' || s.status === 'AT RISK') {
          return {
            ...s,
            status: 'IN TRANSIT' as ShipmentStatus,
            speedCondition: 'NOMINAL' as const,
            currentSpeedKmH: s.baseSpeedKmH,
            riskLevel: 'LOW' as RiskLevel,
            waitMessage: undefined,
          };
        }
        return s;
      })
    );
  }, []);

  // Animation & Lifecycle Tick Loop (60 FPS)
  const animate = useCallback(
    (time: number) => {
      const delta = Math.min(0.1, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (isSimulating) {
        setShipments((prevShipments) => {
          // Automatic crisis trigger: fires strictly in the 32%–55% progress sweet-spot
          if (activeCrises.length === 0) {
            // Find a moving shipment that just reached the optimal 35% - 55% window and hasn't had a crisis
            const candidate = prevShipments.find(
              (s) => s.phase === 'IN_TRANSIT' &&
                     s.status === 'IN TRANSIT' &&
                     s.progress >= 35 &&
                     s.progress <= 55 &&
                     !s.hasHadCrisis
            );

            if (candidate) {
              setTimeout(() => {
                triggerRandomCrisis();
              }, 100);
            }
          }

          return prevShipments.map((rawS) => {
            // Live micro-telemetry oscillations (temperature & accelerometer jitter)
            const idSeed = parseInt(rawS.id.replace(/\D/g, '') || '1');
            // Natural dynamic micro-jitter (+/- 0.06°C)
            const tempOscillation = (Math.sin(time / 650 + idSeed * 1.7) * 0.045) + (Math.cos(time / 1200 + idSeed * 3.1) * 0.025);
            
            let nextActualTemp = rawS.actualSensorTemp;
            // If temperature is within nominal window, oscillate smoothly around product-specific baseline
            const minAllowed = rawS.targetTempRange?.min ?? -25.0;
            const maxAllowed = rawS.targetTempRange?.max ?? 25.0;
            if (rawS.actualSensorTemp <= maxAllowed && rawS.actualSensorTemp >= minAllowed) {
              let baseTarget = -20.42;
              if (rawS.cargoType === 'biologics') {
                baseTarget = rawS.cargo.toLowerCase().includes('plasma') || rawS.cargo.toLowerCase().includes('immunotherapy') ? -20.03 : -20.42;
              } else if (rawS.cargoType === 'pharmaceutical') {
                baseTarget = 4.01;
              } else if (rawS.cargoType === 'electronics') {
                baseTarget = 21.20;
              } else if (rawS.cargoType === 'industrial') {
                baseTarget = 19.80;
              } else if (rawS.cargoType === 'medical') {
                baseTarget = 20.50;
              }
              nextActualTemp = parseFloat((baseTarget + tempOscillation).toFixed(2));
            } else {
              // Even during an excursion/spike, keep natural thermal micro-jitter
              nextActualTemp = parseFloat((rawS.actualSensorTemp + (Math.sin(time / 800 + idSeed) * 0.02)).toFixed(2));
            }

            const nextReportedTemp = rawS.isTemperatureManipulated ? rawS.reportedTemp : nextActualTemp;
            const nextShock = parseFloat((0.08 + Math.abs(Math.sin(time / 550 + idSeed)) * 0.04).toFixed(2));

            // Create shipment base with GUARANTEED continuously updating live telemetry
            const s: Shipment = {
              ...rawS,
              actualSensorTemp: nextActualTemp,
              temperature: nextActualTemp,
              reportedTemp: nextReportedTemp,
              impactShockG: nextShock,
            };

            if (s.status === 'DISRUPTED' || s.speedCondition === 'BLOCKED') {
              return s;
            }

            let { phase, waitTimer, currentSegmentIndex, segmentProgress, segments, mode } = s;
            const isAir = mode === 'air';
            const numSegments = segments ? segments.length : 1;
            const effectiveDt = delta * simulationSpeed;

            // 1. ORIGIN WAIT
            if (phase === 'ORIGIN_WAIT') {
              const nextTimer = waitTimer - effectiveDt;
              if (nextTimer <= 0) {
                phase = 'IN_TRANSIT';
                waitTimer = 0;
                currentSegmentIndex = 0;
                segmentProgress = 0.0;
                const nextS: Shipment = {
                  ...s,
                  phase,
                  waitTimer,
                  currentSegmentIndex,
                  segmentProgress,
                  actualSensorTemp: nextActualTemp,
                  temperature: nextActualTemp,
                  reportedTemp: nextReportedTemp,
                  impactShockG: nextShock,
                  status: 'IN TRANSIT' as ShipmentStatus,
                  waitMessage: undefined,
                };
                nextS.currentCoord = evaluateShipmentPosition(nextS);
                return nextS;
              } else {
                const originName = LOCATIONS_MAP[s.from]?.name || s.from;
                const nextS: Shipment = {
                  ...s,
                  waitTimer: nextTimer,
                  status: (isAir ? 'AIRPORT DOCKED' : 'PORT DOCKED') as ShipmentStatus,
                  waitMessage: isAir
                    ? `At ${originName} Airport (${(nextTimer ?? 0).toFixed(0)}s)`
                    : `At ${originName} Port (${(nextTimer ?? 0).toFixed(0)}s)`,
                };
                nextS.currentCoord = evaluateShipmentPosition(nextS);
                return nextS;
              }
            }

            // 2. IN TRANSIT
            if (phase === 'IN_TRANSIT') {
              const seg = segments[currentSegmentIndex];
              const segDistance = seg?.distanceKm || (s.totalDistanceKm / numSegments);
              const segDuration = Math.max(8.0, (segDistance / s.totalDistanceKm) * s.simDurationSeconds);
              const progressDelta = effectiveDt / segDuration;

              const nextSegProgress = segmentProgress + progressDelta;

              if (nextSegProgress >= 1.0) {
                const nextNodeIndex = currentSegmentIndex + 1;
                if (nextNodeIndex < numSegments) {
                  phase = 'HUB_WAIT';
                  waitTimer = 5.0;
                  currentSegmentIndex = nextNodeIndex;
                  segmentProgress = 0.0;
                  const hubNodeId = s.pathNodes[nextNodeIndex];
                  const hubName = LOCATIONS_MAP[hubNodeId]?.name || hubNodeId;
                  const overallProgress = parseFloat(((nextNodeIndex / numSegments) * 100).toFixed(1));

                  const nextS: Shipment = {
                    ...s,
                    phase,
                    waitTimer,
                    currentSegmentIndex,
                    segmentProgress,
                    progress: overallProgress,
                    status: (isAir ? 'AIRPORT TRANSIT' : 'TRANSSHIPMENT') as ShipmentStatus,
                    waitMessage: isAir
                      ? `Transit at ${hubName} Airport (5s)`
                      : `Transshipment at ${hubName} Port (5s)`,
                  };
                  nextS.currentCoord = evaluateShipmentPosition(nextS);
                  return nextS;
                } else {
                  phase = 'DESTINATION_WAIT';
                  waitTimer = 10.0;
                  currentSegmentIndex = numSegments - 1;
                  segmentProgress = 1.0;
                  const destName = LOCATIONS_MAP[s.to]?.name || s.to;

                  const nextS: Shipment = {
                    ...s,
                    phase,
                    waitTimer,
                    currentSegmentIndex,
                    segmentProgress,
                    progress: 100.0,
                    status: 'DELIVERED' as ShipmentStatus,
                    waitMessage: `Delivered at ${destName} (10s)`,
                  };
                  nextS.currentCoord = evaluateShipmentPosition(nextS);
                  return nextS;
                }
              } else {
                const overallProgress = parseFloat(
                  (((currentSegmentIndex + nextSegProgress) / numSegments) * 100).toFixed(2)
                );
                const nextS: Shipment = {
                  ...s,
                  segmentProgress: nextSegProgress,
                  progress: overallProgress,
                  status: 'IN TRANSIT' as ShipmentStatus,
                  waitMessage: undefined,
                };
                nextS.currentCoord = evaluateShipmentPosition(nextS);
                return nextS;
              }
            }

            // 3. HUB WAIT
            if (phase === 'HUB_WAIT') {
              const nextTimer = waitTimer - effectiveDt;
              if (nextTimer <= 0) {
                phase = 'IN_TRANSIT';
                waitTimer = 0;
                segmentProgress = 0.0;
                const nextS: Shipment = {
                  ...s,
                  phase,
                  waitTimer,
                  segmentProgress,
                  status: 'IN TRANSIT' as ShipmentStatus,
                  waitMessage: undefined,
                };
                nextS.currentCoord = evaluateShipmentPosition(nextS);
                return nextS;
              } else {
                const hubNodeId = s.pathNodes[currentSegmentIndex];
                const hubName = LOCATIONS_MAP[hubNodeId]?.name || hubNodeId;
                const nextS: Shipment = {
                  ...s,
                  waitTimer: nextTimer,
                  status: (isAir ? 'AIRPORT TRANSIT' : 'TRANSSHIPMENT') as ShipmentStatus,
                  waitMessage: isAir
                    ? `Transit at ${hubName} Airport (${(nextTimer ?? 0).toFixed(0)}s)`
                    : `Transshipment at ${hubName} Port (${(nextTimer ?? 0).toFixed(0)}s)`,
                };
                nextS.currentCoord = evaluateShipmentPosition(nextS);
                return nextS;
              }
            }

            // 4. DESTINATION WAIT
            if (phase === 'DESTINATION_WAIT') {
              const nextTimer = waitTimer - effectiveDt;
              if (nextTimer <= 0) {
                orderCounterRef.current += 1;
                const newShipment = generateRandomShipment(orderCounterRef.current % 9000);
                if (newShipment) {
                  return newShipment;
                }
                const originName = LOCATIONS_MAP[s.from]?.name || s.from;
                return {
                  ...s,
                  phase: 'ORIGIN_WAIT',
                  waitTimer: 5.0,
                  currentSegmentIndex: 0,
                  segmentProgress: 0.0,
                  progress: 0,
                  status: (isAir ? 'AIRPORT DOCKED' : 'PORT DOCKED') as ShipmentStatus,
                  waitMessage: isAir ? `At ${originName} Airport (5s)` : `At ${originName} Port (5s)`,
                };
              } else {
                const destName = LOCATIONS_MAP[s.to]?.name || s.to;
                const nextS: Shipment = {
                  ...s,
                  waitTimer: nextTimer,
                  status: 'DELIVERED' as ShipmentStatus,
                  waitMessage: `Delivered at ${destName} (${(nextTimer ?? 0).toFixed(0)}s)`,
                };
                nextS.currentCoord = evaluateShipmentPosition(nextS);
                return nextS;
              }
            }

            return s;
          });
        });
      }

      requestRef.current = requestAnimationFrame(animate);
    },
    [isSimulating, simulationSpeed, activeCrisis, triggerRandomCrisis]
  );

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const startSimulation = useCallback(() => setIsSimulating(true), []);
  const pauseSimulation = useCallback(() => setIsSimulating(false), []);
  const resumeSimulation = useCallback(() => setIsSimulating(true), []);

  const restartSimulation = useCallback(() => {
    setActiveCrises([]);
    setSelectedCrisisId(null);
    nextCrisisTimerRef.current = 18.0;
    const newShipments: Shipment[] = [];
    for (let i = 1; i <= 3; i++) {
      const s = generateRandomShipment(orderCounterRef.current + i);
      if (s) {
        newShipments.push(s);
      }
    }
    orderCounterRef.current += 3;
    setShipments(newShipments.length > 0 ? newShipments : createInitialShipments());
    setIsSimulating(true);
    setSelectedShipmentId(null);
  }, []);

  const addRandomShipment = useCallback((mode?: TransportMode) => {
    orderCounterRef.current += 1;
    const s = generateRandomShipment(orderCounterRef.current, mode);
    if (s) {
      setShipments((prev) => [...prev, s]);
    }
  }, []);

  const selectShipment = useCallback((id: string | null) => {
    setSelectedShipmentId(id);
  }, []);

  // ---------------------------------------------------------------------------
  // Cold-Chain & Tampering Simulation Actions
  // ---------------------------------------------------------------------------
  const injectTemperatureSpike = useCallback((shipmentId: string, spikeTemp = 9.6) => {
    broadcastWsEvent({ type: 'INJECT_TEMP_SPIKE', shipmentId, spikeTemp });
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            actualSensorTemp: spikeTemp,
            temperature: spikeTemp,
            // If carrier hasn't manipulated yet, reported temp follows sensor
            reportedTemp: s.isTemperatureManipulated ? s.reportedTemp : spikeTemp,
            status: 'AT RISK' as ShipmentStatus,
            riskLevel: 'CRITICAL' as RiskLevel,
            waitMessage: `⚠️ Temperature Excursion (+${spikeTemp}°C) Detected!`,
          };
        }
        return s;
      })
    );
  }, []);

  const breakCargoSeal = useCallback((shipmentId: string) => {
    broadcastWsEvent({ type: 'BREAK_CARGO_SEAL', shipmentId });
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          return {
            ...s,
            sealStatus: 'BROKEN' as const,
            reportedSealStatus: s.isSealManipulated ? s.reportedSealStatus : ('BROKEN' as const),
            status: 'AT RISK' as ShipmentStatus,
            riskLevel: 'HIGH' as RiskLevel,
            waitMessage: '🚨 Digital Container Seal Broken!',
          };
        }
        return s;
      })
    );
  }, []);

  const manipulateCarrierTelemetry = useCallback(
    (
      shipmentId: string,
      fakeTemp?: number,
      fakeSeal?: 'INTACT' | 'TAMPERED' | 'BROKEN',
      fakeBattery?: number,
      fakeShock?: number
    ) => {
      broadcastWsEvent({
        type: 'MANIPULATE_CARRIER_TELEMETRY',
        shipmentId,
        fakeTemp,
        fakeSeal,
        fakeBattery,
        fakeShock,
      });
      setShipments((prev) =>
        prev.map((s) => {
          if (s.id === shipmentId) {
            const updatedTemp = fakeTemp !== undefined ? fakeTemp : s.reportedTemp;
            const updatedSeal = fakeSeal !== undefined ? fakeSeal : s.reportedSealStatus;
            const updatedBattery = fakeBattery !== undefined ? fakeBattery : (s.reportedBatteryHours ?? s.reeferBatteryHours);
            const updatedShock = fakeShock !== undefined ? fakeShock : (s.reportedImpactShockG ?? s.impactShockG);

            return {
              ...s,
              reportedTemp: updatedTemp,
              isTemperatureManipulated: fakeTemp !== undefined ? true : s.isTemperatureManipulated,
              reportedSealStatus: updatedSeal,
              isSealManipulated: fakeSeal !== undefined ? true : s.isSealManipulated,
              reportedBatteryHours: updatedBattery,
              isBatteryManipulated: fakeBattery !== undefined ? true : s.isBatteryManipulated,
              reportedImpactShockG: updatedShock,
              isShockManipulated: fakeShock !== undefined ? true : s.isShockManipulated,
            };
          }
          return s;
        })
      );
    },
    []
  );

  const resetShipmentTelemetry = useCallback((shipmentId: string) => {
    broadcastWsEvent({ type: 'RESET_TELEMETRY', shipmentId });
    setShipments((prev) =>
      prev.map((s) => {
        if (s.id === shipmentId) {
          let nominalTemp = -20.42;
          if (s.cargoType === 'biologics') {
            nominalTemp = s.cargo.toLowerCase().includes('plasma') || s.cargo.toLowerCase().includes('immunotherapy') ? -20.03 : -20.42;
          } else if (s.cargoType === 'pharmaceutical') {
            nominalTemp = 4.01;
          } else if (s.cargoType === 'electronics') {
            nominalTemp = 21.20;
          } else if (s.cargoType === 'industrial') {
            nominalTemp = 19.80;
          } else if (s.cargoType === 'medical') {
            nominalTemp = 20.50;
          }

          return {
            ...s,
            actualSensorTemp: nominalTemp,
            temperature: nominalTemp,
            reportedTemp: nominalTemp,
            isTemperatureManipulated: false,
            sealStatus: 'INTACT' as const,
            reportedSealStatus: 'INTACT' as const,
            isSealManipulated: false,
            isBatteryManipulated: false,
            reportedBatteryHours: undefined,
            isShockManipulated: false,
            reportedImpactShockG: undefined,
            riskLevel: 'LOW' as RiskLevel,
            waitMessage: undefined,
          };
        }
        return s;
      })
    );
  }, []);

  const terminateAndRemoveShipment = useCallback((shipmentId: string) => {
    broadcastWsEvent({ type: 'TERMINATE_SHIPMENT', shipmentId });
    setShipments((prev) => {
      const filtered = prev.filter((s) => s.id !== shipmentId);
      if (filtered.length < 2) {
        orderCounterRef.current += 1;
        const newShipment = generateRandomShipment(orderCounterRef.current % 9000);
        if (newShipment) {
          return [...filtered, newShipment];
        }
      }
      return filtered;
    });

    setActiveCrises((prev) => prev.filter((c) => c.affectedShipmentId !== shipmentId));
  }, []);

  const verifyAndAcceptDelivery = useCallback(
    (shipmentId: string) => {
      const s = shipments.find((item) => item.id === shipmentId);
      if (!s) return { success: false, reason: 'Shipment not found' };

      const discrepancies: string[] = [];
      const tempDiff = Math.abs(s.actualSensorTemp - s.reportedTemp);

      // Check temperature fraud
      if (tempDiff > 0.5) {
        discrepancies.push(
          `Temperature Spoofing: Carrier reported ${s.reportedTemp}°C, but Immutable Hardware IoT Sensor recorded ${s.actualSensorTemp}°C.`
        );
      }

      // Check temperature breach beyond cold-chain threshold
      if (s.actualSensorTemp > s.targetTempRange.max || s.actualSensorTemp < s.targetTempRange.min) {
        discrepancies.push(
          `Cold-Chain Excursion: True temperature ${s.actualSensorTemp}°C breached allowable SLA window [${s.targetTempRange.min}°C - ${s.targetTempRange.max}°C].`
        );
      }

      // Check seal breach
      if (s.sealStatus !== 'INTACT' || s.reportedSealStatus !== s.sealStatus) {
        discrepancies.push(
          `Digital Seal Integrity Breach: Physical IoT lock is ${s.sealStatus} (Carrier claimed ${s.reportedSealStatus}).`
        );
      }

      if (discrepancies.length > 0) {
        // REJECT SHIPMENT & FREEZE ESCROW
        setShipments((prev) =>
          prev.map((item) => {
            if (item.id === shipmentId) {
              return {
                ...item,
                status: 'RECOVERED' as ShipmentStatus,
                escrowStatus: 'FROZEN' as const,
                riskLevel: 'CRITICAL' as RiskLevel,
                waitMessage: '❌ Custody Rejected: Cryptographic Integrity Breach',
              };
            }
            return item;
          })
        );
        broadcastWsEvent({ type: 'VERIFY_DELIVERY', shipmentId, success: false, discrepancies });
        return {
          success: false,
          reason: 'Cryptographic Hash Mismatch & Data Tampering Detected',
          discrepancies,
        };
      }

      // ACCEPT SHIPMENT & RELEASE ESCROW
      setShipments((prev) =>
        prev.map((item) => {
          if (item.id === shipmentId) {
            return {
              ...item,
              status: 'DELIVERED' as ShipmentStatus,
              escrowStatus: 'RELEASED' as const,
              progress: 100,
              waitMessage: '✓ Delivery Accepted & Escrow Released',
            };
          }
          return item;
        })
      );

      broadcastWsEvent({ type: 'VERIFY_DELIVERY', shipmentId, success: true, escrowReleasedUSD: s.escrowAmountUSD });
      return {
        success: true,
        escrowReleasedUSD: s.escrowAmountUSD,
      };
    },
    [shipments]
  );

  return (
    <SimulationContext.Provider
      value={{
        shipments,
        activeCrises,
        historicalCrises,
        activeCrisis,
        selectedCrisisId,
        isSimulating,
        selectedShipmentId,
        simulationSpeed,
        recoveryOptions,
        selectedRecoveryOptionId,
        previewOption,
        successfulRecoveriesCount,
        sentinelResult,
        sentinelStage,
        impactResult,
        impactAgentStatus,
        strategyResult,
        strategyAgentStatus,
        authorizedDecision,
        previewRecoveryOption,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        restartSimulation,
        setSimulationSpeed,
        selectShipment,
        selectCrisis,
        selectRecoveryOption,
        applyRecoveryOption,
        addRandomShipment,
        triggerRandomCrisis,
        triggerCrisisAtChokepoint,
        clearCrisis,
        clearAllCrises,
        injectTemperatureSpike,
        breakCargoSeal,
        manipulateCarrierTelemetry,
        resetShipmentTelemetry,
        terminateAndRemoveShipment,
        verifyAndAcceptDelivery,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
