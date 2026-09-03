import React from 'react';
import { Package, TrendingUp, AlertTriangle, DollarSign, FileCheck } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export const KpiCardsRow: React.FC = () => {
  const { shipments = [], activeCrises = [], activeCrisis, successfulRecoveriesCount = 0 } = useSimulation();

  const activeCount = shipments ? shipments.length : 0;
  const safeList = Array.isArray(shipments) ? shipments : [];
  const disruptionCount = activeCrises.length > 0 ? activeCrises.length : safeList.filter((s) => s.status === 'DISRUPTED' || s.status === 'AT RISK' || s.status === 'AWAITING APPROVAL' || s.status === 'REROUTING').length;
  const atRiskCount = activeCrises.length > 0 ? activeCrises.length : safeList.filter((s) => s.status === 'AT RISK').length;
  const onTimePercentage = disruptionCount === 0 ? 99.4 : disruptionCount === 1 ? 66.7 : disruptionCount === 2 ? 33.3 : 0.0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Active Shipments */}
      <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Active Shipments</span>
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">{activeCount}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-mono text-cyan-300">
            {disruptionCount > 0 ? `${activeCount - disruptionCount} Nominal • ${disruptionCount} Halted` : '100% Active'}
          </span>
        </div>
      </div>

      {/* 2. On-Time Delivery */}
      <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">On-Time Delivery</span>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            activeCrisis ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`text-xl sm:text-2xl font-extrabold font-mono ${activeCrisis ? 'text-amber-400' : 'text-white'}`}>
          {onTimePercentage.toFixed(1)}%
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[10px] font-mono ${activeCrisis ? 'text-amber-400' : 'text-emerald-400'}`}>
            {activeCrisis ? '-32.7% SLA Impact' : '+0.8% Target SLA'}
          </span>
        </div>
      </div>

      {/* 3. Active Disruptions */}
      <div className={`bg-[#0f1524] border rounded-2xl p-4 shadow-xl transition-all ${
        disruptionCount > 0
          ? 'border-red-500 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          : 'border-[#1b2336]'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Active Disruptions</span>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
            disruptionCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className={`text-xl sm:text-2xl font-extrabold font-mono ${
          disruptionCount > 0 ? 'text-red-400 animate-pulse' : 'text-white'
        }`}>
          {disruptionCount}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={`text-[10px] font-mono ${disruptionCount > 0 ? (activeCrisis?.status === 'APPROVED_REROUTING' ? 'text-amber-400 font-bold' : 'text-red-400 font-bold') : 'text-emerald-400'}`}>
            {disruptionCount > 0 ? (activeCrisis?.status === 'APPROVED_REROUTING' ? '🟡 Rerouting Maneuver' : '🚨 Route Disruption') : 'Zero Critical Risks'}
          </span>
        </div>
      </div>

      {/* 4. Cost Impact / At Risk */}
      <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">At Risk Value</span>
          <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
          {atRiskCount > 0 ? '$1.8M' : '$0.00'}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-mono text-slate-400">
            {atRiskCount > 0 ? 'Insured Cold-Chain' : 'All Cargo Safe'}
          </span>
        </div>
      </div>

      {/* 5. Autonomous Recoveries */}
      <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-slate-400">Auto Recoveries</span>
          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <FileCheck className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
          {successfulRecoveriesCount}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] font-mono text-emerald-400">
            {successfulRecoveriesCount > 0 ? `+${successfulRecoveriesCount} Resolved` : 'Smart Ledger Active'}
          </span>
        </div>
      </div>
    </div>
  );
};
