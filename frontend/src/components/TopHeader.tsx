import React from 'react';
import { LayoutGrid, Compass, Building2 } from 'lucide-react';

interface TopHeaderProps {
  currentNode: string;
  onSelectNode: (node: string) => void;
  liveMode?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentNode,
  onSelectNode,
  liveMode = true,
}) => {
  const nodes = [
    { id: 'master', label: '🌐 Master Hub', icon: LayoutGrid },
    { id: 'carrier', label: '🚢 Carrier Node', icon: Compass },
    { id: 'hospital', label: '🏥 Receiver Node', icon: Building2 },
  ];

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pt-1">
      {/* Welcome Greeting */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Welcome back, Gauransh <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Multi-Node Autonomous Supply Chain Resilience Mesh
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Live Mode Badge */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#101e1d] border border-[#1b3f36] text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-[11px]">Live Multi-Node Mesh</span>
        </div>

        {/* Node Switcher Tabs Pill */}
        <div className="flex items-center bg-[#111728] border border-[#1b233a] rounded-xl p-1">
          {nodes.map((n) => {
            const isCurrent = currentNode === n.id || (currentNode === 'dashboard' && n.id === 'master');
            return (
              <button
                key={n.id}
                onClick={() => onSelectNode(n.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#182035]'
                }`}
              >
                <span>{n.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
