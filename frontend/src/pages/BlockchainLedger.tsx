import React, { useState, useEffect } from 'react';
import { SimulationState, Block } from '../types';
import { api } from '../services/api';
import {
  Link2,
  CheckCircle2,
  AlertOctagon,
  Lock,
  Unlock,
  ShieldCheck,
  Database,
  Hash,
  Clock,
  User,
} from 'lucide-react';

interface BlockchainLedgerProps {
  state: SimulationState | null;
  onTamperClick: () => void;
}

export const BlockchainLedger: React.FC<BlockchainLedgerProps> = ({ state, onTamperClick }) => {
  const [ledger, setLedger] = useState<Block[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLedger = async () => {
    try {
      const res = await api.getBlockchain();
      if (res.ledger) setLedger(res.ledger);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 1500);
    return () => clearInterval(interval);
  }, []);

  const isValid = state?.chain_status?.is_valid ?? true;
  const corruptionDetails = state?.chain_status?.corruption_details;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-8">
      {/* Header */}
      <div className="bg-[#0d1322] border border-slate-800 p-4 rounded-xl shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-700 text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              ChainGuard Immutable SHA-256 Blockchain Ledger
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Consensus State Machine, Previous-Hash Linking &amp; Zero-Trust Tamper Detection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onTamperClick}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-mono font-semibold"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SIMULATE DATA TAMPERING</span>
          </button>

          <button
            onClick={() => api.restoreBlockchain()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-semibold"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>RESTORE CANONICAL CHAIN</span>
          </button>
        </div>
      </div>

      {/* Integrity Banner */}
      <div
        className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between ${
          isValid
            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/80 border-rose-600 text-rose-200 shadow-glow-red animate-pulse'
        }`}
      >
        <div className="flex items-center space-x-2">
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          )}
          <div>
            <span className="font-bold text-sm">
              {isValid ? 'CHAIN INTEGRITY: 100% VALID' : '🚨 CRYPTOGRAPHIC INTEGRITY BREACH DETECTED'}
            </span>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isValid
                ? `All ${ledger.length} blocks verified with valid SHA-256 previous-hash hashes.`
                : `Block #${corruptionDetails?.corrupted_block_index} has been altered! Reason: ${corruptionDetails?.reason}`}
            </div>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-400">
          <div>Consensus: Proof-of-Authority (Simulated)</div>
          <div>Hash Algorithm: SHA-256</div>
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-3">
        {ledger.map((b, idx) => {
          const isCorrupted =
            !isValid && corruptionDetails?.corrupted_block_index === b.index;

          return (
            <div
              key={b.index}
              className={`p-4 rounded-xl border transition-all ${
                isCorrupted
                  ? 'bg-rose-950/50 border-rose-600 shadow-glow-red'
                  : 'bg-[#0d1322] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2 font-mono text-xs">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                    BLOCK #{b.index}
                  </span>
                  <span className="text-cyan-400 font-bold">[{b.event_type}]</span>
                  <span className="text-slate-400">Shipment: {b.shipment_id}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    Actor: {b.actor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {new Date(b.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Hashes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 mb-2">
                <div className="truncate">
                  <span className="text-slate-500">Previous Hash:</span>{' '}
                  <span className="text-slate-300 font-bold">{b.previous_hash}</span>
                </div>
                <div className="truncate">
                  <span className="text-slate-500">Current Hash:</span>{' '}
                  <span className={isCorrupted ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {b.hash}
                  </span>
                </div>
              </div>

              {/* Data Payload */}
              <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-[11px] font-mono text-slate-300">
                <span className="text-slate-500">Payload Data:</span>{' '}
                <pre className="text-cyan-300 whitespace-pre-wrap mt-0.5">
                  {JSON.stringify(b.data, null, 2)}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
