/**
 * @license
 * ASME B31.3 Diesel Piping Sizing & Darcy-Weisbach Hydraulic Analysis Engine
 */

import { DieselProperties, FittingItem, HydraulicResults, PipeMaterial, PipeScheduleEntry } from '../types';
import { calculateAsmeB313Mawp, PIPE_MATERIALS, PIPE_SCHEDULE_DATABASE } from './materials';

export const G_ACCEL = 9.80665; // m/s^2 Standard gravity
export const ATMOSPHERIC_PRESSURE_KPA = 101.325; // standard sea level atm

/**
 * Standard Diesel Fuel Grades & Thermodynamic Properties
 * Density and Viscosity temperature coefficients per ASTM D1250 and Walther equation
 */
export function getDieselProperties(
  type: DieselProperties['type'] = 'Diesel #2 (ULSD)',
  tempC = 20
): DieselProperties {
  let refDensity15C = 845.0; // kg/m3 @ 15 C
  let refViscosity40C = 2.8; // cSt @ 40 C
  let baseVaporKPa = 0.5; // kPa @ 20 C

  switch (type) {
    case 'Diesel #2 (ULSD)':
      refDensity15C = 845.0;
      refViscosity40C = 2.8;
      baseVaporKPa = 0.5;
      break;
    case 'Diesel #1 (Kerosene/Arctic)':
      refDensity15C = 820.0;
      refViscosity40C = 1.9;
      baseVaporKPa = 1.2;
      break;
    case 'Biodiesel B20':
      refDensity15C = 855.0;
      refViscosity40C = 3.3;
      baseVaporKPa = 0.3;
      break;
    case 'Marine Gas Oil (MGO)':
      refDensity15C = 865.0;
      refViscosity40C = 4.2;
      baseVaporKPa = 0.2;
      break;
  }

  // ASTM D1250 thermal expansion correction (approx 0.00075 / deg C)
  const computedDensity = refDensity15C * (1 - 0.00075 * (tempC - 15));

  // ASTM D341 / Walther kinematic viscosity temperature relationship
  // nu = nu40 * exp(b * (1/T - 1/313.15))
  const tempK = Math.max(240, tempC + 273.15);
  const bVisc = 1950; // characteristic energy constant for middle distillates
  const computedViscosity = refViscosity40C * Math.exp(bVisc * (1 / tempK - 1 / 313.15));

  // Dynamic viscosity: mu (Pa.s) = nu (m2/s) * rho (kg/m3) = (cSt * 1e-6) * rho
  const dynamicViscosity = (computedViscosity * 1e-6) * computedDensity;

  // Antoine-style approximation for diesel vapor pressure vs temperature
  const vaporPressure = baseVaporKPa * Math.exp(0.045 * (tempC - 20));

  return {
    type,
    tempC,
    referenceDensityKgM3: refDensity15C,
    referenceViscosityCSt: refViscosity40C,
    computedDensityKgM3: Number(computedDensity.toFixed(2)),
    computedViscosityCSt: Number(computedViscosity.toFixed(3)),
    dynamicViscosityPaS: dynamicViscosity,
    vaporPressureKPa: Number(Math.max(0.1, vaporPressure).toFixed(3)),
  };
}

/**
 * Calculates flow velocity through circular pipe
 * @param flowRateM3h Flow rate in m3/h
 * @param idMm Internal diameter in mm
 * @returns Velocity in m/s
 */
export function calculateFlowVelocity(flowRateM3h: number, idMm: number): number {
  if (idMm <= 0 || flowRateM3h <= 0) return 0;
  const dMeters = idMm / 1000;
  const areaM2 = (Math.PI / 4) * Math.pow(dMeters, 2);
  const flowM3s = flowRateM3h / 3600;
  return flowM3s / areaM2;
}

/**
 * Calculates Reynolds number: Re = (v * D) / nu
 * @param velocityMps Flow velocity in m/s
 * @param idMm Internal diameter in mm
 * @param kinematicViscosityCSt Kinematic viscosity in cSt (mm2/s)
 * @returns Reynolds number (dimensionless)
 */
export function calculateReynoldsNumber(
  velocityMps: number,
  idMm: number,
  kinematicViscosityCSt: number
): number {
  if (velocityMps <= 0 || idMm <= 0 || kinematicViscosityCSt <= 0) return 0;
  // kinematicViscosityCSt in mm2/s, v in m/s, d in mm -> (v * 1000 mm/s * d mm) / (nu mm2/s)
  const re = (velocityMps * 1000 * idMm) / kinematicViscosityCSt;
  return Number(re.toFixed(1));
}

/**
 * High-Precision Darcy Friction Factor using Colebrook-White Equation
 * Uses Swamee-Jain explicit seed followed by Newton-Raphson iteration.
 * Handles Laminar (Re <= 2300), Critical/Transition (2300 < Re < 4000), and Turbulent (Re >= 4000).
 *
 * @param reynolds Reynolds number
 * @param roughnessMm Absolute pipe roughness in mm
 * @param idMm Internal pipe diameter in mm
 * @returns Darcy friction factor f
 */
export function calculateDarcyFrictionFactor(
  reynolds: number,
  roughnessMm: number,
  idMm: number
): number {
  if (reynolds <= 0 || idMm <= 0) return 0.02;

  // 1. Laminar Flow
  if (reynolds <= 2300) {
    return Math.min(1.0, 64 / reynolds);
  }

  const relRoughness = roughnessMm / idMm;

  // Helper for turbulent Colebrook-White at specific Re
  const solveTurbulentColebrook = (Re: number, eOverD: number): number => {
    // Initial guess using Swamee-Jain formula
    const sjTerm = Math.log10(eOverD / 3.7 + 5.74 / Math.pow(Re, 0.9));
    let f = 0.25 / Math.pow(sjTerm, 2);

    // Newton-Raphson refinement: F(x) = x + 2*log10(e/(3.7*D) + 2.51*x/Re) = 0 where x = 1/sqrt(f)
    for (let i = 0; i < 5; i++) {
      const invSqrtF = 1 / Math.sqrt(f);
      const arg = eOverD / 3.7 + (2.51 * invSqrtF) / Re;
      if (arg <= 0) break;
      const g = invSqrtF + 2 * Math.log10(arg);
      // Derivative with respect to invSqrtF
      const dg = 1 + (2 / Math.LN10) * (2.51 / Re) / arg;
      const delta = g / dg;
      const newInvSqrtF = invSqrtF - delta;
      if (newInvSqrtF <= 0) break;
      f = 1 / Math.pow(newInvSqrtF, 2);
      if (Math.abs(delta) < 1e-6) break;
    }
    return f;
  };

  // 2. Fully Turbulent Flow
  if (reynolds >= 4000) {
    return solveTurbulentColebrook(reynolds, relRoughness);
  }

  // 3. Transition Zone (2300 < Re < 4000)
  // Cubic interpolation between laminar at 2300 and turbulent at 4000
  const fLam2300 = 64 / 2300; // ~0.0278
  const fTurb4000 = solveTurbulentColebrook(4000, relRoughness);
  const t = (reynolds - 2300) / (4000 - 2300);
  // Smoothstep interpolation
  const smoothT = t * t * (3 - 2 * t);
  return fLam2300 + smoothT * (fTurb4000 - fLam2300);
}

/**
 * Darcy-Weisbach Major Pipe Head Loss: h_f = f * (L / D) * (v^2 / (2*g))
 * @param frictionFactor Darcy friction factor
 * @param lengthM Pipe length in meters
 * @param idMm Pipe inside diameter in mm
 * @param velocityMps Velocity in m/s
 * @returns Head loss in meters of liquid column
 */
export function calculateDarcyHeadLoss(
  frictionFactor: number,
  lengthM: number,
  idMm: number,
  velocityMps: number
): number {
  if (lengthM <= 0 || idMm <= 0 || velocityMps <= 0) return 0;
  const dM = idMm / 1000;
  const hf = frictionFactor * (lengthM / dM) * (Math.pow(velocityMps, 2) / (2 * G_ACCEL));
  return Number(hf.toFixed(4));
}

/**
 * Minor Head Loss from Valves and Fittings: h_m = sum(K) * (v^2 / (2*g))
 * @param kTotal Sum of loss coefficients K
 * @param velocityMps Velocity in m/s
 * @returns Minor head loss in meters
 */
export function calculateMinorHeadLoss(kTotal: number, velocityMps: number): number {
  if (kTotal <= 0 || velocityMps <= 0) return 0;
  const hm = kTotal * (Math.pow(velocityMps, 2) / (2 * G_ACCEL));
  return Number(hm.toFixed(4));
}

/**
 * Sizing helper: Finds internal diameter for a given NPS and Schedule in our database
 */
export function getPipeIdFromSchedule(nps: string, schedule: string): number {
  const pipe = PIPE_SCHEDULE_DATABASE.find((p) => p.nps === nps);
  if (!pipe) return 52.48; // default 2" Sch 40
  const sched = pipe.schedules.find((s) => s.schedule === schedule) || pipe.schedules[0];
  return sched.idMm;
}

export function getPipeOdFromNps(nps: string): number {
  const pipe = PIPE_SCHEDULE_DATABASE.find((p) => p.nps === nps);
  return pipe ? pipe.odMm : 60.3;
}

export function getPipeWallThk(nps: string, schedule: string): number {
  const pipe = PIPE_SCHEDULE_DATABASE.find((p) => p.nps === nps);
  if (!pipe) return 3.91;
  const sched = pipe.schedules.find((s) => s.schedule === schedule) || pipe.schedules[0];
  return sched.wallThkMm;
}

/**
 * Automatically recommends the optimal pipe diameter according to ASME B31.3 & API RP 2003
 * Target suction: 0.8 - 1.1 m/s (2.5 - 3.5 ft/s)
 * Target discharge: 1.4 - 2.1 m/s (4.5 - 7.0 ft/s)
 */
export function recommendOptimalNps(
  flowRateM3h: number,
  lineType: 'suction' | 'discharge'
): { nps: string; schedule: string; velocity: number } {
  const targetVelocity = lineType === 'suction' ? 1.0 : 1.8;
  let bestNps = '2';
  let bestSchedule = '40';
  let minDiff = 999;
  let bestVel = 1.0;

  for (const pipe of PIPE_SCHEDULE_DATABASE) {
    const sched = pipe.schedules.find((s) => s.schedule === '40') || pipe.schedules[0];
    const vel = calculateFlowVelocity(flowRateM3h, sched.idMm);
    const diff = Math.abs(vel - targetVelocity);
    if (diff < minDiff) {
      minDiff = diff;
      bestNps = pipe.nps;
      bestSchedule = sched.schedule;
      bestVel = vel;
    }
  }

  return { nps: bestNps, schedule: bestSchedule, velocity: Number(bestVel.toFixed(2)) };
}

/**
 * Comprehensive System Hydraulics Calculation
 */
export function calculateSystemHydraulics(params: {
  flowRateM3h: number;
  suctionNps: string;
  suctionSchedule: string;
  suctionLengthM: number;
  suctionMaterial: PipeMaterial;
  suctionElevDeltaM: number; // Positive if pump is above liquid level (suction lift)

  dischargeNps: string;
  dischargeSchedule: string;
  dischargeLengthM: number;
  dischargeMaterial: PipeMaterial;
  dischargeElevDeltaM: number; // Destination elevation - pump elevation
  terminalPressureBar?: number; // backpressure at daytank/nozzle

  fittings: FittingItem[];
  dieselType?: DieselProperties['type'];
  dieselTempC?: number;
  pumpEfficiencyPct?: number;
  pumpNpshrM?: number;
}): HydraulicResults {
  const {
    flowRateM3h,
    suctionNps,
    suctionSchedule,
    suctionLengthM,
    suctionMaterial,
    suctionElevDeltaM,
    dischargeNps,
    dischargeSchedule,
    dischargeLengthM,
    dischargeMaterial,
    dischargeElevDeltaM,
    terminalPressureBar = 0,
    fittings,
    dieselType = 'Diesel #2 (ULSD)',
    dieselTempC = 20,
    pumpEfficiencyPct = 65,
    pumpNpshrM = 2.5,
  } = params;

  // 1. Fluid properties
  const fluid = getDieselProperties(dieselType, dieselTempC);
  const flowRateGpm = flowRateM3h * 4.40287; // 1 m3/h = 4.40287 US GPM

  // 2. Suction line sizing & losses
  const suctionIdMm = getPipeIdFromSchedule(suctionNps, suctionSchedule);
  const suctionOdMm = getPipeOdFromNps(suctionNps);
  const suctionWallThk = getPipeWallThk(suctionNps, suctionSchedule);
  const suctionVelocity = calculateFlowVelocity(flowRateM3h, suctionIdMm);
  const suctionReynolds = calculateReynoldsNumber(suctionVelocity, suctionIdMm, fluid.computedViscosityCSt);
  const suctionRegime: HydraulicResults['suctionRegime'] =
    suctionReynolds <= 2300 ? 'Laminar' : suctionReynolds >= 4000 ? 'Turbulent' : 'Transition';

  const suctionFrictionFactor = calculateDarcyFrictionFactor(
    suctionReynolds,
    suctionMaterial.absoluteRoughnessMm,
    suctionIdMm
  );
  const suctionPipeLoss = calculateDarcyHeadLoss(suctionFrictionFactor, suctionLengthM, suctionIdMm, suctionVelocity);

  // Fittings on suction side
  const suctionKTotal = fittings
    .filter((f) => f.location === 'suction')
    .reduce((sum, f) => sum + f.kValue * f.count, 0);
  const suctionFittingsLoss = calculateMinorHeadLoss(suctionKTotal, suctionVelocity);
  const suctionTotalHeadLoss = suctionPipeLoss + suctionFittingsLoss;

  // Delta P in kPa = rho * g * h / 1000
  const suctionPressureDropKpa = (fluid.computedDensityKgM3 * G_ACCEL * suctionTotalHeadLoss) / 1000;

  // 3. Discharge line sizing & losses
  const dischargeIdMm = getPipeIdFromSchedule(dischargeNps, dischargeSchedule);
  const dischargeOdMm = getPipeOdFromNps(dischargeNps);
  const dischargeWallThk = getPipeWallThk(dischargeNps, dischargeSchedule);
  const dischargeVelocity = calculateFlowVelocity(flowRateM3h, dischargeIdMm);
  const dischargeReynolds = calculateReynoldsNumber(dischargeVelocity, dischargeIdMm, fluid.computedViscosityCSt);
  const dischargeRegime: HydraulicResults['dischargeRegime'] =
    dischargeReynolds <= 2300 ? 'Laminar' : dischargeReynolds >= 4000 ? 'Turbulent' : 'Transition';

  const dischargeFrictionFactor = calculateDarcyFrictionFactor(
    dischargeReynolds,
    dischargeMaterial.absoluteRoughnessMm,
    dischargeIdMm
  );
  const dischargePipeLoss = calculateDarcyHeadLoss(
    dischargeFrictionFactor,
    dischargeLengthM,
    dischargeIdMm,
    dischargeVelocity
  );

  // Fittings on discharge side
  const dischargeKTotal = fittings
    .filter((f) => f.location === 'discharge')
    .reduce((sum, f) => sum + f.kValue * f.count, 0);
  const dischargeFittingsLoss = calculateMinorHeadLoss(dischargeKTotal, dischargeVelocity);
  const dischargeTotalHeadLoss = dischargePipeLoss + dischargeFittingsLoss;
  const dischargePressureDropKpa = (fluid.computedDensityKgM3 * G_ACCEL * dischargeTotalHeadLoss) / 1000;

  // 4. System Total Dynamic Head (TDH)
  // Static Head: net change in liquid elevation (from suction liquid surface to discharge tank surface)
  const netStaticHeadM = suctionElevDeltaM + dischargeElevDeltaM;
  const totalFrictionHeadLossM = suctionPipeLoss + dischargePipeLoss;
  const totalMinorHeadLossM = suctionFittingsLoss + dischargeFittingsLoss;

  // Terminal backpressure head: P (bar) = 1e5 Pa -> h = P / (rho * g)
  const terminalPressureHeadM = (terminalPressureBar * 100000) / (fluid.computedDensityKgM3 * G_ACCEL);

  const totalDynamicHeadM = netStaticHeadM + totalFrictionHeadLossM + totalMinorHeadLossM + terminalPressureHeadM;
  const totalDynamicHeadKPa = (fluid.computedDensityKgM3 * G_ACCEL * totalDynamicHeadM) / 1000;
  const totalDynamicHeadPsi = totalDynamicHeadKPa * 0.145038;

  // 5. Net Positive Suction Head Available (NPSHa)
  // NPSHa = (P_atm - P_vp) / (rho * g) - Z_suction_lift - h_suction_losses
  // Note: if suctionElevDeltaM > 0, pump is above tank (suction lift = - Z); if < 0, flooded suction (+ Z)
  const atmHeadM = (ATMOSPHERIC_PRESSURE_KPA * 1000) / (fluid.computedDensityKgM3 * G_ACCEL);
  const vpHeadM = (fluid.vaporPressureKPa * 1000) / (fluid.computedDensityKgM3 * G_ACCEL);
  const npshaM = atmHeadM - vpHeadM - suctionElevDeltaM - suctionTotalHeadLoss;
  const npshMarginM = npshaM - pumpNpshrM;
  const npshStatus: HydraulicResults['npshStatus'] =
    npshMarginM >= 0.8 ? 'PASS' : npshMarginM >= 0 ? 'WARNING' : 'FAIL';

  // 6. Hydraulic Power and Motor Sizing
  // P_hyd (kW) = (rho * g * Q_m3s * H) / 1000 = (rho * g * (Q_m3h/3600) * H) / 1000
  const flowM3s = flowRateM3h / 3600;
  const hydraulicPowerKw = (fluid.computedDensityKgM3 * G_ACCEL * flowM3s * Math.max(0, totalDynamicHeadM)) / 1000;
  const pumpEffDecimal = Math.max(0.1, pumpEfficiencyPct / 100);
  const brakeHorsepowerKw = hydraulicPowerKw / pumpEffDecimal;
  const brakeHorsepowerHp = brakeHorsepowerKw * 1.34102;

  // Standard IEC / NEMA electric motor rating with 15% safety factor
  const motorWithMarginKw = brakeHorsepowerKw * 1.2;
  const standardMotorRatingsKw = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3.0, 4.0, 5.5, 7.5, 11.0, 15.0, 18.5, 22.0, 30.0, 37.0, 45.0, 55.0, 75.0];
  const recommendedMotorKw = standardMotorRatingsKw.find((kw) => kw >= motorWithMarginKw) || Math.ceil(motorWithMarginKw);
  const recommendedMotorHp = Number((recommendedMotorKw * 1.34102).toFixed(1));

  // 7. ASME B31.3 MAWP and Velocity Compliance Checks
  const suctionMawpBar = calculateAsmeB313Mawp(suctionMaterial, suctionOdMm, suctionWallThk);
  const dischargeMawpBar = calculateAsmeB313Mawp(dischargeMaterial, dischargeOdMm, dischargeWallThk);

  // Velocity Limits per ASME B31.3 / API RP 2003 / EI 1540
  // Suction: recommended 0.6 - 1.2 m/s; max 1.5 m/s
  // Discharge: recommended 1.2 - 2.5 m/s; max 2.5 m/s for clean diesel static limit
  const suctionVelocityValid = suctionVelocity >= 0.4 && suctionVelocity <= 1.5;
  const dischargeVelocityValid = dischargeVelocity >= 0.8 && dischargeVelocity <= 2.5;
  const dischargePressureBar = (dischargePressureDropKpa + (fluid.computedDensityKgM3 * G_ACCEL * dischargeElevDeltaM) / 1000) / 100 + terminalPressureBar;
  const pressureValid = dischargePressureBar <= dischargeMawpBar;
  const npshValid = npshStatus !== 'FAIL';

  const messages: HydraulicResults['asmeCompliance']['messages'] = [];

  // Suction Velocity message
  if (suctionVelocity < 0.5) {
    messages.push({
      type: 'warning',
      code: 'ASME_B31.3_V_SUCT_LOW',
      message: `Suction velocity ${suctionVelocity.toFixed(2)} m/s is below optimal 0.6-1.2 m/s. May allow sediment settling in diesel line.`,
    });
  } else if (suctionVelocity > 1.5) {
    messages.push({
      type: 'error',
      code: 'ASME_B31.3_V_SUCT_HIGH',
      message: `Suction velocity ${suctionVelocity.toFixed(2)} m/s exceeds ASME B31.3 recommendation (1.5 m/s max). High risk of pump cavitation and friction loss.`,
    });
  } else {
    messages.push({
      type: 'success',
      code: 'ASME_B31.3_V_SUCT_OK',
      message: `Suction velocity ${suctionVelocity.toFixed(2)} m/s satisfies ASME B31.3 / Hydraulic Institute standards (0.6 - 1.2 m/s).`,
    });
  }

  // Discharge Velocity message (API RP 2003 Electrostatic charge prevention)
  if (dischargeVelocity > 2.5) {
    messages.push({
      type: 'error',
      code: 'API_RP_2003_STATIC_HAZARD',
      message: `Discharge velocity ${dischargeVelocity.toFixed(2)} m/s exceeds API RP 2003 / EI 1540 max safe diesel velocity (2.5 m/s). Dangerous electrostatic ignition hazard!`,
    });
  } else if (dischargeVelocity > 2.2) {
    messages.push({
      type: 'warning',
      code: 'ASME_B31.3_V_DISCH_HIGH',
      message: `Discharge velocity ${dischargeVelocity.toFixed(2)} m/s is near upper safety threshold (2.5 m/s). Consider upsizing pipe.`,
    });
  } else {
    messages.push({
      type: 'success',
      code: 'ASME_B31.3_V_DISCH_OK',
      message: `Discharge velocity ${dischargeVelocity.toFixed(2)} m/s complies with ASME B31.3 and API RP 2003 electrostatic limits (< 2.5 m/s).`,
    });
  }

  // NPSH Check
  if (npshStatus === 'FAIL') {
    messages.push({
      type: 'error',
      code: 'HI_NPSH_DEFICIT',
      message: `NPSHa (${npshaM.toFixed(2)} m) is below NPSHr (${pumpNpshrM.toFixed(2)} m)! Severe cavitation will damage pump impellers and starve generator.`,
    });
  } else if (npshStatus === 'WARNING') {
    messages.push({
      type: 'warning',
      code: 'HI_NPSH_MARGIN_LOW',
      message: `NPSH margin (${npshMarginM.toFixed(2)} m) is under the 0.8 m safety margin recommended by Hydraulic Institute / API 610.`,
    });
  } else {
    messages.push({
      type: 'success',
      code: 'HI_NPSH_SAFE',
      message: `NPSH margin is robust at +${npshMarginM.toFixed(2)} m over NPSHr (NPSHa = ${npshaM.toFixed(2)} m). Zero cavitation risk.`,
    });
  }

  // Pressure containment check
  if (dischargePressureBar > dischargeMawpBar) {
    messages.push({
      type: 'error',
      code: 'ASME_B31.3_MAWP_EXCEEDED',
      message: `Operating pressure ${dischargePressureBar.toFixed(1)} bar exceeds pipe MAWP (${dischargeMawpBar} bar) under ASME B31.3 Section 304.1.2!`,
    });
  } else {
    messages.push({
      type: 'success',
      code: 'ASME_B31.3_MAWP_COMPLIANT',
      message: `Discharge MAWP (${dischargeMawpBar} bar) provides ample safety factor over operating pressure (${dischargePressureBar.toFixed(1)} bar).`,
    });
  }

  const overallStatus =
    messages.some((m) => m.type === 'error')
      ? 'NON-COMPLIANT'
      : messages.some((m) => m.type === 'warning')
      ? 'WARNING'
      : 'COMPLIANT';

  return {
    fluid,
    flowRateM3h,
    flowRateGpm: Number(flowRateGpm.toFixed(1)),

    suctionNps,
    suctionSchedule,
    suctionIdMm,
    suctionVelocityMps: Number(suctionVelocity.toFixed(2)),
    suctionReynolds,
    suctionRegime,
    suctionFrictionFactor: Number(suctionFrictionFactor.toFixed(4)),
    suctionPipeHeadLossM: Number(suctionPipeLoss.toFixed(3)),
    suctionFittingsHeadLossM: Number(suctionFittingsLoss.toFixed(3)),
    suctionTotalHeadLossM: Number(suctionTotalHeadLoss.toFixed(3)),
    suctionPressureDropKpa: Number(suctionPressureDropKpa.toFixed(2)),

    dischargeNps,
    dischargeSchedule,
    dischargeIdMm,
    dischargeVelocityMps: Number(dischargeVelocity.toFixed(2)),
    dischargeReynolds,
    dischargeRegime,
    dischargeFrictionFactor: Number(dischargeFrictionFactor.toFixed(4)),
    dischargePipeHeadLossM: Number(dischargePipeLoss.toFixed(3)),
    dischargeFittingsHeadLossM: Number(dischargeFittingsLoss.toFixed(3)),
    dischargeTotalHeadLossM: Number(dischargeTotalHeadLoss.toFixed(3)),
    dischargePressureDropKpa: Number(dischargePressureDropKpa.toFixed(2)),

    staticHeadM: Number(netStaticHeadM.toFixed(2)),
    totalFrictionHeadLossM: Number(totalFrictionHeadLossM.toFixed(3)),
    totalMinorHeadLossM: Number(totalMinorHeadLossM.toFixed(3)),
    terminalPressureHeadM: Number(terminalPressureHeadM.toFixed(2)),
    totalDynamicHeadM: Number(totalDynamicHeadM.toFixed(2)),
    totalDynamicHeadKPa: Number(totalDynamicHeadKPa.toFixed(1)),
    totalDynamicHeadPsi: Number(totalDynamicHeadPsi.toFixed(1)),

    atmosphericPressureKPa: ATMOSPHERIC_PRESSURE_KPA,
    vaporPressureKPa: fluid.vaporPressureKPa,
    npshaM: Number(npshaM.toFixed(2)),
    npshrM: Number(pumpNpshrM.toFixed(2)),
    npshMarginM: Number(npshMarginM.toFixed(2)),
    npshStatus,

    hydraulicPowerKw: Number(hydraulicPowerKw.toFixed(2)),
    pumpEfficiencyPct,
    brakeHorsepowerKw: Number(brakeHorsepowerKw.toFixed(2)),
    brakeHorsepowerHp: Number(brakeHorsepowerHp.toFixed(2)),
    recommendedMotorKw,
    recommendedMotorHp,

    suctionMawpBar,
    dischargeMawpBar,
    asmeCompliance: {
      status: overallStatus,
      suctionVelocityValid,
      dischargeVelocityValid,
      pressureValid,
      npshValid,
      messages,
    },
  };
}
