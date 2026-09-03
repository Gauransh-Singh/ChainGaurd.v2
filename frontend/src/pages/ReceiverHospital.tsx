import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { LOCATIONS_MAP } from '../data/locations';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Thermometer,
  DollarSign,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  Clock,
  RotateCcw,
  Check,
  Hourglass,
  Package,
  Activity,
  BatteryCharging,
  Truck,
  Plane,
  Ship,
  FileBadge,
  UserCheck
} from 'lucide-react';

interface ReceiverHospitalProps {
  onNavigate?: (tab: string) => void;
}

export const ReceiverHospital: React.FC<ReceiverHospitalProps> = ({ onNavigate }) => {
  const { shipments, verifyAndAcceptDelivery, terminateAndRemoveShipment, resetShipmentTelemetry } = useSimulation();

  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(
    shipments[0]?.id || 'ORD-5415'
  );
  const [customsClearedLocal, setCustomsClearedLocal] = useState<boolean>(true);
  const [auditRun, setAuditRun] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<{
    success: boolean;
    reason?: string;
    discrepancies?: string[];
    escrowReleasedUSD?: number;
  } | null>(null);

  const shipment = useMemo(() => {
    return (
      shipments.find((s) => s.id === selectedShipmentId) ||
      shipments[0] || {
        id: 'ORD-5415',
        cargo: 'Cryogenic mRNA Vaccine Serum',
        cargoType: 'biologics',
        from: 'PVG',
        to: 'RTM',
        mode: 'sea',
        actualSensorTemp: -20.42,
        reportedTemp: -20.42,
        isTemperatureManipulated: false,
        sealStatus: 'INTACT',
        reportedSealStatus: 'INTACT',
        isSealManipulated: false,
        escrowAmountUSD: 2400000,
        tempPolicyText: 'Policy: -20.4°C (-25°C to -15°C Ultra-Cold Deep Freeze)',
        batchInfo: 'Batch: 120,000 Vials (45,000 Patients Dependent)',
        clinicalPriority: 'Critical Clinical Allocation - Deep Freeze Cryo Transit',
        reeferBatteryHours: 142,
        impactShockG: 0.10,
        targetTempRange: { min: -25.0, max: -15.0 },
      }
    );
  }, [shipments, selectedShipmentId]);

  // Product-specific HS codes
  const getHsCode = (cargoType?: string) => {
    switch (cargoType) {
      case 'biologics':
        return 'HS Code: 3002.20.00 (Human Vaccines & Recombinant Biologics)';
      case 'pharmaceutical':
        return 'HS Code: 3004.90.00 (Medicaments & Hospital Formulations)';
      case 'electronics':
        return 'HS Code: 8542.31.00 (Integrated Circuits & Semiconductor Wafers)';
      case 'industrial':
        return 'HS Code: 8507.60.00 (Lithium-Ion Energy Storage Modules)';
      default:
        return 'HS Code: 9018.90.00 (Medical & Clinical Diagnostic Goods)';
    }
  };

  const getCargoIcon = (cargoType?: string) => {
    switch (cargoType) {
      case 'biologics':
        return '💉';
      case 'pharmaceutical':
        return '🧪';
      case 'electronics':
        return '⚡';
      case 'industrial':
        return '🔋';
      default:
        return '📦';
    }
  };

  // Zero-Trust Audit Evaluation Logic
  const minTemp = shipment.targetTempRange?.min ?? -25.0;
  const maxTemp = shipment.targetTempRange?.max ?? 8.0;
  const tempDiff = Math.abs(shipment.actualSensorTemp - shipment.reportedTemp);
  const isTempSpoofed = tempDiff > 0.5;
  const isTempExcursion =
    shipment.actualSensorTemp < minTemp || shipment.actualSensorTemp > maxTemp;
  const isTempPass = !isTempSpoofed && !isTempExcursion;

  const isSealPass =
    shipment.sealStatus === 'INTACT' && shipment.reportedSealStatus === 'INTACT';
  const isCustomsPass = shipment.customsCleared ?? customsClearedLocal;
  const isHashChainPass =
    !shipment.isTemperatureManipulated && !shipment.isSealManipulated;

  const allPass = isTempPass && isSealPass && isCustomsPass && isHashChainPass;

  const handleReleaseEscrow = () => {
    setAuditRun(true);
    const result = verifyAndAcceptDelivery(shipment.id);
    setAuditResult(result);
  };

  const handleRejectAndTerminate = () => {
    setAuditRun(true);
    const result = verifyAndAcceptDelivery(shipment.id);
    setAuditResult(result);

    // Terminate and permanently remove the compromised consignment from active list
    setTimeout(() => {
      const remaining = shipments.filter((s) => s.id !== shipment.id);
      terminateAndRemoveShipment(shipment.id);
      if (remaining.length > 0) {
        setSelectedShipmentId(remaining[0].id);
      }
      setAuditRun(false);
      setAuditResult(null);
    }, 1500);
  };

  const handleReset = () => {
    resetShipmentTelemetry(shipment.id);
    setAuditRun(false);
    setAuditResult(null);
  };

  const originCity = LOCATIONS_MAP[shipment.from]?.name || shipment.from;
  const destCity = LOCATIONS_MAP[shipment.to]?.name || shipment.to;

  return (
    <div className="space-y-4 max-w-[1780px] mx-auto pb-8 font-sans animate-in fade-in duration-300">
      {/* 2-Column Grid: Left Sidebar (Inbound Consignments) + Right Verification Gate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar (3 cols): Inbound Consignments Cockpit */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#0b1220] border border-[#18233c] rounded-2xl p-3.5 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  Inbound Consignments
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Zero-Trust Verification Gate
                </p>
              </div>
            </div>

            {/* Consignments List */}
            <div className="space-y-2">
              {shipments.map((s) => {
                const isSelected = s.id === shipment.id;
                const isDelivered = s.status === 'DELIVERED';
                const isRejected = s.status === 'RECOVERED';
                const sFrom = LOCATIONS_MAP[s.from]?.name || s.from;
                const sTo = LOCATIONS_MAP[s.to]?.name || s.to;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedShipmentId(s.id);
                      setAuditRun(false);
                      setAuditResult(null);
                    }}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[#101b33] border-cyan-500 shadow-lg shadow-cyan-950/50'
                        : 'bg-[#0e1628] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
                        <span>{getCargoIcon(s.cargoType)}</span>
                        <span>{s.id}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          isDelivered
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : isRejected
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {isDelivered
                          ? 'ACCEPTED'
                          : isRejected
                          ? 'FROZEN'
                          : 'IN_TRANSIT'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 line-clamp-1 leading-snug">
                      {s.cargo}
                    </div>

                    <div className="flex items-center justify-between pt-0.5 text-[10px] font-mono border-t border-slate-800/60">
                      <span className="text-slate-400 truncate max-w-[125px]">
                        {sFrom} ➔ {sTo}
                      </span>
                      <span className="text-cyan-400 font-bold">
                        {s.actualSensorTemp > 0
                          ? `+${(s.actualSensorTemp ?? 0).toFixed(1)}°C`
                          : `${(s.actualSensorTemp ?? 0).toFixed(1)}°C`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Main Column (9 cols): Inbound Details + Audit Checklist + Settlement */}
        <div className="lg:col-span-9 space-y-4">
          {/* Inbound Consignment Header Card */}
          <div className="bg-[#0b1220] border border-[#18233c] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="font-mono text-cyan-400">[{shipment.id}]</span>
                  <span>{shipment.cargo}</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  <span className="text-slate-200 font-semibold">
                    {shipment.batchInfo || 'Batch: 120,000 Vials (45,000 Patients Dependent)'}
                  </span>{' '}
                  •{' '}
                  <span className="text-cyan-300/90 font-mono">
                    Priority: {shipment.clinicalPriority || 'Clinical Allocation'}
                  </span>
                </p>
              </div>

              <div className="text-right sm:shrink-0">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Smart Escrow Settlement Fund
                </span>
                <span className="text-2xl font-black font-mono text-cyan-400 tracking-tight">
                  ${shipment.escrowAmountUSD.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* 4 Live Received Telemetry Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Core Temp */}
              <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 space-y-1.5 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Received Core Temp:
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isTempPass ? 'bg-cyan-400 animate-pulse' : 'bg-rose-400 animate-ping'
                    }`}
                  />
                </div>
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    isTempPass ? 'text-cyan-400' : 'text-rose-400 animate-pulse'
                  }`}
                >
                  {shipment.actualSensorTemp > 0
                    ? `+${(shipment.actualSensorTemp ?? 0).toFixed(2)}°C`
                    : `${(shipment.actualSensorTemp ?? 0).toFixed(2)}°C`}
                </div>
                <div className="text-[9px] font-mono text-slate-400 leading-tight">
                  {shipment.tempPolicyText ||
                    `Target: ${minTemp}°C to ${maxTemp}°C SLA`}
                </div>
              </div>

              {/* Card 2: Container E-Seal */}
              <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Container E-Seal:
                  </span>
                  {isSealPass ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  )}
                </div>
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    isSealPass ? 'text-emerald-400' : 'text-rose-400 animate-pulse'
                  }`}
                >
                  {shipment.sealStatus === 'INTACT' ? 'LOCKED' : 'BREACHED'}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {isSealPass ? 'Intrusion Guard: Secure' : 'Physical Tamper Ingress Detected'}
                </div>
              </div>

              {/* Card 3: Reefer Cryo Battery */}
              <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Reefer Cryo Battery:
                  </span>
                  <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                  {shipment.reeferBatteryHours || 142}h
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  Dual Cryo-Compressors Nominal
                </div>
              </div>

              {/* Card 4: Impact Shock */}
              <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Cumulative Shock:
                  </span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    (shipment.impactShockG || 0.1) > 2.0
                      ? 'text-rose-400 animate-pulse'
                      : 'text-cyan-400'
                  }`}
                >
                  {(shipment?.impactShockG ?? 0.1).toFixed(1)}g
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  3-Axis Vibration Sensor (&lt; 2.5g SLA)
                </div>
              </div>
            </div>

            {/* 4-Step Milestone Stepper Tracker */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              {/* Step 1 */}
              <div className="bg-[#0e1628] border border-emerald-900/60 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Formulation Hub</span>
                </div>
                <div className="text-[10px] text-slate-400">{originCity} Origin</div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#0e1628] border border-emerald-900/60 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Multi-Modal Transit</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {shipment.vesselName || 'Maritime / Air Corridor'}
                </div>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => setCustomsClearedLocal(!customsClearedLocal)}
                className={`p-3 rounded-xl space-y-1 border cursor-pointer transition-all ${
                  isCustomsPass
                    ? 'bg-[#0e1628] border-emerald-900/60 hover:border-emerald-700'
                    : 'bg-[#180a12] border-amber-900/80 hover:border-amber-700'
                }`}
                title="Click to toggle customs stamp status"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center gap-1.5 font-bold text-[11px] ${
                      isCustomsPass ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {isCustomsPass ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Hourglass className="w-3.5 h-3.5" />
                    )}
                    <span>Customs Clearance</span>
                  </div>
                  <span className="text-[9px] text-slate-400 underline">toggle</span>
                </div>
                <div className="text-[10px] text-slate-400">{destCity} Customs Dock</div>
              </div>

              {/* Step 4 */}
              <div
                className={`p-3 rounded-xl space-y-1 border ${
                  shipment.status === 'DELIVERED'
                    ? 'bg-[#0e1628] border-emerald-900/60 text-emerald-400'
                    : shipment.status === 'RECOVERED'
                    ? 'bg-[#180a12] border-rose-900/80 text-rose-400'
                    : 'bg-[#0e1628] border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Dock Receipt &amp; Escrow</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  {shipment.status === 'DELIVERED'
                    ? 'Settled on Block #14,897'
                    : shipment.status === 'RECOVERED'
                    ? 'Frozen on Block #14,898'
                    : 'Awaiting Gate Audit'}
                </div>
              </div>
            </div>

            {/* 🛡️ Consignee Pre-Acceptance Cryptographic Audit Checklist */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Consignee Pre-Acceptance Cryptographic Audit Checklist</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  4-Point Cryptographic Gate
                </div>
              </div>

              <div className="space-y-2">
                {/* Item 1: Continuous Storage & Temperature Compliance */}
                <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      1. Continuous Product Storage &amp; Temperature SLA Compliance
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {shipment.tempPolicyText ||
                        `Target SLA: ${minTemp}°C to ${maxTemp}°C`}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    {isTempPass ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PASS ({shipment.actualSensorTemp > 0 ? `+${(shipment.actualSensorTemp ?? 0).toFixed(2)}` : (shipment.actualSensorTemp ?? 0).toFixed(2)}°C)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>FAIL ({isTempSpoofed ? 'SPOOF DETECTED' : 'EXCURSION'})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Item 2: Physical Electronic Container Seal (E-Seal) */}
                <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      2. Physical Electronic Container Seal (E-Seal)
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Zero unauthorized physical ingress or door opening (RFID Guard)
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    {isSealPass ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PASS (SEAL INTACT)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        <span>FAIL (SEAL BREACHED)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Item 3: Customs Clearance Stamp */}
                <div className="bg-[#0e1628] border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      3. Port Customs Digital Clearance Stamp
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {getHsCode(shipment.cargoType)}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    {isCustomsPass ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>PASS (STAMP VERIFIED)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-700 text-xs font-mono font-bold flex items-center gap-1.5">
                        <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                        <span>PENDING CUSTOMS STAMP</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Item 4: SHA-256 Merkle Hash-Chain & Hardware Key Proof */}
                <div className={`rounded-xl p-3.5 border transition-all ${
                  isHashChainPass
                    ? 'bg-[#0e1628] border-slate-800'
                    : 'bg-[#18080f] border-2 border-rose-600 shadow-[0_0_20px_rgba(239,68,68,0.25)] space-y-3'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <span>4. SHA-256 Merkle Hash-Chain &amp; Hardware Key Proof</span>
                        {!isHashChainPass && (
                          <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 text-[10px] font-mono font-bold animate-pulse">
                            🚨 Hash Divergence Detected
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        {isHashChainPass
                          ? 'Device ECDSA root signature matches immutable ledger block #14,895'
                          : 'Carrier payload hash diverges from immutable hardware Genesis root on block #14,895'}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0">
                      {isHashChainPass ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-xs font-mono font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>PASS (100% IMMUTABLE)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950 text-rose-200 border border-rose-600 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>FAIL (HASH MISMATCH)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ONLY DISPLAY SIDE-BY-SIDE HASH COMPARISON WHEN A CHANGE HAS OCCURRED */}
                  {!isHashChainPass && (() => {
                    const oldGenesisHash = shipment.blockchainSensorHash || '0x8f2a4c9b1e7d3f0a5b8c2e4d6f1a3b5c7e9f0a2b4c6d8e0f1a3b5c7e9f0a2b4c';
                    const fakeSeed = `${shipment.id}-${shipment.reportedTemp}-${shipment.reportedSealStatus}`;
                    const currentClaimedHash = '0x' + Array.from(fakeSeed + 'MUTATED_PAYLOAD_14898')
                      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
                      .join('')
                      .padEnd(64, 'f')
                      .slice(0, 64);

                    return (
                      <div className="pt-2 border-t border-rose-900/50 space-y-2.5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between text-[11px] font-mono text-rose-300">
                          <span className="flex items-center gap-1.5 font-bold">
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                            <span>Forensic Hash Discrepancy Evidence (Block #14,898):</span>
                          </span>
                          <span className="text-slate-400">Zero-Trust Fraud Trigger</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Box A: Old Authentic Genesis Hash */}
                          <div className="bg-[#0b1220] border border-emerald-800/80 rounded-xl p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>OLD AUTHENTIC MERKLE HASH</span>
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                Block #14,895 (Genesis)
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-[#040810] border border-emerald-900/60 text-[11px] font-mono text-emerald-300 break-all leading-relaxed select-all">
                              {oldGenesisHash}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5">
                              <span>Origin: <strong className="text-slate-200">{originCity} Secure Hub</strong></span>
                              <span className="text-emerald-400 font-bold">✓ True Hardware Root</span>
                            </div>
                          </div>

                          {/* Box B: Current Mutated Claimed Hash */}
                          <div className="bg-[#120409] border border-rose-700 rounded-xl p-3 space-y-1.5 shadow-lg shadow-rose-950/60">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-rose-400 font-bold flex items-center gap-1">
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                                <span>CURRENT MUTATED HASH</span>
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">
                                Intake Delivery (Tampered)
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-[#080204] border border-rose-800 text-[11px] font-mono text-rose-300 font-bold break-all leading-relaxed select-all">
                              {currentClaimedHash}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
                              <span className="text-slate-300">Carrier Claim: <strong className="text-rose-300">{(shipment.reportedTemp ?? 0).toFixed(2)}°C / {shipment.reportedSealStatus}</strong></span>
                              <span className="text-rose-400 font-bold animate-pulse">🚨 Mismatch Verified</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom Action & Settlement Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="text-xs font-mono text-slate-400">
                Authorized Consignee Officer:{' '}
                <span className="text-cyan-300 font-bold">
                  Dr. Aris Thorne (Intake Depository Hub)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Status Pill */}
                {allPass ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Ready for Settlement</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                    <span>
                      Locked:{' '}
                      {isTempSpoofed
                        ? 'Data Tampering Detected'
                        : !isCustomsPass
                        ? 'Customs Pending'
                        : 'SLA Excursion'}
                    </span>
                  </div>
                )}

                {/* Main Settlement Action Button */}
                {allPass ? (
                  <button
                    type="button"
                    onClick={handleReleaseEscrow}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/60 cursor-pointer active:scale-98"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>
                      Release Escrow (${((shipment?.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD)
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRejectAndTerminate}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs font-mono flex items-center gap-1.5 transition-all shadow-lg shadow-rose-950/60 cursor-pointer active:scale-98"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Consignment &amp; Freeze Escrow</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-all"
                  title="Reset Consignment State"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audit Execution Pop-Up Feedback */}
            {auditRun && auditResult && (
              <div className="animate-in fade-in zoom-in-95 pt-2">
                {auditResult.success ? (
                  <div className="bg-[#0d1a15] border-2 border-emerald-500 rounded-xl p-3.5 space-y-1 text-xs font-sans shadow-2xl shadow-emerald-950/50">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>✓ ZERO-TRUST AUDIT PASSED: 100% AUTHENTIC &amp; CLINICALLY SAFE</span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      All carrier logs match immutable blockchain SHA-256 roots. Temperature held constant within SLA window. Smart-contract escrow of <strong>${((shipment?.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD</strong> has been released to carrier on <strong>Block #14,897</strong>.
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#1a0c10] border-2 border-rose-500 rounded-xl p-3.5 space-y-2 text-xs font-sans shadow-2xl shadow-rose-950/50">
                    <div className="flex items-center gap-2 text-rose-400 font-bold font-mono">
                      <AlertOctagon className="w-5 h-5 animate-bounce" />
                      <span>🚨 CRYPTOGRAPHIC FRAUD &amp; INTEGRITY BREACH DETECTED</span>
                    </div>
                    <ul className="space-y-1 text-slate-200 text-xs list-disc pl-4 font-sans">
                      {auditResult.discrepancies?.map((d, i) => (
                        <li key={i} className="text-rose-300 font-semibold">
                          {d}
                        </li>
                      ))}
                    </ul>
                    <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-700 text-[11px] font-mono text-rose-200">
                      ❌ Consignment Rejected. Smart-contract escrow of ${((shipment?.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD is <strong>FROZEN</strong>. Fraud notarized on-chain (Block #14,898).
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
