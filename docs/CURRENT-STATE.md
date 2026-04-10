# Current State — Five Star Academy

**Last Updated**: 2026-04-10
**Branch**: `004-elite-workflow-setup`
**Version**: 0.4.0 (pre-release)

## What Works Today

| Feature                                     | Status     | Notes                          |
| ------------------------------------------- | ---------- | ------------------------------ |
| Admin login                                 | ✅ Working | Supabase Auth SSR              |
| Student login (Portal do Aluno)             | ✅ Working | Separate session               |
| Admin dashboard                             | ✅ Working | GERENTE + RECEPCIONISTA        |
| Financial routes (`/financeiro`, `/planos`) | ✅ Working | GERENTE-only gate              |
| Student workout view                        | ✅ Working | `meus-treinos`                 |
| AI workout generator                        | ✅ Working | Genkit + Gemini                |
| Student enrollment                          | ✅ Working | Admin creates aluno            |
| Gamification (XP, streaks)                  | ✅ Working | Hook `use-workout-tracker`     |
| Prisma migrations                           | ✅ Tracked | `prisma/migrations/`           |
| ESLint quality gate                         | ✅ Done    | 0 errors — `any` + unused vars |
| TypeScript typecheck                        | ✅ Clean   | 0 errors (strict mode)         |
| Unit tests                                  | ✅ Passing | 14/14 (Vitest)                 |
| Ops documentation                           | ✅ Done    | Runbook, SLOs, threat model    |
| Process documentation                       | ✅ Done    | RFC + Postmortem templates     |
| Local E2E stack                             | ✅ Done    | `supabase start` (Docker)      |
| E2E seed script                             | ✅ Done    | `prisma/seed-e2e.ts` (4 users) |

## What Is Incomplete

| Area                | Gap                                          | Priority |
| ------------------- | -------------------------------------------- | -------- |
| E2E tests           | Playwright not configured yet                | P1       |
| Sentry              | Not installed (manual step required first)   | P2       |
| Coverage thresholds | No thresholds enforced in `vitest.config.ts` | P2       |
| CI E2E job          | GitHub Actions E2E job not yet added         | P1       |
| Lint warnings       | 30 `no-console` warnings remain (not errors) | P3       |

## Quality Gates (current status)

```
npm run typecheck   → ✅  0 errors
npm run lint        → ✅  0 errors  (30 warnings: no-console)
npm run test        → ✅  14/14 passing
npm run e2e         → ⏳  not yet configured
```

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript 5 (strict mode, `useUnknownInCatchVariables`)
- **Auth**: Supabase Auth SSR (`@supabase/ssr`)
- **Database**: PostgreSQL via Prisma 7
- **Validation**: Zod 3
- **AI**: Google Genkit 1.31 + Gemini 2.5 Flash
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **Testing**: Vitest 4 (3 files, 14 tests) — no E2E yet
- **CI**: GitHub Actions (lint + test jobs)
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
| 6     | Coverage thresholds         | ⏳ Next     |
| 7     | Playwright E2E              | ⏳ Pending  |
| 8     | Sentry error tracking       | ⏳ Pending  |
| 9     | Polish & PR                 | ⏳ Pending  |

## Known Issues

- 30 `no-console` warnings in server actions and `data.ts` — accepted for now (server-side debug logging)
- `npm run e2e` exists in `package.json` but Playwright is not yet installed/configured
- `.env.staging` must be created manually from `.env.example` before running E2E

## Update Protocol

Update this file at the start of every AI session and after every major phase completion.
Format: bullet points, dated, under the relevant section.
