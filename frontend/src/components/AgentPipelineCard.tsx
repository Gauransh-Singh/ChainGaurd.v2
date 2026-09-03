import React from 'react';
import { Radio, BarChart3, Lightbulb, RefreshCw, Cpu } from 'lucide-react';

export const AgentPipelineCard: React.FC = () => {
  const agents = [
    {
      num: '1',
      name: 'Sentinel Agent',
      role: 'Monitoring AIS & Corridor Signals',
      status: 'ACTIVE',
      statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: Radio,
      iconColor: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-800/40',
    },
    {
      num: '2',
      name: 'Impact Agent',
      role: 'Assessing Delay & Cost Cascades',
      status: 'STANDBY',
      statusColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      icon: BarChart3,
      iconColor: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/40',
    },
    {
      num: '3',
      name: 'Strategy Agent',
      role: 'Generating Reroute Alternatives',
      status: 'READY',
      statusColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: Lightbulb,
      iconColor: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/40',
    },
    {
      num: '4',
      name: 'Recovery Agent',
      role: 'Monitoring Consensus Execution',
      status: 'ACTIVE',
      statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      icon: RefreshCw,
      iconColor: 'text-blue-400',
      bg: 'bg-blue-950/40 border-blue-800/40',
    },
  ];

  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              AI Agent Pipeline
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Rule-Based Engine Active (AI Modular Shell)
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 border border-emerald-700 text-emerald-300">
          Engine Online
        </span>
      </div>

      <div className="space-y-2.5">
        {agents.map((ag) => {
          const Icon = ag.icon;
          return (
            <div
              key={ag.num}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${ag.bg} border ${ag.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    {ag.num}. {ag.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{ag.role}</div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${ag.statusColor}`}
              >
                {ag.status}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Interfaces: DisruptionDetector / RoutePlanner</span>
        <span className="text-cyan-400">Pluggable Shell Ready</span>
      </div>
    </div>
  );
};
