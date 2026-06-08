#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! bash "$ROOT/scripts/build-storefront.sh" > "$ROOT/storefront-build.log" 2>&1; then
  echo "Storefront production build failed. See storefront-build.log:"
  tail -100 "$ROOT/storefront-build.log" || true
  exit 1
fi

cd "$ROOT/storefront"
export SALEOR_E2E=1
pnpm start > "$ROOT/storefront.log" 2>&1 &
echo $! > "$ROOT/storefront.pid"
echo "Storefront production server started (pid $(cat "$ROOT/storefront.pid"))"
