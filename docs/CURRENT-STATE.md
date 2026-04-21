# Current State — Five Star Academy

**Last Updated**: 2026-04-21
**Branch**: `feat/007-it5-instrutor-auth` (It5 — T01 in progress)
**Version**: 0.7.0 (It4 base — It5 hardening not yet merged)

## What Works Today

| Feature                                     | Status     | Notes                                                                                           |
| ------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| Admin login                                 | ✅ Working | Supabase Auth SSR                                                                               |
| Student login (Portal do Aluno)             | ✅ Working | Separate session                                                                                |
| Admin dashboard                             | ✅ Working | GERENTE + RECEPCIONISTA                                                                         |
| Financial routes (`/financeiro`, `/planos`) | ✅ Working | GERENTE-only gate                                                                               |
| Student workout view                        | ✅ Working | `meus-treinos`                                                                                  |
| AI workout generator                        | ✅ Working | Genkit + Gemini                                                                                 |
| Student enrollment                          | ✅ Working | Admin creates aluno                                                                             |
| Gamification (XP, streaks)                  | ✅ Working | Hook `use-workout-tracker`                                                                      |
| Prisma migrations                           | ✅ Tracked | `prisma/migrations/`                                                                            |
| ESLint quality gate                         | ✅ Done    | 0 errors — `any` + unused vars                                                                  |
| TypeScript typecheck                        | ✅ Clean   | 0 errors (strict mode)                                                                          |
| AI workout feedback (US06)                  | ✅ Done    | `WorkoutSession.tsx` — Genkit call + try/catch fallback + feedback card                         |
| Unit tests                                  | ✅ Passing | 22/22 (Vitest)                                                                                  |
| Ops documentation                           | ✅ Done    | Runbook, SLOs, threat model                                                                     |
| Process documentation                       | ✅ Done    | RFC + Postmortem templates                                                                      |
| Local E2E stack                             | ✅ Done    | `supabase start` (Docker)                                                                       |
| E2E seed script                             | ✅ Done    | `prisma/seed-e2e.ts` (5 fixtures: 4 users + 1 treino with 2 exercícios)                         |
| Playwright E2E suite                        | ✅ Done    | 18 scenarios (+ instrutor-workflow: INSTRUTOR assigns workout → ALUNO sees "Do Personal" badge) |
| CI E2E job                                  | ✅ Green   | 18/18 passing locally (It4); 17/17 in last CI (PR #72); PR pending                              |
| Sentry error tracking                       | ✅ Active  | DSN + auth token set in Vercel; source maps (92) uploaded on every build                        |
| Structured logging                          | ✅ Done    | `src/lib/logger.ts` (Logger wrapper, Sentry-aware)                                              |
| Dependencies                                | ✅ Updated | All patch/minor bumped via PR #70; lockfile clean                                               |

## It5 Progress (007-it5-instrutor-auth)

**Spec**: `specs/007-it5-instrutor-auth/` — all Phase 0–1 artifacts complete (spec, plan, research, data-model, quickstart, tasks)
**12 tasks planned** — implementation not yet started

| Task | Description                                                  | Status     |
| ---- | ------------------------------------------------------------ | ---------- |
| T001 | Add `requireAnyRole` to `src/lib/auth.ts`                    | ⏳ Pending |
| T002 | Create failing E2E negative test                             | ⏳ Pending |
| T003 | Gate `/dashboard/treinos` with `requireAnyRole`              | ⏳ Pending |
| T004 | Write failing unit tests for `upsertTreinoAction`            | ⏳ Pending |
| T005 | Remove `instrutorId` from `TreinoBaseSchema`                 | ⏳ Pending |
| T006 | Harden `upsertTreinoAction` (derive instrutorId server-side) | ⏳ Pending |
| T007 | Remove `instrutorId` prop from `TreinosManagementClient`     | ⏳ Pending |
| T008 | Remove `getUser` + `instrutorId` prop from `TreinosPage`     | ⏳ Pending |
| T009 | Write failing ownership unit tests                           | ⏳ Pending |
| T010 | Add ownership check to `updateTreinoDayAction`               | ⏳ Pending |
| T011 | Add ownership check to `deleteTreinoAction`                  | ⏳ Pending |
| T012 | Update `CRITICAL-PATHS.md` 18 → 19 scenarios                 | ⏳ Pending |

## What Is Incomplete

| Area          | Gap                                                                                                                                    | Priority         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Auth gap**  | `upsertTreinoAction` accepts client-supplied `instrutorId`; no ownership check on update/delete; `/dashboard/treinos` has no role gate | **P1 — It5 T01** |
| CI security   | 3 moderate vulns in `@prisma/dev` (transitive, awaiting upstream)                                                                      | P3               |
| Lint warnings | `no-console` warnings reduced — remaining are accepted Logger internals                                                                | P3               |
| `@types/pg`   | Pinned at `8.11.11` — dependabot PR #63 open, needs manual compat check                                                                | P3               |

## Quality Gates (current status)

```
npm run typecheck   → ✅  0 errors
npm run lint        → ✅  0 errors
npm run test        → ✅  22/22 passing
npm run e2e         → ✅  18/18 passing  (local, 2026-04-19 — It4)
npm run build       → ✅  production build succeeds
```

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript 5 (strict mode, `useUnknownInCatchVariables`)
- **Auth**: Supabase Auth SSR (`@supabase/ssr`)
- **Database**: PostgreSQL via Prisma 7
- **Validation**: Zod 3
- **AI**: Google Genkit 1.32 + Gemini 2.5 Flash
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **Testing**: Vitest 4 (5 files, 22 unit tests) + Playwright 1.59 (18 E2E scenarios)
- **CI**: GitHub Actions (quality + test + e2e jobs)
- **Local E2E DB**: Supabase CLI (`supabase start` → ports 54321/54322)

## Key Files

| Path                                   | Role                                               |
| -------------------------------------- | -------------------------------------------------- |
| `src/app/dashboard/`                   | Admin portal pages                                 |
| `src/app/aluno/`                       | Student portal pages                               |
| `src/lib/actions/`                     | Server Actions (auth, alunos, treinos, financeiro) |
| `src/lib/auth.ts`                      | `requireRole()` + `requireAnyRole()` (It5 pending) |
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

## It3 Progress (005-it3-ai-workouts)

| Task | Description                                          | Status      |
| ---- | ---------------------------------------------------- | ----------- |
| T001 | Baseline gates                                       | ✅ Complete |
| T002 | Seed: Treino E2E (2 exercícios)                      | ✅ Complete |
| T003 | Unit test: `workout-feedback-flow.test.ts`           | ✅ Complete |
| T004 | `WorkoutSession.tsx`: feedback integration (US06)    | ✅ Complete |
| T005 | E2E: `workout-session.spec.ts`                       | ✅ Complete |
| T006 | E2E: `enrollment.spec.ts`                            | ✅ Complete |
| T007 | `data-testid="workout-feedback-card"` + `xp-display` | ✅ Complete |
| T008 | `CRITICAL-PATHS.md`: 15 → 17 scenarios               | ✅ Complete |
| T009 | Final quality gates (lint + typecheck + test + e2e)  | ✅ Complete |

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

## E2E Selector Patterns

→ Maintained in [`tests/e2e/CRITICAL-PATHS.md`](../tests/e2e/CRITICAL-PATHS.md) — Lessons Learned section (12 validated patterns across It2–It4).

## Update Protocol

Update this file at the start of every AI session and after every major phase completion.
Format: bullet points, dated, under the relevant section.
