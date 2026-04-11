# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — 2026-04-11 — Sentry & Build Stability

### Added

- **Sentry v10 Modernization**: migrated to Next.js 15 standards using `src/instrumentation-client.ts` for navigation tracing.
- **Privacy-First Replays**: enabled Sentry Replay with `maskAllText: true` to prevent PII leakage while maintaining UI debugability.
- **Full-stack User Traceability**: linked Supabase UUID/Email to Sentry context on both client (`SupabaseAuthProvider`) and server (`getUser` helper).
- **Project Linking**: Successfully transitioned to the specific `smartmanagementesystem` Sentry environment with CLI binding for automated releases.
- **Vercel CI/CD Integration**: Linked Sentry to Vercel for automated environment variable synchronization and sourcemap deployments.

### Changed

- **Sentry Config Tree-shaking**: replaced deprecated `disableLogger` with `bundleSizeOptimizations` in `next.config.ts` to silence build warnings.

### Fixed

- **ESLint Flat Config**: repaired missing `@typescript-eslint` plugin and parser configuration in `eslint.config.mjs` that was breaking production builds.

## [0.4.0] — 2026-04-10 — Elite Workflow Setup (004)

### Added

- **ESLint quality gates**: `no-explicit-any` and `no-unused-vars` (with `caughtErrorsIgnorePattern`) set to error; 0 errors across entire codebase
- **Coverage thresholds**: per-glob Vitest thresholds on `src/lib/utils.ts`, `src/lib/auth.ts`, `src/services/**`; server actions excluded (covered by E2E)
- **Playwright E2E suite**: 15 scenarios across 4 spec files (auth, financial-access, nav-visibility, student-portal); local Supabase CLI stack with deterministic seed users
- **CI E2E job**: GitHub Actions job starts Supabase, runs migrations, seeds test users, executes Playwright; 3 secrets configured
- **Sentry error tracking**: `@sentry/nextjs` with `instrumentation-client.ts`, `instrumentation.ts`, `global-error.tsx`; `withSentryConfig` with source map upload and tunnel route
- **Prisma `@@map` directives**: all models mapped to lowercase plural table names (matches Supabase REST API)
- **Ops documentation**: RUNBOOK, INCIDENT-RESPONSE, SLOs, threat model (17 STRIDE threats), RFC and postmortem templates
- **Constitution & governance**: `.specify/memory/constitution.md` with 5 principles; CLAUDE.md auto-generated

### Fixed

- Supabase REST API table name mismatch: `Funcionario` → `funcionarios` via `@@map`
- Prisma seed adapter: `Pool + PrismaPg` required when datasource has no `url`
- E2E port conflict: moved Next.js dev server to port 3001 (Supabase MCP occupies 3000)

## [Unreleased]

### Added

- `src/app/actions/auth.ts` — Server Action for authentication: Zod validation, Supabase SSR `signInWithPassword`, role-based redirect (`/dashboard` for staff, `/aluno` for students)
- `docs/pdr/PDR-001-core-system.md` — Consolidated product requirements (RF01–RF09, US00–US07, NFRs, Risks) translated from legacy Portuguese documents
- `docs/specs/SPEC-001-data-models.md` — ERD (Mermaid) and full data dictionary translated to professional standards
- `docs/specs/SPEC-002-auth-implementation.md` — Technical implementation plan for US00 (Authentication)
- `docs/pdr/MILESTONES.md` — Iteration plan (It0–It5) and release schedule (v0.1.0, v0.5.0, v1.0.0 MVP)
- `docs/decisions/ADR-001-professional-workflow-tooling.md` — Architecture Decision Record for all tooling choices
- `docs/archive/` — archived legacy documents (tech_stack, workflows, architecture, project, stories); gitignored and excluded from AI context
- `AGENTS.md` — rewritten from scratch with real project context (workflow, project map, architecture constraints, commit conventions)
- `CONTRIBUTING.md` — canonical contributor guide with workflow, commit conventions, and tech stack reference
- Prettier with opinionated config (single quotes, 100-char width, ES5 trailing commas)
- Enhanced ESLint config (Prettier integration + `no-explicit-any`, `no-unused-vars`, `no-console` rules)
- Husky v9 pre-commit hooks (lint-staged) and commit-msg validation (commitlint)
- commitlint with `@commitlint/config-conventional` — commit message format enforced programmatically
- Vitest coverage via `@vitest/coverage-v8` with phase-gated thresholds
- `.github/workflows/ci.yml` — two-job CI pipeline (quality gates → tests + coverage)
- `.github/dependabot.yml` — weekly automated npm dependency updates
- `.github/pull_request_template.md` — structured PR checklist
- `.editorconfig` — editor-agnostic indent, line endings, and charset standardization
- `CONTRIBUTING.md` — canonical contributor guide
- `CHANGELOG.md` — this file, initialized following Keep a Changelog 1.1.0
- `docs/decisions/` directory for Architecture Decision Records

### Changed

- `npm run lint` changed from `next lint` (broken due to circular reference in `FlatCompat` + `eslint-config-next` v16) to `eslint src` using native flat config import
- ESLint config rewritten to use `eslint-config-next/core-web-vitals` native flat config — no more `FlatCompat`
- Vitest `include` scoped to `src/**/*.test.{ts,tsx}` only — excludes `.aiox-core/` internal tooling (5 failing test files not related to the application)
- Vitest adds `@vitest/coverage-v8` coverage provider; no hard thresholds until test suite reaches meaningful breadth

### Fixed

- `react/no-unescaped-entities` in `src/app/dashboard/planos/page.tsx` — escaped `"` to `&ldquo;`/`&rdquo;`
- `react/no-unescaped-entities` in `src/components/dashboard/aluno/card-feedback.tsx` — escaped `"` to `&ldquo;`/`&rdquo;`

### Added (It2 — Core Admin)

- `src/app/dashboard/alunos/[id]/page.tsx` — Student detail page (profile card, gamification stats, enrollment history, last 10 payments, active workouts list)
- `src/lib/data.ts#getAlunoDetalhes` — Prisma query with full Aluno graph (Matriculas+Plano, Pagamentos, Treinos+Exercicios, HistoricoTreinos)
- `src/app/dashboard/planos/planos-client.tsx` — Plans CRUD client: card grid with edit/delete per card, AlertDialog confirmation, router.refresh() sync
- `src/components/dashboard/planos/form-plano.tsx` — Plans form (React Hook Form + Zod): nome, preco, duracaoDias
- `src/lib/actions/planos.ts` — Server Actions: createPlanoAction, updatePlanoAction, deletePlanoAction with auth guard + Zod
- `src/app/dashboard/_components/user-menu.tsx` — User header dropdown (avatar, display name, logout via Server Action)
- `logout()` Server Action in `auth.ts` — server-side signOut + redirect to /login
- `'Ver Detalhes'` action in student table dropdown — navigates to /dashboard/alunos/[id]

### Changed (US01 — Student Management)

- `src/utils/supabase/middleware.ts` — added `getUser()` call, unauthenticated redirect to `/login`, role-based routing: funcionário on `/aluno/**` → `/dashboard`, aluno on `/dashboard/**` → `/aluno`
- `src/components/dashboard/alunos/data-table.tsx` — added search/filter input (column filter) and sortable column headers using TanStack Table `getFilteredRowModel` + `getSortedRowModel`
- `src/components/dashboard/alunos/columns.tsx` — extracted `AlunoActionsCell` component to fix `useToast()` Rules of Hooks violation; enabled sorting on `nomeCompleto`, `dataCadastro`, `statusMatricula`
- `src/app/dashboard/alunos/alunos-client.tsx` — added `router.refresh()` after each successful mutation (create/update/delete/matricula) to sync server revalidation with client state; replaced `any` types with `Aluno`, `Plano`, `AlunoFormValues`
- `src/components/dashboard/alunos/form-aluno.tsx` — exported `FormValues` type for shared use in `alunos-client.tsx`

### Fixed (US01)

- Table not updating after CRUD: `revalidatePath` was server-only; client now calls `router.refresh()` on success
- `useToast()` called inside TanStack Table `cell` render function (Rules of Hooks violation) — moved to `AlunoActionsCell` React component
- `props typed as `any[]`in`alunos-client.tsx`— now`Aluno[]`and`Plano[]` with full type safety

### Known Technical Debt (surfaced by enabling linting)

- ~100 `@typescript-eslint/no-explicit-any` warnings across multiple files (set to `warn` pending type-cleanup sprint)
- 70 `@typescript-eslint/no-unused-vars` warnings (dead imports, set to `warn` pending cleanup sprint)
- 3 `react-hooks/set-state-in-effect` instances in hooks/components (real performance bugs)

## [Unreleased] - 2026-04-09 (Session 3)

### Added

- `src/lib/auth.ts` — `requireRole(allowedRole: Role)` server helper: fetches `funcionarios.role` from Supabase, redirects to `/login` if unauthenticated, redirects to `/dashboard` on role mismatch (fail-closed)
- `src/lib/auth.test.ts` — 5 unit tests for `requireRole`: correct role passes, wrong role redirects, unauthenticated redirects, DB error fails closed, null role fails closed
- `src/lib/constants.ts` — `FINANCIAL_ROUTES` constant (`['/dashboard/financeiro', '/dashboard/planos']`) as single source of truth for role-gated routes

### Changed (US00 — Financial Role Access)

- `src/utils/supabase/middleware.ts` — added GERENTE-only gate for `FINANCIAL_ROUTES`: non-GERENTE funcionários are redirected to `/dashboard` on financial route access; also fixed `isAlunoRoute` to exclude `/aluno/login` so unauthenticated users can reach the student login page
- `src/components/dashboard-nav.tsx` — accepts `role: string` prop; hides financial nav links for non-GERENTE users
- `src/app/dashboard/layout.tsx` — fetches `funcionarioPerfil.role` after auth, defaults to `'RECEPCIONISTA'` (fail-closed), passes `role` to `<DashboardNav>`
- `src/app/dashboard/financeiro/page.tsx` — added `await requireRole(Role.GERENTE)` guard
- `src/app/dashboard/planos/page.tsx` — added `await requireRole(Role.GERENTE)` guard
- `prisma/seed.ts` — added Maria Gerente and Carlos Recepcionista to seed data alongside João Instrutor

### Fixed

- Portal do Aluno inaccessible: middleware treated `/aluno/login` as a protected route, causing a silent redirect loop back to `/login` for unauthenticated users (`src/utils/supabase/middleware.ts`)
- `src/app/actions/auth.ts` — `redirect('/aluno')` changed to `redirect('/aluno/dashboard')`; `/aluno` has no page, causing a 404 after successful aluno login

### Fixed (deps)

- Resolved HIGH severity vulnerabilities: defu prototype pollution (`GHSA-737v-mqg7-c878`) and Vite path traversal (`GHSA-4w7w-66w2-5vf9`) via `npm audit fix`

## [Unreleased] - 2026-04-09 (Session 2)

### Fixed

- Eliminated redundant re-render loops in Dashboard and Workout components by removing synchronous `setState` in `useEffect`.
- Implemented typed casts for Genkit streaming results, removing unsafe `any` usage.
- Enforced strict type safety in server actions (`alunos.ts`, `treinos.ts`) and data fetchers (`data.ts`).
- Fixed E2E test script payloads to match the updated `Aluno` schema.

## [1.0.0] - 2026-04-08

### Added

- Next.js 15 App Router with TypeScript strict mode
- Supabase Auth (SSR) + PostgreSQL via Prisma ORM
- Shadcn/UI component library + Tailwind CSS v4 + Framer Motion
- Google Genkit AI integration (Gemini models) for workout generation and feedback
- Gamification system: XP, levels, streaks for student portal
- Admin dashboard: student CRM, financial monitoring, AI workout generator
- Student portal: daily workout execution, personal workout management
- CodeQL static analysis workflow (weekly + on push/PR to main)
- Vitest test suite with React Testing Library (275 tests)
