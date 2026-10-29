/**
 * @license
 * ASME B31.3 Diesel Piping - Valve & Fitting Loss Coefficient (K) Editor
 */

import React from 'react';
import { FittingItem } from '../types';

interface FittingsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fittings: FittingItem[];
  onChangeFittings: (fittings: FittingItem[]) => void;
}

export const FITTING_PRESETS = [
  { type: 'elbow_90', name: '90° Elbow (Standard LR)', kValue: 0.3 },
  { type: 'elbow_45', name: '45° Elbow', kValue: 0.18 },
  { type: 'tee_thru', name: 'Tee (Through Flow)', kValue: 0.2 },
  { type: 'tee_branch', name: 'Tee (Branch Flow 90°)', kValue: 0.9 },
  { type: 'gate_valve', name: 'Gate Valve (Full Open)', kValue: 0.15 },
  { type: 'ball_valve', name: 'Ball Valve (Full Port)', kValue: 0.05 },
  { type: 'globe_valve', name: 'Globe Valve (Full Open)', kValue: 4.0 },
  { type: 'check_valve', name: 'Swing Check Valve', kValue: 2.0 },
  { type: 'foot_valve', name: 'Foot Valve with Poppet & Strainer', kValue: 3.5 },
  { type: 'y_strainer', name: 'Y-Strainer (Clean Diesel Screen)', kValue: 1.2 },
  { type: 'flow_switch', name: 'Flow Switch (Paddle / Inline)', kValue: 0.9 },
  { type: 'duplex_strainer', name: 'Duplex Basket Strainer', kValue: 1.8 },
  { type: 'anti_siphon', name: 'Anti-Siphon Valve (ASV)', kValue: 2.5 },
  { type: 'entrance', name: 'Pipe Inward Entrance (Flush)', kValue: 0.5 },
  { type: 'exit', name: 'Pipe Exit to Tank', kValue: 1.0 },
];

export const FittingsEditorModal: React.FC<FittingsEditorModalProps> = ({
  isOpen,
  onClose,
  fittings,
  onChangeFittings,
}) => {
  if (!isOpen) return null;

  const handleUpdateCount = (id: string, count: number) => {
    const updated = fittings.map((f) => (f.id === id ? { ...f, count: Math.max(0, count) } : f));
    onChangeFittings(updated);
  };

  const handleAddFitting = (preset: (typeof FITTING_PRESETS)[0], location: 'suction' | 'discharge') => {
    const newItem: FittingItem = {
      id: `${preset.type}_${Date.now()}`,
      type: preset.type,
      name: preset.name,
      kValue: preset.kValue,
      count: 1,
      location,
    };
    onChangeFittings([...fittings, newItem]);
  };

  const handleRemove = (id: string) => {
    onChangeFittings(fittings.filter((f) => f.id !== id));
  };

  const suctionK = fittings
    .filter((f) => f.location === 'suction')
    .reduce((sum, f) => sum + f.kValue * f.count, 0);

  const dischargeK = fittings
    .filter((f) => f.location === 'discharge')
    .reduce((sum, f) => sum + f.kValue * f.count, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Fittings, Valves & Minor Losses Bill of Materials (K-Factor)
              </h2>
              <p className="text-xs text-slate-400">
                Crane TP 410 Equivalent K-Values | Total Suction ΣK: {suctionK.toFixed(2)} | Total Discharge ΣK:{' '}
                {dischargeK.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Quick Add Fitting Section */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-xs font-semibold text-slate-200 block mb-2">Add Standard Component to Pipeline</span>
            <div className="flex flex-wrap gap-2">
              {FITTING_PRESETS.slice(0, 8).map((p) => (
                <div key={p.type} className="flex rounded bg-slate-900 border border-slate-800 text-[11px] overflow-hidden">
                  <span className="px-2 py-1 text-slate-300">
                    {p.name.split('(')[0]} (K={p.kValue})
                  </span>
                  <button
                    onClick={() => handleAddFitting(p, 'suction')}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white px-2 py-1 transition border-l border-slate-800"
                    title="Add to Suction Line"
                  >
                    +Suction
                  </button>
                  <button
                    onClick={() => handleAddFitting(p, 'discharge')}
                    className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-2 py-1 transition border-l border-slate-800"
                    title="Add to Discharge Line"
                  >
                    +Discharge
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Fittings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Component Name</th>
                  <th className="py-2.5 px-3">Loss Coeff (K)</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Subtotal K</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {fittings.map((fit) => {
                  const subK = fit.kValue * fit.count;
                  return (
                    <tr key={fit.id} className="hover:bg-slate-950/40">
                      <td className="py-2 px-3">
                        <span
                          className={`font-semibold text-[10px] uppercase px-2 py-0.5 rounded ${
                            fit.location === 'suction'
                              ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                          }`}
                        >
                          {fit.location}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-200">{fit.name}</td>
                      <td className="py-2 px-3 font-mono">{fit.kValue}</td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateCount(fit.id, fit.count - 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={fit.count}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleUpdateCount(fit.id, parseInt(e.target.value) || 0)}
                            className="w-12 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-center font-mono text-slate-100 text-xs"
                          />
                          <button
                            onClick={() => handleUpdateCount(fit.id, fit.count + 1)}
                            className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-100">{subK.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleRemove(fit.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <div className="text-slate-400 font-mono">
            Total Combined Head Loss Factor ΣK = {(suctionK + dischargeK).toFixed(2)}
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-md transition font-medium"
          >
            Apply &amp; Return
          </button>
        </div>
      </div>
    </div>
  );
};
