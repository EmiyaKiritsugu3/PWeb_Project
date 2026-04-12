# Feature Specification: Financial Role Access Control

**Feature Branch**: `002-us00-financial-role-access`
**Spec Directory**: `specs/003-002-us00-financial`
**Created**: 2026-04-09
**Status**: Draft

## Context

The middleware currently enforces a single binary access rule: `funcionario → /dashboard`, `aluno → /aluno`. It does **not** differentiate between roles (`GERENTE`, `RECEPCIONISTA`, `INSTRUTOR`) within the admin dashboard.

As a result, `/dashboard/financeiro` (billing, inadimplentes) and `/dashboard/planos` (pricing plan management) are fully accessible to any logged-in staff member. These are sensitive financial operations that must be restricted to `GERENTE` only.

**Current role enum** (Prisma): `GERENTE | RECEPCIONISTA | INSTRUTOR`

**Affected routes**:

- `/dashboard/financeiro` — financial overview and payment registration
- `/dashboard/planos` — gym plan CRUD (price management)

---

## User Scenarios & Testing

### User Story 1 — GERENTE Retains Full Financial Access (Priority: P1) 🎯 MVP

A gym manager (GERENTE) navigates to `/dashboard/financeiro` and `/dashboard/planos`
and uses them without restriction.

**Why this priority**: Confirming that the restriction does not break the primary
user of these features is the baseline validation for every other story.

**Independent Test**: Log in as a GERENTE user; navigate to `/dashboard/financeiro`
and `/dashboard/planos`. Both pages must render normally with no redirect.

**Acceptance Scenarios**:

1. **Given** a user with `role = GERENTE` is authenticated, **When** they navigate to `/dashboard/financeiro`, **Then** the page loads and displays financial data without any redirect.
2. **Given** a user with `role = GERENTE` is authenticated, **When** they navigate to `/dashboard/planos`, **Then** the page loads and the plan CRUD interface is available.

---

### User Story 2 — Non-GERENTE is Blocked from Financial Routes (Priority: P1) 🎯 MVP

A RECEPCIONISTA or INSTRUTOR attempting to access `/dashboard/financeiro` or
`/dashboard/planos` is redirected to `/dashboard` (the main overview page).

**Why this priority**: This is the core security requirement of the feature.

**Independent Test**: Log in as a RECEPCIONISTA; manually type
`/dashboard/financeiro` in the URL bar. The browser must redirect to `/dashboard`
with no financial data visible.

**Acceptance Scenarios**:

1. **Given** a user with `role = RECEPCIONISTA` is authenticated, **When** they navigate to `/dashboard/financeiro`, **Then** they are immediately redirected to `/dashboard`.
2. **Given** a user with `role = INSTRUTOR` is authenticated, **When** they navigate to `/dashboard/planos`, **Then** they are immediately redirected to `/dashboard`.
3. **Given** a non-GERENTE user is redirected, **When** they land on `/dashboard`, **Then** no financial data from the attempted page is rendered or leaked.

---

### User Story 3 — Nav Hides Financial Links for Non-GERENTE (Priority: P2)

The sidebar navigation shows "Financeiro" and "Planos" items only to GERENTE users.
RECEPCIONISTA and INSTRUTOR see these items removed from their nav.

**Why this priority**: UI hygiene — non-GERENTE users should never see links they
cannot reach. Middleware already protects the routes (US2); this story improves UX.

**Independent Test**: Log in as RECEPCIONISTA; inspect the sidebar. "Financeiro"
and "Planos" links must not appear. Log in as GERENTE; both links must be present.

**Acceptance Scenarios**:

1. **Given** a user with `role = RECEPCIONISTA` is logged in, **When** the dashboard layout renders, **Then** the sidebar does not include "Financeiro" or "Planos" nav items.
2. **Given** a user with `role = GERENTE` is logged in, **When** the dashboard layout renders, **Then** the sidebar includes "Financeiro" and "Planos" nav items as before.

---

### User Story 4 — Financial Pages Have Server-Side Role Guard (Priority: P3)

`/dashboard/financeiro` and `/dashboard/planos` Server Components verify the caller's
role before fetching data, independent of middleware. This is defense-in-depth.

**Why this priority**: Middleware can be bypassed via misconfiguration or future
refactors. A direct server-side check prevents data leakage if the middleware layer
is ever relaxed.

**Independent Test**: Call the page RSC render path directly (e.g., via test or
curl bypassing middleware). The page must return a redirect response when the
caller is not GERENTE.

**Acceptance Scenarios**:

1. **Given** a request reaches `/dashboard/financeiro` with a non-GERENTE session, **When** the Server Component renders, **Then** it calls `redirect('/dashboard')` before any Prisma query executes.
2. **Given** a request reaches `/dashboard/planos` with no authenticated session, **When** the Server Component renders, **Then** it calls `redirect('/login')`.

---

### Edge Cases

- What happens when a GERENTE's role is updated to RECEPCIONISTA while mid-session? → On the next request the middleware re-fetches the role and redirects immediately. No session invalidation needed — role is checked per request.
- What if the `funcionarios` DB query fails in middleware? → Fail-closed: treat the role as insufficient and redirect to `/dashboard` (never expose financial data on error).
- What if a new financial route is added later? → It must be added to the `FINANCIAL_ROUTES` constant in middleware; no magic path prefix so the list stays explicit and auditable.

---

## Requirements

### Functional Requirements

- **FR-001**: Middleware MUST fetch the `role` field from the `funcionarios` table for authenticated staff requests targeting financial routes.
- **FR-002**: Requests from `RECEPCIONISTA` or `INSTRUTOR` to `/dashboard/financeiro/**` or `/dashboard/planos/**` MUST be redirected to `/dashboard`.
- **FR-003**: Requests from `GERENTE` to all `/dashboard/**` routes MUST pass through without restriction.
- **FR-004**: The `DashboardNav` component MUST receive the current user's role as a prop and conditionally render financial nav items.
- **FR-005**: The financial route guard MUST be implemented as an explicit allowlist (`FINANCIAL_ROUTES` constant), not a path-prefix heuristic.
- **FR-006**: Server Components for `/dashboard/financeiro` and `/dashboard/planos` MUST perform a secondary role check before executing any database query.

### Key Entities

- **Funcionario**: Staff member with `id`, `nomeCompleto`, `email`, `role: Role`. Role determines access tier.
- **Role (enum)**: `GERENTE` (full access) | `RECEPCIONISTA` (no financial) | `INSTRUTOR` (no financial).
- **Financial Routes**: `/dashboard/financeiro` and `/dashboard/planos` — the restricted surface.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero financial data is returned to a non-GERENTE request, verified by middleware redirect before any Prisma query runs on financial pages.
- **SC-002**: GERENTE access to all dashboard routes produces zero redirect responses.
- **SC-003**: `npm run typecheck` — zero errors after implementation.
- **SC-004**: `npm run lint` — zero new violations after implementation.
- **SC-005**: All existing tests continue to pass (`npm test`).

---

## Assumptions

- The `funcionarios` table in Supabase/Postgres is already populated with `role` values matching the Prisma `Role` enum.
- The Supabase client available in middleware (`@supabase/ssr`) supports querying `funcionarios.role` in the same request as the auth check — no extra round-trip needed.
- `GERENTE` is the only role that needs financial access. No partial access (e.g., read-only for RECEPCIONISTA) is in scope.
- `/dashboard/planos` is considered a financial route because it exposes and modifies pricing data.
- Mobile support is out of scope; this is a web-only admin panel.
