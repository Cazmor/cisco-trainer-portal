# DevOps Runbook

This app is a Node.js/Express service with static frontend assets and Supabase PostgreSQL storage.

## Local Quality Gate

Run the same checks used by CI:

```bash
npm ci
npm run ci
```

The quality gate checks JavaScript syntax across `server`, `public`, `scripts`, and `tests`, then runs the Node smoke tests.

## Local Docker Stack

The examples use the modern `docker compose` command. If your Docker install uses the legacy Compose binary, replace `docker compose` with `docker-compose`.

Run the app container against the database configured in `.env`:

```bash
docker compose up --build
```

For a local development database, start Postgres with the `local-db` profile:

```bash
docker compose --profile local-db up -d postgres
```

Initialize the database on first use:

```bash
npm run db-setup
```

The app is available at `http://localhost:3000` and exposes a health check at `http://localhost:3000/api/health`.

## Environment Variables

Required for production/Supabase:

- `DATABASE_URL` or the individual `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` values from Supabase
- `DB_SSL=true`
- `JWT_SECRET`
- `NODE_ENV=production`

Common optional values:

- `PORT`
- `JWT_EXPIRY`
- `CORS_ORIGIN` as a comma-separated allowlist
- `UPLOAD_PATH`

## CI

GitHub Actions runs on pushes and pull requests to `main`.

It performs:

- clean dependency install with `npm ci`
- JavaScript syntax checks
- smoke tests for health and 404 behavior
- Docker image build validation

Dependabot is configured for npm, GitHub Actions, and Docker base image updates.

## Deployment Notes

Use Node 20 in production. The app listens on `0.0.0.0` and reads `PORT` from the environment, so it works on container platforms and managed Node hosts.

For Docker platforms, build from the root `Dockerfile` and mount persistent storage at `/app/uploads` if uploaded files must survive container replacement.

For Supabase, set `DATABASE_URL` and `DB_SSL=true`, then run `npm run db-setup` once before opening the app to users. Run `npm run db-check` and `npm run test:admin` after deployment or database changes.
