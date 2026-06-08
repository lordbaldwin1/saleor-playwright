#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

bash "$ROOT/scripts/build-storefront.sh"

cd "$ROOT/storefront"
export SALEOR_E2E=1
echo "==> Starting storefront (production) on http://localhost:3000 ..."
exec pnpm start
