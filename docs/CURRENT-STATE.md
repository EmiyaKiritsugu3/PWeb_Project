# Current State — Five Star Academy

**Last Updated**: 2026-04-17
**Branch**: `fix/e2e-auth-stabilization` → PR #69 open against `main`
**Version**: 0.4.2 (pre-release)

## What Works Today

| Feature                                     | Status        | Notes                                              |
| ------------------------------------------- | ------------- | -------------------------------------------------- |
| Admin login                                 | ✅ Working    | Supabase Auth SSR                                  |
| Student login (Portal do Aluno)             | ✅ Working    | Separate session                                   |
| Admin dashboard                             | ✅ Working    | GERENTE + RECEPCIONISTA                            |
| Financial routes (`/financeiro`, `/planos`) | ✅ Working    | GERENTE-only gate                                  |
| Student workout view                        | ✅ Working    | `meus-treinos`                                     |
| AI workout generator                        | ✅ Working    | Genkit + Gemini                                    |
| Student enrollment                          | ✅ Working    | Admin creates aluno                                |
| Gamification (XP, streaks)                  | ✅ Working    | Hook `use-workout-tracker`                         |
| Prisma migrations                           | ✅ Tracked    | `prisma/migrations/`                               |
| ESLint quality gate                         | ✅ Done       | 0 errors — `any` + unused vars                     |
| TypeScript typecheck                        | ✅ Clean      | 0 errors (strict mode)                             |
| Unit tests                                  | ✅ Passing    | 18/18 (Vitest)                                     |
| Ops documentation                           | ✅ Done       | Runbook, SLOs, threat model                        |
| Process documentation                       | ✅ Done       | RFC + Postmortem templates                         |
| Local E2E stack                             | ✅ Done       | `supabase start` (Docker)                          |
| E2E seed script                             | ✅ Done       | `prisma/seed-e2e.ts` (4 users, purge-on-seed)      |
| Playwright E2E suite                        | ✅ Done       | 15/15 passing                                      |
| CI E2E job                                  | ✅ Done       | `.github/workflows/ci.yml`                         |
| Sentry error tracking                       | ✅ Modernized | Next.js 15, v10, `instrumentation-client.ts`       |
| Structured logging                          | ✅ Done       | `src/lib/logger.ts` (Logger wrapper, Sentry-aware) |

## What Is Incomplete

| Area          | Gap                                                                     | Priority |
| ------------- | ----------------------------------------------------------------------- | -------- |
| CI security   | 3 moderate vulns in `@prisma/dev` (transitive, awaiting upstream)       | P3       |
| Lint warnings | `no-console` warnings reduced — remaining are accepted Logger internals | P3       |
| GitHub secret | `SUPABASE_LOCAL_SERVICE_ROLE_KEY` must be set for CI seed               | P1       |
| Env Sync      | Ensure `NEXT_PUBLIC_SENTRY_DSN` is set in production for scrubbing      | P1       |
| PR merge      | PR #69 (`fix/e2e-auth-stabilization`) open, awaiting CI green + review  | P1       |

## Quality Gates (current status)

```
npm run typecheck   → ✅  0 errors
npm run lint        → ✅  0 errors
npm run test        → ✅  18/18 passing
npm run e2e         → ✅  15/15 passing  (local, 2026-04-17)
```

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript 5 (strict mode, `useUnknownInCatchVariables`)
- **Auth**: Supabase Auth SSR (`@supabase/ssr`)
- **Database**: PostgreSQL via Prisma 7
- **Validation**: Zod 3
- **AI**: Google Genkit 1.31 + Gemini 2.5 Flash
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **Testing**: Vitest 4 (3 files, 14 unit tests) + Playwright 1.59 (15 E2E scenarios)
- **CI**: GitHub Actions (quality + test + e2e jobs)
- **Local E2E DB**: Supabase CLI (`supabase start` → ports 54321/54322)

## Key Files

| Path                                   | Role                                               |
| -------------------------------------- | -------------------------------------------------- |
| `src/app/dashboard/`                   | Admin portal pages                                 |
| `src/app/aluno/`                       | Student portal pages                               |
| `src/lib/actions/`                     | Server Actions (auth, alunos, treinos, financeiro) |
| `src/lib/auth.ts`                      | `requireRole()` helper                             |
| `src/services/`                        | Business logic (XP, streaks)                       |
| `src/ai/flows/`                        | Genkit AI flows                                    |
| `prisma/schema.prisma`                 | DB schema                                          |
| `prisma/seed.ts`                       | Dev seed data                                      |
| `prisma/seed-e2e.ts`                   | E2E seed (4 users, fixed UUIDs, purge-on-reseed)   |
| `docs/security/THREAT-MODEL.md`        | STRIDE analysis (17 threats)                       |
| `docs/operations/RUNBOOK.md`           | Local setup, deploy, migrations, secrets           |
| `docs/operations/INCIDENT-RESPONSE.md` | P1/P2/P3 response procedure                        |
| `docs/observability/SLOS.md`           | 5 SLOs with error budgets                          |
| `docs/process/RFC-TEMPLATE.md`         | RFC template                                       |
| `docs/process/POSTMORTEM-TEMPLATE.md`  | Postmortem template                                |

## Phase Progress (004-elite-workflow-setup)

| Phase | Description                     | Status      |
| ----- | ------------------------------- | ----------- |
| 1–3   | Governance & constitution       | ✅ Complete |
| 4     | Staging environment (local)     | ✅ Complete |
| 5     | ESLint quality gates            | ✅ Complete |
| 6     | Coverage thresholds             | ✅ Complete |
| 7     | Playwright E2E                  | ✅ Complete |
| 8     | Sentry & Infra Hardening        | ✅ Complete |
| 9     | Tailwind 4 & Type Safety Update | ✅ Complete |

## Technical Debt Governance

The following items are recognized as "Managed Debt" — intentional compromises for compatibility or performance:

1. **Sentry Boundary Casts**: Use of `any` in `beforeSend` (suppressed with `eslint-disable`) is required due to Sentry SDK interface rigidness.
2. **Logger internals**: `Logger` uses `console.*` internally — these are the only remaining `no-console` warnings and are acceptable as the structured logging layer.
3. **Prisma Type Overrides**: We use `@pg/types` pinning to resolve Prisma 7/Next 15 conflicts until `@prisma/adapter-pg` upstream fixes land.

## Known Issues

- GitHub Secrets for CI (Playwright) require one-time manual setup.
- Transitive dependency vulnerabilities in `@prisma/dev` (not reachable in production).
- `isRedirectError` must be imported from `next/dist/client/components/redirect-error` (not `next/navigation`) — no public API yet in Next.js 15.

## Update Protocol

Update this file at the start of every AI session and after every major phase completion.
Format: bullet points, dated, under the relevant section.
