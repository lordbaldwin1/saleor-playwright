#!/usr/bin/env bash
# Start dummy payment app in background (CI / E2E_START_SERVERS)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d dummy-payment-app ]]; then
  echo "dummy-payment-app/ not found. Run: npm run setup"
  exit 1
fi

bash "$ROOT/scripts/configure-dummy-payment-app.sh"

PORT="${DUMMY_PAYMENT_APP_PORT:-3001}"

if [[ ! -d dummy-payment-app/node_modules ]]; then
  (cd dummy-payment-app && pnpm install --frozen-lockfile 2>/dev/null || pnpm install)
fi

cd dummy-payment-app
pnpm generate
PORT="$PORT" pnpm exec next dev -p "$PORT" > "$ROOT/dummy-payment-app-dev.log" 2>&1 &
echo $! > "$ROOT/dummy-payment-app-dev.pid"
echo "Dummy payment app started on http://localhost:${PORT} (pid $(cat "$ROOT/dummy-payment-app-dev.pid"))"
