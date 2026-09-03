import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertOctagon } from 'lucide-react';
import { ChainStatus } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  chainStatus?: ChainStatus;
  wsConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  chainStatus,
  wsConnected,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navTabs = [
    { id: 'hub', label: '1. Master Hub' },
    { id: 'carrier', label: '2. Carrier Node' },
    { id: 'customs', label: '3. Customs Gate' },
    { id: 'hospital', label: '4. Receiver Hospital' },
    { id: 'ledger', label: '5. Blockchain Ledger' },
    { id: 'controls', label: '6. Sim Controller' },
  ];

  const isValid = chainStatus?.is_valid ?? true;

  return (
    <header className="w-full bg-[#0d1322]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 px-4 py-2.5">
      <div className="max-w-[1780px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 p-0.5 shadow-glow-blue flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1322] rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-white tracking-tight">
                Chain<span className="text-cyan-400">Guard</span>
              </span>
              <span className="px-1.5 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-mono rounded">
                v2.0 PROTOTYPE
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Cold-Chain Logistics &amp; Verification Network
            </div>
          </div>
        </div>

        {/* Center: Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Operational Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
            <span className={wsConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {wsConnected ? '● Node Online' : 'Offline'}
            </span>
          </div>

          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-medium transition-colors ${
              isValid
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                : 'bg-rose-950 border-rose-600 text-rose-300 shadow-glow-red animate-pulse'
            }`}
          >
            {isValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>✓ Hash-Chain Valid</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>🚨 INTEGRITY BREACH</span>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300">
            {timeStr || '12:00:00'} UTC
          </div>
        </div>
      </div>
    </header>
  );
};
