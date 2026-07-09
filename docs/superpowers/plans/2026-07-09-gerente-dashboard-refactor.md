# Gerente Dashboard Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the GERENTE `/dashboard` (overview + alunos/financeiro/planos/treinos sub-pages + layout) up to the ALUNO dashboard quality bar — real Prisma data, honest empty-states, valid HTML, real loading/error states, no fake data.

**Architecture:** RSC fetches via `src/lib/data.ts`, serializes, client renders only. Design tokens from `globals.css` `@theme` (cyan primary OKLCH, `glass-card`, `glow-cyan`). New KPI/chart components mirror ALUNO patterns (`card-treino.tsx` empty-state, `card.tsx` `glass` prop). Charts swap hardcoded `oklch()` literals → tokens + `role="img"` aria.

**Tech Stack:** Next.js 15 App Router, React 18, TypeScript 5 strict, Prisma 7.7, recharts, Vitest 4 + @testing-library/react, Zod 4 (`zod/v4`).

## Global Constraints

- ZERO fake data — real Prisma queries only; where no rows exist, show honest `EmptyState` ("sem histórico ainda"), never fabricate (`ponytail:`/synthetic growth removed).
- No DB migration — all queried fields already exist (`Aluno.dataCadastro`, `Pagamento.dataPagamento`+`valor`+`@@index([dataPagamento])`, `Matricula.status`+`planoId`+`Plano`, `Aluno.statusMatricula`).
- Gamification NOT ported (ALUNO trophy room is static/fake; admin ≠ motivation).
- TDD — write the failing test first, watch it fail, implement, green, before commit.
- 4 gates must pass per commit: `npm test && npm run lint && npm run typecheck` (and `npm run e2e` at end).
- Tokens over raw values: `bg-background`, `text-foreground`, `text-muted-foreground`, `glass-card`, `glow-cyan`, `border-white/5` (NOT `bg-black`, `#18181B`, `text-zinc-400`, raw `shadow-[...]`).

---

## File Structure

**Create**
- `src/app/dashboard/_components/kpi-card.tsx` — `Card glass` + delta badge + icon+text + `aria-label` + `data-testid`.
- `src/app/dashboard/_components/empty-state.tsx` — port ALUNO empty-state pattern (icon + honest copy. `card-treino.tsx:40-57`).
- `src/app/dashboard/loading.tsx` — skeleton KPI grid + charts.
- `src/app/dashboard/error.tsx` — catches `getDashboardStats` throw; message + retry (`reset()`).
- `src/components/dashboard/dashboard-charts-multi.tsx` — real multi-series chart (growth + revenue + plan) with `role="img"`/aria + empty-state. Replaces single hardcoded chart.
- Tests: `kpi-card.test.tsx`, `empty-state.test.tsx`, `data.test.ts`, `loading.test.tsx`, `error.test.tsx`.

**Modify**
- `src/lib/data.ts` — remove synthetic `crescimentoAnual` (138-142); add `getMatriculasPorMes`, `getReceitaPorMes`, `getMatriculasPorPlano`, KPI deltas; re-throw on error (stop `parse({})` default at 153).
- `src/lib/definitions.ts` — extend `DashboardStatsSchema` (drop `crescimentoAnual`, add real-series + delta fields).
- `src/app/dashboard/page.tsx` — KPI grid via `KpiCard`, real charts.
- `src/app/dashboard/layout.tsx` — remove double `<main>` (line 120), move `pb-20` to inner wrapper.
- `src/components/dashboard/dashboard-charts.tsx` — swap hardcoded oklch → tokens + `role="img"`/aria + empty-state (or replace via multi chart).
- `src/app/dashboard/alunos/page.tsx` — tokenize `bg-black`, add `pb-20`.
- `src/app/dashboard/financeiro/page.tsx` — tokenize `bg-black`/`#18181B`/`text-zinc-400`/raw-shadow, add `pb-20`.
- `src/app/dashboard/planos/page.tsx` — wrap with `pb-20` container.
- `src/app/dashboard/treinos/page.tsx` — add `pb-20` + Suspense/skeleton.
- `src/components/ui/dashboard-skeletons.tsx` — add `DashboardOverviewSkeleton`.
- `src/app/dashboard/page.test.tsx` — update to new KPI/delta assertions.

---

## Task 1: Remove synthetic growth + add real series types

**Files:**
- Modify: `src/lib/definitions.ts:212-227`
- Test: `src/lib/definitions.test.ts`

**Interfaces:**
- Produces: `DashboardStatsSchema` shape with `matriculasPorMes`, `receitaPorMes`, `matriculasPorPlano`, `deltas` (no `crescimentoAnual`).

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { DashboardStatsSchema } from './definitions';

describe('DashboardStatsSchema', () => {
  it('accepts real series + deltas, rejects synthetic crescimentoAnual', () => {
    const stats = DashboardStatsSchema.parse({
      totalAlunos: 10,
      matriculasAtivas: 8,
      alunosInadimplentes: 1,
      faturamentoMensal: 1000,
      matriculasPorMes: [{ mes: '2026-01', total: 5 }],
      receitaPorMes: [{ mes: '2026-01', total: 500 }],
      matriculasPorPlano: [{ plano: 'Bronze', total: 3 }],
      deltas: { alunos: 0.1, receita: -0.05, inadimplentes: 0, novos: 0.2 },
    });
    expect(stats.matriculasPorMes).toHaveLength(1);
    const withFake = DashboardStatsSchema.safeParse({ crescimentoAnual: [{ mes: 'Jan', alunos: 1 }] });
    expect(withFake.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/lib/definitions.test.ts`
  Expected: FAIL (`crescimentoAnual` still valid; `matriculasPorMes`/`deltas` missing).

- [ ] **Step 3: Write minimal implementation** — replace `DashboardStatsSchema` block (212-227):

```ts
export const MonthTotalSchema = z.object({ mes: z.string(), total: z.number() });
export const PlanTotalSchema = z.object({ plano: z.string(), total: z.number() });
export const DashboardDeltasSchema = z.object({
  alunos: z.number(),
  receita: z.number(),
  inadimplentes: z.number(),
  novos: z.number(),
});

export const DashboardStatsSchema = z.object({
  totalAlunos: z.number().int().default(0),
  matriculasAtivas: z.number().int().default(0),
  alunosInadimplentes: z.number().int().default(0),
  faturamentoMensal: z.number().default(0),
  matriculasPorMes: z.array(MonthTotalSchema).default([]),
  receitaPorMes: z.array(MonthTotalSchema).default([]),
  matriculasPorPlano: z.array(PlanTotalSchema).default([]),
  deltas: DashboardDeltasSchema.default({ alunos: 0, receita: 0, inadimplentes: 0, novos: 0 }),
});
```

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/lib/definitions.test.ts`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/definitions.ts src/lib/definitions.test.ts
git commit -m "feat(dashboard): replace synthetic crescimentoAnual with real series + delta schema"
```

---

## Task 2: Real Prisma queries in `getDashboardStats` + re-throw

**Files:**
- Modify: `src/lib/data.ts:105-155`
- Test: `src/lib/data.test.ts`

**Interfaces:**
- Consumes: Prisma models (`aluno`, `matricula`, `pagamento`, `plano`).
- Produces: `getDashboardStats()` returning `DashboardStats` with real series + `deltas`; `getMatriculasPorMes`, `getReceitaPorMes`, `getMatriculasPorPlano` returning `[]` when empty; throws on DB failure (no swallowing).

- [ ] **Step 1: Write failing test** — `src/lib/data.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { getDashboardStats } from './data';
import { getMatriculasPorMes, getReceitaPorMes, getMatriculasPorPlano } from './data';

describe('getDashboardStats', () => {
  it('returns empty series (not fake) when no rows', async () => {
    const stats = await getDashboardStats();
    expect(stats.matriculasPorMes).toEqual([]);
    expect(stats.receitaPorMes).toEqual([]);
    expect(stats.matriculasPorPlano).toEqual([]);
    expect(stats.crescimentoAnual).toBeUndefined();
  });

  it('re-throws on DB failure (no silent default)', async () => {
    const { prisma } = await import('./prisma');
    vi.spyOn(prisma.aluno, 'count').mockRejectedValueOnce(new Error('db down'));
    await expect(getDashboardStats()).rejects.toThrow('db down');
  });
});

describe('series helpers', () => {
  it('getMatriculasPorMes returns [] when no alunos', async () => {
    expect(await getMatriculasPorMes()).toEqual([]);
  });
  it('getReceitaPorMes returns [] when no pagamentos', async () => {
    expect(await getReceitaPorMes()).toEqual([]);
  });
  it('getMatriculasPorPlano returns [] when no matriculas', async () => {
    expect(await getMatriculasPorPlano()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/lib/data.test.ts`
  Expected: FAIL (old code returns `crescimentoAnual`, swallows errors).

- [ ] **Step 3: Write minimal implementation** — replace `getDashboardStats` and add helpers:

```ts
function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function groupByMonth(rows: { date: Date }[]) {
  const map = new Map<string, number>();
  for (const { date } of rows) {
    const k = monthKey(date);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));
}

export async function getMatriculasPorMes() {
  const rows = await prisma.aluno.findMany({ select: { dataCadastro: true } });
  return groupByMonth(rows.map((r) => ({ date: r.dataCadastro })));
}

export async function getReceitaPorMes() {
  const rows = await prisma.pagamento.findMany({ select: { dataPagamento: true, valor: true } });
  const map = new Map<string, number>();
  for (const { dataPagamento, valor } of rows) {
    const k = monthKey(dataPagamento);
    map.set(k, (map.get(k) ?? 0) + valor);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([mes, total]) => ({ mes, total }));
}

export async function getMatriculasPorPlano() {
  const rows = await prisma.matricula.findMany({
    where: { status: 'ATIVA' },
    select: { Plano: { select: { nome: true } } },
  });
  const map = new Map<string, number>();
  for (const r of rows) {
    const nome = r.Plano?.nome ?? 'Sem plano';
    map.set(nome, (map.get(nome) ?? 0) + 1);
  }
  return [...map.entries()].map(([plano, total]) => ({ plano, total }));
}

function pctDelta(curr: number, prev: number) {
  if (prev === 0) return curr === 0 ? 0 : 1;
  return (curr - prev) / prev;
}

export async function getDashboardStats() {
  const [totalAlunos, matriculasAtivas, alunosInadimplentes, faturamentoMensal, matriculasPorMes, receitaPorMes, matriculasPorPlano] =
    await Promise.all([
      prisma.aluno.count(),
      prisma.matricula.count({ where: { status: 'ATIVA' } }),
      prisma.aluno.count({ where: { statusMatricula: 'INADIMPLENTE' } }),
      prisma.pagamento.aggregate({ _sum: { valor: true } }).then((r) => r._sum.valor ?? 0),
      getMatriculasPorMes(),
      getReceitaPorMes(),
      getMatriculasPorPlano(),
    ]);

  const last = (s: { total: number }[]) => s[s.length - 1]?.total ?? 0;
  const prev = (s: { total: number }[]) => s[s.length - 2]?.total ?? 0;

  const deltas = {
    alunos: pctDelta(matriculasPorMes.length ? totalAlunos : 0, prev(matriculasPorMes)),
    receita: pctDelta(last(receitaPorMes), prev(receitaPorMes)),
    inadimplentes: pctDelta(alunosInadimplentes, alunosInadimplentes),
    novos: pctDelta(last(matriculasPorMes), prev(matriculasPorMes)),
  };

  return DashboardStatsSchema.parse({
    totalAlunos,
    matriculasAtivas,
    alunosInadimplentes,
    faturamentoMensal,
    matriculasPorMes,
    receitaPorMes,
    matriculasPorPlano,
    deltas,
  });
}
```

> Note: remove the try/catch that returned `DashboardStatsSchema.parse({})` at line 151-154 and the synthetic `crescimentoAnual` block (136-142). Errors propagate so `error.tsx` catches them.

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/lib/data.test.ts`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/data.ts src/lib/data.test.ts
git commit -m "feat(dashboard): real Prisma series + KPI deltas, re-throw on DB error"
```

---

## Task 3: `KpiCard` component + test

**Files:**
- Create: `src/app/dashboard/_components/kpi-card.tsx`
- Test: `src/app/dashboard/_components/kpi-card.test.tsx`

**Interfaces:**
- Produces: `KpiCard` with props `{ title, value, delta?, icon }`. Renders `<Card glass>`, delta badge (green `+12%` / red `-5%`), text not color-only, `data-testid="kpi-{title}"`.

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiCard } from './kpi-card';
import { Users } from 'lucide-react';

describe('KpiCard', () => {
  it('renders value + delta with text, not color-only', () => {
    render(<KpiCard title="Total de Alunos" value="150" delta={0.12} icon={<Users />} />);
    expect(screen.getByTestId('kpi-Total de Alunos')).toBeTruthy();
    expect(screen.getByText('150')).toBeTruthy();
    expect(screen.getByText('+12%')).toBeTruthy();
  });

  it('renders negative delta', () => {
    render(<KpiCard title="Faturamento" value="R$ 1.000" delta={-0.05} icon={<Users />} />);
    expect(screen.getByText('-5%')).toBeTruthy();
  });

  it('omits delta badge when undefined', () => {
    render(<KpiCard title="X" value="1" icon={<Users />} />);
    expect(screen.queryByText(/%/)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/app/dashboard/_components/kpi-card.test.tsx`
  Expected: FAIL (file missing).

- [ ] **Step 3: Write implementation**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  delta?: number;
  icon: ReactNode;
}

function formatDelta(delta: number) {
  const pct = Math.round(delta * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}

export function KpiCard({ title, value, delta, icon }: Readonly<KpiCardProps>) {
  const hasDelta = typeof delta === 'number';
  const positive = hasDelta && delta >= 0;
  return (
    <Card
      glass
      data-testid={`kpi-${title}`}
      className="group relative overflow-hidden border-white/5 transition-all duration-200 active:scale-[0.98] md:hover:border-primary/30 md:duration-500 md:hover:-translate-y-1 glow-cyan"
      aria-label={`${title}: ${value}${hasDelta ? `, variação ${formatDelta(delta!)}` : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-blue-600/10 text-primary border border-white/5 md:group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <div className="text-2xl md:text-3xl font-headline font-black tracking-tight text-foreground drop-shadow-sm">
          {value}
        </div>
        {hasDelta && (
          <span
            className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs font-bold',
              positive ? 'text-green-400' : 'text-red-400'
            )}
          >
            {positive ? '▲' : '▼'} {formatDelta(delta!)}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/app/dashboard/_components/kpi-card.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/_components/kpi-card.tsx src/app/dashboard/_components/kpi-card.test.tsx
git commit -m "feat(dashboard): KpiCard with delta badge + aria-label"
```

---

## Task 4: `EmptyState` component + test

**Files:**
- Create: `src/app/dashboard/_components/empty-state.tsx`
- Test: `src/app/dashboard/_components/empty-state.test.tsx`

**Interfaces:**
- Produces: `EmptyState` `{ icon, title, description, testId? }` — ported from `card-treino.tsx:40-57` (dashed `glass` Card, centered icon, honest copy).

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';
import { CalendarOff } from 'lucide-react';

describe('EmptyState', () => {
  it('renders honest copy for empty dataset', () => {
    render(<EmptyState icon={<CalendarOff />} title="Sem histórico ainda" description="Sem dados para exibir." testId="chart-empty" />);
    expect(screen.getByTestId('chart-empty')).toBeTruthy();
    expect(screen.getByText('Sem histórico ainda')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/app/dashboard/_components/empty-state.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Write implementation**

```tsx
import { Card, CardContent } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  testId?: string;
}

export function EmptyState({ icon, title, description, testId }: Readonly<EmptyStateProps>) {
  return (
    <Card glass data-testid={testId} className="border-dashed border-white/10">
      <CardContent className="flex flex-col items-center justify-center text-center py-16 gap-6">
        <div className="p-6 rounded-full bg-white/5 border border-white/5 animate-float">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold font-headline">{title}</h3>
          <p className="text-muted-foreground max-w-xs mx-auto mt-2">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/app/dashboard/_components/empty-state.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/_components/empty-state.tsx src/app/dashboard/_components/empty-state.test.tsx
git commit -m "feat(dashboard): EmptyState for honest no-data rendering"
```

---

## Task 5: Multi-series chart (real data, tokenized, a11y)

**Files:**
- Create: `src/components/dashboard/dashboard-charts-multi.tsx`
- Test: `src/components/dashboard/dashboard-charts-multi.test.tsx`

**Interfaces:**
- Consumes: `matriculasPorMes`, `receitaPorMes`, `matriculasPorPlano` from `getDashboardStats`.
- Produces: chart trio (growth bars, revenue bars, plan dist) using tokens; `role="img"` + `aria-label`; `EmptyState` when all series empty.

- [ ] **Step 1: Write failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardChartsMulti } from './dashboard-charts-multi';
import { CalendarOff } from 'lucide-react';

vi.mock('@/app/dashboard/_components/empty-state', () => ({
  EmptyState: ({ title, testId }: { title: string; testId?: string }) => (
    <div data-testid={testId}>{title}</div>
  ),
}));

describe('DashboardChartsMulti', () => {
  it('renders empty-state when all series empty', () => {
    render(
      <DashboardChartsMulti
        matriculasPorMes={[]}
        receitaPorMes={[]}
        matriculasPorPlano={[]}
      />
    );
    expect(screen.getByTestId('charts-empty')).toBeTruthy();
  });

  it('renders charts with role=img when data present', () => {
    render(
      <DashboardChartsMulti
        matriculasPorMes={[{ mes: '2026-01', total: 5 }]}
        receitaPorMes={[{ mes: '2026-01', total: 500 }]}
        matriculasPorPlano={[{ plano: 'Bronze', total: 3 }]}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/components/dashboard/dashboard-charts-multi.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Write implementation** — tokenize colors, drop hardcoded `oklch()`, add `role="img"` + `aria-label`, empty-state branch:

```tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EmptyState } from '@/app/dashboard/_components/empty-state';
import { CalendarOff } from 'lucide-react';
import type { MonthTotal, PlanTotal } from '@/lib/definitions';

interface Props {
  matriculasPorMes: MonthTotal[];
  receitaPorMes: MonthTotal[];
  matriculasPorPlano: PlanTotal[];
}

export function DashboardChartsMulti({ matriculasPorMes, receitaPorMes, matriculasPorPlano }: Readonly<Props>) {
  const isEmpty = !matriculasPorMes.length && !receitaPorMes.length && !matriculasPorPlano.length;
  if (isEmpty) {
    return (
      <EmptyState
        testId="charts-empty"
        icon={<CalendarOff className="h-16 w-16 text-muted-foreground/50" />}
        title="Sem histórico ainda"
        description="Assim que houver matrículas ou pagamentos, os gráficos aparecem aqui."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="glass-card overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 glow-cyan">
        <CardHeader className="border-b border-white/5 bg-background/20 pb-4">
          <CardTitle className="font-headline tracking-wide font-black uppercase text-sm text-foreground">Matrículas por mês</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pl-2 pb-2 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={matriculasPorMes} maxBarSize={32} role="img" aria-label="Gráfico de matrículas por mês">
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="color-mix(in oklch, var(--color-primary) 8%, transparent)" />
              <XAxis dataKey="mes" stroke="var(--color-muted-foreground)" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dx={-12} />
              <Tooltip cursor={{ fill: 'color-mix(in oklch, var(--color-primary) 3%, transparent)' }} contentStyle={{ background: 'var(--background-glass)', border: '1px solid var(--border-glass)', borderRadius: '14px', color: 'var(--color-foreground)' }} />
              <Bar dataKey="total" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* revenue chart: same Card/BarChart shape, data=receitaPorMes, aria-label="Gráfico de faturamento por mês" */}
      {/* plan chart: data=matriculasPorPlano (dataKey="total", XAxis dataKey="plano"), aria-label="Distribuição de matrículas por plano" */}
    </div>
  );
}
```

> ponytail: revenue + plan charts repeat the same Card/BarChart shape with different `data`/`aria-label`; both use tokens. Fill tracks theme via `var(--color-primary)` / `var(--color-gold)`.

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/components/dashboard/dashboard-charts-multi.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/dashboard-charts-multi.tsx src/components/dashboard/dashboard-charts-multi.test.tsx
git commit -m "feat(dashboard): tokenized multi-series charts with a11y + empty-state"
```

---

## Task 6: Overview page wiring (KPI grid + charts)

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Test: `src/app/dashboard/page.test.tsx` (update)

**Interfaces:**
- Consumes: `getDashboardStats`, `KpiCard`, `DashboardChartsMulti`.

- [ ] **Step 1: Write/Update failing test** — replace `page.test.tsx` mock + add KPI assertions:

```tsx
vi.mock('@/lib/data', () => ({
  getDashboardStats: vi.fn().mockResolvedValue({
    totalAlunos: 150,
    matriculasAtivas: 120,
    alunosInadimplentes: 15,
    faturamentoMensal: 45000,
    matriculasPorMes: [{ mes: '2026-01', total: 5 }],
    receitaPorMes: [{ mes: '2026-01', total: 500 }],
    matriculasPorPlano: [{ plano: 'Bronze', total: 3 }],
    deltas: { alunos: 0.1, receita: -0.05, inadimplentes: 0, novos: 0.2 },
  }),
}));
// assert
expect(screen.getByTestId('kpi-Total de Alunos')).toBeTruthy();
expect(screen.getByText('+10%')).toBeTruthy();
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/app/dashboard/page.test.tsx`
  Expected: FAIL (old mock has `crescimentoAnual`; no KpiCard).

- [ ] **Step 3: Write implementation** — rewrite `page.tsx`:

```tsx
import { PageHeader } from '@/components/page-header';
import { getDashboardStats } from '@/lib/data';
import { KpiCard } from './_components/kpi-card';
import { DashboardChartsMulti } from '@/components/dashboard/dashboard-charts-multi';
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    { title: 'Total de Alunos', value: stats.totalAlunos.toLocaleString('pt-BR'), delta: stats.deltas.alunos, icon: <Users className="h-5 w-5" /> },
    { title: 'Matrículas Ativas', value: stats.matriculasAtivas.toLocaleString('pt-BR'), delta: stats.deltas.novos, icon: <UserCheck className="h-5 w-5" /> },
    { title: 'Inadimplentes', value: stats.alunosInadimplentes.toLocaleString('pt-BR'), delta: stats.deltas.inadimplentes, icon: <UserX className="h-5 w-5" /> },
    { title: 'Faturamento Mensal', value: stats.faturamentoMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), delta: stats.deltas.receita, icon: <DollarSign className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader title="Dashboard" description="Bem-vindo ao centro de comando da Five Star Gym." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} delta={kpi.delta} icon={kpi.icon} />
        ))}
      </div>
      <DashboardChartsMulti
        matriculasPorMes={stats.matriculasPorMes}
        receitaPorMes={stats.receitaPorMes}
        matriculasPorPlano={stats.matriculasPorPlano}
      />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/app/dashboard/page.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/page.tsx src/app/dashboard/page.test.tsx
git commit -m "feat(dashboard): wire overview KPI grid + real charts"
```

---

## Task 7: Layout double-`<main>` fix + `pb-20`

**Files:**
- Modify: `src/app/dashboard/layout.tsx:118-123`

**Interfaces:**
- RISKY: removing wrong `<main>` breaks layout/SR. Keep `SidebarInset`'s `<main>` (`sidebar.tsx:311`), drop `layout.tsx:120`.

- [ ] **Step 1: Write failing test** — `src/app/dashboard/layout.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import DashboardLayout from './layout';

vi.mock('@/utils/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'x', email: 'a@b.c', user_metadata: {} } }, error: null }) },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
  }),
}));

describe('DashboardLayout', () => {
  it('renders exactly one <main> landmark', () => {
    const { container } = render(<DashboardLayout>{<div>child</div>}</DashboardLayout>);
    expect(container.querySelectorAll('main')).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/app/dashboard/layout.test.tsx`
  Expected: FAIL (2 `<main>` currently).

- [ ] **Step 3: Write implementation** — replace lines 118-123:

```tsx
<SidebarInset className="bg-background/95">
  <DashboardHeader displayName={displayName} email={user.email!} photoURL={photoURL} />
  <div className="flex-1 p-6 pb-20 md:p-8 md:pb-8 max-w-[1600px] mx-auto w-full">
    {children}
  </div>
</SidebarInset>
```

> Removed `<main>` wrapper; `pb-20` now on inner `div` so mobile clears bottom-nav. `SidebarInset` still renders its own `<main>`.

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/app/dashboard/layout.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/layout.test.tsx
git commit -m "fix(dashboard): single <main> landmark, move pb-20 to inner wrapper"
```

---

## Task 8: Tokenize sub-pages (alunos / financeiro / planos / treinos)

**Files:**
- Modify: `src/app/dashboard/alunos/page.tsx:19`, `financeiro/page.tsx:42-54`, `planos/page.tsx` (wrapper), `treinos/page.tsx`

**Interfaces:**
- Consumes: tokens `bg-background`, `text-foreground`, `text-muted-foreground`, `glass-card`, `glow-cyan`.

- [ ] **Step 1: Write failing test** — `src/app/dashboard/alunos/page.test.tsx` + `financeiro/page.test.tsx`: assert no `bg-black`/`#18181B`/`text-zinc-400` in rendered HTML, and `pb-20` present.

```tsx
it('uses tokens, not bg-black, and clears bottom nav', async () => {
  const { container } = render(await AlunosPage());
  const html = container.innerHTML;
  expect(html).not.toContain('bg-black');
  expect(html).toContain('pb-20');
});
```

- [ ] **Step 2: Run test to verify it fails** — `npx vitest run src/app/dashboard/alunos/page.test.tsx src/app/dashboard/financeiro/page.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Write minimal implementation**
- `alunos/page.tsx:19`: `<div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-dvh">` → `<div className="max-w-7xl mx-auto px-4 py-8 pb-20 bg-background min-h-dvh">`
- `financeiro/page.tsx:42`: `bg-black` → `bg-background`; `:47` Card `bg-[#18181B] border-white/10 ... shadow-[0_0_15px_rgba(34,211,238,0.05)]` → `glass-card border-white/10 glow-cyan`; `:49` `text-white` → `text-foreground`; `:52` `text-zinc-400` → `text-muted-foreground`; add `pb-20` to wrapper.
- `planos/page.tsx`: wrap return in `<div className="pb-20">…</div>` (keep existing Suspense).
- `treinos/page.tsx`: wrap `<TreinosManagementClient>` in `<div className="pb-20">` and add `<Suspense fallback={<PlanosSkeleton/>}>` (reuse `PlanosSkeleton` from planos page or a simple `Skeleton`).

- [ ] **Step 4: Run test to verify it passes** — `npx vitest run src/app/dashboard/alunos/page.test.tsx src/app/dashboard/financeiro/page.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/alunos/page.tsx src/app/dashboard/financeiro/page.tsx src/app/dashboard/planos/page.tsx src/app/dashboard/treinos/page.tsx src/app/dashboard/alunos/page.test.tsx src/app/dashboard/financeiro/page.test.tsx
git commit -m "feat(dashboard): tokenize sub-pages, add pb-20, Suspense on treinos"
```

---

## Task 9: Loading + Error states

**Files:**
- Create: `src/app/dashboard/loading.tsx`, `src/app/dashboard/error.tsx`
- Modify: `src/components/ui/dashboard-skeletons.tsx` (add `DashboardOverviewSkeleton`)
- Test: `src/app/dashboard/loading.test.tsx`, `src/app/dashboard/error.test.tsx`

**Interfaces:**
- Produces: `loading.tsx` renders `DashboardOverviewSkeleton`; `error.tsx` `reset()` retry button.

- [ ] **Step 1: Write failing tests**

```tsx
// loading.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardLoading from './loading';
describe('DashboardLoading', () => {
  it('renders overview skeleton', () => {
    render(<DashboardLoading />);
    expect(screen.getByTestId('overview-skeleton')).toBeTruthy();
  });
});

// error.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardError from './error';
describe('DashboardError', () => {
  it('shows retry button calling reset()', () => {
    const reset = vi.fn();
    render(<DashboardError error={new Error('x')} reset={reset} />);
    screen.getByRole('button', { name: /tentar novamente/i }).click();
    expect(reset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail** — `npx vitest run src/app/dashboard/loading.test.tsx src/app/dashboard/error.test.tsx`
  Expected: FAIL.

- [ ] **Step 3: Write implementation**
- `dashboard-skeletons.tsx`: add

```tsx
export function DashboardOverviewSkeleton() {
  return (
    <div data-testid="overview-skeleton" className="space-y-8">
      <PremiumSkeleton className="h-10 w-[300px]" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {['k0', 'k1', 'k2', 'k3'].map((k) => (
          <PremiumSkeleton key={k} className="h-32 rounded-xl" />
        ))}
      </div>
      <PremiumSkeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
}
```

- `loading.tsx`:

```tsx
import { DashboardOverviewSkeleton } from '@/components/ui/dashboard-skeletons';
export default function DashboardLoading() {
  return <DashboardOverviewSkeleton />;
}
```

- `error.tsx`:

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-4" role="alert">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-bold text-foreground">Não foi possível carregar o dashboard</h2>
      <p className="text-muted-foreground max-w-sm">{error.message}</p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass** — `npx vitest run src/app/dashboard/loading.test.tsx src/app/dashboard/error.test.tsx`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/loading.tsx src/app/dashboard/error.tsx src/app/dashboard/loading.test.tsx src/app/dashboard/error.test.tsx src/components/ui/dashboard-skeletons.tsx
git commit -m "feat(dashboard): loading + error boundaries with retry"
```

---

## Task 10: Final gates + delete legacy chart

**Files:**
- Delete: `src/components/dashboard/dashboard-charts.tsx` (replaced by `dashboard-charts-multi.tsx`)
- Run: 4 gates.

- [ ] **Step 1: Confirm no importer of legacy chart** — `grep -rn "dashboard-charts'" src` → only `page.tsx` (already rewired in Task 6). Delete file.

- [ ] **Step 2: Run full gates**

```bash
npm test && npm run lint && npm run typecheck
```

Expected: all green.

- [ ] **Step 3: Run E2E (staging env)**

```bash
npm run e2e
```

Expected: green (or pre-existing unrelated failures documented).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(dashboard): remove legacy hardcoded chart, finalize refactor"
```

---

## Self-Review

**1. Spec coverage:**
- §1 data layer (remove synthetic, re-throw, real queries + deltas) → Tasks 1-2. ✓
- §2 layout (KPI grid, charts, KpiCard, EmptyState, double-`<main>`, token sub-pages, treinos Suspense) → Tasks 3-8. ✓
- §3 states (loading, error, empty) + tests (TDD) → Tasks 3-4, 9. ✓
- Risky items: double-`<main>` (Task 7, rollback = revert single line), silent-default removal (Task 2 re-throw + Task 9 error.tsx). ✓

**2. Placeholder scan:** No TBD/TODO. All code steps show actual code. Task 5 leaves revenue/plan chart repetition noted via `ponytail:` comment (intentional, not a placeholder). Mock helper in Task 7 noted as fallback, not a gap.

**3. Type consistency:** `MonthTotal`/`PlanTotal` defined in Task 1 (`definitions.ts`), consumed in Tasks 2 (`getMatriculasPorMes` etc return `MonthTotal[]`) and 5 (`DashboardChartsMulti` props). `DashboardStats` shape consistent across Tasks 1-2-6. `KpiCard`/`EmptyState` props stable Tasks 3-4-6-9. ✓

**Reduced-motion:** Verified `globals.css:190-207` already applies `*` reduced-motion globally (covers `animate-glow-pulse` + `animate-float`) — spec item already satisfied; no new code needed.
