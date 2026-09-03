import React, { useState } from 'react';
import { useSimulation, STRATEGIC_CHOKEPOINTS_DATA } from '../context/SimulationContext';
import { AlertTriangle, ShieldCheck, Flame, Anchor, CheckCircle2, Play, History, ExternalLink, ArrowRight } from 'lucide-react';
import { LOCATIONS_MAP } from '../data/locations';

export const DisruptionsView: React.FC = () => {
  const { activeCrises, historicalCrises = [], clearCrisis, triggerCrisisAtChokepoint, selectCrisis, selectedCrisisId } = useSimulation();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORICAL'>('ACTIVE');

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#12080c] border border-red-900/60 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-950 border border-red-700 text-red-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Global Disruption & Chokepoint Command Center</h1>
            <p className="text-xs text-slate-400 font-mono">Live maritime blockades, airspace restrictions, and historical mitigation ledger</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'ACTIVE'
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Active Threats ({activeCrises.length})
          </button>
          <button
            onClick={() => setActiveTab('HISTORICAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'HISTORICAL'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Historical Archive ({historicalCrises.length})
          </button>
        </div>
      </div>

      {/* ACTIVE CRISES TAB */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-5">
          <div className="space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" /> Active Disruption Incidents ({activeCrises.length})
            </h2>

            {activeCrises.length === 0 ? (
              <div className="bg-[#0b101e] border border-emerald-900/40 rounded-2xl p-8 text-center space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-sm font-bold text-white">All Global Corridors Nominal</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">No active chokepoints blocked. All maritime sea-lanes and international airways are operating smoothly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeCrises.map((c) => {
                  const isSelected = c.id === selectedCrisisId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => selectCrisis(c.id)}
                      className={`bg-[#140a0f] border-2 rounded-2xl p-4 shadow-xl space-y-2.5 transition-all cursor-pointer ${
                        isSelected ? 'border-red-500 shadow-red-950/60' : 'border-red-900/40 hover:border-red-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-red-950 border border-red-800 text-red-300 font-mono text-[10px] font-bold">
                          {c.id} • {c.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{c.timestamp}</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">{c.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.description}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 bg-[#1b0d14] p-2 rounded-xl text-[10px] font-mono border border-red-900/30">
                        <div>
                          <span className="text-slate-500 block">Location</span>
                          <span className="text-slate-200 font-bold">{c.locationName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Delay Impact</span>
                          <span className="text-amber-400 font-bold">{c.etaImpact}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Risk Score</span>
                          <span className="text-red-400 font-bold">{c.riskScore} / 100</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-cyan-300">
                          Impacted Carrier: <strong className="text-white">{c.affectedShipmentId}</strong>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearCrisis(c.id);
                          }}
                          className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolve Crisis</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Strategic Chokepoints Trigger Board */}
          <div className="space-y-3 pt-4">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-cyan-400" /> Strategic Global Chokepoints Catalog ({STRATEGIC_CHOKEPOINTS_DATA.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {STRATEGIC_CHOKEPOINTS_DATA.map((cp) => (
                <div
                  key={cp.id}
                  className="bg-[#0b101e] border border-[#1a243a] hover:border-cyan-500/40 rounded-2xl p-3.5 space-y-2 transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-cyan-400 font-bold">📍 {cp.name}</span>
                      <span className="text-amber-400">{cp.etaImpact}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{cp.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{cp.desc}</p>
                  </div>

                  <button
                    onClick={() => triggerCrisisAtChokepoint(cp.id)}
                    className="w-full py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow mt-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Simulate {cp.name} Blockade</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL CRISES ARCHIVE TAB */}
      {activeTab === 'HISTORICAL' && (
        <div className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <History className="w-4 h-4 text-emerald-400" /> Resolved Disruptions & Mitigation Audit Archive ({historicalCrises.length})
          </h2>

          <div className="bg-[#0b101e] border border-[#1a243a] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Disruption ID & Title</th>
                    <th className="py-3 px-4">Carrier</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Resolved Recovery Strategy</th>
                    <th className="py-3 px-4">Resolved At</th>
                    <th className="py-3 px-4">Blockchain TxHash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {historicalCrises.map((h) => (
                    <tr key={h.id} className="hover:bg-[#12192e] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white">{h.id}</div>
                        <div className="text-slate-300 font-semibold text-xs">{h.title}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-300 font-bold">
                        {h.affectedShipmentId}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {h.locationName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{h.recoveryOptionTitle}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {h.resolvedAt}
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-400 text-[10px]">
                        <span className="truncate max-w-[120px] block" title={h.txHash}>
                          {h.txHash.slice(0, 12)}...{h.txHash.slice(-8)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
