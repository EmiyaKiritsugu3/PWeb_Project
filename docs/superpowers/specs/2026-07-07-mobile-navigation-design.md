# Design: Mobile Navigation

**Date:** 2026-07-07
**Branch:** `feat/mobile-navigation`
**Scope:** Add bottom navigation bar for mobile on aluno + dashboard. Replace dropdown-hidden mobile nav. Desktop unchanged.

## Problem

Mobile navigation anti-patterns across both layouts:

1. **Aluno nav invisible on mobile** — `aluno-header.tsx` renders nav `hidden md:flex` (line 139). Mobile users only reach nav links via avatar dropdown (lines 90-100, `md:hidden` block inside `DropdownMenuContent`). Primary destinations 2 taps away. Violates `bottom-nav-limit` and `hover-vs-tap`: nav hidden behind a tap.
2. **Dashboard mobile nav via Sheet** — `dashboard/layout.tsx` uses shadcn `Sidebar` + `Sheet` (hamburger top-right). Sheet valid for secondary nav (`drawer-usage`), but primary destinations (Dashboard/Alunos/Treinos/Financeiro/Planos) should be bottom bar per `bottom-nav-limit ≤5`.
3. **Header trigger buttons below 44pt** — `aluno-header.tsx:32` `h-9 w-9` (36px). Fixed in PRD-1, but bottom nav bars here enforce 44pt from start.

## Design

### 1. New `BottomNav` component

`src/components/bottom-nav.tsx`:

```
┌──────────────────────────────────────────┐
│                                          │
│              [Content]                   │
│                                          │
├──────────────────────────────────────────┤
│  📊    👥    📋    💵    📄             │
│ Dash  Alunos Tre  Fin   Planos          │
└──────────────────────────────────────────┘
   fixed bottom, h-16, pb-safe
```

Props:
```typescript
type NavItem = { href: string; label: string; icon: React.ReactNode };

export function BottomNav({ items, activeHref }: Readonly<{
  items: NavItem[];
  activeHref: string;
}>) { ... }
```

Implementation:
- `fixed bottom-0 inset-x-0 z-40 md:hidden` — only mobile, hidden above `md`
- `h-16 pb-[env(safe-area-inset-bottom)] bg-background/95 backdrop-blur-sm border-t`
- Each item: `flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] text-muted-foreground`
- Active: `text-primary` + icon `scale-110`
- Active indicator: top border `border-t-2 border-primary` (not `animate-pulse` — PRD-1 reduced-motion gates infinite animation)

ponytail: no Sheet/Drawer lib for bottom nav — native CSS `fixed`. shadcn Sidebar handles desktop. Upgrade path: add haptic feedback via Vibration API if mobile usage data warrants.

### 2. Aluno layout wiring

`src/app/aluno/layout.tsx`:
- Pass navLinks to `<BottomNav>` after `<main>`. navLinks already exists (Today Dashboard, Meus Treinos — 2 items, under `bottom-nav-limit`).
- Remove `md:hidden` nav block from `UserMenu` dropdown (aluno-header.tsx:90-100) — bottom bar makes redundant.
- Add `pb-16 md:pb-0` to `<main>` to reserve space for fixed bottom bar.

### 3. Dashboard layout wiring

`src/app/dashboard/layout.tsx`:
- Items: Dashboard, Alunos, Treinos, Financeiro, Planos (5, at `bottom-nav-limit`). Dev item NOT in bottom nav — dev stays in sidebar Sheet only (secondary).
- Filter by role: `GERENTE` sees all 5; `INSTRUTOR` (per `FINANCIAL_ROUTES` filter in `dashboard-nav.tsx:38-41`) excludes Financeiro — 4 items.
- Sheet hamburger remains for Configurações + Sair (secondary nav, `drawer-usage` valid).
- Add `pb-16 md:pb-0` to main content wrapper.

### 4. Safe-area

Bottom bar uses `pb-[env(safe-area-inset-bottom)]` to clear iPhone home indicator. Combined with PRD-1 `viewportFit: 'cover'`.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/components/bottom-nav.tsx` | new component | Low |
| `src/app/aluno/layout.tsx` | +BottomNav render, +main pb-16 | Low |
| `src/app/aluno/aluno-header.tsx` | remove md:hidden nav block from dropdown | Low |
| `src/app/dashboard/layout.tsx` | +BottomNav render, +main pb-16 | Medium (existing sidebar+sheet interaction) |
| `src/components/bottom-nav.test.tsx` | new test | Low |
| `src/app/aluno/aluno-header.test.tsx` | update (dropdown no longer has nav items) | Low |

## Out of Scope

- Haptic feedback (post-MVP)
- Active animation (infinite pulse) — blocked by PRD-1 reduced-motion
- Desktop nav changes
- Login page nav

## Success Criteria

1. Mobile (viewport <768px): bottom nav visible on `/aluno/*` and `/dashboard/*`.
2. Each bottom nav item ≥44px touch target, ≥8px spacing.
3. Alunos dropdown no longer shows nav links on mobile (bottom bar replaces).
4. Dashboard bottom nav hides Financeiro for `INSTRUTOR` role.
5. iPhone home indicator does not overlap nav items.
6. `prefers-reduced-motion`: no infinite animation on active indicator.
7. All 4 gates green + 21 E2E specs green.
