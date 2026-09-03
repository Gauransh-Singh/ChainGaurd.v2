import React from 'react';
import { Package, ShieldAlert, FileText, ExternalLink, Ship, Plane, Clock, AlertTriangle } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { LOCATIONS_MAP } from '../utils/routingEngine';

interface CardProps {
  onViewAll?: () => void;
  onViewLedger?: () => void;
}

export const ActiveShipmentsCard: React.FC<CardProps> = ({ onViewAll }) => {
  const { shipments, selectedShipmentId, selectShipment } = useSimulation();

  return (
    <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Active Shipments ({shipments.length})</span>
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
            Live Telemetry
          </span>
        </div>

        <div className="space-y-2">
          {shipments.map((s) => {
            const isSelected = selectedShipmentId === s.id;
            const isDisrupted = s.status === 'DISRUPTED' || s.status === 'AT RISK';
            const fromLoc = LOCATIONS_MAP[s.from];
            const toLoc = LOCATIONS_MAP[s.to];

            return (
              <div
                key={s.id}
                onClick={() => selectShipment(isSelected ? null : s.id)}
                className={`bg-[#090e1a] border rounded-xl p-2.5 transition-all cursor-pointer ${
                  isDisrupted
                    ? 'border-red-500 bg-red-950/30 shadow-[0_0_12px_#ef4444]'
                    : isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_10px_#0ea5e9]'
                    : 'border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                    <span className={isDisrupted ? 'text-red-400' : ''}>{s.id}</span>
                    <span className="text-[10px] text-slate-400 font-sans font-normal truncate max-w-[120px]">
                      • {s.cargo}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${
                    isDisrupted
                      ? 'bg-red-950 border-red-500 text-red-300 font-bold animate-pulse'
                      : s.status === 'DELIVERED'
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-400'
                      : s.status === 'PORT DOCKED' || s.status === 'TRANSSHIPMENT' || s.status === 'AIRPORT DOCKED'
                      ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
                      : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                  }`}>
                    {s.waitMessage ? s.waitMessage : s.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>
                    {fromLoc?.flag} {fromLoc?.name} ➔ {toLoc?.flag} {toLoc?.name}
                    <span className="text-slate-500 ml-1.5">
                      ({s.vesselType ? `${s.vesselType} • ` : ''}{s.currentSpeedKmH ? `${s.currentSpeedKmH.toFixed(0)} km/h • ` : ''}{s.eta})
                    </span>
                  </span>
                  <span className={`font-bold ${isDisrupted ? 'text-red-400' : 'text-cyan-300'}`}>{s.progress.toFixed(0)}%</span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-150 ${
                      isDisrupted
                        ? 'bg-gradient-to-r from-red-600 to-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${s.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const RecentAlertsCard: React.FC<CardProps> = () => {
  const { activeCrisis } = useSimulation();

  return (
    <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Real-Time Alert Feed</span>
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
            activeCrisis ? 'bg-red-950 border-red-500 text-red-300 animate-pulse' : 'bg-slate-800/80 border-slate-700 text-slate-400'
          }`}>
            {activeCrisis ? 'DISRUPTION ACTIVE' : 'Sentinel v2'}
          </span>
        </div>

        <div className="space-y-2">
          {activeCrisis ? (
            <div className="bg-[#1c0c12] border border-red-500/70 rounded-xl p-2.5 flex items-start gap-2 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0 animate-ping" />
              <div className="text-xs">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  <span>🚨 {activeCrisis.title}</span>
                  <span className="text-[9px] font-mono px-1 rounded bg-red-900/60 text-red-200">
                    {activeCrisis.etaImpact}
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">
                  {activeCrisis.description}
                </div>
                <div className="text-[9px] font-mono text-red-400/90 mt-1 flex items-center justify-between">
                  <span>Target: {activeCrisis.affectedShipmentId} @ {activeCrisis.locationName}</span>
                  <span>{activeCrisis.timestamp}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#090e1a] border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0 animate-pulse" />
              <div className="text-xs">
                <div className="font-semibold text-slate-200">Global Corridor Health: 100%</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  Suez, Malacca, and Gibraltar reporting zero congestion anomalies.
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#090e1a] border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-slate-200">IoT Telemetry Feed Active</div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                3 active units streaming GPS, temperature & carrier telemetry at 1s intervals.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BlockchainDecisionsCard: React.FC<CardProps> = () => {
  const { activeCrisis, sentinelResult, impactResult, authorizedDecision } = useSimulation();

  return (
    <div className="bg-[#0f1524] border border-[#1b2336] rounded-2xl p-4 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Blockchain Governance Audit Trail</span>
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-[10px] font-mono text-purple-300">
            Immutable Ledger
          </span>
        </div>

        <div className="space-y-2">
          {/* PRIMARY BLOCK: Human Authorization Record (Core Governance Accountability) */}
          {authorizedDecision && (
            <div className="bg-[#0b1f14] border-2 border-emerald-500/80 rounded-xl p-2.5 text-xs font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                <span>Block #{authorizedDecision.blockNumber}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  HUMAN_AUTHORIZATION_COMMITTED
                </span>
              </div>
              <div className="text-white font-bold mt-0.5">
                {authorizedDecision.shipmentId} ➔ {authorizedDecision.optionTitle}
              </div>
              <div className="flex items-center justify-between text-[9px] text-emerald-400/80 mt-1 pt-1 border-t border-emerald-900/40">
                <span className="truncate">Signer: 0x71C...B29 (Controller)</span>
                <span className="font-mono text-slate-400">{authorizedDecision.authorizedAt}</span>
              </div>
            </div>
          )}

          {/* Block for Impact Assessment */}
          {impactResult && (
            <div className="bg-[#18091f] border border-purple-500/50 rounded-xl p-2.5 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-purple-300 font-bold">
                <span>Block #14,895</span>
                <span className="text-purple-400">IMPACT_ASSESSMENT_NOTARIZED</span>
              </div>
              <div className="text-slate-200 font-semibold mt-0.5">
                {impactResult.shipmentId} • {impactResult.delayFormatted} Delay • {impactResult.costFormatted}
              </div>
              <div className="text-[9px] text-purple-400/70 truncate mt-0.5">
                Hash: 0x7e8d9c2b1a4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b
              </div>
            </div>
          )}

          {/* Block for Sentinel Threat Verification */}
          {sentinelResult && (
            <div className="bg-[#1c0c12] border border-red-500/50 rounded-xl p-2.5 text-xs font-mono animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-red-300 font-bold">
                <span>Block #14,894</span>
                <span className="text-red-400">SENTINEL_EVENT_FINGERPRINT ({sentinelResult.confidence}%)</span>
              </div>
              <div className="text-slate-200 font-semibold mt-0.5 truncate">{sentinelResult.title}</div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">
                Hash: {sentinelResult.eventHash || '0x9c4f1e8a2b3d5a7b081928374650129384756ef1'}
              </div>
            </div>
          )}

          {/* Nominal Heartbeat Block */}
          {!authorizedDecision && (
            <div className="bg-[#090e1a] border border-slate-800/80 rounded-xl p-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Block #14,893</span>
                <span className="text-emerald-400">Verified</span>
              </div>
              <div className="text-slate-200 font-semibold mt-0.5">TELEMETRY_HEARTBEAT_BATCH</div>
              <div className="text-[9px] text-slate-500 truncate mt-0.5">
                Hash: 0x4e7b1a9c8d2f3e506172839405162738495061cd
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const BottomSectionCards: React.FC<CardProps> = (props) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ActiveShipmentsCard {...props} />
      <RecentAlertsCard {...props} />
    </div>
  );
};
