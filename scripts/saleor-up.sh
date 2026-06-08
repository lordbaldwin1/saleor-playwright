#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d saleor-platform ]]; then
  echo "saleor-platform/ not found. Run: npm run setup"
  exit 1
fi

cd saleor-platform

if [[ ! -f "$ROOT/.saleor-init-done" ]]; then
  echo "First run: initializing database (npm run saleor:init)..."
  bash "$ROOT/scripts/saleor-init.sh"
fi

node "$ROOT/scripts/patch-saleor-platform-docker.mjs"
bash "$ROOT/scripts/configure-saleor-e2e-settings.sh"
echo "==> Starting Saleor platform (API :8000, Dashboard :9000)..."
docker compose up
