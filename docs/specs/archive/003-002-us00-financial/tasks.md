---
description: 'Task list for Financial Role Access Control'
---

# Tasks: Financial Role Access Control

**Input**: Design documents from `specs/003-002-us00-financial/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅

**Tests**: Required for `requireRole()` helper per Constitution Principle III (business logic
in `src/lib/` MUST have unit tests). TDD applies to Phase 2 only.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm the current baseline before any changes so regressions are
detected immediately.

- [x] T001 Run `npm run typecheck` and record current error count (expected: 0; document either way)
- [x] T002 Run `npm run lint` and record any existing violations in affected files: `src/utils/supabase/middleware.ts`, `src/app/dashboard/layout.tsx`, `src/components/dashboard-nav.tsx`, `src/app/dashboard/financeiro/page.tsx`, `src/app/dashboard/planos/page.tsx`
- [x] T003 Verify seed data: run `npx prisma studio` or inspect the `funcionarios` table to confirm at least one GERENTE, one RECEPCIONISTA, and one INSTRUTOR row exist — if missing, update `prisma/seed.ts` to add them

**Checkpoint**: Baseline recorded. Proceed to Phase 2.

---

## Phase 2: Foundational — `requireRole()` Helper (TDD)

**Purpose**: Implement the shared auth helper that US4 page guards depend on.
This is the only new business logic; it MUST have tests before implementation (Constitution III).

**⚠️ CRITICAL**: T005 must complete before Phase 5 (US4) can begin.

> **Write the test first — it MUST fail before T005 begins.**

- [x] T004 Write a failing unit test for `requireRole` in `src/lib/auth.test.ts` (create file): test cases — (a) resolves without redirect when user has correct role, (b) calls `redirect('/dashboard')` when user has wrong role, (c) calls `redirect('/login')` when no authenticated user; mock `createClient()` from `@/utils/supabase/server` and Supabase queries
- [x] T005 Implement `requireRole(allowedRole: Role): Promise<void>` in `src/lib/auth.ts` (create file): call `createClient()`, get user via `supabase.auth.getUser()`, redirect to `/login` if no user; query `supabase.from('funcionarios').select('role').eq('id', user.id).maybeSingle()`, redirect to `/dashboard` on DB error or if role !== allowedRole; import `Role` from `@prisma/client`

**Checkpoint**: Run `npm test` — T004 tests must pass (green). Proceed to Phase 3.

---

## Phase 3: User Stories 1 & 2 — Core Security via Middleware (Priority: P1) 🎯 MVP

**Goal**: Enforce that GERENTE passes through freely (US1) and non-GERENTE is blocked
from financial routes (US2) at the middleware layer — before any page code runs.

**Independent Test**: Log in as GERENTE → navigate to `/dashboard/financeiro` → renders normally.
Log in as RECEPCIONISTA → navigate to `/dashboard/financeiro` → redirected to `/dashboard`.
Log in as INSTRUTOR → navigate to `/dashboard/planos` → redirected to `/dashboard`.

### Implementation for US1 + US2

- [x] T006 [US1] [US2] Update `src/utils/supabase/middleware.ts` — inside `updateSession`, after the existing `funcionarioProfile` check, add: (a) a `const FINANCIAL_ROUTES = ['/dashboard/financeiro', '/dashboard/planos'] as const` constant; (b) a check `const isFinancialRoute = FINANCIAL_ROUTES.some(r => pathname.startsWith(r))`; (c) when `isFuncionario && isFinancialRoute`: query `supabase.from('funcionarios').select('role').eq('id', user.id).maybeSingle()` and redirect to `/dashboard` if `data?.role !== 'GERENTE'` or if the query errors (fail-closed)

**Checkpoint**: User Stories 1 & 2 complete. Run `npm run typecheck` — must pass.
Manual test: GERENTE sees financeiro ✅, RECEPCIONISTA is redirected ✅.

---

## Phase 4: User Story 3 — Nav Hides Financial Links for Non-GERENTE (Priority: P2)

**Goal**: Remove "Financeiro" and "Planos" nav items from the sidebar for non-GERENTE
users so they never see links to routes they cannot access.

**Independent Test**: Log in as RECEPCIONISTA → sidebar must not show "Financeiro" or
"Planos". Log in as GERENTE → sidebar must show both items as before.

### Implementation for US3

- [x] T007 [US3] Update `src/components/dashboard-nav.tsx` — add `interface DashboardNavProps { role: string }` and update the `DashboardNav` function signature to accept this prop; inside the component, derive `const financialItems = ['/dashboard/financeiro', '/dashboard/planos']` and filter `navItems` to exclude items whose `href` is in `financialItems` when `role !== 'GERENTE'`; use the filtered list in the JSX render
- [x] T008 [US3] Update `src/app/dashboard/layout.tsx` — after the existing `supabase.auth.getUser()` call, add a second query: `const { data: funcionarioPerfil } = await supabase.from('funcionarios').select('role').eq('id', user.id).maybeSingle()`; derive `const role = funcionarioPerfil?.role ?? 'RECEPCIONISTA'`; pass `role={role}` to `<DashboardNav role={role} />`

**Checkpoint**: User Story 3 complete. Run `npm run typecheck` — must pass.
Inspect sidebar for both GERENTE and RECEPCIONISTA accounts.

---

## Phase 5: User Story 4 — Server-Side Page Guards (Priority: P3)

**Goal**: Add defense-in-depth role checks directly in the financial Server Components
so they redirect before executing any Prisma query, even if middleware is bypassed.

**Independent Test**: Financial pages must call `requireRole('GERENTE')` before the first
`await` that touches the database.

**Prerequisite**: T005 (`requireRole` helper) must be complete.

### Implementation for US4

- [x] T009 [P] [US4] Update `src/app/dashboard/financeiro/page.tsx` — import `requireRole` from `@/lib/auth`; add `await requireRole('GERENTE')` as the first statement inside `FinanceiroDataWrapper` (before the `prisma.aluno.findMany` call); also add `import { Role } from '@prisma/client'` if needed for the import
- [x] T010 [P] [US4] Update `src/app/dashboard/planos/page.tsx` — import `requireRole` from `@/lib/auth`; add `await requireRole('GERENTE')` as the first statement inside `PlanosDataWrapper` (before the `getPlanos()` call)

**Checkpoint**: User Story 4 complete. Run `npm run typecheck` — must pass.

---

## Phase N: Polish & Verification

**Purpose**: Final validation gate confirming all success criteria are met.

- [x] T011 Run `npm run typecheck` — verify exit code 0 and zero error lines; if errors remain, return to the relevant phase and fix before proceeding
- [x] T012 Run `npm run lint` — verify zero new violations across all modified files
- [x] T013 Run `npm test` — verify all test suites pass including the new `auth.test.ts`; coverage must not decrease
- [ ] T014 Manual smoke test per `specs/003-002-us00-financial/plan.md` Quickstart section: (a) log in as GERENTE — financeiro and planos render ✅, sidebar shows both links ✅; (b) log in as RECEPCIONISTA — both routes redirect to `/dashboard` ✅, sidebar hides both links ✅; (c) log in as INSTRUTOR — same as RECEPCIONISTA ✅

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: No dependencies — start immediately (TDD helper)
- **Phase 3 (US1+US2)**: No dependency on Phase 2 — middleware change is independent of `requireRole`
- **Phase 4 (US3)**: No dependency on Phase 2 or 3 — nav change is independent; can run in parallel with Phase 3
- **Phase 5 (US4)**: Depends on **Phase 2 T005** (`requireRole` must exist before pages import it)
- **Polish (Phase N)**: Depends on all phases complete

### User Story Dependencies

- **US1 + US2 (P1)**: Independent — only `src/utils/supabase/middleware.ts`
- **US3 (P2)**: Independent — `layout.tsx` and `dashboard-nav.tsx` only; can run in parallel with US1+US2
- **US4 (P3)**: Depends on `requireRole` helper (T005) — otherwise independent of US1–US3

### Parallel Opportunities

```bash
# Phases 3 and 4 can run in parallel (different files):
# Thread A: T006            → US1+US2 middleware
# Thread B: T007 → T008     → US3 nav + layout

# Within Phase 5, T009 and T010 are parallel (different pages):
Task: "requireRole guard in financeiro/page.tsx" (T009)
Task: "requireRole guard in planos/page.tsx" (T010)

# Phase 2 (TDD) can start immediately alongside Phase 1:
Task: "Write requireRole unit test" (T004) — start at session open
Task: "Implement requireRole" (T005) — after T004 is red
```

---

## Implementation Strategy

### MVP First (US1 + US2 — Middleware Security)

1. Complete Phase 1: Setup (T001–T003) — record baseline
2. Complete Phase 3: US1 + US2 (T006) — enforce GERENTE-only financial routes
3. **STOP and VALIDATE**: Manual test with GERENTE + RECEPCIONISTA accounts
4. If passing, proceed to US3 (nav) and US4 (server guards)

### Incremental Delivery

1. Baseline (Phase 1) → record state
2. `requireRole` helper TDD (Phase 2) → unit tests green
3. Middleware guard (Phase 3) → security boundary enforced → validate
4. Nav filtering (Phase 4) → UX clean → validate
5. Page guards (Phase 5) → defense-in-depth → validate
6. Polish (Phase N) → all quality gates green

---

## Notes

- **[P]** tasks within a phase use different files and have no dependencies on each other
- T009 and T010 are parallel — they are in different page files
- The `requireRole` import in T009/T010 uses the path `@/lib/auth` — verify `tsconfig.json` path aliases include `src/lib/` (already standard in this project)
- The `role` default in T008 uses `'RECEPCIONISTA'` as the fallback so that a DB failure fails-closed (least privilege)
- Constitution Principle III: T004 MUST fail before T005 begins — do not skip the red step
