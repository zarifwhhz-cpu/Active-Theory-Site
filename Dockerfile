###############################################################################
# Stage 1 – Install all workspace dependencies
###############################################################################
FROM node:22-alpine AS deps

WORKDIR /app

RUN npm install -g pnpm

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
# Stage 2 – Build the frontend (Vite static files)
###############################################################################
FROM deps AS build-frontend

COPY . .

ENV NODE_ENV=production
ENV BASE_PATH=/
ENV PORT=3000

RUN pnpm --filter @workspace/active-theory-site run build

###############################################################################
# Stage 3 – Build the API server (esbuild bundle)
###############################################################################
FROM deps AS build-api

COPY . .

ENV NODE_ENV=production

RUN pnpm --filter @workspace/api-server run build

###############################################################################
# Stage 4 – Production image
###############################################################################
FROM node:22-alpine AS production

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace manifests so pnpm can resolve prod deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY lib/db/package.json lib/db/
COPY artifacts/api-server/package.json artifacts/api-server/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Copy built assets
COPY --from=build-api      /app/artifacts/api-server/dist     artifacts/api-server/dist
COPY --from=build-frontend /app/artifacts/active-theory-site/dist/public  public

# Serve the frontend static files from the Express server
COPY docker-serve.js .

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "docker-serve.js"]
