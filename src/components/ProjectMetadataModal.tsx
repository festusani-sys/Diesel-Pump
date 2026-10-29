/**
 * @license
 * ASME B31.3 Diesel Piping - Project Metadata, Report Customizer & Company Logo Uploader
 */

import React, { useState } from 'react';
import { ProjectMetadata, ReportSectionsConfig } from '../types';

interface ProjectMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProjectMetadata;
  onChangeMetadata: (meta: ProjectMetadata) => void;
  onExportPdf: () => void;
  onExportCsv?: () => void;
}

export const ProjectMetadataModal: React.FC<ProjectMetadataModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onChangeMetadata,
  onExportPdf,
  onExportCsv,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'sections' | 'logo'>('details');

  if (!isOpen) return null;

  const currentSections: ReportSectionsConfig = metadata.reportSections || {
    includeProjectInfo: true,
    includePipingDiagram: true,
    includeFluidProperties: true,
    includePipingCalculations: true,
    includeTdhBreakdown: true,
    includePumpMatching: true,
    includeNpshAudit: true,
    includeAsmeCompliance: true,
    includeFittingsBom: true,
    includeSignOffBlocks: true,
  };

  const handleFieldChange = (key: keyof ProjectMetadata, value: string) => {
    onChangeMetadata({ ...metadata, [key]: value });
  };

  const handleSectionToggle = (key: keyof ReportSectionsConfig) => {
    const updated = {
      ...currentSections,
      [key]: !currentSections[key],
    };
    onChangeMetadata({
      ...metadata,
      reportSections: updated,
    });
  };

  const handleSelectAllSections = (enable: boolean) => {
    const updated: ReportSectionsConfig = {
      includeProjectInfo: enable,
      includePipingDiagram: enable,
      includeFluidProperties: enable,
      includePipingCalculations: enable,
      includeTdhBreakdown: enable,
      includePumpMatching: enable,
      includeNpshAudit: enable,
      includeAsmeCompliance: enable,
      includeFittingsBom: enable,
      includeSignOffBlocks: enable,
    };
    onChangeMetadata({
      ...metadata,
      reportSections: updated,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChangeMetadata({
        ...metadata,
        companyLogoBase64: result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const next = { ...metadata };
    delete next.companyLogoBase64;
    onChangeMetadata(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Engineering PDF Report Setup &amp; Customization
              </h2>
              <p className="text-xs text-slate-400">
                Configure sign-off metadata, toggle report sections, and upload company branding
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

        {/* Navigation Tabs */}
        <div className="flex bg-slate-950/80 px-5 pt-2 border-b border-slate-800 text-xs gap-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Project &amp; Engineering Info
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'sections'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Report Sections Selection
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-300 font-mono">
              {Object.values(currentSections).filter(Boolean).length}/9
            </span>
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'logo'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Company Logo
            {metadata.companyLogoBase64 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800/60">
              <span className="text-[11px] text-slate-400">
                Enter project information manually below, or leave blank to export an unfilled engineering sheet.
              </span>
              <button
                type="button"
                onClick={() => {
                  onChangeMetadata({
                    ...metadata,
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
                }}
                className="text-[11px] text-slate-400 hover:text-amber-400 transition flex items-center gap-1"
                title="Clear all manual text inputs"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Inputs
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Project Name</label>
                <input
                  type="text"
                  value={metadata.projectName}
                  placeholder="e.g. Diesel Fuel Storage & Transfer System"
                  onChange={(e) => handleFieldChange('projectName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Document / Calculation Number</label>
                <input
                  type="text"
                  value={metadata.projectNumber}
                  placeholder="e.g. CALC-B313-001"
                  onChange={(e) => handleFieldChange('projectNumber', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Client / Facility Organization</label>
                <input
                  type="text"
                  value={metadata.client}
                  placeholder="e.g. Mission Critical Data Center"
                  onChange={(e) => handleFieldChange('client', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Site / Facility Location</label>
                <input
                  type="text"
                  value={metadata.location}
                  placeholder="e.g. Building A - Fuel Yard"
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Lead Mechanical Engineer</label>
                <input
                  type="text"
                  value={metadata.leadEngineer}
                  placeholder="e.g. Lead Piping Engineer"
                  onChange={(e) => handleFieldChange('leadEngineer', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Reviewer / Approver</label>
                <input
                  type="text"
                  value={metadata.reviewer}
                  placeholder="e.g. Senior Hydraulic Reviewer"
                  onChange={(e) => handleFieldChange('reviewer', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Revision Code</label>
                <input
                  type="text"
                  value={metadata.revision}
                  placeholder="e.g. Rev 0"
                  onChange={(e) => handleFieldChange('revision', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium block mb-1">Calculation Issue Date</label>
                <input
                  type="date"
                  value={metadata.date}
                  onChange={(e) => handleFieldChange('date', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Engineering Notes &amp; Scope</label>
              <textarea
                rows={2}
                value={metadata.notes}
                placeholder="Enter engineering scope, design assumptions, or facility references..."
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-1.5 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Sections Selection Pane */}
        {activeTab === 'sections' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-100">Select Report Content Sections</h3>
                <p className="text-slate-400 text-[11px]">
                  Uncheck any section to exclude it from the final printed PDF documentation
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(true)}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Select All
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllSections(false)}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: 'includeProjectInfo', title: 'Project Metadata & Client Info', desc: 'Project name, PE stamp registration, location, dates' },
                { key: 'includePipingDiagram', title: 'Process Piping & Instrumentation Diagram (P&ID)', desc: 'Vector piping schematic, equipment arrangements, and HGL hydraulic grade line' },
                { key: 'includeFluidProperties', title: '1.0 Fluid Thermodynamics', desc: 'Diesel grade, density, kinematic/dynamic viscosity, vapor pressure' },
                { key: 'includePipingCalculations', title: '2.0 Piping Sizing & Darcy-Weisbach', desc: 'Schedule, diameter, velocities, Reynolds number, friction factor' },
                { key: 'includeTdhBreakdown', title: '3.0 Total Dynamic Head (TDH) Breakdown', desc: 'Static lift, friction losses, minor losses, backpressure head' },
                { key: 'includePumpMatching', title: '4.0 Pump Sizing & Operating Point', desc: 'Selected pump curve match, flow, head, efficiency, motor rating' },
                { key: 'includeNpshAudit', title: '5.0 NPSH & Cavitation Verification', desc: 'Atmospheric head, vapor pressure, NPSHa vs NPSHr margin' },
                { key: 'includeFittingsBom', title: '6.0 Fittings Minor Losses (BOM) Table', desc: 'Itemized valve list, K-values, quantities, subtotal loss factors' },
                { key: 'includeAsmeCompliance', title: '7.0 ASME B31.3 & API RP 2003 Audit', desc: 'Velocity compliance, electrostatic limits, MAWP pressure check' },
                { key: 'includeSignOffBlocks', title: '8.0 Approvals', desc: 'Prepared by, Checked by, and Approved by signature lines' },
              ].map((item) => {
                const isChecked = currentSections[item.key as keyof ReportSectionsConfig];
                return (
                  <label
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-blue-950/30 border-blue-600/60 text-slate-100'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSectionToggle(item.key as keyof ReportSectionsConfig)}
                      className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
                    />
                    <div>
                      <span className="font-semibold text-xs block">{item.title}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Company Logo Upload */}
        {activeTab === 'logo' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-semibold text-slate-100">Upload Company Branding Logo</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                The logo will be printed in the top titlebar of the formal engineering report
              </p>
            </div>

            {metadata.companyLogoBase64 ? (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="p-3 bg-white rounded-md border border-slate-300 max-w-[200px] flex items-center justify-center">
                  <img
                    src={metadata.companyLogoBase64}
                    alt="Company Logo Preview"
                    className="max-h-16 max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Custom Logo Loaded Successfully
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    This logo will replace the generic icon in the header of the exported PDF.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <label className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded cursor-pointer transition">
                      Change Logo
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-red-400 hover:text-red-300 px-3 py-1.5 rounded bg-red-950/40 border border-red-800/40 transition"
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-950/80 transition text-center">
                <svg className="w-10 h-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-slate-200">Upload Company Logo for Report Header</span>
                <span className="text-slate-400 text-[11px] mt-1 mb-3">
                  PNG, JPG, or WebP image files (Recommended size: 300x100 px or transparent background)
                </span>
                <label className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-md cursor-pointer transition shadow">
                  Browse File
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-2">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-1.5 rounded-md transition"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {onExportCsv && (
              <button
                type="button"
                onClick={() => {
                  onExportCsv();
                }}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs px-4 py-2 rounded-md transition shadow flex items-center gap-1.5"
                title="Export complete calculation results to CSV for Excel / Google Sheets"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV Spreadsheet
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onExportPdf();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-5 py-2 rounded-md transition shadow flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate &amp; Download Signed PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
