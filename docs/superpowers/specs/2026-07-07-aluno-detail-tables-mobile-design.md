# Design: Aluno Detail Tables Mobile Variant

**Date:** 2026-07-07
**Branch:** `fix/aluno-detail-tables-mobile`
**Scope:** Mobile-friendly card variant for tables on aluno detail page. Desktop unchanged.

## Problem

`src/app/dashboard/alunos/[id]/page.tsx` renders 3 sections: `MatriculasTable` (4 TableCells: Plano via `m.Plano.nome`, Início, Vencimento, Status via `BadgeVariant[m.status]`), `PagamentosTable` (3 TableCells: Data, Valor, Método — no status field), `TreinosList` (grid div cards, NOT a Table):

1. **Horizontal scroll on mobile** — `MatriculasTable`/`PagamentosTable` wider than viewport → user pinches/swipes horizontally. Violates `horizontal-scroll`: no horizontal scroll on mobile.
2. **Table cramped** — 4 columns (Plano, Início, Vencimento, Status) squeeze to unreadable widths on phone.
3. **No responsive variant** — shadcn Table has no built-in mobile card stack. Premium apps show stacked card layout under `md` breakpoint. `TreinosList` already grid — only the two Tables need card variant.

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

For each table section (matriculas, pagamentos):

```tsx
{/* MatriculasTable mobile card stack */}
<div className="md:hidden grid gap-3">
  {matriculas.map((m) => (
    <Card key={m.id} className="p-4">
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Plano</dt>
        <dd className="font-medium">{m.Plano.nome}</dd>
        <dt className="text-muted-foreground">Início</dt>
        <dd>{formatDate(m.dataInicio)}</dd>
        <dt className="text-muted-foreground">Vencimento</dt>
        <dd>{formatDate(m.dataVencimento)}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd><Badge variant={BadgeVariant[m.status]}>{m.status}</Badge></dd>
      </dl>
    </Card>
  ))}
</div>

{/* PagamentosTable mobile card stack — no status field, 3 cells: Data, Valor, Método */}
<div className="md:hidden grid gap-3">
  {pagamentos.map((p) => (
    <Card key={p.id} className="p-4">
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Data</dt>
        <dd>{formatDate(p.dataPagamento)}</dd>
        <dt className="text-muted-foreground">Valor</dt>
        <dd className="font-medium">{formatCurrency(p.valor)}</dd>
        <dt className="text-muted-foreground">Método</dt>
        <dd>{p.metodo}</dd>
      </dl>
    </Card>
  ))}
</div>

{/* Desktop tables — existing */}
<div className="hidden md:block">
  <Table>...</Table>
</div>
```

`m.status` is `StatusMatricula` enum (ATIVA/INADIMPLENTE/INATIVA/VENCIDA) — render via existing `BadgeVariant` map. `Pagamento` has no `status` field. `TreinosList` already grid-based — no card variant needed.

ponytail: duplicate render (`md:hidden` + `hidden md:block`) — simplest pattern, no JS. shadcn Table keeps desktop behavior untouched. Upgrade path: single responsive `<DataTable>` wrapper if many tables share pattern. Skip — only aluno detail affected.

### 3. Action buttons accessible

Existing row actions (edit/delete/expand) move into card footer on mobile variant. Touch targets ≥44px (PRD-1).

### 4. Empty state parity

Preserve per-table empty strings (already in code): matriculas "Nenhuma matrícula registrada.", pagamentos "Nenhum pagamento registrado.", treinos "Nenhum treino cadastrado para este aluno." Card variant shows same text. Consistent with PRD-4 empty-state polish pattern (icon + heading + subtext) where appropriate.

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
