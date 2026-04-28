# Worker Hours Tracker

Worker Hours Tracker is a mobile-first personal work log for recording daily work entries, tracking monthly totals, and keeping a searchable history of work locations and notes.

## Problem Statement

Independent workers and small operators often track hours across calendars, notes, spreadsheets, and chat messages. This makes it hard to answer simple questions such as:

- Which days did I work this month?
- How many hours should be billed?
- Where did I work on a specific day?
- Which days were days off or no-work days?

This project centralizes that workflow in a small app designed for daily personal use.

## MVP Scope

- Email/password authentication.
- Private calendar views protected by session checks.
- Daily work entries with status, hours, location, and notes.
- Monthly summaries and work history.
- Saved profile locations.
- API documentation exposed through Scalar.
- Local PostgreSQL development with Prisma migrations.

## Tech Stack

- Monorepo: `pnpm` workspace
- Web: Next.js 16, React 19, Tailwind CSS, shadcn/ui, React Hook Form, Zod
- API: Node.js, Fastify 5, Better Auth, Prisma 7
- Database: PostgreSQL
- API docs: Scalar + OpenAPI
- Deployment target: Vercel for Web, Render or Railway for API, Neon Postgres for Database

## Architecture Overview

```text
apps/
  api/   Fastify API, Better Auth, Prisma, Scalar docs
  web/   Next.js app router frontend
docs/    Product notes, manual tests, deployment checklist, execution history
```

The Web app talks to the API through `NEXT_PUBLIC_API_URL`. The API stores users, sessions, profiles, saved locations, and work entries in PostgreSQL through Prisma.

## Local Development

### Requirements

- Node.js 24
- pnpm 10
- Docker Desktop, for local PostgreSQL

### Install Dependencies

```powershell
pnpm install
```

### Configure Environment Files

```powershell
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local
```

Do not commit real `.env` files or production secrets.

### Start Local Database

```powershell
docker compose up -d
```

### Apply Prisma Migrations Locally

From `apps/api`:

```powershell
pnpm exec prisma generate
pnpm exec prisma migrate dev
```

### Run the API

From the repository root:

```powershell
pnpm --filter api build
pnpm --filter api start
```

Local API URL:

```text
http://localhost:3333
```

Health check:

```text
http://localhost:3333/health
```

### Run the Web App

From the repository root:

```powershell
pnpm --filter web dev
```

Local Web URL:

```text
http://localhost:3000
```

## Environment Variables

### API

Defined in `apps/api/.env.example`:

```text
DATABASE_URL
PORT
NODE_ENV
CORS_ORIGIN
API_DOCS_ENABLED
JWT_SECRET
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

Notes:

- `DATABASE_URL` should point to Neon Postgres in production.
- `CORS_ORIGIN` should match the deployed Web URL.
- `BETTER_AUTH_URL` should point to the deployed API auth base URL, ending in `/api/auth`.
- `JWT_SECRET` and `BETTER_AUTH_SECRET` must be strong production-only secrets.
- Google and SMTP variables are optional unless those flows are enabled.

The API also supports default profile values through configuration defaults:

```text
DEFAULT_USER_NAME
DEFAULT_USER_EMAIL
DEFAULT_USER_LANGUAGE
```

### Web

Defined in `apps/web/.env.example`:

```text
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_MAPTILER_KEY
```

Notes:

- `NEXT_PUBLIC_API_URL` should point to the deployed API URL.
- `NEXT_PUBLIC_APP_URL` should point to the deployed Web URL.
- `NEXT_PUBLIC_MAPTILER_KEY` is optional unless map/location features require it in production.

## Database and Prisma Migrations

Production databases should be updated with Prisma migrate deploy:

```powershell
pnpm --filter api exec prisma migrate deploy
```

Use this against the production `DATABASE_URL` after the Neon database is created and before running smoke tests. Do not use `prisma migrate dev`, `db push`, or reset commands against production.

## API Documentation

When API docs are enabled:

```text
/docs/api
```

Local URL:

```text
http://localhost:3333/docs/api
```

## Deployment Plan

Recommended production setup:

- Web: Vercel
- API: Render or Railway
- Database: Neon Postgres

### Web Build

Vercel project target:

```text
apps/web
```

Build command:

```powershell
pnpm --filter web build
```

### API Build and Start

API build command:

```powershell
pnpm --filter api build
```

API start command:

```powershell
pnpm --filter api start
```

Prisma production migration command:

```powershell
pnpm --filter api exec prisma migrate deploy
```

## Mobile Usage Note

The app is designed mobile-first for daily work logging from a phone. It also works on desktop for review, history, and monthly summaries.

## Current Limitations

- Local validation is currently passing for lint, typecheck, Web build, and API build.
- Google OAuth requires production provider configuration before use.
- Email report delivery requires SMTP configuration.
- Screenshots and hosted demo links are not published yet.
- Production deployment has not been executed yet.

## Roadmap

- Keep lint, typecheck, Web build, and API build green during release preparation.
- Add production screenshots.
- Add a live demo URL after deployment.
- Harden deployment runbooks after the first production release.
- Expand reporting and export workflows.

## Screenshots

Screenshots will be added after the production deployment is confirmed.

## Demo Credentials

No shared demo credentials are committed to this repository. Use a dedicated test account in the deployed environment if a public demo is needed.

## Useful Commands

```powershell
pnpm --filter api build
pnpm --filter api start
pnpm --filter web build
pnpm --filter web exec tsc --noEmit --pretty false
pnpm --filter web lint
pnpm --filter api exec prisma migrate deploy
```
