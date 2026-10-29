import test from 'node:test';
import assert from 'node:assert/strict';
import { PREDEFINED_PUMPS, evaluatePumpHead, evaluatePumpEfficiency, evaluatePumpNpshr, findPumpOperatingPoint } from './pumps';

test('PREDEFINED_PUMPS includes Piusi diesel transfer pumps', () => {
  const piusiPumps = PREDEFINED_PUMPS.filter((p) => p.manufacturer.toLowerCase() === 'piusi');
  assert.ok(piusiPumps.length >= 6, `Expected at least 6 Piusi pump models, got ${piusiPumps.length}`);

  const modelIds = piusiPumps.map((p) => p.id);
  assert.ok(modelIds.includes('piusi_panther_56'), 'Should include Panther 56');
  assert.ok(modelIds.includes('piusi_panther_72'), 'Should include Panther 72');
  assert.ok(modelIds.includes('piusi_e120'), 'Should include E120');
  assert.ok(modelIds.includes('piusi_e80'), 'Should include E80');
  assert.ok(modelIds.includes('piusi_bipump'), 'Should include Bi-Pump');
  assert.ok(modelIds.includes('piusi_viscomat_70'), 'Should include Viscomat 70');
});

test('Piusi pump head evaluation produces physically realistic head values', () => {
  const panther56 = PREDEFINED_PUMPS.find((p) => p.id === 'piusi_panther_56')!;
  assert.ok(panther56, 'Panther 56 must exist');

  // At zero flow, head should be near shutoff (17-18 m)
  const shutoffHead = evaluatePumpHead(panther56, 0);
  assert.ok(shutoffHead >= 16 && shutoffHead <= 19, `Shutoff head ${shutoffHead} should be around 17.6 m`);

  // At rated flow 3.4 m3/h, head should be positive and around rated head
  const ratedHead = evaluatePumpHead(panther56, 3.4);
  assert.ok(ratedHead >= 8 && ratedHead <= 14, `Rated flow head ${ratedHead} should be positive`);

  // Efficiency at rated flow should be positive
  const ratedEff = evaluatePumpEfficiency(panther56, 3.4);
  assert.ok(ratedEff >= 50 && ratedEff <= 80, `Rated efficiency ${ratedEff}% should be reasonable`);

  // NPSHr should be realistic
  const npshr = evaluatePumpNpshr(panther56, 3.4);
  assert.ok(npshr >= 1.0 && npshr <= 3.5, `NPSHr ${npshr} should be realistic`);
});

test('Piusi E120 operating point solver works seamlessly with system curve', () => {
  const e120 = PREDEFINED_PUMPS.find((p) => p.id === 'piusi_e120')!;
  assert.ok(e120, 'E120 must exist');

  // Static head = 5m, target flow = 5.0 m3/h, kSys = 0.5
  const opPoint = findPumpOperatingPoint(e120, 5.0, 0.5, 5.0);
  assert.ok(opPoint.flowM3h > 0, 'Operating flow must be positive');
  assert.ok(opPoint.headM > 5.0, 'Operating head must exceed static head');
  assert.ok(opPoint.efficiencyPct > 0, 'Efficiency must be positive');
  assert.ok(opPoint.powerKw > 0, 'Operating power must be positive');
});
