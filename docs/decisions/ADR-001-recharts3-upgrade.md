# ADR-001: Recharts 2 → 3 Upgrade

**Status:** Accepted

**Date:** 2026-07-04

## Context

The project used recharts 2.15.4. PR #78 (2026-04-22) upgraded to recharts ^3.8.1 to unblock Tailwind CSS v4 (recharts 3 requires React 19 / Tailwind v4 compatible peer deps). The breaking change was already absorbed in the codebase.

### Breaking change absorbed

Recharts 3 removed `payload`, `label`, and coordinate props from the `ComponentProps` type (used by `Tooltip`, `Legend`, and `Customized` components). The types were moved to named exports `DefaultLegendContentProps` and `TooltipContentProps`.

## Decision

Upgrade `recharts` from 2.15.4 to ^3.8.1 with the import type pivot:

```typescript
// Before (recharts 2)
import type { ContentType } from 'recharts/types/component/DefaultLegendContent';

// After (recharts 3)
import type { DefaultLegendContentProps, TooltipContentProps } from 'recharts';
```

The import path change is the only migration cost. No runtime API changes affected the project's chart usage.

## Consequences

### Positive

- React 19 / Tailwind v4 compatibility via recharts 3 peer deps
- `types/component/` deep path removed from sensitive type imports
- TypeScript strict mode compatible (no `@ts-ignore` needed)

### Negative

- None. The breaking type change was fully absorbed in `src/components/ui/chart.tsx:5`.

## Files Changed

- `src/components/ui/chart.tsx` — recharts import type pivot
- `package.json` — `recharts` dep bumped from 2.15.4 to ^3.8.1

## Testing

- `npm run typecheck` — 0 errors
- `npm run test` — 1103/1103
- `npm run e2e` — 21/21 (dashboard smoke + chart render)
- `/dashboard` — manual smoke: charts render with correct axis labels, tooltip on hover, legend visible
