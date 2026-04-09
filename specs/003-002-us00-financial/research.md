# Research: Financial Role Access Control

**Feature**: `003-002-us00-financial`
**Phase**: 0 — Research & Unknowns Resolution
**Date**: 2026-04-09

---

## Question 1: Where should role be fetched for the nav?

**Context**: The `DashboardLayout` already calls `supabase.auth.getUser()`. The layout
renders `DashboardNav`, which currently receives no props. To conditionally hide financial
nav items, the layout needs the role.

**Decision**: Fetch `funcionarios.role` inside `DashboardLayout` with a second Supabase
query (`.from('funcionarios').select('role').eq('id', user.id).maybeSingle()`).

**Rationale**: The layout is a Server Component with direct access to `createClient()`.
Fetching role here avoids prop drilling through multiple page components and keeps
the data-fetching concern co-located with the auth check that already exists on line 21.

**Alternatives considered**:

- Supabase JWT custom claims — rejected: requires configuring Supabase hooks/policies,
  which is out of scope and conflicts with the constitution's "no custom auth solutions"
  constraint.
- React Context / store — rejected: layout is an RSC; client-side state is not available.
- Middleware response headers — rejected: adds hidden coupling between middleware and layout.

---

## Question 2: Should middleware fetch role for every request or only financial routes?

**Context**: The middleware already fetches `funcionarios.id` to distinguish staff from
students. Adding a `role` query to every request increases latency for all staff pages.

**Decision**: Fetch `role` only when the request targets a financial route (i.e., when
`FINANCIAL_ROUTES.some(r => pathname.startsWith(r))`). For all other routes, the
existing check (`funcionarios.id`) is sufficient.

**Rationale**: Minimizes DB round-trips. Financial routes are rare relative to
all dashboard navigation (overview, alunos, treinos are hit far more often).

**Alternatives considered**:

- Fetch role on every request and cache in a cookie — rejected: cookies can be
  manipulated client-side; role must always come from the authoritative DB source.
- Fetch id+role in a single query always — simpler, but adds unnecessary latency to
  every non-financial request. Premature optimization in reverse.

---

## Question 3: How should financial page Server Components guard themselves?

**Context**: US4 requires a server-side check independent of middleware.

**Decision**: Each financial page (`financeiro/page.tsx`, `planos/page.tsx`) will call a
shared helper `requireRole('GERENTE')` at the top of the default export (before data
fetching). This helper calls `createClient()`, gets the user, queries `funcionarios.role`,
and calls `redirect('/dashboard')` if the role is not `GERENTE`.

**Rationale**: A shared helper avoids duplicating the auth pattern across pages. It also
makes the intent explicit — the function name `requireRole` is self-documenting.

**Alternatives considered**:

- Inline the check in every page — works but creates duplication; any change to the
  check logic must be applied in multiple places.
- Higher-order component wrapper — rejected: both pages are RSCs, not client components.
- Route group with shared layout guard — cleaner but requires restructuring the route
  tree (`(financial)/dashboard/...`), which is a larger refactor out of scope.

---

## Question 4: How does `DashboardNav` receive the role?

**Context**: `DashboardNav` is a `'use client'` component (uses `usePathname`). It
currently takes no props and uses a static `navItems` array.

**Decision**: Add a `role: string` prop to `DashboardNav`. The layout passes it as
`<DashboardNav role={role} />`. Inside the component, filter `navItems` to exclude
`/dashboard/financeiro` and `/dashboard/planos` when `role !== 'GERENTE'`.

**Rationale**: Minimal change to the existing component. The prop is a plain string
(matching the Prisma enum value), making it easy to test and reason about.

**Alternatives considered**:

- `isGerente: boolean` prop — simpler but loses context if a third restricted area
  is added later; a `role` string is more extensible without being premature.
- Fetching role inside `DashboardNav` via a separate API route — rejected: adds a
  network round-trip for something already available in the parent Server Component.

---

## Resolved Unknowns Summary

| Unknown                     | Resolution                                         |
| --------------------------- | -------------------------------------------------- |
| Role fetch location for nav | `DashboardLayout` (second Supabase query)          |
| Middleware role fetch scope | Only on financial routes (performance)             |
| Page-level guard mechanism  | Shared `requireRole()` helper in `src/lib/auth.ts` |
| Nav prop design             | `role: string` prop on `DashboardNav`              |
| Financial routes definition | Explicit `FINANCIAL_ROUTES` constant in middleware |

---

## Files to Create / Modify

| File                                    | Change                                                          |
| --------------------------------------- | --------------------------------------------------------------- |
| `src/utils/supabase/middleware.ts`      | Fetch `role` for financial routes; add redirect for non-GERENTE |
| `src/app/dashboard/layout.tsx`          | Fetch `role`; pass to `DashboardNav`                            |
| `src/components/dashboard-nav.tsx`      | Accept `role` prop; filter financial nav items                  |
| `src/app/dashboard/financeiro/page.tsx` | Call `requireRole('GERENTE')` at top                            |
| `src/app/dashboard/planos/page.tsx`     | Call `requireRole('GERENTE')` at top                            |
| `src/lib/auth.ts` _(new)_               | `requireRole(role)` helper — fetches user role and redirects    |
