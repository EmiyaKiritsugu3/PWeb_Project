# Design: Aluno Detail Tables Mobile Variant

**Date:** 2026-07-07
**Branch:** `fix/aluno-detail-tables-mobile`
**Scope:** Mobile-friendly card variant for tables on aluno detail page. Desktop unchanged.

## Problem

`src/app/dashboard/alunos/[id]/page.tsx` uses shadcn Table (~10 rows of TableCell/table/overflow-x-auto):

1. **Horizontal scroll on mobile** — tables wider than viewport → user pinches/swipes horizontally. Violates `horizontal-scroll`: no horizontal scroll on mobile.
2. **Table cramped** — many columns (matricula, plano, status pagamento, etc.) squeeze to unreadable widths on phone.
3. **No responsive variant** — shadcn Table has no built-in mobile card stack. Premium apps show stacked card layout under `md` breakpoint.

## Design

### 1. Card-stack variant on mobile

Pattern: same data, two render paths. Mobile (`<md`): stacked key-value cards. Desktop (`≥md`): existing Table.

```
Mobile (<768px):                    Desktop (≥768px):
┌──────────────────────────┐        ┌────────────────────────────────────┐
│ Matrícula                 │        │ Matrícula │ Plano │ Status │ ...│
│ 2026-001                  │        ├──────────┼───────┼────────┼────┤
├──────────────────────────┤        │ 2026-001 │ ...   │ ...    │ ...│
│ Plano                     │        └────────────────────────────────────┘
│ Premium Mensal            │
├──────────────────────────┤
│ Status Pagamento          │
│ ✅ Em dia                  │
└──────────────────────────┘
```

### 2. Implementation

For each table section (matriculas, pagamentos, presenças, etc.):

```tsx
{/* Mobile card stack */}
<div className="md:hidden grid gap-3">
  {items.map((item) => (
    <Card key={item.id} className="p-4">
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Matrícula</dt>
        <dd className="font-medium">{item.matricula}</dd>
        <dt className="text-muted-foreground">Plano</dt>
        <dd className="font-medium">{item.plano}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>{item.statusPago ? 'Em dia' : 'Pendente'}</dd>
      </dl>
    </Card>
  ))}
</div>

{/* Desktop table — existing */}
<div className="hidden md:block">
  <Table>...</Table>
</div>
```

ponytail: duplicate render (`md:hidden` + `hidden md:block`) — simplest pattern, no JS. shadcn Table keeps desktop behavior untouched. Upgrade path: single responsive `<DataTable>` wrapper if many tables share pattern. Skip — only aluno detail affected.

### 3. Action buttons accessible

Existing row actions (edit/delete/expand) move into card footer on mobile variant. Touch targets ≥44px (PRD-1).

### 4. Empty state parity

Table empty: "Nenhum registro." Card variant: same text inside card. Consistent with PRD-4 empty-state polish pattern (icon + heading + subtext) where appropriate.

## Files Changed

| File | Change | Risk |
|---|---|---|
| `src/app/dashboard/alunos/[id]/page.tsx` | +mobile card stack variants per table section | Medium |
| `src/app/dashboard/alunos/[id]/page.test.tsx` | +tests for mobile card variant (query by card, not table cell) | Medium |

## Out of Scope

- Refactor all tables app-wide (only aluno detail)
- Sort/filter on mobile card variant (defer — current tables not sortable either)
- Pagination change
- New DataTable abstraction

## Success Criteria

1. Mobile (viewport <768px): aluno detail tables render as stacked cards. No horizontal scroll.
2. Desktop (≥768px): existing Table unchanged.
3. Card variant shows same data as table rows.
4. Action buttons in card footer, ≥44px.
5. Empty states consistent.
6. All 4 gates green + aluno detail E2E spec green.
