# Current State — Five Star Academy

**Last Updated**: 2026-04-10
**Branch**: `004-elite-workflow-setup`
**Version**: 0.4.0 (pre-release)

## What Works Today

| Feature                                     | Status     | Notes                      |
| ------------------------------------------- | ---------- | -------------------------- |
| Admin login                                 | ✅ Working | Supabase Auth SSR          |
| Student login (Portal do Aluno)             | ✅ Working | Separate session           |
| Admin dashboard                             | ✅ Working | GERENTE + RECEPCIONISTA    |
| Financial routes (`/financeiro`, `/planos`) | ✅ Working | GERENTE-only gate          |
| Student workout view                        | ✅ Working | `meus-treinos`             |
| AI workout generator                        | ✅ Working | Genkit + Gemini            |
| Student enrollment                          | ✅ Working | Admin creates aluno        |
| Gamification (XP, streaks)                  | ✅ Working | Hook `use-workout-tracker` |
| Prisma migrations                           | ✅ Tracked | `prisma/migrations/`       |

## What Is Incomplete

| Area                  | Gap                          | Priority |
| --------------------- | ---------------------------- | -------- |
| E2E tests             | Not configured               | P1       |
| Sentry                | Not installed                | P2       |
| ESLint gates          | 117 warnings (no errors yet) | P2       |
| Coverage thresholds   | No thresholds enforced       | P2       |
| Staging environment   | No isolated DB for E2E       | P1       |
| Security threat model | Not documented               | P1       |
| Operations runbook    | Not documented               | P1       |
| SLOs                  | Not defined                  | P1       |

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript 5 (strict mode)
- **Auth**: Supabase Auth SSR (`@supabase/ssr`)
- **Database**: PostgreSQL via Prisma 7
- **Validation**: Zod 3
- **AI**: Google Genkit 1.31 + Gemini
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **Testing**: Vitest (3 files, 14 tests) — no E2E yet
- **CI**: GitHub Actions (lint + test jobs)

## Key Files

| Path                   | Role                                               |
| ---------------------- | -------------------------------------------------- |
| `src/app/dashboard/`   | Admin portal pages                                 |
| `src/app/aluno/`       | Student portal pages                               |
| `src/lib/actions/`     | Server Actions (auth, alunos, treinos, financeiro) |
| `src/lib/auth.ts`      | `requireRole()` helper                             |
| `src/services/`        | Business logic (XP, streaks)                       |
| `src/ai/flows/`        | Genkit AI flows                                    |
| `prisma/schema.prisma` | DB schema                                          |
| `prisma/seed.ts`       | Dev seed data                                      |

## Known Issues

- 25 `any` violations across 20 files (lint warnings, not errors yet)
- No `seed:e2e` script — staging environment needed first
- `npm run e2e` script does not exist yet

## Update Protocol

Update this file at the start of every AI session and after every major phase completion.
Format: bullet points, dated, under the relevant section.
