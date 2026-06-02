#!/usr/bin/env bash
# Used when E2E_START_SERVERS=1 — detached compose for Playwright webServer
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d saleor-platform ]]; then
  echo "saleor-platform/ not found. Run: npm run setup"
  exit 1
fi

cd saleor-platform

if [[ ! -f "$ROOT/.saleor-init-done" ]]; then
  bash "$ROOT/scripts/saleor-init.sh"
fi

node "$ROOT/scripts/patch-saleor-platform-docker.mjs"
docker compose up -d
