# Design: Brand Consistency

**Date:** 2026-07-07
**Branch:** `fix/brand-consistency`
**Scope:** Color palette unification only. Replace orange hex with cyan primary token. Zero structural change.

## Problem

`globals.css` `@theme` defines primary as `oklch(0.7 0.25 190)` — neon cyan. Three competing palette sources:

1. **Landing page orange** — `src/app/page.tsx`:
   - Hero dumbbell: `drop-shadow-[0_0_15px_rgba(255,102,0,0.8)]` (orange hex `#ff6600`)
   - CTA button shadow: `shadow-[0_0_20px_rgba(255,102,0,0.3)] hover:shadow-[0_0_30px_rgba(255,102,0,0.6)]`
   - H2 gradient: `from-primary to-orange-300` (mixes cyan token with raw orange-300)
2. **Premium Concept 5 tokens dissolving** — primary token is cyan, but landing glow is orange. Reader cannot tell which is brand color.
3. **`dashboard.tsx` KPI hack** — `kpi.color.replaceAll('/20','')` (`src/app/dashboard/page.tsx`) to derive badge color from card border. Fragile, breaks if className changes.

Brand reads as 3 colors (cyan primary, orange glow on landing, brutalist dark). Premium impression weakened.

## Design

### 1. Remove orange hex from landing

Replace `rgba(255,102,0,*)` with `bg-primary/` and `shadow-glow-cyan` tokens already defined in `globals.css`:

`src/app/page.tsx`:
```diff
- drop-shadow-[0_0_15px_rgba(255,102,0,0.8)]
+ drop-shadow-[0_0_15px_oklch(0.7_0.25_190_/_0.8)]

- shadow-[0_0_20px_rgba(255,102,0,0.3)] hover:shadow-[0_0_30px_rgba(255,102,0,0.6)]
+ shadow-glow-cyan hover:shadow-glow-cyan-hover

- from-primary to-orange-300
+ text-gradient-cyan (or from-primary to-primary/70 for single-hue gradient)
```

Tailwind 4 supports `oklch()` in arbitrary `drop-shadow` — escape spaces with underscores. Or simpler: use existing `.glow-cyan` component class on parent.

### 2. Remove `kpi.color.replaceAll` hack

`src/app/dashboard/page.tsx:80-82` — hardcoded `↑ 12% vs mês anterior` on every KPI card including "Inadimplentes" (delta makes no sense). Two fixes:

(a) Per-card delta source — pass real delta from data layer. For now, if delta unavailable, drop badge entirely.

(b) Badge color — derive from `trend: 'up' | 'down' | 'flat'` field on KPI definition, not className string manipulation.

```typescript
// in dashboard page, replace kpi.color.replaceAll('/20','') with:
const trendIcon = kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→';
const trendClass = kpi.trend === 'up' ? 'text-emerald-400' : kpi.trend === 'down' ? 'text-destructive' : 'text-muted-foreground';
```

### 3. Cyan primary everywhere

Audit — grep for `rgba(255,102,0` and `orange-` across `src/`:

Acceptable: `orange-` in contexts not brand (warning indicators, expiration badges) — semantic destructive/warning can stay.

Not acceptable: any `rgba(255,102,0` hex matching primary accent, CTA shadows, glow effects. Swap to `bg-primary/`, `glow-cyan`, `text-primary`.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/app/page.tsx` | orange hex → primary token, glow-cyan class | Low |
| `src/app/dashboard/page.tsx` | remove `replaceAll` hack, per-KPI trend field | Medium |
| `src/app/dashboard/data-source.ts` (if exists) | +`trend` field on KPI definitions | Low |

## Out of Scope

- Redesigning dashboard layout (PRD-6)
- KPI grid mobile 2-col (PRD-6)
- Chart updates (PRD-6)

## Success Criteria

1. `grep -r "rgba(255,102,0" src/app/page.tsx src/app/dashboard/ src/app/login/` returns 0 hits.
2. No `orange-300` in landing gradient.
3. KPI badges show trend from data, not hardcoded "↑ 12%". Inadimplentes card no longer shows "↑ 12%".
4. Brand reads as single cyan-primary system.
5. All 4 gates green.
