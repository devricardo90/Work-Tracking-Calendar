# Deployment Checklist

This checklist prepares Worker Hours Tracker for a real production deployment. Do not deploy until the final Trigger confirmation is given.

## 1. Neon Database Setup

- Create a Neon project for production.
- Create or select the production PostgreSQL database.
- Copy the pooled or direct connection string according to the API hosting provider requirements.
- Store the connection string only as `DATABASE_URL` in the API provider environment variables.
- Do not commit database URLs or credentials.

## 2. API Deploy Steps

Recommended providers:

- Render
- Railway

Service type:

- Node.js web service

Build command:

```bash
pnpm --filter api build
```

Start command:

```bash
pnpm --filter api start
```

Production migration command:

```bash
pnpm --filter api exec prisma migrate deploy
```

Run the migration command after setting `DATABASE_URL` and before running smoke tests.

## 3. Web Deploy Steps

Recommended provider:

- Vercel

Project root:

```text
apps/web
```

Build command:

```bash
pnpm --filter web build
```

Set Web environment variables in Vercel before the first production build.

## 4. API Environment Variables

Required:

- `DATABASE_URL`
- `NODE_ENV=production`
- `PORT`
- `CORS_ORIGIN`
- `JWT_SECRET`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Optional:

- `API_DOCS_ENABLED`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `DEFAULT_USER_NAME`
- `DEFAULT_USER_EMAIL`
- `DEFAULT_USER_LANGUAGE`

Production notes:

- `CORS_ORIGIN` must match the deployed Web URL.
- `BETTER_AUTH_URL` must match the deployed API auth URL and end with `/api/auth`.
- Secrets must be generated per environment.
- Do not use local development secrets in production.

## 5. Web Environment Variables

Required:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `NEXT_PUBLIC_MAPTILER_KEY`

Production notes:

- `NEXT_PUBLIC_API_URL` must match the deployed API base URL.
- `NEXT_PUBLIC_APP_URL` must match the deployed Vercel URL or custom domain.

## 6. Prisma Production Migration

Run against the production Neon database:

```bash
pnpm --filter api exec prisma migrate deploy
```

Do not run these commands against production:

- `prisma migrate dev`
- `prisma db push`
- `prisma migrate reset`
- any manual destructive database command

## 7. Smoke Tests

After API and Web deployments are live, validate:

- API health: `GET /health`
- API config: `GET /config/status`
- Web login page: `GET /login`
- Signup with a dedicated test account.
- Login with the dedicated test account.
- Create one work entry.
- Return to calendar and confirm the entry appears.
- Logout from the UI.
- Confirm logout does not return `500 Unsupported Media Type`.
- Confirm protected pages redirect to `/login` after logout.

## 8. Pre-Release Git Check

Before committing deployment documentation or production configuration:

```bash
git status --short
git diff --stat
git diff --name-only
```

Confirm no local logs, `.env` files, secrets, database files, or generated deployment artifacts are staged.

