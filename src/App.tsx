/**
 * @license
 * ASME B31.3 Diesel Piping Sizing & Pump Hydraulic Analysis Engineering Workstation
 */

import React, { useState, useMemo } from 'react';
import {
  DieselProperties,
  FittingItem,
  PipeMaterial,
  ProjectMetadata,
  PumpModel,
  TankArrangement,
  TankArrangementId,
  UnitSystem,
} from './types';
import { DEFAULT_FITTINGS, PIPE_MATERIALS, PIPE_SCHEDULE_DATABASE } from './utils/materials';
import {
  calculateSystemHydraulics,
  getDieselProperties,
  recommendOptimalNps,
} from './utils/hydraulics';
import { PREDEFINED_PUMPS } from './utils/pumps';
import { generatePdfTechnicalReport } from './utils/reportGenerator';
import { exportHydraulicResultsCsv } from './utils/csvExport';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { WindowsStatusBar } from './components/WindowsStatusBar';
import { ThreeDViewer } from './components/ThreeDViewer';
import { ArrangementSelector, TANK_ARRANGEMENTS } from './components/ArrangementSelector';
import { PumpCurveViewer } from './components/PumpCurveViewer';
import { MaterialDatabaseModal } from './components/MaterialDatabaseModal';
import { StandardsModal } from './components/StandardsModal';
import { FittingsEditorModal } from './components/FittingsEditorModal';
import { ProjectMetadataModal } from './components/ProjectMetadataModal';
import { NumericInput } from './components/NumericInput';

export default function App() {
  // Global App States
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('SI');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'3d' | 'schematic' | 'pump' | 'audit'>('3d');

  // Modals
  const [isMaterialsOpen, setIsMaterialsOpen] = useState(false);
  const [isStandardsOpen, setIsStandardsOpen] = useState(false);
  const [isFittingsOpen, setIsFittingsOpen] = useState(false);
  const [isMetadataOpen, setIsMetadataOpen] = useState(false);

  // Active Arrangement
  const [selectedArrangementId, setSelectedArrangementId] = useState<TankArrangementId>('ust_suction_lift');

  // Fluid & Flow parameters
  const [dieselType, setDieselType] = useState<DieselProperties['type']>('Diesel #2 (ULSD)');
  const [dieselTempC, setDieselTempC] = useState<number>(20);
  const [flowRateM3h, setFlowRateM3h] = useState<number>(12.0);

  // Suction Line Parameters
  const [suctionNps, setSuctionNps] = useState<string>('2');
  const [suctionSchedule, setSuctionSchedule] = useState<string>('40');
  const [suctionLengthM, setSuctionLengthM] = useState<number>(14.0);
  const [suctionElevM, setSuctionElevM] = useState<number>(2.8);
  const [suctionMaterial, setSuctionMaterial] = useState<PipeMaterial>(PIPE_MATERIALS[0]);

  // Discharge Line Parameters
  const [dischargeNps, setDischargeNps] = useState<string>('2');
  const [dischargeSchedule, setDischargeSchedule] = useState<string>('40');
  const [dischargeLengthM, setDischargeLengthM] = useState<number>(40.0);
  const [dischargeElevM, setDischargeElevM] = useState<number>(6.5);
  const [terminalPressureBar, setTerminalPressureBar] = useState<number>(0.2);
  const [dischargeMaterial, setDischargeMaterial] = useState<PipeMaterial>(PIPE_MATERIALS[0]);

  // Pump & Fittings
  const [selectedPump, setSelectedPump] = useState<PumpModel>(PREDEFINED_PUMPS[0]);
  const [fittings, setFittings] = useState<FittingItem[]>(DEFAULT_FITTINGS);

  // Project Metadata
  const [metadata, setMetadata] = useState<ProjectMetadata>({
    projectName: '',
    projectNumber: '',
    client: '',
    location: '',
    leadEngineer: '',
    peNumber: '',
    reviewer: '',
    revision: '',
    date: '',
    notes: '',
  });

  const isImperial = unitSystem === 'Imperial';

  // Handle Arrangement switch with sensible defaults
  const handleSelectArrangement = (arr: TankArrangement) => {
    setSelectedArrangementId(arr.id);
    setSuctionElevM(arr.defaultSuctionElevM);
    setDischargeElevM(arr.defaultDischargeElevM);
    setSuctionLengthM(arr.defaultSuctionLenM);
    setDischargeLengthM(arr.defaultDischargeLenM);
    setSuctionNps(arr.defaultSuctionNps);
    setDischargeNps(arr.defaultDischargeNps);
    setFlowRateM3h(arr.defaultFlowM3h);
  };

  // Perform Real-Time Complete Hydraulic Calculations
  const results = useMemo(() => {
    return calculateSystemHydraulics({
      flowRateM3h,
      suctionNps,
      suctionSchedule,
      suctionLengthM,
      suctionMaterial,
      suctionElevDeltaM: suctionElevM,
      dischargeNps,
      dischargeSchedule,
      dischargeLengthM,
      dischargeMaterial,
      dischargeElevDeltaM: dischargeElevM,
      terminalPressureBar,
      fittings,
      dieselType,
      dieselTempC,
      pumpEfficiencyPct: selectedPump.efficiencyPolynomial ? 70 : 65,
      pumpNpshrM: selectedPump.curvePoints[0]?.npshr || 2.2,
    });
  }, [
    flowRateM3h,
    suctionNps,
    suctionSchedule,
    suctionLengthM,
    suctionMaterial,
    suctionElevM,
    dischargeNps,
    dischargeSchedule,
    dischargeLengthM,
    dischargeMaterial,
    dischargeElevM,
    terminalPressureBar,
    fittings,
    dieselType,
    dieselTempC,
    selectedPump,
  ]);

  // Auto-size button helper
  const handleAutoSizeOptimalPipes = () => {
    const recS = recommendOptimalNps(flowRateM3h, 'suction');
    const recD = recommendOptimalNps(flowRateM3h, 'discharge');
    setSuctionNps(recS.nps);
    setSuctionSchedule(recS.schedule);
    setDischargeNps(recD.nps);
    setDischargeSchedule(recD.schedule);
  };

  // Clear / Reset All Data for Fresh Selection (turns all inputs to 0)
  const handleResetAllData = () => {
    setSelectedArrangementId('ust_suction_lift');
    setFlowRateM3h(0);
    setDieselType('Diesel #2 (ULSD)');
    setDieselTempC(0);
    setSuctionNps('2');
    setSuctionSchedule('40');
    setSuctionLengthM(0);
    setSuctionElevM(0);
    setSuctionMaterial(PIPE_MATERIALS[0]);
    setDischargeNps('2');
    setDischargeSchedule('40');
    setDischargeLengthM(0);
    setDischargeElevM(0);
    setTerminalPressureBar(0);
    setDischargeMaterial(PIPE_MATERIALS[0]);
    setSelectedPump(PREDEFINED_PUMPS[0]);
    setFittings(DEFAULT_FITTINGS.map((f) => ({ ...f, count: 0 })));
    setMetadata({
      projectName: '',
      projectNumber: '',
      client: '',
      location: '',
      leadEngineer: '',
      peNumber: '',
      reviewer: '',
      revision: '',
      date: '',
      notes: '',
    });
  };

  // PDF Export Trigger
  const handleExportPdf = () => {
    const arr = TANK_ARRANGEMENTS.find((a) => a.id === selectedArrangementId);
    generatePdfTechnicalReport({
      results,
      project: metadata,
      pump: selectedPump,
      arrangementName: arr ? arr.name : 'Custom Arrangement',
      unitSystem,
      fittings,
    });
  };

  // CSV Data Export Trigger for Spreadsheet Analysis
  const handleExportCsv = () => {
    const arr = TANK_ARRANGEMENTS.find((a) => a.id === selectedArrangementId);
    exportHydraulicResultsCsv({
      results,
      project: metadata,
      pump: selectedPump,
      arrangementName: arr ? arr.name : 'Custom Arrangement',
      unitSystem,
      fittings,
    });
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden font-sans ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* Windows Application Header & Command Ribbon */}
      <WindowsTitleBar
        unitSystem={unitSystem}
        onToggleUnitSystem={() => setUnitSystem(unitSystem === 'SI' ? 'Imperial' : 'SI')}
        onOpenMaterials={() => setIsMaterialsOpen(true)}
        onExportPdf={() => setIsMetadataOpen(true)}
        onExportCsv={handleExportCsv}
        onOpenHelp={() => setIsStandardsOpen(true)}
        onResetAllData={handleResetAllData}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Workstation Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Parameters & Engineering Input Sidebar */}
        <aside className="w-full lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto max-h-[calc(100vh-80px)] p-4 space-y-4 select-none">
          {/* Quick Header with Auto-Size & Clear Actions */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Hydraulic Sizing Parameters
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">ASME B31.3 Process Piping</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleResetAllData}
                className="bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 border border-slate-700 hover:border-red-800/60 font-medium text-[10px] px-2 py-1 rounded transition"
                title="Reset all inputs for fresh selection"
              >
                Clear All
              </button>
              <button
                onClick={handleAutoSizeOptimalPipes}
                className="bg-blue-600/90 hover:bg-blue-600 text-white font-medium text-[11px] px-2.5 py-1 rounded transition shadow flex items-center gap-1"
                title="Automatically select optimal ASME B31.3 diameters based on flow rate"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Auto-Size
              </button>
            </div>
          </div>

          {/* Section 1: Flow Rate & Fluid Properties */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
            <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide block">
              1. Fuel &amp; Flow Demand
            </span>

            {/* Flow Rate with Direct Text Input */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <label className="text-slate-300 font-medium">Design Flow Rate (Q):</label>
                <div className="flex items-center gap-1.5">
                  <NumericInput
                    value={isImperial ? flowRateM3h * 4.40287 : flowRateM3h}
                    onChange={(val) => {
                      setFlowRateM3h(isImperial ? Math.max(0, val / 4.40287) : Math.max(0, val));
                    }}
                    min={0}
                    step={isImperial ? 1 : 0.5}
                    unit={isImperial ? 'GPM' : 'm³/h'}
                    precision={1}
                    ariaLabel="Design Flow Rate"
                    className="w-28"
                    inputClassName="text-right font-bold text-blue-400 pr-10"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={flowRateM3h}
                onChange={(e) => setFlowRateM3h(parseFloat(e.target.value) || 0)}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                <span>0 m³/h (0 GPM)</span>
                <span>80 m³/h (352 GPM)</span>
              </div>
            </div>

            {/* Diesel Grade */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">Fuel Grade:</label>
                <select
                  value={dieselType}
                  onChange={(e) => setDieselType(e.target.value as DieselProperties['type'])}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Diesel #2 (ULSD)">Diesel #2 (ULSD)</option>
                  <option value="Diesel #1 (Kerosene/Arctic)">Diesel #1 (Arctic)</option>
                  <option value="Biodiesel B20">Biodiesel B20</option>
                  <option value="Marine Gas Oil (MGO)">Marine Gas Oil (MGO)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">Temperature:</label>
                <NumericInput
                  value={isImperial ? (dieselTempC * 9) / 5 + 32 : dieselTempC}
                  onChange={(val) => {
                    setDieselTempC(isImperial ? ((val - 32) * 5) / 9 : val);
                  }}
                  step={1}
                  unit={isImperial ? '°F' : '°C'}
                  precision={0}
                  ariaLabel="Fuel Temperature"
                  inputClassName="text-center pr-7"
                />
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded flex justify-between">
              <span>ρ = {results.fluid.computedDensityKgM3} kg/m³</span>
              <span>ν = {results.fluid.computedViscosityCSt} cSt</span>
            </div>
          </div>

          {/* Section 2: Suction Header Sizing */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                2. Suction Line
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  results.asmeCompliance.suctionVelocityValid
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                    : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                }`}
              >
                {results.suctionVelocityMps} m/s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">NPS Size:</label>
                <select
                  value={suctionNps}
                  onChange={(e) => setSuctionNps(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                >
                  {PIPE_SCHEDULE_DATABASE.map((p) => (
                    <option key={p.nps} value={p.nps}>
                      {p.nps}" (DN {p.dn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">Schedule:</label>
                <select
                  value={suctionSchedule}
                  onChange={(e) => setSuctionSchedule(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                >
                  <option value="10">Sch 10</option>
                  <option value="40">Sch 40 (Std)</option>
                  <option value="80">Sch 80 (XS)</option>
                  <option value="160">Sch 160</option>
                </select>
              </div>
            </div>

            {/* Suction Length & Lift */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">
                  Pipe Length ({isImperial ? 'ft' : 'm'}):
                </label>
                <NumericInput
                  value={isImperial ? suctionLengthM * 3.28084 : suctionLengthM}
                  onChange={(val) => {
                    setSuctionLengthM(isImperial ? val / 3.28084 : val);
                  }}
                  min={0}
                  step={0.5}
                  precision={1}
                  ariaLabel="Suction Pipe Length"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">
                  Suction Lift ({isImperial ? 'ft' : 'm'}):
                </label>
                <NumericInput
                  value={isImperial ? suctionElevM * 3.28084 : suctionElevM}
                  onChange={(val) => {
                    setSuctionElevM(isImperial ? val / 3.28084 : val);
                  }}
                  step={0.2}
                  precision={1}
                  ariaLabel="Suction Lift"
                />
              </div>
            </div>

            {/* Suction Material */}
            <div>
              <div className="flex justify-between items-center text-[11px] mb-0.5">
                <span className="text-slate-400">Material:</span>
                <button
                  onClick={() => setIsMaterialsOpen(true)}
                  className="text-blue-400 hover:text-blue-300 text-[10px]"
                >
                  Change Material
                </button>
              </div>
              <div className="text-xs font-medium text-slate-200 truncate bg-slate-900 px-2 py-1 rounded border border-slate-800">
                {suctionMaterial.name}
              </div>
            </div>
          </div>

          {/* Section 3: Discharge Pipeline Sizing */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                3. Discharge Pipeline
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                  results.asmeCompliance.dischargeVelocityValid
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                    : 'bg-red-950 text-red-300 border border-red-800/50'
                }`}
              >
                {results.dischargeVelocityMps} m/s
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">NPS Size:</label>
                <select
                  value={dischargeNps}
                  onChange={(e) => setDischargeNps(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                >
                  {PIPE_SCHEDULE_DATABASE.map((p) => (
                    <option key={p.nps} value={p.nps}>
                      {p.nps}" (DN {p.dn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">Schedule:</label>
                <select
                  value={dischargeSchedule}
                  onChange={(e) => setDischargeSchedule(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono"
                >
                  <option value="10">Sch 10</option>
                  <option value="40">Sch 40 (Std)</option>
                  <option value="80">Sch 80 (XS)</option>
                  <option value="160">Sch 160</option>
                </select>
              </div>
            </div>

            {/* Discharge Length & Static Rise */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">
                  Pipe Length ({isImperial ? 'ft' : 'm'}):
                </label>
                <NumericInput
                  value={isImperial ? dischargeLengthM * 3.28084 : dischargeLengthM}
                  onChange={(val) => {
                    setDischargeLengthM(isImperial ? val / 3.28084 : val);
                  }}
                  min={0}
                  step={1}
                  precision={1}
                  ariaLabel="Discharge Pipe Length"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">
                  Static Rise ({isImperial ? 'ft' : 'm'}):
                </label>
                <NumericInput
                  value={isImperial ? dischargeElevM * 3.28084 : dischargeElevM}
                  onChange={(val) => {
                    setDischargeElevM(isImperial ? val / 3.28084 : val);
                  }}
                  step={0.5}
                  precision={1}
                  ariaLabel="Discharge Static Rise"
                />
              </div>
            </div>

            {/* Terminal Backpressure & Material */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-0.5">
                  Terminal Press ({isImperial ? 'psi' : 'bar'}):
                </label>
                <NumericInput
                  value={isImperial ? terminalPressureBar * 14.5038 : terminalPressureBar}
                  onChange={(val) => {
                    setTerminalPressureBar(isImperial ? val / 14.5038 : val);
                  }}
                  min={0}
                  step={0.1}
                  precision={1}
                  ariaLabel="Terminal Pressure"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-[11px] mb-0.5">
                  <span className="text-slate-400">Material:</span>
                  <button
                    onClick={() => setIsMaterialsOpen(true)}
                    className="text-emerald-400 hover:text-emerald-300 text-[10px]"
                  >
                    Change
                  </button>
                </div>
                <div className="text-xs font-medium text-slate-200 truncate bg-slate-900 px-2 py-1 rounded border border-slate-800">
                  {dischargeMaterial.name.split(' ')[0]} {dischargeMaterial.name.split(' ')[1]}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Minor Loss Fittings & Valves Button */}
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wide block">
                Fittings &amp; Valves (BOM)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {fittings.reduce((acc, f) => acc + f.count, 0)} components | Total ΣK ={' '}
                {fittings.reduce((acc, f) => acc + f.kValue * f.count, 0).toFixed(2)}
              </span>
            </div>
            <button
              onClick={() => setIsFittingsOpen(true)}
              className="bg-purple-900/50 hover:bg-purple-800 text-purple-300 border border-purple-700/60 text-xs px-3 py-1.5 rounded transition"
            >
              Edit Fittings
            </button>
          </div>
        </aside>

        {/* Central Workspace Area */}
        <section className="flex-1 flex flex-col overflow-y-auto p-4 space-y-4">
          {/* Main Visual Workspace Tabs Navigation */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveWorkspaceTab('3d')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  activeWorkspaceTab === '3d'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Interactive 3D Pipeline &amp; Skid
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('schematic')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  activeWorkspaceTab === 'schematic'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Tank Configurations &amp; HGL
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('pump')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  activeWorkspaceTab === 'pump'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Pump Curves &amp; Operating Point
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('audit')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                  activeWorkspaceTab === 'audit'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ASME B31.3 Compliance Audit
              </button>
            </div>
          </div>

          {/* Active Workspace View Rendering */}
          {activeWorkspaceTab === '3d' && (
            <div className="space-y-4">
              <ThreeDViewer
                arrangementId={selectedArrangementId}
                suctionNps={suctionNps}
                suctionMaterial={suctionMaterial}
                dischargeNps={dischargeNps}
                dischargeMaterial={dischargeMaterial}
                suctionElevM={suctionElevM}
                dischargeElevM={dischargeElevM}
                results={results}
                isImperial={isImperial}
              />
            </div>
          )}

          {activeWorkspaceTab === 'schematic' && (
            <ArrangementSelector
              selectedId={selectedArrangementId}
              onSelect={handleSelectArrangement}
              results={results}
              unitSystem={unitSystem}
            />
          )}

          {activeWorkspaceTab === 'pump' && (
            <PumpCurveViewer
              selectedPump={selectedPump}
              onSelectPump={setSelectedPump}
              results={results}
              unitSystem={unitSystem}
            />
          )}

          {activeWorkspaceTab === 'audit' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm">
                  ASME B31.3 &amp; Darcy-Weisbach Full Calculation Audit
                </h3>
                <p className="text-xs text-slate-400">
                  Step-by-step verification proofs, Colebrook-White friction iterations, and pipe stress analysis
                </p>
              </div>

              {/* Compliance Messages List */}
              <div className="space-y-2">
                {results.asmeCompliance.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                      msg.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                        : msg.type === 'warning'
                        ? 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                        : 'bg-red-950/40 border-red-800/60 text-red-300'
                    }`}
                  >
                    <span className="font-mono font-bold uppercase mt-0.5">[{msg.code}]:</span>
                    <span>{msg.message}</span>
                  </div>
                ))}
              </div>

              {/* Comprehensive Calculation Proof Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Suction Audit */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-blue-400 font-bold border-b border-slate-800 pb-1">
                    SUCTION LINE PROOFS (NPS {suctionNps}" {suctionSchedule})
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Inside Diameter (D):</span>
                    <span>{results.suctionIdMm} mm ({(results.suctionIdMm / 25.4).toFixed(3)}")</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Mean Velocity (v):</span>
                    <span>{results.suctionVelocityMps} m/s (Limit: 0.6 - 1.2 m/s)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Reynolds Number (Re):</span>
                    <span>{results.suctionReynolds.toLocaleString()} ({results.suctionRegime})</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Darcy Friction Factor (f):</span>
                    <span>{results.suctionFrictionFactor}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Pipe Friction Head Loss:</span>
                    <span>{results.suctionPipeHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Fittings Minor Head Loss:</span>
                    <span>{results.suctionFittingsHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800 pt-1">
                    <span>Total Suction Drop:</span>
                    <span>{results.suctionPressureDropKpa} kPa ({results.suctionTotalHeadLossM} m)</span>
                  </div>
                </div>

                {/* Discharge Audit */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                  <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1">
                    DISCHARGE LINE PROOFS (NPS {dischargeNps}" {dischargeSchedule})
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Inside Diameter (D):</span>
                    <span>{results.dischargeIdMm} mm ({(results.dischargeIdMm / 25.4).toFixed(3)}")</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Mean Velocity (v):</span>
                    <span>{results.dischargeVelocityMps} m/s (API Max: 2.5 m/s)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Reynolds Number (Re):</span>
                    <span>{results.dischargeReynolds.toLocaleString()} ({results.dischargeRegime})</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Darcy Friction Factor (f):</span>
                    <span>{results.dischargeFrictionFactor}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Pipe Friction Head Loss:</span>
                    <span>{results.dischargePipeHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Fittings Minor Head Loss:</span>
                    <span>{results.dischargeFittingsHeadLossM} m</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 border-t border-slate-800 pt-1">
                    <span>Pipe MAWP (ASME 304.1.2):</span>
                    <span className="text-emerald-400">{results.dischargeMawpBar} bar</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Engineering HUD Metrics Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Metric 1: TDH */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg shadow">
              <span className="text-[11px] text-slate-400 font-medium block">Total Dynamic Head (TDH)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-mono font-bold text-blue-400">
                  {isImperial ? results.totalDynamicHeadPsi : results.totalDynamicHeadM}
                </span>
                <span className="text-xs font-mono text-slate-400">{isImperial ? 'psi' : 'm'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Static {results.staticHeadM}m + Friction {results.totalFrictionHeadLossM}m
              </span>
            </div>

            {/* Metric 2: NPSH Margin */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg shadow">
              <span className="text-[11px] text-slate-400 font-medium block">NPSH Margin (HI Spec)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-xl font-mono font-bold ${
                    results.npshStatus === 'PASS'
                      ? 'text-emerald-400'
                      : results.npshStatus === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  +{results.npshMarginM}
                </span>
                <span className="text-xs font-mono text-slate-400">m</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                NPSHa {results.npshaM}m &gt; NPSHr {results.npshrM}m
              </span>
            </div>

            {/* Metric 3: Brake Horsepower */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg shadow">
              <span className="text-[11px] text-slate-400 font-medium block">Shaft Power Demand</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-mono font-bold text-amber-400">
                  {isImperial ? results.brakeHorsepowerHp : results.brakeHorsepowerKw}
                </span>
                <span className="text-xs font-mono text-slate-400">{isImperial ? 'BHP' : 'kW'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                Hydraulic: {results.hydraulicPowerKw} kW @ {results.pumpEfficiencyPct}% η
              </span>
            </div>

            {/* Metric 4: Electric Motor Size */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-lg shadow">
              <span className="text-[11px] text-slate-400 font-medium block">Recommended Motor</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-mono font-bold text-purple-400">
                  {isImperial ? results.recommendedMotorHp : results.recommendedMotorKw}
                </span>
                <span className="text-xs font-mono text-slate-400">{isImperial ? 'HP' : 'kW'}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                NEMA / IEC Standard Frame (+20% Margin)
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Windows Application Status Bar */}
      <WindowsStatusBar results={results} unitSystem={unitSystem} />

      {/* Modals */}
      <MaterialDatabaseModal
        isOpen={isMaterialsOpen}
        onClose={() => setIsMaterialsOpen(false)}
        onSelectForSuction={setSuctionMaterial}
        onSelectForDischarge={setDischargeMaterial}
        unitSystem={unitSystem}
      />

      <StandardsModal isOpen={isStandardsOpen} onClose={() => setIsStandardsOpen(false)} />

      <FittingsEditorModal
        isOpen={isFittingsOpen}
        onClose={() => setIsFittingsOpen(false)}
        fittings={fittings}
        onChangeFittings={setFittings}
      />

      <ProjectMetadataModal
        isOpen={isMetadataOpen}
        onClose={() => setIsMetadataOpen(false)}
        metadata={metadata}
        onChangeMetadata={setMetadata}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
