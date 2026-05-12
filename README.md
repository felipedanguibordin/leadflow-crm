# LeadFlow CRM

Enterprise-ready lead management platform for distributor teams — fullstack TypeScript (Angular + NestJS), RBAC-oriented design, and infrastructure that reads like a real SaaS product.

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-1976d2?logo=angular&logoColor=white" alt="Angular 19" />
  <img src="https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-dc382d?logo=redis&logoColor=white" alt="Redis" />
</p>

## Screenshots

Add PNG captures under [`docs/screenshots/`](docs/screenshots/) (for example `dashboard.png`, `swagger.png`) and embed them in this section. Recommended flow:

1. Run the web app and capture the shell (`Win+Shift+S` / screenshot tool).
2. Open Swagger at `http://localhost:3000/api/docs` and capture the page.
3. Save files under `docs/screenshots/` and use standard Markdown image syntax.

Example after you have assets:

```md
| Dashboard                                    | Swagger                                  |
| -------------------------------------------- | ---------------------------------------- |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Swagger](docs/screenshots/swagger.png) |
```

## Architecture

```text
┌──────────────┐     HTTPS / REST      ┌──────────────┐
│   Angular    │ ◄──────────────────► │    NestJS    │
│  (Material)  │      JWT (soon)     │  Swagger UI  │
└──────────────┘                       └──────┬───────┘
                                            │
                    ┌───────────────────────┼────────────────────────┐
                    ▼                       ▼                        ▼
            ┌──────────────┐        ┌──────────────┐         ┌──────────────┐
            │ PostgreSQL   │        │    Redis     │         │ MinIO (S3)  │
            │   (leads)    │        │   (cache)    │         │  (uploads)  │
            └──────────────┘        └──────────────┘         └──────────────┘
```

**Angular (apps/web)** — SPA with Angular Material, standalone components, RxJS, and **signals** for shell state. Dev server proxies `/api` to the backend.

**NestJS (apps/api)** — Modular API with global prefix `api/v1`, **Swagger** at `/api/docs`, validation pipeline ready for DTOs, **TypeORM** + PostgreSQL, **ioredis** client, and Terminus **health** checks.

**Data & infra** — `docker-compose.yml` runs PostgreSQL 16, Redis 7, and MinIO for S3-compatible uploads locally.

## Tech stack

| Layer          | Choices                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Frontend       | Angular 19+, Angular Material, RxJS, Signals, **ng2-charts** + **Chart.js** (dashboard)                |
| Backend        | NestJS 11, TypeScript, JWT-ready (`@nestjs/jwt`, `@nestjs/passport`), Swagger, `class-validator` ready |
| Database       | PostgreSQL (TypeORM)                                                                                   |
| Cache          | Redis                                                                                                  |
| Object storage | MinIO (local S3-compatible)                                                                            |
| Tooling        | ESLint + Prettier, Husky + lint-staged, Docker Compose                                                 |
| CI             | GitHub Actions (`/.github/workflows/ci.yml`)                                                           |

## Features

**Phase 1 — Base**

- Monorepo **npm workspaces** (`apps/api`, `apps/web`), Docker Compose (Postgres, Redis, MinIO)
- NestJS: Swagger (`/api/docs`), **centralized** `ValidationPipe` config, CORS, health checks
- Angular shell with Material, proxy to API, Husky + lint-staged, GitHub Actions CI

**Phases 4–5 — Enterprise slice (this repo)**

- **Organizations** (tenants) and **workspace users** (activity / “active users” KPI)
- **Finance**: boletos / invoices as `payables` (`BOLETO` \| `INVOICE`), **PENDING** → **PAID** settlement
- **Delinquency**: pluggable **`DelinquencyPolicy`** + **`FinancialComplianceService`**; **`DelinquencyGuard`** blocks **POST/PATCH/DELETE** on leads while any payable is **PENDING**; reads (GET leads) stay allowed
- **`DelinquencyContextMiddleware`** attaches a read-only snapshot on lead routes (`req.delinquency`) for auditing / future logging
- **Leads** CRUD under `organizations/:organizationId/leads` (pipeline statuses: NEW → … → WON \| LOST)
- **Analytics** `GET /api/v1/analytics/dashboard?organizationId=` — leads/month, conversion, finance counters, active users (30d)
- **Dashboard** (`/dashboard`): KPI cards + line + doughnut charts (Chart.js)

**Still roadmap (e.g. Phases 2–3)**

- JWT + refresh, remember-me, RBAC guards on the client, audit log persistence
- Lead notes/history/attachments to MinIO, CSV export, advanced filters
- Realtime notifications

## Repository layout

```text
apps/
  api/          NestJS REST API
  web/          Angular SPA
docker-compose.yml
package.json    npm workspaces + shared scripts
docs/screenshots/   (add your PNGs here)
```

## Prerequisites

- **Node.js 20+** (CI uses 22)
- **Docker Desktop** (or Docker Engine + Compose v2) for Postgres, Redis, MinIO
- **npm** 10+

## Environment variables

Copy the API example and adjust:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable      | Purpose                                  |
| ------------- | ---------------------------------------- |
| `PORT`        | API port (default `3000`)                |
| `DB_*`        | PostgreSQL connection                    |
| `REDIS_URL`   | Redis connection string                  |
| `JWT_*`       | Secrets and expiry (wired in Phase 2)    |
| `S3_*`        | MinIO / S3 endpoint and bucket (uploads) |
| `CORS_ORIGIN` | Comma-separated browser origins          |

Root `.env.example` only documents Compose metadata; the API uses `apps/api/.env`.

## Running locally

**1. Start infrastructure**

```bash
docker compose up -d
```

Wait for Postgres and Redis to be healthy. Create the MinIO bucket once (console: http://localhost:9001, user `minio` / `leadflow-uploads` bucket — see MinIO docs) or automate with `mc` in a later task.

**2. Install dependencies** (from repo root)

```bash
npm install
```

**3. API**

```bash
copy apps\api\.env.example apps\api\.env   # Windows — or `cp` on Unix
npm run dev:api
```

- REST base: http://localhost:3000/api/v1
- Swagger UI: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/v1/health

**4. Web**

```bash
npm run dev:web
```

Open http://localhost:4200 — requests to `/api/*` are proxied to the API.

The **Dashboard** needs at least one organization (create via `POST /api/v1/organizations` in Swagger or `curl`). Optionally add workspace users and ping activity: `POST …/workspace-users` and `POST …/workspace-users/:id/ping`.

For automated tests, API e2e uses an **in-memory SQLite** database (`E2E_TEST=true` via Jest setup) so CI does not require Docker for Postgres. Local development still uses PostgreSQL from Compose.

Interactive OpenAPI UI is served at **`/api/docs`** with Bearer auth placeholder for upcoming JWT.

## Scripts (root)

| Script                              | Description                       |
| ----------------------------------- | --------------------------------- |
| `npm run dev:api`                   | NestJS watch mode                 |
| `npm run dev:web`                   | Angular dev server + proxy        |
| `npm run build`                     | Production builds for API and web |
| `npm run lint`                      | ESLint for both workspaces        |
| `npm run format`                    | Prettier write                    |
| `npm run docker:up` / `docker:down` | Compose shortcuts                 |

## Docker image (API)

A starter multi-stage `Dockerfile` lives in `apps/api/Dockerfile` (context = `apps/api`). For a full production setup, add a web tier (e.g. nginx serving `ng build` output) and wire env/secrets — see “Manual follow-ups” below.

## Roadmap

| Phase | Focus                                                                | Status                 |
| ----- | -------------------------------------------------------------------- | ---------------------- |
| **1** | Monorepo, Docker, Swagger, health, Angular shell, CI, docs           | Delivered              |
| **2** | JWT, refresh, RBAC, audit logs, remember-me                          | Planned                |
| **3** | Lead notes/history, MinIO attachments, filters, CSV export           | Planned                |
| **4** | Delinquency policy, compliance service, guard + middleware on writes | Delivered (core slice) |
| **5** | Analytics API + dashboard charts (KPIs)                              | Delivered              |

---

### Manual follow-ups (not automated in this repo)

Do these outside the assistant session when you publish the portfolio:

1. **Create the GitHub repository** — `git remote add origin …`, push `main`, enable branch protection if you want.
2. **Replace screenshot placeholders** — capture the Angular shell and Swagger UI, save as `docs/screenshots/dashboard.png` and `swagger.png`, commit.
3. **Optional Tailwind** — `cd apps/web && npx ng add @tailwindcss/typography` (or official Tailwind v4 + Angular guide) if you want utility-first styling alongside Material.
4. **MinIO bucket** — create `leadflow-uploads` (or match `S3_BUCKET`) via console or CLI before upload features land.
5. **Production deploy** — e.g. Railway/Fly/Render/AWS: provision Postgres + Redis, set env vars, build `npm run build`, run API with `node dist/main.js`, serve Angular static files behind HTTPS.
6. **Dependabot / npm audit** — review high-severity advisories from hoisted deps and apply safe upgrades (`npm audit`).

## License

Private / proprietary — adjust as needed for your portfolio (`UNLICENSED` in workspace packages).
