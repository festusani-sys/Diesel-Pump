/**
 * @license
 * ASME B31.3 Diesel Piping Materials & Dimension Catalog
 */

import { PipeMaterial, PipeScheduleEntry } from '../types';

export const PIPE_MATERIALS: PipeMaterial[] = [
  {
    id: 'cs_a106_b',
    name: 'Carbon Steel ASTM A106 Gr. B',
    standard: 'ASME B31.3 / ASTM A106 Seamless',
    absoluteRoughnessMm: 0.045, // Commercial steel per Crane TP 410
    maxTempC: 427,
    minTempC: -29,
    allowableStressMpa: 137.9, // 20.0 ksi @ -29 to 200 F per ASME B31.3 Table A-1
    jointQualityFactorE: 1.0, // Seamless pipe
    coefficientY: 0.4, // ASME Table 304.1.1 for ferritic steels < 482 C
    corrosionAllowanceMm: 1.5, // Standard fuel hydrocarbon allowance
    colorHex: '#374151', // Dark Charcoal Slate
    category: 'Metallic',
    description: 'Premier seamless carbon steel for fuel oil, diesel, and hydrocarbon process piping under ASME B31.3.',
  },
  {
    id: 'cs_a53_b',
    name: 'Carbon Steel ASTM A53 Gr. B (ERW)',
    standard: 'ASME B31.3 / ASTM A53 Electric Resistance Welded',
    absoluteRoughnessMm: 0.045,
    maxTempC: 400,
    minTempC: -29,
    allowableStressMpa: 117.2, // 17.0 ksi (E=0.85 factored)
    jointQualityFactorE: 0.85, // ERW weld factor
    coefficientY: 0.4,
    corrosionAllowanceMm: 1.5,
    colorHex: '#4b5563', // Slate Gray
    category: 'Metallic',
    description: 'Electric resistance welded carbon steel for general industrial diesel transfer lines.',
  },
  {
    id: 'ss_304',
    name: 'Stainless Steel 304/304L (ASTM A312)',
    standard: 'ASME B31.3 / ASTM A312 TP304',
    absoluteRoughnessMm: 0.015, // Drawn stainless steel tubing/pipe
    maxTempC: 538,
    minTempC: -196,
    allowableStressMpa: 115.1, // 16.7 ksi @ 40 C
    jointQualityFactorE: 1.0, // Seamless
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.0, // Corrosion resistant to ultra-low sulfur diesel
    colorHex: '#94a3b8', // Silver Stainless
    category: 'Metallic',
    description: 'Austenitic stainless steel with high corrosion resistance, zero fuel varnish/sediment degradation.',
  },
  {
    id: 'ss_316',
    name: 'Stainless Steel 316/316L (ASTM A312)',
    standard: 'ASME B31.3 / ASTM A312 TP316 Marine Grade',
    absoluteRoughnessMm: 0.015,
    maxTempC: 550,
    minTempC: -196,
    allowableStressMpa: 115.1,
    jointQualityFactorE: 1.0,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.0,
    colorHex: '#cbd5e1', // Polished Marine Silver
    category: 'Metallic',
    description: 'Molybdenum-alloyed austenitic stainless steel for coastal, marine, and offshore diesel generator installations.',
  },
  {
    id: 'hdpe_pe100',
    name: 'HDPE PE100 (DIN 8074 / ASTM F714 SDR 11)',
    standard: 'ISO 4427 / ASTM F714 Polyethylene SDR 11',
    absoluteRoughnessMm: 0.007, // Ultra-smooth thermoplastic
    maxTempC: 60,
    minTempC: -40,
    allowableStressMpa: 8.0, // 8.0 MPa Hydrostatic Design Basis with hydrocarbon derating
    jointQualityFactorE: 1.0, // Butt fused joint
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.0,
    colorHex: '#1e3a8a', // High-Vis Poly Blue/Black
    category: 'Non-Metallic',
    description: 'Corrosion-proof thermoplastic for buried underground storage tank (UST) suction and return headers.',
  },
  {
    id: 'copper_type_k',
    name: 'Copper Tube Type K (ASTM B88 Heavy Wall)',
    standard: 'ASTM B88 / ASME B31.3 Seamless Copper',
    absoluteRoughnessMm: 0.0015, // Extremely smooth drawn copper
    maxTempC: 204,
    minTempC: -196,
    allowableStressMpa: 41.4, // 6.0 ksi annealed
    jointQualityFactorE: 1.0,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.0,
    colorHex: '#b45309', // Burnished Amber Copper
    category: 'Metallic',
    description: 'Heavy-gauge seamless drawn copper tube for indoor day-tank and emergency diesel generator fuel supply lines.',
  },
  {
    id: 'copper_type_l',
    name: 'Copper Tube Type L (ASTM B88 Medium Wall)',
    standard: 'ASTM B88 / ASME B31.3 Seamless Copper',
    absoluteRoughnessMm: 0.0015,
    maxTempC: 204,
    minTempC: -196,
    allowableStressMpa: 41.4,
    jointQualityFactorE: 1.0,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.0,
    colorHex: '#d97706', // Copper Bronze
    category: 'Metallic',
    description: 'Medium-wall seamless copper for low-pressure diesel burner and instrument feed loops.',
  },
  {
    id: 'ductile_iron',
    name: 'Ductile Iron Class 52 (AWWA C151)',
    standard: 'AWWA C151 / EN 545 Epoxy Lined',
    absoluteRoughnessMm: 0.03, // Epoxy lined interior
    maxTempC: 150,
    minTempC: -20,
    allowableStressMpa: 110.0,
    jointQualityFactorE: 0.8,
    coefficientY: 0.4,
    corrosionAllowanceMm: 1.0,
    colorHex: '#475569', // Iron Slate
    category: 'Metallic',
    description: 'Rugged ductile iron with interior fuel-grade epoxy lining for underground heavy industrial diesel mains.',
  },
  {
    id: 'galv_steel',
    name: 'Galvanized Steel ASTM A53',
    standard: 'ASTM A53 Schedule 40 Hot-Dip Galvanized',
    absoluteRoughnessMm: 0.15, // Zinc hot-dip rougher surface
    maxTempC: 200,
    minTempC: -29,
    allowableStressMpa: 117.2,
    jointQualityFactorE: 0.85,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.5,
    colorHex: '#64748b', // Zinc Zinc Gray
    category: 'Metallic',
    description: 'Zinc-coated steel for atmospheric outdoor diesel piping (Note: Check zinc reactivity with high-sulfur fuel).',
  },
];

/**
 * Standard Pipe Dimensions per ASME B36.10M (Carbon Steel) and B36.19M (Stainless Steel)
 */
export const PIPE_SCHEDULE_DATABASE: PipeScheduleEntry[] = [
  {
    nps: '1/2',
    dn: 15,
    odMm: 21.3,
    schedules: [
      { schedule: '10', wallThkMm: 2.11, idMm: 17.08 },
      { schedule: '40', wallThkMm: 2.77, idMm: 15.76 },
      { schedule: '80', wallThkMm: 3.73, idMm: 13.84 },
      { schedule: '160', wallThkMm: 4.78, idMm: 11.74 },
    ],
  },
  {
    nps: '3/4',
    dn: 20,
    odMm: 26.7,
    schedules: [
      { schedule: '10', wallThkMm: 2.11, idMm: 22.48 },
      { schedule: '40', wallThkMm: 2.87, idMm: 20.96 },
      { schedule: '80', wallThkMm: 3.91, idMm: 18.88 },
      { schedule: '160', wallThkMm: 5.56, idMm: 15.58 },
    ],
  },
  {
    nps: '1',
    dn: 25,
    odMm: 33.4,
    schedules: [
      { schedule: '10', wallThkMm: 2.77, idMm: 27.86 },
      { schedule: '40', wallThkMm: 3.38, idMm: 26.64 },
      { schedule: '80', wallThkMm: 4.55, idMm: 24.3 },
      { schedule: '160', wallThkMm: 6.35, idMm: 20.7 },
    ],
  },
  {
    nps: '1-1/4',
    dn: 32,
    odMm: 42.2,
    schedules: [
      { schedule: '10', wallThkMm: 2.77, idMm: 36.66 },
      { schedule: '40', wallThkMm: 3.56, idMm: 35.08 },
      { schedule: '80', wallThkMm: 4.85, idMm: 32.5 },
      { schedule: '160', wallThkMm: 6.35, idMm: 29.5 },
    ],
  },
  {
    nps: '1-1/2',
    dn: 40,
    odMm: 48.3,
    schedules: [
      { schedule: '10', wallThkMm: 2.77, idMm: 42.76 },
      { schedule: '40', wallThkMm: 3.68, idMm: 40.94 },
      { schedule: '80', wallThkMm: 5.08, idMm: 38.14 },
      { schedule: '160', wallThkMm: 7.14, idMm: 34.02 },
    ],
  },
  {
    nps: '2',
    dn: 50,
    odMm: 60.3,
    schedules: [
      { schedule: '10', wallThkMm: 2.77, idMm: 54.76 },
      { schedule: '40', wallThkMm: 3.91, idMm: 52.48 },
      { schedule: '80', wallThkMm: 5.54, idMm: 49.22 },
      { schedule: '160', wallThkMm: 8.74, idMm: 42.82 },
    ],
  },
  {
    nps: '2-1/2',
    dn: 65,
    odMm: 73.0,
    schedules: [
      { schedule: '10', wallThkMm: 3.05, idMm: 66.9 },
      { schedule: '40', wallThkMm: 5.16, idMm: 62.68 },
      { schedule: '80', wallThkMm: 7.01, idMm: 58.98 },
      { schedule: '160', wallThkMm: 9.53, idMm: 53.94 },
    ],
  },
  {
    nps: '3',
    dn: 80,
    odMm: 88.9,
    schedules: [
      { schedule: '10', wallThkMm: 3.05, idMm: 82.8 },
      { schedule: '40', wallThkMm: 5.49, idMm: 77.92 },
      { schedule: '80', wallThkMm: 7.62, idMm: 73.66 },
      { schedule: '160', wallThkMm: 11.13, idMm: 66.64 },
    ],
  },
  {
    nps: '4',
    dn: 100,
    odMm: 114.3,
    schedules: [
      { schedule: '10', wallThkMm: 3.05, idMm: 108.2 },
      { schedule: '40', wallThkMm: 6.02, idMm: 102.26 },
      { schedule: '80', wallThkMm: 8.56, idMm: 97.18 },
      { schedule: '160', wallThkMm: 13.49, idMm: 87.32 },
    ],
  },
  {
    nps: '6',
    dn: 150,
    odMm: 168.3,
    schedules: [
      { schedule: '10', wallThkMm: 3.4, idMm: 161.5 },
      { schedule: '40', wallThkMm: 7.11, idMm: 154.08 },
      { schedule: '80', wallThkMm: 10.97, idMm: 146.36 },
      { schedule: '160', wallThkMm: 18.26, idMm: 131.78 },
    ],
  },
  {
    nps: '8',
    dn: 200,
    odMm: 219.1,
    schedules: [
      { schedule: '10', wallThkMm: 3.76, idMm: 211.58 },
      { schedule: '40', wallThkMm: 8.18, idMm: 202.74 },
      { schedule: '80', wallThkMm: 12.7, idMm: 193.7 },
      { schedule: '160', wallThkMm: 23.01, idMm: 173.08 },
    ],
  },
  {
    nps: '10',
    dn: 250,
    odMm: 273.0,
    schedules: [
      { schedule: '10', wallThkMm: 4.19, idMm: 264.62 },
      { schedule: '40', wallThkMm: 9.27, idMm: 254.46 },
      { schedule: '80', wallThkMm: 15.09, idMm: 242.82 },
      { schedule: '160', wallThkMm: 28.58, idMm: 215.84 },
    ],
  },
  {
    nps: '12',
    dn: 300,
    odMm: 323.8,
    schedules: [
      { schedule: '10', wallThkMm: 4.57, idMm: 314.66 },
      { schedule: '40', wallThkMm: 10.31, idMm: 303.18 },
      { schedule: '80', wallThkMm: 17.48, idMm: 288.84 },
      { schedule: '160', wallThkMm: 33.32, idMm: 257.16 },
    ],
  },
];

/**
 * Standard ASME B31.3 Maximum Allowable Working Pressure (MAWP) Calculation
 * Formula: P = (2 * S * E * (t - c)) / (D - 2 * Y * (t - c))
 * @param material Pipe material object
 * @param odMm Outside diameter in mm
 * @param wallThkMm Nominal wall thickness in mm
 * @returns Maximum allowable internal pressure in Bar
 */
export function calculateAsmeB313Mawp(
  material: PipeMaterial,
  odMm: number,
  wallThkMm: number
): number {
  const S = material.allowableStressMpa; // MPa = N/mm2
  const E = material.jointQualityFactorE;
  const Y = material.coefficientY;
  const c = material.corrosionAllowanceMm;

  // Effective structural wall thickness
  const tEff = Math.max(0.1, wallThkMm - c);

  if (odMm <= 2 * Y * tEff) {
    return 0;
  }

  // P in MPa
  const pMpa = (2 * S * E * tEff) / (odMm - 2 * Y * tEff);

  // Convert MPa to Bar (1 MPa = 10 bar)
  const pBar = Math.max(0, pMpa * 10);
  return Number(pBar.toFixed(1));
}

/**
 * Standard Pipe Fitting Loss Coefficients K (Crane Technical Paper No. 410 / Hydraulic Institute)
 */
export const DEFAULT_FITTINGS = [
  { id: 'elbow_90_lr', type: 'elbow_90', name: '90° Elbow (Long Radius)', kValue: 0.3, count: 2, location: 'suction' as const },
  { id: 'elbow_90_lr_d', type: 'elbow_90', name: '90° Elbow (Long Radius)', kValue: 0.3, count: 4, location: 'discharge' as const },
  { id: 'elbow_45', type: 'elbow_45', name: '45° Elbow', kValue: 0.18, count: 0, location: 'discharge' as const },
  { id: 'gate_valve_s', type: 'gate_valve', name: 'Gate Valve (Full Bore)', kValue: 0.15, count: 1, location: 'suction' as const },
  { id: 'ball_valve_d', type: 'ball_valve', name: 'Ball Valve (Full Bore)', kValue: 0.05, count: 2, location: 'discharge' as const },
  { id: 'check_valve_d', type: 'check_valve', name: 'Swing Check Valve', kValue: 2.0, count: 1, location: 'discharge' as const },
  { id: 'foot_valve_s', type: 'foot_valve', name: 'Foot Valve with Strainer', kValue: 3.5, count: 1, location: 'suction' as const },
  { id: 'y_strainer_s', type: 'y_strainer', name: 'Y-Strainer (Clean Diesel)', kValue: 1.2, count: 1, location: 'suction' as const },
  { id: 'flow_switch_d', type: 'flow_switch', name: 'Flow Switch (Paddle Type)', kValue: 0.9, count: 1, location: 'discharge' as const },
  { id: 'pipe_entrance_s', type: 'entrance', name: 'Pipe Entrance (Inward/Flush)', kValue: 0.5, count: 1, location: 'suction' as const },
  { id: 'pipe_exit_d', type: 'exit', name: 'Pipe Exit to Tank', kValue: 1.0, count: 1, location: 'discharge' as const },
];
