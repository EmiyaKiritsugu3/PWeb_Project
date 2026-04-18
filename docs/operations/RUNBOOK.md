# Operations Runbook — Five Star Academy

**Last Updated**: 2026-04-17

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- Docker (required for local Supabase stack)
- npm

### First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env file and fill in production values
cp .env.example .env

# 3. Generate Prisma client
npx prisma generate

# 4. Run migrations against dev DB
npx prisma migrate dev

# 5. Seed development data
npm run prisma:seed

# 6. Start dev server
npm run dev
```

---

## E2E Test Environment (Local Supabase)

### Start the local stack

```bash
# Starts Supabase locally via Docker (Auth + DB + Studio)
npm run supabase:start
```

This outputs the local URLs and keys. `.env.test` already has these pre-configured
with the default local values — no changes needed.

```
# Default local URLs (already in .env.test):
API URL:  http://127.0.0.1:54321
DB URL:   postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio:   http://127.0.0.1:54323
```

### Apply migrations to local DB

```bash
npx supabase db push
# or
npx prisma migrate dev
```

### Seed E2E test users

```bash
npm run seed:e2e
```

Creates 4 deterministic test users:

| User          | Email              | Password  | Role          |
| ------------- | ------------------ | --------- | ------------- |
| Gerente       | gerente@test.com   | Test1234! | GERENTE       |
| Recepcionista | recep@test.com     | Test1234! | RECEPCIONISTA |
| Instrutor     | instrutor@test.com | Test1234! | INSTRUTOR     |
| Aluno         | aluno@test.com     | Test1234! | —             |

> Credentials MUST match `tests/e2e/helpers/auth.ts` and `prisma/seed-e2e.ts` — update all three if changing.

### Run E2E tests

```bash
# Run all Playwright tests (starts Next.js on port 3333 automatically)
npm run e2e

# Run a single spec file
npm run e2e -- tests/e2e/specs/auth.spec.ts

# Open interactive UI mode
npm run e2e:ui

# View last test report
npm run e2e:report
```

> **Port isolation**: E2E always starts Next.js on port **3333** (`playwright.config.ts → webServer`).
> This avoids reusing a dev server on port 3001 that may carry `.env.local` production credentials.
> `reuseExistingServer: false` is intentional — never change it.

> **Session cookie timing**: `loginAs()` in `tests/e2e/helpers/auth.ts` performs a hard `page.goto(expectedPath)` after `waitForURL`. This is required because Next.js App Router inline-renders redirect targets during the server action POST response, where `Set-Cookie` is not yet in the `Cookie` request header. The hard navigation forces a new GET where the browser includes the session cookie.

### Stop the local stack

```bash
npm run supabase:stop
```

---

## Quality Gates (run before every merge)

```bash
npm run typecheck   # 0 TypeScript errors
npm run lint        # 0 ESLint errors
npm run test        # all unit tests pass
npm run e2e         # 15/15 E2E scenarios pass
npm run build       # production build succeeds
```

---

## GitHub Actions Secrets

Required secrets in GitHub repository settings (`Settings → Secrets → Actions`):

| Secret                          | Description                        | Where to get                                       |
| ------------------------------- | ---------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production Supabase URL            | Supabase → Settings → API                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key                | Supabase → Settings → API                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (CI seed)         | Supabase → Settings → API                          |
| `DATABASE_URL`                  | Prisma connection string           | Supabase → Settings → Database                     |
| `DIRECT_URL`                    | Direct DB URL (migrations)         | Supabase → Settings → Database                     |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry error tracking DSN          | sentry.io → Project → Settings                     |
| `SENTRY_AUTH_TOKEN`             | Sentry source maps upload          | sentry.io → Settings → Auth Tokens                 |
| `GEMINI_API_KEY`                | Google AI API key                  | Google AI Studio                                   |
| `SUPABASE_LOCAL_ANON_KEY`       | Local Supabase anon key for CI E2E | Run `npx supabase status` locally, copy `anon key` |

### Getting `SUPABASE_LOCAL_ANON_KEY` for CI

The local Supabase CLI uses a fixed JWT secret. To get the anon key value:

```bash
npm run supabase:start
npx supabase status  # copy "anon key" value
```

Set this as a GitHub Actions secret named `SUPABASE_LOCAL_ANON_KEY`. The value is deterministic for any default Supabase CLI installation (same JWT secret = same tokens).

---

## Deploy

The project deploys automatically via Vercel on every push to `main`.

### Manual deploy trigger

```bash
vercel --prod
```

### Rollback

In Vercel Dashboard → Deployments → select previous deployment → Promote to Production.

---

## Database Migrations

```bash
# Create a new migration (dev)
npx prisma migrate dev --name <description>

# Apply migrations in production (CI runs this automatically)
npx prisma migrate deploy

# Reset local DB (destructive — dev only)
npx prisma migrate reset
```

See `docs/operations/INCIDENT-RESPONSE.md` for rollback procedures.
