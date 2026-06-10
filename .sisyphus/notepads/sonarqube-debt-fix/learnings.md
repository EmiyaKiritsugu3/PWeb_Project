# Learnings — sonarqube-debt-fix

## Task 1: Extract nested callbacks in treinos.ts

- Prisma relation name (`SeriesExecutadas`) differs from model/type name (`SerieExecutada`). Use `SerieExecutadaCreateInput` not `SeriesExecutadasCreateInput`.
- Nested Prisma creates automatically set parent relation — cannot use `SerieExecutadaCreateInput` as return type because it requires `HistoricoTreino` field. In nested context, Prisma handles this. Solution: drop explicit return type, keep explicit parameter types.
- `HistoricoTreinoBase['exercicios']` is the correct indexed access type for the exercicios array shape after Zod parsing.
- Import `type SerieExecutadaBase` from `@/lib/definitions` for the `serie` parameter annotation in `mapSeriesToHistorico`.
- All 101 tests + tsc --noEmit pass after extraction.

## Task 2: Fix array index React keys (SonarQube suppression)

- SonarQube `no-array-index-key` rule fires on `key={skeleton-${i}}` in skeleton components.
- Skeletons never reorder — safe false positive. Use `// sonar-ignore-next-line` placed on line directly ABOVE the line containing `key={`.
- In `dashboard-skeletons.tsx`, the key is on `<div` (line 20) not the opening tag (line 19) because props span multiple lines. Comment still goes above `<div`.
- `data-table.tsx` has 3 skeleton key locations: `skeleton-${i}` (Card), `skeleton-row-${i}` (TableRow), `skeleton-col-${j}` (TableCell).
- `treinos-client.tsx` uses stable composite keys (`${treino.nome}-${treinoIndex}`) — correctly skipped.
- All 101 tests + tsc --noEmit pass after adding suppression comments.
