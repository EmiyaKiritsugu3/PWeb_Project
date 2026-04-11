# Current State — Five Star Academy

**Last Updated**: 2026-04-11
**Branch**: `fix/telemetry-and-e2e-stability`
**Version**: 0.4.1 (pre-release)

## What Works Today

| Feature                                     | Status        | Notes                          |
| ------------------------------------------- | ------------- | ------------------------------ |
| Admin login                                 | ✅ Working    | Supabase Auth SSR              |
| Student login (Portal do Aluno)             | ✅ Working    | Separate session               |
| Admin dashboard                             | ✅ Working    | GERENTE + RECEPCIONISTA        |
| Financial routes (`/financeiro`, `/planos`) | ✅ Working    | GERENTE-only gate              |
| Student workout view                        | ✅ Working    | `meus-treinos`                 |
| AI workout generator                        | ✅ Working    | Genkit + Gemini                |
| Student enrollment                          | ✅ Working    | Admin creates aluno            |
| Gamification (XP, streaks)                  | ✅ Working    | Hook `use-workout-tracker`     |
| Prisma migrations                           | ✅ Tracked    | `prisma/migrations/`           |
| ESLint quality gate                         | ✅ Done       | 0 errors — `any` + unused vars |
| TypeScript typecheck                        | ✅ Clean      | 0 errors (strict mode)         |
| Unit tests                                  | ✅ Passing    | 18/18 (Vitest)                 |
| Ops documentation                           | ✅ Done       | Runbook, SLOs, threat model    |
| Process documentation                       | ✅ Done       | RFC + Postmortem templates     |
| Local E2E stack                             | ✅ Done       | `supabase start` (Docker)      |
| E2E seed script                             | ✅ Done       | `prisma/seed-e2e.ts` (4 users) |
| Playwright E2E suite                        | ✅ Done       | 15/15 passing                  |
| CI E2E job                                  | ✅ Done       | `.github/workflows/ci.yml`     |
| Sentry error tracking                       | ✅ Modernized | Next.js 15, v10, User Context  |

## What Is Incomplete

| Area          | Gap                                                            | Priority |
| ------------- | -------------------------------------------------------------- | -------- |
| CI security   | 3 moderate vulns in `@prisma/dev` (transitive, non-production) | P3       |
| Lint warnings | 31 `no-console` warnings remain (not errors)                   | P3       |
| GitHub secret | `SUPABASE_LOCAL_SERVICE_ROLE_KEY` must be set for CI seed step | P1       |

## Quality Gates (current status)

```
npm run typecheck   → ✅  0 errors
npm run lint        → ✅  0 errors  (30 warnings: no-console)
npm run test        → ✅  18/18 passing
npm run e2e         → ✅  15/15 passing
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
| `prisma/seed-e2e.ts`                   | E2E seed (4 deterministic users, fixed UUIDs)      |
| `docs/security/THREAT-MODEL.md`        | STRIDE analysis (17 threats)                       |
| `docs/operations/RUNBOOK.md`           | Local setup, deploy, migrations, secrets           |
| `docs/operations/INCIDENT-RESPONSE.md` | P1/P2/P3 response procedure                        |
| `docs/observability/SLOS.md`           | 5 SLOs with error budgets                          |
| `docs/process/RFC-TEMPLATE.md`         | RFC template                                       |
| `docs/process/POSTMORTEM-TEMPLATE.md`  | Postmortem template                                |

## Phase Progress (004-elite-workflow-setup)

| Phase | Description                 | Status      |
| ----- | --------------------------- | ----------- |
| 1–3   | Governance & constitution   | ✅ Complete |
| 4     | Staging environment (local) | ✅ Complete |
| 5     | ESLint quality gates        | ✅ Complete |
| 6     | Coverage thresholds         | ✅ Complete |
| 7     | Playwright E2E              | ✅ Complete |
| 8     | Sentry error tracking       | ✅ Complete |
| 9     | Polish & PR                 | ✅ Complete |

## Known Issues

- 31 `no-console` warnings in server actions and `data.ts` — accepted for now (server-side debug logging)
- `SUPABASE_LOCAL_ANON_KEY` GitHub Actions secret must be set before CI E2E job runs (see RUNBOOK)
- `SUPABASE_LOCAL_SERVICE_ROLE_KEY` GitHub Actions secret must be set for seed step to create test users
- 3 moderate vulnerabilities in `@prisma/dev` (transitive via `prisma@7.7.0`); not reachable in production; awaiting upstream fix

## Update Protocol

Update this file at the start of every AI session and after every major phase completion.
Format: bullet points, dated, under the relevant section.
