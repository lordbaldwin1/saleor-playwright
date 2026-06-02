#!/usr/bin/env bash
set -euo pipefail

API_URL="${SALEOR_API_HEALTH_URL:-http://localhost:8000/health/}"
DASHBOARD_URL="${SALEOR_DASHBOARD_URL:-http://localhost:9000/}"
STOREFRONT_URL="${SALEOR_STOREFRONT_URL:-http://localhost:3000/}"
WAIT_STOREFRONT="${WAIT_STOREFRONT:-0}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-60}"
SLEEP_SECONDS="${SLEEP_SECONDS:-5}"

for i in $(seq 1 "$MAX_ATTEMPTS"); do
  api_ok=0
  dashboard_ok=0
  storefront_ok=0

  curl -sf "$API_URL" >/dev/null && api_ok=1
  curl -sf -o /dev/null "$DASHBOARD_URL" && dashboard_ok=1

  if [[ "$WAIT_STOREFRONT" == "1" ]]; then
    curl -sf -o /dev/null "$STOREFRONT_URL" && storefront_ok=1
  else
    storefront_ok=1
  fi

  if [[ "$api_ok" == "1" && "$dashboard_ok" == "1" && "$storefront_ok" == "1" ]]; then
    echo "All required services are ready"
    exit 0
  fi

  echo "Waiting for services... ($i/$MAX_ATTEMPTS) api=$api_ok dashboard=$dashboard_ok storefront=$storefront_ok"
  sleep "$SLEEP_SECONDS"
done

echo "Services did not become ready in time"
if [[ -d saleor-platform ]]; then
  docker compose -f saleor-platform/docker-compose.yml ps || true
  docker compose -f saleor-platform/docker-compose.yml logs --tail=80 api worker db || true
fi
if [[ -f storefront-dev.log ]]; then
  echo "--- storefront dev log (tail) ---"
  tail -80 storefront-dev.log || true
fi
exit 1
