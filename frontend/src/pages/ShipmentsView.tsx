import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { LOCATIONS_MAP } from '../data/locations';
import { Shipment } from '../types/shipment';
import {
  Truck,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  X,
  Compass,
  Zap,
  Box,
  Thermometer,
  Gauge,
  Plus
} from 'lucide-react';

export const ShipmentsView: React.FC = () => {
  const { shipments, activeCrises, selectShipment, triggerRandomCrisis, addRandomShipment } = useSimulation();
  const [filterMode, setFilterMode] = useState<'ALL' | 'air' | 'sea'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectShipment, setInspectShipment] = useState<Shipment | null>(null);

  const filteredShipments = shipments.filter((s) => {
    if (filterMode !== 'ALL' && s.mode !== filterMode) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.cargo.toLowerCase().includes(q) ||
        s.vesselName.toLowerCase().includes(q) ||
        (LOCATIONS_MAP[s.from]?.name || '').toLowerCase().includes(q) ||
        (LOCATIONS_MAP[s.to]?.name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] border border-[#1b253b] p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Global Fleet & Active Shipments Manager</h1>
            <p className="text-xs text-slate-400 font-mono">Live multi-modal telemetry, cold-chain status, and active routing corridors</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => addRandomShipment()}
            className="px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Spawn Shipment</span>
          </button>
          <button
            onClick={() => triggerRandomCrisis()}
            className="px-3.5 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0f1d] border border-[#162035] p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Mode:
          </span>
          {(['ALL', 'air', 'sea'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                filterMode === m
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                  : 'bg-[#121829] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {m === 'ALL' ? 'All Carriers' : m === 'air' ? '✈️ Air Cargo' : '🚢 Maritime Ocean'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shipment ID, cargo, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121829] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>
      </div>

      {/* Shipments Data Table */}
      <div className="bg-[#0b101e] border border-[#182238] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-[#0f172a] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Shipment & Carrier</th>
                <th className="py-3 px-4">Cargo & Cold-Chain</th>
                <th className="py-3 px-4">Route Corridor</th>
                <th className="py-3 px-4">Speed & Distance</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status & Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredShipments.map((s) => {
                const hasCrisis = activeCrises.some((c) => c.affectedShipmentId === s.id);
                const fromName = LOCATIONS_MAP[s.from]?.name || s.from;
                const toName = LOCATIONS_MAP[s.to]?.name || s.to;

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-[#12192e] transition-colors cursor-pointer ${
                      hasCrisis ? 'bg-red-950/20' : ''
                    }`}
                    onClick={() => setInspectShipment(s)}
                  >
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white flex items-center gap-1.5">
                        <span>{s.mode === 'air' ? '✈️' : '🚢'}</span>
                        <span className="text-purple-300">{s.id}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[180px]">{s.vesselName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{s.cargo}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {s.cargoType === 'biologics' || s.cargoType === 'pharmaceutical' ? (
                          <span className="text-cyan-400 font-bold">Reefer ({s.temperature ? `${s.temperature}°C` : '2.4°C'})</span>
                        ) : (
                          'Dry Containerized'
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                        <span>{fromName}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-cyan-300">{toName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {s.pathNodes.length - 1} Segment Corridor
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="text-slate-200 font-bold">{Math.round(s.currentSpeedKmH)} km/h</div>
                      <div className="text-[10px] text-slate-400">{Math.round(s.totalDistanceKm).toLocaleString()} km</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              hasCrisis ? 'bg-red-500' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(2, s.progress))}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-300 font-bold">
                          {s.progress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold w-fit ${
                            s.status === 'DISRUPTED'
                              ? 'bg-red-950 text-red-300 border border-red-700'
                              : s.status === 'REROUTING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {s.status}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">Risk: {s.riskLevel}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectShipment(s);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-900/60 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipment Inspection Detail Modal */}
      {inspectShipment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-[#1e2a44] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setInspectShipment(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-3 rounded-2xl bg-purple-950 border border-purple-700 text-purple-400">
                {inspectShipment.mode === 'air' ? <Compass className="w-6 h-6" /> : <Truck className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{inspectShipment.id}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                    {inspectShipment.mode.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{inspectShipment.vesselName} ({inspectShipment.vesselType})</p>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[#12192e] p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 text-[10px] block">Current Speed</span>
                <span className="text-white text-sm font-bold">{Math.round(inspectShipment.currentSpeedKmH)} km/h</span>
              </div>
              <div className="bg-[#12192e] p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 text-[10px] block">Total Distance</span>
                <span className="text-cyan-300 text-sm font-bold">{Math.round(inspectShipment.totalDistanceKm).toLocaleString()} km</span>
              </div>
              <div className="bg-[#12192e] p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 text-[10px] block">Progress</span>
                <span className="text-emerald-400 text-sm font-bold">{inspectShipment.progress.toFixed(1)}%</span>
              </div>
              <div className="bg-[#12192e] p-3 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400 text-[10px] block">Temperature</span>
                <span className="text-amber-300 text-sm font-bold">{inspectShipment.temperature ? `${inspectShipment.temperature}°C` : '2.4°C'}</span>
              </div>
            </div>

            {/* Waypoints Pathway */}
            <div className="bg-[#090d18] border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Corridor Waypoints:</div>
              <div className="flex flex-wrap items-center gap-2">
                {inspectShipment.pathNodes.map((node, i) => (
                  <React.Fragment key={node}>
                    <div className="px-3 py-1.5 rounded-xl bg-[#141b2e] border border-slate-700 text-xs font-mono text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      <span>{LOCATIONS_MAP[node]?.name || node}</span>
                    </div>
                    {i < inspectShipment.pathNodes.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-400">Status: <strong className="text-white">{inspectShipment.status}</strong></span>
              <button
                onClick={() => setInspectShipment(null)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
