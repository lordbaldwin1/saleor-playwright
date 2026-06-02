#!/usr/bin/env bash
# Start dummy payment app, wait for it, install into Saleor (CI / E2E_START_SERVERS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bash "$ROOT/scripts/start-dummy-payment-app.sh"

WAIT_PAYMENT_APP=1 bash "$ROOT/scripts/wait-for-services.sh"

# API must be up before install (caller should start Saleor first)
node "$ROOT/scripts/install-dummy-payment-app.mjs"

echo "Dummy payment app ready and installed"

# Keep the background process alive for Playwright webServer
wait "$(cat "$ROOT/dummy-payment-app-dev.pid")"
