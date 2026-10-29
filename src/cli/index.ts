#!/usr/bin/env node
/**
 * @license
 * Diesel Piping & Pump Workstation - Standalone Executable Engine
 * Darcy-Weisbach Hydraulic Analysis & ASME B31.3 Process Piping Sizing
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import {
  calculateSystemHydraulics,
  calculateFlowVelocity,
  recommendOptimalNps,
  getDieselProperties,
} from '../utils/hydraulics';
import {
  PIPE_MATERIALS,
  PIPE_SCHEDULE_DATABASE,
  calculateAsmeB313Mawp,
} from '../utils/materials';
import { PREDEFINED_PUMPS } from '../utils/pumps';
import { FittingItem } from '../types';

const BANNER = `
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
  --flow-m3h <m3/h>     Design flow rate in m³/h
  --dia <inches>        Discharge pipe NPS in inches (default: 3)
  --sched <40|80>       Pipe schedule (default: 40)
  --length <feet>       Discharge pipe length in feet (default: 150)
  --length-m <meters>   Discharge pipe length in meters
  --suction-dia <inch>  Suction pipe NPS in inches (default: recommended or 3)
  --suction-length <ft> Suction pipe length in feet (default: 15)
  --elev <feet>         Static elevation delta in feet (default: 25)
  --material <id>       Material ID: cs_a106_b, cs_a53_b, ss_304, ss_316, hdpe_pe100, frp, copper_k, cs_a333_6 (default: cs_a106_b)
  --temp <degF>         Fuel temperature in °F (default: 68)
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

function parseArgs(args: string[]) {
  const options: Record<string, any> = {};
  let command = 'help';

  let i = 0;
  if (args.length > 0 && !args[0].startsWith('-')) {
    command = args[0];
    i = 1;
  }

  for (; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    }
  }

  return { command, options };
}

function runCalc(options: Record<string, any>) {
  // Parse inputs
  let flowGpm = Number(options.flow || (options['flow-m3h'] ? Number(options['flow-m3h']) * 4.40287 : 100));
  if (isNaN(flowGpm) || flowGpm <= 0) flowGpm = 100;
  const flowM3h = flowGpm / 4.40287;

  const dischargeNps = String(options.dia || options.nps || '3');
  const dischargeSched = String(options.sched || '40');
  const dischargeLengthFt = Number(options.length || (options['length-m'] ? Number(options['length-m']) * 3.28084 : 150));
  const dischargeLengthM = dischargeLengthFt / 3.28084;

  const suctionNps = String(options['suction-dia'] || options['suction-nps'] || dischargeNps);
  const suctionSched = String(options['suction-sched'] || dischargeSched);
  const suctionLengthFt = Number(options['suction-length'] || 15);
  const suctionLengthM = suctionLengthFt / 3.28084;

  const elevFt = Number(options.elev || 25);
  const elevM = elevFt / 3.28084;

  const tempF = Number(options.temp || 68);
  const tempC = (tempF - 32) * (5 / 9);

  const matInput = String(options.material || 'cs_a106_b').toLowerCase();
  const material = PIPE_MATERIALS.find(m => m.id.toLowerCase() === matInput) ||
                   PIPE_MATERIALS.find(m => m.id.toLowerCase().includes(matInput)) ||
                   PIPE_MATERIALS.find(m => m.name.toLowerCase().includes(matInput)) ||
                   PIPE_MATERIALS[0];

  let fuelType: any = 'Diesel #2 (ULSD)';
  const fuelParam = String(options.fuel || '').toUpperCase();
  if (fuelParam.includes('KERO') || fuelParam.includes('1')) {
    fuelType = 'Diesel #1 (Kerosene/Arctic)';
  } else if (fuelParam.includes('BIO') || fuelParam.includes('B20')) {
    fuelType = 'Biodiesel B20';
  } else if (fuelParam.includes('MGO') || fuelParam.includes('MARINE')) {
    fuelType = 'Marine Gas Oil (MGO)';
  }

  // Standard fitting set for diesel distribution
  const defaultFittings: FittingItem[] = [
    { id: '1', name: '90° Standard Elbow', type: 'elbow_90_standard', kValue: 0.75, count: 4, location: 'discharge' },
    { id: '2', name: 'Ball Valve (Full Port)', type: 'valve_ball_full', kValue: 0.05, count: 2, location: 'discharge' },
    { id: '3', name: 'Swing Check Valve', type: 'valve_check_swing', kValue: 2.0, count: 1, location: 'discharge' },
    { id: '4', name: 'Flow Switch (Paddle Type)', type: 'flow_switch', kValue: 1.8, count: 1, location: 'discharge' },
    { id: '5', name: 'Basket Strainer (Clean 40-mesh)', type: 'strainer_basket', kValue: 1.5, count: 1, location: 'suction' },
    { id: '6', name: '90° Long Radius Elbow', type: 'elbow_90_long_radius', kValue: 0.45, count: 2, location: 'suction' },
  ];

  const results = calculateSystemHydraulics({
    flowRateM3h: flowM3h,
    suctionNps,
    suctionSchedule: suctionSched,
    suctionLengthM,
    suctionMaterial: material,
    suctionElevDeltaM: 1.0, // 1m suction lift
    dischargeNps,
    dischargeSchedule: dischargeSched,
    dischargeLengthM,
    dischargeMaterial: material,
    dischargeElevDeltaM: elevM,
    fittings: defaultFittings,
    dieselType: fuelType,
    dieselTempC: tempC,
    pumpEfficiencyPct: 65,
    pumpNpshrM: 2.5,
  });

  const format = String(options.format || 'text').toLowerCase();

  if (format === 'json') {
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
        fuel: fuelType,
      },
      hydraulics: results,
    }, null, 2);

    if (options.out) {
      fs.writeFileSync(options.out, jsonOutput, 'utf-8');
      console.log(`Results saved to ${options.out}`);
    } else {
      console.log(jsonOutput);
    }
    return;
  }

  if (format === 'csv') {
    const csvLines = [
      'Parameter,Value,Unit',
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
      `NPSH Margin Status,${results.npshStatus},-`,
    ].join('\n');

    if (options.out) {
      fs.writeFileSync(options.out, csvLines, 'utf-8');
      console.log(`Results CSV saved to ${options.out}`);
    } else {
      console.log(csvLines);
    }
    return;
  }

  // Text report
  console.log(BANNER);
  console.log(`PROJECT / CALCULATION SUMMARY:`);
  console.log(`------------------------------------------------------------------------`);
  console.log(`Flow Rate           : ${flowGpm.toFixed(2)} US GPM (${flowM3h.toFixed(2)} m³/h)`);
  console.log(`Discharge Piping    : ${dischargeNps}" NPS Sch ${dischargeSched} (${material.name})`);
  console.log(`Discharge Length    : ${dischargeLengthFt.toFixed(1)} ft (${dischargeLengthM.toFixed(1)} m)`);
  console.log(`Static Head Delta   : ${elevFt.toFixed(1)} ft (${elevM.toFixed(1)} m)`);
  console.log(`Fuel Grade          : ${fuelType} @ ${tempF}°F (${tempC.toFixed(1)}°C)`);
  console.log(`Fluid Properties    : Density = ${results.fluid.computedDensityKgM3.toFixed(1)} kg/m³, Viscosity = ${results.fluid.computedViscosityCSt.toFixed(2)} cSt`);
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
  results.asmeCompliance.messages.forEach(msg => {
    console.log(`  [${msg.type.toUpperCase()}] ${msg.message}`);
  });
  console.log(`------------------------------------------------------------------------\n`);

  if (options.out) {
    const reportText = `Diesel Piping & Pump Workstation - Calculation Report\nDate: ${new Date().toISOString()}\nFlow: ${flowGpm} GPM\nTotal Head: ${(results.totalDynamicHeadM * 3.28084).toFixed(2)} ft\nDifferential Pressure: ${results.totalDynamicHeadPsi.toFixed(2)} psi\nMAWP: ${(results.dischargeMawpBar * 14.5038).toFixed(1)} psi\nStatus: ${results.asmeCompliance.status}\n`;
    fs.writeFileSync(options.out, reportText, 'utf-8');
    console.log(`Report summary saved to ${options.out}`);
  }
}

function listMaterials() {
  console.log(BANNER);
  console.log(`ASME B31.3 PROCESS PIPING MATERIALS DATABASE`);
  console.log(`========================================================================================`);
  console.log(
    `ID`.padEnd(14) +
    `Specification`.padEnd(36) +
    `Allowable Stress`.padEnd(18) +
    `Roughness (ε)`.padEnd(16) +
    `Temp Range`
  );
  console.log(`----------------------------------------------------------------------------------------`);
  for (const m of PIPE_MATERIALS) {
    console.log(
      `${m.id}`.padEnd(14) +
      `${m.name.slice(0, 34)}`.padEnd(36) +
      `${(m.allowableStressMpa * 145.038).toFixed(0)} psi`.padEnd(18) +
      `${(m.absoluteRoughnessMm * 1000).toFixed(1)} µm`.padEnd(16) +
      `${m.minTempC}°C to ${m.maxTempC}°C`
    );
  }
  console.log(`========================================================================================\n`);
}

function listPumps() {
  console.log(BANNER);
  console.log(`STANDARD INDUSTRIAL DIESEL FUEL PUMPS DATABASE`);
  console.log(`========================================================================================`);
  console.log(
    `Manufacturer & Model`.padEnd(36) +
    `Type`.padEnd(20) +
    `Rated Flow (m³/h)`.padEnd(20) +
    `Rated Head (m)`
  );
  console.log(`----------------------------------------------------------------------------------------`);
  for (const p of PREDEFINED_PUMPS) {
    console.log(
      `${p.manufacturer} ${p.model.slice(0, 20)}`.padEnd(36) +
      `${p.type.slice(0, 18)}`.padEnd(20) +
      `${p.ratedFlowM3h} m³/h (${(p.ratedFlowM3h * 4.40287).toFixed(0)} GPM)`.padEnd(20) +
      `${p.ratedHeadM} m (${(p.ratedHeadM * 3.28084).toFixed(0)} ft)`
    );
  }
  console.log(`========================================================================================\n`);
}

function runServer(options: Record<string, any>) {
  const port = Number(options.port || 3000);
  const host = String(options.host || '0.0.0.0');

  // Find dist directory
  const possiblePaths = [
    path.join(__dirname, '../../dist'),
    path.join(__dirname, '../dist'),
    path.join(__dirname, 'dist'),
    path.join(process.cwd(), 'dist'),
  ];
  let distDir = possiblePaths.find(p => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html')));

  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webmanifest': 'application/manifest+json',
    '.wasm': 'application/wasm',
  };

  const server = http.createServer((req, res) => {
    let reqUrl = req.url || '/';
    let pathname = reqUrl.split('?')[0];
    if (pathname === '/') pathname = '/index.html';

    if (!distDir) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
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

    const filePath = path.join(distDir, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // SPA Fallback
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(indexPath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('File Not Found');
      }
    }
  });

  server.listen(port, host, () => {
    console.log(BANNER);
    console.log(`Standalone Offline Server running at: http://localhost:${port}/`);
    console.log(`Serving offline workstation application... Press Ctrl+C to terminate.\n`);
  });
}

// Main execution
const rawArgs = process.argv.slice(2);
const { command, options } = parseArgs(rawArgs);

if (options.help || command === 'help' || rawArgs.length === 0) {
  printHelp();
} else if (command === 'calc') {
  runCalc(options);
} else if (command === 'serve') {
  runServer(options);
} else if (command === 'materials') {
  listMaterials();
} else if (command === 'pumps') {
  listPumps();
} else {
  // If user passed flags directly without subcommand, default to calc
  if (options.flow || options.dia || options.length) {
    runCalc(options);
  } else {
    console.log(`Unknown command: ${command}`);
    printHelp();
  }
}
