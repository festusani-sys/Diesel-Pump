@echo off
REM =========================================================================
REM Diesel Piping & Pump Workstation - Windows Executable Launcher
REM ASME B31.3 Process Piping & Darcy-Weisbach Hydraulic Analysis Engine
REM =========================================================================

setlocal
set SCRIPT_DIR=%~dp0

if exist "%SCRIPT_DIR%diesel-workstation.exe" (
  "%SCRIPT_DIR%diesel-workstation.exe" %*
) else if exist "%SCRIPT_DIR%bin\cli.cjs" (
  node "%SCRIPT_DIR%bin\cli.cjs" %*
) else (
  echo Error: Workstation executable or scripts not found in %SCRIPT_DIR%
  pause
)
