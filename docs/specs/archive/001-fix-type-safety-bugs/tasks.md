---
description: 'Task list for Code Quality — setState-in-Effect Fixes and Type Safety Cleanup'
---

# Tasks: Code Quality — setState-in-Effect Fixes and Type Safety Cleanup

**Input**: Design documents from `specs/001-fix-type-safety-bugs/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅

**Tests**: Not requested. Existing test suite is used for non-regression validation only.

**Organization**: Tasks are grouped by user story to enable independent implementation
and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in every task description

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Establish the current state before any changes so regressions can be
detected immediately.

- [x] T001 Run `npm run typecheck` and record any existing type errors (expected: possibly zero; document count either way)
- [x] T002 Run `npm run lint 2>&1 | grep "no-explicit-any"` and record the current count of `no-explicit-any` violations in scope files

**Checkpoint**: Baseline recorded. Proceed to Phase 3 (no foundational infrastructure needed — this is a refactoring).

---

## Phase 3: User Story 1 — Stable UI Without Unintended Re-renders (Priority: P1) 🎯 MVP

**Goal**: Eliminate the three `setState-in-effect` violations that cause redundant
renders and risk resetting in-progress user data.

**Independent Test**: Navigate the student portal and admin workout page. DevTools
console must show zero `Maximum update depth exceeded` errors. Workout session state
must not reset when the parent component re-renders due to a toast or loading change.

### Implementation for User Story 1

- [x] T003 [US1] Fix Violation 1: in `src/app/aluno/dashboard/dashboard-client.tsx` — remove `useState<Aluno>(initialAluno)` and the `useEffect(() => { setAluno(initialAluno); }, [initialAluno])` block; rename the prop parameter from `initialAluno` to `aluno` in the component signature; update all JSX references from the removed state variable to the prop directly; **also update the caller** in `src/app/aluno/dashboard/page.tsx:L93` — change `<AlunoDashboardClient initialAluno={serializedAluno}` to `<AlunoDashboardClient aluno={serializedAluno}`
- [x] T004 [P] [US1] Fix Violation 2: in `src/app/aluno/meus-treinos/meus-treinos-client.tsx` — remove the `React.useEffect(() => { setMeusTreinos(initialTreinos); }, [initialTreinos])` block; in `handleSave` success branch add optimistic state update (`setMeusTreinos(prev => editingTreino ? prev.map(t => t.id === editingTreino.id ? updatedItem : t) : [...prev, newItem])`); in `handleDelete` success branch add `setMeusTreinos(prev => prev.filter(t => t.id !== deletingTreino.id))`
- [x] T005 [P] [US1] Fix Violation 3: in `src/components/WorkoutSession.tsx` — extract a named function `function initExercicios(treino: Treino): ExercicioEmSessao[]` containing the exercise initialization logic currently inside the effect; replace `useState` for `exerciciosEmSessao` with lazy initializer `useState<ExercicioEmSessao[]>(() => initExercicios(treino))`; replace `useState<Date | null>(null)` for `startTime` with `useState<Date>(() => new Date())`; update `useEffect` to use `[treino.id]` as the dependency array instead of `[treino]`; remove the `setStartTime(new Date())` line from the effect body

**Checkpoint**: User Story 1 complete. Run `npm run typecheck` — must pass. Open DevTools and navigate through both portals; zero `Maximum update depth exceeded` errors.

---

## Phase 4: User Story 2 — Reliable AI Workout and Feedback Flows (Priority: P2)

**Goal**: Replace the unsafe Genkit streaming `as any` cast with a typed cast,
eliminating the risk of silently saving a malformed AI response to the database.

**Independent Test**: Use the AI workout generator in the admin panel. The generated
plan must populate the editor with all exercises, days, and rep ranges intact.
Saving the plan must succeed and appear correctly in the student's detail page.

### Implementation for User Story 2

- [x] T006 [US2] Fix Genkit streaming cast: in `src/app/dashboard/treinos/treinos-client.tsx` around line 410 — add `// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Genkit streaming API types incomplete; SDK v1.31 does not export StreamingCallable<T>` before the stream call; change `streamWorkoutPlan.stream(data) as any` to `(streamWorkoutPlan as any).stream(data)`; change `setPlanoGerado(chunk as any)` to `setPlanoGerado(chunk as WorkoutGeneratorOutput)` (type is already imported as `WorkoutPlan = WorkoutGeneratorOutput`)

**Checkpoint**: User Story 2 complete. Run `npm run lint 2>&1 | grep "treinos-client"` — must show zero errors (the suppression comment is correctly placed).

---

## Phase 5: User Story 3 — Consistent Type Checking Across the Codebase (Priority: P3)

**Goal**: Remove all hand-authored `any` annotations from server actions and data
query wrappers so the type checker catches future contract violations at compile time.

**Independent Test**: Run `npm run typecheck` — zero errors. Run `npm run lint 2>&1 | grep "no-explicit-any"` — zero matches in `src/lib/actions/`, `src/lib/data.ts`.

### Implementation for User Story 3

- [x] T007 [P] [US3] Fix `any` casts in `src/lib/data.ts`: (a) Remove `: any` annotation from each Prisma `.map()` callback — `alunos.map((aluno) =>`, `planos.map((plano) =>`, `treinos.map((t) =>`; (b) Change the return type of `getTreinos` from `Promise<any[]>` to `Promise<Treino[]>`; (c) Add a local type alias `type RawFaturamento = { TotalRecebido: number; Mes: string; QtdPagamentos: number }` and change `(rawFaturamento as any)?.[0]` to `(rawFaturamento as RawFaturamento[])?.[0]`
- [x] T008 [P] [US3] Fix `any` parameter types in `src/lib/actions/alunos.ts`: (a) Import `AlunoBase, AlunoBaseSchema` from `@/lib/definitions` (already imported — verify); (b) Change `createAlunoAction(data: any)` to `createAlunoAction(data: AlunoBase)`; (c) Change `updateAlunoAction(id: string, data: any)` to `updateAlunoAction(id: string, data: Partial<AlunoBase>)`; (d) In all `catch` blocks change `catch (error: any)` to `catch (error)` and replace `error.message` with `error instanceof Error ? error.message : 'Erro desconhecido'`
- [x] T009 [US3] Fix `any` parameter types and inline casts in `src/lib/actions/treinos.ts`: (a) Import `TreinoBase, HistoricoTreinoBase` from `@/lib/definitions`; (b) Change `upsertTreinoAction(treinoData: any)` to `upsertTreinoAction(treinoData: TreinoBase | (TreinoBase & { id: string }))`; (c) Replace `const id = (validatedData as any).id` with `const id = 'id' in validatedData ? (validatedData as TreinoBase & { id: string }).id : undefined`; (d) Remove `: any` from `.map((ex: any) =>` in both `Exercicios.create` blocks — Prisma's `create` accepts the inferred type; (e) Change `registrarHistoricoTreinoAction(historicoData: any)` to `registrarHistoricoTreinoAction(historicoData: HistoricoTreinoBase)`; (f) Remove `: any` from `(acc: number, ex: any)` and `(s: any)` in the XP calculation reducer — types flow from `validatedData.exercicios`; (g) In all `catch` blocks change `catch (error: any)` to `catch (error)` and replace `error.message` with `error instanceof Error ? error.message : 'Erro desconhecido'`

**Checkpoint**: User Story 3 complete. Run `npm run typecheck` — zero errors. Run lint scan — zero `no-explicit-any` in scope files.

---

## Phase N: Polish & Verification

**Purpose**: Final validation gate confirming all success criteria are met.

- [x] T010 Run `npm run typecheck` — verify exit code 0 and zero error lines; if any errors remain, return to the relevant phase and fix them before proceeding
- [x] T011 Run `npm run lint 2>&1 | grep "no-explicit-any"` for files `src/lib/actions/`, `src/ai/`, `src/lib/data.ts` — verify zero matches; if matches remain, the Genkit suppression comment format needs correction
- [x] T012 Run `npm test` — verify all test suites pass with no new failures; coverage numbers must not decrease
- [x] T013 Perform manual smoke test per `specs/001-fix-type-safety-bugs/quickstart.md` Steps 4-5 — verify zero browser console errors during student portal + admin dashboard walkthrough, and that workout session state does not reset mid-session

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **User Stories (Phases 3–5)**: No foundational phase needed; all three phases can begin after Setup
  - US1 (Phase 3) and US2 (Phase 4) and US3 (Phase 5) are all **independent** — different files, no shared state
  - US1 tasks T004 and T005 are parallel (different files)
  - US3 tasks T007 and T008 are parallel (different files)
  - T009 must complete after T007 and T008 only if callers in those files change signatures that treinos.ts depends on (they don't — treinos.ts is independent)
- **Polish (Phase N)**: Depends on all user story phases being complete

### User Story Dependencies

- **US1 (P1)**: No external dependencies — three files, each independent
- **US2 (P2)**: No dependency on US1 — different file, different concern
- **US3 (P3)**: No dependency on US1 or US2 — server-side files only

### Parallel Opportunities

```bash
# All three stories can run in parallel (different file sets):
# Thread A: T003 → T004+T005 (US1 — client components)
# Thread B: T006          (US2 — treinos-client)
# Thread C: T007+T008 → T009  (US3 — server actions)

# Within US1:
Task: "Fix Violation 2 in meus-treinos-client.tsx" (T004)
Task: "Fix Violation 3 in WorkoutSession.tsx" (T005)
# Both can run simultaneously — separate files

# Within US3:
Task: "Fix any casts in data.ts" (T007)
Task: "Fix any params in actions/alunos.ts" (T008)
# Both can run simultaneously — separate files
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 3: US1 (T003, T004, T005)
3. **STOP and VALIDATE**: Run typecheck + lint + tests; check DevTools console
4. If passing, proceed to US2 and US3

### Incremental Delivery

1. Baseline (Phase 1) → record counts
2. US1 fixes → eliminate render loop risk → validate
3. US2 fix → typed Genkit cast → validate
4. US3 fixes → zero `any` in scope → final validation gate
5. Polish (Phase N) → all checks green

---

## Notes

- **[P]** tasks within a phase use different files and have no dependencies on each other
- T004 requires knowing the return shape of `upsertTreinoAction` to perform optimistic update — verify `res.data` type after T008/T009 are complete (or use `initialTreinos` to re-fetch if the action doesn't return the entity)
- The Genkit suppression comment in T006 must use `// eslint-disable-next-line`, not `/* eslint-disable */` (block disables would suppress too broadly)
- `catch (error: any)` → `catch (error)` change is safe because `tsconfig.json` has `"strict": true` which enables `useUnknownInCatchVariables`
- Stop at any checkpoint to validate independently before moving to the next story
