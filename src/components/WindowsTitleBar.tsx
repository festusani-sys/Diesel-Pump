/**
 * @license
 * ASME B31.3 Diesel Piping - Windows Desktop Chrome & Action Ribbon
 */

import React from 'react';
import { UnitSystem } from '../types';

interface WindowsTitleBarProps {
  unitSystem: UnitSystem;
  onToggleUnitSystem: () => void;
  onOpenMaterials: () => void;
  onExportPdf: () => void;
  onExportCsv?: () => void;
  onOpenHelp: () => void;
  onResetAllData?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const WindowsTitleBar: React.FC<WindowsTitleBarProps> = ({
  unitSystem,
  onToggleUnitSystem,
  onOpenMaterials,
  onExportPdf,
  onExportCsv,
  onOpenHelp,
  onResetAllData,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 select-none">
      {/* Upper Window Frame Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-900 text-xs">
        <div className="flex items-center gap-2">
          {/* Engineering App Glyph */}
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
            </svg>
          </div>
          <span className="font-medium text-slate-300 text-[11px] tracking-wide">
            Diesel Piping & Pump Workstation v2.4 Enterprise
          </span>
          <span className="text-[10px] text-blue-400 font-mono bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-800/40">
            x64 WinUI 3
          </span>
        </div>

        {/* Windows Window Controls */}
        <div className="flex items-center text-slate-400">
          <button className="w-7 h-5 flex items-center justify-center hover:bg-slate-800 hover:text-white transition">
            <svg className="w-3 h-3" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <button className="w-7 h-5 flex items-center justify-center hover:bg-slate-800 hover:text-white transition">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </button>
          <button className="w-7 h-5 flex items-center justify-center hover:bg-red-600 hover:text-white transition">
            <svg className="w-3 h-3" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Action Command Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-900/95 text-xs">
        <div className="flex items-center gap-1.5">
          {/* Export PDF Button */}
          <button
            onClick={onExportPdf}
            className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1.5 rounded flex items-center gap-1.5 transition shadow-sm"
            title="Generate professional PE-stamped PDF technical calculation sheet"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Signed PDF Report
          </button>

          {/* Export CSV Data Button */}
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium px-3 py-1.5 rounded flex items-center gap-1.5 transition shadow-sm"
              title="Download raw hydraulic calculation data and BOM as CSV for spreadsheet analysis"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV Data
            </button>
          )}

          {/* Material Database Button */}
          <button
            onClick={onOpenMaterials}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 flex items-center gap-1.5 transition"
          >
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            ASME Material Catalog
          </button>

          {/* Equations & Standards */}
          <button
            onClick={onOpenHelp}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-700 flex items-center gap-1.5 transition"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Standards & Formulas
          </button>

          {/* Reset / Clear Data Button */}
          {onResetAllData && (
            <button
              onClick={onResetAllData}
              className="bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 px-3 py-1.5 rounded border border-slate-700 hover:border-red-800/60 flex items-center gap-1.5 transition text-xs"
              title="Clear all input fields and start fresh selection"
            >
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All Data
            </button>
          )}
        </div>

        {/* Right Settings */}
        <div className="flex items-center gap-2">
          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded border border-slate-800">
            <button
              onClick={onToggleUnitSystem}
              className={`px-2.5 py-1 rounded text-xs transition font-mono font-medium ${
                unitSystem === 'SI' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SI (m, m³/h, bar)
            </button>
            <button
              onClick={onToggleUnitSystem}
              className={`px-2.5 py-1 rounded text-xs transition font-mono font-medium ${
                unitSystem === 'Imperial' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Imperial (ft, GPM, psi)
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Toggle CAD Workstation Theme"
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
