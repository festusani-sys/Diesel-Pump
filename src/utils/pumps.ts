/**
 * @license
 * ASME B31.3 Diesel Piping - Pump Performance Curves & Operating Point Engine
 */

import { PumpCurvePoint, PumpModel } from '../types';

export const PREDEFINED_PUMPS: PumpModel[] = [
  {
    id: 'viking_g4124a',
    manufacturer: 'Viking Pump',
    series: 'Series 4124A',
    model: 'G4124A Internal Gear Fuel Oil Transfer',
    type: 'Positive Displacement Gear',
    speedRpm: 1200,
    ratedFlowM3h: 12.0,
    ratedHeadM: 50.0,
    maxPressureBar: 7.0,
    curvePoints: [
      { q: 0, h: 58.0, efficiency: 0, npshr: 1.5 },
      { q: 4.0, h: 55.0, efficiency: 52, npshr: 1.8 },
      { q: 8.0, h: 52.0, efficiency: 68, npshr: 2.1 },
      { q: 12.0, h: 48.0, efficiency: 72, npshr: 2.5 },
      { q: 15.0, h: 42.0, efficiency: 69, npshr: 3.0 },
      { q: 18.0, h: 32.0, efficiency: 60, npshr: 3.8 },
    ],
    polynomial: { a: -0.078, b: -0.03, c: 58.0 },
    efficiencyPolynomial: { a: -0.45, b: 9.8, c: 18 },
    notes: 'Heavy-duty rotary internal gear pump designed for clean fuel oil, ULSD, and biodiesel with mechanical seal and internal relief valve.',
  },
  {
    id: 'viking_h4124a',
    manufacturer: 'Viking Pump',
    series: 'Series 4124A High Capacity',
    model: 'H4124A Internal Gear Bulk Transfer',
    type: 'Positive Displacement Gear',
    speedRpm: 1200,
    ratedFlowM3h: 25.0,
    ratedHeadM: 55.0,
    maxPressureBar: 8.5,
    curvePoints: [
      { q: 0, h: 65.0, efficiency: 0, npshr: 1.8 },
      { q: 10.0, h: 62.0, efficiency: 60, npshr: 2.2 },
      { q: 20.0, h: 58.0, efficiency: 74, npshr: 2.8 },
      { q: 25.0, h: 54.0, efficiency: 75, npshr: 3.2 },
      { q: 30.0, h: 48.0, efficiency: 71, npshr: 3.9 },
      { q: 35.0, h: 38.0, efficiency: 62, npshr: 4.8 },
    ],
    polynomial: { a: -0.021, b: -0.04, c: 65.0 },
    efficiencyPolynomial: { a: -0.12, b: 5.7, c: 20 },
    notes: 'High-volume internal gear pump ideal for tanker unloading, bulk tank transfers, and critical backup power generator loops.',
  },
  {
    id: 'gorman_rupp_02f3',
    manufacturer: 'Gorman-Rupp',
    series: 'O-Series Petroleum',
    model: '02F3-B Self-Priming Centrifugal',
    type: 'Self-Priming Centrifugal',
    speedRpm: 2900,
    ratedFlowM3h: 18.0,
    ratedHeadM: 32.0,
    maxPressureBar: 5.5,
    curvePoints: [
      { q: 0, h: 38.0, efficiency: 0, npshr: 1.8 },
      { q: 8.0, h: 36.0, efficiency: 55, npshr: 2.2 },
      { q: 14.0, h: 34.0, efficiency: 66, npshr: 2.6 },
      { q: 18.0, h: 31.0, efficiency: 68, npshr: 3.1 },
      { q: 22.0, h: 26.0, efficiency: 64, npshr: 3.9 },
      { q: 26.0, h: 18.0, efficiency: 52, npshr: 5.2 },
    ],
    polynomial: { a: -0.029, b: -0.01, c: 38.0 },
    efficiencyPolynomial: { a: -0.22, b: 7.5, c: 10 },
    notes: 'Self-priming petroleum pump equipped with straight-in suction and Viton mechanical seals, eliminates vapor lock in long diesel suction headers.',
  },
  {
    id: 'gorman_rupp_03d3',
    manufacturer: 'Gorman-Rupp',
    series: 'O-Series High Flow',
    model: '03D3-B Bulk Petroleum Transfer',
    type: 'Self-Priming Centrifugal',
    speedRpm: 2900,
    ratedFlowM3h: 45.0,
    ratedHeadM: 36.0,
    maxPressureBar: 6.0,
    curvePoints: [
      { q: 0, h: 44.0, efficiency: 0, npshr: 2.1 },
      { q: 20.0, h: 42.0, efficiency: 58, npshr: 2.7 },
      { q: 35.0, h: 39.0, efficiency: 71, npshr: 3.4 },
      { q: 45.0, h: 35.0, efficiency: 73, npshr: 4.1 },
      { q: 55.0, h: 28.0, efficiency: 67, npshr: 5.2 },
      { q: 65.0, h: 18.0, efficiency: 54, npshr: 6.5 },
    ],
    polynomial: { a: -0.0062, b: -0.005, c: 44.0 },
    efficiencyPolynomial: { a: -0.038, b: 3.3, c: 12 },
    notes: 'Industrial grade 3-inch self-priming pump suited for bulk fuel terminals and multi-generator common supply headers.',
  },
  {
    id: 'blackmer_txd25a',
    manufacturer: 'Blackmer',
    series: 'TXD Series',
    model: 'TXD2.5A Sliding Vane Petroleum',
    type: 'Sliding Vane',
    speedRpm: 640,
    ratedFlowM3h: 22.0,
    ratedHeadM: 60.0,
    maxPressureBar: 8.6,
    curvePoints: [
      { q: 0, h: 72.0, efficiency: 0, npshr: 1.6 },
      { q: 10.0, h: 68.0, efficiency: 64, npshr: 2.0 },
      { q: 18.0, h: 64.0, efficiency: 75, npshr: 2.5 },
      { q: 22.0, h: 60.0, efficiency: 77, npshr: 2.9 },
      { q: 26.0, h: 54.0, efficiency: 73, npshr: 3.5 },
      { q: 30.0, h: 42.0, efficiency: 63, npshr: 4.5 },
    ],
    polynomial: { a: -0.033, b: -0.02, c: 72.0 },
    efficiencyPolynomial: { a: -0.16, b: 6.8, c: 15 },
    notes: 'Sliding vane positive displacement design with cavitation suppression liners; sustains high volumetric efficiency over a wide viscosity envelope.',
  },
  {
    id: 'fe_petro_stp15',
    manufacturer: 'Franklin Fueling / FE Petro',
    series: 'Submersible Turbine Pump',
    model: 'STP 1.5 HP MagVane',
    type: 'Submersible Turbine Pump (STP)',
    speedRpm: 3450,
    ratedFlowM3h: 15.0,
    ratedHeadM: 26.0,
    maxPressureBar: 3.8,
    curvePoints: [
      { q: 0, h: 32.0, efficiency: 0, npshr: 0.8 },
      { q: 6.0, h: 30.0, efficiency: 52, npshr: 1.0 },
      { q: 12.0, h: 27.5, efficiency: 66, npshr: 1.3 },
      { q: 15.0, h: 25.0, efficiency: 68, npshr: 1.6 },
      { q: 18.0, h: 21.0, efficiency: 62, npshr: 2.1 },
      { q: 22.0, h: 14.0, efficiency: 48, npshr: 3.0 },
    ],
    polynomial: { a: -0.038, b: -0.01, c: 32.0 },
    efficiencyPolynomial: { a: -0.3, b: 8.5, c: 15 },
    notes: 'In-tank submersible turbine pump installed directly at the bottom of underground storage tanks (UST). Operates with zero suction lift and zero suction vapor lock risk.',
  },
  {
    id: 'piusi_panther_56',
    manufacturer: 'Piusi',
    series: 'Panther Series',
    model: 'Panther 56 Rotary Vane Diesel Transfer',
    type: 'Sliding Vane',
    speedRpm: 2900,
    ratedFlowM3h: 3.4,
    ratedHeadM: 15.0,
    maxPressureBar: 2.0,
    curvePoints: [
      { q: 0, h: 18.0, efficiency: 0, npshr: 1.2 },
      { q: 1.0, h: 17.0, efficiency: 42, npshr: 1.4 },
      { q: 2.0, h: 15.5, efficiency: 58, npshr: 1.8 },
      { q: 3.0, h: 13.0, efficiency: 65, npshr: 2.2 },
      { q: 3.4, h: 11.5, efficiency: 66, npshr: 2.5 },
      { q: 4.0, h: 6.5, efficiency: 50, npshr: 3.2 },
    ],
    polynomial: { a: -0.865, b: 0.863, c: 17.62 },
    efficiencyPolynomial: { a: -8.82, b: 48.08, c: 0.5 },
    notes: 'Industry-standard Italian compact rotary vane pump with internal bypass valve. Continuous duty motor with thermal protection, engineered for diesel fuel dispensing and tank-to-tank transfer.',
  },
  {
    id: 'piusi_panther_72',
    manufacturer: 'Piusi',
    series: 'Panther Series',
    model: 'Panther 72 High-Speed Diesel Vane',
    type: 'Sliding Vane',
    speedRpm: 2900,
    ratedFlowM3h: 4.3,
    ratedHeadM: 18.0,
    maxPressureBar: 2.4,
    curvePoints: [
      { q: 0, h: 22.0, efficiency: 0, npshr: 1.3 },
      { q: 1.5, h: 20.8, efficiency: 45, npshr: 1.6 },
      { q: 3.0, h: 18.5, efficiency: 60, npshr: 2.0 },
      { q: 4.3, h: 15.0, efficiency: 68, npshr: 2.6 },
      { q: 5.0, h: 11.5, efficiency: 62, npshr: 3.0 },
      { q: 5.5, h: 6.0, efficiency: 48, npshr: 3.6 },
    ],
    polynomial: { a: -0.677, b: 1.163, c: 21.49 },
    efficiencyPolynomial: { a: -4.86, b: 36.01, c: 0.2 },
    notes: 'High-speed self-priming rotary vane pump featuring reinforced sintered steel rotor, acetal resin vanes, cast iron body with anti-corrosion paint, and built-in 100-micron suction mesh filter.',
  },
  {
    id: 'piusi_e120',
    manufacturer: 'Piusi',
    series: 'E-Series High-Flow',
    model: 'E120 Heavy-Duty Diesel Vane Transfer',
    type: 'Sliding Vane',
    speedRpm: 1450,
    ratedFlowM3h: 6.0,
    ratedHeadM: 25.0,
    maxPressureBar: 3.0,
    curvePoints: [
      { q: 0, h: 28.0, efficiency: 0, npshr: 1.4 },
      { q: 2.0, h: 26.5, efficiency: 48, npshr: 1.7 },
      { q: 4.0, h: 24.0, efficiency: 64, npshr: 2.1 },
      { q: 6.0, h: 20.0, efficiency: 72, npshr: 2.7 },
      { q: 7.2, h: 15.5, efficiency: 70, npshr: 3.2 },
      { q: 8.2, h: 8.0, efficiency: 52, npshr: 4.0 },
    ],
    polynomial: { a: -0.362, b: 0.773, c: 27.37 },
    efficiencyPolynomial: { a: -2.45, b: 26.61, c: 1.0 },
    notes: 'Continuous-duty industrial rotary vane pump delivering up to 100-120 L/min for fleet refueling, day tank replenishment, and high-flow diesel bulk dispensing with built-in by-pass valve.',
  },
  {
    id: 'piusi_e80',
    manufacturer: 'Piusi',
    series: 'E-Series Industrial',
    model: 'E80 Self-Priming Rotary Vane',
    type: 'Sliding Vane',
    speedRpm: 1450,
    ratedFlowM3h: 4.5,
    ratedHeadM: 22.0,
    maxPressureBar: 2.5,
    curvePoints: [
      { q: 0, h: 24.0, efficiency: 0, npshr: 1.3 },
      { q: 1.5, h: 22.8, efficiency: 46, npshr: 1.6 },
      { q: 3.0, h: 20.5, efficiency: 62, npshr: 2.0 },
      { q: 4.5, h: 16.5, efficiency: 69, npshr: 2.6 },
      { q: 5.5, h: 10.5, efficiency: 58, npshr: 3.3 },
      { q: 6.2, h: 4.0, efficiency: 42, npshr: 4.1 },
    ],
    polynomial: { a: -0.681, b: 1.265, c: 23.4 },
    efficiencyPolynomial: { a: -4.64, b: 35.7, c: 0.5 },
    notes: 'Self-priming volumetric vane pump for stationary diesel transfer systems, equipped with sintered steel rotor and acetal resin vanes.',
  },
  {
    id: 'piusi_bipump',
    manufacturer: 'Piusi',
    series: 'Bi-Pump Mobile Series',
    model: 'Bi-Pump Dual Vane High-Flow (12V/24V)',
    type: 'Sliding Vane',
    speedRpm: 3000,
    ratedFlowM3h: 5.1,
    ratedHeadM: 16.0,
    maxPressureBar: 2.0,
    curvePoints: [
      { q: 0, h: 19.0, efficiency: 0, npshr: 1.4 },
      { q: 1.8, h: 17.5, efficiency: 45, npshr: 1.8 },
      { q: 3.5, h: 15.0, efficiency: 62, npshr: 2.3 },
      { q: 5.1, h: 11.5, efficiency: 66, npshr: 2.9 },
      { q: 6.2, h: 5.5, efficiency: 48, npshr: 3.7 },
    ],
    polynomial: { a: -0.377, b: 0.299, c: 18.73 },
    efficiencyPolynomial: { a: -3.85, b: 31.9, c: 0.0 },
    notes: 'Twin-rotor positive displacement pump designed for high-flow mobile field refueling (up to 85 L/min), construction equipment, and remote generator replenishment.',
  },
  {
    id: 'piusi_viscomat_70',
    manufacturer: 'Piusi',
    series: 'Viscomat Series',
    model: 'Viscomat 70 Internal Gear Heavy Transfer',
    type: 'Positive Displacement Gear',
    speedRpm: 1450,
    ratedFlowM3h: 1.5,
    ratedHeadM: 55.0,
    maxPressureBar: 7.0,
    curvePoints: [
      { q: 0, h: 65.0, efficiency: 0, npshr: 1.5 },
      { q: 0.5, h: 63.0, efficiency: 45, npshr: 1.7 },
      { q: 1.0, h: 59.5, efficiency: 62, npshr: 2.0 },
      { q: 1.5, h: 54.0, efficiency: 68, npshr: 2.4 },
      { q: 2.0, h: 44.0, efficiency: 58, npshr: 3.1 },
      { q: 2.4, h: 30.0, efficiency: 44, npshr: 3.9 },
    ],
    polynomial: { a: -7.148, b: 3.423, c: 64.16 },
    efficiencyPolynomial: { a: -31.19, b: 91.32, c: 2.5 },
    notes: 'High-pressure internal gear pump engineered for diesel fuel oils, high-viscosity biofuels (B100), and generator lubricating oil transfer loops.',
  },
];

/**
 * Evaluates Pump Head at given flow Q (m3/h) using polynomial H(Q) = a*Q^2 + b*Q + c
 */
export function evaluatePumpHead(pump: PumpModel, flowM3h: number): number {
  const { a, b, c } = pump.polynomial;
  const h = a * Math.pow(flowM3h, 2) + b * flowM3h + c;
  return Math.max(0, h);
}

/**
 * Evaluates Pump Efficiency at given flow Q (m3/h)
 */
export function evaluatePumpEfficiency(pump: PumpModel, flowM3h: number): number {
  if (flowM3h <= 0) return 0;
  if (pump.efficiencyPolynomial) {
    const { a, b, c } = pump.efficiencyPolynomial;
    const eff = a * Math.pow(flowM3h, 2) + b * flowM3h + c;
    return Math.min(88, Math.max(10, eff));
  }
  // Fallback to interpolation from points
  const points = pump.curvePoints.filter((p) => p.efficiency !== undefined);
  if (points.length < 2) return 65;
  if (flowM3h <= points[0].q) return points[0].efficiency || 50;
  if (flowM3h >= points[points.length - 1].q) return points[points.length - 1].efficiency || 50;

  for (let i = 0; i < points.length - 1; i++) {
    if (flowM3h >= points[i].q && flowM3h <= points[i + 1].q) {
      const frac = (flowM3h - points[i].q) / (points[i + 1].q - points[i].q);
      const e1 = points[i].efficiency || 60;
      const e2 = points[i + 1].efficiency || 60;
      return e1 + frac * (e2 - e1);
    }
  }
  return 65;
}

/**
 * Evaluates Pump NPSHr at given flow Q (m3/h)
 */
export function evaluatePumpNpshr(pump: PumpModel, flowM3h: number): number {
  const points = pump.curvePoints.filter((p) => p.npshr !== undefined);
  if (points.length === 0) return 2.5;
  if (flowM3h <= points[0].q) return points[0].npshr || 2.0;
  if (flowM3h >= points[points.length - 1].q) return points[points.length - 1].npshr || 3.5;

  for (let i = 0; i < points.length - 1; i++) {
    if (flowM3h >= points[i].q && flowM3h <= points[i + 1].q) {
      const frac = (flowM3h - points[i].q) / (points[i + 1].q - points[i].q);
      const n1 = points[i].npshr || 2.0;
      const n2 = points[i + 1].npshr || 3.0;
      return n1 + frac * (n2 - n1);
    }
  }
  return 2.5;
}

/**
 * System Resistance Curve Calculation:
 * H_sys(Q) = H_static + K_sys * Q^2
 * where K_sys = (H_friction_nominal + H_minor_nominal + H_terminal) / (Q_nominal^2)
 */
export function calculateSystemResistanceCoeff(
  nominalFlowM3h: number,
  totalDynamicHeadM: number,
  staticHeadM: number
): number {
  if (nominalFlowM3h <= 0) return 0.05;
  const dynamicLossM = Math.max(0.1, totalDynamicHeadM - staticHeadM);
  return dynamicLossM / Math.pow(nominalFlowM3h, 2);
}

/**
 * Finds the exact intersection Operating Point between the Pump Curve and System Curve
 * System: H = H_static + k_sys * Q^2
 * Pump:   H = a * Q^2 + b * Q + c
 * Equating: (k_sys - a) * Q^2 - b * Q + (H_static - c) = 0
 */
export function findPumpOperatingPoint(
  pump: PumpModel,
  staticHeadM: number,
  systemResistanceCoeff: number,
  targetFlowM3h: number
): {
  flowM3h: number;
  flowGpm: number;
  headM: number;
  headFt: number;
  efficiencyPct: number;
  powerKw: number;
  meetsDemand: boolean;
} {
  const { a, b, c } = pump.polynomial;
  // A_quad * Q^2 + B_quad * Q + C_quad = 0
  const A = systemResistanceCoeff - a;
  const B = -b;
  const C = staticHeadM - c;

  const discriminant = Math.pow(B, 2) - 4 * A * C;
  let qOp = targetFlowM3h;

  if (discriminant >= 0 && A !== 0) {
    const q1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    const q2 = (-B - Math.sqrt(discriminant)) / (2 * A);
    const validQ = [q1, q2].filter((q) => q > 0);
    if (validQ.length > 0) {
      qOp = validQ[0];
    }
  }

  // Calculate Head at this flow
  const headM = Math.max(0, staticHeadM + systemResistanceCoeff * Math.pow(qOp, 2));
  const efficiencyPct = evaluatePumpEfficiency(pump, qOp);
  // Power: P (kW) = (rho * g * Q_m3s * H) / (1000 * eff)
  // Assuming diesel rho = 845 kg/m3
  const flowM3s = qOp / 3600;
  const hydKw = (845 * 9.80665 * flowM3s * headM) / 1000;
  const powerKw = hydKw / (efficiencyPct / 100);

  const meetsDemand = qOp >= targetFlowM3h * 0.95;

  return {
    flowM3h: Number(qOp.toFixed(2)),
    flowGpm: Number((qOp * 4.40287).toFixed(1)),
    headM: Number(headM.toFixed(2)),
    headFt: Number((headM * 3.28084).toFixed(1)),
    efficiencyPct: Number(efficiencyPct.toFixed(1)),
    powerKw: Number(powerKw.toFixed(2)),
    meetsDemand,
  };
}

/**
 * Creates custom pump curve from arbitrary data points using quadratic regression
 */
export function fitQuadraticPumpCurve(points: { q: number; h: number }[]): {
  a: number;
  b: number;
  c: number;
} {
  if (points.length < 3) {
    // Default fallback curve
    return { a: -0.05, b: -0.01, c: 50 };
  }

  // Simple least-squares polynomial fit for y = a*x^2 + b*x + c
  const n = points.length;
  let sx = 0,
    sy = 0,
    sx2 = 0,
    sx3 = 0,
    sx4 = 0,
    sxy = 0,
    sx2y = 0;

  for (const pt of points) {
    const x = pt.q;
    const y = pt.h;
    const x2 = x * x;
    sx += x;
    sy += y;
    sx2 += x2;
    sx3 += x2 * x;
    sx4 += x2 * x2;
    sxy += x * y;
    sx2y += x2 * y;
  }

  // Solve 3x3 linear system via Gaussian elimination
  const m = [
    [sx4, sx3, sx2, sx2y],
    [sx3, sx2, sx, sxy],
    [sx2, sx, n, sy],
  ];

  for (let i = 0; i < 3; i++) {
    let pivot = m[i][i];
    if (Math.abs(pivot) < 1e-9) pivot = 1e-9;
    for (let j = 0; j <= 3; j++) m[i][j] /= pivot;
    for (let k = 0; k < 3; k++) {
      if (k !== i) {
        const factor = m[k][i];
        for (let j = 0; j <= 3; j++) m[k][j] -= factor * m[i][j];
      }
    }
  }

  return {
    a: Number(m[0][3].toFixed(5)),
    b: Number(m[1][3].toFixed(4)),
    c: Number(m[2][3].toFixed(2)),
  };
}
