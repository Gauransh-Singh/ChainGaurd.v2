import React from 'react';
import { SimulationState } from '../types';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  Thermometer,
  Layers,
} from 'lucide-react';

interface CustomsGateProps {
  state: SimulationState | null;
}

export const CustomsGate: React.FC<CustomsGateProps> = ({ state }) => {
  const shipments = state?.shipments || [];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8">
      {/* Page Header */}
      <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-700 text-purple-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              Customs &amp; Cross-Border Regulatory Clearance Gate
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Automated Digital Manifest Ingestion, Real-Time Route Alteration Audit &amp; IoT Seal Compliance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300">
            EU Single Window / AEO Certified
          </span>
        </div>
      </div>

      {/* Manifest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shipments.map((s) => {
          const checks = s.verification_checklist;
          const isRouteAltered = s.route_history.length > 1;

          return (
            <div
              key={s.id}
              className="bg-[#0d1322] border border-slate-800 rounded-xl p-4 shadow-xl space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-cyan-400 text-xs">{s.id}</span>
                    <span className="text-[10px] font-mono text-slate-400">HS 3004.90</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      s.status === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-100 mb-1">{s.cargo}</h3>

                <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 mb-3">
                  <div className="flex justify-between">
                    <span>Origin / Dest:</span>
                    <span className="text-slate-200">{s.origin} → {s.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Position:</span>
                    <span className="text-cyan-400">Lat: {s.current_lat.toFixed(2)}, Lng: {s.current_lng.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ETA:</span>
                    <span className="text-slate-200">{s.eta_days.toFixed(1)} Days</span>
                  </div>
                </div>

                {/* Route Alteration Notification */}
                {isRouteAltered && (
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-800 text-[11px] font-mono text-cyan-300 mb-3 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-cyan-400">
                      <FileText className="w-3.5 h-3.5" />
                      ROUTE AMENDMENT RECEIVED
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Carrier authorized dynamic bypass corridor. Manifest updated automatically.
                    </div>
                  </div>
                )}

                {/* Verification Checklist */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-slate-300 uppercase font-mono mb-1">
                    Customs Compliance Audit:
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">✓ Electronic Seal Intact</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">✓ Cold-Chain Compliant</span>
                    {checks.temp_compliant ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">✓ Cargo Classification Valid</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono p-1.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">✓ Blockchain Ledger Integrity</span>
                    {checks.chain_valid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 animate-pulse" />
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Seal ID: {s.container_seal}</span>
                <span className="text-emerald-400">CLEARANCE READY</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
