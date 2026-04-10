# Operations Runbook — Five Star Academy

**Last Updated**: 2026-04-10

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

| User          | Email                  | Password          | Role          |
| ------------- | ---------------------- | ----------------- | ------------- |
| Gerente       | gerente@e2e.test       | E2eGerente!2026   | GERENTE       |
| Recepcionista | recepcionista@e2e.test | E2eRecep!2026     | RECEPCIONISTA |
| Instrutor     | instrutor@e2e.test     | E2eInstrutor!2026 | INSTRUTOR     |
| Aluno         | aluno@e2e.test         | E2eAluno!2026     | —             |

### Run E2E tests

```bash
# Run all Playwright tests
npm run e2e

# Open interactive UI mode
npm run e2e:ui

# View last test report
npm run e2e:report
```

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

| Secret                          | Description                | Where to get                       |
| ------------------------------- | -------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Production Supabase URL    | Supabase → Settings → API          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key        | Supabase → Settings → API          |
| `SUPABASE_SERVICE_ROLE_KEY`     | Service role key (CI seed) | Supabase → Settings → API          |
| `DATABASE_URL`                  | Prisma connection string   | Supabase → Settings → Database     |
| `DIRECT_URL`                    | Direct DB URL (migrations) | Supabase → Settings → Database     |
| `NEXT_PUBLIC_SENTRY_DSN`        | Sentry error tracking DSN  | sentry.io → Project → Settings     |
| `SENTRY_AUTH_TOKEN`             | Sentry source maps upload  | sentry.io → Settings → Auth Tokens |
| `GEMINI_API_KEY`                | Google AI API key          | Google AI Studio                   |

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
