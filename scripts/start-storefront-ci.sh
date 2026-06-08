#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bash "$ROOT/scripts/build-storefront.sh" > "$ROOT/storefront-build.log" 2>&1

cd "$ROOT/storefront"
export SALEOR_E2E=1
pnpm start > "$ROOT/storefront.log" 2>&1 &
echo $! > "$ROOT/storefront.pid"
echo "Storefront production server started (pid $(cat "$ROOT/storefront.pid"))"
