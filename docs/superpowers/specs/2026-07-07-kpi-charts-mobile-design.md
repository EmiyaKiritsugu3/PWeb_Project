# Design: KPI + Charts Mobile

**Date:** 2026-07-07
**Branch:** `feat/kpi-charts-mobile`
**Scope:** Dashboard KPI grid + chart responsiveness for mobile. Replace hover feedback with tap feedback.

## Problem

`src/app/dashboard/page.tsx`:

1. **KPI grid 1-col on mobile** — line 56: `grid gap-6 md:grid-cols-2 lg:grid-cols-4`. Mobile stacks 4 KPI cards vertically. Long scroll before charts. Premium dashboards use 2-col on phone to surface all KPIs above fold.
2. **Hover-only feedback** — card `hover:-translate-y-1`, `group-hover:scale-110`, `w-0 group-hover:w-full`. Mobile no hover. No tap feedback. Violates `hover-vs-tap` and `tap-feedback-speed` (100ms visual feedback).
3. **Hardcoded delta** — `↑ 12% vs mês anterior` on every card including Inadimplentes. PRD-2 removes this; PRD-6 owns KPI card layout that displays trend.
4. **recharts responsive gap** — `src/components/ui/chart.tsx` uses recharts. Memory `project_recharts3_breaking.md` notes recharts 3 removed `payload`/`label` from Tooltip type. Current chart may use deprecated `barSize`. Mobile chart needs `maxBarSize` + container height.

## Design

### 1. KPI grid 2-col mobile

```diff
- <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
+ <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
```

Mobile (default): 2-col. Tablet/desktop inherits. Smaller gap on mobile (`gap-3`) for density.

Card padding mobile-tight:
```diff
- <Card className="p-6">
+ <Card className="p-4 md:p-6">
```

### 2. Tap feedback replace hover

Card active state via `active:scale-[0.98]` (Material press feedback) + persistent bottom-border on mobile:

```diff
- hover:-translate-y-1 transition-all duration-500
- group-hover:scale-110
- w-0 group-hover:w-full transition-all duration-700  (hover-only border)
+ active:scale-[0.98] transition-all duration-200
+ border-b-2 border-primary/20  (persistent, visible without hover)
```

ponytail: drop hover effects that convey nothing on mobile. Bottom border conveys "interactive card" without hover. Upgrade path: keep `md:hover:-translate-y-1` for desktop only if lift effect desired.

### 3. Trend badge from data (refactor)

Combined with PRD-2 §2. KPI definition gets `trend?: { direction: 'up' | 'down' | 'flat'; value: string | null }`. Render:

```tsx
{kpi.trend && (
  <span className={cn(
    'text-xs font-medium',
    kpi.trend.direction === 'up' && 'text-emerald-400',
    kpi.trend.direction === 'down' && 'text-destructive',
    kpi.trend.direction === 'flat' && 'text-muted-foreground',
  )}>
    {kpi.trend.direction === 'up' ? '↑' : kpi.trend.direction === 'down' ? '↓' : '→'}
    {kpi.trend.value && ` ${kpi.trend.value}`}
  </span>
)}
```

If no trend data: omit badge entirely. No hardcoded "↑ 12%".

### 4. Chart container fixed height + maxBarSize

`src/components/ui/chart.tsx` wrapping recharts:

```tsx
<ChartContainer className="h-[200px] w-full md:h-[300px]" config={config}>
  <BarChart data={data} maxBarSize={32}>
```

`maxBarSize={32}` replaces deprecated `barSize` (recharts 3 — see memory `project_recharts3_breaking.md`). Container fixed height prevents layout shift (`content-jumping`, CLS).

Mobile chart height 200px (readable without horizontal scroll), desktop 300px.

### 5. Chart legend below on mobile

Recharts `Legend` vertical layout on mobile, horizontal on desktop. Pass responsive `layout` prop based on `useIsMobile()` (or Tailwind `md:` breakpoint hook already in repo):
```tsx
const isMobile = useIsMobile(); // existing hook
<Legend
  layout={isMobile ? 'vertical' : 'horizontal'}
  verticalAlign="bottom"
  align={isMobile ? 'center' : 'right'}
  wrapperStyle={{ fontSize: '12px' }}
/>
```

Vertical on mobile stacks legend items below chart (no horizontal overflow). Horizontal on desktop keeps compact inline legend. Tailwind text-size handling for chart labels impossible (SVG); wrapperStyle sets size directly. `useIsMobile` already exists — no new hook, no JS breakpoint duplication.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/app/dashboard/page.tsx` | 2-col grid, tap feedback, trend badge render | Medium |
| `src/components/ui/chart.tsx` | fixed container height, `maxBarSize`, legend fontSize | Medium (recharts 3 type compat) |
| `src/app/dashboard/data-source.ts` (if exists) | +`trend` field per KPI | Low |
| `src/app/dashboard/page.test.tsx` | update grid assertions | Low |

## Out of Scope

- New chart types
- Live data streaming
- recharts 3 full migration (memory notes chart.tsx needs rewrite — defer)

## Success Criteria

1. Mobile: KPI grid 2-col, all 4 above fold.
2. Tap on card: `active:scale-[0.98]` feedback within 100ms.
3. No hardcoded "↑ 12%" — trend from data or omitted.
4. Chart container fixed height, no CLS on data load.
5. `maxBarSize` instead of `barSize` (recharts 3 compat).
6. Chart legend readable on mobile (12px).
7. All 4 gates green.
