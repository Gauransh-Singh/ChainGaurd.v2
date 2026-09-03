import React, { useState, useMemo } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { LOCATIONS_MAP } from '../data/locations';
import {
  ShieldCheck,
  BarChart3,
  Brain,
  RefreshCw,
  Cpu,
  ArrowRight,
  Package,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Shipment } from '../types/shipment';

export const AgentsView: React.FC = () => {
  const {
    shipments,
    activeCrises = [],
    selectedCrisisId,
    selectCrisis,
    sentinelResult,
    impactResult,
    strategyResult,
    successfulRecoveriesCount,
  } = useSimulation();

  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(
    shipments[0]?.id || 'ORD-5415'
  );

  const shipment: Shipment = useMemo(() => {
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

  const isMedicine =
    shipment.cargoType === 'biologics' ||
    shipment.cargoType === 'pharmaceutical' ||
    shipment.cargoType === 'medical';

  const crisis = activeCrises.find(
    (c) => c.affectedShipmentId === shipment.id
  );

  const originName = LOCATIONS_MAP[shipment.from]?.name || shipment.from;
  const destName = LOCATIONS_MAP[shipment.to]?.name || shipment.to;

  const getCargoIcon = (type?: string) => {
    switch (type) {
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

  return (
    <div className="max-w-[1280px] mx-auto space-y-5 animate-in fade-in duration-300 font-sans pb-10">
      {/* 🔹 Clean Header with Shipment Selector */}
      <div className="bg-[#0b1220] border border-[#18233c] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">AI Agent Pipeline</h1>
            <p className="text-xs text-slate-400 font-mono">
              Autonomous multi-agent orchestration for active shipments
            </p>
          </div>
        </div>

        {/* Dropdown to pick consignment */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-slate-400 shrink-0">Inspect Shipment:</label>
          <select
            value={selectedShipmentId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedShipmentId(newId);
              const cr = activeCrises.find((c) => c.affectedShipmentId === newId);
              if (cr) selectCrisis(cr.id);
            }}
            className="bg-[#0e1628] border border-slate-700 text-cyan-300 text-xs font-mono font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {shipments.map((s) => {
              const isMed = s.cargoType === 'biologics' || s.cargoType === 'pharmaceutical' || s.cargoType === 'medical';
              return (
                <option key={s.id} value={s.id}>
                  {getCargoIcon(s.cargoType)} [{s.id}] {s.cargo} {isMed ? '(🚨 Priority: Medicine)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 🔹 Selected Shipment Summary Card */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isMedicine
          ? 'bg-[#120810] border-rose-800/80 shadow-lg shadow-rose-950/30'
          : 'bg-[#0b1220] border-[#18233c]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getCargoIcon(shipment.cargoType)}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-400 text-sm font-bold">[{shipment.id}]</span>
                <span className="text-white font-bold text-sm">{shipment.cargo}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {originName} ➔ {destName} • {shipment.mode.toUpperCase()} ({shipment.vesselName || 'Charter'}) • ${((shipment.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD Escrow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
                isMedicine
                  ? 'bg-rose-950 text-rose-300 border-rose-600'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}
            >
              {isMedicine ? '🚨 Priority 1: Critical Medicine SLA' : '📦 Priority 2: Commercial'}
            </span>
          </div>
        </div>
      </div>

      {/* 🔹 4 Clean Agent Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Sentinel Agent */}
        <div className="bg-[#0b1220] border border-[#18233c] hover:border-emerald-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">1. Sentinel Agent</h2>
                <p className="text-[11px] text-slate-400 font-mono">Threat &amp; Anomaly Detection</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
              {crisis ? 'Threat Verified' : 'Monitoring Active'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed">
              {crisis
                ? `Detected corridor threat "${crisis.title}". Verified threat confidence at 100%. ${
                    isMedicine
                      ? 'Elevated to Priority 1 Triage (Critical Medicine / Vaccine).'
                      : 'Classified under Priority 2 Commercial SLA.'
                  }`
                : `Monitoring real-time GPS, AIS transponders, and temperature micro-oscillations. Telemetry is 100% nominal.`}
            </p>

            <div className="bg-[#070b14] p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Sensor Health: <strong className="text-emerald-400">{(shipment.actualSensorTemp || 0).toFixed(2)}°C Nominal</strong></span>
              <span className={isMedicine ? 'text-rose-400 font-bold' : 'text-cyan-300 font-bold'}>
                {isMedicine ? 'P1 Medicine Priority' : 'P2 Commercial'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Impact Agent */}
        <div className="bg-[#0b1220] border border-[#18233c] hover:border-purple-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">2. Impact Assessment Agent</h2>
                <p className="text-[11px] text-slate-400 font-mono">Physics Delay &amp; Cost Modeling</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-700">
              {crisis ? 'Impact Calculated' : 'Zero Delay'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed">
              {crisis
                ? `Calculated transit physics (${shipment.mode === 'air' ? '845 km/h Air' : '24 km/h Sea'}). Estimated +6.5 days delay and +₹3.9L demurrage. ${
                    isMedicine
                      ? 'Flagged 45,000 dependent patients at risk if cryo battery (142h) depletes.'
                      : 'Modeled commercial delivery lead-time buffer.'
                  }`
                : `Calculated zero delay. Vessel on schedule to arrive at ${destName} within designated SLA window.`}
            </p>

            <div className="bg-[#070b14] p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>ETA Impact: <strong className={crisis ? 'text-rose-400' : 'text-slate-200'}>{crisis ? '+6.5 Days' : '0.0h'}</strong></span>
              <span>Demurrage: <strong className={crisis ? 'text-amber-400' : 'text-slate-200'}>{crisis ? '+₹3.9L' : '₹0'}</strong></span>
            </div>
          </div>
        </div>

        {/* 3. Strategy Agent */}
        <div className="bg-[#0b1220] border border-[#18233c] hover:border-cyan-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">3. Strategy Engine Agent</h2>
                <p className="text-[11px] text-slate-400 font-mono">Detour &amp; Recovery Discovery</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              {crisis ? 'Options Generated' : 'Standby'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed">
              {crisis
                ? `Traversed global 17-hub routing graph. Generated 3 recovery alternatives. ${
                    isMedicine
                      ? 'Prioritized Option A (Air Express Detour, 26.1 days faster) with score 96/100 to eliminate cold-chain risk.'
                      : 'Generated Option A (Maritime Cape Detour) with score 78/100.'
                  }`
                : `Primary corridor is clear. Standby recovery alternatives mapped across connected network nodes.`}
            </p>

            <div className="bg-[#070b14] p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Recommended Plan:</span>
              <strong className="text-cyan-300">
                {crisis ? (isMedicine ? '✈️ Option A: Air Fast Bridge' : '🚢 Option A: Cape Detour') : 'Primary Route'}
              </strong>
            </div>
          </div>
        </div>

        {/* 4. Recovery Agent */}
        <div className="bg-[#0b1220] border border-[#18233c] hover:border-amber-500/50 rounded-2xl p-5 space-y-3 transition-all shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">4. Recovery &amp; Execution Agent</h2>
                <p className="text-[11px] text-slate-400 font-mono">Autonomous Dispatch &amp; Blockchain</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
              {shipment.status === 'REROUTING' || shipment.status === 'DELIVERED' ? 'Dispatched' : 'Ready'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <p className="text-slate-300 leading-relaxed">
              {shipment.status === 'REROUTING'
                ? `Carrier dispatched along approved green recovery corridor. Consensus decision notarized on Block #14,897. Consignee hospital updated with new ETA.`
                : `Escrow contract ($${((shipment.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD) synchronized. Autonomous dispatch ready upon human approval.`}
            </p>

            <div className="bg-[#070b14] p-2.5 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>On-Chain Notary: <strong className="text-amber-300">Block #14,897 (Valid)</strong></span>
              <span>Total Recoveries: <strong className="text-white">{successfulRecoveriesCount}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
