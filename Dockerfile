###############################################################################
# Stage 1 — Install all workspace dependencies (dev + prod)
###############################################################################
FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat \
 && npm install -g pnpm@10

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/api-spec/package.json            lib/api-spec/
COPY lib/api-client-react/package.json    lib/api-client-react/
COPY lib/api-zod/package.json             lib/api-zod/
COPY lib/db/package.json                  lib/db/
COPY scripts/package.json                 scripts/
COPY artifacts/api-server/package.json    artifacts/api-server/
COPY artifacts/active-theory-site/package.json  artifacts/active-theory-site/

RUN pnpm install --frozen-lockfile

###############################################################################
# Stage 2 — Build the frontend (Vite static files)
###############################################################################
FROM deps AS build-frontend

COPY . .

ENV NODE_ENV=production
ENV BASE_PATH=/

RUN pnpm --filter @workspace/active-theory-site run build

###############################################################################
# Stage 3 — Build the API server (esbuild bundle)
###############################################################################
FROM deps AS build-api

COPY . .

ENV NODE_ENV=production

RUN pnpm --filter @workspace/api-server run build

###############################################################################
# Stage 4 — Production image
###############################################################################
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache tini libc6-compat \
 && npm install -g pnpm@10

# Workspace manifests + lock so pnpm can install drizzle-kit + tsx for the
# entrypoint to push schema and seed the CMS.
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/api-spec/package.json            lib/api-spec/
COPY lib/api-client-react/package.json    lib/api-client-react/
COPY lib/api-zod/package.json             lib/api-zod/
COPY lib/db/package.json                  lib/db/
COPY scripts/package.json                 scripts/
COPY artifacts/api-server/package.json    artifacts/api-server/

# Ignore the `preinstall` (which would refuse without pnpm UA in some shells)
# and skip the active-theory-site workspace entirely — its deps are baked into
# the static bundle already and we don't need its node_modules at runtime.
RUN pnpm install --frozen-lockfile \
      --filter "@workspace/db" \
      --filter "@workspace/scripts" \
      --filter "@workspace/api-server"

# Source files needed at runtime by the entrypoint:
#   - lib/db/src             → drizzle schema (used by seed + push)
#   - lib/db/drizzle.config.ts
#   - scripts/src/seed-cms.ts
COPY lib/db                lib/db
COPY scripts/src           scripts/src
COPY scripts/tsconfig.json scripts/tsconfig.json

# Built artifacts
COPY --from=build-api      /app/artifacts/api-server/dist                  artifacts/api-server/dist
COPY --from=build-frontend /app/artifacts/active-theory-site/dist/public   public

# Entrypoint scripts
COPY docker-entrypoint.sh ./
COPY wait-for-db.cjs ./
RUN chmod +x docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3001
ENV PUBLIC_DIR=/app/public

EXPOSE 3001

# tini handles PID 1 reaping + signal forwarding so SIGTERM reaches Node.
ENTRYPOINT ["/sbin/tini", "--", "/app/docker-entrypoint.sh"]
