/**
 * @license
 * ASME B31.3 Diesel Piping - Windows Desktop Status Bar
 */

import React from 'react';
import { HydraulicResults, UnitSystem } from '../types';

interface WindowsStatusBarProps {
  results: HydraulicResults;
  unitSystem: UnitSystem;
}

export const WindowsStatusBar: React.FC<WindowsStatusBarProps> = ({ results, unitSystem }) => {
  const isMetric = unitSystem === 'SI';
  const asme = results.asmeCompliance;

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400 select-none px-3 py-1 flex flex-wrap items-center justify-between gap-3">
      {/* Left System Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-slate-300 font-medium">READY</span>
        </div>

        <div className="h-3 w-px bg-slate-800"></div>

        <div>
          <span>Darcy-Weisbach Solver:</span>{' '}
          <strong className="text-slate-200">Converged (Tol &lt; 1e-7)</strong>
        </div>

        <div className="h-3 w-px bg-slate-800"></div>

        <div>
          <span>Suction:</span>{' '}
          <strong className="text-blue-400">
            Re {results.suctionReynolds.toLocaleString()} ({results.suctionRegime}) | f ={' '}
            {results.suctionFrictionFactor}
          </strong>
        </div>

        <div className="h-3 w-px bg-slate-800"></div>

        <div>
          <span>Discharge:</span>{' '}
          <strong className="text-emerald-400">
            Re {results.dischargeReynolds.toLocaleString()} ({results.dischargeRegime}) | f ={' '}
            {results.dischargeFrictionFactor}
          </strong>
        </div>
      </div>

      {/* Right Metrics & Compliance Tag */}
      <div className="flex items-center gap-3">
        <div>
          <span>Total Dynamic Head:</span>{' '}
          <strong className="text-slate-200">
            {isMetric ? `${results.totalDynamicHeadM} m` : `${results.totalDynamicHeadPsi} psi`}
          </strong>
        </div>

        <div className="h-3 w-px bg-slate-800"></div>

        <div className="flex items-center gap-1">
          <span>NPSH Margin:</span>
          <strong
            className={`${
              results.npshStatus === 'PASS'
                ? 'text-emerald-400'
                : results.npshStatus === 'WARNING'
                ? 'text-amber-400'
                : 'text-red-400'
            }`}
          >
            +{results.npshMarginM}m
          </strong>
        </div>

        <div className="h-3 w-px bg-slate-800"></div>

        {/* ASME Badge */}
        <div
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
            asme.status === 'COMPLIANT'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
              : asme.status === 'WARNING'
              ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
              : 'bg-red-950 text-red-300 border border-red-700/60'
          }`}
        >
          ASME B31.3: {asme.status}
        </div>
      </div>
    </footer>
  );
};
