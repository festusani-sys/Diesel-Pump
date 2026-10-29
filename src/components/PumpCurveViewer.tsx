/**
 * @license
 * ASME B31.3 Diesel Piping - Pump Performance Curves & Operating Point Visualizer
 */

import React, { useState } from 'react';
import { HydraulicResults, PumpModel, UnitSystem } from '../types';
import {
  evaluatePumpHead,
  evaluatePumpEfficiency,
  evaluatePumpNpshr,
  findPumpOperatingPoint,
  fitQuadraticPumpCurve,
  PREDEFINED_PUMPS,
} from '../utils/pumps';

interface PumpCurveViewerProps {
  selectedPump: PumpModel;
  onSelectPump: (pump: PumpModel) => void;
  results: HydraulicResults;
  unitSystem: UnitSystem;
}

export const PumpCurveViewer: React.FC<PumpCurveViewerProps> = ({
  selectedPump,
  onSelectPump,
  results,
  unitSystem,
}) => {
  const [activeTab, setActiveTab] = useState<'curve' | 'custom' | 'specs'>('curve');
  const [customManufacturer, setCustomManufacturer] = useState('Custom Engineered');
  const [customModelName, setCustomModelName] = useState('User Specified Diesel Pump');
  const [customType, setCustomType] = useState<PumpModel['type']>('Positive Displacement Gear');
  const [customRpm, setCustomRpm] = useState(1450);
  const [customMaxPressureBar, setCustomMaxPressureBar] = useState(10);
  const [customNotes, setCustomNotes] = useState('Custom pump specified by project engineer.');

  const [customPoints, setCustomPoints] = useState([
    { q: 0, h: 55, eff: 0 },
    { q: 8, h: 50, eff: 65 },
    { q: 16, h: 42, eff: 72 },
    { q: 24, h: 28, eff: 60 },
  ]);

  const isMetric = unitSystem === 'SI';
  const targetFlow = results.flowRateM3h;
  const staticHead = results.staticHeadM;
  const designTdh = results.totalDynamicHeadM;

  // System Resistance Coefficient
  const kSys = Math.max(0.001, (designTdh - staticHead) / Math.pow(Math.max(1, targetFlow), 2));

  // Calculate Operating Point
  const operatingPoint = findPumpOperatingPoint(selectedPump, staticHead, kSys, targetFlow);

  // SVG Chart Dimensions
  const svgWidth = 620;
  const svgHeight = 360;
  const padLeft = 55;
  const padRight = 55;
  const padTop = 30;
  const padBottom = 45;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  // Max X (Flow) and Max Y (Head)
  const maxFlow = Math.max(35, Math.ceil((targetFlow * 1.8) / 5) * 5);
  const maxHead = Math.max(65, Math.ceil((Math.max(selectedPump.polynomial.c, designTdh * 1.3)) / 10) * 10);

  // Coordinate transforms
  const scaleX = (q: number) => padLeft + (q / maxFlow) * plotWidth;
  const scaleY = (h: number) => padTop + plotHeight - (h / maxHead) * plotHeight;
  const scaleEff = (eff: number) => padTop + plotHeight - (eff / 100) * plotHeight;

  // Generate Pump Curve path
  const numSteps = 40;
  const pumpPoints: { x: number; y: number }[] = [];
  const systemPoints: { x: number; y: number }[] = [];
  const effPoints: { x: number; y: number }[] = [];
  const npshrPoints: { x: number; y: number }[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const q = (i / numSteps) * maxFlow;
    const hPump = evaluatePumpHead(selectedPump, q);
    const hSys = Math.max(0, staticHead + kSys * Math.pow(q, 2));
    const eff = evaluatePumpEfficiency(selectedPump, q);
    const npshr = evaluatePumpNpshr(selectedPump, q);

    if (hPump >= 0 && hPump <= maxHead * 1.1) {
      pumpPoints.push({ x: scaleX(q), y: scaleY(hPump) });
    }
    if (hSys <= maxHead * 1.1) {
      systemPoints.push({ x: scaleX(q), y: scaleY(hSys) });
    }
    effPoints.push({ x: scaleX(q), y: scaleEff(eff) });
    npshrPoints.push({ x: scaleX(q), y: scaleY(npshr) });
  }

  const makePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '');
  };

  const handleApplyCustom = () => {
    const poly = fitQuadraticPumpCurve(customPoints);
    const customModel: PumpModel = {
      id: 'custom_pump_' + Date.now(),
      manufacturer: customManufacturer || 'Custom Engineered',
      model: customModelName || 'User-Defined Pump',
      series: 'Custom Series',
      type: customType,
      speedRpm: customRpm || 1450,
      ratedFlowM3h: targetFlow,
      ratedHeadM: designTdh,
      maxPressureBar: customMaxPressureBar || 10,
      curvePoints: customPoints.map((p) => ({ q: p.q, h: p.h, efficiency: p.eff })),
      polynomial: poly,
      notes: customNotes || 'Custom user defined pump head vs flow polynomial curve.',
    };
    onSelectPump(customModel);
    setActiveTab('curve');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-xl">
      {/* Header with Selector & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-slate-100 text-sm">
              Pump Performance & System Demand Curve Sizing
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operating Point Intersection | Darcy-Weisbach Hydraulic Resistance | HI NPSH Cavitation Check
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('curve')}
            className={`px-3 py-1 rounded transition font-medium ${
              activeTab === 'curve' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            H-Q Characteristic
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded transition font-medium ${
              activeTab === 'custom' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Curve Input
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1 rounded transition font-medium ${
              activeTab === 'specs' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pump Catalog Data
          </button>
        </div>
      </div>

      {/* Model Selector Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-950/70 p-2.5 rounded-md border border-slate-800/80 mb-3 text-xs">
        <label className="text-slate-300 font-medium whitespace-nowrap">Active Pump Model:</label>
        <select
          value={selectedPump.id}
          onChange={(e) => {
            const found = PREDEFINED_PUMPS.find((p) => p.id === e.target.value);
            if (found) onSelectPump(found);
          }}
          className="flex-1 min-w-[240px] bg-slate-800 border border-slate-700 text-slate-100 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-blue-500"
        >
          {PREDEFINED_PUMPS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.manufacturer} {p.model} ({p.type})
            </option>
          ))}
          {!PREDEFINED_PUMPS.some((p) => p.id === selectedPump.id) && (
            <option value={selectedPump.id}>Custom User-Defined Model</option>
          )}
        </select>

        <div className="flex items-center gap-3 text-slate-300">
          <span>
            Type: <strong className="text-blue-400">{selectedPump.type}</strong>
          </span>
          <span>
            Speed: <strong className="text-slate-200">{selectedPump.speedRpm} RPM</strong>
          </span>
        </div>

        <button
          onClick={() => setActiveTab('custom')}
          className="bg-blue-600/90 hover:bg-blue-600 text-white font-medium text-xs px-3 py-1 rounded transition flex items-center gap-1.5 shadow-sm ml-auto"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Input Custom Pump Data
        </button>
      </div>

      {activeTab === 'curve' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main SVG Curve Plot */}
          <div className="lg:col-span-3 bg-slate-950 rounded-lg p-2 border border-slate-800 flex flex-col items-center justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-h-[380px]">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac) => {
                const y = padTop + plotHeight * frac;
                const headVal = (1.0 - frac) * maxHead;
                const effVal = (1.0 - frac) * 100;
                return (
                  <g key={`y-${frac}`}>
                    <line x1={padLeft} y1={y} x2={padLeft + plotWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" />
                    {/* Left Y Axis label (Head) */}
                    <text x={padLeft - 8} y={y + 3} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      {headVal.toFixed(0)}m
                    </text>
                    {/* Right Y Axis label (Efficiency) */}
                    <text
                      x={padLeft + plotWidth + 8}
                      y={y + 3}
                      textAnchor="start"
                      fill="#10b981"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {effVal.toFixed(0)}%
                    </text>
                  </g>
                );
              })}

              {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((frac) => {
                const x = padLeft + plotWidth * frac;
                const flowVal = frac * maxFlow;
                return (
                  <g key={`x-${frac}`}>
                    <line x1={x} y1={padTop} x2={x} y2={padTop + plotHeight} stroke="#1e293b" strokeDasharray="3 3" />
                    <text x={x} y={padTop + plotHeight + 16} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      {flowVal.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Axis Titles */}
              <text
                x={padLeft + plotWidth / 2}
                y={svgHeight - 10}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="500"
              >
                Volumetric Flow Rate Q ({isMetric ? 'm³/h' : 'm³/h [US GPM equivalent]'})
              </text>
              <text
                x={14}
                y={padTop + plotHeight / 2}
                textAnchor="middle"
                transform={`rotate(-90 14 ${padTop + plotHeight / 2})`}
                fill="#38bdf8"
                fontSize="11"
                fontWeight="500"
              >
                Total Dynamic Head TDH (m liquid)
              </text>
              <text
                x={svgWidth - 14}
                y={padTop + plotHeight / 2}
                textAnchor="middle"
                transform={`rotate(90 ${svgWidth - 14} ${padTop + plotHeight / 2})`}
                fill="#34d399"
                fontSize="11"
                fontWeight="500"
              >
                Pump Efficiency η (%)
              </text>

              {/* Static Head Baseline */}
              <line
                x1={padLeft}
                y1={scaleY(staticHead)}
                x2={padLeft + plotWidth}
                y2={scaleY(staticHead)}
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text x={padLeft + 10} y={scaleY(staticHead) - 4} fill="#94a3b8" fontSize="9">
                Static Lift H_s = {staticHead}m
              </text>

              {/* System Demand Curve (Red / Coral) */}
              <path d={makePath(systemPoints)} fill="none" stroke="#ef4444" strokeWidth="2.5" />

              {/* Pump H-Q Performance Curve (Sky Blue) */}
              <path d={makePath(pumpPoints)} fill="none" stroke="#38bdf8" strokeWidth="3" />

              {/* Efficiency Curve (Emerald Dashed) */}
              <path d={makePath(effPoints)} fill="none" stroke="#10b981" strokeWidth="1.8" strokeDasharray="5 3" />

              {/* NPSHr Curve (Purple Dotted) */}
              <path d={makePath(npshrPoints)} fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="2 2" />

              {/* Target Flow Vertical Guide */}
              <line
                x1={scaleX(targetFlow)}
                y1={padTop}
                x2={scaleX(targetFlow)}
                y2={padTop + plotHeight}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Operating Point Intersection Crosshair & Dot */}
              {operatingPoint && (
                <g>
                  {/* Vertical drop */}
                  <line
                    x1={scaleX(operatingPoint.flowM3h)}
                    y1={scaleY(operatingPoint.headM)}
                    x2={scaleX(operatingPoint.flowM3h)}
                    y2={padTop + plotHeight}
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* Horizontal drop */}
                  <line
                    x1={padLeft}
                    y1={scaleY(operatingPoint.headM)}
                    x2={scaleX(operatingPoint.flowM3h)}
                    y2={scaleY(operatingPoint.headM)}
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                  {/* Operating Point Circle */}
                  <circle
                    cx={scaleX(operatingPoint.flowM3h)}
                    cy={scaleY(operatingPoint.headM)}
                    r="6"
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={scaleX(operatingPoint.flowM3h)}
                    cy={scaleY(operatingPoint.headM)}
                    r="12"
                    fill="#a855f7"
                    fillOpacity="0.25"
                  />

                  {/* Callout box */}
                  <g transform={`translate(${Math.min(svgWidth - 190, scaleX(operatingPoint.flowM3h) + 12)}, ${Math.max(padTop + 10, scaleY(operatingPoint.headM) - 50)})`}>
                    <rect width="170" height="48" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" />
                    <text x="8" y="16" fill="#f8fafc" fontSize="10" fontWeight="bold">
                      OPERATING POINT (DUTY)
                    </text>
                    <text x="8" y="30" fill="#cbd5e1" fontSize="9">
                      Q = {operatingPoint.flowM3h} m³/h ({operatingPoint.flowGpm} GPM)
                    </text>
                    <text x="8" y="42" fill="#38bdf8" fontSize="9">
                      H = {operatingPoint.headM} m ({operatingPoint.headFt} ft) | η = {operatingPoint.efficiencyPct}%
                    </text>
                  </g>
                </g>
              )}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2 border-t border-slate-800 pt-2 w-full">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-sky-400 rounded"></span>
                <span className="text-slate-300">Pump H-Q Curve</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-red-500 rounded"></span>
                <span className="text-slate-300">System Darcy Curve</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-emerald-500 border-t border-dashed rounded"></span>
                <span className="text-slate-300">Efficiency η</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 bg-purple-400 border-t border-dotted rounded"></span>
                <span className="text-slate-300">NPSHr Curve</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span className="text-slate-200 font-medium">Operating Point</span>
              </div>
            </div>
          </div>

          {/* Sizing & Verification Metrics Panel */}
          <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 text-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-semibold text-slate-200">Operating Audit</span>
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    operatingPoint.meetsDemand
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                      : 'bg-red-950 text-red-300 border border-red-700/50'
                  }`}
                >
                  {operatingPoint.meetsDemand ? 'MEETS DEMAND' : 'CAPACITY DEFICIT'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-slate-400 text-[11px]">Design Target Flow:</div>
                  <div className="text-slate-200 font-mono font-bold text-sm">
                    {targetFlow} m³/h ({results.flowRateGpm} GPM)
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Actual Operating Delivery:</div>
                  <div className="text-purple-400 font-mono font-bold text-sm">
                    {operatingPoint.flowM3h} m³/h ({operatingPoint.flowGpm} GPM)
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Total Head at Operating Point:</div>
                  <div className="text-blue-400 font-mono font-bold text-sm">
                    {operatingPoint.headM} m ({operatingPoint.headFt} ft)
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Operating Efficiency:</div>
                  <div className="text-emerald-400 font-mono font-bold text-sm">
                    {operatingPoint.efficiencyPct}%
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[11px]">Operating Shaft Power (BHP):</div>
                  <div className="text-amber-400 font-mono font-bold text-sm">
                    {operatingPoint.powerKw} kW ({(operatingPoint.powerKw * 1.341).toFixed(2)} HP)
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-2">
                  <div className="text-slate-400 text-[11px]">NPSHa vs NPSHr Margin:</div>
                  <div
                    className={`font-mono font-bold ${
                      results.npshStatus === 'PASS'
                        ? 'text-emerald-400'
                        : results.npshStatus === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`}
                  >
                    +{results.npshMarginM} m ({results.npshStatus})
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    NPSHa = {results.npshaM}m | NPSHr = {results.npshrM}m
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded border border-slate-800 mt-3 text-[11px] text-slate-300">
              <span className="font-semibold text-slate-200">Motor Selection:</span> Recommended{' '}
              <strong className="text-purple-400">{results.recommendedMotorKw} kW</strong> (
              {results.recommendedMotorHp} HP) 3-phase induction motor with 20% torque safety margin.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-4">
          <div>
            <h4 className="font-semibold text-slate-200 text-xs">Custom Pump Specifications &amp; Performance Curve</h4>
            <p className="text-slate-400 text-xs mt-0.5">
              Enter manufacturer, model, mechanism, and test bench flow rate vs head points.
            </p>
          </div>

          {/* Model Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Manufacturer</label>
              <input
                type="text"
                value={customManufacturer}
                onChange={(e) => setCustomManufacturer(e.target.value)}
                placeholder="e.g. Viking, Gorman-Rupp"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Model Name / Number</label>
              <input
                type="text"
                value={customModelName}
                onChange={(e) => setCustomModelName(e.target.value)}
                placeholder="e.g. Series 4124A"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-medium"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Pump Mechanism</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as PumpModel['type'])}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-100"
              >
                <option value="Positive Displacement Gear">Positive Displacement Gear</option>
                <option value="Self-Priming Centrifugal">Self-Priming Centrifugal</option>
                <option value="Sliding Vane">Sliding Vane</option>
                <option value="Standard Centrifugal">Standard Centrifugal</option>
                <option value="Submersible Turbine Pump (STP)">Submersible Turbine Pump (STP)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Speed (RPM)</label>
              <input
                type="number"
                step="50"
                value={customRpm}
                onChange={(e) => setCustomRpm(parseInt(e.target.value) || 1450)}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-300 mb-3">
              <thead className="bg-slate-900 text-slate-400 font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Point #</th>
                  <th className="py-2 px-3">Flow Rate Q (m³/h)</th>
                  <th className="py-2 px-3">Total Head H (m)</th>
                  <th className="py-2 px-3">Efficiency η (%)</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {customPoints.map((pt, index) => (
                  <tr key={index}>
                    <td className="py-2 px-3 font-mono">{index + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={pt.q}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const next = [...customPoints];
                          next[index].q = val;
                          setCustomPoints(next);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-24 text-slate-100 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={pt.h}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const next = [...customPoints];
                          next[index].h = val;
                          setCustomPoints(next);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-24 text-slate-100 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={pt.eff}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const next = [...customPoints];
                          next[index].eff = val;
                          setCustomPoints(next);
                        }}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 w-20 text-slate-100 font-mono"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      {customPoints.length > 3 && (
                        <button
                          onClick={() => setCustomPoints(customPoints.filter((_, i) => i !== index))}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCustomPoints([...customPoints, { q: targetFlow * 1.5, h: 20, eff: 50 }])}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded transition"
            >
              + Add Data Point
            </button>
            <button
              onClick={handleApplyCustom}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-4 py-1.5 rounded transition shadow"
            >
              Fit & Apply Custom Performance Curve
            </button>
          </div>
        </div>
      )}

      {activeTab === 'specs' && (
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs space-y-3">
          <h4 className="font-semibold text-slate-200">
            {selectedPump.manufacturer} {selectedPump.model} Technical Specification
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Pump Mechanics</span>
              <span className="text-slate-200 font-medium">{selectedPump.type}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Shaft Speed</span>
              <span className="text-slate-200 font-medium">{selectedPump.speedRpm} RPM</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Maximum Casing Pressure</span>
              <span className="text-slate-200 font-medium">{selectedPump.maxPressureBar} bar</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Rated Flow</span>
              <span className="text-slate-200 font-medium">{selectedPump.ratedFlowM3h} m³/h</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Rated Head</span>
              <span className="text-slate-200 font-medium">{selectedPump.ratedHeadM} m</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
              <span className="text-slate-400 block text-[11px]">H-Q Polynomial Form</span>
              <span className="text-slate-200 font-mono text-[10px]">
                {selectedPump.polynomial.a}Q² + {selectedPump.polynomial.b}Q + {selectedPump.polynomial.c}
              </span>
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded border border-slate-800 text-slate-300 text-xs leading-relaxed">
            <strong className="text-slate-200">Engineering Application Notes:</strong> {selectedPump.notes}
          </div>
        </div>
      )}
    </div>
  );
};
