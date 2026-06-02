#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d storefront ]]; then
  echo "storefront/ not found. Run: npm run setup"
  exit 1
fi

cd storefront

if [[ ! -d node_modules ]]; then
  echo "==> Installing storefront dependencies (pnpm)..."
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm is required. Install: npm i -g pnpm"
    exit 1
  fi
  pnpm install
fi

exec pnpm dev
