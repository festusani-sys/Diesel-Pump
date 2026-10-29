import React, { useState } from 'react';
import {
  Terminal,
  Download,
  Copy,
  Check,
  Cpu,
  MonitorDown,
  Layers,
  HardDrive,
  X,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface StandaloneExecutableModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
}

export const StandaloneExecutableModal: React.FC<StandaloneExecutableModalProps> = ({
  isOpen,
  onClose,
  isOnline,
}) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadScript = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadSh = () => {
    const content = `#!/usr/bin/env bash
# Diesel Piping & Pump Workstation - Standalone Launcher
# ASME B31.3 Process Piping & Darcy-Weisbach Hydraulic Analysis
set -e
DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$DIR/diesel-workstation" ] && [ -x "$DIR/diesel-workstation" ]; then
  exec "$DIR/diesel-workstation" "$@"
elif [ -f "$DIR/bin/cli.cjs" ]; then
  exec node "$DIR/bin/cli.cjs" "$@"
else
  echo "Error: diesel-workstation executable not found in $DIR"
  exit 1
fi
`;
    downloadScript('diesel-workstation.sh', content);
  };

  const handleDownloadBat = () => {
    const content = `@echo off
REM Diesel Piping & Pump Workstation - Windows Launcher
REM ASME B31.3 Process Piping & Darcy-Weisbach Hydraulic Analysis
setlocal
set SCRIPT_DIR=%~dp0

if exist "%SCRIPT_DIR%diesel-workstation.exe" (
  "%SCRIPT_DIR%diesel-workstation.exe" %*
) else if exist "%SCRIPT_DIR%bin\\cli.cjs" (
  node "%SCRIPT_DIR%bin\\cli.cjs" %*
) else (
  echo Error: Workstation executable not found in %SCRIPT_DIR%
  pause
)
`;
    downloadScript('diesel-workstation.bat', content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                Standalone Executable & Offline Capabilities
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Full Engine Ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Run natively on your machine without internet or browser dependencies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Status Alert Banner */}
          <div className="bg-slate-800/60 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-medium text-slate-200">
                100% Client-Side & Standalone Hydraulic Calculation Engine
              </div>
              <p className="text-slate-400 leading-relaxed">
                All Darcy-Weisbach calculations, Colebrook-White friction iterations, ASME B31.3 MAWP
                checks, and pump curve matching execute locally in pure machine code with zero network requests.
              </p>
            </div>
          </div>

          {/* Option 1: Native Standalone Binary & Executable Launcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                1. Standalone Binary Executable & CLI
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadSh}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition"
                  title="Download Linux/macOS launcher script"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  diesel-workstation.sh
                </button>
                <button
                  onClick={handleDownloadBat}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 py-1 rounded flex items-center gap-1.5 transition"
                  title="Download Windows launcher batch script"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  diesel-workstation.bat
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              The project includes a standalone compiled binary executable (`diesel-workstation`) and runner scripts:
            </p>

            <div className="space-y-2">
              {/* Command 1: Quick Calc */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-xs flex items-center justify-between">
                <div className="overflow-x-auto text-emerald-300">
                  ./diesel-workstation calc --flow 100 --dia 3 --length 150 --elev 25
                </div>
                <button
                  onClick={() =>
                    copyCommand(
                      './diesel-workstation calc --flow 100 --dia 3 --length 150 --elev 25',
                      1
                    )
                  }
                  className="ml-3 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition shrink-0"
                  title="Copy command"
                >
                  {copiedIndex === 1 ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Command 2: JSON Export */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-xs flex items-center justify-between">
                <div className="overflow-x-auto text-emerald-300">
                  ./diesel-workstation calc --flow 75 --material ss_316 --format json --out results.json
                </div>
                <button
                  onClick={() =>
                    copyCommand(
                      './diesel-workstation calc --flow 75 --material ss_316 --format json --out results.json',
                      2
                    )
                  }
                  className="ml-3 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition shrink-0"
                  title="Copy command"
                >
                  {copiedIndex === 2 ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Command 3: Offline GUI Server */}
              <div className="bg-slate-950 border border-slate-800 rounded p-3 font-mono text-xs flex items-center justify-between">
                <div className="overflow-x-auto text-emerald-300">
                  ./diesel-workstation serve --port 3000
                </div>
                <button
                  onClick={() => copyCommand('./diesel-workstation serve --port 3000', 3)}
                  className="ml-3 text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition shrink-0"
                  title="Copy command"
                >
                  {copiedIndex === 3 ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Option 2: Standalone Desktop PWA Window */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <MonitorDown className="w-4 h-4 text-blue-400" />
              2. Install as Standalone Desktop App (PWA)
            </h4>
            <p className="text-xs text-slate-400">
              Installs Diesel Piping & Pump Workstation directly to your desktop or taskbar as an independent window with offline precaching.
            </p>

            <div className="bg-slate-800/40 border border-slate-700/80 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-white">
                  {isInstalled
                    ? 'Installed as Standalone Desktop App'
                    : 'Desktop Application Mode'}
                </div>
                <div className="text-xs text-slate-400">
                  {isInstalled
                    ? 'Workstation is running in native desktop window with full offline caching.'
                    : 'Launches from desktop icon, runs without browser tabs or address bar.'}
                </div>
              </div>

              {isInstallable ? (
                <button
                  onClick={install}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-md shadow flex items-center gap-2 transition"
                >
                  <MonitorDown className="w-4 h-4" />
                  Install Workstation App
                </button>
              ) : isInstalled ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded">
                  <Check className="w-4 h-4" /> Installed & Active
                </span>
              ) : isIOS ? (
                <span className="text-xs text-slate-400">
                  Tap <span className="font-semibold text-slate-200">Share</span> &rarr;{' '}
                  <span className="font-semibold text-slate-200">Add to Home Screen</span>
                </span>
              ) : (
                <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Offline Cache Ready
                </span>
              )}
            </div>
          </div>

          {/* Engine Specs */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded p-3">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Colebrook-White Solver
              </div>
              <div className="text-slate-400 text-[11px]">
                Iterative Newton-Raphson friction factor solution running in &lt;1 ms.
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded p-3">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                ASME B31.3 Table A-1
              </div>
              <div className="text-slate-400 text-[11px]">
                Embedded materials database including carbon steel, stainless, HDPE, and FRP.
              </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded p-3">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Zero Cloud Dependencies
              </div>
              <div className="text-slate-400 text-[11px]">
                PDF sign-off, CSV exports, 3D pipe network, and pump curves all run offline.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <div>Binary Location: <code className="text-emerald-400">./diesel-workstation</code></div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
