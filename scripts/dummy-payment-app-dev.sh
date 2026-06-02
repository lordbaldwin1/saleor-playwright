#!/usr/bin/env bash
# Foreground dev server for local use (Terminal 3)
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
  echo "==> Installing dummy-payment-app dependencies..."
  (cd dummy-payment-app && pnpm install)
fi

cd dummy-payment-app
pnpm generate
echo "==> Dummy payment app on http://localhost:${PORT}"
exec env PORT="$PORT" pnpm exec next dev -p "$PORT"
