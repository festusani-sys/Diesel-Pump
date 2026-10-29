/**
 * @license
 * ASME B31.3 Diesel Piping - Standards, Formulas & Equations Guide
 */

import React from 'react';

interface StandardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandardsModal: React.FC<StandardsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Titlebar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Engineering Formulas & Standard Reference Manual
              </h2>
              <p className="text-xs text-slate-400">
                Governing codes: ASME B31.3-2022, API RP 2003, NFPA 30, Hydraulic Institute ANSI/HI
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          {/* Section 1: Darcy-Weisbach */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 text-blue-400">
              1. Darcy-Weisbach Equation for Major Friction Head Loss
            </h3>
            <p className="text-slate-400 mb-2">
              The fundamental hydraulic head loss formula for incompressible fluid flow in closed conduits:
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-center text-sm text-emerald-400 border border-slate-800 my-2">
              h_f = f · (L / D) · (v² / 2g)
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
              <li><strong>h_f:</strong> Head loss in meters of liquid column (or feet).</li>
              <li><strong>f:</strong> Dimensionless Darcy friction factor (from Colebrook-White).</li>
              <li><strong>L, D:</strong> Pipe length and inside diameter in uniform units.</li>
              <li><strong>v:</strong> Mean flow velocity (m/s or ft/s).</li>
              <li><strong>g:</strong> Standard acceleration of gravity (9.80665 m/s²).</li>
            </ul>
          </div>

          {/* Section 2: Colebrook-White Equation */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 text-blue-400">
              2. Colebrook-White Implicit Equation for Friction Factor f
            </h3>
            <p className="text-slate-400 mb-2">
              For turbulent flow in commercial pipes (Re ≥ 4000), solved via high-precision Newton-Raphson iteration:
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-center text-xs text-purple-400 border border-slate-800 my-2">
              1 / √f = -2 · log₁₀( (ε / 3.7D) + (2.51 / (Re · √f)) )
            </div>
            <p className="text-slate-400 text-[11px]">
              For laminar flow (Re ≤ 2300), the exact Hagen-Poiseuille relationship is used: <strong>f = 64 / Re</strong>.
              Transition regime (2300 &lt; Re &lt; 4000) utilizes cubic smoothstep blending.
            </p>
          </div>

          {/* Section 3: ASME B31.3 MAWP */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 text-blue-400">
              3. ASME B31.3 Section 304.1.2 Pressure Design of Straight Pipe
            </h3>
            <p className="text-slate-400 mb-2">
              The internal design gage pressure rating (MAWP) for straight pipe under internal pressure:
            </p>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-center text-xs text-amber-400 border border-slate-800 my-2">
              P = ( 2 · S · E · (t - c) ) / ( D - 2 · Y · (t - c) )
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
              <li><strong>S:</strong> Allowable stress from ASME B31.3 Table A-1 (e.g. 137.9 MPa for ASTM A106 Gr. B).</li>
              <li><strong>E:</strong> Longitudinal or spiral weld joint quality factor (1.0 for seamless, 0.85 for ERW).</li>
              <li><strong>t:</strong> Pipe nominal wall thickness (mm).</li>
              <li><strong>c:</strong> Sum of mechanical and corrosion allowances (default 1.5 mm for carbon steel diesel service).</li>
              <li><strong>Y:</strong> Dimensionless coefficient from Table 304.1.1 (0.4 for ferritic steels below 482°C).</li>
            </ul>
          </div>

          {/* Section 4: API RP 2003 & NFPA 30 Velocity Limits */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 text-blue-400">
              4. API RP 2003 &amp; NFPA 30 Electrostatic Velocity Safeguards
            </h3>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Diesel fuel is an accumulator liquid with low electrical conductivity (&lt; 50 pS/m). Fluid shear against pipe walls generates static electricity.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-slate-200 block">Suction Line Standard</strong>
                <span className="text-blue-400 font-mono">0.6 – 1.2 m/s (2 – 4 ft/s)</span>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Prevents vapor pocketing, minimizes suction friction drop to ensure high NPSHa.
                </p>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <strong className="text-slate-200 block">Discharge Line Standard</strong>
                <span className="text-emerald-400 font-mono">1.2 – 2.5 m/s (4 – 8 ft/s)</span>
                <p className="text-slate-500 text-[10px] mt-0.5">
                  Absolute maximum 2.5 m/s per API RP 2003 to prevent electrostatic ignition spark discharges in storage tanks.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: NPSH Calculation */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
            <h3 className="font-bold text-slate-100 text-sm mb-1 text-blue-400">
              5. Net Positive Suction Head Available (NPSHa)
            </h3>
            <div className="bg-slate-900 p-2.5 rounded font-mono text-center text-xs text-sky-400 border border-slate-800 my-2">
              NPSHa = ( (P_atm - P_vp) / (ρ · g) ) ± Z_s - h_fs
            </div>
            <p className="text-slate-400 text-[11px]">
              Per Hydraulic Institute ANSI/HI standards, an NPSH safety margin of at least <strong>0.8 m (2.5 ft)</strong> above the pump manufacturer's NPSHr is required to prevent cavitation erosion and acoustic resonance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-4 py-1.5 rounded-md transition font-medium"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
