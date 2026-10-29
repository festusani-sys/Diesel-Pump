#!/usr/bin/env bash
# =========================================================================
# Diesel Piping & Pump Workstation - Standalone Executable Launcher
# ASME B31.3 Process Piping & Darcy-Weisbach Hydraulic Analysis Engine
# =========================================================================

set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$DIR/diesel-workstation" ] && [ -x "$DIR/diesel-workstation" ]; then
  exec "$DIR/diesel-workstation" "$@"
elif [ -f "$DIR/bin/diesel-workstation" ] && [ -x "$DIR/bin/diesel-workstation" ]; then
  exec "$DIR/bin/diesel-workstation" "$@"
elif [ -f "$DIR/bin/cli.cjs" ]; then
  exec node "$DIR/bin/cli.cjs" "$@"
else
  echo "Error: Diesel Piping Workstation executable not found in $DIR"
  exit 1
fi
