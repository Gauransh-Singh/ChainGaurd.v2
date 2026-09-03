import React from 'react';
import { Sparkles } from 'lucide-react';

interface DemoTimelineProps {
  demoActive: boolean;
  demoPhase: number;
}

export const DemoTimeline: React.FC<DemoTimelineProps> = ({ demoActive, demoPhase }) => {
  if (!demoActive && demoPhase === 0) return null;

  const phases = [
    { num: 1, label: 'Shipments Moving' },
    { num: 2, label: 'Approaching Dubai' },
    { num: 3, label: 'Red Sea Crisis' },
    { num: 4, label: 'Route Blocked' },
    { num: 5, label: 'Alternatives Ready' },
    { num: 6, label: 'Carrier Approved' },
    { num: 7, label: 'Block Mined' },
    { num: 8, label: 'Map Rerouted' },
    { num: 9, label: 'Resuming Transit' },
    { num: 10, label: 'Customs Synced' },
    { num: 11, label: 'Hospital Synced' },
    { num: 12, label: 'Hospital Arrival' },
    { num: 13, label: 'Hospital Accepted' },
    { num: 14, label: 'Escrow Released' },
    { num: 15, label: 'Tamper Injected' },
    { num: 16, label: 'Breach Detected' },
    { num: 17, label: 'Audit Complete' },
  ];

  return (
    <div className="bg-slate-900/95 border border-purple-800/80 rounded-xl p-3 shadow-glow-purple mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
          <span className="text-xs font-bold text-purple-300 uppercase tracking-wider font-mono">
            Autonomous 17-Phase Demo Workflow
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-400">
          Phase {demoPhase} / 17
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-1.5">
        {phases.map((p) => {
          const isDone = demoPhase > p.num;
          const isCurrent = demoPhase === p.num;
          return (
            <div
              key={p.num}
              className={`p-1.5 rounded text-center transition-all ${
                isCurrent
                  ? 'bg-purple-900 text-purple-200 border border-purple-500 font-bold shadow-glow-purple'
                  : isDone
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                  : 'bg-slate-950 text-slate-600 border border-slate-900'
              }`}
            >
              <div className="text-[10px] font-mono">{p.num}. {p.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
