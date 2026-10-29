/**
 * @license
 * Unit Tests for ASME B31.3 Diesel Piping Hydraulics Engine
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFlowVelocity,
  calculateReynoldsNumber,
  calculateDarcyFrictionFactor,
  calculateDarcyHeadLoss,
  calculateMinorHeadLoss,
  getDieselProperties,
  calculateSystemHydraulics,
  recommendOptimalNps,
} from './hydraulics';
import { calculateAsmeB313Mawp, PIPE_MATERIALS } from './materials';
import { findPumpOperatingPoint, PREDEFINED_PUMPS, calculateSystemResistanceCoeff } from './pumps';

test('Diesel properties calculation accounts for temperature', () => {
  const diesel20C = getDieselProperties('Diesel #2 (ULSD)', 20);
  const diesel40C = getDieselProperties('Diesel #2 (ULSD)', 40);

  // Density decreases with temperature
  assert.ok(diesel20C.computedDensityKgM3 > diesel40C.computedDensityKgM3, 'Density should decrease with higher temp');
  // Kinematic viscosity decreases with temperature
  assert.ok(diesel20C.computedViscosityCSt > diesel40C.computedViscosityCSt, 'Viscosity should decrease with higher temp');
  // Vapor pressure increases with temperature
  assert.ok(diesel40C.vaporPressureKPa > diesel20C.vaporPressureKPa, 'Vapor pressure should increase with higher temp');
});

test('Flow velocity obeys continuity equation Q = v * A', () => {
  // Q = 10 m3/h, D = 52.48 mm (2" Sch 40)
  const v = calculateFlowVelocity(10, 52.48);
  // Area = pi * (0.05248 / 2)^2 = 0.002163 m2
  // Q = 10 / 3600 = 0.002778 m3/s
  // v = 0.002778 / 0.002163 = 1.284 m/s
  assert.ok(Math.abs(v - 1.284) < 0.02, `Expected ~1.28 m/s, got ${v}`);
});

test('Darcy friction factor: Laminar flow matches exact 64/Re', () => {
  const Re = 1600;
  const f = calculateDarcyFrictionFactor(Re, 0.045, 52.48);
  const expected = 64 / 1600; // 0.040
  assert.equal(Number(f.toFixed(4)), expected);
});

test('Darcy friction factor: Turbulent Colebrook-White converges within physical Moody diagram bounds', () => {
  const Re = 85000;
  const roughnessMm = 0.045; // Commercial carbon steel
  const idMm = 52.48; // 2" Sch 40
  const f = calculateDarcyFrictionFactor(Re, roughnessMm, idMm);
  // Moody diagram for Re = 8.5e4, e/D = 0.045/52.48 = 0.000857 is approx 0.021 - 0.023
  assert.ok(f > 0.019 && f < 0.025, `Friction factor ${f} must be in Moody turbulent range [0.019, 0.025]`);
});

test('Darcy-Weisbach head loss equation calculation', () => {
  const f = 0.022;
  const lengthM = 50;
  const idMm = 52.48;
  const velocityMps = 1.5;
  const hf = calculateDarcyHeadLoss(f, lengthM, idMm, velocityMps);
  // hf = 0.022 * (50 / 0.05248) * (1.5^2 / (2 * 9.80665)) = 0.022 * 952.74 * (2.25 / 19.6133) = 2.404 m
  assert.ok(Math.abs(hf - 2.404) < 0.05, `Expected head loss around 2.40 m, got ${hf}`);
});

test('Minor head loss calculation for fittings', () => {
  const kTotal = 4.5;
  const v = 1.5;
  const hm = calculateMinorHeadLoss(kTotal, v);
  // hm = 4.5 * (1.5^2 / (2 * 9.80665)) = 4.5 * 0.1147 = 0.516 m
  assert.ok(Math.abs(hm - 0.516) < 0.02, `Expected minor loss ~0.516 m, got ${hm}`);
});

test('ASME B31.3 MAWP calculation for Carbon Steel A106 Gr. B (2" Sch 40)', () => {
  const csMaterial = PIPE_MATERIALS.find((m) => m.id === 'cs_a106_b')!;
  // OD = 60.3 mm, Wall = 3.91 mm, c = 1.5 mm, S = 137.9 MPa, E = 1.0, Y = 0.4
  const mawpBar = calculateAsmeB313Mawp(csMaterial, 60.3, 3.91);
  // Effective wall t_eff = 3.91 - 1.5 = 2.41 mm
  // P_mpa = (2 * 137.9 * 1.0 * 2.41) / (60.3 - 2 * 0.4 * 2.41) = 664.68 / (60.3 - 1.928) = 664.68 / 58.372 = 11.38 MPa = 113.8 bar
  assert.ok(mawpBar > 100 && mawpBar < 125, `Expected MAWP around 114 bar, got ${mawpBar} bar`);
});

test('Optimal pipe NPS recommendation stays within ASME B31.3 velocity limits', () => {
  const flowM3h = 15;
  const recSuction = recommendOptimalNps(flowM3h, 'suction');
  const recDischarge = recommendOptimalNps(flowM3h, 'discharge');

  assert.ok(recSuction.velocity >= 0.6 && recSuction.velocity <= 1.3, `Suction velocity ${recSuction.velocity} m/s should be within 0.6 - 1.3`);
  assert.ok(recDischarge.velocity >= 1.2 && recDischarge.velocity <= 2.5, `Discharge velocity ${recDischarge.velocity} m/s should be within 1.2 - 2.5`);
});

test('Full system hydraulics calculation produces complete verified results', () => {
  const cs = PIPE_MATERIALS[0];
  const results = calculateSystemHydraulics({
    flowRateM3h: 12,
    suctionNps: '2',
    suctionSchedule: '40',
    suctionLengthM: 10,
    suctionMaterial: cs,
    suctionElevDeltaM: 2.5, // 2.5 m suction lift
    dischargeNps: '2',
    dischargeSchedule: '40',
    dischargeLengthM: 35,
    dischargeMaterial: cs,
    dischargeElevDeltaM: 6.0, // 6 m elevation to day tank
    fittings: [
      { id: '1', type: 'elbow_90', name: '90° LR Elbow', kValue: 0.3, count: 2, location: 'suction' },
      { id: '2', type: 'foot_valve', name: 'Foot Valve with Strainer', kValue: 3.5, count: 1, location: 'suction' },
      { id: '3', type: 'elbow_90', name: '90° LR Elbow', kValue: 0.3, count: 4, location: 'discharge' },
      { id: '4', type: 'check_valve', name: 'Swing Check Valve', kValue: 2.0, count: 1, location: 'discharge' },
    ],
    dieselType: 'Diesel #2 (ULSD)',
    dieselTempC: 25,
    pumpEfficiencyPct: 70,
    pumpNpshrM: 2.2,
  });

  assert.ok(results.totalDynamicHeadM > 8.5, 'TDH should include static head 8.5 m + friction losses');
  assert.ok(results.npshaM > 0, 'NPSHa should be positive');
  assert.ok(results.hydraulicPowerKw > 0, 'Hydraulic power must be positive');
  assert.ok(results.asmeCompliance.messages.length > 0, 'Should have ASME compliance messages');
});

test('Pump operating point solver finds intersection between pump curve and system curve', () => {
  const pump = PREDEFINED_PUMPS[0]; // Viking G4124A
  const staticHeadM = 8.5;
  const kSys = calculateSystemResistanceCoeff(12, 18.0, staticHeadM);
  const op = findPumpOperatingPoint(pump, staticHeadM, kSys, 12);

  assert.ok(op.flowM3h > 5 && op.flowM3h < 25, `Operating flow ${op.flowM3h} should be in realistic range`);
  assert.ok(op.headM > 10 && op.headM < 60, `Operating head ${op.headM} should be in realistic range`);
  assert.ok(op.efficiencyPct > 30, 'Efficiency at operating point should be reasonable');
});

test('Zero input values (clear all data state) calculate cleanly without NaN or infinite errors', () => {
  const cs = PIPE_MATERIALS[0];
  const zeroResults = calculateSystemHydraulics({
    flowRateM3h: 0,
    suctionNps: '2',
    suctionSchedule: '40',
    suctionLengthM: 0,
    suctionMaterial: cs,
    suctionElevDeltaM: 0,
    dischargeNps: '2',
    dischargeSchedule: '40',
    dischargeLengthM: 0,
    dischargeMaterial: cs,
    dischargeElevDeltaM: 0,
    terminalPressureBar: 0,
    fittings: [],
    dieselType: 'Diesel #2 (ULSD)',
    dieselTempC: 0,
    pumpEfficiencyPct: 65,
    pumpNpshrM: 2.2,
  });

  assert.equal(zeroResults.flowRateM3h, 0);
  assert.equal(zeroResults.suctionVelocityMps, 0);
  assert.equal(zeroResults.dischargeVelocityMps, 0);
  assert.equal(zeroResults.totalDynamicHeadM, 0);
  assert.equal(zeroResults.hydraulicPowerKw, 0);
  assert.equal(zeroResults.brakeHorsepowerKw, 0);
  assert.ok(!isNaN(zeroResults.npshaM), 'NPSHa should not be NaN');
  assert.ok(isFinite(zeroResults.npshaM), 'NPSHa should be finite');
});
