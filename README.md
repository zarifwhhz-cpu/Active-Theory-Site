# Creative Agency

A high-end creative agency website built with React, Vite, and Express. Dark immersive aesthetic with custom NBArchitekt typeface, particle canvas animations, and smooth scroll interactions.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Framer Motion
- **Backend**: Express 5, Node.js 22
- **Database**: PostgreSQL + Drizzle ORM
- **Package manager**: pnpm (monorepo)
- **Font**: NBArchitekt (Bold, Regular, Light)

---

## Local Development

### Prerequisites

- [Node.js 22+](https://nodejs.org/)
- [pnpm 10+](https://pnpm.io/installation) — `npm install -g pnpm`
- [PostgreSQL 16+](https://www.postgresql.org/) (optional if not using backend features)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 2. Copy environment variables
cp .env.example .env
# Edit .env and fill in your values (DATABASE_URL, etc.)

# 3. Install dependencies
pnpm install

# 4. Push database schema (optional)
pnpm --filter @workspace/db run push

# 5. Start development servers
pnpm --filter @workspace/active-theory-site run dev   # Frontend → http://localhost:3000
pnpm --filter @workspace/api-server run dev           # Backend  → http://localhost:8080/api
```

---

## Production Build

```bash
# Build everything
pnpm run build

# Frontend static files → artifacts/active-theory-site/dist/public/
# API server bundle    → artifacts/api-server/dist/index.cjs
```

---

## Deployment

### Option 1 — Docker (recommended)

```bash
# Copy and fill in environment variables
cp .env.example .env

# Build and run with Docker Compose (includes PostgreSQL)
docker compose up --build
```

The app will be available at `http://localhost:3001`.

To run without Docker Compose (external DB):

```bash
docker build -t creative-agency .
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  creative-agency
```

---

### Option 2 — Vercel (frontend only)

The frontend is a pure static SPA that can be deployed to Vercel with zero config:

1. Import the repository in the [Vercel dashboard](https://vercel.com/new)
2. Set the **root directory** to `artifacts/active-theory-site`
3. Set build command: `pnpm run build`
4. Set output directory: `dist/public`
5. Add environment variables: `BASE_PATH=/`
6. Deploy

---

### Option 3 — Railway

Railway supports monorepos and can host both the frontend and backend:

1. Create a new project at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add a **PostgreSQL** plugin
4. Add a service for the API:
   - Root directory: `artifacts/api-server`
   - Build command: `pnpm run build`
   - Start command: `node dist/index.cjs`
5. Add a service for the frontend (or deploy static via Vercel above)
6. Set environment variables from `.env.example`

---

### Option 4 — Self-hosted (VPS / bare metal)

```bash
# On your server
git clone YOUR_REPO && cd YOUR_REPO
cp .env.example .env  # fill in values
pnpm install --frozen-lockfile --prod
pnpm run build

# Serve the frontend with nginx (example config below)
# Run the API server with pm2
npm install -g pm2
PORT=3001 pm2 start artifacts/api-server/dist/index.cjs --name api
pm2 save && pm2 startup
```

**Nginx config example:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend static files
    root /var/www/creative-agency/artifacts/active-theory-site/dist/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Environment Variables

See `.env.example` for all available variables.

| Variable          | Required | Description                                                         |
|-------------------|----------|---------------------------------------------------------------------|
| `PORT`            | Yes      | Port for the API server                                             |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string                                        |
| `ADMIN_PASSWORD`  | Yes      | Single-admin password for the `/admin` panel                        |
| `SESSION_SECRET`  | Yes      | HMAC secret for the admin session cookie (≥ 16 chars, random)       |
| `BASE_PATH`       | No       | URL base path (default: `/`)                                        |
| `NODE_ENV`        | No       | `development` or `production`                                       |

### First-time admin setup

After the database is up and the app is running, seed the CMS tables with the
default content (hero/about/services/projects/awards/social links):

```bash
pnpm --filter @workspace/scripts run seed-cms
```

Then sign in at `/admin/login` with your `ADMIN_PASSWORD` to edit the site.

---

## Project Structure

```
├── artifacts/
│   ├── active-theory-site/   # React + Vite frontend
│   └── api-server/           # Express API server
├── lib/
│   ├── api-spec/             # OpenAPI spec + codegen config
│   ├── api-client-react/     # Generated React Query hooks
│   ├── api-zod/              # Generated Zod schemas
│   └── db/                   # Drizzle ORM schema + DB client
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

---

## License

MIT
