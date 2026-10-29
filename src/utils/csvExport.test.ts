import test from 'node:test';
import assert from 'node:assert/strict';
import { generateHydraulicCsvString } from './csvExport';
import { calculateSystemHydraulics } from './hydraulics';
import { PIPE_MATERIALS, DEFAULT_FITTINGS } from './materials';
import { PREDEFINED_PUMPS } from './pumps';
import { ProjectMetadata } from '../types';

test('generateHydraulicCsvString generates comprehensive CSV data structure', () => {
  const results = calculateSystemHydraulics({
    flowRateM3h: 12.0,
    suctionNps: '2',
    suctionSchedule: '40',
    suctionLengthM: 14.0,
    suctionMaterial: PIPE_MATERIALS[0],
    suctionElevDeltaM: 2.8,
    dischargeNps: '2',
    dischargeSchedule: '40',
    dischargeLengthM: 40.0,
    dischargeMaterial: PIPE_MATERIALS[0],
    dischargeElevDeltaM: 6.5,
    terminalPressureBar: 0.2,
    fittings: DEFAULT_FITTINGS,
    dieselType: 'Diesel #2 (ULSD)',
    dieselTempC: 20,
    pumpEfficiencyPct: 65,
    pumpNpshrM: 2.2,
  });

  const metadata: ProjectMetadata = {
    projectName: 'Emergency Generator Diesel Supply',
    projectNumber: 'ENG-2026-EDG-01',
    client: 'Data Center Operations',
    location: 'Frankfurt Facility DC2',
    leadEngineer: 'Festus Ani, PE',
    reviewer: 'Chief Piping Engineer',
    revision: 'Rev B',
    date: '2026-10-28',
    notes: 'Complying with ASME B31.3 and API RP 2003.',
  };

  const csv = generateHydraulicCsvString({
    results,
    project: metadata,
    pump: PREDEFINED_PUMPS[0],
    arrangementName: 'Underground Storage Tank (Suction Lift)',
    unitSystem: 'SI',
    fittings: DEFAULT_FITTINGS,
  });

  // Verify UTF-8 BOM
  assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM for Excel compatibility');

  // Verify Project Information is included
  assert.ok(csv.includes('Emergency Generator Diesel Supply'), 'Must include project name');
  assert.ok(csv.includes('ENG-2026-EDG-01'), 'Must include project number');
  assert.ok(csv.includes('Festus Ani, PE'), 'Must include engineer name');

  // Verify Sections exist
  assert.ok(csv.includes('=== FLUID PHYSICAL & THERMODYNAMIC PROPERTIES ==='), 'Must include fluid section');
  assert.ok(csv.includes('=== SUCTION PIPING HYDRAULIC ANALYSIS (DARCY-WEISBACH) ==='), 'Must include suction Darcy-Weisbach section');
  assert.ok(csv.includes('=== DISCHARGE PIPING HYDRAULIC ANALYSIS (DARCY-WEISBACH) ==='), 'Must include discharge Darcy-Weisbach section');
  assert.ok(csv.includes('=== TOTAL DYNAMIC HEAD (TDH) BREAKDOWN ==='), 'Must include TDH breakdown');
  assert.ok(csv.includes('=== NET POSITIVE SUCTION HEAD (NPSH) AUDIT ==='), 'Must include NPSH section');
  assert.ok(csv.includes('=== PUMP SELECTION & OPERATING POINT MATCHING ==='), 'Must include pump matching');
  assert.ok(csv.includes('=== PIPING FITTINGS & VALVES BILL OF MATERIALS (BOM) ==='), 'Must include BOM');
  assert.ok(csv.includes('=== ASME B31.3 CODE COMPLIANCE AUDIT FINDINGS ==='), 'Must include compliance section');

  // Verify Darcy-Weisbach calculation values
  assert.ok(csv.includes(results.suctionFrictionFactor.toFixed(5)), 'Must include suction friction factor');
  assert.ok(csv.includes(results.dischargeFrictionFactor.toFixed(5)), 'Must include discharge friction factor');
  assert.ok(csv.includes(results.totalDynamicHeadM.toFixed(3)), 'Must include TDH value');

  // Verify fittings BOM includes Flow Switch
  assert.ok(csv.includes('Flow Switch (Paddle Type)'), 'Must include Flow Switch fitting in BOM');

  // Verify PE License Number is NOT included
  assert.ok(!csv.includes('PE License Number'), 'Must not include PE License Number');
});

test('generateHydraulicCsvString handles completely blank project metadata', () => {
  const results = calculateSystemHydraulics({
    flowRateM3h: 12.0,
    suctionNps: '2',
    suctionSchedule: '40',
    suctionLengthM: 14.0,
    suctionMaterial: PIPE_MATERIALS[0],
    suctionElevDeltaM: 2.8,
    dischargeNps: '2',
    dischargeSchedule: '40',
    dischargeLengthM: 40.0,
    dischargeMaterial: PIPE_MATERIALS[0],
    dischargeElevDeltaM: 6.5,
    terminalPressureBar: 0.2,
    fittings: DEFAULT_FITTINGS,
    dieselType: 'Diesel #2 (ULSD)',
    dieselTempC: 20,
    pumpEfficiencyPct: 65,
    pumpNpshrM: 2.2,
  });

  const blankMetadata: ProjectMetadata = {
    projectName: '',
    projectNumber: '',
    client: '',
    location: '',
    leadEngineer: '',
    reviewer: '',
    revision: '',
    date: '',
    notes: '',
  };

  const csv = generateHydraulicCsvString({
    results,
    project: blankMetadata,
    pump: PREDEFINED_PUMPS[0],
    arrangementName: 'Underground Storage Tank (Suction Lift)',
    unitSystem: 'SI',
    fittings: DEFAULT_FITTINGS,
  });

  assert.ok(csv.startsWith('\uFEFF'), 'CSV must start with UTF-8 BOM');
  assert.ok(csv.includes('=== PROJECT & FACILITY INFORMATION ==='));
  assert.ok(!csv.includes('PE License Number'));
});
