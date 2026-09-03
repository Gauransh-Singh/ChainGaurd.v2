import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldAlert,
  Sliders,
  Sparkles,
  Flame,
  CloudRain,
  Building,
  Thermometer,
  Wrench,
  Lock,
  Unlock,
} from 'lucide-react';
import { api } from '../services/api';

interface SimulationControlsProps {
  running: boolean;
  speed: number;
  mode: 'manual' | 'auto';
  demoActive: boolean;
  onTamperClick: () => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  running,
  speed,
  mode,
  demoActive,
  onTamperClick,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setLoadingAction(action);
    try {
      await fn();
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
    } finally {
      setLoadingAction(null);
    }
  };

  const speeds = [0.5, 1.0, 2.0, 5.0];

  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Simulation Control Tower
          </h3>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleAction('mode-manual', () => api.setMode('manual'))}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              mode === 'manual'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => handleAction('mode-auto', () => api.setMode('auto'))}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
              mode === 'auto'
                ? 'bg-purple-950 text-purple-300 border border-purple-700 animate-pulse'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Auto Mode
          </button>
        </div>
      </div>

      {/* Row 1: Playback & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center space-x-2">
          {running ? (
            <button
              onClick={() => handleAction('pause', () => api.pauseSimulation())}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-semibold font-mono transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>
          ) : (
            <button
              onClick={() => handleAction('start', () => api.startSimulation())}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-semibold font-mono shadow-glow-green transition-all"
            >
              <Play className="w-3.5 h-3.5" />
              <span>START</span>
            </button>
          )}

          <button
            onClick={() => handleAction('reset', () => api.resetSimulation())}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 text-xs font-mono transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-[10px] text-slate-500 px-1.5">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => handleAction(`speed-${s}`, () => api.setSpeed(s))}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                speed === s
                  ? 'bg-brand-blue text-white shadow-glow-blue'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        <button
          disabled={demoActive}
          onClick={() => handleAction('demo', () => api.startDemo())}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
            demoActive
              ? 'bg-purple-950 text-purple-300 border border-purple-800 animate-pulse cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-glow-purple'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{demoActive ? 'DEMO IN PROGRESS...' : 'START 17-PHASE DEMO'}</span>
        </button>
      </div>

      {/* Row 2: Crisis Injection */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Inject Crisis Scenarios (Target: ORD-5415)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => handleAction('crisis-redsea', () => api.triggerCrisis('RED_SEA', 'ORD-5415'))}
            className="p-2 rounded-lg bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-left transition-all"
          >
            <div className="flex items-center space-x-1.5 text-rose-300 font-bold text-xs">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Red Sea Blockade</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Geopolitical +8d | +$420k</div>
          </button>

          <button
            onClick={() => handleAction('crisis-port', () => api.triggerCrisis('PORT_CLOSURE', 'ORD-5415'))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-700 text-left transition-all"
          >
            <div className="flex items-center space-x-1.5 text-amber-300 font-bold text-xs">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Port Strike / Closure</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Rotterdam Crane Halt +4d</div>
          </button>

          <button
            onClick={() => handleAction('crisis-typhoon', () => api.triggerCrisis('TYPHOON', 'ORD-5415'))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-700 text-left transition-all"
          >
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold text-xs">
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Super Typhoon</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Category 5 Weather</div>
          </button>

          <button
            onClick={() => handleAction('crisis-supplier', () => api.triggerCrisis('SUPPLIER_FAILURE', 'ORD-5415'))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all"
          >
            <div className="flex items-center space-x-1.5 text-slate-300 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Supplier Cryo Failure</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Dry-Ice Shortage</div>
          </button>

          <button
            onClick={() => handleAction('crisis-temp', () => api.triggerCrisis('TEMP_EXCURSION', 'ORD-5415'))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-700 text-left transition-all"
          >
            <div className="flex items-center space-x-1.5 text-rose-300 font-bold text-xs">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Temp Excursion Spike</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Compressor Leakage</div>
          </button>

          <button
            onClick={() => handleAction('crisis-transport', () => api.triggerCrisis('TRANSPORT_FAILURE', 'ORD-5415'))}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all"
          >
            <div className="flex items-center space-x-1.5 text-slate-300 font-bold text-xs">
              <Wrench className="w-3.5 h-3.5 text-orange-400" />
              <span>Propulsion Breakdown</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Turbine Failure +6d</div>
          </button>
        </div>
      </div>

      {/* Row 3: Blockchain Tamper Lab */}
      <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>Cryptographic Blockchain Tamper Lab</span>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            Inject payload corruption to verify consensus rejection &amp; escrow freeze.
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTamperClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-mono font-semibold transition-all"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SIMULATE TAMPERING</span>
          </button>

          <button
            onClick={() => handleAction('restore', () => api.restoreBlockchain())}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-semibold transition-all"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>RESTORE CHAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
