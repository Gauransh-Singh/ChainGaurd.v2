import React, { useState, useMemo } from 'react';
import {
  Truck,
  RotateCcw,
  Radio,
  Sparkles,
  Plane,
  Ship,
  Database,
  Lock,
  Unlock,
  BatteryCharging,
  Activity,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCode2,
  CheckCircle2
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { GlobalSupplyChainMonitor } from '../components/GlobalSupplyChainMonitor';
import { RecoveryPlansPanel } from '../components/RecoveryPlansPanel';
import { LOCATIONS_MAP } from '../data/locations';

interface CarrierNodeProps {
  onNavigate?: (node: string) => void;
}

export const CarrierNode: React.FC<CarrierNodeProps> = ({ onNavigate }) => {
  const {
    shipments,
    activeCrises = [],
    selectedCrisisId,
    selectCrisis,
    manipulateCarrierTelemetry,
    resetShipmentTelemetry,
    injectTemperatureSpike,
    breakCargoSeal,
  } = useSimulation();

  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(
    shipments[0]?.id || 'ORD-5415'
  );

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

  // Form State for Manual Log Override
  const [fieldToFalsify, setFieldToFalsify] = useState<string>('temperature');
  const [falsifiedValue, setFalsifiedValue] = useState<string>(
    shipment.reportedTemp?.toFixed(2) || '-20.42'
  );
  const [fraudCommitted, setFraudCommitted] = useState<boolean>(false);

  // Accurate sensor compliance evaluation based on the specific cargo's target temperature range
  const minTemp = shipment.targetTempRange?.min ?? -25.0;
  const maxTemp = shipment.targetTempRange?.max ?? 8.0;
  const isTempOutOfSpec =
    shipment.actualSensorTemp < minTemp || shipment.actualSensorTemp > maxTemp;
  const isSealBreached = shipment.sealStatus !== 'INTACT';
  const isManipulated =
    shipment.isTemperatureManipulated ||
    shipment.isSealManipulated ||
    shipment.isBatteryManipulated ||
    shipment.isShockManipulated;

  const isSensorCompromised = isTempOutOfSpec || isSealBreached || isManipulated;

  const handleCommitFraud = () => {
    if (fieldToFalsify === 'temperature') {
      const parsed = parseFloat(falsifiedValue);
      if (!isNaN(parsed)) {
        manipulateCarrierTelemetry(
          shipment.id,
          parsed,
          undefined,
          undefined,
          undefined
        );
      }
    } else if (fieldToFalsify === 'seal') {
      const sealVal = falsifiedValue === 'BREACHED' || falsifiedValue === 'BROKEN' ? 'BROKEN' : 'INTACT';
      manipulateCarrierTelemetry(
        shipment.id,
        undefined,
        sealVal,
        undefined,
        undefined
      );
    } else if (fieldToFalsify === 'battery') {
      const parsed = parseInt(falsifiedValue);
      if (!isNaN(parsed)) {
        manipulateCarrierTelemetry(
          shipment.id,
          undefined,
          undefined,
          parsed,
          undefined
        );
      }
    } else if (fieldToFalsify === 'shock') {
      const parsed = parseFloat(falsifiedValue);
      if (!isNaN(parsed)) {
        manipulateCarrierTelemetry(
          shipment.id,
          undefined,
          undefined,
          undefined,
          parsed
        );
      }
    }
    setFraudCommitted(true);
    setTimeout(() => setFraudCommitted(false), 2500);
  };

  const handleResetTelemetry = () => {
    resetShipmentTelemetry(shipment.id);
    setFalsifiedValue(shipment.actualSensorTemp?.toFixed(2) || '-20.42');
  };

  // Quick Simulation Preset 1: Conceal Temperature Excursion
  const handlePresetTempSpikeConceal = () => {
    const spikeVal = shipment.cargoType === 'biologics' ? 6.8 : 14.5;
    injectTemperatureSpike(shipment.id, spikeVal);
    const nominalTarget = shipment.cargoType === 'biologics' ? -20.42 : 4.01;
    manipulateCarrierTelemetry(shipment.id, nominalTarget, 'INTACT', undefined, undefined);
    setFraudCommitted(true);
    setTimeout(() => setFraudCommitted(false), 2500);
  };

  // Quick Simulation Preset 2: Conceal Broken Seal
  const handlePresetSealBreachConceal = () => {
    breakCargoSeal(shipment.id);
    manipulateCarrierTelemetry(shipment.id, undefined, 'INTACT', undefined, undefined);
    setFraudCommitted(true);
    setTimeout(() => setFraudCommitted(false), 2500);
  };

  const originCity = LOCATIONS_MAP[shipment.from]?.name || shipment.from;
  const destCity = LOCATIONS_MAP[shipment.to]?.name || shipment.to;

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

  // Compute displayed values for KPI cards (Reflecting manual overrides and locking them)
  const displayedTemp = Number(
    shipment.isTemperatureManipulated
      ? (shipment.reportedTemp ?? shipment.actualSensorTemp ?? 0)
      : (shipment.actualSensorTemp ?? 0)
  );

  const displayedSeal = shipment.isSealManipulated
    ? (shipment.reportedSealStatus || 'INTACT')
    : (shipment.sealStatus || 'INTACT');

  const displayedBattery = Number(
    shipment.isBatteryManipulated
      ? (shipment.reportedBatteryHours ?? shipment.reeferBatteryHours ?? 142)
      : (shipment.reeferBatteryHours ?? 142)
  );

  const displayedShock = Number(
    shipment.isShockManipulated
      ? (shipment.reportedImpactShockG ?? shipment.impactShockG ?? 0.1)
      : (shipment.impactShockG ?? 0.1)
  );

  return (
    <div className="space-y-4">
      {/* 🗺️ Top Global Supply Chain Map */}
      <div className="w-full">
        <GlobalSupplyChainMonitor />
      </div>

      {/* 2-Column Grid: Left Sidebar (Consignments List) + Right Main Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar (3 cols): Carrier Fleet Dispatch Cockpit */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-[#0b1220] border border-[#18233c] rounded-2xl p-3.5 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="p-2 rounded-xl bg-blue-950/80 border border-blue-800/80 text-cyan-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-tight">
                  Carrier Fleet Dispatch Cockpit
                </h2>
                <p className="text-[10px] text-slate-400 font-mono">
                  Active Maritime &amp; Air Charters
                </p>
              </div>
            </div>

            {/* Consignments List */}
            <div className="space-y-2">
              {shipments.map((s) => {
                const isSelected = s.id === shipment.id;
                const hasCrisis = activeCrises.some(
                  (c) => c.affectedShipmentId === s.id
                );
                const sFrom = LOCATIONS_MAP[s.from]?.name || s.from;
                const sTo = LOCATIONS_MAP[s.to]?.name || s.to;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedShipmentId(s.id);
                      setFalsifiedValue(s.reportedTemp?.toFixed(2) || '0.00');
                      const cr = activeCrises.find(
                        (c) => c.affectedShipmentId === s.id
                      );
                      if (cr) {
                        selectCrisis(cr.id);
                      }
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
                          hasCrisis
                            ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                            : s.status === 'REROUTING'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {hasCrisis
                          ? 'DISRUPTED'
                          : s.status === 'REROUTING'
                          ? 'REROUTING'
                          : 'IN_TRANSIT'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 line-clamp-1 leading-snug">
                      {s.cargo}
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-0.5 border-t border-slate-800/60">
                      <span className="truncate max-w-[130px]">
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

        {/* Right Main Column (9 cols): IoT Telemetry + Exact Recovery Plans + Fraud Studio */}
        <div className="lg:col-span-9 space-y-4">
          {/* Active Consignment IoT Telemetry Panel */}
          <div className="bg-[#0b1220] border border-[#18233c] rounded-2xl p-5 shadow-xl space-y-4">
            {/* Header with Dynamic Cargo & Accurate Sensors Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h1 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Active Consignment IoT Telemetry (Order:</span>
                  <span className="font-mono text-cyan-400">[{shipment.id}]</span>
                  <span>)</span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  <span className="text-slate-200 font-semibold">{shipment.cargo}</span> •{' '}
                  <span className="text-cyan-300/90 font-mono">
                    {shipment.batchInfo || 'Batch: 120,000 Vials (45,000 Patients Dependent)'}
                  </span>
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 w-fit ${
                  isSensorCompromised
                    ? 'bg-red-950/80 border border-red-700 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSensorCompromised ? 'bg-red-400 animate-ping' : 'bg-emerald-400'
                  }`}
                />
                <span>{isSensorCompromised ? 'Sensors Compromised' : 'Sensors Compliant'}</span>
              </div>
            </div>

            {/* 4 Live Telemetry Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Storage Temperature */}
              <div className={`rounded-xl p-3.5 space-y-1.5 relative overflow-hidden border ${
                shipment.isTemperatureManipulated
                  ? 'bg-[#180e1a] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Core Storage Temp:
                  </span>
                  {shipment.isTemperatureManipulated ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>LOCKED</span>
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    shipment.isTemperatureManipulated
                      ? 'text-amber-300'
                      : isTempOutOfSpec
                      ? 'text-red-400 animate-pulse'
                      : 'text-cyan-400'
                  }`}
                >
                  {displayedTemp > 0
                    ? `+${(displayedTemp ?? 0).toFixed(2)}°C`
                    : `${(displayedTemp ?? 0).toFixed(2)}°C`}
                </div>
                <div className="text-[9px] font-mono text-slate-400 leading-tight">
                  {shipment.isTemperatureManipulated ? (
                    <span className="text-amber-400 font-semibold">
                      🔒 Manual Override • True: {(shipment.actualSensorTemp ?? 0).toFixed(2)}°C
                    </span>
                  ) : (
                    shipment.tempPolicyText || `Policy: ${minTemp}°C to ${maxTemp}°C SLA`
                  )}
                </div>
              </div>

              {/* Card 2: Container E-Seal */}
              <div className={`rounded-xl p-3.5 space-y-1.5 border ${
                shipment.isSealManipulated
                  ? 'bg-[#180e1a] border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Container E-Seal:
                  </span>
                  {shipment.isSealManipulated ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>LOCKED</span>
                    </span>
                  ) : displayedSeal === 'INTACT' ? (
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  )}
                </div>
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    shipment.isSealManipulated
                      ? 'text-amber-300'
                      : displayedSeal === 'INTACT'
                      ? 'text-emerald-400'
                      : 'text-red-400 animate-pulse'
                  }`}
                >
                  {displayedSeal === 'INTACT' ? 'LOCKED' : 'BREACHED'}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {shipment.isSealManipulated ? (
                    <span className="text-amber-400 font-semibold">
                      🔒 Falsified Record • True: {shipment.sealStatus}
                    </span>
                  ) : displayedSeal === 'INTACT' ? (
                    'Intrusion Sensor: Active'
                  ) : (
                    'Tamper Ingress Triggered'
                  )}
                </div>
              </div>

              {/* Card 3: Reefer Cryo-Battery */}
              <div className={`rounded-xl p-3.5 space-y-1.5 border ${
                shipment.isBatteryManipulated
                  ? 'bg-[#180e1a] border-amber-500/80'
                  : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Reefer Cryo-Battery:
                  </span>
                  {shipment.isBatteryManipulated ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>LOCKED</span>
                    </span>
                  ) : (
                    <BatteryCharging className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="text-2xl font-black font-mono text-amber-400 tracking-tight">
                  {displayedBattery}h
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {shipment.isBatteryManipulated ? (
                    <span className="text-amber-400 font-semibold">🔒 Manual Override Log</span>
                  ) : (
                    'Auxiliary Cryo-Power Reserve'
                  )}
                </div>
              </div>

              {/* Card 4: Drop / Impact Shock */}
              <div className={`rounded-xl p-3.5 space-y-1.5 border ${
                shipment.isShockManipulated
                  ? 'bg-[#180e1a] border-amber-500/80'
                  : 'bg-[#0e1628] border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 block">
                    Drop / Impact Shock:
                  </span>
                  {shipment.isShockManipulated ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500 text-[9px] font-mono font-bold text-amber-300 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>LOCKED</span>
                    </span>
                  ) : (
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <div
                  className={`text-2xl font-black font-mono tracking-tight ${
                    displayedShock > 2.0
                      ? 'text-red-400 animate-pulse'
                      : 'text-cyan-400'
                  }`}
                >
                  {(displayedShock ?? 0).toFixed(1)}g
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {shipment.isShockManipulated ? (
                    <span className="text-amber-400 font-semibold">🔒 Manual Override Log</span>
                  ) : (
                    '3-Axis Accelerometer (< 2.5g SLA)'
                  )}
                </div>
              </div>
            </div>

            {/* Corridor Summary Bar */}
            <div className="bg-[#080d18] border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <div>
                Carrier Corridor:{' '}
                <span className="text-cyan-300 font-bold">
                  {originCity} ➔ {destCity}
                </span>{' '}
                • Vessel:{' '}
                <span className="text-emerald-400 font-bold">
                  {shipment.vesselName || 'Maersk Cryo-Fleet Apex'}
                </span>
              </div>
              <div className="text-purple-300 font-bold">
                Smart Escrow: ${((shipment?.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD
              </div>
            </div>
          </div>

          {/* 🌟 EXACT GENERATED RECOVERY PLANS (Rendered only on active crisis) */}
          <RecoveryPlansPanel targetShipmentId={selectedShipmentId} />

          {/* 🚨 MANUAL DATABASE LOG OVERRIDE & INSIDER FRAUD STUDIO */}
          <div className="bg-[#12080f] border-2 border-rose-600/80 rounded-2xl p-5 shadow-2xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-900/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-400 shadow-lg shadow-rose-950/50">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Manual Database Log Override &amp; Insider Fraud Studio
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Simulate a rogue carrier altering local database logs to conceal temperature spikes or broken seals and fraudulently claim the ${((shipment?.escrowAmountUSD || 0) / 1000000).toFixed(2)}M USD Smart Escrow.
                  </p>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePresetTempSpikeConceal}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-[10px] font-mono text-rose-200 font-bold flex items-center gap-1 cursor-pointer active:scale-98 transition-all"
                  title="Inject high-temp excursion but conceal it in local logs"
                >
                  <Thermometer className="w-3 h-3 text-rose-400" />
                  <span>Conceal Temp Spike</span>
                </button>
                <button
                  type="button"
                  onClick={handlePresetSealBreachConceal}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-[10px] font-mono text-rose-200 font-bold flex items-center gap-1 cursor-pointer active:scale-98 transition-all"
                  title="Break container seal but keep local log marked as LOCKED"
                >
                  <Unlock className="w-3 h-3 text-rose-400" />
                  <span>Conceal Broken Seal</span>
                </button>
              </div>
            </div>

            {/* Custom Field Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 items-end font-sans">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[11px] font-mono text-slate-400 block">
                  Select Field to Falsify:
                </label>
                <select
                  value={fieldToFalsify}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFieldToFalsify(val);
                    if (val === 'temperature') {
                      setFalsifiedValue(shipment.reportedTemp?.toFixed(2) || '-20.42');
                    } else if (val === 'seal') {
                      setFalsifiedValue('LOCKED');
                    } else if (val === 'battery') {
                      setFalsifiedValue(String(shipment.reeferBatteryHours || 142));
                    } else if (val === 'shock') {
                      setFalsifiedValue(String(shipment.impactShockG || 0.1));
                    }
                  }}
                  className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="temperature">
                    🌡️ Temperature (Real: {shipment.actualSensorTemp > 0 ? `+${(shipment.actualSensorTemp ?? 0).toFixed(2)}` : (shipment.actualSensorTemp ?? 0).toFixed(2)}°C)
                  </option>
                  <option value="seal">
                    🔓 Container E-Seal (Real: {shipment.sealStatus === 'INTACT' ? 'LOCKED' : 'BREACHED'})
                  </option>
                  <option value="battery">
                    🔋 Reefer Battery ({shipment.reeferBatteryHours || 142}h)
                  </option>
                  <option value="shock">
                    ⚡ Drop / Impact Shock ({(shipment?.impactShockG ?? 0.1).toFixed(1)}g)
                  </option>
                </select>
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-mono text-slate-400 block">
                  Enter Falsified / Concealed Value:
                </label>
                {fieldToFalsify === 'seal' ? (
                  <select
                    value={falsifiedValue}
                    onChange={(e) => setFalsifiedValue(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-rose-500 font-bold"
                  >
                    <option value="LOCKED">🔒 LOCKED (Mark Seal as 100% Secure)</option>
                    <option value="BREACHED">🚨 BREACHED (Mark Seal as Tampered)</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={falsifiedValue}
                    onChange={(e) => setFalsifiedValue(e.target.value)}
                    placeholder={fieldToFalsify === 'temperature' ? '-20.42' : fieldToFalsify === 'battery' ? '142' : '0.10'}
                    className="w-full bg-[#0a0f1d] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none focus:border-rose-500 font-bold"
                  />
                )}
              </div>

              <div className="sm:col-span-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleCommitFraud}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-rose-950/60 cursor-pointer active:scale-98"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{fraudCommitted ? '✓ Fraud Committed' : 'Commit Fraud'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetTelemetry}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-all"
                  title="Reset to Authentic Sensor Feed"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cryptographic Comparison Banner */}
            {isManipulated && (
              <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-600/80 text-amber-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    ⚠️ <strong>Discrepancy Injected:</strong> KPI cards locked to Carrier DB claims while true IoT hardware stream records actual telemetry.
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-amber-900/80 border border-amber-500 text-amber-100 font-bold shrink-0">
                  Zero-Trust Gate will FREEZE Escrow
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
