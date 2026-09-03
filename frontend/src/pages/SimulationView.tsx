import React, { useState } from 'react';
import { useSimulation, STRATEGIC_CHOKEPOINTS_DATA } from '../context/SimulationContext';
import { Sliders, Play, Pause, RotateCcw, Zap, Gauge, Compass, ShieldAlert, Thermometer, Lock, Unlock, RefreshCw, Plus } from 'lucide-react';
import { LOCATIONS_MAP } from '../data/locations';

export const SimulationView: React.FC = () => {
  const {
    isSimulating,
    startSimulation,
    pauseSimulation,
    restartSimulation,
    simulationSpeed,
    setSimulationSpeed,
    triggerRandomCrisis,
    triggerCrisisAtChokepoint,
    injectTemperatureSpike,
    breakCargoSeal,
    resetShipmentTelemetry,
    addRandomShipment,
    activeCrises,
    shipments,
    successfulRecoveriesCount,
  } = useSimulation();

  const [selectedShipmentId, setSelectedShipmentId] = useState<string>(shipments[0]?.id || 'ORD-4475');
  const targetShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] border border-cyan-900/60 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
            <Sliders className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Active Crisis &amp; Route Simulation Sandbox</h1>
            <p className="text-xs text-slate-400 font-mono">60 FPS multi-modal physics engine, cold-chain excursion injection, and chokepoint harness</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addRandomShipment()}
            className="px-3.5 py-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Spawn Shipment</span>
          </button>
          <button
            onClick={() => (isSimulating ? pauseSimulation() : startSimulation())}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer ${
              isSimulating ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-emerald-500 hover:bg-emerald-400 text-black'
            }`}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Pause Engine' : 'Resume Simulation'}</span>
          </button>
          <button
            onClick={() => restartSimulation()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            title="Restart Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulation Controls & Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Simulation Warp Speed
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-900/50'
                    : 'bg-[#121829] text-slate-400 hover:text-white border-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">Live Carrier Units</div>
          <div className="text-2xl font-extrabold text-white font-mono">{shipments.length} Active</div>
          <div className="text-[10px] text-emerald-400 font-mono">Global Waypoint Tracking</div>
        </div>

        <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">Active Disruptions</div>
          <div className={`text-2xl font-extrabold font-mono ${activeCrises.length > 0 ? 'text-red-400' : 'text-white'}`}>
            {activeCrises.length} Blocked
          </div>
          <div className="text-[10px] text-slate-400 font-mono">Corridors Halted</div>
        </div>

        <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 space-y-1">
          <div className="text-[11px] text-slate-400 font-mono">Autonomous Recoveries</div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">{successfulRecoveriesCount} Resolved</div>
          <div className="text-[10px] text-emerald-300 font-mono">Blockchain Notarized</div>
        </div>
      </div>

      {/* 🧪 COLD-CHAIN & IoT SEAL TAMPERING SIMULATION PANEL */}
      <div className="bg-[#120a16] border-2 border-purple-500/60 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/60 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-purple-400" />
              Cold-Chain Excursion &amp; Digital IoT Seal Tamper Lab
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate real-life refrigeration failures and physical container tampering to test Receiver Zero-Trust audit detection.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#1b0d21] border border-purple-900/60 p-1.5 rounded-xl">
            <span className="text-xs font-mono text-slate-400 pl-2">Target Consignment:</span>
            <select
              value={selectedShipmentId}
              onChange={(e) => setSelectedShipmentId(e.target.value)}
              className="bg-[#0d0714] border border-purple-800 rounded-lg px-3 py-1 text-xs font-mono text-purple-300 font-bold"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} ({s.cargo.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {targetShipment && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
            {/* Action 1: Inject Temperature Spike */}
            <div className="bg-[#180d21] p-3.5 rounded-xl border border-purple-900/40 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-red-300">🌡️ Temperature Excursion</span>
                  <span className="text-red-400 font-bold">9.6°C</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Spikes true IoT sensor temperature beyond the {targetShipment.targetTempRange.max}°C SLA cold-chain window.
                </p>
              </div>
              <button
                onClick={() => injectTemperatureSpike(targetShipment.id, 9.6)}
                className="w-full py-2 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-bold transition-all cursor-pointer shadow mt-2"
              >
                Inject +9.6°C Spike ➔
              </button>
            </div>

            {/* Action 2: Break Cargo Seal */}
            <div className="bg-[#180d21] p-3.5 rounded-xl border border-purple-900/40 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300">🔓 Break IoT Cargo Seal</span>
                  <span className="text-amber-400 font-bold">{targetShipment.sealStatus}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Breaks the digital IoT container seal, marking physical integrity compromised on-chain.
                </p>
              </div>
              <button
                onClick={() => breakCargoSeal(targetShipment.id)}
                className="w-full py-2 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 text-xs font-bold transition-all cursor-pointer shadow mt-2"
              >
                Break Cargo Seal ➔
              </button>
            </div>

            {/* Action 3: Restore Nominal */}
            <div className="bg-[#180d21] p-3.5 rounded-xl border border-purple-900/40 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">🔄 Reset Telemetry</span>
                  <span className="text-emerald-400 font-bold">2.4°C / Intact</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Restores authentic sensor readings, nominal refrigeration, and intact seal status.
                </p>
              </div>
              <button
                onClick={() => resetShipmentTelemetry(targetShipment.id)}
                className="w-full py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-xs font-bold transition-all cursor-pointer shadow mt-2"
              >
                Restore Nominal State ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Stress Testing Board */}
      <div className="bg-[#0b101e] border border-[#1a243a] rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Global Chokepoints Stress-Testing Board
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Trigger real-world disruptions dynamically to test Sentinel, Impact, and Strategy agent reasoning.</p>
          </div>
          <button
            onClick={() => triggerRandomCrisis()}
            className="px-3.5 py-1.5 rounded-xl bg-red-500 hover:bg-red-400 text-black font-bold text-xs font-mono flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Random Fleet Disruption</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STRATEGIC_CHOKEPOINTS_DATA.map((cp) => (
            <div
              key={cp.id}
              className="bg-[#080d1a] border border-slate-800/80 hover:border-cyan-500/30 rounded-xl p-3 space-y-2 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white">
                  <span>{cp.name}</span>
                  <span className="text-amber-400">{cp.etaImpact}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{cp.title}</p>
              </div>
              <button
                onClick={() => triggerCrisisAtChokepoint(cp.id)}
                className="w-full py-1.5 rounded-lg bg-[#141d33] hover:bg-cyan-950 border border-cyan-800/50 text-cyan-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer mt-2"
              >
                Inject Blockade ➔
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
