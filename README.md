# Saleor E2E (Playwright + TypeScript)

Local end-to-end test harness for [Saleor](https://saleor.io/) **API**, **Dashboard**, and **Storefront**, using [Playwright](https://playwright.dev/).

You write tests under `playwright/tests/`; this repo wires up services, env, and Playwright projects.

## Prerequisites

- **Docker Desktop** (5 GB+ RAM recommended) — [saleor-platform](https://github.com/saleor/saleor-platform)
- **Node.js 20+**
- **pnpm** — for the Saleor storefront (`npm i -g pnpm`)

## Quick start

```bash
cd saleor-e2e
npm install
npx playwright install chromium
cp .env.example .env

# Clone saleor-platform + storefront and wire storefront → local API
npm run setup

# First-time DB migrate + sample data (admin@example.com / admin)
npm run saleor:init

# Terminal 1 — API :8000, Dashboard :9000
npm run saleor:up

# Terminal 2 — Storefront :3000
cd storefront && pnpm install && cd ..
npm run storefront:dev

# Terminal 3 — Dummy payment app :3001 (required for checkout)
cd dummy-payment-app && pnpm install && cd ..
npm run payment-app:dev

# One-time after API + payment app are running
npm run payment-app:install
```

Run tests (with services already up):

```bash
npm test                  # all projects
npm run test:api          # GraphQL via APIRequestContext
npm run test:dashboard    # admin UI
npm run test:storefront   # Next.js storefront
npm run test:ui           # Playwright UI mode
```

## Service URLs

| Service    | URL                          |
| ---------- | ---------------------------- |
| GraphQL API | http://localhost:8000/graphql/ |
| Dashboard  | http://localhost:9000/       |
| Storefront | http://localhost:3000/       |
| Dummy payment app | http://localhost:3001/ |
| Mailpit    | http://localhost:8025/       |

Default admin (after `saleor:init`): `admin@example.com` / `admin`

## Project layout

```
saleor-e2e/
├── playwright.config.ts
├── playwright/
│   ├── config.ts          # URLs + credentials from .env
│   ├── helpers/           # Shared helpers (e.g. graphql.ts)
│   └── tests/
│       ├── api/           # GraphQL / HTTP — project: api
│       ├── dashboard/     # Admin UI — project: dashboard
│       └── storefront/    # Shop UI — project: storefront
├── scripts/               # Docker + storefront dev helpers
├── saleor-platform/       # created by npm run setup (gitignored)
├── storefront/            # created by npm run setup (gitignored)
└── dummy-payment-app/     # created by npm run setup (gitignored)
```

Example specs are included as starting points; storefront/dashboard examples are `test.skip` so `npm test` only runs the API smoke test until you add your own.

## Playwright projects

| Project     | `testDir`                    | `baseURL` env              |
| ----------- | ---------------------------- | -------------------------- |
| `api`       | `playwright/tests/api`       | `SALEOR_API_URL`           |
| `dashboard` | `playwright/tests/dashboard` | `SALEOR_DASHBOARD_URL`     |
| `storefront`| `playwright/tests/storefront`| `SALEOR_STOREFRONT_URL`    |

Configure via `.env` (see `.env.example`).

## Optional: let Playwright start services

For CI or a one-shot local run, set in `.env`:

```env
E2E_START_SERVERS=1
```

Playwright will run `saleor:up:detached`, the dummy payment app, and `storefront:dev` before tests. Locally it is usually easier to keep Docker and dev servers running in separate terminals.

## Dummy payment app (checkout)

Storefront checkout uses [saleor/dummy-payment-app](https://github.com/saleor/dummy-payment-app) for local payments. It runs on **port 3001** (storefront uses 3000). Saleor API runs in Docker and reaches the app via `host.docker.internal` (configured automatically by `npm run setup`).

`npm run setup` also writes `saleor-platform/docker-compose.override.yml` which (1) adds `host.docker.internal` for API/worker containers and (2) sets `HTTP_IP_FILTER_ENABLED=False` so Saleor can install local apps (required per [Saleor local app docs](https://docs.saleor.io/developer/extending/apps/local-app-development)).

```bash
npm run payment-app:dev      # Terminal 3 — start app
npm run payment-app:install  # Register app in Saleor (after saleor:up + payment-app:dev)
```

Re-run `payment-app:install` after wiping the database (`saleor:down` + remove volumes, then `saleor:init`).

## Stopping Saleor

```bash
npm run saleor:down
```

## CI (GitHub Actions)

Workflow: [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml)

On push/PR to `main` (or `master`), CI will:

1. Clone `saleor-platform` and `storefront` (not committed in this repo)
2. Configure storefront `.env` + Next.js local image settings
3. Run migrations + sample data, start Docker
4. Start dummy payment app and install it in Saleor
5. Start storefront (`pnpm dev`)
6. Run **all** Playwright projects (`api`, `dashboard`, `storefront`)

Expect the first CI run to take ~15–25 minutes (Docker pulls, `populatedb`, `pnpm install`, Next.js codegen).

## Publish to GitHub

This folder is not a git repo until you initialize it. `saleor-platform/` and `storefront/` stay **gitignored** (cloned locally via `npm run setup` or by CI).

```bash
cd saleor-e2e
git init
git add .
git commit -m "Initial Saleor Playwright E2E harness"

# Create repo on GitHub (requires gh CLI: https://cli.github.com/)
gh repo create saleor-e2e --private --source=. --remote=origin --push
# Or public:  gh repo create saleor-e2e --public --source=. --remote=origin --push
```

Without `gh`, create an empty repo on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USER/saleor-e2e.git
git branch -M main
git push -u origin main
```

## Notes

- **Product images missing locally?** Next.js 16 blocks `localhost` image URLs by default. This repo sets `images.dangerouslyAllowLocalIP` in `storefront/next.config.js` for development. Restart `pnpm dev` after pulling a fresh storefront clone (or add that setting yourself).
- **saleor-platform** ships API + Dashboard only; the **storefront** is a separate repo and runs with `pnpm dev`.
- Storefront must point at `http://localhost:8000/graphql/` in `storefront/.env` (`npm run setup` sets this).
- Channel slug for storefront: `default-channel` (from sample data).
- **Checkout payments** require the dummy payment app (`npm run payment-app:dev` + `npm run payment-app:install`).
