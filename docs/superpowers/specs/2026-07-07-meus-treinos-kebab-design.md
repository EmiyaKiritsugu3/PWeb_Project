# Design: Meus Treinos Action Hierarchy

**Date:** 2026-07-07
**Branch:** `fix/meus-treinos-kebab`
**Scope:** Mobile action hierarchy on meus-treinos cards. Kebab menu + primary action + empty state polish. Zero data change.

## Problem

`src/app/aluno/meus-treinos/meus-treinos-client.tsx` treino card (lines 127-209):

1. **4 controls equal weight on mobile** — `flex items-center gap-2 flex-wrap` with Select(dia), Iniciar, Editar, Excluir all same visual weight. No primary action. User must scan 4 elements to find the main CTA. Violates `primary-action`: each screen should have one primary CTA, secondary actions visually subordinate.
2. **Delete destructive mixed with primary** — Excluir (destructive) sits beside Iniciar (primary) at equal weight. Mis-tap risk on mobile. Violates `destructive-emphasis`: destructive actions visually separated.
3. **Empty state flat** — line 203-208: plain text "Você ainda não criou nenhum treino." No icon, no CTA, no visual weight. Violates `empty-states`: helpful message + action when no content.
4. **H3 not headline font** — line 151: `font-bold text-base` (not `font-headline`). Outfit headline token defined in `@theme` but never applied (also PRD-7 next/font issue).

## Design

### 1. Primary action + kebab overflow

Mobile card (single column, sm:flex-row keeps desktop row):

```
┌──────────────────────────────────────────┐
│ Peito/Triceps [Seg]                       │
│ 5 exercícios                              │
│                                          │
│ ┌─────────────────┐  ┌────────────────┐  │
│ │ ▶ Iniciar Treino │  │ ⋮ (kebab)      │  │
│ │  (primary full)  │  │                │  │
│ └─────────────────┘  └────────────────┘  │
└──────────────────────────────────────────┘

Kebab open:
┌─────────────┐
│ 📅 Agendar   │  (Select dia inline → kebab item)
│ ✏  Editar    │
│ ──────────── │
│ 🗑  Excluir   │  (destructive, red text)
└─────────────┘
```

Implementation:
- Move `Select` for day scheduling into kebab (mobile-first). Keep inline if desktop space allows — simpler: into kebab always.
- `Iniciar` button: `flex-1` full-width primary on mobile, `w-auto` on desktop.
- Kebab `MoreVertical` icon (lucide) + `DropdownMenu` from shadcn/ui (already installed — `aluno-header.tsx` imports it).
- Editar + Excluir move into kebab. Excluir gets `text-destructive` variant inside menu.

Imports needed (all from existing shadcn/ui, no new dep):
```typescript
import { MoreVertical, Dumbbell, PlusCircle } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
```

Data-testid for E2E stability:
- Card: `data-testid="treino-card"`
- Iniciar: `data-testid="iniciar-treino"`
- Kebab trigger: `data-testid="treino-kebab"`
- Editar item: `data-testid="editar-treino"`
- Excluir item: `data-testid="excluir-treino"`

### 2. Empty state polish

Replace lines 203-208:

```tsx
<div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
  <div className="rounded-full bg-muted/30 p-4">
    <Dumbbell className="h-8 w-8 text-muted-foreground" />
  </div>
  <div>
    <p className="font-medium text-foreground">Nenhum treino ainda</p>
    <p className="text-sm text-muted-foreground mt-1">
      {allowEditing
        ? 'Gere um plano com IA ou crie manualmente para começar.'
        : 'Seu personal ainda não prescreveu treinos.'}
    </p>
  </div>
  {allowEditing && (
    <Button variant="outline" size="sm" onClick={() => setEditingTreinoId('__new__')}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Criar primeiro treino
    </Button>
  )}
</div>
```

Icon + heading + subtext + CTA. Existing `__new__` editor trigger reused (lines 280-303 already wire this). Empty state CTA points to same flow.

### 3. Headline font on H3

Line 151: `<h3 className="font-bold text-base">` → `<h3 className="font-headline font-bold text-base">`. `font-headline` token exists in `@theme`. Effective only after PRD-7 next/font swap; class placement safe now.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/app/aluno/meus-treinos/meus-treinos-client.tsx` | kebab menu, primary Iniciar, empty state, font-headline, data-testids | Medium |
| `src/app/aluno/meus-treinos/meus-treinos-client.test.tsx` | update selectors for new structure | Medium |
| `tests/e2e/specs/meus-treinos.spec.ts` (if exists) | update selectors to data-testid | Medium |

## Out of Scope

- Workout session fullscreen (PRD-5)
- Visual grouper banner (already done in PR #175)
- Inline editor (already done in PR #175)

## Success Criteria

1. Mobile: card shows full-width "Iniciar Treino" + kebab icon. Select/Editar/Excluir in kebab.
2. Desktop: same row layout, kebab still accessible.
3. Empty state: icon + heading + subtext + CTA. No plain "Você ainda não criou".
4. E2E stable: selectors use `data-testid`, not class-based.
5. Excluir visually distinct (destructive) within kebab.
6. All 4 gates green.
