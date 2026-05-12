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

| Layer          | Choices                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Frontend       | Angular 19+, Angular Material, RxJS, Signals (`@angular/core`), optional Tailwind (not installed by default) |
| Backend        | NestJS 11, TypeScript, JWT-ready (`@nestjs/jwt`, `@nestjs/passport`), Swagger, `class-validator` ready       |
| Database       | PostgreSQL (TypeORM)                                                                                         |
| Cache          | Redis                                                                                                        |
| Object storage | MinIO (local S3-compatible)                                                                                  |
| Tooling        | ESLint + Prettier, Husky + lint-staged, Docker Compose                                                       |
| CI             | GitHub Actions (`/.github/workflows/ci.yml`)                                                                 |

## Features

**Implemented (Phase 1 — base)**

- Monorepo with **npm workspaces** (`apps/api`, `apps/web`)
- **Docker Compose**: Postgres, Redis, MinIO
- NestJS: **Swagger**, **global validation pipe**, **CORS**, **health** endpoint (`/api/v1/health`)
- Angular: **Material** shell, **signals**, API connectivity indicator, proxy to backend
- **ESLint** + **Prettier** + **Husky** pre-commit formatting on staged files
- **CI** workflow: install → lint → build (with Postgres & Redis services)

**Planned (Phases 2–3 — roadmap)**

- JWT access + refresh, **remember me**, session expiration UX, **roles** `ADMIN` · `DISTRIBUTOR` · `EMPLOYEE`
- Guards & interceptors (backend + frontend), **audit logs**
- Leads **CRUD**, pipeline status, notes, **history**, **attachments** (S3/MinIO)
- **Tenant rule**: distributors see **only their leads**
- **Filters**, pagination, debounced search, **CSV export**
- **Delinquency / billing** rules to block inadimplentes (business rules + admin flags)
- Dashboard **metrics** and (optional) realtime notifications

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

| Phase | Focus                                                      | Status                      |
| ----- | ---------------------------------------------------------- | --------------------------- |
| **1** | Monorepo, Docker, Swagger, health, Angular shell, CI, docs | **In progress / delivered** |
| **2** | JWT, refresh, RBAC, users, audit logs, remember-me         | Planned                     |
| **3** | Leads domain, pipeline, attachments, filters, CSV export   | Planned                     |

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
