/**
 * @license
 * ASME B31.3 Diesel Piping - Graphical Tank & Pipe Arrangement Selector
 * Features 2D P&ID Architecture Diagrams & Hydraulic Grade Line (HGL)
 */

import React from 'react';
import { HydraulicResults, TankArrangement, TankArrangementId, UnitSystem } from '../types';

export const TANK_ARRANGEMENTS: TankArrangement[] = [
  {
    id: 'ust_suction_lift',
    name: 'Underground Tank (UST) Suction Lift',
    category: 'Mission Critical & EDG Backup',
    description: 'Submerged foot valve in buried UST, suction lift to ground-level pump skid, discharging up to elevated day tank.',
    defaultSuctionElevM: 2.8, // 2.8 m lift
    defaultPumpElevM: 0.0,
    defaultDischargeElevM: 6.5, // 6.5 m rise to day tank
    defaultSuctionLenM: 14.0,
    defaultDischargeLenM: 40.0,
    defaultSuctionNps: '2',
    defaultDischargeNps: '2',
    defaultFlowM3h: 12.0,
  },
  {
    id: 'ast_flooded_suction',
    name: 'Aboveground Tank (AST) Flooded Suction',
    category: 'Bulk Storage & Distribution',
    description: 'Positive static head from vertical bulk storage tank, flooded suction to transfer pump skid and overland delivery line.',
    defaultSuctionElevM: -3.0, // 3 m positive head
    defaultPumpElevM: 0.0,
    defaultDischargeElevM: 4.0,
    defaultSuctionLenM: 8.0,
    defaultDischargeLenM: 85.0,
    defaultSuctionNps: '3',
    defaultDischargeNps: '2-1/2',
    defaultFlowM3h: 25.0,
  },
  {
    id: 'day_tank_gravity',
    name: 'Day Tank Gravity Feed to Generator',
    category: 'Generator Room Fuel Supply',
    description: 'Direct gravity head supply from day tank through fusible link fire valve to emergency diesel generator (EDG) fuel rail.',
    defaultSuctionElevM: -2.0, // gravity feed down
    defaultPumpElevM: 0.0,
    defaultDischargeElevM: 0.5,
    defaultSuctionLenM: 6.0,
    defaultDischargeLenM: 8.0,
    defaultSuctionNps: '1-1/4',
    defaultDischargeNps: '1',
    defaultFlowM3h: 4.0,
  },
  {
    id: 'duplex_duty_standby',
    name: 'Duplex Duty/Standby Pump Skid',
    category: 'Hospital / Data Center Tier IV',
    description: 'Dual redundant fuel pumps with common suction and discharge manifolds, duplex basket strainers, and non-return valves.',
    defaultSuctionElevM: 2.0,
    defaultPumpElevM: 0.0,
    defaultDischargeElevM: 8.0,
    defaultSuctionLenM: 16.0,
    defaultDischargeLenM: 55.0,
    defaultSuctionNps: '2-1/2',
    defaultDischargeNps: '2',
    defaultFlowM3h: 18.0,
  },
  {
    id: 'tanker_unloading',
    name: 'Road Tanker Truck Unloading Skid',
    category: 'Fuel Receiving Terminal',
    description: 'Road tanker offloading via flexible hose, self-priming pump skid, air eliminator, and fill line into bulk storage tank.',
    defaultSuctionElevM: 0.5,
    defaultPumpElevM: 0.0,
    defaultDischargeElevM: 7.5,
    defaultSuctionLenM: 10.0,
    defaultDischargeLenM: 45.0,
    defaultSuctionNps: '3',
    defaultDischargeNps: '3',
    defaultFlowM3h: 35.0,
  },
];

interface ArrangementSelectorProps {
  selectedId: TankArrangementId;
  onSelect: (arr: TankArrangement) => void;
  results: HydraulicResults;
  unitSystem: UnitSystem;
}

export const ArrangementSelector: React.FC<ArrangementSelectorProps> = ({
  selectedId,
  onSelect,
  results,
  unitSystem,
}) => {
  const isMetric = unitSystem === 'SI';
  const currentArrangement = TANK_ARRANGEMENTS.find((a) => a.id === selectedId) || TANK_ARRANGEMENTS[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-slate-100 text-sm">
              Tank & Pipeline Architecture Configuration
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Select standard industrial arrangement to load baseline elevations, fittings, and P&ID layout
          </p>
        </div>
        <span className="text-xs font-mono bg-blue-950 text-blue-300 border border-blue-800/60 px-2.5 py-1 rounded">
          Active: {currentArrangement.name}
        </span>
      </div>

      {/* Arrangement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-4">
        {TANK_ARRANGEMENTS.map((arr) => {
          const isSelected = arr.id === selectedId;
          return (
            <button
              key={arr.id}
              onClick={() => onSelect(arr)}
              className={`p-3 rounded-lg text-left transition border flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/50 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div>
                <h4 className="font-semibold text-xs text-slate-100 leading-snug">{arr.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{arr.description}</p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Default: {arr.defaultFlowM3h} m³/h</span>
                <span className={isSelected ? 'text-blue-400 font-bold' : 'text-slate-500'}>
                  {isSelected ? 'SELECTED' : 'SELECT'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2D P&ID & Hydraulic Grade Line (HGL) Schematic */}
      <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dynamic Process & Hydraulic Grade Line (HGL) Profile
          </span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-blue-400"></span> Piping Centerline
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-400 border-t border-dashed"></span> Hydraulic Grade Line (HGL)
            </span>
          </div>
        </div>

        {/* Dynamic SVG Schematic */}
        <div className="w-full overflow-x-auto flex justify-center py-2">
          <svg viewBox="0 0 820 250" className="w-full max-w-[820px] h-auto">
            {/* Background Datum & Ground Lines */}
            <line x1="20" y1="180" x2="800" y2="180" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="30" y="174" fill="#64748b" fontSize="9" fontFamily="monospace">
              GRADE DATUM EL. 0.00m
            </text>

            {/* SOURCE TANK */}
            {selectedId === 'ust_suction_lift' ? (
              // UST Buried Tank
              <g>
                <rect x="40" y="185" width="130" height="55" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <rect x="44" y="200" width="122" height="36" rx="4" fill="#b45309" fillOpacity="0.45" />
                <text x="105" y="222" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
                  DIESEL UST
                </text>
                <text x="105" y="234" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                  El. -{results.staticHeadM > 0 ? (results.staticHeadM * 0.4).toFixed(1) : '2.8'}m
                </text>

                {/* Foot Valve */}
                <circle cx="110" cy="225" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                <text x="110" y="228" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                  FV
                </text>

                {/* Suction Riser */}
                <line x1="110" y1="225" x2="110" y2="150" stroke="#38bdf8" strokeWidth="4" />
                <line x1="110" y1="150" x2="350" y2="150" stroke="#38bdf8" strokeWidth="4" />
              </g>
            ) : selectedId === 'ast_flooded_suction' ? (
              // AST Bulk Tank
              <g>
                <rect x="35" y="60" width="140" height="120" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <rect x="40" y="80" width="130" height="96" fill="#b45309" fillOpacity="0.45" />
                <text x="105" y="130" textAnchor="middle" fill="#fde68a" fontSize="11" fontWeight="bold">
                  BULK AST TANK
                </text>
                <text x="105" y="145" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                  Flooded Head +3.0m
                </text>

                {/* Bottom Suction Nozzle */}
                <line x1="175" y1="155" x2="350" y2="155" stroke="#38bdf8" strokeWidth="4" />
                {/* Suction Gate Valve */}
                <polygon points="230,150 245,160 230,160 245,150" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />
              </g>
            ) : (
              // General / Day Tank
              <g>
                <rect x="45" y="90" width="115" height="90" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                <rect x="50" y="115" width="105" height="60" fill="#b45309" fillOpacity="0.45" />
                <text x="102" y="145" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
                  SUPPLY TANK
                </text>
                <line x1="160" y1="150" x2="350" y2="150" stroke="#38bdf8" strokeWidth="4" />
              </g>
            )}

            {/* Suction Strainer */}
            <rect x="280" y="142" width="22" height="16" rx="2" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
            <text x="291" y="154" textAnchor="middle" fill="#e2e8f0" fontSize="8" fontWeight="bold">
              Y-STR
            </text>

            {/* PUMP SKID AT CENTER */}
            <g transform="translate(350, 125)">
              {/* Skid Base */}
              <rect x="-10" y="45" width="120" height="12" rx="2" fill="#0f172a" stroke="#3b82f6" strokeWidth="1" />
              {/* Electric Motor */}
              <rect x="0" y="10" width="45" height="35" rx="3" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
              <text x="22" y="32" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                MOTOR
              </text>
              {/* Pump Casing */}
              <circle cx="70" cy="25" r="20" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
              <text x="70" y="28" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                PUMP
              </text>

              {/* Suction Gauge */}
              <circle cx="50" cy="0" r="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="50" y="4" textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">
                P_s
              </text>

              {/* Discharge Gauge */}
              <circle cx="85" cy="-5" r="10" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
              <text x="85" y="-1" textAnchor="middle" fill="#ef4444" fontSize="7" fontFamily="monospace">
                P_d
              </text>
            </g>

            {/* DISCHARGE PIPING */}
            <g>
              {/* Vertical rise from pump */}
              <line x1="420" y1="130" x2="420" y2="45" stroke="#10b981" strokeWidth="4" />
              {/* Overhead horizontal run */}
              <line x1="420" y1="45" x2="680" y2="45" stroke="#10b981" strokeWidth="4" />
              {/* Drop down to day tank */}
              <line x1="680" y1="45" x2="680" y2="75" stroke="#10b981" strokeWidth="4" />

              {/* Swing Check Valve */}
              <polygon points="414,105 426,105 420,95" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
              <text x="435" y="103" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                NRV
              </text>

              {/* Discharge Isolation Ball Valve */}
              <polygon points="510,40 525,50 510,50 525,40" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.8" />

              {/* Turbine Flowmeter */}
              <rect x="560" y="38" width="22" height="14" rx="2" fill="#0284c7" stroke="#93c5fd" strokeWidth="1" />
              <text x="571" y="48" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                FT
              </text>
            </g>

            {/* DESTINATION DAY TANK */}
            <g transform="translate(620, 65)">
              <rect x="15" y="10" width="95" height="75" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <rect x="20" y="35" width="85" height="46" fill="#b45309" fillOpacity="0.45" />
              <text x="62" y="58" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
                DAY TANK
              </text>
              <text x="62" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="8" fontFamily="monospace">
                El. +{results.staticHeadM > 0 ? results.staticHeadM.toFixed(1) : '6.5'}m
              </text>

              {/* Anti-Siphon Valve */}
              <circle cx="60" cy="10" r="7" fill="#6366f1" stroke="#ffffff" strokeWidth="1" />
              <text x="60" y="13" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                ASV
              </text>

              {/* Stand Legs */}
              <line x1="25" y1="85" x2="25" y2="115" stroke="#64748b" strokeWidth="3" />
              <line x1="100" y1="85" x2="100" y2="115" stroke="#64748b" strokeWidth="3" />
            </g>

            {/* DYNAMIC HYDRAULIC GRADE LINE (HGL) */}
            {/* Suction HGL starts at liquid surface, slopes downward due to friction */}
            <path
              d="M 110 195 L 350 165 L 420 20 L 680 65"
              fill="none"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="4 3"
            />

            {/* Callouts & Values */}
            <text x="210" y="135" fill="#38bdf8" fontSize="9" fontFamily="monospace">
              Suction {results.suctionVelocityMps} m/s
            </text>
            <text x="470" y="32" fill="#34d399" fontSize="9" fontFamily="monospace">
              Discharge {results.dischargeVelocityMps} m/s | TDH = {results.totalDynamicHeadM}m
            </text>
          </svg>
        </div>

        {/* Arrangement Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-slate-800 pt-3 mt-1 text-xs">
          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-slate-400 block text-[10px]">Suction Head Lift:</span>
            <span className="text-slate-200 font-mono font-medium">
              {results.staticHeadM > 0 ? `${(results.staticHeadM * 0.35).toFixed(1)} m` : 'Flooded (+3m)'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-slate-400 block text-[10px]">Discharge Static Rise:</span>
            <span className="text-slate-200 font-mono font-medium">
              {results.staticHeadM > 0 ? `${(results.staticHeadM * 0.65).toFixed(1)} m` : '6.5 m'}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-slate-400 block text-[10px]">Total Dynamic Head:</span>
            <span className="text-blue-400 font-mono font-bold">
              {isMetric ? `${results.totalDynamicHeadM} m` : `${results.totalDynamicHeadPsi} psi`}
            </span>
          </div>
          <div className="bg-slate-900/60 p-2 rounded">
            <span className="text-slate-400 block text-[10px]">NPSH Cavitation Margin:</span>
            <span className="text-emerald-400 font-mono font-bold">+{results.npshMarginM} m (Safe)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
