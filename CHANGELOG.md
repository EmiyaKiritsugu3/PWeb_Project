# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
