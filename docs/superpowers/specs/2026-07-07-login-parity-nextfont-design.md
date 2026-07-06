# Design: Login Parity + next/font Integration

**Date:** 2026-07-07
**Branch:** `feat/login-parity-nextfont`
**Scope:** Visual parity between admin `/login` and aluno `/aluno/login`. Replace literal CSS font names with `next/font/google` proper loading. Foundation-level font fix.

## Problem

Two login pages diverge in quality; fonts never actually loaded:

1. **Login divergence** — `src/app/login/page.tsx` (admin) is premium: glass-card, glow-cyan, animated bg, shimmer button, "SISTEMA DE GESTÃO" subtitle. `src/app/aluno/login/page.tsx` is plain: no glass-card, no animation, demo label "(Supabase)", `min-h-screen` (PRD-1 owns dvh swap). User experience breaks between entry points.
2. **next/font never used** — `src/app/globals.css:4-5`:
   ```css
   --font-body: 'Inter', 'sans-serif';
   --font-headline: 'Outfit', 'sans-serif';
   ```
   Literal CSS font names. No `next/font/google` import in `src/app/layout.tsx`. Browser falls back to sans-serif — Outfit headline never renders. Premium typography intent lost. Workflow verification flag #3.
3. **No `font-headline` anywhere** — token defined, never consumed. Cards use `font-bold text-base` (PRD-4 §3 notes this).

## Design

### 1. next/font/google wiring

`src/app/layout.tsx`:

```typescript
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});
```

Apply to `<html>`:
```tsx
<html lang="pt-BR" className={`${inter.variable} ${outfit.variable} dark`} suppressHydrationWarning>
```

`src/app/globals.css` `@theme` swap — same edit:
```diff
- --font-body: 'Inter', 'sans-serif';
- --font-headline: 'Outfit', 'sans-serif';
+ --font-body: var(--font-inter), 'sans-serif';
+ --font-headline: var(--font-outfit), 'sans-serif';
```

`font-display: swap` avoids FOIT. Subset latin covers pt-BR. Outfit explicit weights (400-700) match `font-bold` usage.

ponytail: no font-display optional — swap is standard. Upgrade path: preload critical Outfit 600 weight if LCP affects.

### 2. Aluno login parity

Bring aluno/login visual to admin/login level:

- Card: `glass-card glow-cyan border-white/10` (same as admin)
- Animated background: two blur blobs (`bg-primary/10`, `bg-gold/5`) with `animate-glow-pulse` (gated by PRD-1 reduced-motion)
- Dumbbell: `h-12 w-12 text-primary animate-float` with halo
- CardTitle: drop "(Supabase)" demo label. Use gradient + subtitle pattern:
  ```tsx
  <CardTitle className="text-3xl font-bold tracking-tight">
    <span className="text-gradient-cyan">Five Star</span>
    <span className="block text-sm font-medium text-muted-foreground mt-1">
      PORTAL DO ALUNO
    </span>
  </CardTitle>
  ```
- Button: same shimmer pattern as admin
- `min-h-screen` → `min-h-dvh` (PRD-1 owns but apply here)

### 3. zodResolver keep on aluno, share with admin

aluno/login uses `react-hook-form` + zodResolver. Admin/login uses raw useState + FormData. Different validation approaches. Keep both — paridade = visual not architecture. Admin login already has its own flow (session polling). Do not refactor auth logic.

### 4. Default credentials

`aluno/login/page.tsx:48-49` defaults `email: 'ana.silva@example.com'`, `password: '123456'`. Dev convenience leaks production. Remove defaults — empty fields, let user input.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/app/layout.tsx` | +next/font imports, variable className on html | Medium |
| `src/app/globals.css` | `@theme` font vars swap to `var(--font-inter/outfit)` | Low |
| `src/app/aluno/login/page.tsx` | glass-card, animated bg, halo, gradient title, shimmer button, drop defaults, dvh | Medium |
| `src/app/aluno/login/page.test.tsx` | update if asserts plain Card | Low |

## Out of Scope

- Auth logic refactor (keep useState on admin, RHF on aluno)
- New auth providers (OAuth, magic link)
- Password reset flow

## Success Criteria

1. View source: `<link rel="preload">` Inter + Outfit from `next/font`.
2. Outfit renders on `font-headline` elements (browser devtools shows "Outfit" computed font, not sans-serif).
3. Admin `/login` and aluno `/aluno/login` side-by-side: same glass-card, glow, button pattern. Only subtitle text differs.
4. aluno/login no longer has "Portal do Aluno (Supabase)" demo label.
5. aluno/login no longer has default email/password.
6. `prefers-reduced-motion`: glow-pulse + float disabled.
7. All 4 gates green + login E2E specs green.
