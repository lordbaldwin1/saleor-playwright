#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$ROOT/saleor-platform" ]]; then
  echo "saleor-platform/ not found."
  exit 1
fi

cd "$ROOT/saleor-platform"
docker compose down
