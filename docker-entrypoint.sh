#!/bin/sh
set -e

log() {
  printf '{"t":"%s","lvl":"info","msg":"entrypoint: %s"}\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$1"
}

if [ -z "${DATABASE_URL:-}" ]; then
  echo '{"lvl":"error","msg":"DATABASE_URL is required"}' >&2
  exit 1
fi
if [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo '{"lvl":"error","msg":"ADMIN_PASSWORD is required"}' >&2
  exit 1
fi
if [ -z "${SESSION_SECRET:-}" ]; then
  echo '{"lvl":"error","msg":"SESSION_SECRET is required"}' >&2
  exit 1
fi

log "waiting for postgres"
node /app/wait-for-db.cjs

log "pushing database schema"
pnpm --filter @workspace/db run push

log "seeding cms (idempotent; only inserts when tables are empty)"
pnpm --filter @workspace/scripts run seed-cms

log "starting api server"
exec node /app/artifacts/api-server/dist/index.cjs
