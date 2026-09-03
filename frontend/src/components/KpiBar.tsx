import React from 'react';
import { KPIs } from '../types';
import {
  Package,
  AlertTriangle,
  Flame,
  Zap,
  CheckCircle,
  ShieldAlert,
  Clock,
  DollarSign,
} from 'lucide-react';

interface KpiBarProps {
  kpis?: KPIs;
}

export const KpiBar: React.FC<KpiBarProps> = ({ kpis }) => {
  const defaultKpis: KPIs = {
    active_shipments: 3,
    at_risk: 0,
    critical: 0,
    active_disruptions: 0,
    successful_recoveries: 0,
    integrity_breaches: 0,
    total_escrow_secured: 4030000,
    avg_delay_avoided_days: 2.4,
    cost_saved_m: 1.38,
  };

  const data = kpis || defaultKpis;

  const cards = [
    {
      title: 'Active Shipments',
      value: data.active_shipments,
      icon: Package,
      color: 'text-blue-400',
      bg: 'bg-blue-950/30 border-blue-800/40',
      sub: '3 Active Corridors',
    },
    {
      title: 'At Risk',
      value: data.at_risk,
      icon: AlertTriangle,
      color: data.at_risk > 0 ? 'text-amber-400' : 'text-slate-400',
      bg: data.at_risk > 0 ? 'bg-amber-950/40 border-amber-800/60 shadow-glow-cyan' : 'bg-slate-900/60 border-slate-800',
      sub: data.at_risk > 0 ? 'Elevated transit risk' : 'Zero active risk',
    },
    {
      title: 'Critical',
      value: data.critical,
      icon: Flame,
      color: data.critical > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: data.critical > 0 ? 'bg-rose-950/50 border-rose-700 shadow-glow-red' : 'bg-slate-900/60 border-slate-800',
      sub: data.critical > 0 ? 'Action required' : 'Nominal limits',
    },
    {
      title: 'Active Disruptions',
      value: data.active_disruptions,
      icon: Zap,
      color: data.active_disruptions > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: data.active_disruptions > 0 ? 'bg-rose-950/40 border-rose-800' : 'bg-emerald-950/20 border-emerald-900/40',
      sub: data.active_disruptions > 0 ? 'Corridors Blocked' : 'All Routes Clear',
    },
    {
      title: 'Recoveries',
      value: data.successful_recoveries,
      icon: CheckCircle,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30 border-emerald-800/40',
      sub: 'Consensus reroutes',
    },
    {
      title: 'Avg. Delay Avoided',
      value: `${data.avg_delay_avoided_days.toFixed(1)}d`,
      icon: Clock,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/30 border-cyan-800/40',
      sub: 'Via Strategic Reroute',
    },
    {
      title: 'Cost Saved',
      value: `$${data.cost_saved_m.toFixed(2)}M`,
      icon: DollarSign,
      color: 'text-purple-400',
      bg: 'bg-purple-950/30 border-purple-800/40',
      sub: 'Loss mitigation',
    },
    {
      title: 'Integrity Breaches',
      value: data.integrity_breaches,
      icon: ShieldAlert,
      color: data.integrity_breaches > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400',
      bg: data.integrity_breaches > 0 ? 'bg-rose-950 border-rose-600 shadow-glow-red animate-pulse' : 'bg-slate-900/60 border-slate-800',
      sub: data.integrity_breaches > 0 ? '🚨 TAMPER DETECTED' : '100% SHA-256 Valid',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 w-full">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`p-3 rounded-xl border backdrop-blur-md transition-all ${card.bg} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium text-slate-400 truncate">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
            </div>
            <div className="my-0.5">
              <span className={`text-xl font-bold font-mono ${card.color}`}>
                {card.value}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 truncate">
              {card.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
