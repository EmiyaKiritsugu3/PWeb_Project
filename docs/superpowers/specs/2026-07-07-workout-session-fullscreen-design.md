# Design: Workout Session Mobile Fullscreen + Series Grid Stability

**Date:** 2026-07-07
**Branch:** `feat/workout-session-mobile`
**Scope:** Mobile fullscreen mode for workout session. Replace fragile `div.grid-cols-4` selector with `data-testid`. Zero data change.

## Problem

`src/components/WorkoutSession.tsx` — workout in-progress UI on phone:

1. **Not fullscreen** — session renders as Card inside aluno layout. On phone, header/tabs/bottom nav compete for screen real estate. Fat-finger risk on series check buttons.
2. **Fragile E2E selector** — `tests/e2e/specs/workout-session.spec.ts:21,36` uses `page.locator('div.grid-cols-4').getByRole('button').first()`. Tailwind class as selector — any grid layout change breaks E2E. Workflow verification flag #2.
3. **Series grid not optimized for thumb reach** — `grid-cols-4` series check buttons small on mobile. Below 44pt target zone; thumb must traverse full screen.

## Design

### 1. Mobile fullscreen overlay

Wrap session in `fixed inset-0 z-50 bg-background` on mobile, normal Card on desktop:

```tsx
<div className="fixed inset-x-0 top-0 z-50 min-h-dvh bg-background md:static md:z-auto md:min-h-0 md:bg-transparent">
  <div className="flex h-dvh flex-col md:h-auto">
    {/* header */}
    {/* scrollable series content */}
    {/* sticky footer with timer + next/finish */}
  </div>
</div>
```

Checks `tailwindcss-animate` plugin — if `animate-in slide-in-from-bottom` unavailable, pure CSS fallback:
```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```
Apply `animate-[slide-up_0.3s_ease-out]` via Tailwind arbitrary. PRD-1 reduced-motion gates this.

Gated by `prefers-reduced-motion`: animation → 0.01ms.

### 2. Series grid → data-testid

Replace `div.grid-cols-4` selector target with semantically testable:

```tsx
<div data-testid="series-row" className="grid grid-cols-4 gap-2">
  {seriesExecutadas.map((serie, idx) => (
    <button
      data-testid={`serie-check-${idx}`}
      aria-label={`Marcar série ${idx + 1}`}
      className="touch-target"
    >
      <Check className="h-5 w-5" />
    </button>
  ))}
</div>
```

Old:
```typescript
// workout-session.spec.ts:21
const seriesCheckButton = page.locator('div.grid-cols-4').getByRole('button').first();
```

New:
```typescript
const seriesCheckButton = page.getByTestId('serie-check-0');
```

One-task-one-file: spec update is separate task in plan, same PR. Both must ship together or E2E breaks.

### 3. Touch targets on series

Series check buttons get `touch-target` (44px min) from PRD-1 utilities layer. Each grid item:
```css
grid item: flex items-center justify-center min-h-[44px] rounded-md border
active: bg-primary text-primary-foreground border-primary
done: bg-primary/10 border-primary/30
```

ponytail: `grid-cols-4` keep on 4-series exercises. For 3 or 5 series, `grid-cols-[repeat(auto-fit,minmax(44px,1fr))]`. Upgrade path: dynamic cols if exercises vary wildly. Skip for now.

### 4. Sticky footer (mobile-only)

```
┌────────────────────────────────────────┐
│ ← Supino Reto                           │
│   série 2/4                             │
├────────────────────────────────────────┤
│                                        │
│  [✓][✓][✓][✓]  ← series row             │
│  Peso: [   ]  Reps: [   ]              │
│                                        │
├────────────────────────────────────────┤
│  ⏱ 02:34                  [Próximo →]  │  ← sticky bottom
└────────────────────────────────────────┘
```

Footer `sticky bottom-0` with timer + next exercise button. Primary action always visible above URL bar (PRD-1 dvh keeps footer in viewport).

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/components/WorkoutSession.tsx` | fullscreen wrapper, data-testid series row, touch-target series, sticky footer | Medium |
| `src/components/WorkoutSession.test.tsx` | update selectors to data-testid | Medium |
| `tests/e2e/specs/workout-session.spec.ts` | swap `div.grid-cols-4` → `getByTestId('serie-check-0')` | Low (same PR as component) |

## Out of Scope

- Workout feedback AI flow (Genkit, separate spec)
- Cardio timer mode
- Rest timer audio cue

## Success Criteria

1. Mobile: session opens fullscreen, no header/bottom nav visible during workout.
2. Desktop: session inline as before.
3. E2E: `getByTestId('serie-check-0')` stable, no `div.grid-cols-4` selector.
4. Series buttons ≥44px touch target.
5. Sticky footer with timer + next above URL bar on iOS.
6. `prefers-reduced-motion`: slide-up disabled.
7. All 4 gates green + workout-session E2E spec green.
