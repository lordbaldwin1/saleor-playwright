#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_URL="${SALEOR_API_HEALTH_URL:-http://localhost:8000/health/}"
MAX_ATTEMPTS="${STOREFRONT_BUILD_API_WAIT_ATTEMPTS:-60}"
SLEEP_SECONDS="${STOREFRONT_BUILD_API_WAIT_SLEEP:-5}"

if [[ ! -d "$ROOT/storefront" ]]; then
  echo "storefront/ not found. Run: npm run setup"
  exit 1
fi

cd "$ROOT/storefront"
export SALEOR_E2E=1

if [[ ! -d node_modules ]]; then
  echo "==> Installing storefront dependencies (pnpm)..."
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm is required. Install: npm i -g pnpm"
    exit 1
  fi
  if [[ -n "${CI:-}" ]]; then
    pnpm install --frozen-lockfile
  else
    pnpm install
  fi
fi

echo "==> Waiting for Saleor API (required for GraphQL codegen)..."
for i in $(seq 1 "$MAX_ATTEMPTS"); do
  if curl -sf "$API_URL" >/dev/null; then
    echo "Saleor API is ready"
    break
  fi
  if [[ "$i" -eq "$MAX_ATTEMPTS" ]]; then
    echo "Saleor API not ready at $API_URL — cannot build storefront"
    exit 1
  fi
  echo "Waiting for Saleor API... ($i/$MAX_ATTEMPTS)"
  sleep "$SLEEP_SECONDS"
done

echo "==> Building storefront (production)..."
pnpm build
