#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d saleor-platform ]]; then
  echo "saleor-platform/ not found. Run: npm run setup"
  exit 1
fi

cd saleor-platform

echo "==> Pulling Docker images..."
docker compose pull

echo "==> Running migrations..."
docker compose run --rm api python3 manage.py migrate

echo "==> Populating database (sample data + admin@example.com / admin)..."
docker compose run --rm api python3 manage.py populatedb --createsuperuser

touch "$ROOT/.saleor-init-done"
echo "==> Saleor platform initialized."
