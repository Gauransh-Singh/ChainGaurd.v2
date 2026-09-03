import React, { useState } from 'react';
import { AlertOctagon, X, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface TamperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TamperModal: React.FC<TamperModalProps> = ({ isOpen, onClose }) => {
  const [blockIndex, setBlockIndex] = useState<number>(1);
  const [fakeCargo, setFakeCargo] = useState<string>('MALICIOUS_CONTRABAND_PAYLOAD');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTamper = async () => {
    setLoading(true);
    try {
      const res = await api.tamperBlockchain(blockIndex, {
        decision: fakeCargo,
        cost_delta_usd: 0,
        unauthorized_actor: 'MALICIOUS_INTERCEPTOR',
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0d1322] border border-rose-800/80 rounded-2xl max-w-lg w-full p-6 shadow-glow-red relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-400">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Simulate Cryptographic Ledger Tampering
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Modifies block payload directly in memory without recalculating SHA-256
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1 font-mono">
              Target Block Index:
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={blockIndex}
              onChange={(e) => setBlockIndex(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1 font-mono">
              Injected Malicious Value:
            </label>
            <input
              type="text"
              value={fakeCargo}
              onChange={(e) => setFakeCargo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
            />
          </div>

          {result && (
            <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-700 text-[11px] font-mono text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-rose-300">
                <ShieldAlert className="w-4 h-4" />
                🚨 CRYPTOGRAPHIC MISMATCH IDENTIFIED
              </div>
              <div>Target Block: #{result.tampered_block_index}</div>
              <div>Validation: {result.validation_result ? 'VALID' : 'INVALID'}</div>
              <div className="text-slate-300 text-[10px] break-all">
                Reason: {result.details?.reason}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono"
            >
              Close
            </button>
            <button
              disabled={loading}
              onClick={handleTamper}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono shadow-glow-red"
            >
              {loading ? 'Injecting...' : 'EXECUTE TAMPER ATTACK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
