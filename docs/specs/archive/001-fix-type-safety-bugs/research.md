# Research: Code Quality — setState-in-Effect Fixes and Type Safety Cleanup

## Phase 0 Findings

### Investigation 1: setState-in-Effect Violations

**Decision**: Three violations found. Two are the "derived state from props" anti-pattern
(dashboard-client, meus-treinos-client). One is an initialization effect tied to an
object-reference dependency (WorkoutSession).

**Findings by location:**

#### Violation 1 — `src/app/aluno/dashboard/dashboard-client.tsx:64-66`

```tsx
// CURRENT (broken):
const [aluno, setAluno] = useState<Aluno>(initialAluno);
useEffect(() => {
  setAluno(initialAluno);
}, [initialAluno]);
```

**Why it's a bug**: When the server revalidates and the parent re-renders with a new
`initialAluno` prop, React first renders with the old `aluno` state (one render), then
the effect fires and calls `setAluno`, causing a second render with identical data.
ESLint `react-hooks/exhaustive-deps` also flags this pattern.

**Fix**: Remove the state copy and use `initialAluno` as the source of truth directly.
The component already syncs via `revalidatePath` on the server side.

```tsx
// FIXED:
// Remove useState for aluno, remove useEffect.
// Use initialAluno (rename prop to aluno for readability) directly in JSX.
```

**Rationale**: Derived state from props is an anti-pattern. Server Components pass
fresh data on every navigation/revalidation. Copying it into state only introduces
a stale window.

**Alternatives considered**: Using `key` prop on the component to force a full
reset — rejected because it's heavier than needed and would lose other local state
(feedback, loading flags) unnecessarily.

---

#### Violation 2 — `src/app/aluno/meus-treinos/meus-treinos-client.tsx:80-82`

```tsx
// CURRENT (broken):
const [meusTreinos, setMeusTreinos] = useState<Treino[]>(initialTreinos);
React.useEffect(() => {
  setMeusTreinos(initialTreinos);
}, [initialTreinos]);
```

**Why it's a bug**: Same as Violation 1. Comment reads "Sync local state when server
props update from revalidatePath" — but this causes a redundant re-render on every
server revalidation.

**Fix**: This component uses `meusTreinos` as mutable state (for optimistic updates
and local CRUD). The correct approach is to keep `useState` but remove the `useEffect`,
and instead update local state optimistically within each handler after a successful
server action call. Server revalidation then refreshes the component via Next.js route
cache and `revalidatePath`.

**Rationale**: The distinction between Violation 1 and 2 is that here the component
genuinely needs local mutable state (the user can add/delete workouts without
navigating away). The fix is to update local state in the `try` block of each handler,
not in a passive effect.

---

#### Violation 3 — `src/components/WorkoutSession.tsx:34-47`

```tsx
// CURRENT (risky):
useEffect(() => {
  setStartTime(new Date());
  setExerciciosEmSessao(/* ... */);
}, [treino]); // treino is an object — identity changes on every parent re-render
```

**Why it's a bug**: `treino` is passed as a prop object. If the parent re-renders
(e.g., due to toast or loading-state change), a new object reference is created for
`treino` even if its data hasn't changed. The effect re-fires, resetting all workout
progress (sets checked, weights entered).

**Fix**: Use `treino.id` as the dependency instead of the full `treino` object, AND
initialize state lazily in `useState` with an initializer function to avoid the effect
entirely for the initial render.

```tsx
// FIXED:
const [exerciciosEmSessao, setExerciciosEmSessao] = useState<ExercicioEmSessao[]>(() =>
  initExercicios(treino)
);
const [startTime] = useState<Date>(() => new Date());

// Effect only to re-initialize when treino ID changes (switching workouts):
useEffect(() => {
  setExerciciosEmSessao(initExercicios(treino));
}, [treino.id]); // stable primitive, not object reference
```

**Rationale**: Lazy `useState` initialization handles the mount case without an
effect. The `treino.id` dependency ensures re-initialization only happens when the
user actually switches to a different workout.

---

### Investigation 2: `any` Type Audit in Safety-Critical Paths

**Scope confirmed**: `src/lib/actions/`, `src/ai/flows/`, `src/ai/schemas.ts`,
`src/lib/data.ts`, `src/lib/definitions.ts`

**Findings by file:**

#### `src/lib/data.ts` — 4 instances

| Line | Current                        | Fix                                                                                                           |
| ---- | ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| 23   | `alunos.map((aluno: any) =>`   | Remove `: any`; Prisma infers the type correctly                                                              |
| 35   | `planos.map((plano: any) =>`   | Same                                                                                                          |
| 53   | `treinos.map((t: any) => {`    | Same                                                                                                          |
| 107  | `(rawFaturamento as any)?.[0]` | Cast to typed tuple: `(rawFaturamento as {TotalRecebido: number; Mes: string; QtdPagamentos: number}[])?.[0]` |

Additionally: `getTreinos` return type is `any[]` — change to `Promise<Treino[]>`.

#### `src/lib/actions/treinos.ts` — 7 instances

| Line             | Current                                              | Fix                                                                   |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------------------------- |
| 15               | `upsertTreinoAction(treinoData: any)`                | `treinoData: TreinoBase \| (TreinoBase & { id: string })`             |
| 34               | `(validatedData as any).id`                          | Use discriminated union with `'id' in validatedData` type guard       |
| 45, 64           | `exercicios.map((ex: any) =>`                        | Remove; `exercicios` is already typed after `validatedData` is parsed |
| 79, 269          | `catch (error: any)`                                 | `catch (error)` with `error instanceof Error` guard                   |
| 134              | `registrarHistoricoTreinoAction(historicoData: any)` | `historicoData: HistoricoTreinoBase`                                  |
| 174-175, 217-218 | `(ex: any)`, `(s: any)`                              | Remove; they come from `validatedData.exercicios` which is typed      |

#### `src/lib/actions/alunos.ts` — 4 instances

| Line                    | Current                                    | Fix                                                 |
| ----------------------- | ------------------------------------------ | --------------------------------------------------- |
| 125                     | `createAlunoAction(data: any)`             | `data: AlunoBase`                                   |
| 163                     | `updateAlunoAction(id: string, data: any)` | `data: Partial<AlunoBase>`                          |
| 119, 154, 191, 215, 264 | `catch (error: any)`                       | `catch (error)` with `error instanceof Error` guard |

#### `src/app/dashboard/treinos/treinos-client.tsx` — 2 instances

| Line | Current                                 | Fix                                                                                                                                                                    |
| ---- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 410  | `streamWorkoutPlan.stream(data) as any` | Acceptable Genkit SDK gap — suppress with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` and inline comment: "Genkit streaming API types incomplete" |
| 413  | `setPlanoGerado(chunk as any)`          | Cast to `WorkoutGeneratorOutput` which is already imported as `WorkoutPlan`                                                                                            |

#### `src/ai/` files — 0 instances found

The AI schema files use Zod correctly with no `any` escapes.

---

### Investigation 3: Cascading Risk Assessment

**Decision**: Changes are low-risk if applied in the order described above.
No cascading type errors expected because:

- `data.ts` changes remove `any` but Prisma's inferred return types are compatible
  with the Zod schemas being applied to them.
- Server action parameter type changes are additive — existing callers already
  pass the correct shape (they're typed at the call site in client components).
- The WorkoutSession fix changes the dependency array, not the initialization logic.

**One known risk**: `meus-treinos-client.tsx` currently relies on the effect to
show server-fresh data after mutations. After removing the effect, handlers must
explicitly update local state on success. Each handler (save, delete) already calls
`router.refresh()` or `revalidatePath` — but local state update must happen in the
same success block.

---

### Investigation 4: Tool Compatibility

- `catch (error: any)` — the correct TypeScript idiom is `catch (error) { if (error instanceof Error) { ... } }`. This is safe in TypeScript 4.0+ with `useUnknownInCatchVariables` enabled.
- Check `tsconfig.json` for `strict: true` — this enables `useUnknownInCatchVariables`.
- Prisma client types are fully generated and available; no `any` is needed to consume
  `prisma.aluno.findMany()` results.
