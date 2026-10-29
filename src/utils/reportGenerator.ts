/**
 * @license
 * ASME B31.3 Technical Calculation Report & PDF Generator
 * Supports Custom Company Logo & Modular Section Selection
 */

import { jsPDF } from 'jspdf';
import { FittingItem, HydraulicResults, ProjectMetadata, PumpModel, UnitSystem } from '../types';

export function generatePdfTechnicalReport(params: {
  results: HydraulicResults;
  project: ProjectMetadata;
  pump: PumpModel;
  arrangementName: string;
  unitSystem: UnitSystem;
  fittings?: FittingItem[];
}) {
  const { results, project, pump, arrangementName, unitSystem, fittings = [] } = params;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isMetric = unitSystem === 'SI';
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const sections = project.reportSections || {
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

  const checkPageBreak = (neededHeight: number, currentY: number): number => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      // Mini running header on subsequent pages
      doc.setFillColor(15, 44, 89);
      doc.rect(0, 0, pageWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('DIESEL PIPING & PUMP HYDRAULIC SIZING REPORT (CONT.)', margin, 8);
      doc.text(`DOC: ${project.projectNumber || 'ENG-CALC'} | REV: ${project.revision || '0'}`, pageWidth - margin, 8, {
        align: 'right',
      });
      return 18;
    }
    return currentY;
  };

  // Header Bar (Windows Engineering Blue)
  doc.setFillColor(15, 44, 89);
  doc.rect(0, 0, pageWidth, 24, 'F');

  // If company logo exists, render it cleanly
  const hasLogo = Boolean(project.companyLogoBase64);
  if (hasLogo && project.companyLogoBase64) {
    try {
      doc.addImage(project.companyLogoBase64, 'PNG', margin, 3, 22, 18);
    } catch {
      try {
        doc.addImage(project.companyLogoBase64, 'JPEG', margin, 3, 22, 18);
      } catch (err) {
        console.warn('Could not render uploaded company logo in PDF', err);
      }
    }
  }

  const titleX = hasLogo ? margin + 26 : margin;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('DIESEL PIPING & PUMP HYDRAULIC SIZING REPORT', titleX, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('ENGINEERING CALCULATION SHEET | DARCY-WEISBACH HYDRAULIC AUDIT', titleX, 18);
  const docIdStr = project.projectNumber ? `DOC ID: ${project.projectNumber}` : 'DOC ID: ________________';
  const revStr = project.revision ? `REV: ${project.revision}` : 'REV: ____';
  doc.text(
    `${docIdStr} | ${revStr}`,
    pageWidth - margin,
    18,
    { align: 'right' }
  );

  let y = 30;

  // Section Header Function
  const addSectionHeader = (title: string, currentY: number) => {
    currentY = checkPageBreak(12, currentY);
    doc.setFillColor(235, 242, 250);
    doc.rect(margin, currentY, contentWidth, 5.5, 'F');
    doc.setDrawColor(15, 44, 89);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, margin, currentY + 5.5);
    doc.setTextColor(15, 44, 89);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), margin + 3, currentY + 4);
    return currentY + 7.5;
  };

  // Section: Project Info Table
  if (sections.includeProjectInfo !== false) {
    y = checkPageBreak(25, y);
    doc.setDrawColor(200, 210, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 22, 1.5, 1.5, 'FD');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Project:', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(project.projectName || '__________________________________________', margin + 20, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Client:', margin + 110, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(project.client || '__________________________', margin + 125, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Lead Engineer:', margin + 3, y + 10.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      project.leadEngineer || '__________________________________________',
      margin + 26,
      y + 10.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Arrangement:', margin + 110, y + 10.5);
    doc.setFont('helvetica', 'normal');
    doc.text(arrangementName, margin + 132, y + 10.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Design Code:', margin + 3, y + 16.5);
    doc.setFont('helvetica', 'normal');
    doc.text('ASME B31.3-2022 (Process Piping) | API RP 2003 | NFPA 30', margin + 24, y + 16.5);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin + 110, y + 16.5);
    doc.setFont('helvetica', 'normal');
    doc.text(project.date || '____________', margin + 120, y + 16.5);

    y += 26;
  }

  // Section: Piping & Instrumentation Diagram (P&ID)
  if (sections.includePipingDiagram !== false) {
    y = checkPageBreak(50, y);
    y = addSectionHeader('Process Piping & Instrumentation Diagram (P&ID Schematic & HGL)', y);

    // Vector CAD Canvas Box
    doc.setDrawColor(200, 215, 235);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, contentWidth, 44, 1.5, 1.5, 'FD');

    // Grade Datum Line
    doc.setDrawColor(180, 195, 215);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin + 4, y + 32, margin + contentWidth - 4, y + 32);
    doc.setLineDashPattern([], 0);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140, 155, 175);
    doc.text('GRADE EL. 0.00m', margin + 6, y + 31);

    // 1. Source Storage Tank
    doc.setDrawColor(100, 120, 150);
    doc.setFillColor(225, 235, 245);
    doc.roundedRect(margin + 8, y + 22, 30, 18, 2, 2, 'FD');
    doc.setFillColor(254, 215, 170); // Amber fuel level
    doc.roundedRect(margin + 9, y + 26, 28, 13, 1, 1, 'F');
    doc.setFontSize(6.5);
    doc.setTextColor(70, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('SOURCE TANK', margin + 23, y + 32, { align: 'center' });
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(`El. -${results.staticHeadM > 0 ? (results.staticHeadM * 0.35).toFixed(1) : '2.8'}m`, margin + 23, y + 37, { align: 'center' });

    // Foot Valve
    doc.setFillColor(220, 38, 38);
    doc.circle(margin + 23, y + 34, 1.8, 'FD');
    doc.setFontSize(4);
    doc.setTextColor(255, 255, 255);
    doc.text('FV', margin + 23, y + 35.2, { align: 'center' });

    // 2. Suction Pipeline
    doc.setDrawColor(30, 110, 200);
    doc.setLineWidth(0.8);
    doc.line(margin + 23, y + 33, margin + 23, y + 17);
    doc.line(margin + 23, y + 17, margin + 66, y + 17);
    doc.line(margin + 66, y + 17, margin + 74, y + 23);

    doc.setFontSize(5.5);
    doc.setTextColor(30, 110, 200);
    doc.text(`Suction Line NPS ${results.suctionNps}" Sch ${results.suctionSchedule} (v = ${results.suctionVelocityMps} m/s)`, margin + 26, y + 15.5);

    // Suction Y-Strainer
    doc.setDrawColor(70, 85, 105);
    doc.setFillColor(203, 213, 225);
    doc.rect(margin + 50, y + 15.5, 7, 3, 'FD');
    doc.setFontSize(4.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Y-STR', margin + 53.5, y + 17.7, { align: 'center' });

    // 3. Pump Skid
    doc.setFillColor(30, 41, 59);
    doc.rect(margin + 70, y + 27, 28, 3, 'F'); // Skid base

    // Motor
    doc.setFillColor(2, 132, 199);
    doc.rect(margin + 72, y + 19, 10, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.text('MTR', margin + 77, y + 24, { align: 'center' });

    // Pump Volute / Head
    doc.setFillColor(220, 38, 38);
    doc.circle(margin + 90, y + 23, 4.5, 'FD');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4.5);
    doc.text('PUMP', margin + 90, y + 24.2, { align: 'center' });

    // Gauges
    doc.setDrawColor(30, 110, 200);
    doc.setFillColor(255, 255, 255);
    doc.circle(margin + 83, y + 14, 2.2, 'FD');
    doc.setFontSize(4.5);
    doc.setTextColor(30, 110, 200);
    doc.text('Ps', margin + 83, y + 15.2, { align: 'center' });

    doc.setDrawColor(220, 38, 38);
    doc.circle(margin + 94, y + 12, 2.2, 'FD');
    doc.setTextColor(220, 38, 38);
    doc.text('Pd', margin + 94, y + 13.2, { align: 'center' });

    // 4. Discharge Pipeline
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.8);
    doc.line(margin + 90, y + 18.5, margin + 90, y + 6);
    doc.line(margin + 90, y + 6, margin + 146, y + 6);
    doc.line(margin + 146, y + 6, margin + 146, y + 14);

    // NRV Check Valve
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 90, y + 12, 1.8, 'FD');
    doc.setFontSize(4);
    doc.setTextColor(255, 255, 255);
    doc.text('NRV', margin + 90, y + 13.2, { align: 'center' });

    // Flow Switch / Transmitter
    doc.setDrawColor(70, 85, 105);
    doc.setFillColor(203, 213, 225);
    doc.rect(margin + 114, y + 4.5, 8, 3, 'FD');
    doc.setFontSize(4.5);
    doc.setTextColor(30, 41, 59);
    doc.text('FS/FT', margin + 118, y + 6.7, { align: 'center' });

    // Discharge Pipe Label
    doc.setFontSize(5.5);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'normal');
    doc.text(`Discharge NPS ${results.dischargeNps}" Sch ${results.dischargeSchedule} (v = ${results.dischargeVelocityMps} m/s) | TDH = ${results.totalDynamicHeadM}m`, margin + 98, y + 4);

    // 5. Destination Day Tank
    doc.setDrawColor(100, 120, 150);
    doc.setFillColor(225, 235, 245);
    doc.roundedRect(margin + 134, y + 14, 26, 17, 1.5, 1.5, 'FD');
    doc.setFillColor(254, 215, 170);
    doc.roundedRect(margin + 135.5, y + 19, 23, 11, 1, 1, 'F');
    doc.line(margin + 137, y + 31, margin + 137, y + 38);
    doc.line(margin + 157, y + 31, margin + 157, y + 38);

    // Anti-Siphon Valve
    doc.setFillColor(99, 102, 241);
    doc.circle(margin + 146, y + 14, 1.8, 'FD');
    doc.setFontSize(4);
    doc.setTextColor(255, 255, 255);
    doc.text('ASV', margin + 146, y + 15.2, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setTextColor(70, 85, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('DAY TANK', margin + 147, y + 24, { align: 'center' });
    doc.setFontSize(5);
    doc.setFont('helvetica', 'normal');
    doc.text(`El. +${results.staticHeadM > 0 ? results.staticHeadM.toFixed(1) : '6.5'}m`, margin + 147, y + 28, { align: 'center' });

    // 6. Hydraulic Grade Line (HGL) Overlay
    doc.setDrawColor(52, 211, 153);
    doc.setLineWidth(0.6);
    doc.setLineDashPattern([2, 1.5], 0);
    doc.line(margin + 23, y + 28, margin + 74, y + 24); // Suction pressure gradient
    doc.line(margin + 90, y + 24, margin + 90, y + 3);  // Pump dynamic head boost
    doc.line(margin + 90, y + 3, margin + 146, y + 11); // Discharge pressure gradient
    doc.setLineDashPattern([], 0);

    // Legend
    doc.setFontSize(5.5);
    doc.setTextColor(52, 211, 153);
    doc.text('--- Hydraulic Grade Line (HGL Profile)', margin + contentWidth - 55, y + 41);

    y += 48;
  }

  const col1 = margin + 3;
  const col2 = margin + 50;
  const col3 = margin + 100;

  // Section 1: Fluid Characteristics
  if (sections.includeFluidProperties !== false) {
    y = addSectionHeader('1.0 Fluid Thermodynamics & Physical Properties', y);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const fl = results.fluid;
    doc.text(`Fuel Grade:`, col1, y + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(`${fl.type}`, col1 + 20, y + 3);
    doc.setFont('helvetica', 'normal');

    doc.text(`Operating Temp:`, col2, y + 3);
    doc.text(`${fl.tempC} °C (${((fl.tempC * 9) / 5 + 32).toFixed(1)} °F)`, col2 + 25, y + 3);

    doc.text(`Density @ Temp:`, col3, y + 3);
    doc.text(
      `${fl.computedDensityKgM3} kg/m³ (${(fl.computedDensityKgM3 * 0.0083454).toFixed(2)} lb/gal)`,
      col3 + 25,
      y + 3
    );

    doc.text(`Kinematic Viscosity:`, col1, y + 7.5);
    doc.text(`${fl.computedViscosityCSt} cSt (mm²/s)`, col1 + 28, y + 7.5);

    doc.text(`Dynamic Viscosity:`, col2, y + 7.5);
    doc.text(`${(fl.dynamicViscosityPaS * 1000).toFixed(2)} cP (mPa·s)`, col2 + 28, y + 7.5);

    doc.text(`Vapor Pressure:`, col3, y + 7.5);
    doc.text(
      `${fl.vaporPressureKPa} kPa abs (${(fl.vaporPressureKPa * 0.145).toFixed(3)} psia)`,
      col3 + 25,
      y + 7.5
    );

    y += 12;
  }

  // Section 2: Piping Hydraulic Analysis (Darcy-Weisbach)
  if (sections.includePipingCalculations !== false) {
    y = addSectionHeader('2.0 Piping Sizing, Velocity & Darcy-Weisbach Calculations', y);

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);

    const thY = y + 3.8;
    doc.text('LINE SEGMENT', margin + 2, thY);
    doc.text('SIZE & SCH', margin + 35, thY);
    doc.text('ID (mm / in)', margin + 65, thY);
    doc.text('VELOCITY', margin + 95, thY);
    doc.text('REYNOLDS / REGIME', margin + 120, thY);
    doc.text('FRICTION f', margin + 158, thY);
    doc.text('HEAD LOSS', margin + 180, thY, { align: 'right' });

    y += 6;

    // Suction Row
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Suction Line', margin + 2, y + 3.5);
    doc.text(`NPS ${results.suctionNps}" Sch ${results.suctionSchedule}`, margin + 35, y + 3.5);
    doc.text(`${results.suctionIdMm} mm (${(results.suctionIdMm / 25.4).toFixed(2)}")`, margin + 65, y + 3.5);

    const sVelText = isMetric
      ? `${results.suctionVelocityMps} m/s`
      : `${(results.suctionVelocityMps * 3.28084).toFixed(2)} ft/s`;
    doc.text(sVelText, margin + 95, y + 3.5);
    doc.text(`${results.suctionReynolds.toLocaleString()} (${results.suctionRegime})`, margin + 120, y + 3.5);
    doc.text(`${results.suctionFrictionFactor}`, margin + 158, y + 3.5);
    doc.text(
      isMetric ? `${results.suctionTotalHeadLossM} m` : `${(results.suctionTotalHeadLossM * 3.28084).toFixed(2)} ft`,
      margin + 180,
      y + 3.5,
      { align: 'right' }
    );

    y += 5.5;

    // Discharge Row
    doc.text('Discharge Line', margin + 2, y + 3.5);
    doc.text(`NPS ${results.dischargeNps}" Sch ${results.dischargeSchedule}`, margin + 35, y + 3.5);
    doc.text(`${results.dischargeIdMm} mm (${(results.dischargeIdMm / 25.4).toFixed(2)}")`, margin + 65, y + 3.5);

    const dVelText = isMetric
      ? `${results.dischargeVelocityMps} m/s`
      : `${(results.dischargeVelocityMps * 3.28084).toFixed(2)} ft/s`;
    doc.text(dVelText, margin + 95, y + 3.5);
    doc.text(`${results.dischargeReynolds.toLocaleString()} (${results.dischargeRegime})`, margin + 120, y + 3.5);
    doc.text(`${results.dischargeFrictionFactor}`, margin + 158, y + 3.5);
    doc.text(
      isMetric ? `${results.dischargeTotalHeadLossM} m` : `${(results.dischargeTotalHeadLossM * 3.28084).toFixed(2)} ft`,
      margin + 180,
      y + 3.5,
      { align: 'right' }
    );

    y += 8.5;
  }

  // Section 3: Total Dynamic Head Breakdown
  if (sections.includeTdhBreakdown !== false) {
    y = addSectionHeader('3.0 System Hydraulic Head (TDH) Breakdown', y);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    doc.text(`Design Flow Rate:`, col1, y + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(`${results.flowRateM3h} m³/h (${results.flowRateGpm} US GPM)`, col1 + 28, y + 3);
    doc.setFont('helvetica', 'normal');

    doc.text(`Static Elevation Head:`, col2, y + 3);
    doc.text(
      isMetric ? `${results.staticHeadM} m` : `${(results.staticHeadM * 3.28084).toFixed(2)} ft`,
      col2 + 35,
      y + 3
    );

    doc.text(`Pipe Friction Loss:`, col3, y + 3);
    doc.text(
      isMetric ? `${results.totalFrictionHeadLossM} m` : `${(results.totalFrictionHeadLossM * 3.28084).toFixed(2)} ft`,
      col3 + 30,
      y + 3
    );

    doc.text(`Fittings Minor Loss:`, col1, y + 7.5);
    doc.text(
      isMetric ? `${results.totalMinorHeadLossM} m` : `${(results.totalMinorHeadLossM * 3.28084).toFixed(2)} ft`,
      col1 + 30,
      y + 7.5
    );

    doc.text(`Terminal Backpressure:`, col2, y + 7.5);
    doc.text(
      isMetric ? `${results.terminalPressureHeadM} m` : `${(results.terminalPressureHeadM * 3.28084).toFixed(2)} ft`,
      col2 + 35,
      y + 7.5
    );

    doc.setFont('helvetica', 'bold');
    doc.text(`Total Dynamic Head:`, col3, y + 7.5);
    doc.setTextColor(15, 44, 89);
    doc.text(
      isMetric
        ? `${results.totalDynamicHeadM} m (${results.totalDynamicHeadKPa} kPa)`
        : `${(results.totalDynamicHeadM * 3.28084).toFixed(1)} ft (${results.totalDynamicHeadPsi} psi)`,
      col3 + 33,
      y + 7.5
    );
    doc.setTextColor(51, 65, 85);

    y += 13;
  }

  // Section 4: Pump Sizing & Operating Point
  if (sections.includePumpMatching !== false) {
    y = addSectionHeader('4.0 Diesel Pump Sizing & Performance Matching', y);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    doc.text(`Selected Pump Model:`, col1, y + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pump.manufacturer} - ${pump.model}`, col1 + 32, y + 3);
    doc.setFont('helvetica', 'normal');

    doc.text(`Pump Mechanism:`, col3, y + 3);
    doc.text(`${pump.type} (${pump.speedRpm} RPM)`, col3 + 27, y + 3);

    const op = results.pumpOperatingPoint;
    doc.text(`Operating Point Flow:`, col1, y + 7.5);
    doc.setFont('helvetica', 'bold');
    doc.text(op ? `${op.flowM3h} m³/h (${op.flowGpm} GPM)` : `${results.flowRateM3h} m³/h`, col1 + 32, y + 7.5);
    doc.setFont('helvetica', 'normal');

    doc.text(`Operating Head:`, col2, y + 7.5);
    doc.text(op ? `${op.headM} m (${op.headFt} ft)` : `${results.totalDynamicHeadM} m`, col2 + 25, y + 7.5);

    doc.text(`Pump Efficiency (η):`, col3, y + 7.5);
    doc.text(op ? `${op.efficiencyPct}%` : `${results.pumpEfficiencyPct}%`, col3 + 30, y + 7.5);

    doc.text(`Hydraulic Power:`, col1, y + 12);
    doc.text(
      `${results.hydraulicPowerKw} kW (${(results.hydraulicPowerKw * 1.341).toFixed(2)} HP)`,
      col1 + 25,
      y + 12
    );

    doc.text(`Brake Power (BHP):`, col2, y + 12);
    doc.text(`${results.brakeHorsepowerKw} kW (${results.brakeHorsepowerHp} HP)`, col2 + 28, y + 12);

    doc.setFont('helvetica', 'bold');
    doc.text(`Recommended Motor:`, col3, y + 12);
    doc.setTextColor(15, 44, 89);
    doc.text(`${results.recommendedMotorKw} kW (${results.recommendedMotorHp} HP)`, col3 + 34, y + 12);
    doc.setTextColor(51, 65, 85);

    y += 17;
  }

  // Section 5: NPSH & Cavitation Verification
  if (sections.includeNpshAudit !== false) {
    y = addSectionHeader('5.0 Net Positive Suction Head (NPSH) Verification', y);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    const fl = results.fluid;
    doc.text(`Atmospheric Head (Ha):`, col1, y + 3);
    doc.text(`${((101.325 * 1000) / (fl.computedDensityKgM3 * 9.80665)).toFixed(2)} m`, col1 + 35, y + 3);

    doc.text(`Vapor Pressure Head:`, col2, y + 3);
    doc.text(`${((fl.vaporPressureKPa * 1000) / (fl.computedDensityKgM3 * 9.80665)).toFixed(3)} m`, col2 + 35, y + 3);

    doc.text(`NPSHa Available:`, col3, y + 3);
    doc.setFont('helvetica', 'bold');
    doc.text(`${results.npshaM} m (${(results.npshaM * 3.28084).toFixed(1)} ft)`, col3 + 28, y + 3);
    doc.setFont('helvetica', 'normal');

    doc.text(`Required NPSHr:`, col1, y + 7.5);
    doc.text(`${results.npshrM} m`, col1 + 25, y + 7.5);

    doc.text(`Safety Margin (NPSHa - NPSHr):`, col2, y + 7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(
      results.npshStatus === 'PASS' ? 22 : results.npshStatus === 'WARNING' ? 180 : 185,
      results.npshStatus === 'PASS' ? 101 : 120,
      30
    );
    doc.text(`+${results.npshMarginM} m (${results.npshStatus})`, col2 + 48, y + 7.5);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');

    y += 13;
  }

  // Section: Fittings BOM Table (if toggled)
  if (sections.includeFittingsBom && fittings.length > 0) {
    y = addSectionHeader('6.0 Valve & Fitting Minor Losses Bill of Materials (Crane TP 410)', y);

    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);

    const fthY = y + 3.5;
    doc.text('LINE', margin + 2, fthY);
    doc.text('FITTING / VALVE DESCRIPTION', margin + 25, fthY);
    doc.text('K-COEFF', margin + 110, fthY);
    doc.text('QTY', margin + 140, fthY);
    doc.text('SUBTOTAL K', margin + 180, fthY, { align: 'right' });

    y += 5.5;
    doc.setFont('helvetica', 'normal');

    fittings
      .filter((f) => f.count > 0)
      .slice(0, 8)
      .forEach((fit) => {
        y = checkPageBreak(6, y);
        doc.setTextColor(51, 65, 85);
        doc.text(fit.location.toUpperCase(), margin + 2, y + 3.5);
        doc.text(fit.name, margin + 25, y + 3.5);
        doc.text(fit.kValue.toFixed(2), margin + 110, y + 3.5);
        doc.text(fit.count.toString(), margin + 140, y + 3.5);
        doc.text((fit.kValue * fit.count).toFixed(2), margin + 180, y + 3.5, { align: 'right' });
        y += 4.5;
      });

    y += 3;
  }

  // Section 7: ASME B31.3 Compliance Audit
  if (sections.includeAsmeCompliance !== false) {
    y = addSectionHeader('7.0 ASME B31.3 & API RP 2003 Compliance Audit', y);
    doc.setFontSize(7);

    for (const msg of results.asmeCompliance.messages) {
      y = checkPageBreak(6, y);
      if (msg.type === 'success') {
        doc.setTextColor(22, 101, 52);
        doc.text(`[PASS] ${msg.code}:`, margin + 3, y + 3);
      } else if (msg.type === 'warning') {
        doc.setTextColor(180, 83, 9);
        doc.text(`[WARN] ${msg.code}:`, margin + 3, y + 3);
      } else {
        doc.setTextColor(185, 28, 28);
        doc.text(`[FAIL] ${msg.code}:`, margin + 3, y + 3);
      }

      doc.setTextColor(51, 65, 85);
      doc.text(msg.message, margin + 45, y + 3);
      y += 4;
    }
    y += 3;
  }

  // Section 8: Approvals Block
  if (sections.includeSignOffBlocks !== false) {
    y = checkPageBreak(28, y);
    y = addSectionHeader('8.0 Approvals', y);

    const blockWidth = (contentWidth - 6) / 3;
    const blockHeight = 21;

    const drawSignBlock = (x: number, title: string, name: string, date: string) => {
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y + 2, blockWidth, blockHeight, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(15, 44, 89);
      doc.text(title, x + 3, y + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Signature:', x + 3, y + 10.5);

      doc.setDrawColor(148, 163, 184);
      doc.setLineDashPattern([1, 1], 0);
      doc.line(x + 16, y + 10.5, x + blockWidth - 4, y + 10.5);
      doc.setLineDashPattern([], 0);

      doc.text(`Name: ${name}`, x + 3, y + 15);
      doc.text(`Date: ${date}`, x + 3, y + 19);
    };

    const todayStr = project.date || '____________';
    drawSignBlock(
      margin,
      'PREPARED BY',
      project.leadEngineer || '____________________',
      todayStr
    );
    drawSignBlock(
      margin + blockWidth + 3,
      'CHECKED BY',
      project.reviewer || '____________________',
      todayStr
    );
    drawSignBlock(
      margin + (blockWidth + 3) * 2,
      'APPROVED BY',
      project.client || '____________________',
      todayStr
    );
  }

  // Footer on current page
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Diesel Piping & Pump Workstation | Certified Hydraulic Algorithm', margin, pageHeight - 6);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, pageHeight - 6, { align: 'right' });

  // Save PDF
  const filename = `${project.projectNumber ? project.projectNumber.trim() : 'DIESEL-PIPING-CALC'}${project.revision ? '-Rev' + project.revision.trim() : ''}.pdf`;
  doc.save(filename);
}
