# Implementation Plan: Financial Role Access Control

**Branch**: `002-us00-financial-role-access` | **Date**: 2026-04-09 | **Spec**: `specs/003-002-us00-financial/spec.md`
**Input**: Feature specification from `specs/003-002-us00-financial/spec.md`

---

## Summary

Restrict `/dashboard/financeiro` and `/dashboard/planos` to `GERENTE` only by adding
role-based checks in three layers: (1) Next.js middleware, (2) dashboard layout + nav
conditional rendering, and (3) server-side page guards as defense-in-depth. No new
schema changes are needed — the `Role` enum in Prisma already defines `GERENTE |
RECEPCIONISTA | INSTRUTOR`.

---

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 15 App Router, Supabase SSR (`@supabase/ssr`), Prisma 7, Zod 3
**Storage**: PostgreSQL via Prisma; `funcionarios.role` field already populated
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web — Next.js server-side (middleware, RSC, Server Actions)
**Project Type**: Web application (admin dashboard)
**Performance Goals**: Role fetch adds at most one extra DB query per financial route request; all other routes unaffected
**Constraints**: Must not break existing auth flow; no JWT claims modification; no schema migration required
**Scale/Scope**: ~3 pages affected, ~6 files modified/created

---

## Constitution Check

_GATE: Must pass before implementation begins._

| Principle                             | Status  | Notes                                                                                                                                                   |
| ------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Dual-Portal Architecture           | ✅ PASS | Changes are scoped to `/dashboard`; aluno portal is unaffected. The security boundary between portals is strengthened, not weakened.                    |
| II. Type Safety at Every Boundary     | ✅ PASS | `role` will be typed as `Role` (Prisma enum). The `requireRole()` helper will use Zod to validate the fetched string against the enum before comparing. |
| III. Test-Gated Business Logic        | ✅ PASS | The `requireRole()` helper lives in `src/lib/auth.ts` (business logic boundary) and will have unit tests written before implementation per TDD.         |
| IV. AI as Enhancement, Not Foundation | ✅ PASS | Feature has no AI dependency.                                                                                                                           |
| V. Commit Discipline                  | ✅ PASS | Work is on `002-us00-financial-role-access`; commits will follow Conventional Commits.                                                                  |

**Post-Design Re-check**: No violations anticipated. The `requireRole()` helper introduces
new business logic in `src/lib/` which requires a unit test (Principle III) — covered
in tasks.

---

## Project Structure

### Documentation (this feature)

```text
specs/003-002-us00-financial/
├── plan.md              ✅ (this file)
├── research.md          ✅ Phase 0 complete
├── data-model.md        N/A — no schema changes
├── quickstart.md        ✅ Phase 1 (below)
├── contracts/           N/A — internal auth check, no external API
└── tasks.md             Phase 2 output (/speckit-tasks command)
```

### Source Code (affected files)

```text
src/
├── lib/
│   └── auth.ts                              ← NEW: requireRole() helper
├── utils/supabase/
│   └── middleware.ts                        ← MODIFY: add role check for financial routes
├── app/dashboard/
│   ├── layout.tsx                           ← MODIFY: fetch role, pass to DashboardNav
│   ├── financeiro/
│   │   └── page.tsx                         ← MODIFY: add requireRole('GERENTE') guard
│   └── planos/
│       └── page.tsx                         ← MODIFY: add requireRole('GERENTE') guard
└── components/
    └── dashboard-nav.tsx                    ← MODIFY: accept role prop, filter nav items
```

**Structure Decision**: Single Next.js App Router project (existing layout). No new
directories except `src/lib/auth.ts`. All changes are minimal and targeted.

---

## Personas

Each implementation task is approached with the most appropriate engineering mindset:

| Task                           | Persona                | Focus                                                              |
| ------------------------------ | ---------------------- | ------------------------------------------------------------------ |
| `requireRole()` helper + tests | **Security Engineer**  | Fail-closed logic, no data leak on error, typed inputs             |
| Middleware role check          | **Security Engineer**  | Per-request DB fetch only for restricted paths, explicit allowlist |
| Layout + nav filtering         | **Frontend Developer** | Clean prop interface, no flash of unauthorized content, accessible |
| Page-level server guards       | **Backend Developer**  | Defense-in-depth, redirect before any DB query, idempotent         |

---

## Design Contracts

### `requireRole(allowedRole: Role): Promise<void>`

Located in `src/lib/auth.ts`.

```typescript
// Fetches the authenticated user's role from 'funcionarios'.
// Redirects to '/dashboard' if role does not match allowedRole.
// Redirects to '/login' if no authenticated user.
// Never resolves with a value — either succeeds (void) or redirects (throws Next.js redirect).
export async function requireRole(allowedRole: Role): Promise<void>;
```

### Middleware FINANCIAL_ROUTES constant

```typescript
const FINANCIAL_ROUTES = ['/dashboard/financeiro', '/dashboard/planos'] as const;
// Role check is triggered only if: FINANCIAL_ROUTES.some(r => pathname.startsWith(r))
```

### DashboardNav prop addition

```typescript
interface DashboardNavProps {
  role: string; // Prisma Role enum value: 'GERENTE' | 'RECEPCIONISTA' | 'INSTRUTOR'
}
```

---

## Quickstart

### Local Setup

```bash
# 1. Verify DB has role data
npx prisma studio  # Check funcionarios table — role column must be populated

# 2. Seed (if empty)
npm run prisma:seed

# 3. Run dev server
npm run dev
```

### Manual Test Flow

```
1. Log in as GERENTE (check seed.ts for credentials)
   → Navigate /dashboard/financeiro → must render ✅
   → Navigate /dashboard/planos → must render ✅
   → Sidebar shows "Financeiro" and "Planos" ✅

2. Log in as RECEPCIONISTA
   → Navigate /dashboard/financeiro → must redirect to /dashboard ✅
   → Navigate /dashboard/planos → must redirect to /dashboard ✅
   → Sidebar shows NO "Financeiro" or "Planos" ✅

3. Log in as INSTRUTOR
   → Same as RECEPCIONISTA above ✅
```

### Quality Gates

```bash
npm run typecheck    # zero errors
npm run lint         # zero new violations
npm test             # all passing (requireRole unit tests must be green)
```

---

## Implementation Strategy

### MVP First (US1 + US2 — middleware only)

1. Write `requireRole()` tests (red)
2. Implement `requireRole()` (green)
3. Update middleware `FINANCIAL_ROUTES` + role fetch
4. Add `requireRole('GERENTE')` to financial pages
5. **VALIDATE**: Manual test with GERENTE + RECEPCIONISTA accounts

### Then UI Polish (US3 — nav filtering)

6. Add `role` prop to `DashboardNav`
7. Update layout to fetch + pass role
8. Filter nav items
9. **VALIDATE**: Sidebar inspection for both role types

---

## Complexity Tracking

No constitution violations. No complexity justification required.
