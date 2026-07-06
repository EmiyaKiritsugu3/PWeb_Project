# Design: Mobile-First Foundation

**Date:** 2026-07-07
**Branch:** `feat/mobile-first-foundation`
**Scope:** Infrastructure only — viewport, dynamic viewport units, touch targets, safe-area, reduced-motion. Zero visual redesign.

## Problem

Webapp primary target is mobile (`mobile-first methodology`, user directive 2026-07-05). Current foundation broken for phone:

1. **No viewport export** — `src/app/layout.tsx` has `metadata` but no `export const viewport`. Next.js 15 App Router no longer auto-emits viewport meta. Page renders at desktop width on phones → text tiny, layout cramped.
2. **`vh` units, not `dvh`** — landing hero `min-h-[75vh md:min-h-[85vh]]` (`src/app/page.tsx`), aluno layout `min-h-screen` (`src/app/aluno/aluno-layout.tsx`), loading spinner `h-screen`. iOS Safari URL bar show/hide makes `100vh` jump ~80px. Content clipped, buttons hidden behind URL bar.
3. **Touch targets below 44pt** — `aluno-header.tsx` trigger buttons `h-9 w-9` (36px). Below Apple HIG 44pt / Material 48dp. Mis-taps.
4. **No safe-area-inset** — notch, home indicator, gesture bar overlap content. iPhone 15: bottom content under home indicator.
5. **No `prefers-reduced-motion`** — `dashboard-nav.tsx:75` runs `animate-pulse` unconditionally on active rail. `login/page.tsx:63` runs `animate-glow-pulse` infinite. Vestibular users get no opt-out.

## Design

### 1. Viewport export

Add to `src/app/layout.tsx`:

```typescript
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // unlocks env(safe-area-inset-*)
  colorScheme: 'dark',
};
```

`viewportFit: 'cover'` critical — without it `env(safe-area-inset-*)` returns `0` on iOS. `colorScheme: 'dark'` makes native form controls match theme.

### 2. dvh swap

Replace `vh`/`screen` with `dvh` globally. Tailwind 4 has `min-h-dvh`, `h-dvh` built-in.

```
src/app/page.tsx                 — min-h-[75vh] → min-h-[75dvh]; md:min-h-[85vh] → md:min-h-[85dvh]
src/app/aluno/aluno-layout.tsx   — min-h-screen → min-h-dvh (wrapper); LoadingSpinner h-screen → h-dvh
src/app/dashboard/layout.tsx     — min-h-screen → min-h-dvh; overflow-hidden keep
src/app/login/page.tsx           — min-h-screen → min-h-dvh
src/components/ui/sidebar.tsx    — if uses h-screen via isMobile, swap to h-dvh
```

**Test impact:** `src/app/dashboard/alunos/page.test.tsx:23` asserts `container.querySelector('.min-h-screen')`. Update assertion to `.min-h-dvh` in same PR. One-task-one-file rule: test update is its own task in plan, same PR.

### 3. Touch target 44pt

`aluno-header.tsx` trigger buttons `h-9 w-9` (36px) → `h-11 w-11` (44px). Add `touch-target` utility class in globals.css utilities layer:

```css
@layer utilities {
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }
}
```

Apply to icon-only buttons across aluno-header, dashboard header, workout card action buttons.

### 4. Safe-area padding

Add base layer rules:

```css
@layer base {
  body {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    overscroll-behavior: none; /* prevent bounce / pull-to-refresh interfering with gestures */
  }
}
```

ponytail: global padding safe — viewportFit cover active. If specific edge-to-edge needs override (bottom nav in PRD-3), use `padding: 0` + safe-area on children where collisions occur. Upgrade path: per-element safe-area classes if global causes layout issues.

Fixed elements (sticky headers, bottom nav) get safe-area explicitly:

```
sticky header: pt-[env(safe-area-inset-top)] on top of own padding
bottom nav (PRD-3): pb-[env(safe-area-inset-bottom)]
```

### 5. Reduced-motion

Add to `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Kills `animate-pulse`, `animate-glow-pulse`, `animate-float` for vestibular users. Standard WCAG 2.2 SC 2.3.3 pattern.

### 6. next/font swap (foundation-level, defer to PRD-7)

Inter/Outfit referenced in `@theme --font-body/headline` as literal `'Inter'`/`'Outfit'` — never loaded via `next/font/google`. Browser falls back to sans-serif. Documented here because foundation touches `globals.css`; actual swap is PRD-7 to keep this PRD small.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/app/layout.tsx` | +`viewport` export | Low |
| `src/app/globals.css` | +`.touch-target` util, +safe-area padding on body, +`overscroll-behavior`, +reduced-motion media query | Medium |
| `src/app/page.tsx` | `vh` → `dvh` on hero | Low |
| `src/app/aluno/aluno-layout.tsx` | `min-h-screen` → `min-h-dvh`, spinner `h-dvh` | Low |
| `src/app/dashboard/layout.tsx` | `min-h-screen` → `min-h-dvh` | Low |
| `src/app/login/page.tsx` | `min-h-screen` → `min-h-dvh` | Low |
| `src/app/aluno/aluno-header.tsx` | trigger buttons `h-9 w-9` → `h-11 w-11` | Low |
| `src/app/dashboard/alunos/page.test.tsx` | `.min-h-screen` assertion → `.min-h-dvh` | Low |

## Out of Scope

- Bottom navigation bar (PRD-3)
- Brand palette unification / orange hex removal (PRD-2)
- KPI / chart mobile layout (PRD-6)
- next/font integration (PRD-7)
- Visual redesign of any component

## Success Criteria

1. Phone viewport meta present: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
2. iOS Safari: content visible above URL bar with `dvh`. No `100vh` jump.
3. iPhone with notch: content not under notch or home indicator.
4. Icon-only buttons ≥44px on both axes.
5. `prefers-reduced-motion: reduce` disables infinite animations.
6. `alunos/page.test.tsx` updated + passing.
7. All 4 gates green: typecheck, lint, format:check, test.
8. E2E suite (21 specs) green — no selector broken by dvh swap.
