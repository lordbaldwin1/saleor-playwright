#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Cloning saleor-platform (API + Dashboard + infra)..."
if [[ ! -d saleor-platform ]]; then
  git clone --depth 1 https://github.com/saleor/saleor-platform.git saleor-platform
else
  echo "    saleor-platform/ already exists, skipping clone"
fi

echo "==> Cloning Saleor storefront..."
if [[ ! -d storefront ]]; then
  git clone --depth 1 https://github.com/saleor/storefront.git storefront
else
  echo "    storefront/ already exists, skipping clone"
fi

bash "$ROOT/scripts/configure-storefront.sh"

if [[ -f .env.example && ! -f .env ]]; then
  cp .env.example .env
  echo "==> Created .env from .env.example"
fi

echo ""
echo "Next steps:"
echo "  1. npm install && npx playwright install chromium"
echo "  2. npm run saleor:init    # migrate + sample data (Docker, first time)"
echo "  3. npm run saleor:up      # API :8000, Dashboard :9000"
echo "  4. cd storefront && pnpm install && cd .. && npm run storefront:dev"
echo "  5. npm test"
