import React, { useState } from 'react';
import { SimulationState, Shipment } from '../types';
import { KpiBar } from '../components/KpiBar';
import { GlobalMap } from '../map/GlobalMap';
import { AgentPipelineCard } from '../components/AgentPipelineCard';
import { EventStream } from '../components/EventStream';
import { DemoTimeline } from '../components/DemoTimeline';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle2,
  TrendingUp,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface MasterHubProps {
  state: SimulationState | null;
  onNavigate: (tab: string) => void;
}

export const MasterHub: React.FC<MasterHubProps> = ({ state, onNavigate }) => {
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('ORD-5415');

  const shipments = state?.shipments || [];
  const waypoints = state?.waypoints || {};
  const crises = state?.active_crises || [];
  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  const activeCritical = crises.find((c) => c.severity === 'CRITICAL') || crises[0];

  return (
    <div className="space-y-4 max-w-[1780px] mx-auto pb-8">
      {/* Welcome Banner matching design inspiration */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Supply Chain Command Center <span className="text-xl">👋</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Autonomous multi-tier resilience, dynamic maritime rerouting, and zero-trust verification.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Mode Active</span>
          </span>
        </div>
      </div>

      {/* 17-Phase Demo Timeline if active */}
      <DemoTimeline
        demoActive={state?.demo_active ?? false}
        demoPhase={state?.demo_phase ?? 0}
      />

      {/* KPI Bar */}
      <KpiBar kpis={state?.kpis} />

      {/* Main Section: 60% Map + Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 60%: Live Global Map */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-3.5 shadow-2xl">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-sans">
                  Global Supply Chain Monitor
                </h2>
                <span className="text-[11px] font-mono text-cyan-400">● Live Satellite AIS</span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Tracking {shipments.length} Active High-Value Medical Consignments
              </div>
            </div>

            {/* Leaflet Map */}
            <div className="h-[480px]">
              <GlobalMap
                shipments={shipments}
                waypoints={waypoints}
                activeCrises={crises}
                selectedShipmentId={selectedShipmentId}
                onSelectShipment={(id) => setSelectedShipmentId(id)}
              />
            </div>
          </div>
        </div>

        {/* Right 40%: AI Agent Pipeline & Critical Alert */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* AI Agent Pipeline Status */}
          <AgentPipelineCard />

          {/* Critical Alert Card matching mockup */}
          <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Critical Disruption Radar
                </h3>
              </div>
              <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-1.5 py-0.5 rounded border border-rose-800">
                High Risk
              </span>
            </div>

            {activeCritical ? (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/80 space-y-2">
                <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{activeCritical.title}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {activeCritical.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-400 border-t border-rose-900/60">
                  <div>
                    <span className="text-slate-500">ETA Impact:</span> +{activeCritical.expected_delay_days} days
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence:</span> {activeCritical.probability}%
                  </div>
                  <div>
                    <span className="text-slate-500">Cost Delta:</span> +${activeCritical.cost_impact_usd.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span>{' '}
                    <span className="text-rose-400 font-bold">ROUTE BLOCKED</span>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('carrier')}
                  className="w-full mt-2 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold font-mono flex items-center justify-center space-x-1 transition-all shadow-glow-red"
                >
                  <span>REVIEW RECOVERY OPTIONS</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-center space-y-2 my-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-300">All Corridors Clear</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  No active maritime blockades or critical weather excursions detected.
                </div>
              </div>
            )}

            {/* Active Simulation Snapshot */}
            <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-sans">
              <div className="text-[10px] font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>Selected Payload Telemetry:</span>
                <span className="text-cyan-400 font-bold">{selectedShipment?.id}</span>
              </div>
              <div className="text-slate-200 font-semibold text-xs truncate">
                {selectedShipment?.cargo}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
                <span>Temp: {selectedShipment?.current_temp.toFixed(1)}°C</span>
                <span>Progress: {selectedShipment?.total_progress.toFixed(1)}%</span>
                <span>Risk: {selectedShipment?.risk}/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Shipments Grid & Live Event Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active Shipments Cards (7 cols) */}
        <div className="lg:col-span-7 bg-[#0d1322] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                Active Critical Shipments
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {shipments.length} Monitored Bio-Cold Cargoes
            </span>
          </div>

          <div className="space-y-2.5">
            {shipments.map((s) => {
              const isSel = s.id === selectedShipmentId;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedShipmentId(s.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSel
                      ? 'bg-slate-900 border-cyan-500/60 shadow-glow-cyan'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-cyan-400 text-xs">{s.id}</span>
                      <span className="text-slate-200 font-semibold text-xs">{s.cargo}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        s.status === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border-rose-800'
                          : s.status === 'AT_RISK'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : s.status === 'ARRIVED' || s.status === 'ACCEPTED'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-400 mb-2">
                    <div>
                      <span className="text-slate-500">Route:</span> {s.origin} → {s.destination.split(' ')[0]}
                    </div>
                    <div>
                      <span className="text-slate-500">ETA:</span> {s.eta_days.toFixed(1)} Days
                    </div>
                    <div>
                      <span className="text-slate-500">Temp:</span>{' '}
                      <span className={s.current_temp > s.temp_max || s.current_temp < s.temp_min ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                        {s.current_temp.toFixed(1)}°C
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Escrow:</span> ${(s.escrow_usd / 1000).toFixed(0)}k
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        s.status === 'CRITICAL'
                          ? 'bg-rose-500'
                          : s.status === 'AT_RISK'
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      }`}
                      style={{ width: `${s.total_progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Event Stream (5 cols) */}
        <div className="lg:col-span-5">
          <EventStream events={state?.recent_events || []} />
        </div>
      </div>
    </div>
  );
};
