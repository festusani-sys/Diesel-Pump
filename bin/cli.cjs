#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli/index.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var import_http = __toESM(require("http"), 1);

// src/utils/materials.ts
var PIPE_MATERIALS = [
  {
    id: "cs_a106_b",
    name: "Carbon Steel ASTM A106 Gr. B",
    standard: "ASME B31.3 / ASTM A106 Seamless",
    absoluteRoughnessMm: 0.045,
    // Commercial steel per Crane TP 410
    maxTempC: 427,
    minTempC: -29,
    allowableStressMpa: 137.9,
    // 20.0 ksi @ -29 to 200 F per ASME B31.3 Table A-1
    jointQualityFactorE: 1,
    // Seamless pipe
    coefficientY: 0.4,
    // ASME Table 304.1.1 for ferritic steels < 482 C
    corrosionAllowanceMm: 1.5,
    // Standard fuel hydrocarbon allowance
    colorHex: "#374151",
    // Dark Charcoal Slate
    category: "Metallic",
    description: "Premier seamless carbon steel for fuel oil, diesel, and hydrocarbon process piping under ASME B31.3."
  },
  {
    id: "cs_a53_b",
    name: "Carbon Steel ASTM A53 Gr. B (ERW)",
    standard: "ASME B31.3 / ASTM A53 Electric Resistance Welded",
    absoluteRoughnessMm: 0.045,
    maxTempC: 400,
    minTempC: -29,
    allowableStressMpa: 117.2,
    // 17.0 ksi (E=0.85 factored)
    jointQualityFactorE: 0.85,
    // ERW weld factor
    coefficientY: 0.4,
    corrosionAllowanceMm: 1.5,
    colorHex: "#4b5563",
    // Slate Gray
    category: "Metallic",
    description: "Electric resistance welded carbon steel for general industrial diesel transfer lines."
  },
  {
    id: "ss_304",
    name: "Stainless Steel 304/304L (ASTM A312)",
    standard: "ASME B31.3 / ASTM A312 TP304",
    absoluteRoughnessMm: 0.015,
    // Drawn stainless steel tubing/pipe
    maxTempC: 538,
    minTempC: -196,
    allowableStressMpa: 115.1,
    // 16.7 ksi @ 40 C
    jointQualityFactorE: 1,
    // Seamless
    coefficientY: 0.4,
    corrosionAllowanceMm: 0,
    // Corrosion resistant to ultra-low sulfur diesel
    colorHex: "#94a3b8",
    // Silver Stainless
    category: "Metallic",
    description: "Austenitic stainless steel with high corrosion resistance, zero fuel varnish/sediment degradation."
  },
  {
    id: "ss_316",
    name: "Stainless Steel 316/316L (ASTM A312)",
    standard: "ASME B31.3 / ASTM A312 TP316 Marine Grade",
    absoluteRoughnessMm: 0.015,
    maxTempC: 550,
    minTempC: -196,
    allowableStressMpa: 115.1,
    jointQualityFactorE: 1,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0,
    colorHex: "#cbd5e1",
    // Polished Marine Silver
    category: "Metallic",
    description: "Molybdenum-alloyed austenitic stainless steel for coastal, marine, and offshore diesel generator installations."
  },
  {
    id: "hdpe_pe100",
    name: "HDPE PE100 (DIN 8074 / ASTM F714 SDR 11)",
    standard: "ISO 4427 / ASTM F714 Polyethylene SDR 11",
    absoluteRoughnessMm: 7e-3,
    // Ultra-smooth thermoplastic
    maxTempC: 60,
    minTempC: -40,
    allowableStressMpa: 8,
    // 8.0 MPa Hydrostatic Design Basis with hydrocarbon derating
    jointQualityFactorE: 1,
    // Butt fused joint
    coefficientY: 0.4,
    corrosionAllowanceMm: 0,
    colorHex: "#1e3a8a",
    // High-Vis Poly Blue/Black
    category: "Non-Metallic",
    description: "Corrosion-proof thermoplastic for buried underground storage tank (UST) suction and return headers."
  },
  {
    id: "copper_type_k",
    name: "Copper Tube Type K (ASTM B88 Heavy Wall)",
    standard: "ASTM B88 / ASME B31.3 Seamless Copper",
    absoluteRoughnessMm: 15e-4,
    // Extremely smooth drawn copper
    maxTempC: 204,
    minTempC: -196,
    allowableStressMpa: 41.4,
    // 6.0 ksi annealed
    jointQualityFactorE: 1,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0,
    colorHex: "#b45309",
    // Burnished Amber Copper
    category: "Metallic",
    description: "Heavy-gauge seamless drawn copper tube for indoor day-tank and emergency diesel generator fuel supply lines."
  },
  {
    id: "copper_type_l",
    name: "Copper Tube Type L (ASTM B88 Medium Wall)",
    standard: "ASTM B88 / ASME B31.3 Seamless Copper",
    absoluteRoughnessMm: 15e-4,
    maxTempC: 204,
    minTempC: -196,
    allowableStressMpa: 41.4,
    jointQualityFactorE: 1,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0,
    colorHex: "#d97706",
    // Copper Bronze
    category: "Metallic",
    description: "Medium-wall seamless copper for low-pressure diesel burner and instrument feed loops."
  },
  {
    id: "ductile_iron",
    name: "Ductile Iron Class 52 (AWWA C151)",
    standard: "AWWA C151 / EN 545 Epoxy Lined",
    absoluteRoughnessMm: 0.03,
    // Epoxy lined interior
    maxTempC: 150,
    minTempC: -20,
    allowableStressMpa: 110,
    jointQualityFactorE: 0.8,
    coefficientY: 0.4,
    corrosionAllowanceMm: 1,
    colorHex: "#475569",
    // Iron Slate
    category: "Metallic",
    description: "Rugged ductile iron with interior fuel-grade epoxy lining for underground heavy industrial diesel mains."
  },
  {
    id: "galv_steel",
    name: "Galvanized Steel ASTM A53",
    standard: "ASTM A53 Schedule 40 Hot-Dip Galvanized",
    absoluteRoughnessMm: 0.15,
    // Zinc hot-dip rougher surface
    maxTempC: 200,
    minTempC: -29,
    allowableStressMpa: 117.2,
    jointQualityFactorE: 0.85,
    coefficientY: 0.4,
    corrosionAllowanceMm: 0.5,
    colorHex: "#64748b",
    // Zinc Zinc Gray
    category: "Metallic",
    description: "Zinc-coated steel for atmospheric outdoor diesel piping (Note: Check zinc reactivity with high-sulfur fuel)."
  }
];
var PIPE_SCHEDULE_DATABASE = [
  {
    nps: "1/2",
    dn: 15,
    odMm: 21.3,
    schedules: [
      { schedule: "10", wallThkMm: 2.11, idMm: 17.08 },
      { schedule: "40", wallThkMm: 2.77, idMm: 15.76 },
      { schedule: "80", wallThkMm: 3.73, idMm: 13.84 },
      { schedule: "160", wallThkMm: 4.78, idMm: 11.74 }
    ]
  },
  {
    nps: "3/4",
    dn: 20,
    odMm: 26.7,
    schedules: [
      { schedule: "10", wallThkMm: 2.11, idMm: 22.48 },
      { schedule: "40", wallThkMm: 2.87, idMm: 20.96 },
      { schedule: "80", wallThkMm: 3.91, idMm: 18.88 },
      { schedule: "160", wallThkMm: 5.56, idMm: 15.58 }
    ]
  },
  {
    nps: "1",
    dn: 25,
    odMm: 33.4,
    schedules: [
      { schedule: "10", wallThkMm: 2.77, idMm: 27.86 },
      { schedule: "40", wallThkMm: 3.38, idMm: 26.64 },
      { schedule: "80", wallThkMm: 4.55, idMm: 24.3 },
      { schedule: "160", wallThkMm: 6.35, idMm: 20.7 }
    ]
  },
  {
    nps: "1-1/4",
    dn: 32,
    odMm: 42.2,
    schedules: [
      { schedule: "10", wallThkMm: 2.77, idMm: 36.66 },
      { schedule: "40", wallThkMm: 3.56, idMm: 35.08 },
      { schedule: "80", wallThkMm: 4.85, idMm: 32.5 },
      { schedule: "160", wallThkMm: 6.35, idMm: 29.5 }
    ]
  },
  {
    nps: "1-1/2",
    dn: 40,
    odMm: 48.3,
    schedules: [
      { schedule: "10", wallThkMm: 2.77, idMm: 42.76 },
      { schedule: "40", wallThkMm: 3.68, idMm: 40.94 },
      { schedule: "80", wallThkMm: 5.08, idMm: 38.14 },
      { schedule: "160", wallThkMm: 7.14, idMm: 34.02 }
    ]
  },
  {
    nps: "2",
    dn: 50,
    odMm: 60.3,
    schedules: [
      { schedule: "10", wallThkMm: 2.77, idMm: 54.76 },
      { schedule: "40", wallThkMm: 3.91, idMm: 52.48 },
      { schedule: "80", wallThkMm: 5.54, idMm: 49.22 },
      { schedule: "160", wallThkMm: 8.74, idMm: 42.82 }
    ]
  },
  {
    nps: "2-1/2",
    dn: 65,
    odMm: 73,
    schedules: [
      { schedule: "10", wallThkMm: 3.05, idMm: 66.9 },
      { schedule: "40", wallThkMm: 5.16, idMm: 62.68 },
      { schedule: "80", wallThkMm: 7.01, idMm: 58.98 },
      { schedule: "160", wallThkMm: 9.53, idMm: 53.94 }
    ]
  },
  {
    nps: "3",
    dn: 80,
    odMm: 88.9,
    schedules: [
      { schedule: "10", wallThkMm: 3.05, idMm: 82.8 },
      { schedule: "40", wallThkMm: 5.49, idMm: 77.92 },
      { schedule: "80", wallThkMm: 7.62, idMm: 73.66 },
      { schedule: "160", wallThkMm: 11.13, idMm: 66.64 }
    ]
  },
  {
    nps: "4",
    dn: 100,
    odMm: 114.3,
    schedules: [
      { schedule: "10", wallThkMm: 3.05, idMm: 108.2 },
      { schedule: "40", wallThkMm: 6.02, idMm: 102.26 },
      { schedule: "80", wallThkMm: 8.56, idMm: 97.18 },
      { schedule: "160", wallThkMm: 13.49, idMm: 87.32 }
    ]
  },
  {
    nps: "6",
    dn: 150,
    odMm: 168.3,
    schedules: [
      { schedule: "10", wallThkMm: 3.4, idMm: 161.5 },
      { schedule: "40", wallThkMm: 7.11, idMm: 154.08 },
      { schedule: "80", wallThkMm: 10.97, idMm: 146.36 },
      { schedule: "160", wallThkMm: 18.26, idMm: 131.78 }
    ]
  },
  {
    nps: "8",
    dn: 200,
    odMm: 219.1,
    schedules: [
      { schedule: "10", wallThkMm: 3.76, idMm: 211.58 },
      { schedule: "40", wallThkMm: 8.18, idMm: 202.74 },
      { schedule: "80", wallThkMm: 12.7, idMm: 193.7 },
      { schedule: "160", wallThkMm: 23.01, idMm: 173.08 }
    ]
  },
  {
    nps: "10",
    dn: 250,
    odMm: 273,
    schedules: [
      { schedule: "10", wallThkMm: 4.19, idMm: 264.62 },
      { schedule: "40", wallThkMm: 9.27, idMm: 254.46 },
      { schedule: "80", wallThkMm: 15.09, idMm: 242.82 },
      { schedule: "160", wallThkMm: 28.58, idMm: 215.84 }
    ]
  },
  {
    nps: "12",
    dn: 300,
    odMm: 323.8,
    schedules: [
      { schedule: "10", wallThkMm: 4.57, idMm: 314.66 },
      { schedule: "40", wallThkMm: 10.31, idMm: 303.18 },
      { schedule: "80", wallThkMm: 17.48, idMm: 288.84 },
      { schedule: "160", wallThkMm: 33.32, idMm: 257.16 }
    ]
  }
];
function calculateAsmeB313Mawp(material, odMm, wallThkMm) {
  const S = material.allowableStressMpa;
  const E = material.jointQualityFactorE;
  const Y = material.coefficientY;
  const c = material.corrosionAllowanceMm;
  const tEff = Math.max(0.1, wallThkMm - c);
  if (odMm <= 2 * Y * tEff) {
    return 0;
  }
  const pMpa = 2 * S * E * tEff / (odMm - 2 * Y * tEff);
  const pBar = Math.max(0, pMpa * 10);
  return Number(pBar.toFixed(1));
}

// src/utils/hydraulics.ts
var G_ACCEL = 9.80665;
var ATMOSPHERIC_PRESSURE_KPA = 101.325;
function getDieselProperties(type = "Diesel #2 (ULSD)", tempC = 20) {
  let refDensity15C = 845;
  let refViscosity40C = 2.8;
  let baseVaporKPa = 0.5;
  switch (type) {
    case "Diesel #2 (ULSD)":
      refDensity15C = 845;
      refViscosity40C = 2.8;
      baseVaporKPa = 0.5;
      break;
    case "Diesel #1 (Kerosene/Arctic)":
      refDensity15C = 820;
      refViscosity40C = 1.9;
      baseVaporKPa = 1.2;
      break;
    case "Biodiesel B20":
      refDensity15C = 855;
      refViscosity40C = 3.3;
      baseVaporKPa = 0.3;
      break;
    case "Marine Gas Oil (MGO)":
      refDensity15C = 865;
      refViscosity40C = 4.2;
      baseVaporKPa = 0.2;
      break;
  }
  const computedDensity = refDensity15C * (1 - 75e-5 * (tempC - 15));
  const tempK = Math.max(240, tempC + 273.15);
  const bVisc = 1950;
  const computedViscosity = refViscosity40C * Math.exp(bVisc * (1 / tempK - 1 / 313.15));
  const dynamicViscosity = computedViscosity * 1e-6 * computedDensity;
  const vaporPressure = baseVaporKPa * Math.exp(0.045 * (tempC - 20));
  return {
    type,
    tempC,
    referenceDensityKgM3: refDensity15C,
    referenceViscosityCSt: refViscosity40C,
    computedDensityKgM3: Number(computedDensity.toFixed(2)),
    computedViscosityCSt: Number(computedViscosity.toFixed(3)),
    dynamicViscosityPaS: dynamicViscosity,
    vaporPressureKPa: Number(Math.max(0.1, vaporPressure).toFixed(3))
  };
}
function calculateFlowVelocity(flowRateM3h, idMm) {
  if (idMm <= 0 || flowRateM3h <= 0) return 0;
  const dMeters = idMm / 1e3;
  const areaM2 = Math.PI / 4 * Math.pow(dMeters, 2);
  const flowM3s = flowRateM3h / 3600;
  return flowM3s / areaM2;
}
function calculateReynoldsNumber(velocityMps, idMm, kinematicViscosityCSt) {
  if (velocityMps <= 0 || idMm <= 0 || kinematicViscosityCSt <= 0) return 0;
  const re = velocityMps * 1e3 * idMm / kinematicViscosityCSt;
  return Number(re.toFixed(1));
}
function calculateDarcyFrictionFactor(reynolds, roughnessMm, idMm) {
  if (reynolds <= 0 || idMm <= 0) return 0.02;
  if (reynolds <= 2300) {
    return Math.min(1, 64 / reynolds);
  }
  const relRoughness = roughnessMm / idMm;
  const solveTurbulentColebrook = (Re, eOverD) => {
    const sjTerm = Math.log10(eOverD / 3.7 + 5.74 / Math.pow(Re, 0.9));
    let f = 0.25 / Math.pow(sjTerm, 2);
    for (let i = 0; i < 5; i++) {
      const invSqrtF = 1 / Math.sqrt(f);
      const arg = eOverD / 3.7 + 2.51 * invSqrtF / Re;
      if (arg <= 0) break;
      const g = invSqrtF + 2 * Math.log10(arg);
      const dg = 1 + 2 / Math.LN10 * (2.51 / Re) / arg;
      const delta = g / dg;
      const newInvSqrtF = invSqrtF - delta;
      if (newInvSqrtF <= 0) break;
      f = 1 / Math.pow(newInvSqrtF, 2);
      if (Math.abs(delta) < 1e-6) break;
    }
    return f;
  };
  if (reynolds >= 4e3) {
    return solveTurbulentColebrook(reynolds, relRoughness);
  }
  const fLam2300 = 64 / 2300;
  const fTurb4000 = solveTurbulentColebrook(4e3, relRoughness);
  const t = (reynolds - 2300) / (4e3 - 2300);
  const smoothT = t * t * (3 - 2 * t);
  return fLam2300 + smoothT * (fTurb4000 - fLam2300);
}
function calculateDarcyHeadLoss(frictionFactor, lengthM, idMm, velocityMps) {
  if (lengthM <= 0 || idMm <= 0 || velocityMps <= 0) return 0;
  const dM = idMm / 1e3;
  const hf = frictionFactor * (lengthM / dM) * (Math.pow(velocityMps, 2) / (2 * G_ACCEL));
  return Number(hf.toFixed(4));
}
function calculateMinorHeadLoss(kTotal, velocityMps) {
  if (kTotal <= 0 || velocityMps <= 0) return 0;
  const hm = kTotal * (Math.pow(velocityMps, 2) / (2 * G_ACCEL));
  return Number(hm.toFixed(4));
}
function getPipeIdFromSchedule(nps, schedule) {
  const pipe = PIPE_SCHEDULE_DATABASE.find((p) => p.nps === nps);
  if (!pipe) return 52.48;
  const sched = pipe.schedules.find((s) => s.schedule === schedule) || pipe.schedules[0];
  return sched.idMm;
}
function getPipeOdFromNps(nps) {
  const pipe = PIPE_SCHEDULE_DATABASE.find((p) => p.nps === nps);
  return pipe ? pipe.odMm : 60.3;
}
function getPipeWallThk(nps, schedule) {
  const pipe = PIPE_SCHEDULE_DATABASE.find((p) => p.nps === nps);
  if (!pipe) return 3.91;
  const sched = pipe.schedules.find((s) => s.schedule === schedule) || pipe.schedules[0];
  return sched.wallThkMm;
}
function calculateSystemHydraulics(params) {
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
    dieselType = "Diesel #2 (ULSD)",
    dieselTempC = 20,
    pumpEfficiencyPct = 65,
    pumpNpshrM = 2.5
  } = params;
  const fluid = getDieselProperties(dieselType, dieselTempC);
  const flowRateGpm = flowRateM3h * 4.40287;
  const suctionIdMm = getPipeIdFromSchedule(suctionNps, suctionSchedule);
  const suctionOdMm = getPipeOdFromNps(suctionNps);
  const suctionWallThk = getPipeWallThk(suctionNps, suctionSchedule);
  const suctionVelocity = calculateFlowVelocity(flowRateM3h, suctionIdMm);
  const suctionReynolds = calculateReynoldsNumber(suctionVelocity, suctionIdMm, fluid.computedViscosityCSt);
  const suctionRegime = suctionReynolds <= 2300 ? "Laminar" : suctionReynolds >= 4e3 ? "Turbulent" : "Transition";
  const suctionFrictionFactor = calculateDarcyFrictionFactor(
    suctionReynolds,
    suctionMaterial.absoluteRoughnessMm,
    suctionIdMm
  );
  const suctionPipeLoss = calculateDarcyHeadLoss(suctionFrictionFactor, suctionLengthM, suctionIdMm, suctionVelocity);
  const suctionKTotal = fittings.filter((f) => f.location === "suction").reduce((sum, f) => sum + f.kValue * f.count, 0);
  const suctionFittingsLoss = calculateMinorHeadLoss(suctionKTotal, suctionVelocity);
  const suctionTotalHeadLoss = suctionPipeLoss + suctionFittingsLoss;
  const suctionPressureDropKpa = fluid.computedDensityKgM3 * G_ACCEL * suctionTotalHeadLoss / 1e3;
  const dischargeIdMm = getPipeIdFromSchedule(dischargeNps, dischargeSchedule);
  const dischargeOdMm = getPipeOdFromNps(dischargeNps);
  const dischargeWallThk = getPipeWallThk(dischargeNps, dischargeSchedule);
  const dischargeVelocity = calculateFlowVelocity(flowRateM3h, dischargeIdMm);
  const dischargeReynolds = calculateReynoldsNumber(dischargeVelocity, dischargeIdMm, fluid.computedViscosityCSt);
  const dischargeRegime = dischargeReynolds <= 2300 ? "Laminar" : dischargeReynolds >= 4e3 ? "Turbulent" : "Transition";
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
  const dischargeKTotal = fittings.filter((f) => f.location === "discharge").reduce((sum, f) => sum + f.kValue * f.count, 0);
  const dischargeFittingsLoss = calculateMinorHeadLoss(dischargeKTotal, dischargeVelocity);
  const dischargeTotalHeadLoss = dischargePipeLoss + dischargeFittingsLoss;
  const dischargePressureDropKpa = fluid.computedDensityKgM3 * G_ACCEL * dischargeTotalHeadLoss / 1e3;
  const netStaticHeadM = suctionElevDeltaM + dischargeElevDeltaM;
  const totalFrictionHeadLossM = suctionPipeLoss + dischargePipeLoss;
  const totalMinorHeadLossM = suctionFittingsLoss + dischargeFittingsLoss;
  const terminalPressureHeadM = terminalPressureBar * 1e5 / (fluid.computedDensityKgM3 * G_ACCEL);
  const totalDynamicHeadM = netStaticHeadM + totalFrictionHeadLossM + totalMinorHeadLossM + terminalPressureHeadM;
  const totalDynamicHeadKPa = fluid.computedDensityKgM3 * G_ACCEL * totalDynamicHeadM / 1e3;
  const totalDynamicHeadPsi = totalDynamicHeadKPa * 0.145038;
  const atmHeadM = ATMOSPHERIC_PRESSURE_KPA * 1e3 / (fluid.computedDensityKgM3 * G_ACCEL);
  const vpHeadM = fluid.vaporPressureKPa * 1e3 / (fluid.computedDensityKgM3 * G_ACCEL);
  const npshaM = atmHeadM - vpHeadM - suctionElevDeltaM - suctionTotalHeadLoss;
  const npshMarginM = npshaM - pumpNpshrM;
  const npshStatus = npshMarginM >= 0.8 ? "PASS" : npshMarginM >= 0 ? "WARNING" : "FAIL";
  const flowM3s = flowRateM3h / 3600;
  const hydraulicPowerKw = fluid.computedDensityKgM3 * G_ACCEL * flowM3s * Math.max(0, totalDynamicHeadM) / 1e3;
  const pumpEffDecimal = Math.max(0.1, pumpEfficiencyPct / 100);
  const brakeHorsepowerKw = hydraulicPowerKw / pumpEffDecimal;
  const brakeHorsepowerHp = brakeHorsepowerKw * 1.34102;
  const motorWithMarginKw = brakeHorsepowerKw * 1.2;
  const standardMotorRatingsKw = [0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11, 15, 18.5, 22, 30, 37, 45, 55, 75];
  const recommendedMotorKw = standardMotorRatingsKw.find((kw) => kw >= motorWithMarginKw) || Math.ceil(motorWithMarginKw);
  const recommendedMotorHp = Number((recommendedMotorKw * 1.34102).toFixed(1));
  const suctionMawpBar = calculateAsmeB313Mawp(suctionMaterial, suctionOdMm, suctionWallThk);
  const dischargeMawpBar = calculateAsmeB313Mawp(dischargeMaterial, dischargeOdMm, dischargeWallThk);
  const suctionVelocityValid = suctionVelocity >= 0.4 && suctionVelocity <= 1.5;
  const dischargeVelocityValid = dischargeVelocity >= 0.8 && dischargeVelocity <= 2.5;
  const dischargePressureBar = (dischargePressureDropKpa + fluid.computedDensityKgM3 * G_ACCEL * dischargeElevDeltaM / 1e3) / 100 + terminalPressureBar;
  const pressureValid = dischargePressureBar <= dischargeMawpBar;
  const npshValid = npshStatus !== "FAIL";
  const messages = [];
  if (suctionVelocity < 0.5) {
    messages.push({
      type: "warning",
      code: "ASME_B31.3_V_SUCT_LOW",
      message: `Suction velocity ${suctionVelocity.toFixed(2)} m/s is below optimal 0.6-1.2 m/s. May allow sediment settling in diesel line.`
    });
  } else if (suctionVelocity > 1.5) {
    messages.push({
      type: "error",
      code: "ASME_B31.3_V_SUCT_HIGH",
      message: `Suction velocity ${suctionVelocity.toFixed(2)} m/s exceeds ASME B31.3 recommendation (1.5 m/s max). High risk of pump cavitation and friction loss.`
    });
  } else {
    messages.push({
      type: "success",
      code: "ASME_B31.3_V_SUCT_OK",
      message: `Suction velocity ${suctionVelocity.toFixed(2)} m/s satisfies ASME B31.3 / Hydraulic Institute standards (0.6 - 1.2 m/s).`
    });
  }
  if (dischargeVelocity > 2.5) {
    messages.push({
      type: "error",
      code: "API_RP_2003_STATIC_HAZARD",
      message: `Discharge velocity ${dischargeVelocity.toFixed(2)} m/s exceeds API RP 2003 / EI 1540 max safe diesel velocity (2.5 m/s). Dangerous electrostatic ignition hazard!`
    });
  } else if (dischargeVelocity > 2.2) {
    messages.push({
      type: "warning",
      code: "ASME_B31.3_V_DISCH_HIGH",
      message: `Discharge velocity ${dischargeVelocity.toFixed(2)} m/s is near upper safety threshold (2.5 m/s). Consider upsizing pipe.`
    });
  } else {
    messages.push({
      type: "success",
      code: "ASME_B31.3_V_DISCH_OK",
      message: `Discharge velocity ${dischargeVelocity.toFixed(2)} m/s complies with ASME B31.3 and API RP 2003 electrostatic limits (< 2.5 m/s).`
    });
  }
  if (npshStatus === "FAIL") {
    messages.push({
      type: "error",
      code: "HI_NPSH_DEFICIT",
      message: `NPSHa (${npshaM.toFixed(2)} m) is below NPSHr (${pumpNpshrM.toFixed(2)} m)! Severe cavitation will damage pump impellers and starve generator.`
    });
  } else if (npshStatus === "WARNING") {
    messages.push({
      type: "warning",
      code: "HI_NPSH_MARGIN_LOW",
      message: `NPSH margin (${npshMarginM.toFixed(2)} m) is under the 0.8 m safety margin recommended by Hydraulic Institute / API 610.`
    });
  } else {
    messages.push({
      type: "success",
      code: "HI_NPSH_SAFE",
      message: `NPSH margin is robust at +${npshMarginM.toFixed(2)} m over NPSHr (NPSHa = ${npshaM.toFixed(2)} m). Zero cavitation risk.`
    });
  }
  if (dischargePressureBar > dischargeMawpBar) {
    messages.push({
      type: "error",
      code: "ASME_B31.3_MAWP_EXCEEDED",
      message: `Operating pressure ${dischargePressureBar.toFixed(1)} bar exceeds pipe MAWP (${dischargeMawpBar} bar) under ASME B31.3 Section 304.1.2!`
    });
  } else {
    messages.push({
      type: "success",
      code: "ASME_B31.3_MAWP_COMPLIANT",
      message: `Discharge MAWP (${dischargeMawpBar} bar) provides ample safety factor over operating pressure (${dischargePressureBar.toFixed(1)} bar).`
    });
  }
  const overallStatus = messages.some((m) => m.type === "error") ? "NON-COMPLIANT" : messages.some((m) => m.type === "warning") ? "WARNING" : "COMPLIANT";
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
      messages
    }
  };
}

// src/utils/pumps.ts
var PREDEFINED_PUMPS = [
  {
    id: "viking_g4124a",
    manufacturer: "Viking Pump",
    series: "Series 4124A",
    model: "G4124A Internal Gear Fuel Oil Transfer",
    type: "Positive Displacement Gear",
    speedRpm: 1200,
    ratedFlowM3h: 12,
    ratedHeadM: 50,
    maxPressureBar: 7,
    curvePoints: [
      { q: 0, h: 58, efficiency: 0, npshr: 1.5 },
      { q: 4, h: 55, efficiency: 52, npshr: 1.8 },
      { q: 8, h: 52, efficiency: 68, npshr: 2.1 },
      { q: 12, h: 48, efficiency: 72, npshr: 2.5 },
      { q: 15, h: 42, efficiency: 69, npshr: 3 },
      { q: 18, h: 32, efficiency: 60, npshr: 3.8 }
    ],
    polynomial: { a: -0.078, b: -0.03, c: 58 },
    efficiencyPolynomial: { a: -0.45, b: 9.8, c: 18 },
    notes: "Heavy-duty rotary internal gear pump designed for clean fuel oil, ULSD, and biodiesel with mechanical seal and internal relief valve."
  },
  {
    id: "viking_h4124a",
    manufacturer: "Viking Pump",
    series: "Series 4124A High Capacity",
    model: "H4124A Internal Gear Bulk Transfer",
    type: "Positive Displacement Gear",
    speedRpm: 1200,
    ratedFlowM3h: 25,
    ratedHeadM: 55,
    maxPressureBar: 8.5,
    curvePoints: [
      { q: 0, h: 65, efficiency: 0, npshr: 1.8 },
      { q: 10, h: 62, efficiency: 60, npshr: 2.2 },
      { q: 20, h: 58, efficiency: 74, npshr: 2.8 },
      { q: 25, h: 54, efficiency: 75, npshr: 3.2 },
      { q: 30, h: 48, efficiency: 71, npshr: 3.9 },
      { q: 35, h: 38, efficiency: 62, npshr: 4.8 }
    ],
    polynomial: { a: -0.021, b: -0.04, c: 65 },
    efficiencyPolynomial: { a: -0.12, b: 5.7, c: 20 },
    notes: "High-volume internal gear pump ideal for tanker unloading, bulk tank transfers, and critical backup power generator loops."
  },
  {
    id: "gorman_rupp_02f3",
    manufacturer: "Gorman-Rupp",
    series: "O-Series Petroleum",
    model: "02F3-B Self-Priming Centrifugal",
    type: "Self-Priming Centrifugal",
    speedRpm: 2900,
    ratedFlowM3h: 18,
    ratedHeadM: 32,
    maxPressureBar: 5.5,
    curvePoints: [
      { q: 0, h: 38, efficiency: 0, npshr: 1.8 },
      { q: 8, h: 36, efficiency: 55, npshr: 2.2 },
      { q: 14, h: 34, efficiency: 66, npshr: 2.6 },
      { q: 18, h: 31, efficiency: 68, npshr: 3.1 },
      { q: 22, h: 26, efficiency: 64, npshr: 3.9 },
      { q: 26, h: 18, efficiency: 52, npshr: 5.2 }
    ],
    polynomial: { a: -0.029, b: -0.01, c: 38 },
    efficiencyPolynomial: { a: -0.22, b: 7.5, c: 10 },
    notes: "Self-priming petroleum pump equipped with straight-in suction and Viton mechanical seals, eliminates vapor lock in long diesel suction headers."
  },
  {
    id: "gorman_rupp_03d3",
    manufacturer: "Gorman-Rupp",
    series: "O-Series High Flow",
    model: "03D3-B Bulk Petroleum Transfer",
    type: "Self-Priming Centrifugal",
    speedRpm: 2900,
    ratedFlowM3h: 45,
    ratedHeadM: 36,
    maxPressureBar: 6,
    curvePoints: [
      { q: 0, h: 44, efficiency: 0, npshr: 2.1 },
      { q: 20, h: 42, efficiency: 58, npshr: 2.7 },
      { q: 35, h: 39, efficiency: 71, npshr: 3.4 },
      { q: 45, h: 35, efficiency: 73, npshr: 4.1 },
      { q: 55, h: 28, efficiency: 67, npshr: 5.2 },
      { q: 65, h: 18, efficiency: 54, npshr: 6.5 }
    ],
    polynomial: { a: -62e-4, b: -5e-3, c: 44 },
    efficiencyPolynomial: { a: -0.038, b: 3.3, c: 12 },
    notes: "Industrial grade 3-inch self-priming pump suited for bulk fuel terminals and multi-generator common supply headers."
  },
  {
    id: "blackmer_txd25a",
    manufacturer: "Blackmer",
    series: "TXD Series",
    model: "TXD2.5A Sliding Vane Petroleum",
    type: "Sliding Vane",
    speedRpm: 640,
    ratedFlowM3h: 22,
    ratedHeadM: 60,
    maxPressureBar: 8.6,
    curvePoints: [
      { q: 0, h: 72, efficiency: 0, npshr: 1.6 },
      { q: 10, h: 68, efficiency: 64, npshr: 2 },
      { q: 18, h: 64, efficiency: 75, npshr: 2.5 },
      { q: 22, h: 60, efficiency: 77, npshr: 2.9 },
      { q: 26, h: 54, efficiency: 73, npshr: 3.5 },
      { q: 30, h: 42, efficiency: 63, npshr: 4.5 }
    ],
    polynomial: { a: -0.033, b: -0.02, c: 72 },
    efficiencyPolynomial: { a: -0.16, b: 6.8, c: 15 },
    notes: "Sliding vane positive displacement design with cavitation suppression liners; sustains high volumetric efficiency over a wide viscosity envelope."
  },
  {
    id: "fe_petro_stp15",
    manufacturer: "Franklin Fueling / FE Petro",
    series: "Submersible Turbine Pump",
    model: "STP 1.5 HP MagVane",
    type: "Submersible Turbine Pump (STP)",
    speedRpm: 3450,
    ratedFlowM3h: 15,
    ratedHeadM: 26,
    maxPressureBar: 3.8,
    curvePoints: [
      { q: 0, h: 32, efficiency: 0, npshr: 0.8 },
      { q: 6, h: 30, efficiency: 52, npshr: 1 },
      { q: 12, h: 27.5, efficiency: 66, npshr: 1.3 },
      { q: 15, h: 25, efficiency: 68, npshr: 1.6 },
      { q: 18, h: 21, efficiency: 62, npshr: 2.1 },
      { q: 22, h: 14, efficiency: 48, npshr: 3 }
    ],
    polynomial: { a: -0.038, b: -0.01, c: 32 },
    efficiencyPolynomial: { a: -0.3, b: 8.5, c: 15 },
    notes: "In-tank submersible turbine pump installed directly at the bottom of underground storage tanks (UST). Operates with zero suction lift and zero suction vapor lock risk."
  }
];

// src/cli/index.ts
var BANNER = `
========================================================================
   DIESEL PIPING & PUMP WORKSTATION - STANDALONE CALCULATION ENGINE
   ASME B31.3 Process Piping & Darcy-Weisbach Hydraulic Solver
========================================================================
`;
function printHelp() {
  console.log(BANNER);
  console.log(`Usage:
  diesel-workstation <command> [options]

Commands:
  calc          Run hydraulic sizing & ASME B31.3 calculations
  serve         Launch offline desktop web workstation on local HTTP port
  materials     Display ASME B31.3 pipe materials database
  pumps         Display standard industrial diesel pump specifications
  help          Display this help message

Options for 'calc':
  --flow <gpm>          Design flow rate in US GPM (default: 100)
  --flow-m3h <m3/h>     Design flow rate in m\xB3/h
  --dia <inches>        Discharge pipe NPS in inches (default: 3)
  --sched <40|80>       Pipe schedule (default: 40)
  --length <feet>       Discharge pipe length in feet (default: 150)
  --length-m <meters>   Discharge pipe length in meters
  --suction-dia <inch>  Suction pipe NPS in inches (default: recommended or 3)
  --suction-length <ft> Suction pipe length in feet (default: 15)
  --elev <feet>         Static elevation delta in feet (default: 25)
  --material <id>       Material ID: cs_a106_b, cs_a53_b, ss_304, ss_316, hdpe_pe100, frp, copper_k, cs_a333_6 (default: cs_a106_b)
  --temp <degF>         Fuel temperature in \xB0F (default: 68)
  --fuel <type>         Fuel grade: ULSD, KEROSENE, BIODIESEL, MGO (default: ULSD)
  --format <text|json|csv> Output format (default: text)
  --out <file>          Save calculation results to file

Options for 'serve':
  --port <number>       Local web server port (default: 3000)
  --host <string>       Host bind address (default: 0.0.0.0)

Examples:
  ./diesel-workstation calc --flow 120 --dia 3 --length 200 --elev 30
  ./diesel-workstation calc --flow 75 --material ss_316 --format json
  ./diesel-workstation serve --port 3000
  ./diesel-workstation materials
`);
}
function parseArgs(args) {
  const options2 = {};
  let command2 = "help";
  let i = 0;
  if (args.length > 0 && !args[0].startsWith("-")) {
    command2 = args[0];
    i = 1;
  }
  for (; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        options2[key] = args[i + 1];
        i++;
      } else {
        options2[key] = true;
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        options2[key] = args[i + 1];
        i++;
      } else {
        options2[key] = true;
      }
    }
  }
  return { command: command2, options: options2 };
}
function runCalc(options2) {
  let flowGpm = Number(options2.flow || (options2["flow-m3h"] ? Number(options2["flow-m3h"]) * 4.40287 : 100));
  if (isNaN(flowGpm) || flowGpm <= 0) flowGpm = 100;
  const flowM3h = flowGpm / 4.40287;
  const dischargeNps = String(options2.dia || options2.nps || "3");
  const dischargeSched = String(options2.sched || "40");
  const dischargeLengthFt = Number(options2.length || (options2["length-m"] ? Number(options2["length-m"]) * 3.28084 : 150));
  const dischargeLengthM = dischargeLengthFt / 3.28084;
  const suctionNps = String(options2["suction-dia"] || options2["suction-nps"] || dischargeNps);
  const suctionSched = String(options2["suction-sched"] || dischargeSched);
  const suctionLengthFt = Number(options2["suction-length"] || 15);
  const suctionLengthM = suctionLengthFt / 3.28084;
  const elevFt = Number(options2.elev || 25);
  const elevM = elevFt / 3.28084;
  const tempF = Number(options2.temp || 68);
  const tempC = (tempF - 32) * (5 / 9);
  const matInput = String(options2.material || "cs_a106_b").toLowerCase();
  const material = PIPE_MATERIALS.find((m) => m.id.toLowerCase() === matInput) || PIPE_MATERIALS.find((m) => m.id.toLowerCase().includes(matInput)) || PIPE_MATERIALS.find((m) => m.name.toLowerCase().includes(matInput)) || PIPE_MATERIALS[0];
  let fuelType = "Diesel #2 (ULSD)";
  const fuelParam = String(options2.fuel || "").toUpperCase();
  if (fuelParam.includes("KERO") || fuelParam.includes("1")) {
    fuelType = "Diesel #1 (Kerosene/Arctic)";
  } else if (fuelParam.includes("BIO") || fuelParam.includes("B20")) {
    fuelType = "Biodiesel B20";
  } else if (fuelParam.includes("MGO") || fuelParam.includes("MARINE")) {
    fuelType = "Marine Gas Oil (MGO)";
  }
  const defaultFittings = [
    { id: "1", name: "90\xB0 Standard Elbow", type: "elbow_90_standard", kValue: 0.75, count: 4, location: "discharge" },
    { id: "2", name: "Ball Valve (Full Port)", type: "valve_ball_full", kValue: 0.05, count: 2, location: "discharge" },
    { id: "3", name: "Swing Check Valve", type: "valve_check_swing", kValue: 2, count: 1, location: "discharge" },
    { id: "4", name: "Flow Switch (Paddle Type)", type: "flow_switch", kValue: 1.8, count: 1, location: "discharge" },
    { id: "5", name: "Basket Strainer (Clean 40-mesh)", type: "strainer_basket", kValue: 1.5, count: 1, location: "suction" },
    { id: "6", name: "90\xB0 Long Radius Elbow", type: "elbow_90_long_radius", kValue: 0.45, count: 2, location: "suction" }
  ];
  const results = calculateSystemHydraulics({
    flowRateM3h: flowM3h,
    suctionNps,
    suctionSchedule: suctionSched,
    suctionLengthM,
    suctionMaterial: material,
    suctionElevDeltaM: 1,
    // 1m suction lift
    dischargeNps,
    dischargeSchedule: dischargeSched,
    dischargeLengthM,
    dischargeMaterial: material,
    dischargeElevDeltaM: elevM,
    fittings: defaultFittings,
    dieselType: fuelType,
    dieselTempC: tempC,
    pumpEfficiencyPct: 65,
    pumpNpshrM: 2.5
  });
  const format = String(options2.format || "text").toLowerCase();
  if (format === "json") {
    const jsonOutput = JSON.stringify({
      inputs: {
        flowRateGpm: flowGpm,
        flowRateM3h: flowM3h,
        dischargeNps,
        dischargeSched,
        dischargeLengthFt,
        elevFt,
        tempF,
        material: material.name,
        fuel: fuelType
      },
      hydraulics: results
    }, null, 2);
    if (options2.out) {
      import_fs.default.writeFileSync(options2.out, jsonOutput, "utf-8");
      console.log(`Results saved to ${options2.out}`);
    } else {
      console.log(jsonOutput);
    }
    return;
  }
  if (format === "csv") {
    const csvLines = [
      "Parameter,Value,Unit",
      `Design Flow Rate,${flowGpm.toFixed(2)},US GPM`,
      `Design Flow Rate (Metric),${flowM3h.toFixed(2)},m3/h`,
      `Discharge NPS,${dischargeNps},inches`,
      `Discharge Schedule,${dischargeSched},-`,
      `Discharge Length,${dischargeLengthFt.toFixed(1)},ft`,
      `Static Head Delta,${elevFt.toFixed(1)},ft`,
      `Pipe Material,"${material.name}",-`,
      `Diesel Fuel Grade,"${fuelType}",-`,
      `Fuel Density,${results.fluid.computedDensityKgM3.toFixed(1)},kg/m3`,
      `Kinematic Viscosity,${results.fluid.computedViscosityCSt.toFixed(2)},cSt`,
      `Suction Velocity,${(results.suctionVelocityMps * 3.28084).toFixed(2)},ft/s`,
      `Discharge Velocity,${(results.dischargeVelocityMps * 3.28084).toFixed(2)},ft/s`,
      `Discharge Reynolds Number,${Math.round(results.dischargeReynolds)},-`,
      `Discharge Flow Regime,${results.dischargeRegime},-`,
      `Darcy Friction Factor f,${results.dischargeFrictionFactor.toFixed(5)},-`,
      `Discharge Friction Loss,${(results.dischargePipeHeadLossM * 3.28084).toFixed(2)},ft`,
      `Fittings Minor Loss,${(results.totalMinorHeadLossM * 3.28084).toFixed(2)},ft`,
      `Total Dynamic Head,${(results.totalDynamicHeadM * 3.28084).toFixed(2)},ft`,
      `Total Differential Pressure,${results.totalDynamicHeadPsi.toFixed(2)},psi`,
      `Hydraulic Power,${results.hydraulicPowerKw.toFixed(2)},kW`,
      `Pump Brake Power (BHP),${results.brakeHorsepowerHp.toFixed(2)},HP`,
      `ASME B31.3 Pipe MAWP,${(results.dischargeMawpBar * 14.5038).toFixed(1)},psi`,
      `ASME B31.3 Compliance,${results.asmeCompliance.status},-`,
      `NPSHa,${(results.npshaM * 3.28084).toFixed(2)},ft`,
      `NPSH Margin Status,${results.npshStatus},-`
    ].join("\n");
    if (options2.out) {
      import_fs.default.writeFileSync(options2.out, csvLines, "utf-8");
      console.log(`Results CSV saved to ${options2.out}`);
    } else {
      console.log(csvLines);
    }
    return;
  }
  console.log(BANNER);
  console.log(`PROJECT / CALCULATION SUMMARY:`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`Flow Rate           : ${flowGpm.toFixed(2)} US GPM (${flowM3h.toFixed(2)} m\xB3/h)`);
  console.log(`Discharge Piping    : ${dischargeNps}" NPS Sch ${dischargeSched} (${material.name})`);
  console.log(`Discharge Length    : ${dischargeLengthFt.toFixed(1)} ft (${dischargeLengthM.toFixed(1)} m)`);
  console.log(`Static Head Delta   : ${elevFt.toFixed(1)} ft (${elevM.toFixed(1)} m)`);
  console.log(`Fuel Grade          : ${fuelType} @ ${tempF}\xB0F (${tempC.toFixed(1)}\xB0C)`);
  console.log(`Fluid Properties    : Density = ${results.fluid.computedDensityKgM3.toFixed(1)} kg/m\xB3, Viscosity = ${results.fluid.computedViscosityCSt.toFixed(2)} cSt`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`HYDRAULIC ANALYSIS (DARCY-WEISBACH & COLEBROOK-WHITE):`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`Discharge Velocity  : ${(results.dischargeVelocityMps * 3.28084).toFixed(2)} ft/s (${results.dischargeVelocityMps.toFixed(2)} m/s)`);
  console.log(`Suction Velocity    : ${(results.suctionVelocityMps * 3.28084).toFixed(2)} ft/s (${results.suctionVelocityMps.toFixed(2)} m/s)`);
  console.log(`Reynolds Number     : ${Math.round(results.dischargeReynolds).toLocaleString()} (${results.dischargeRegime})`);
  console.log(`Darcy Friction (f)  : ${results.dischargeFrictionFactor.toFixed(5)}`);
  console.log(`Pipe Friction Loss  : ${(results.dischargePipeHeadLossM * 3.28084).toFixed(2)} ft head (${(results.dischargePressureDropKpa * 0.145038).toFixed(2)} psi)`);
  console.log(`Minor Fittings Loss : ${(results.totalMinorHeadLossM * 3.28084).toFixed(2)} ft head`);
  console.log(`Total Dynamic Head  : ${(results.totalDynamicHeadM * 3.28084).toFixed(2)} ft (${results.totalDynamicHeadM.toFixed(2)} m)`);
  console.log(`Total System Delta P: ${results.totalDynamicHeadPsi.toFixed(2)} psi (${results.totalDynamicHeadKPa.toFixed(1)} kPa)`);
  console.log(`Hydraulic Power     : ${results.hydraulicPowerKw.toFixed(2)} kW`);
  console.log(`Estimated Pump BHP  : ${results.brakeHorsepowerHp.toFixed(2)} HP (@ ${results.pumpEfficiencyPct}% pump eff.)`);
  console.log(`NPSH Available      : ${(results.npshaM * 3.28084).toFixed(2)} ft head [Margin: ${results.npshStatus}]`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`ASME B31.3 PROCESS PIPING CODE COMPLIANCE:`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`Material Spec       : ${material.standard} (${material.category})`);
  console.log(`Allowable Stress S  : ${(material.allowableStressMpa * 145.038).toFixed(0)} psi (${material.allowableStressMpa} MPa)`);
  console.log(`Pipe MAWP (B31.3)   : ${(results.dischargeMawpBar * 14.5038).toFixed(1)} psi (${results.dischargeMawpBar.toFixed(1)} bar)`);
  console.log(`System Peak Press.  : ${results.totalDynamicHeadPsi.toFixed(1)} psi`);
  console.log(`Compliance Status   : ${results.asmeCompliance.status}`);
  results.asmeCompliance.messages.forEach((msg) => {
    console.log(`  [${msg.type.toUpperCase()}] ${msg.message}`);
  });
  console.log(`------------------------------------------------------------------------
`);
  if (options2.out) {
    const reportText = `Diesel Piping & Pump Workstation - Calculation Report
Date: ${(/* @__PURE__ */ new Date()).toISOString()}
Flow: ${flowGpm} GPM
Total Head: ${(results.totalDynamicHeadM * 3.28084).toFixed(2)} ft
Differential Pressure: ${results.totalDynamicHeadPsi.toFixed(2)} psi
MAWP: ${(results.dischargeMawpBar * 14.5038).toFixed(1)} psi
Status: ${results.asmeCompliance.status}
`;
    import_fs.default.writeFileSync(options2.out, reportText, "utf-8");
    console.log(`Report summary saved to ${options2.out}`);
  }
}
function listMaterials() {
  console.log(BANNER);
  console.log(`ASME B31.3 PROCESS PIPING MATERIALS DATABASE`);
  console.log(`========================================================================================`);
  console.log(
    `ID`.padEnd(14) + `Specification`.padEnd(36) + `Allowable Stress`.padEnd(18) + `Roughness (\u03B5)`.padEnd(16) + `Temp Range`
  );
  console.log(`----------------------------------------------------------------------------------------`);
  for (const m of PIPE_MATERIALS) {
    console.log(
      `${m.id}`.padEnd(14) + `${m.name.slice(0, 34)}`.padEnd(36) + `${(m.allowableStressMpa * 145.038).toFixed(0)} psi`.padEnd(18) + `${(m.absoluteRoughnessMm * 1e3).toFixed(1)} \xB5m`.padEnd(16) + `${m.minTempC}\xB0C to ${m.maxTempC}\xB0C`
    );
  }
  console.log(`========================================================================================
`);
}
function listPumps() {
  console.log(BANNER);
  console.log(`STANDARD INDUSTRIAL DIESEL FUEL PUMPS DATABASE`);
  console.log(`========================================================================================`);
  console.log(
    `Manufacturer & Model`.padEnd(36) + `Type`.padEnd(20) + `Rated Flow (m\xB3/h)`.padEnd(20) + `Rated Head (m)`
  );
  console.log(`----------------------------------------------------------------------------------------`);
  for (const p of PREDEFINED_PUMPS) {
    console.log(
      `${p.manufacturer} ${p.model.slice(0, 20)}`.padEnd(36) + `${p.type.slice(0, 18)}`.padEnd(20) + `${p.ratedFlowM3h} m\xB3/h (${(p.ratedFlowM3h * 4.40287).toFixed(0)} GPM)`.padEnd(20) + `${p.ratedHeadM} m (${(p.ratedHeadM * 3.28084).toFixed(0)} ft)`
    );
  }
  console.log(`========================================================================================
`);
}
function runServer(options2) {
  const port = Number(options2.port || 3e3);
  const host = String(options2.host || "0.0.0.0");
  const possiblePaths = [
    import_path.default.join(__dirname, "../../dist"),
    import_path.default.join(__dirname, "../dist"),
    import_path.default.join(__dirname, "dist"),
    import_path.default.join(process.cwd(), "dist")
  ];
  let distDir = possiblePaths.find((p) => import_fs.default.existsSync(p) && import_fs.default.existsSync(import_path.default.join(p, "index.html")));
  const mimeTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
    ".wasm": "application/wasm"
  };
  const server = import_http.default.createServer((req, res) => {
    let reqUrl = req.url || "/";
    let pathname = reqUrl.split("?")[0];
    if (pathname === "/") pathname = "/index.html";
    if (!distDir) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <body style="font-family:sans-serif; background:#0f172a; color:#f8fafc; padding:40px;">
            <h2>Diesel Piping & Pump Workstation - Standalone Server</h2>
            <p>Web app assets not built yet. Run <code>npm run build</code> or use the CLI calculation tool:</p>
            <pre style="background:#1e293b; padding:15px; border-radius:8px;">./diesel-workstation calc --flow 100 --dia 3</pre>
          </body>
        </html>
      `);
      return;
    }
    const filePath = import_path.default.join(distDir, pathname);
    if (import_fs.default.existsSync(filePath) && import_fs.default.statSync(filePath).isFile()) {
      const ext = import_path.default.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      import_fs.default.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = import_path.default.join(distDir, "index.html");
      if (import_fs.default.existsSync(indexPath)) {
        res.writeHead(200, { "Content-Type": "text/html" });
        import_fs.default.createReadStream(indexPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end("File Not Found");
      }
    }
  });
  server.listen(port, host, () => {
    console.log(BANNER);
    console.log(`Standalone Offline Server running at: http://localhost:${port}/`);
    console.log(`Serving offline workstation application... Press Ctrl+C to terminate.
`);
  });
}
var rawArgs = process.argv.slice(2);
var { command, options } = parseArgs(rawArgs);
if (options.help || command === "help" || rawArgs.length === 0) {
  printHelp();
} else if (command === "calc") {
  runCalc(options);
} else if (command === "serve") {
  runServer(options);
} else if (command === "materials") {
  listMaterials();
} else if (command === "pumps") {
  listPumps();
} else {
  if (options.flow || options.dia || options.length) {
    runCalc(options);
  } else {
    console.log(`Unknown command: ${command}`);
    printHelp();
  }
}
/**
 * @license
 * ASME B31.3 Diesel Piping Materials & Dimension Catalog
 */
/**
 * @license
 * ASME B31.3 Diesel Piping Sizing & Darcy-Weisbach Hydraulic Analysis Engine
 */
/**
 * @license
 * ASME B31.3 Diesel Piping - Pump Performance Curves & Operating Point Engine
 */
/**
 * @license
 * Diesel Piping & Pump Workstation - Standalone Executable Engine
 * Darcy-Weisbach Hydraulic Analysis & ASME B31.3 Process Piping Sizing
 */
