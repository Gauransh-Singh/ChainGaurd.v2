import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Bell, AlertTriangle, ShieldCheck, CheckCircle2, Clock, Filter, Sparkles } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { activeCrises, sentinelResult, impactResult, authorizedDecision, successfulRecoveriesCount } = useSimulation();
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');

  // Build live notification items
  const notifications: {
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'RESOLVED' | 'INFO';
    title: string;
    timestamp: string;
    details: string;
    badge: string;
  }[] = [];

  // Active crises
  activeCrises.forEach((c) => {
    notifications.push({
      id: c.id,
      type: 'CRITICAL',
      title: `🚨 ${c.title}`,
      timestamp: c.timestamp || 'Just now',
      details: `${c.description} Affected shipment: ${c.affectedShipmentId}. Expected delay: ${c.etaImpact}. Risk Score: ${c.riskScore}/100.`,
      badge: 'Active Chokepoint Blockade',
    });
  });

  // Blockchain authorized decisions
  if (authorizedDecision) {
    notifications.push({
      id: `AUTH-${authorizedDecision.blockNumber}`,
      type: 'RESOLVED',
      title: `✓ Human Authorization Committed (Block #${authorizedDecision.blockNumber})`,
      timestamp: authorizedDecision.authorizedAt,
      details: `Plan approved: "${authorizedDecision.optionTitle}" for shipment ${authorizedDecision.shipmentId}. Cryptographic TxHash: ${authorizedDecision.txHash}.`,
      badge: 'Blockchain Notarized',
    });
  }

  // Sentinel active alert
  if (sentinelResult) {
    notifications.push({
      id: sentinelResult.eventId,
      type: 'WARNING',
      title: `🛡️ Sentinel Anomaly Verified: ${sentinelResult.title}`,
      timestamp: new Date(sentinelResult.detectedAt).toLocaleTimeString(),
      details: `Segment ${sentinelResult.affectedSegment} verified with ${sentinelResult.confidence}% confidence. Passed to Impact Agent for physics modeling.`,
      badge: 'Sentinel Verified',
    });
  }

  // Baseline system notifications
  notifications.push({
    id: 'SYS-101',
    type: 'RESOLVED',
    title: '🟢 Mesh Network Online: 17 Global Multi-Modal Hubs Synchronized',
    timestamp: 'System Nominal',
    details: 'Continuous AIS sea-lane and radar airspace feeds streaming with zero latency.',
    badge: 'System Nominal',
  });

  const filteredNotifications = notifications.filter((n) => {
    if (filterSeverity === 'ALL') return true;
    return n.type === filterSeverity;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424] border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-700 text-amber-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">Live Real-Time Intelligence & Notification Hub</h1>
            <p className="text-xs text-slate-400 font-mono">Stream of validated disruptions, Sentinel alerts, and blockchain authorizations</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 bg-[#0a0f1d] border border-[#162035] p-3 rounded-xl">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {(['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              filterSeverity === sev
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#121829] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Notifications Stream */}
      <div className="space-y-3">
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`bg-[#0b101e] border rounded-2xl p-4 space-y-2 shadow-lg transition-all ${
              n.type === 'CRITICAL'
                ? 'border-red-600/80 bg-red-950/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                : n.type === 'WARNING'
                ? 'border-amber-600/60 bg-amber-950/20'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  n.type === 'CRITICAL'
                    ? 'bg-red-950 text-red-300 border border-red-700'
                    : n.type === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-700'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}
              >
                {n.badge}
              </span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {n.timestamp}
              </span>
            </div>

            <h3 className="text-sm font-bold text-white">{n.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{n.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
