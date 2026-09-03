import React from 'react';
import {
  LayoutGrid,
  Truck,
  AlertTriangle,
  Cpu,
  Sliders,
  Bell,
  Box,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'shipments', label: 'Shipments', icon: Truck },
    { id: 'agents', label: 'AI Agents', icon: Cpu },
    { id: 'simulation', label: 'Simulation', icon: Sliders },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'ledger', label: 'Blockchain Ledger', icon: Box },
  ];

  return (
    <aside
      className={`bg-[#0a0e1a] border-r border-[#161d2f] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Branding & Collapse Button */}
      <div>
        <div
          className={`p-3.5 flex items-center justify-between border-b border-[#161d2f]/80 ${
            isCollapsed ? 'flex-col gap-2' : ''
          }`}
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(139,92,246,0.35)]">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200 truncate">
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1">
                  Chain<span className="text-purple-400">Guard</span>
                </div>
                <div className="text-[9px] text-slate-400 font-sans tracking-tight truncate">
                  AI Supply Chain Resilience
                </div>
              </div>
            )}
          </div>

          {/* Toggle / Collapse Button */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="w-7 h-7 rounded-lg bg-[#121829] hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-slate-400 hover:text-purple-300 flex items-center justify-center transition-all cursor-pointer shadow"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className={`py-2 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isCollapsed
                      ? 'justify-center p-2.5'
                      : 'space-x-3 px-3.5 py-2.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/30 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)] font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#121829]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive ? 'text-purple-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-[#121829] text-slate-200 text-xs font-sans rounded-lg border border-slate-700 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Node Information */}
      <div className="p-3 border-t border-[#161d2f]/80">
        {!isCollapsed ? (
          <div className="bg-[#0e1424] border border-[#1b253b] rounded-xl p-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <div className="truncate">
                <div className="text-[11px] font-bold text-slate-200 truncate">ChainGuard Mesh</div>
                <div className="text-[9px] font-mono text-emerald-400 truncate">17 Nodes Online</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="17 Nodes Online" />
          </div>
        )}
      </div>
    </aside>
  );
};
