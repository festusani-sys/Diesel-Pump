/**
 * @license
 * ASME B31.3 Diesel Piping - Material Database Explorer & Material Sizing Modal
 */

import React, { useState } from 'react';
import { PipeMaterial, UnitSystem } from '../types';
import { calculateAsmeB313Mawp, PIPE_MATERIALS } from '../utils/materials';

interface MaterialDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForSuction: (material: PipeMaterial) => void;
  onSelectForDischarge: (material: PipeMaterial) => void;
  unitSystem: UnitSystem;
}

export const MaterialDatabaseModal: React.FC<MaterialDatabaseModalProps> = ({
  isOpen,
  onClose,
  onSelectForSuction,
  onSelectForDischarge,
  unitSystem,
}) => {
  const [selectedMat, setSelectedMat] = useState<PipeMaterial>(PIPE_MATERIALS[0]);
  const [filterCat, setFilterCat] = useState<'All' | 'Metallic' | 'Non-Metallic'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isMetric = unitSystem === 'SI';

  const filteredMaterials = PIPE_MATERIALS.filter((m) => {
    const matchesCat = filterCat === 'All' || m.category === filterCat;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.standard.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate sample MAWP for 2" Sch 40 (OD 60.3mm, wall 3.91mm)
  const mawp2Inch = calculateAsmeB313Mawp(selectedMat, 60.3, 3.91);
  const mawp3Inch = calculateAsmeB313Mawp(selectedMat, 88.9, 5.49);
  const mawp4Inch = calculateAsmeB313Mawp(selectedMat, 114.3, 6.02);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Titlebar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-500/20 rounded-md text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                ASME B31.3 Table A-1 Pipe Material & Allowable Stress Database
              </h2>
              <p className="text-xs text-slate-400">
                Process piping specifications, design stresses, absolute roughness, and pressure ratings
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

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Category:</span>
            {(['All', 'Metallic', 'Non-Metallic'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1 rounded transition ${
                  filterCat === cat
                    ? 'bg-blue-600 text-white font-medium shadow'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search material standard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-md px-3 py-1 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-60"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Modal Body: Left List, Right Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Materials List */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-3 space-y-1.5 max-h-[60vh]">
            {filteredMaterials.map((mat) => {
              const isSelected = selectedMat.id === mat.id;
              return (
                <div
                  key={mat.id}
                  onClick={() => setSelectedMat(mat)}
                  className={`p-3 rounded-lg cursor-pointer transition border text-left ${
                    isSelected
                      ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-100 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-slate-500"
                        style={{ backgroundColor: mat.colorHex }}
                      ></span>
                      {mat.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {mat.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{mat.standard}</div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                    <span>ε = {mat.absoluteRoughnessMm} mm</span>
                    <span>S = {mat.allowableStressMpa} MPa</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Material Detail Sheet */}
          <div className="md:col-span-7 p-5 overflow-y-auto space-y-4 max-h-[60vh] bg-slate-950/50">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {selectedMat.category} Specification
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {selectedMat.id}</span>
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">{selectedMat.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedMat.standard}</p>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {selectedMat.description}
            </p>

            {/* Engineering Properties Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Absolute Roughness (ε)</span>
                <span className="text-slate-100 font-mono font-bold text-sm">
                  {selectedMat.absoluteRoughnessMm} mm
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({(selectedMat.absoluteRoughnessMm * 39.37).toFixed(1)} µin)
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Allowable Stress (S)</span>
                <span className="text-blue-400 font-mono font-bold text-sm">
                  {selectedMat.allowableStressMpa} MPa
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({(selectedMat.allowableStressMpa * 0.145038).toFixed(1)} ksi @ 40°C)
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Weld Factor (E)</span>
                <span className="text-slate-100 font-mono font-bold text-sm">
                  {selectedMat.jointQualityFactorE}
                </span>
                <span className="text-[10px] text-slate-500 block">ASME B31.3 Table 302.3.4</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Temperature Limits</span>
                <span className="text-slate-100 font-mono font-medium">
                  {selectedMat.minTempC}°C to {selectedMat.maxTempC}°C
                </span>
                <span className="text-[10px] text-slate-500 block">
                  ({(selectedMat.minTempC * 1.8 + 32).toFixed(0)}°F to {(selectedMat.maxTempC * 1.8 + 32).toFixed(0)}°F)
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Corrosion Allowance (c)</span>
                <span className="text-slate-100 font-mono font-medium">
                  {selectedMat.corrosionAllowanceMm} mm
                </span>
                <span className="text-[10px] text-slate-500 block">Default for diesel service</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Coefficient Y</span>
                <span className="text-slate-100 font-mono font-medium">{selectedMat.coefficientY}</span>
                <span className="text-[10px] text-slate-500 block">ASME Table 304.1.1</span>
              </div>
            </div>

            {/* Calculated MAWP Comparison Table */}
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-slate-200 block mb-2">
                Sample Maximum Allowable Working Pressure (ASME B31.3 Sec. 304.1.2)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">NPS 2" Sch 40</span>
                  <span className="text-emerald-400 font-bold">{mawp2Inch} bar</span>
                  <span className="text-[10px] text-slate-500 block">({(mawp2Inch * 14.5038).toFixed(0)} psi)</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">NPS 3" Sch 40</span>
                  <span className="text-emerald-400 font-bold">{mawp3Inch} bar</span>
                  <span className="text-[10px] text-slate-500 block">({(mawp3Inch * 14.5038).toFixed(0)} psi)</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">NPS 4" Sch 40</span>
                  <span className="text-emerald-400 font-bold">{mawp4Inch} bar</span>
                  <span className="text-[10px] text-slate-500 block">({(mawp4Inch * 14.5038).toFixed(0)} psi)</span>
                </div>
              </div>
            </div>

            {/* Direct Selection Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectForSuction(selectedMat);
                  onClose();
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2 px-3 rounded-md transition shadow flex items-center justify-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                Apply to Suction Header
              </button>

              <button
                onClick={() => {
                  onSelectForDischarge(selectedMat);
                  onClose();
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-2 px-3 rounded-md transition shadow flex items-center justify-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                Apply to Discharge Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-1.5 rounded-md transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
