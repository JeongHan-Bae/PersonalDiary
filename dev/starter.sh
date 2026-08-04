#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

if [ ! -d "node_modules" ]; then
  echo "node_modules not found. Installing dependencies first..."
  npm install
fi

exec npm run dev -- --host 0.0.0.0
