import React, { useMemo, useEffect, useState } from 'react';
import { Sparkles, CheckCircle, ArrowRight, Eye, ShieldCheck, Clock, DollarSign, Compass, ShieldAlert } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { LOCATIONS_MAP } from '../data/locations';
import { strategyAgent } from '../agents/strategyAgent';

interface RecoveryPlansPanelProps {
  targetShipmentId?: string;
}

export const RecoveryPlansPanel: React.FC<RecoveryPlansPanelProps> = ({ targetShipmentId }) => {
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const {
    activeCrises = [],
    selectedCrisisId,
    activeCrisis,
    shipments,
    recoveryOptions: globalRecoveryOptions = [],
    selectedRecoveryOptionId,
    selectRecoveryOption,
    previewRecoveryOption,
    applyRecoveryOption,
    impactResult,
  } = useSimulation();

  // Hook 1: Determine current active crisis (Unconditionally called)
  const currentCrisis = useMemo(() => {
    if (!activeCrises || activeCrises.length === 0) return null;
    if (targetShipmentId) {
      return activeCrises.find((c) => c.affectedShipmentId === targetShipmentId) || null;
    }
    return activeCrisis || activeCrises[0] || null;
  }, [targetShipmentId, activeCrises, activeCrisis]);

  // Hook 2: Determine affected shipment (Unconditionally called)
  const affectedShipment = useMemo(() => {
    if (!currentCrisis) return null;
    return shipments.find((s) => s.id === currentCrisis.affectedShipmentId) || null;
  }, [currentCrisis, shipments]);

  // Hook 3: Determine options to display (Unconditionally called)
  const optionsToDisplay = useMemo(() => {
    if (!currentCrisis || !affectedShipment) return [];
    if (activeCrisis && currentCrisis.id === activeCrisis.id && globalRecoveryOptions.length > 0) {
      return globalRecoveryOptions;
    }
    if (impactResult && impactResult.shipmentId === affectedShipment.id) {
      const stratRes = strategyAgent(affectedShipment, impactResult);
      return stratRes.allAlternatives || [];
    }
    return globalRecoveryOptions;
  }, [currentCrisis, activeCrisis, globalRecoveryOptions, impactResult, affectedShipment]);

  // Hook 4: Reset approving ID on crisis ID change (Unconditionally called)
  useEffect(() => {
    setApprovingId(null);
  }, [currentCrisis?.id]);

  // Early return only AFTER all hooks are called unconditionally
  if (!currentCrisis || !affectedShipment || optionsToDisplay.length === 0) {
    return null;
  }

  const isCurrentlyRerouting = affectedShipment.status === 'REROUTING';
  const isAwaitingApproval =
    affectedShipment.status === 'AWAITING APPROVAL' ||
    affectedShipment.status === 'DISRUPTED';

  return (
    <div className="bg-[#0b1322] border-2 border-emerald-500/60 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/40 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                Generated Recovery Plans
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-[10px] font-mono text-emerald-300 font-bold">
                {optionsToDisplay.length} Feasible Paths
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Target: <span className="text-amber-300 font-bold">{currentCrisis.affectedShipmentId}</span> ({affectedShipment?.cargo}) • Disrupted at <span className="text-cyan-300">{currentCrisis.locationName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono self-end sm:self-auto">
          {isCurrentlyRerouting ? (
            <span className="flex items-center gap-1 text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/50 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Executing Recovery Route...
            </span>
          ) : isAwaitingApproval ? (
            <span className="flex items-center gap-1 text-red-300 bg-red-950/80 px-2.5 py-0.5 rounded-full border border-red-500/50 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Human Authorization Required
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Strategy Agent Ready
            </span>
          )}
        </div>
      </div>

      {/* Corridor Summary */}
      <div className="bg-[#0e1628] border border-slate-800 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="text-slate-300">
          Corridor: <span className="text-cyan-300 font-bold">{LOCATIONS_MAP[affectedShipment.from]?.name || affectedShipment.from}</span> ➔ <span className="text-emerald-400 font-bold">{LOCATIONS_MAP[affectedShipment.to]?.name || affectedShipment.to}</span>
        </div>
        <div className="text-red-400 font-bold">
          🚨 Blocked: {currentCrisis.locationName} ({currentCrisis.etaImpact} Delay)
        </div>
      </div>

      {/* 3 Recovery Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {optionsToDisplay.map((opt) => {
          const isSelected = selectedRecoveryOptionId === opt.id;
          const isRecommended = opt.recommended;

          return (
            <div
              key={opt.id}
              onClick={() => {
                selectRecoveryOption(opt.id);
                previewRecoveryOption(opt.id);
              }}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#101b33] border-emerald-400 shadow-lg shadow-emerald-950/60'
                  : 'bg-[#0e1628] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Badge & Mode */}
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 font-bold">
                    {opt.modeBadge}
                  </span>
                  {isRecommended && (
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      ★ Recommended
                    </span>
                  )}
                </div>

                {/* Title */}
                <h4 className="text-xs font-bold text-white leading-snug">{opt.title}</h4>

                {/* Waypoints Route Leg */}
                <div className="flex items-center flex-wrap gap-1 pt-1.5 text-[10px] font-mono text-slate-300">
                  {opt.pathLegs?.map((leg, i) => (
                    <span key={i} className="flex items-center gap-0.5">
                      <span>{leg.icon}</span>
                      <span>{leg.label}</span>
                      {i < (opt.pathLegs?.length || 0) - 1 && <span className="text-slate-500">➔</span>}
                    </span>
                  ))}
                </div>

                {/* ETA & Cost */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 text-[10px] font-mono">
                  <div className="bg-[#080d18] p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">ETA Delta:</span>
                    <span className="text-emerald-300 font-bold">{opt.etaValue}</span>
                  </div>
                  <div className="bg-[#080d18] p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">Cost Delta:</span>
                    <span className="text-amber-300 font-bold">{opt.costFormatted}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                  {opt.description}
                </p>
              </div>

              {/* Action Buttons: Preview & Approve */}
              <div className="flex gap-2 pt-1 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    previewRecoveryOption(opt.id);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-98"
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setApprovingId(opt.id);
                    applyRecoveryOption(affectedShipment.id, opt.id);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-extrabold flex items-center justify-center gap-1 transition-all shadow cursor-pointer active:scale-98"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{approvingId === opt.id ? '✓ Approved' : 'Approve Plan'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
