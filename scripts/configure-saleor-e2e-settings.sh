#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ ! -d "$ROOT/saleor-platform" ]]; then
  echo "saleor-platform/ not found. Run: npm run setup"
  exit 1
fi

cd "$ROOT/saleor-platform"

echo "==> Configuring Saleor for E2E (disable account email confirmation)..."
docker compose run --rm api python3 manage.py shell -c "
from saleor.site.models import SiteSettings
settings = SiteSettings.objects.first()
if settings is not None:
    settings.enable_account_confirmation_by_email = False
    settings.save(update_fields=['enable_account_confirmation_by_email'])
"
