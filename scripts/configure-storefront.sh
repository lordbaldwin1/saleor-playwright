#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d storefront ]]; then
  echo "storefront/ not found. Clone it first (npm run setup)."
  exit 1
fi

if [[ ! -f storefront/.env ]]; then
  if [[ -f storefront/.env.example ]]; then
    cp storefront/.env.example storefront/.env
  else
    touch storefront/.env
  fi
fi

if grep -q '^NEXT_PUBLIC_SALEOR_API_URL=' storefront/.env 2>/dev/null; then
  if [[ "$(uname)" == "Darwin" ]]; then
    sed -i '' 's|^NEXT_PUBLIC_SALEOR_API_URL=.*|NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/|' storefront/.env
  else
    sed -i 's|^NEXT_PUBLIC_SALEOR_API_URL=.*|NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/|' storefront/.env
  fi
else
  echo 'NEXT_PUBLIC_SALEOR_API_URL=http://localhost:8000/graphql/' >> storefront/.env
fi

if ! grep -q '^NEXT_PUBLIC_DEFAULT_CHANNEL=' storefront/.env 2>/dev/null; then
  echo 'NEXT_PUBLIC_DEFAULT_CHANNEL=default-channel' >> storefront/.env
fi

node scripts/patch-storefront-next-config.mjs
