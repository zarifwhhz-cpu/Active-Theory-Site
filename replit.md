# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

- `seed-cms` — populates the CMS tables (`siteSettings`, `projects`, `services`, `awards`, `socialLinks`) with the original Active Theory copy. Re-run safely; uses upsert/idempotent inserts.

### `artifacts/active-theory-site` (`@workspace/active-theory-site`)

React + Vite single-page app — the Active Theory marketing site **plus** an in-app admin CMS at `/admin/*`.

**Public site** (`src/components/*`): Hero, About, Services, Marquee, WorkGrid, Contact, Footer, Navbar. All copy is fetched from `GET /api/content` via the `useContent()` / `useSetting(key)` hooks (`src/hooks/use-content.ts`). No hardcoded marketing strings.

**Admin** (`src/pages/admin/*`):
- `Login.tsx` — single-password sign-in (POST `/api/auth/login`)
- `AdminLayout.tsx` — sidebar nav, auth gate (redirects to `/admin/login` if not signed in), sign-out
- `Dashboard.tsx` — counts + tile links to each editor
- `Settings.tsx` — grouped textarea/input editor for all `siteSettings` keys (PUT `/api/admin/settings`)
- `Projects.tsx`, `Services.tsx`, `Awards.tsx`, `SocialLinks.tsx` — list editors built on the shared `ListEditor` (CRUD against `/api/admin/<resource>`)

**API client** (`src/lib/api.ts`): typed fetch wrapper with `credentials: include` so the JWT cookie is sent. React Query manages caching and invalidation; admin mutations invalidate the public `["content"]` query so the live site updates immediately.

### CMS / Admin auth

- Tables: `site_settings` (key/value, HTML allowed in `about_paragraph`), `projects`, `services`, `awards`, `social_links` (all with `sort_order`).
- Validation lives in each schema file as plain `z.object(...)` (do **not** use `drizzle-zod`'s field customizer — current version of `drizzle-zod` is incompatible with the installed Zod and produces invalid schemas at runtime).
- Auth: `ADMIN_PASSWORD` (single admin) + `SESSION_SECRET` (HMAC for the JWT). Implemented in `artifacts/api-server/src/lib/auth.ts`.
  - `POST /api/auth/login` — constant-time password compare via `crypto.timingSafeEqual` over SHA-256 hashes of both inputs (equal-length buffers, no early-exit on length). Sets `at_admin` HTTP-only signed JWT cookie (7-day TTL). Throttled to 10 attempts / 15 min per IP via `express-rate-limit`.
  - `POST /api/auth/logout` — clears the cookie.
  - `GET /api/auth/me` — returns `{authenticated: boolean}`.
  - `requireAdmin` middleware guards all `/api/admin/*` routes.
  - `sameOriginGuard` middleware (in `routes/index.ts`) enforces an Origin/Referer == Host check on every non-safe HTTP method against `/auth/*` and `/admin/*`. Combined with the `SameSite=Lax` cookie this blocks CSRF.
- HTML in settings: `about_paragraph` is the only key allowed to contain HTML. On write, the API runs the value through `sanitize-html` with an allowlist of `<strong>`, `<em>`, `<br>` only — script tags, event handlers, and other tags are stripped server-side, so a stored XSS is not possible even if the admin pastes one.
- Public read endpoint: `GET /api/content` returns `{settings, projects, services, awards, socialLinks}` in one call.
- Admin write endpoints: `PUT /api/admin/settings` (bulk upsert) plus full CRUD (`GET/POST/PATCH/DELETE`) on `/api/admin/{projects,services,awards,social-links}` via `src/routes/admin/listResource.ts`.

### VPS deployment
- The project ships with a multi-stage `Dockerfile`, `docker-compose.yml` (app + Postgres 16), `docker-entrypoint.sh`, and `wait-for-db.cjs`. `docker compose up --build -d` brings everything up on a single VPS — see `README.md` for the full flow.
- The compiled API server (`artifacts/api-server/dist/index.cjs`) serves both `/api/*` and the static frontend in production via `express.static` when `PUBLIC_DIR` is set. There is no separate static-file server — the obsolete `docker-serve.js` was removed.
- Production hardening lives in `artifacts/api-server/src/app.ts`: `helmet` (HSTS, `X-Frame-Options: DENY`, no-sniff, referrer-policy; CSP intentionally off because the CMS image URLs are user-supplied), structured JSON request logger, and a global error handler that suppresses stack traces in 5xx responses. `trust proxy` is gated on the `TRUST_PROXY` env var so a directly-exposed app cannot have its rate-limit IPs spoofed via `X-Forwarded-For`.
- Cookie security is deployment-aware: `issueAdminCookie(req, res)` in `lib/auth.ts` sets `Secure` when `req.secure` is true (i.e. real HTTPS, optionally forwarded by a trusted proxy) or when `COOKIE_SECURE=true` is set explicitly. This means the admin login works on `http://<vps>:3001/admin/login` immediately after `docker compose up`, and automatically upgrades to Secure cookies once nginx + TLS are in front.
- `artifacts/api-server/src/index.ts` handles `SIGTERM`/`SIGINT` with a 10s force-exit watchdog, parallel `server.close()` + `pool.end()`, and logs uncaught exceptions / unhandled rejections.
- The Docker entrypoint runs `drizzle-kit push` then `seed-cms` (idempotent) before exec'ing the bundled server, so a fresh VPS comes up with working public content and a usable admin login.
