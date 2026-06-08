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

echo "==> Cloning Saleor dummy payment app..."
if [[ ! -d dummy-payment-app ]]; then
  git clone --depth 1 https://github.com/saleor/dummy-payment-app.git dummy-payment-app
else
  echo "    dummy-payment-app/ already exists, skipping clone"
fi

bash "$ROOT/scripts/configure-storefront.sh"
bash "$ROOT/scripts/configure-dummy-payment-app.sh"
node "$ROOT/scripts/patch-saleor-platform-docker.mjs"

if [[ -f .env.example && ! -f .env ]]; then
  cp .env.example .env
  echo "==> Created .env from .env.example"
fi

echo ""
echo "Next steps:"
echo "  1. npm install && npx playwright install chromium"
echo "  2. npm run saleor:init    # migrate + sample data (Docker, first time)"
echo "  3. npm run saleor:up      # API :8000, Dashboard :9000"
echo "  4. cd storefront && pnpm install && cd .. && npm run storefront:prod"
echo "  5. cd dummy-payment-app && pnpm install && cd .. && npm run payment-app:dev"
echo "  6. npm run payment-app:install   # register app in Saleor (after API + payment app are up)"
echo "  7. npm test"
