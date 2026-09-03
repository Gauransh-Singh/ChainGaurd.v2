import React from 'react';
import { AppEvent } from '../types';
import { Terminal } from 'lucide-react';

interface EventStreamProps {
  events: AppEvent[];
}

export const EventStream: React.FC<EventStreamProps> = ({ events }) => {
  const getBadgeStyle = (severity: string, type: string) => {
    if (type.includes('CRISIS') || severity === 'CRITICAL') {
      return 'bg-rose-950/80 text-rose-400 border-rose-800';
    }
    if (type.includes('BLOCKED') || severity === 'WARNING') {
      return 'bg-amber-950/80 text-amber-400 border-amber-800';
    }
    if (type.includes('APPROVED') || type.includes('ACCEPTED') || severity === 'SUCCESS') {
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
    }
    if (type.includes('BLOCK_CREATED') || type.includes('LEDGER')) {
      return 'bg-purple-950/80 text-purple-400 border-purple-800';
    }
    return 'bg-blue-950/80 text-cyan-400 border-blue-800';
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString('en-US', { hour12: false });
    } catch {
      return ts;
    }
  };

  return (
    <div className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Real-Time Event Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          Live Telemetry &amp; Consensus Bus
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
        {events.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-500">
            Awaiting simulation events...
          </div>
        ) : (
          events.map((evt) => (
            <div
              key={evt.id}
              className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition-all text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] text-slate-400">
                    {formatTime(evt.timestamp)}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${getBadgeStyle(
                      evt.severity,
                      evt.type
                    )}`}
                  >
                    [{evt.type}]
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {evt.shipment_id !== 'ALL' ? evt.shipment_id : 'SYSTEM'}
                </span>
              </div>
              <div className="text-slate-200 font-medium text-xs mb-0.5">
                {evt.title}
              </div>
              <div className="text-slate-400 text-[11px] font-mono leading-relaxed">
                {evt.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
