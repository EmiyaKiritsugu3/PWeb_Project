# Gerente Dashboard Refactor — Design Spec

**Date:** 2026-07-09
**Branch:** `feat/gerente-dashboard-refactor`
**Author:** brainstorming session (gap-audit workflow `wf_19ad3022-548`)

## Goal

Bring the GERENTE dashboard (`/dashboard` + sub-pages) up to the quality bar of the
ALUNO dashboard (`/aluno/dashboard`). The ALUNO page has cohesive design tokens, real
loading/empty/error states, and solid a11y; the GERENTE page falls short: theme
fracture, fake data, silent failures, invalid HTML, no state handling.

## Scope (approved)

- **Pages:** overview + all sub-pages (alunos, financeiro, planos, treinos) + nav/layout.
- **Fake data:** ZERO. Replace synthetic growth chart with **real Prisma queries**;
  where no data exists, show an honest empty-state (never fabricate).
- **Depth:** full P0→P3.
- **Gamification:** NOT ported (ALUNO's trophy room is static/fake; admin ≠ motivation).
- **Tests:** TDD — write test first, watch fail, implement, green.

## Non-goals (YAGNI)

- No DB migration (queries only — all needed fields already exist).
- No monorepo/component extraction.
- No gamification.

## Schema facts (verified `prisma/schema.prisma`)

Historical data available — no migration needed:
- `Aluno.dataCadastro DateTime @default(now())` → enrollments per month (real growth).
- `Pagamento.dataPagamento DateTime` + `valor Float` + `@@index([dataPagamento])` → revenue per month.
- `Matricula.status` + `planoId` + `Plano` → enrollments by plan.
- `Aluno.statusMatricula StatusAluno` → real inadimplentes KPI.

---

## Section 1 — Architecture & data layer

Mirror the ALUNO pattern: RSC fetches + serializes, client renders only; design-system
tokens; real states; zero fake data.

**`src/lib/data.ts`:**
- Remove synthetic `crescimentoAnual` (lines 138-142).
- `getDashboardStats()` stops swallowing errors → propagate (let `error.tsx` catch).
- New real queries (each returns `[]` when empty → feeds honest empty-state):
  - `getMatriculasPorMes()` — group `Aluno.dataCadastro` last 6-12 months → real growth.
  - `getReceitaPorMes()` — group `Pagamento.dataPagamento`, sum `valor` → revenue trend.
  - `getMatriculasPorPlano()` — count `Matricula` by `planoId` (status ATIVA) → distribution.
  - KPI deltas — count current month vs previous month (active alunos, revenue, inadimplentes, new).

---

## Section 2 — Layout & components

**Overview (`/dashboard/page.tsx`)** — grid mirroring ALUNO 8/4:
- **KPI grid** (top): 4 `Card glass` (not divs). Each: icon + label + value + **trend delta**
  (`+12%` green / `-5%` red vs prev month) + full `aria-label`. Inadimplentes uses icon+text
  (not color-only).
- **Main grid** `lg:grid-cols-12 gap-8`:
  - Left `col-span-8`: enrollment-growth chart (real) + revenue-per-month chart (real).
  - Right `col-span-4`: enrollments-by-plan (real) + recent-activity card (real recent payments/signups).

**New/reused components:**
- `KpiCard` (`_components/kpi-card.tsx`) — `Card glass` + delta + icon+text + aria + `data-testid`.
- `dashboard-charts.tsx` — replace hardcoded oklch (lines 27-69) with tokens
  (`--color-primary`/cyan); add `role="img"` + `aria-label`; support empty-state.
- `EmptyState` (`_components/empty-state.tsx`) — port ALUNO "Dia de Descanso" pattern
  (`card-treino.tsx:40-57`): icon + honest copy "sem histórico ainda". Reused across all
  charts/lists without data.

**Layout shell (`layout.tsx`):**
- Fix **double `<main>`**: remove `<main>` at `layout.tsx:120`, keep only `SidebarInset`'s
  (`sidebar.tsx:311`). Move `pb-20` to inner wrapper.
- Reduced-motion: copy `globals.css:198-207` block to cover `animate-glow-pulse` + active-bar.

**Sub-pages (alunos/financeiro/planos/treinos):**
- Replace `bg-black`/`#18181B`/`text-zinc-400`/`raw-shadow` → tokens
  (`bg-background`/`text-foreground`/`glass-card`/`glow-cyan`). Re-check contrast (no blind-copy).
- Add `pb-20` to all (mobile clears bottom-nav).
- `treinos`: add Suspense + skeleton (only one missing it).
- Extend `dashboard-skeletons.tsx` to overview (KPI grid + charts).

---

## Section 3 — States, error handling, tests, phases

**States (ALUNO pattern):**
- **Loading:** new `src/app/dashboard/loading.tsx` — skeleton KPI grid + charts (streaming
  shell). Also `treinos/loading.tsx`.
- **Error:** new `src/app/dashboard/error.tsx` — catches `getDashboardStats` throw; message
  + retry button (`reset()`). No silent zero-KPIs.
- **Empty:** each data-less chart/list → honest `EmptyState`. No fake.

**Error handling (data layer):** try/catch for structured log only, then **re-throw** (let
`error.tsx` render). No masking defaults.

**Tests (TDD — test first):**
- New: `kpi-card.test.tsx` (delta +/- render, aria-label, color+text), `empty-state.test.tsx`,
  `data.test.ts` (real queries: empty month→`[]`, delta calc, re-throw on error),
  `loading`/`error` render tests.
- Update broken existing: `page.test.tsx`, `dashboard-bottom-nav.test.tsx`, `user-menu.test.tsx`,
  sub-page tests.
- Gate: `npm test && npm run lint && npm run typecheck` green before each commit.

**Phase order (dependency-first):**
1. **P0 quick wins** (no dep): tokens on sub-pages, `pb-20`, reduced-motion block,
   double-`<main>` fix. `[RISKY]` double-main → rollback = revert 1 line.
2. **P2-data**: new real Prisma queries + deltas + re-throw (`lib/data.ts`). `[RISKY]` DB
   read only (no migration). TDD.
3. **P1 components**: `KpiCard`, `EmptyState`, `loading.tsx`, `error.tsx`, skeletons. TDD.
4. **P2-charts**: real charts (growth/revenue/plan) + `role="img"`/aria + empty-state;
   swap oklch→token.
5. **P3 polish**: activity feed, KPI hover spring (`motion.div` scale 1.02), `data-testid`,
   unify sub-page caching (explicit force-dynamic/revalidate).

**Risks:**
- `[RISK]` double-`<main>` fix — removing wrong one breaks layout/SR. Keep `sidebar.tsx`'s,
  drop `layout.tsx:120`'s. Rollback: revert single line.
- `[RISK]` real queries — if no historical rows, must show "sem histórico" empty-state, not
  fake. Verify empty→`[]`→EmptyState path in tests.
- `[RISK]` silent-default removal — surfacing errors mid-rollout may expose partial failures;
  pair `error.tsx` with retry.
- `[RISK]` token swap on `bg-black` pages — re-check contrast after switching to
  `bg-background`/`text-foreground`.

**Final verification:** 4 gates + `/verify` real drive (`npm run dev`, check overview +
sub-pages on mobile/desktop).
