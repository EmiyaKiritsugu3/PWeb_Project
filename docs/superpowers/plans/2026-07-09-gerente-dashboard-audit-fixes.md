# Gerente Dashboard PR #199 — Audit Fixes + Optimizations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close 6 Important + 3 selected Minor findings from complete multi-dimension audit of PR #199, pushing the branch to merge-readiness.

**Architecture:** 8 tasks in dependency-first order. P0 correctness/contract → P1 test honesty → P2 a11y → P3 performance/resilience. Each task: TDD (test first, watch fail, implement, green). 4 gates after every commit: `npm test && npm run typecheck && npm run lint`.

**Tech Stack:** TypeScript 6.0.3 strict, Next.js 15.5.15 App Router, Prisma 7, Zod 4, Vitest 4, React 18, recharts.

## Files map

```
src/lib/
  definitions.ts       — DashboardDeltasSchema, DashboardStatsSchema (Zod .optional + .strict)
  definitions.test.ts  — schema validation tests
  data.ts              — getDashboardStats, getMatriculasPorMes, getReceitaPorMes, getMatriculasPorPlano
  data.test.ts         — data layer tests (already 320 lines)

src/app/dashboard/
  page.tsx             — GERENTE overview RSC (KPI grid + charts)
  page.test.tsx        — page integration tests (97 lines)
  _components/
    kpi-card.tsx       — KpiCard with delta badge + aria
    empty-state.tsx    — EmptyState (dashed glass card, h3 title)

src/components/dashboard/
  dashboard-charts-multi.tsx       — 3 tokenized charts (client component)
  dashboard-charts-multi.test.tsx  — 29 lines (only renders+role=img)
```

## Global Constraints

- TypeScript 6.0.3 strict (NOT TS7 — TS7 is NO-GO: Next 15.5 build crash + typescript-eslint crash + Prisma block)
- ZERO fake data — all KPIs/charts must use real Prisma queries
- Honest deltas — KPI card with no honest delta must propagate `undefined` → KpiCard renders NO badge (not fake 0% or self-compare)
- Design tokens only — `text-foreground`, `bg-background`, `text-muted-foreground`, `glass-card`, OKLCH cyan primary. FORBIDDEN: `bg-black`, `#18181B`, raw `oklch(...)`, `text-zinc-400`
- No gamification in gerente dashboard
- No DB migration
- TDD: test first, watch fail, implement, green
- 4 gates: `npm test` (vitest 1166+), `npm run typecheck` (tsc --noEmit), `npm run lint` (eslint 0/0), `npm run e2e` (deferred)
- Existing vitest infrastructure (jsdom, @testing-library/react)
- Per-file vitest run: `npx vitest run <path>`

---

### Task 1: Fix KPI label "Matrículas Ativas" → "Novas Matrículas"

**Audit finding:** Important #2 — "Matrículas Ativas" KPI wired to `deltas.novos` (new signups per month delta). Label says "active enrollments" but delta is new signups trend. Spec §2 mandates honest deltas. Rename to match what the delta actually measures.

**Files:**
- Modify: `src/app/dashboard/page.tsx:18` — title string
- Modify: `src/app/dashboard/page.test.tsx:80` — assertion text

**Interfaces:**
- Produces: KPI title "Novas Matrículas" matches `deltas.novos` semantics

- [ ] **Step 1: Update page.tsx label**

```tsx
// src/app/dashboard/page.tsx line 18
// OLD:
title: 'Matrículas Ativas',
value: stats.matriculasAtivas.toLocaleString('pt-BR'),
delta: stats.deltas.novos,
icon: <UserCheck className="h-5 w-5" />,

// NEW:
title: 'Novas Matrículas',
value: stats.matriculasAtivas.toLocaleString('pt-BR'),
delta: stats.deltas.novos,
icon: <UserCheck className="h-5 w-5" />,
```

- [ ] **Step 2: Update page.test.tsx assertion**

```tsx
// src/app/dashboard/page.test.tsx line ~80
// OLD:
expect(screen.getByText('Matrículas Ativas')).toBeTruthy();

// NEW:
expect(screen.getByText('Novas Matrículas')).toBeTruthy();
```

- [ ] **Step 3: Run tests, verify pass**

Run: `npx vitest run src/app/dashboard/page.test.tsx src/app/dashboard/_components/kpi-card.test.tsx`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/dashboard/page.test.tsx
git commit -m "fix(dashboard): rename Matrículas Ativas → Novas Matrículas to match deltas.novos semantics"
```

---

### Task 2: Fix .default() on DashboardDeltasSchema — remove alunos=0 + inadimplentes=0 defaults

**Audit finding:** Resolution of Important #4 — `.default({ alunos: 0, receita: 0, inadimplentes: 0, novos: 0 })` on parent schema re-fills `alunos`/`inadimplentes` as `0` (via `z.number().default(0)` fallback) when parent key absent, but runtime `data.ts` always passes `deltas` object so it doesn't trigger. Still, the default is semantically risky: if any codepath drops the `deltas` key, it silently fabricates 0 for 2 deltas that should be undefined. The default should match reality: only `receita` + `novos` get defaults. Keep `alunos`/`inadimplentes` optional with no default.

**Files:**
- Modify: `src/lib/definitions.ts:247` — change default to `{ receita: 0, novos: 0 }`

**Interfaces:**
- Consumes: `DashboardDeltasSchema` (lines 226-234) — `alunos: z.number().optional()`, `inadimplentes: z.number().optional()`
- Produces: `DashboardStatsSchema.deltas` default = `{ receita: 0, novos: 0 }` only — `alunos` + `inadimplentes` stay undefined when not explicitly passed

- [ ] **Step 1: Change the default**

```typescript
// src/lib/definitions.ts line 247
// OLD:
deltas: DashboardDeltasSchema.default({ alunos: 0, receita: 0, inadimplentes: 0, novos: 0 }),

// NEW:
deltas: DashboardDeltasSchema.default({ receita: 0, novos: 0 }),
```

- [ ] **Step 2: Verify existing tests still pass**

Run: `npx vitest run src/lib/definitions.test.ts`
Expected: PASS (`.strict()` rejection + parse tests green)

- [ ] **Step 3: Commit**

```bash
git add src/lib/definitions.ts
git commit -m "fix(dashboard): narrow DeltasSchema default to receita+novos only — don't fabricate 0 for alunos/inadimplentes"
```

---

### Task 3: Fix page.test.tsx — honest mock contract (omit alunos/inadimplentes deltas)

**Audit finding:** Important #3 — `page.test.tsx` mock returns `deltas: { alunos: 0.1, receita: -0.05, inadimplentes: 0, novos: 0.2 }` and asserts `+10%` badge on "Total de Alunos". But real `getDashboardStats` omits `alunos`/`inadimplentes` from deltas → `stats.deltas.alunos === undefined` → KpiCard renders no badge. The test encodes a contract the runtime cannot fulfill. Split existing test + add variant verifying honest contract.

**Files:**
- Modify: `src/app/dashboard/page.test.tsx` — add second describe block with honest mock

**Interfaces:**
- Consumes: `getDashboardStats` mock (already vi.mock'd), `KpiCard` `delta?: number` prop

- [ ] **Step 1: Add honest-mock describe block with 3 tests**

```tsx
// At bottom of src/app/dashboard/page.test.tsx, before closing, add:

describe('DashboardPage — honest deltas (no alunos/inadimplentes badge)', () => {
  beforeEach(() => {
    vi.mocked(getDashboardStats).mockResolvedValue({
      totalAlunos: 150,
      matriculasAtivas: 120,
      alunosInadimplentes: 15,
      faturamentoMensal: 45000,
      matriculasPorMes: [],
      receitaPorMes: [],
      matriculasPorPlano: [],
      deltas: { receita: -0.05, novos: 0.2 },
    } as never);
  });

  it('does NOT render % badge on Total de Alunos (no honest delta)', async () => {
    render(await DashboardPage());
    const alunosCard = screen.getByTestId('kpi-Total de Alunos');
    expect(alunosCard).toBeTruthy();
    expect(alunosCard.textContent).not.toMatch(/%/);
  });

  it('does NOT render % badge on Inadimplentes (no honest delta)', async () => {
    render(await DashboardPage());
    const inadimplentesCard = screen.getByTestId('kpi-Inadimplentes');
    expect(inadimplentesCard).toBeTruthy();
    expect(inadimplentesCard.textContent).not.toMatch(/%/);
  });

  it('DOES render % badge on Novas Matrículas + Faturamento Recente (honest deltas)', async () => {
    render(await DashboardPage());
    expect(screen.getByText('-5%')).toBeTruthy();
    expect(screen.getByText('+20%')).toBeTruthy();
  });
});
```

**Note:** The existing `describe('DashboardPage')` block keeps its full-delta mock for the KpiCard-integration-when-deltas-provided tests. The new describe block uses honest mock (no alunos/inadimplentes deltas) for the real contract. The existing `+10%` assertion stays in the old block (tests KpiCard renders when delta IS provided — a valid unit-in-page-integration test).

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/app/dashboard/page.test.tsx`
Expected: PASS (old + 3 new tests green)

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/page.test.tsx
git commit -m "test(dashboard): add honest-mock variant — optional deltas → no badge on alunos/inadimplentes"
```

---

### Task 4: Fix .strict() isolation test in definitions.test.ts

**Audit finding:** Important #5 — the `.strict()` rejection test passes `{crescimentoAnual:[...]}` which lacks required `deltas.receita`/`deltas.novos` so it rejects for wrong reason. Add isolated test: valid full payload + extra key → reject.

**Files:**
- Modify: `src/lib/definitions.test.ts:1018-1022` — add isolation case

**Interfaces:**
- Consumes: `DashboardStatsSchema` (`.strict()`)

- [ ] **Step 1: Add isolated .strict() test + valid-parse test**

```typescript
// src/lib/definitions.test.ts — inside describe('DashboardStatsSchema'), after existing test:

it('rejects unknown key even when all required fields present (.strict isolation)', () => {
  const withFake = DashboardStatsSchema.safeParse({
    totalAlunos: 10,
    matriculasAtivas: 8,
    alunosInadimplentes: 1,
    faturamentoMensal: 1000,
    matriculasPorMes: [{ mes: '2026-01', total: 5 }],
    receitaPorMes: [{ mes: '2026-01', total: 500 }],
    matriculasPorPlano: [{ plano: 'Bronze', total: 3 }],
    deltas: { receita: -0.05, novos: 0.2 },
    crescimentoAnual: [{ mes: 'Jan', alunos: 1 }], // ← extra key .strict() must reject
  });
  expect(withFake.success).toBe(false);
});

it('parses valid payload without unknown keys (strict allows)', () => {
  const result = DashboardStatsSchema.safeParse({
    totalAlunos: 10,
    matriculasAtivas: 8,
    alunosInadimplentes: 1,
    faturamentoMensal: 1000,
    matriculasPorMes: [{ mes: '2026-01', total: 5 }],
    receitaPorMes: [{ mes: '2026-01', total: 500 }],
    matriculasPorPlano: [{ plano: 'Bronze', total: 3 }],
    deltas: { receita: -0.05, novos: 0.2 },
  });
  expect(result.success).toBe(true);
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/definitions.test.ts`
Expected: PASS (3 tests in DashboardStatsSchema describe), including new isolation + valid-parse cases

- [ ] **Step 3: Commit**

```bash
git add src/lib/definitions.test.ts
git commit -m "test(dashboard): isolate .strict() rejection — valid payload + unknown key"
```

---

### Task 5: Add integration test for getDashboardStats with non-empty series

**Audit finding:** Important #6 — `getDashboardStats` with non-empty series never tested. `pctDelta` edge cases (prev=0 curr>0 → 1, last===prev → 0), `faturamentoMensal = last(receitaPorMes)` wiring, delta-omission for alunos/inadimplentes all uncovered at integration level. Add a single golden-path test.

**Files:**
- Modify: `src/lib/data.test.ts:233-259` — add golden-path test inside existing `describe('getDashboardStats')`

**Interfaces:**
- Consumes: `getDashboardStats` (wraps `getMatriculasPorMes`, `getReceitaPorMes`, `getMatriculasPorPlano`, `pctDelta`)
- Produces: `DashboardStats` with computed `deltas` + `faturamentoMensal`

- [ ] **Step 1: Add golden-path test**

```typescript
// src/lib/data.test.ts — inside describe('getDashboardStats'), AFTER the re-throw test

it('computes honest faturamentoMensal and deltas from non-empty series', async () => {
  vi.mocked(mockPrisma.aluno.count)
    .mockResolvedValueOnce(50)   // totalAlunos
    .mockResolvedValueOnce(10);  // alunosInadimplentes
  vi.mocked(mockPrisma.matricula.count).mockResolvedValue(35);  // matriculasAtivas
  vi.mocked(mockPrisma.aluno.findMany).mockResolvedValue([
    { dataCadastro: new Date('2026-06-01') },
    { dataCadastro: new Date('2026-06-15') },
    { dataCadastro: new Date('2026-07-05') },
  ] as never);
  vi.mocked(mockPrisma.pagamento.findMany).mockResolvedValue([
    { dataPagamento: new Date('2026-06-10'), valor: 1000 },
    { dataPagamento: new Date('2026-07-03'), valor: 2000 },
    { dataPagamento: new Date('2026-07-08'), valor: 1500 },
  ] as never);
  vi.mocked(mockPrisma.matricula.findMany).mockResolvedValue([
    { Plano: { nome: 'Premium' } },
    { Plano: { nome: 'Basic' } },
    { Plano: { nome: 'Basic' } },
  ] as never);

  const stats = await getDashboardStats();

  // faturamentoMensal = last(receitaPorMes) — June=1000, July=3500 → last=3500
  expect(stats.faturamentoMensal).toBe(3500);

  // deltas.receita = pctDelta(last, prev) = (3500-1000)/1000 = 2.5
  expect(stats.deltas.receita).toBe(2.5);

  // deltas.novos = pctDelta(matriculas last vs prev) — June=2, July=1 → (1-2)/2 = -0.5
  expect(stats.deltas.novos).toBe(-0.5);

  // alunos/inadimplentes deltas absent (optional) → undefined
  expect(stats.deltas.alunos).toBeUndefined();
  expect(stats.deltas.inadimplentes).toBeUndefined();

  // matriculasPorPlano grouped correctly
  expect(stats.matriculasPorPlano).toEqual([
    { plano: 'Basic', total: 2 },
    { plano: 'Premium', total: 1 },
  ]);
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/lib/data.test.ts`
Expected: PASS (all existing + new golden-path test)

- [ ] **Step 3: Commit**

```bash
git add src/lib/data.test.ts
git commit -m "test(dashboard): golden-path getDashboardStats — faturamentoMensal + deltas + optional absence"
```

---

### Task 6: A11y — fix heading hierarchy (EmptyState h3 → h2 + add sr-only h2 before charts)

**Audit finding:** Important #1 — `EmptyState` renders `<h3>` with no preceding `<h2>`, skipping heading level (h1→h3). Same for chart `<CardTitle>` elements (h3 directly under h1). WCAG 2.2 SC 1.3.1 (G141/F43).

**Files:**
- Modify: `src/app/dashboard/_components/empty-state.tsx:19` — `<h3>` → `<h2>`
- Modify: `src/app/dashboard/page.tsx:59` — add sr-only `<h2>` before `<DashboardChartsMulti>`

**Interfaces:**
- Consumes: `PageHeader` renders `<h1>`, `EmptyState` renders `<h2>`, `CardTitle` renders `<h3>`

- [ ] **Step 1: Change EmptyState title to h2**

```tsx
// src/app/dashboard/_components/empty-state.tsx line 19
// OLD:
<h3 className="text-2xl font-bold font-headline">{title}</h3>

// NEW:
<h2 className="text-2xl font-bold font-headline">{title}</h2>
```

- [ ] **Step 2: Add sr-only h2 before charts on overview page**

```tsx
// src/app/dashboard/page.tsx — after the KPI grid closing </div>, before <DashboardChartsMulti>

      </div>

      <h2 className="sr-only">Visão geral dos gráficos</h2>
      <DashboardChartsMulti
```

- [ ] **Step 3: Verify heading hierarchy in existing tests**

Run: `npx vitest run src/app/dashboard/_components/empty-state.test.tsx src/app/dashboard/page.test.tsx`
Expected: PASS (no heading assertions broken by rank change)

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/_components/empty-state.tsx src/app/dashboard/page.tsx
git commit -m "fix(a11y): heading hierarchy h1→h2→h3 — EmptyState h2 + sr-only h2 before charts"
```

---

### Task 7: A11y — aria-hidden on KpiCard delta triangle glyph

**Audit finding:** Minor #17 — `▲`/`▼` not marked `aria-hidden`, SR reads "up-pointing triangle" before percentage. Redundant because aria-label already includes "variação +12%".

**Files:**
- Modify: `src/app/dashboard/_components/kpi-card.tsx:47` — wrap `▲/▼` in `<span aria-hidden="true">`

- [ ] **Step 1: Add aria-hidden**

```tsx
// src/app/dashboard/_components/kpi-card.tsx line ~47
// OLD:
{positive ? '▲' : '▼'} <span>{formatDelta(delta!)}</span>

// NEW:
<span aria-hidden="true">{positive ? '▲' : '▼'}</span> <span>{formatDelta(delta!)}</span>
```

- [ ] **Step 2: Verify KpiCard tests**

Run: `npx vitest run src/app/dashboard/_components/kpi-card.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/_components/kpi-card.tsx
git commit -m "fix(a11y): aria-hidden on KpiCard delta triangle glyph — redundant with aria-label"
```

---

### Task 8: Performance — window + group-by at DB for getReceitaPorMes + getMatriculasPorMes

**Audit finding:** Important #7 + #8 (performance) — both functions unbounded all-time scan. `getMatriculasPorMes` fetches ALL alunos, `getReceitaPorMes` fetches ALL pagamentos (fastest-growing table). Add 13-month window.

**Files:**
- Modify: `src/lib/data.ts:117-132` — add `where: { dataCadastro/dataPagamento: { gte: thirteenMonthsAgo } }`

**Interfaces:**
- Consumes: `prisma.aluno.findMany`, `prisma.pagamento.findMany`
- Produces: `MonthTotal[]` — same shape, now bounded to recent 13 months

- [ ] **Step 1: Rewrite getMatriculasPorMes with windowed query**

```typescript
// src/lib/data.ts — replace lines 117-120

export async function getMatriculasPorMes() {
  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13, 1);
  thirteenMonthsAgo.setHours(0, 0, 0, 0);

  // ponytail: Prisma groupBy can't group by date-trunc directly; we window to 13 months
  // and group in JS. Upgrade to prisma.$queryRaw with DATE_TRUNC if row count grows.
  const rows = await prisma.aluno.findMany({
    where: { dataCadastro: { gte: thirteenMonthsAgo } },
    select: { dataCadastro: true },
  });
  return groupByMonth(rows.map((r) => ({ date: r.dataCadastro })));
}
```

- [ ] **Step 2: Rewrite getReceitaPorMes with windowed query**

```typescript
// src/lib/data.ts — replace lines 122-132

export async function getReceitaPorMes() {
  const thirteenMonthsAgo = new Date();
  thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13, 1);
  thirteenMonthsAgo.setHours(0, 0, 0, 0);

  const rows = await prisma.pagamento.findMany({
    where: { dataPagamento: { gte: thirteenMonthsAgo } },
    select: { dataPagamento: true, valor: true },
  });
  const map = new Map<string, number>();
  for (const { dataPagamento, valor } of rows) {
    const k = monthKey(dataPagamento);
    map.set(k, (map.get(k) ?? 0) + valor);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}
```

- [ ] **Step 3: Verify tests still pass**

Existing tests use `vi.fn()` mocks which ignore arguments — no test change needed.

Run: `npx vitest run src/lib/data.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/lib/data.ts
git commit -m "perf(dashboard): window getMatriculasPorMes + getReceitaPorMes to 13 months"
```

---

## Execution order (dependency chain)

```
T1 (label fix) ──┐
                  ├── T3 (page test honest mock) ── depends on T1 label
T2 (.default)  ──┘
                  │
T4 (.strict isolation test) — independent
T5 (golden-path getDashboardStats test) — independent
T6 (heading a11y) ── independent ── T7 (aria-hidden) — independent
T8 (perf window) — independent (last, re-runs all data tests)
```

Parallel groups:
- **Wave 1**: T1 + T2 (same file area, sequential — T1 touches page.tsx, T2 touches definitions.ts)
- **Wave 2**: T3 (depends on T1)
- **Wave 3**: T4 || T5 || T6 || T7 (all independent, parallel-safe)
- **Wave 4**: T8 (independent, last — re-runs all data tests)

## Post-execution verification

After all 8 tasks complete:

```bash
npm test              # Vitest — must stay ≥ 1176 (existing 1166 + ~10 new tests)
npm run typecheck     # tsc --noEmit — 0 errors
npm run lint          # eslint — 0 errors, 0 warnings
```

Update `docs/CURRENT-STATE.md` with audit-fix summary.
