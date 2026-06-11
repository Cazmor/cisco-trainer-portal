# Cisco Trainer Progress Tracking System

A comprehensive progress tracking system for Cisco training centers.

## Features

- Multi-center management
- Student progress tracking
- Attendance management
- Performance analytics
- Lab equipment inventory
- Class scheduling
- Report generation
- KPI scorecard
- AI-powered assistant

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- Supabase PostgreSQL, or local PostgreSQL for development

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd instructor-portal
```

2. Install dependencies:
```bash
npm install
```

3. Configure the database:
```bash
cp .env.example .env
```

Set `DATABASE_URL` and `DB_SSL=true` for Supabase.

4. Setup database schema and seed data:
```bash
npm run db-setup
```

### Supabase

Use Supabase by setting these environment variables in your `.env` file:

- `DATABASE_URL` (preferred)
- `DB_SSL=true`

Or set individual values:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

Then run `npm run db-setup` and start the app with `npm run dev`.

For a local development database instead, run `docker compose --profile local-db up -d postgres` and use the local Postgres values from `.env.example`.

5. Start the application:
```bash
npm run dev
```

6. Open http://localhost:3000 in your browser

## DevOps

- `npm run ci` runs syntax checks and smoke tests.
- `docker compose up --build` runs the application using the database in your `.env`. Use `docker-compose up --build` on legacy Docker Compose installs.
- `npm run db-check` verifies the configured database connection.
- `npm run test:admin` logs in as the admin user and smoke-tests the dashboard API.
- GitHub Actions validates the app and Docker image on pushes and pull requests to `main`.
- Dependabot is configured for npm, GitHub Actions, and Docker updates.

See [docs/DEVOPS.md](docs/DEVOPS.md) for the local Docker workflow, environment variables, CI notes, and deployment guidance.

## Default Login Credentials

- Super Admin: admin@cisco.com / admin123
- Centre Admin (Nairobi): nairobi.admin@cisco.com / admin123
- Centre Admin (Mombasa): mombasa.admin@cisco.com / admin123
- Centre Admin (Kisumu): kisumu.admin@cisco.com / admin123
- Instructor (Nairobi): instructor1.nairobi@cisco.com / instructor123

## License

ISC
