#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/storefront"

if [[ ! -d node_modules ]]; then
  pnpm install --frozen-lockfile
fi

pnpm dev > "$ROOT/storefront-dev.log" 2>&1 &
echo $! > "$ROOT/storefront-dev.pid"
echo "Storefront dev server started (pid $(cat "$ROOT/storefront-dev.pid"))"
