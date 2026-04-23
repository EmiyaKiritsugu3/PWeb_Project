# Current State — Five Star Academy

**Last Updated**: 2026-04-23
**Branch**: `main`
**Version**: 1.1.0 (v4.1.0 Core)

## What Works Today

| Feature                         | Status     | Notes                                                     |
| ------------------------------- | ---------- | --------------------------------------------------------- |
| React 19 Engine                 | ✅ Active  | Optimized for Next.js 15.5                                |
| SSR Caching (getUser)           | ✅ Active  | Native `React.cache()` for high-performance auth checks   |
| Row Level Security (RLS)        | ✅ Active  | 100% table coverage in Supabase                           |
| Admin login                     | ✅ Working | Supabase Auth SSR                                         |
| Student login (Portal do Aluno) | ✅ Working | Separate session                                          |
| Admin dashboard                 | ✅ Working | GERENTE + RECEPCIONISTA                                   |
| Financial dashboard             | ✅ Working | Real-time billing and revenue metrics                     |
| Student workout view            | ✅ Working | `meus-treinos`                                            |
| AI workout generator            | ✅ Working | Genkit + Gemini                                           |
| Unit tests                      | ✅ Passing | 54/54 (Vitest — 9 files; 100% green on R19)               |
| Playwright E2E suite            | ✅ Done    | 20 scenarios (Verified local build + CI sync)             |
| Sentry error tracking           | ✅ Active  | **v10.49.0** — Deep PII scrubbing enabled                 |
| Knowledge Graph                 | ✅ Active  | **Graphify** + **Socraticode** integrated into AI session |

## Quality Gates (current status)

```
npm run typecheck   → ✅  0 errors
npm run lint        → ✅  0 errors
npm run test        → ✅  54/54 passing
npm run e2e         → ✅  20/20 scenarios passing in CI
npm run build       → ✅  production build succeeds
```

## Tech Stack

- **Framework**: Next.js 15.5 App Router
- **Runtime**: Node.js 25 (local) / 22 (CI)
- **Language**: TypeScript 6
- **UI Engine**: **React 19**
- **Auth**: Supabase Auth SSR (@supabase/ssr)
- **Database**: PostgreSQL via Prisma 7 + RLS
- **AI**: Google Genkit 1.32 + Gemini 2.5 Flash
- **Styling**: Tailwind CSS 4 + Shadcn/UI
- **Charts**: Recharts 3
- **Animations**: Framer Motion 12 (motion/react)
- **Monitoring**: Sentry 10 (OpenTelemetry integration)

## Key Files

| Path                               | Role                                            |
| ---------------------------------- | ----------------------------------------------- |
| `src/utils/supabase/server.ts`     | Auth Hub with SSR Caching (`getUser`)           |
| `src/lib/actions/`                 | Consolidated Server Actions (Standardized DTOs) |
| `docs/process/sentinel-log.md`     | **Compiled Brain** (Karpathy workflow log)      |
| `docs/process/wiki-*.md`           | **Synthesis Artifacts** (Architectural memory)  |
| `docs/operations/MIGRATION-R19.md` | Technical Migration Report                      |

## Technical Debt Governance

1. **Peer Dependencies**: `--legacy-peer-deps` remains active in CI for R19 compatibility with Shadcn/Radix primitives until upstream updates.
2. **Node Version Skew**: Local (v25) vs CI (v22). Target alignment to LTS v22 for production releases.

## Update Protocol

Consult `docs/process/sentinel-log.md` before any task.
Update relevant Wiki files after major architectural changes.
