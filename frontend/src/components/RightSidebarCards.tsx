import React, { useState } from 'react';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Plus,
  FastForward,
  Ship,
  Plane,
  Flame,
  CheckCircle,
  Clock,
  Navigation,
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { LOCATIONS_MAP } from '../utils/routingEngine';

export const CriticalAlertCard: React.FC<{ onViewDisruption?: () => void }> = () => {
  const {
    activeCrises = [],
    selectedCrisisId,
    selectCrisis,
    clearCrisis,
    triggerRandomCrisis,
    shipments,
    selectShipment,
    recoveryOptions = [],
    sentinelResult,
    impactResult,
  } = useSimulation();

  if (activeCrises.length > 0) {
    const currentCrisis = activeCrises.find((c) => c.id === selectedCrisisId) || activeCrises[0];
    const affectedShipment = shipments.find((s) => s.id === currentCrisis.affectedShipmentId);
    const originName = LOCATIONS_MAP[affectedShipment?.from || '']?.name || affectedShipment?.from || '';
    const destinationName = LOCATIONS_MAP[affectedShipment?.to || '']?.name || affectedShipment?.to || '';
    const routeDisplay = originName && destinationName ? `${originName} ➔ ${destinationName}` : currentCrisis.locationName;

    const blockedFrom = LOCATIONS_MAP[currentCrisis.affectedSegment?.from || '']?.name || currentCrisis.affectedSegment?.from || '';
    const blockedTo = LOCATIONS_MAP[currentCrisis.affectedSegment?.to || '']?.name || currentCrisis.affectedSegment?.to || '';
    const corridorDisplay = blockedFrom && blockedTo ? `${blockedFrom} ➔ ${blockedTo}` : currentCrisis.locationName;

    // Retrieve live impact assessment for this specific shipment
    const activeImpact = (impactResult && impactResult.shipmentId === currentCrisis.affectedShipmentId)
      ? impactResult
      : null;

    const delayDisplay = activeImpact?.delayFormatted || currentCrisis.etaImpact || '+4.8 Days';
    const costDisplay = activeImpact?.costFormatted || '+₹3.5L';
    const riskLevelDisplay = activeImpact?.riskLevel || (currentCrisis.riskScore >= 80 ? 'HIGH' : 'MEDIUM');
    const cargoStatusDisplay = activeImpact?.cargoStatus || (affectedShipment?.status === 'AT RISK' ? 'AT RISK' : 'AT RISK');
    const operationalStatusDisplay = activeImpact?.operationalStatus || currentCrisis.status || 'ROUTE BLOCKED';

    return (
      <div className="bg-[#12090d] border-2 border-red-500/80 rounded-2xl p-4 shadow-[0_0_25px_rgba(239,68,68,0.25)] space-y-3 animate-in fade-in zoom-in-95">
        {/* Header: Title + Active Crisis Count Badge */}
        <div className="flex items-center justify-between border-b border-red-900/60 pb-2">
          <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>🚨 CRITICAL DISRUPTION</span>
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-500 text-[10px] font-mono text-red-300 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            {activeCrises.length} {activeCrises.length === 1 ? 'Crisis' : 'Crises'}
          </span>
        </div>

        {/* Multi-Crisis Tab Switcher (Visible when > 1 Crisis Active) */}
        {activeCrises.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeCrises.map((c) => {
              const isSelected = c.id === currentCrisis.id;
              const sTarget = shipments.find((s) => s.id === c.affectedShipmentId);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    selectCrisis(c.id);
                  }}
                  className={`flex-1 min-w-[90px] py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-red-900/70 border-red-400 text-white shadow-md shadow-red-950/60'
                      : 'bg-red-950/30 border-red-900/40 text-red-300/70 hover:bg-red-950/60 hover:text-red-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-red-400 animate-pulse' : 'bg-red-600'}`} />
                  <span>{c.affectedShipmentId}</span>
                  <span className="text-[10px]">{sTarget?.mode === 'air' ? '✈️' : '🚢'}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Crisis Summary */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-300 font-mono font-semibold">
            <span className="flex items-center gap-1">
              <span>{affectedShipment?.mode === 'air' ? '✈️' : '🚢'}</span>
              <span>{currentCrisis.affectedShipmentId}</span>
            </span>
            <span className="text-[10px] text-slate-300">
              📍 {routeDisplay}
            </span>
          </div>
          <div className="text-sm font-bold text-white tracking-tight">{currentCrisis.title}</div>
          <div className="text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
            <span>Cargo:</span>
            <span className="text-amber-300 font-semibold">{affectedShipment?.cargo}</span>
          </div>
        </div>

        {/* 📊 IMPACT ANALYSIS BREAKDOWN */}
        <div className="bg-[#18090f] border border-red-900/60 rounded-xl p-2.5 space-y-2 font-mono text-[10px]">
          <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between border-b border-red-900/40 pb-1">
            <span>📊 Impact Analysis</span>
            <span className="text-purple-300">Agent 2 Verified ✓</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-200">
            <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-red-950">
              <span className="text-slate-400">⏱ Delay:</span>
              <span className="font-bold text-amber-300">{delayDisplay}</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-red-950">
              <span className="text-slate-400">💰 Cost:</span>
              <span className="font-bold text-cyan-300">{costDisplay}</span>
            </div>
            <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-red-950">
              <span className="text-slate-400">🛡 Risk:</span>
              <span className={`font-bold ${riskLevelDisplay === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                {riskLevelDisplay}
              </span>
            </div>
            <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-red-950">
              <span className="text-slate-400">📦 Cargo:</span>
              <span className="font-bold text-red-300">{cargoStatusDisplay}</span>
            </div>
          </div>

          {/* Operational Status Tag */}
          <div className="flex items-center justify-between pt-0.5 text-[9px]">
            <span className="text-slate-400">Corridor Status:</span>
            <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-500 text-red-300 font-bold">
              🔴 {operationalStatusDisplay}
            </span>
          </div>
        </div>

        {/* Handoff to Strategy Agent Banner */}
        <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-center space-y-0.5 font-mono">
          <div className="text-[10px] font-bold text-purple-300 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Impact Agent ✓ Complete ➔ Ready for Strategy</span>
          </div>
          <div className="text-[8px] text-slate-400 font-sans">
            Alternative recovery plans generated under the global map.
          </div>
        </div>

        {/* Footer actions: Clear & Add Crisis */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={() => triggerRandomCrisis()}
            className="py-1.5 px-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-600/50 text-red-200 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
            title="Trigger another crisis on another shipment"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>+ Add Crisis</span>
          </button>
          <button
            onClick={() => clearCrisis(currentCrisis.id)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
            title="Dismiss disruption manually without rerouting"
          >
            <span>Dismiss Threat</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Crisis Sentinel Status</span>
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Monitoring
        </span>
      </div>

      <div className="bg-[#090e1a] border border-slate-800/80 rounded-xl p-3 text-center space-y-1">
        <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs font-semibold text-slate-200">All Corridors Nominal</div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
          Sentinel Agent actively scanning IoT telemetry, weather airways & maritime chokepoints...
        </p>
      </div>

      {/* Manual Trigger Button for Testing */}
      <button
        onClick={() => triggerRandomCrisis()}
        className="w-full py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-950/30"
      >
        <Flame className="w-3.5 h-3.5 text-red-400 animate-bounce" />
        <span>🚨 Trigger Simulation Threat</span>
      </button>
    </div>
  );
};

export const ActiveSimulationCard: React.FC<{ onViewSimulation?: () => void }> = () => {
  const {
    shipments,
    isSimulating,
    startSimulation,
    pauseSimulation,
    restartSimulation,
    simulationSpeed,
    setSimulationSpeed,
    selectShipment,
    selectedShipmentId,
  } = useSimulation();

  return (
    <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-4 h-4 text-cyan-400" />
          <span>Shipment Simulation</span>
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
          {isSimulating ? 'Running (60 FPS)' : 'Paused'}
        </span>
      </div>

      {/* Start / Pause / Restart Buttons */}
      <div className="flex items-center gap-2">
        {isSimulating ? (
          <button
            onClick={pauseSimulation}
            className="flex-1 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Pause className="w-3.5 h-3.5" /> Pause
          </button>
        ) : (
          <button
            onClick={startSimulation}
            className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Start Simulation
          </button>
        )}

        <button
          onClick={restartSimulation}
          className="py-1.5 px-2.5 rounded-xl bg-[#17223b] hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
          title="Randomize & Restart 3 New Shipments"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New Random</span>
        </button>
      </div>

      {/* Speed Controls */}
      <div className="flex items-center justify-between bg-[#090e1a] px-2 py-1 rounded-xl border border-slate-800 text-[10px] font-mono">
        <span className="text-slate-400 flex items-center gap-1">
          <FastForward className="w-3 h-3 text-cyan-400" /> Speed:
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                simulationSpeed === spd
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      {/* Live Shipments Mini List */}
      <div className="space-y-1 pt-0.5">
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
          Live Units ({shipments.length}):
        </div>
        <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
          {shipments.map((s) => {
            const isSelected = selectedShipmentId === s.id;
            const isDisrupted = s.status === 'DISRUPTED' || s.status === 'AT RISK';
            const isSea = s.mode === 'sea';
            return (
              <div
                key={s.id}
                onClick={() => selectShipment(isSelected ? null : s.id)}
                className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isDisrupted
                    ? 'bg-red-950/80 border-red-500 text-white shadow-[0_0_10px_#ef4444]'
                    : isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_8px_#0ea5e9]'
                    : 'bg-[#0b1220] border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`font-bold ${isDisrupted ? 'text-red-300' : 'text-cyan-300'}`}>{s.id}</span>
                  <span className="text-[9px] text-slate-400">{s.progress.toFixed(0)}%</span>
                </div>
                <div className="text-[9px] text-slate-300 font-sans truncate">
                  {isSea ? '🚢' : '✈️'} {s.cargo}
                </div>
                <div className="text-[8px] font-mono text-slate-400 flex items-center justify-between">
                  <span>{s.from} ➔ {s.to} • {s.totalDistanceKm ? `${s.totalDistanceKm.toLocaleString()}km` : ''}</span>
                  <span className={isDisrupted ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    ● {s.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const RightSidebarCards: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      <CriticalAlertCard />
      <ActiveSimulationCard />
    </div>
  );
};
