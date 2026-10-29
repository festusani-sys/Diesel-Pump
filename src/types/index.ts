/**
 * @license
 * ASME B31.3 Diesel Piping & Pump Hydraulic Sizing Engineering Suite
 * Type Definitions
 */

export type UnitSystem = 'SI' | 'Imperial';

export type FlowUnit = 'm3/h' | 'L/min' | 'L/s' | 'GPM' | 'GPH' | 'BPD';
export type PressureUnit = 'bar' | 'kPa' | 'm' | 'psi' | 'ft';
export type LengthUnit = 'm' | 'mm' | 'ft' | 'in';
export type VelocityUnit = 'm/s' | 'ft/s';
export type TempUnit = 'C' | 'F';

export interface PipeMaterial {
  id: string;
  name: string;
  standard: string;
  absoluteRoughnessMm: number; // mm
  maxTempC: number;
  minTempC: number;
  allowableStressMpa: number; // at 20-40 C per ASME B31.3 Table A-1
  jointQualityFactorE: number; // weld joint factor E (e.g. 1.0 for seamless, 0.85 for ERW)
  coefficientY: number; // ASME B31.3 Table 304.1.1 (0.4 for ferritic steels)
  corrosionAllowanceMm: number;
  colorHex: string;
  category: 'Metallic' | 'Non-Metallic';
  description: string;
}

export interface PipeScheduleEntry {
  nps: string; // e.g. "1/2", "3/4", "1", "1-1/2", "2", "3", "4", "6", "8", "10", "12"
  dn: number; // mm: 15, 20, 25, 40, 50, 80, 100, 150, 200, 250, 300
  odMm: number; // mm
  schedules: {
    schedule: string; // "10", "40", "80", "160", "SDR 11", "Type K", etc.
    wallThkMm: number;
    idMm: number;
  }[];
}

export interface FittingItem {
  id: string;
  type: string;
  name: string;
  kValue: number; // Loss coefficient K
  count: number;
  location: 'suction' | 'discharge';
}

export type TankArrangementId =
  | 'ust_suction_lift'
  | 'ast_flooded_suction'
  | 'day_tank_gravity'
  | 'duplex_duty_standby'
  | 'tanker_unloading';

export interface TankArrangement {
  id: TankArrangementId;
  name: string;
  category: string;
  description: string;
  defaultSuctionElevM: number;
  defaultPumpElevM: number;
  defaultDischargeElevM: number;
  defaultSuctionLenM: number;
  defaultDischargeLenM: number;
  defaultSuctionNps: string;
  defaultDischargeNps: string;
  defaultFlowM3h: number;
}

export interface DieselProperties {
  type: 'Diesel #2 (ULSD)' | 'Diesel #1 (Kerosene/Arctic)' | 'Biodiesel B20' | 'Marine Gas Oil (MGO)';
  tempC: number;
  referenceDensityKgM3: number; // at 15 C
  referenceViscosityCSt: number; // at 40 C
  computedDensityKgM3: number;
  computedViscosityCSt: number;
  dynamicViscosityPaS: number;
  vaporPressureKPa: number;
}

export interface PumpCurvePoint {
  q: number; // m3/h
  h: number; // m
  efficiency?: number; // % (0-100)
  npshr?: number; // m
}

export interface PumpModel {
  id: string;
  manufacturer: string;
  model: string;
  series: string;
  type: 'Positive Displacement Gear' | 'Self-Priming Centrifugal' | 'Sliding Vane' | 'Standard Centrifugal' | 'Submersible Turbine Pump (STP)';
  speedRpm: number;
  ratedFlowM3h: number;
  ratedHeadM: number;
  maxPressureBar: number;
  curvePoints: PumpCurvePoint[];
  polynomial: {
    // H(Q) = a*Q^2 + b*Q + c
    a: number;
    b: number;
    c: number;
  };
  efficiencyPolynomial?: {
    a: number;
    b: number;
    c: number;
  };
  notes: string;
}

export interface HydraulicResults {
  // Fluid
  fluid: DieselProperties;
  flowRateM3h: number;
  flowRateGpm: number;

  // Suction Line
  suctionNps: string;
  suctionSchedule: string;
  suctionIdMm: number;
  suctionVelocityMps: number;
  suctionReynolds: number;
  suctionRegime: 'Laminar' | 'Transition' | 'Turbulent';
  suctionFrictionFactor: number;
  suctionPipeHeadLossM: number;
  suctionFittingsHeadLossM: number;
  suctionTotalHeadLossM: number;
  suctionPressureDropKpa: number;

  // Discharge Line
  dischargeNps: string;
  dischargeSchedule: string;
  dischargeIdMm: number;
  dischargeVelocityMps: number;
  dischargeReynolds: number;
  dischargeRegime: 'Laminar' | 'Transition' | 'Turbulent';
  dischargeFrictionFactor: number;
  dischargePipeHeadLossM: number;
  dischargeFittingsHeadLossM: number;
  dischargeTotalHeadLossM: number;
  dischargePressureDropKpa: number;

  // System Total
  staticHeadM: number;
  totalFrictionHeadLossM: number;
  totalMinorHeadLossM: number;
  terminalPressureHeadM: number;
  totalDynamicHeadM: number;
  totalDynamicHeadKPa: number;
  totalDynamicHeadPsi: number;

  // NPSH
  atmosphericPressureKPa: number;
  vaporPressureKPa: number;
  npshaM: number;
  npshrM: number;
  npshMarginM: number;
  npshStatus: 'PASS' | 'WARNING' | 'FAIL';

  // Power & Motors
  hydraulicPowerKw: number;
  pumpEfficiencyPct: number;
  brakeHorsepowerKw: number;
  brakeHorsepowerHp: number;
  recommendedMotorKw: number;
  recommendedMotorHp: number;

  // ASME B31.3 Compliance & Ratings
  suctionMawpBar: number;
  dischargeMawpBar: number;
  asmeCompliance: {
    status: 'COMPLIANT' | 'WARNING' | 'NON-COMPLIANT';
    suctionVelocityValid: boolean;
    dischargeVelocityValid: boolean;
    pressureValid: boolean;
    npshValid: boolean;
    messages: {
      type: 'success' | 'warning' | 'error';
      code: string;
      message: string;
    }[];
  };

  // Pump Operating Point
  pumpOperatingPoint?: {
    flowM3h: number;
    flowGpm: number;
    headM: number;
    headFt: number;
    efficiencyPct: number;
    powerKw: number;
    meetsDemand: boolean;
  };
}

export interface ReportSectionsConfig {
  includeProjectInfo: boolean;
  includePipingDiagram: boolean;
  includeFluidProperties: boolean;
  includePipingCalculations: boolean;
  includeTdhBreakdown: boolean;
  includePumpMatching: boolean;
  includeNpshAudit: boolean;
  includeAsmeCompliance: boolean;
  includeFittingsBom: boolean;
  includeSignOffBlocks: boolean;
}

export interface ProjectMetadata {
  projectName: string;
  projectNumber: string;
  client: string;
  location: string;
  leadEngineer: string;
  peNumber?: string;
  reviewer: string;
  revision: string;
  date: string;
  notes: string;
  companyLogoBase64?: string;
  reportSections?: ReportSectionsConfig;
}
