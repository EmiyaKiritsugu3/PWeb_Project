# Design: Meus Treinos UX Improvements

**Date:** 2026-07-05
**Branch:** `fix/meus-treinos-ux-improvements`
**Scope:** UX only — zero schema/API changes

## Problem

1. **Scroll paradox** — clicking "Editar" on a treino card runs `window.scrollTo({top:0})` but the editor appears at page bottom. User loses context, must scroll down manually.
2. **No visual grouping** — AI generates 3-day split (e.g. Peito/Triceps + Costas/Biceps + Pernas/Ombros). Three independent cards with no visual connection.
3. **After-gen feedback gap** — `router.refresh()` fixed (commit 1118d92), but no visual anchor after generation completes.

## Design

### 1. Inline Editor

Clicking "Editar" on a card renders `WorkoutEditor` **inside the card**, replacing exercise list. No scroll. Cancel/Save collapses back to normal view.

**Card states:**

```
NORMAL:                              EDITING:
┌─────────────────────────────┐     ┌──────────────────────────────────┐
│ Peito/Triceps [Seg] [▶][✏][🗑]│     │ ✏ Editando: Peito/Triceps          │
│ 5 exercicios                 │     │ ┌──────────────────────────────┐ │
│                              │     │ │ WorkoutEditor (exercises)    │ │
│ Dropdown agendamento         │     │ └──────────────────────────────┘ │
└─────────────────────────────┘     │ [Cancelar]              [Salvar] │
                                    └──────────────────────────────────┘
```

**Files:**
- `card-treino.tsx` — add `isEditing` state + inline render of WorkoutEditor
- `workout-editor.tsx` — add `compact?: boolean` prop to suppress outer Card wrapper
- `meus-treinos-client.tsx` — remove bottom-of-page editor, wire inline mode

### 2. Visual Grouper — Plano Semanal

After AI generation, banner appears above "Meus Treinos Pessoais" for 30s.

**Detection:** `useWorkoutGeneration` exposes `planName` from `streamWorkoutPlan` return. Client stores in state, renders banner, auto-clears after 30s.

```tsx
<Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Sparkles className="text-primary" />
      Plano Semanal: {planName}
    </CardTitle>
    <CardDescription>{diaLabels.join(' → ')}</CardDescription>
  </CardHeader>
</Card>
```

Cards part of plan get `border-l-2 border-primary/30 ml-2 pl-4` timeline visual.

### 3. After-gen Scroll

Scroll smooth to `#treinos-pessoais` after `router.refresh()`.

### 4. Remove Bottom Editor

"Criar Novo Treino Manualmente" button moves **above** treino list. When clicked, renders `WorkoutEditor` inline above first card. Bottom conditional editor removed.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `card-treino.tsx` | +isEditing state, inline WorkoutEditor render | Low |
| `workout-editor.tsx` | +`compact?: boolean` prop | Low |
| `meus-treinos-client.tsx` | -bottom editor, +banner, +planName, +scroll anchor | Medium |
| `use-workout-generation.ts` | +expose planName from hook return | Low |
| `card-treino.test.tsx` | +inline edit tests | Low |
| `meus-treinos-client.test.tsx` | +banner tests | Low |

## Out of Scope

- PlanoSemanal Prisma model
- Plan-wide progress tracking
- 1-day = 1-card data model change

## Success Criteria

1. Click "Editar" → editor appears inside same card, zero page jump
2. "Cancelar" / "Salvar" → card returns to normal
3. AI gen: banner 30s + day sequence + scroll to treino list
4. "Criar Manual" above list, opens inline editor
5. All quality gates pass
