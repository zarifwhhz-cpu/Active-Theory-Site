# The Solver Agency (TSA) — Site + CMS

A creative-agency website with a built-in admin panel. Dark immersive aesthetic, particle canvas, smooth scroll. Every public string (hero, about, services, awards, projects, contact email, footer, social links, nav) is editable from `/admin/*` — no redeploy required.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion, wouter
- **Backend**: Express 5, Node.js 22
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Auth**: single-admin password + signed JWT cookie (helmet, rate-limited login, same-origin guard)
- **Package manager**: pnpm 10 (monorepo)

---

## Local Development

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/installation) — `npm install -g pnpm`
- [PostgreSQL 16+](https://www.postgresql.org/) reachable via `DATABASE_URL`

### Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET

# 3. Install
pnpm install

# 4. Push schema + seed CMS defaults (idempotent — safe to re-run)
pnpm --filter @workspace/db run push
pnpm --filter @workspace/scripts run seed-cms

# 5. Start
pnpm --filter @workspace/active-theory-site run dev    # site
pnpm --filter @workspace/api-server run dev            # api
```

Open http://localhost:3000 for the site, http://localhost:3000/admin/login for the admin panel.

---

## Production Build

```bash
pnpm run build
# Frontend static files → artifacts/active-theory-site/dist/public/
# API server bundle    → artifacts/api-server/dist/index.cjs (single Node bundle)
```

The compiled API server can serve the static frontend itself — set `PUBLIC_DIR` to the path of `dist/public/` and one Node process will handle both the site and `/api/*`.

---

## Deploy on a VPS (recommended)

This is the simplest path: one VPS, Docker installed, two commands.

### 1. Get the code on the server

```bash
ssh you@your-vps
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 2. Configure secrets

```bash
cp .env.example .env
# Open .env and set, at minimum:
#   ADMIN_PASSWORD   = a long password you'll use to log into /admin
#   SESSION_SECRET   = at least 32 random bytes (e.g. `openssl rand -hex 32`)
#   PGPASSWORD       = a strong Postgres password
# Optional: APP_PORT (default 3001), PGDATABASE (default tsa_site)
```

`.env` is in `.gitignore` and excluded from the Docker build context — it stays on your server only.

### 3. Bring it up

```bash
docker compose up --build -d
```

What happens on first boot:

1. Postgres 16 starts in a container with a persistent volume.
2. The app container waits for Postgres to accept connections.
3. Drizzle pushes the schema (creates the CMS tables).
4. The seed runs once, populating defaults for hero / projects / services / awards / social links. It's idempotent — restarts won't overwrite your edits.
5. The Express server starts, serves the static site, and exposes `/api/*` on port `3001`.

Visit `http://<your-vps>:3001/` for the site and `http://<your-vps>:3001/admin/login` to sign in with `ADMIN_PASSWORD`.

### 4. Day-2 commands

```bash
docker compose logs -f app          # tail structured JSON request + error logs
docker compose ps                   # health status
docker compose restart app          # safe restart (graceful SIGTERM)
docker compose pull && docker compose up -d --build   # update after `git pull`
docker compose down                 # stop everything (data preserved in the volume)
docker compose down -v              # ⚠ also wipes the Postgres volume
```

CMS data lives in the named Docker volume `postgres_data`. To back it up:

```bash
docker compose exec db pg_dump -U "$PGUSER" "$PGDATABASE" | gzip > backup-$(date +%F).sql.gz
```

### 5. Put it behind HTTPS (optional but recommended)

The container only speaks HTTP on port 3001. For real-world use, terminate TLS on the host with nginx + Let's Encrypt:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    client_max_body_size 1m;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo certbot --nginx -d yourdomain.com
```

The Express app sets `trust proxy` to `1`, so `req.ip` and `Secure` cookies work correctly behind a single reverse proxy.

---

## Environment Variables

| Variable          | Required | Description                                                            |
|-------------------|----------|------------------------------------------------------------------------|
| `ADMIN_PASSWORD`  | Yes      | Password for the single admin account at `/admin/login`                |
| `SESSION_SECRET`  | Yes      | HMAC secret for the admin session cookie (≥ 32 random bytes)           |
| `DATABASE_URL`    | Yes¹     | PostgreSQL connection string                                           |
| `PGUSER`          | Compose  | Postgres user for the bundled DB container (default `postgres`)        |
| `PGPASSWORD`      | Compose  | Postgres password for the bundled DB container                         |
| `PGDATABASE`      | Compose  | Postgres database name (default `tsa_site`)                            |
| `APP_PORT`        | Compose  | Host port to expose the app on (default `3001`)                        |
| `PORT`            | Yes      | Internal listen port (default `3001` in container)                     |
| `PUBLIC_DIR`      | Prod     | Absolute path to built frontend; set to `/app/public` in container     |
| `NODE_ENV`        | No       | `development` or `production`                                          |
| `BASE_PATH`       | No       | URL base path for the Vite build (default `/`)                         |

¹ `DATABASE_URL` is constructed automatically inside `docker-compose.yml` from `PGUSER` / `PGPASSWORD` / `PGDATABASE`. You only need to set it directly when running outside Docker.

---

## Project Structure

```
├── artifacts/
│   ├── active-theory-site/   # React + Vite frontend (public site + /admin)
│   └── api-server/           # Express API: /api/content, /api/auth, /api/admin
├── lib/
│   ├── api-spec/             # OpenAPI spec + codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas
│   └── db/                   # Drizzle schema + DB client (PostgreSQL)
├── scripts/                  # First-boot CMS seed
├── Dockerfile                # Multi-stage build → single production image
├── docker-compose.yml        # App + Postgres for VPS
├── docker-entrypoint.sh      # Wait for DB → push schema → seed → start server
├── wait-for-db.cjs           # Postgres readiness check
└── .env.example
```

---

## License

MIT
