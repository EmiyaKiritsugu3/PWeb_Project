# Current State — Five Star Academy

**Last Updated**: 2026-04-22
**Branch**: `feat/009-it5-e2e-payment-status` (T03 PR #83 open — awaiting CI)
**Version**: 0.7.0 (main — T01 + T02 merged; T03 in review)

## What Works Today

| Feature                                     | Status     | Notes                                                                                                  |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| Admin login                                 | ✅ Working | Supabase Auth SSR                                                                                      |
| Student login (Portal do Aluno)             | ✅ Working | Separate session                                                                                       |
| Admin dashboard                             | ✅ Working | GERENTE + RECEPCIONISTA                                                                                |
| Financial routes (`/financeiro`, `/planos`) | ✅ Working | GERENTE-only gate                                                                                      |
| Student workout view                        | ✅ Working | `meus-treinos`                                                                                         |
| AI workout generator                        | ✅ Working | Genkit + Gemini                                                                                        |
| Student enrollment                          | ✅ Working | Admin creates aluno                                                                                    |
| Gamification (XP, streaks)                  | ✅ Working | Hook `use-workout-tracker`                                                                             |
| Prisma migrations                           | ✅ Tracked | `prisma/migrations/`                                                                                   |
| ESLint quality gate                         | ✅ Done    | 0 errors                                                                                               |
| TypeScript typecheck                        | ✅ Clean   | 0 errors (strict mode)                                                                                 |
| AI workout feedback (US06)                  | ✅ Done    | `WorkoutSession.tsx` — Genkit call + try/catch fallback + feedback card                                |
| Unit tests                                  | ✅ Passing | 40/40 (Vitest — 7 files; includes auth + recharts smoke tests)                                         |
| Ops documentation                           | ✅ Done    | Runbook, SLOs, threat model                                                                            |
| Process documentation                       | ✅ Done    | RFC + Postmortem templates                                                                             |
| Local E2E stack                             | ✅ Done    | `supabase start` (Docker)                                                                              |
| E2E seed script                             | ✅ Done    | `prisma/seed-e2e.ts` (7 fixtures: 4 staff+aluno + 1 treino + INADIMPLENTE aluno + plano + matrícula)   |
| Playwright E2E suite                        | ✅ Done    | 20 scenarios (19 It4+It5 auth + payment-status write-path)                                             |
| CI E2E job                                  | ✅ Green   | PR #83 in CI                                                                                           |
| Sentry error tracking                       | ✅ Active  | DSN + auth token set in Vercel; source maps uploaded on every build                                    |
| Structured logging                          | ✅ Done    | `src/lib/logger.ts` (Logger wrapper, Sentry-aware)                                                     |
| INSTRUTOR auth hardening                    | ✅ Merged  | PR #81 — `instrutorId` server-derived, ownership guards, `requireAnyRole` gate on `/dashboard/treinos` |
| recharts 3 upgrade                          | ✅ Merged  | PR #82 — `TooltipContentProps`/`DefaultLegendContentProps` types; dashboard-charts smoke test          |

## It5 Progress — Deliverables

| Deliverable                                | Branch                            | PR  | Status                   |
| ------------------------------------------ | --------------------------------- | --- | ------------------------ |
| T01 — INSTRUTOR auth hardening             | `feat/007-it5-instrutor-auth`     | #81 | ✅ Merged                |
| T02 — recharts 2 → 3 upgrade + ADR-005     | `feat/008-it5-recharts3`          | #82 | ✅ Merged                |
| T03 — E2E payment-status write-path        | `feat/009-it5-e2e-payment-status` | #83 | ⏳ In review (CI)        |
| T04 — E2E session expiry → redirect        | `feat/010-it5-e2e-session-expiry` | —   | 🔜 Next                  |
| T05 — Histórico de treinos do aluno        | `feat/011-it5-historico-treinos`  | —   | ⬜ Not started           |
| T06 — Progresso visual (XP + streak chart) | `feat/012-it5-progresso-visual`   | —   | ⬜ Not started (dep T02) |
| T07 — Export CSV (alunos + financeiro)     | `feat/013-it5-export-csv`         | —   | ⬜ Not started           |
| T08 — Avaliações físicas (CRUD)            | `feat/014-it5-avaliacoes-fisicas` | —   | ⬜ Not started           |
| T09 — Rating de exercícios (feed IA)       | `feat/015-it5-rating-exercicios`  | —   | ⬜ Not started           |
| T10 — Docs encerramento + v1.0.0 tag       | `chore/016-it5-wrap-docs`         | —   | ⬜ Not started           |

## What Is Incomplete

| Area        | Gap                                                               | Priority |
| ----------- | ----------------------------------------------------------------- | -------- |
| T03 CI      | PR #83 awaiting CI green + CodeRabbit review                      | P1       |
| T04 E2E     | Session expiry scenario — needs token revocation strategy         | P2       |
| CI security | 3 moderate vulns in `@prisma/dev` (transitive, awaiting upstream) | P3       |
| `@types/pg` | Pinned at `8.11.11` — needs manual compat check                   | P3       |

## Quality Gates (current status)

```
npm run typecheck   → ✅  0 errors
npm run lint        → ✅  0 errors
npm run test        → ✅  40/40 passing (7 files)
npm run e2e         → ⏳  20 scenarios (19 confirmed; #20 payment-status needs local E2E run)
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
- **Charts**: recharts 3 (upgraded from 2 in T02)
- **Testing**: Vitest 4 (7 files, 40 unit tests) + Playwright 1.59 (20 E2E scenarios)
- **CI**: GitHub Actions (quality + test + e2e jobs)
- **Local E2E DB**: Supabase CLI (`supabase start` → ports 54321/54322)

## Key Files

| Path                                            | Role                                                          |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `src/app/dashboard/`                            | Admin portal pages                                            |
| `src/app/aluno/`                                | Student portal pages                                          |
| `src/lib/actions/`                              | Server Actions (auth, alunos, treinos, financeiro)            |
| `src/lib/auth.ts`                               | `requireRole()` + `requireAnyRole()` (It5 — live)             |
| `src/components/ui/chart.tsx`                   | recharts 3 chart wrapper (TooltipContentProps types fixed)    |
| `src/components/dashboard/dashboard-charts.tsx` | Admin dashboard charts                                        |
| `src/services/`                                 | Business logic (XP, streaks)                                  |
| `src/ai/flows/`                                 | Genkit AI flows                                               |
| `prisma/schema.prisma`                          | DB schema                                                     |
| `prisma/seed.ts`                                | Dev seed data                                                 |
| `prisma/seed-e2e.ts`                            | E2E seed (fixed UUIDs, purge-on-reseed, INADIMPLENTE fixture) |
| `tests/e2e/specs/payment-status.spec.ts`        | Payment write-path E2E (T03)                                  |
| `docs/security/THREAT-MODEL.md`                 | STRIDE analysis (17 threats)                                  |
| `docs/operations/RUNBOOK.md`                    | Local setup, deploy, migrations, secrets                      |
| `docs/operations/INCIDENT-RESPONSE.md`          | P1/P2/P3 response procedure                                   |
| `docs/observability/SLOS.md`                    | 5 SLOs with error budgets                                     |
| `docs/process/RFC-TEMPLATE.md`                  | RFC template                                                  |
| `docs/process/POSTMORTEM-TEMPLATE.md`           | Postmortem template                                           |

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

→ Maintained in [`tests/e2e/CRITICAL-PATHS.md`](../tests/e2e/CRITICAL-PATHS.md) — Lessons Learned section (12 validated patterns across It2–It5).

## Update Protocol

Update this file at the start of every AI session and after every major phase completion.
Format: bullet points, dated, under the relevant section.
