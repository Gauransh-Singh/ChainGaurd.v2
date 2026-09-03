import React from 'react';
import { Bot, Sparkles, Shield, BarChart3, Brain, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const AiAgentPipeline: React.FC<{ onViewDetails?: () => void }> = () => {
  const {
    activeCrises = [],
    activeCrisis,
    shipments,
    sentinelResult,
    impactResult,
    strategyResult,
  } = useSimulation();

  const hasCrisis = activeCrises.length > 0;
  const confidence = sentinelResult?.confidence || (activeCrisis?.riskScore ? Math.min(100, activeCrisis.riskScore + 8) : 91);
  const activeImpact = impactResult;
  const activeStrategy = strategyResult;
  const affectedShipment = shipments.find((s) => s.id === activeCrisis?.affectedShipmentId);
  const isRerouting = affectedShipment?.status === 'REROUTING';

  return (
    <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl flex flex-col justify-between min-h-[370px] lg:min-h-[390px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1b2336] pb-2 mb-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs font-bold text-slate-100 font-sans tracking-tight">
            AI Agent Pipeline
          </h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50 text-[9px] font-mono text-purple-300">
            <Sparkles className="w-2.5 h-2.5" />
            4 Cascade Agents
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
          hasCrisis
            ? isRerouting
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 font-bold'
              : 'bg-amber-950/80 border-amber-500/50 text-amber-300 font-bold animate-pulse'
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
        }`}>
          {isRerouting ? 'Reroute Executing' : hasCrisis ? 'Disruption Active' : 'Sentinel Active'}
        </span>
      </div>

      {/* 4 Agent Cascade Stages */}
      <div className="space-y-2 py-1">
        {/* AGENT 1: Sentinel Agent */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          hasCrisis
            ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'bg-[#090e1a] border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                hasCrisis ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>1. Sentinel Agent</span>
                  {hasCrisis && (
                    <span className="text-[9px] font-mono text-emerald-400 font-bold">✓ Complete</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {hasCrisis ? `Threat verified • ${confidence}% Confidence` : '● Active • Scanning telemetry feeds'}
                </div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${hasCrisis ? 'bg-emerald-400' : 'bg-emerald-400'}`} />
          </div>
        </div>

        {/* AGENT 2: Impact Agent */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          hasCrisis
            ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.15)]'
            : 'bg-[#090e1a]/60 border-slate-800/50 opacity-60'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                hasCrisis ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-slate-900 text-slate-500'
              }`}>
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>2. Impact Agent</span>
                  {hasCrisis && (
                    <span className="text-[9px] font-mono text-purple-300 font-bold">✓ Complete</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-300">
                  {hasCrisis
                    ? `Delay: ${activeImpact?.delayFormatted || '+8.2 Days'} • Risk: ${activeImpact?.riskLevel || 'HIGH'} • ${activeImpact?.costFormatted || '+₹4.8L'}`
                    : '○ Waiting for Sentinel trigger'}
                </div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${hasCrisis ? 'bg-purple-400' : 'bg-slate-600'}`} />
          </div>
        </div>

        {/* AGENT 3: Strategy Agent */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          hasCrisis
            ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-400/40'
            : 'bg-[#090e1a]/40 border-slate-800/40 opacity-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                hasCrisis ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-slate-900 text-slate-500'
              }`}>
                <Brain className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>3. Strategy Agent</span>
                  {hasCrisis && (
                    <span className="text-[9px] font-mono text-cyan-300 font-bold">✓ Complete</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-cyan-200">
                  {hasCrisis
                    ? `${activeStrategy?.allAlternatives.length || activeStrategy?.routeAlternatives.length || 3} Alternatives Found • Recommended: ${activeStrategy?.allAlternatives[0]?.title || activeStrategy?.routeAlternatives[0]?.title || 'Detour'}`
                    : '○ Waiting for Impact Assessment'}
                </div>
              </div>
            </div>
            {hasCrisis ? (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            )}
          </div>
        </div>

        {/* AGENT 4: Recovery Agent */}
        <div className={`p-2.5 rounded-xl border transition-all ${
          isRerouting
            ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
            : hasCrisis
            ? 'bg-amber-950/30 border-amber-500/40'
            : 'bg-[#090e1a]/40 border-slate-800/40 opacity-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                isRerouting
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : hasCrisis
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-slate-900 text-slate-500'
              }`}>
                <RefreshCw className={`w-3.5 h-3.5 ${isRerouting ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">4. Recovery Agent</div>
                <div className="text-[10px] font-mono text-slate-400">
                  {isRerouting
                    ? '🟢 Reroute Maneuver In Progress (Monitoring)'
                    : hasCrisis
                    ? '🟡 Awaiting Human Authorization'
                    : '○ Waiting'}
                </div>
              </div>
            </div>
            {isRerouting ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ) : hasCrisis ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-[#1b2336] flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Active Stage: Strategy ➔ Human Approval</span>
        <span className="text-cyan-400 font-bold">Network-Grounded Graph Engine</span>
      </div>
    </div>
  );
};
