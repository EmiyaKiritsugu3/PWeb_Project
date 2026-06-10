# Code Optimization Plan — Fallow Findings

## TL;DR

> **Quick Summary**: Remove unused dependencies, extract shared workout components to eliminate 40% code duplication, and refactor large components for maintainability.
>
> **Deliverables**:
>
> - Remove 3 unused npm packages (lodash, framer-motion, motion)
> - Create 3 shared modules (exercise-options.ts, use-workout-exercises.ts, workout-exercise-row.tsx)
> - Delete 133 lines of duplicated inline WorkoutGenerator
> - Refactor 4 large components by extracting custom hooks
>
> **Estimated Effort**: Medium (3-4 hours)
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 (deps) → Task 2-5 (extractions) → Task 6-9 (refactors) → Task 10 (verify)

---

## Context

### Original Request

Create a detailed plan for code correction and optimization based on Fallow analysis findings.

### Interview Summary

**Key Discussions**:

- Fallow found 19 unused files, 67 unused exports, 7 unused deps, 735 duplicated lines, 49 complex functions
- Most "unused exports" are shadcn/ui (normal, not fixable)
- chart.tsx CRAP 420 is shadcn/ui (do NOT refactor)
- Real issues: 3 unused deps, workout form duplication, large components

**Research Findings**:

- lodash, framer-motion, motion confirmed NOT imported anywhere in codebase
- @genkit-ai/next, @opentelemetry/\*, patch-package ARE needed
- WorkoutGenerator in treinos-client (L59-191) is 95% identical to workout-generator.tsx
- Exercise row UI duplicated 3 times across treinos-client, workout-editor
- handleAddExercicio, handleRemoveExercicio are 100% identical
- handleExercicioChange differs: Map lookup (O(1)) vs find (O(n))

### Metis Review

**Identified Gaps** (addressed):

- Test baseline: 101/101 tests passing (verified)
- 5 large components: paths already mapped (meus-treinos-client, treinos-client, dashboard-client, [id]/page, WorkoutSession)
- workout-editor.tsx: included in Tier 2 (shared extraction)
- 49 functions: explicitly DEFERRED (mostly shadcn/ui and complex UI)
- handleExercicioChange: Map approach is better, unify with parseInt safety from treinos-client

---

## Work Objectives

### Core Objective

Eliminate code duplication in workout components and remove unused dependencies to improve maintainability and bundle size.

### Concrete Deliverables

- `src/lib/exercise-options.ts` — shared exercise constants
- `src/hooks/use-workout-exercises.ts` — shared workout state hook
- `src/components/dashboard/aluno/workout-exercise-row.tsx` — shared exercise row component
- Updated `treinos-client.tsx` — uses shared modules, inline WorkoutGenerator deleted
- Updated `workout-editor.tsx` — uses shared modules
- Updated `package.json` — 3 deps removed

### Definition of Done

- [ ] `npm run pre-flight` passes (typecheck + lint + format + test)
- [ ] All 101 tests pass
- [ ] Zero ESLint errors
- [ ] Bundle size reduced (3 packages removed)
- [ ] No duplicated exercise form code

### Must Have

- All 101 tests passing
- Zero functional changes
- Each commit independently revertable
- Quality gates after each wave

### Must NOT Have (Guardrails)

- NO changes to shadcn/ui components (src/components/ui/\*)
- NO changes to chart.tsx (CRAP 420 is acceptable for generated code)
- NO changes to test files
- NO changes to API contracts or data models
- NO new dependencies added
- NO changes to files outside the 8 identified files
- NO performance optimizations mixed with refactoring
- NO documentation updates in this plan

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed.

### Test Decision

- **Infrastructure exists**: YES
- **Automated tests**: Tests-after (run existing tests to verify)
- **Framework**: vitest
- **Commands**: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`

### QA Policy

Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — quick wins):
├── Task 1: Remove unused dependencies [quick]

Wave 2 (After Wave 1 — extract shared modules):
├── Task 2: Create exercise-options.ts utility [quick]
├── Task 3: Create use-workout-exercises.ts hook [deep]
├── Task 4: Create workout-exercise-row.tsx component [deep]
└── Task 5: Delete inline WorkoutGenerator from treinos-client [quick]

Wave 3 (After Wave 2 — refactor consumers):
├── Task 6: Refactor workout-editor.tsx to use shared modules [deep]
├── Task 7: Refactor TreinosManagementClient to use shared modules [deep]
├── Task 8: Refactor PlanoGeradoParaEdicao to use WorkoutExerciseRow [deep]
└── Task 9: Extract hooks from meus-treinos-client.tsx [deep]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay
```

### Dependency Matrix

| Task | Depends On | Blocks     |
| ---- | ---------- | ---------- |
| 1    | None       | 2-9        |
| 2    | 1          | 3, 4, 6, 7 |
| 3    | 1, 2       | 6, 7, 9    |
| 4    | 1, 2       | 6, 7, 8    |
| 5    | 1          | 7          |
| 6    | 2, 3, 4    | F1-F4      |
| 7    | 2, 3, 4, 5 | F1-F4      |
| 8    | 4          | F1-F4      |
| 9    | 3          | F1-F4      |

### Agent Dispatch Summary

- **Wave 1**: 1 task — T1→`quick`
- **Wave 2**: 4 tasks — T2→`quick`, T3→`deep`, T4→`deep`, T5→`quick`
- **Wave 3**: 4 tasks — T6→`deep`, T7→`deep`, T8→`deep`, T9→`deep`
- **FINAL**: 4 tasks — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [x] 1. **Remove Unused Dependencies [quick]**

  **What to do**:
  Remove 3 confirmed unused npm packages: `lodash`, `framer-motion`, `motion`. Run `npm uninstall lodash framer-motion motion`. Verify no import or require references exist in `src/` after removal. Update `package-lock.json` via the uninstall.

  **Must NOT do**:
  - Do NOT remove any other packages (especially NOT `@genkit-ai/next`, `@opentelemetry/*`, `patch-package`)
  - Do NOT modify any source files
  - Do NOT add any new dependencies

  **Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1 (sole task)
  - **Blocks**: Tasks 2-9
  - **Blocked By**: None

  **References**:
  - `package.json` — dependencies section (remove entries for lodash, framer-motion, motion)
  - `package-lock.json` — auto-updated by npm uninstall
  - Project-wide: `grep -r "from 'lodash'" src/` → 0 results (verified in Context)
  - Project-wide: `grep -r "from 'framer-motion'" src/` → 0 results (verified in Context)
  - Project-wide: `grep -r "from 'motion'" src/` → 0 results (verified in Context)

  **Acceptance Criteria**:
  - [ ] `npm ls lodash` returns "not found" or empty
  - [ ] `npm ls framer-motion` returns "not found" or empty
  - [ ] `npm ls motion` returns "not found" or empty
  - [ ] `npx tsc --noEmit` passes (exit 0)
  - [ ] `npm test` passes (101/101 tests)
  - [ ] No ESLint errors

  **QA Scenarios**:

  ```
  Scenario: Verify packages removed cleanly
    Tool: Bash
    Steps:
      1. Run `npm ls lodash framer-motion motion 2>&1`
      2. Verify output contains "empty" or "not found" for all 3
      3. Run `npx tsc --noEmit`
      4. Verify exit code 0
      5. Run `npm test`
      6. Verify all 101 tests pass
    Expected Result: All 3 packages removed, typecheck passes, all tests pass
    Evidence: .sisyphus/evidence/task-1-deps-removed.txt
  ```

  **Commit**:
  - Message: `chore(deps): remove unused lodash, framer-motion, motion`
  - Files: `package.json`, `package-lock.json`
  - Pre-commit: `npx tsc --noEmit && npm test`

---

- [x] 2. **Create exercise-options.ts [quick]**

  **What to do**:
  Create new file `src/lib/exercise-options.ts` that exports shared exercise constants. Consolidate duplicated definitions from `treinos-client.tsx` (L42-57) and `workout-editor.tsx` (L19-36). Exports must be:
  - `exerciciosOptions` — grouped combobox options derived from `EXERCICIOS_POR_GRUPO`
  - `flatExerciciosOptions` — flat array with `{ value, label, description }`
  - `exercicioDescriptionsMap` — `Map<string, string>` for O(1) description lookup
  - `DEFAULT_EXERCISE` — default partial `Exercicio` object `{ id: '', nomeExercicio: '', series: 3, repeticoes: '10-12', observacoes: '', descricao: '' }`

  Import `EXERCICIOS_POR_GRUPO` from `@/lib/constants` and `Exercicio` type from `@/lib/definitions`.

  **Must NOT do**:
  - Do NOT modify any existing files (consumers updated in later tasks)
  - Do NOT add any new npm dependencies
  - Do NOT include anything beyond exercise option definitions

  **Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 3, 4, 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 3, 4, 6, 7
  - **Blocked By**: Task 1

  **References**:
  - `src/app/dashboard/treinos/treinos-client.tsx` L42-57 — `exerciciosOptions` and `flatExerciciosOptions` definitions (use as primary source)
  - `src/components/dashboard/aluno/workout-editor.tsx` L19-36 — duplicate definitions of same variables + `exercicioDescriptionsMap` (L26-28)
  - `src/lib/constants.ts` — source of `EXERCICIOS_POR_GRUPO`
  - `src/lib/definitions.ts` — `Exercicio` type

  **Acceptance Criteria**:
  - [ ] File exists at `src/lib/exercise-options.ts`
  - [ ] Exports `exerciciosOptions`, `flatExerciciosOptions`, `exercicioDescriptionsMap`, `DEFAULT_EXERCISE`
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)
  - [ ] No new ESLint errors

  **QA Scenarios**:

  ```
  Scenario: Verify new module exports and types
    Tool: Bash
    Steps:
      1. Run `npx tsc --noEmit --strict src/lib/exercise-options.ts` or full typecheck
      2. Verify file exports all 4 symbols
      3. Run `npm run lint -- src/lib/exercise-options.ts`
      4. Run `npm test`
    Expected Result: Typecheck passes, lint clean, all tests pass
    Evidence: .sisyphus/evidence/task-2-exercise-options-exports.txt
  ```

  **Commit**:
  - Message: `refactor(workout): extract shared exercise utilities`
  - Files: `src/lib/exercise-options.ts`
  - Pre-commit: `npm run pre-flight`

---

- [x] 3. **Create useWorkoutExercises hook [deep]**

  **What to do**:
  Create new file `src/hooks/use-workout-exercises.ts` that extracts duplicated exercise state management. This hook encapsulates:
  - `objetivo` / `setObjetivo` state
  - `exercicios` / `setExercicios` state (array of `Partial<Exercicio>`)
  - `addObjective()` — appends a new empty exercise via `DEFAULT_EXERCISE`
  - `removeExercise(id)` — removes exercise by id
  - `updateExercise(id, field, value)` — updates a field; for `nomeExercicio` uses `exercicioDescriptionsMap.get()` for O(1) description lookup; for `series` uses `Number.parseInt` with `Number.isFinite` safety
  - `hasValidationErrors` — returns true if `!objetivo || exercicios.length === 0 || exercicios.some(e => !e.nomeExercicio)`
  - `reset()` — clears both `objetivo` and `exercicios`

  Accepts optional `initialObjetivo?: string` and `initialExercicios?: Partial<Exercicio>[]` params for edit modes. Uses `useCallback` for stable function references.

  **Must NOT do**:
  - Do NOT modify any existing components (consumers updated in Tasks 6, 7, 9)
  - Do NOT add any new npm dependencies
  - Do NOT handle form submission (consumers keep their own save logic)
  - Do NOT handle toast/notification (consumers keep their own notification)

  **Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 4, 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 6, 7, 9
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `src/app/dashboard/treinos/treinos-client.tsx` L354-394 — `handleAddExercicio`, `handleRemoveExercicio`, `handleExercicioChange` (Map-based approach with `parseInt` safety, use as canonical)
  - `src/components/dashboard/aluno/workout-editor.tsx` L48-87 — duplicate `handleAddExercicio`, `handleRemoveExercicio`, `handleExercicioChange` (Map-based approach without parseInt safety on series)
  - `src/lib/exercise-options.ts` — import `exercicioDescriptionsMap`, `DEFAULT_EXERCISE` (created in Task 2)
  - `src/lib/definitions.ts` — `Exercicio` type

  **Acceptance Criteria**:
  - [ ] File exists at `src/hooks/use-workout-exercises.ts`
  - [ ] Exports `useWorkoutExercises` function
  - [ ] Returns: `{ objetivo, setObjetivo, exercicios, addObjective, removeExercise, updateExercise, hasValidationErrors, reset }`
  - [ ] `updateExercise` uses `exercicioDescriptionsMap.get()` (O(1)) not `Array.find()` (O(n))
  - [ ] `updateExercise` for `series` uses `Number.parseInt` + `Number.isFinite` guard
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify hook types and behavior
    Tool: Bash
    Steps:
      1. Run `npx tsc --noEmit`
      2. Run `npm run lint -- src/hooks/use-workout-exercises.ts`
      3. Verify file exports function with correct return type shape
      4. Verify Map-based lookup (grep for `exercicioDescriptionsMap.get`)
      5. Verify parseInt safety (grep for `Number.isFinite`)
      6. Run `npm test`
    Expected Result: Typecheck clean, lint clean, Map-based O(1) confirmed, parseInt safety confirmed, all tests pass
    Evidence: .sisyphus/evidence/task-3-hook-behavior.txt

  Scenario: Verify no O(n) find() calls in hook
    Tool: Grep
    Steps:
      1. Grep `src/hooks/use-workout-exercises.ts` for `.find(` pattern
      2. Verify zero matches
    Expected Result: No Array.find() calls — only Map.get() for description lookup
    Evidence: .sisyphus/evidence/task-3-no-find-calls.txt
  ```

  **Commit**:
  - Message: `refactor(workout): extract useWorkoutExercises hook`
  - Files: `src/hooks/use-workout-exercises.ts`
  - Pre-commit: `npm run pre-flight`

---

- [x] 4. **Create WorkoutExerciseRow component [deep]**

  **What to do**:
  Create new file `src/components/dashboard/aluno/workout-exercise-row.tsx` that replaces triplicated exercise row UI across treinos-client (L540-604), workout-editor (L133-197), and PlanoGeradoParaEdicao (L260-305).

  Props interface:

  ```typescript
  interface WorkoutExerciseRowProps {
    exercise: Partial<Exercicio>;
    index: number;
    onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
    onRemove?: (id: string) => void;
    mode?: 'combobox' | 'input'; // default: 'combobox'
  }
  ```

  - `mode='combobox'` — renders Combobox for exercise name (manual creation/edit)
  - `mode='input'` — renders plain Input for exercise name (AI plan review)
  - Always renders: series (Input type="number"), reps (Input), observations (Input)
  - Conditionally renders delete button only when `onRemove` is provided
  - Imports `exerciciosOptions`, `flatExerciciosOptions` from `@/lib/exercise-options`

  **Must NOT do**:
  - Do NOT modify any existing components (consumers updated in Tasks 6, 7, 8)
  - Do NOT add any new npm dependencies
  - Do NOT include card/container layout (only the row content)

  **Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`git-master`, `frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 3, 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Tasks 1, 2

  **References**:
  - `src/app/dashboard/treinos/treinos-client.tsx` L540-604 — exercise row UI with Combobox, series, reps, obs, delete button
  - `src/components/dashboard/aluno/workout-editor.tsx` L133-197 — nearly identical exercise row with Combobox
  - `src/app/dashboard/treinos/treinos-client.tsx` L260-305 — PlanoGeradoParaEdicao exercise row (Input mode, not Combobox)
  - `src/components/ui/combobox.tsx` — Combobox component API
  - `src/lib/exercise-options.ts` — import options (created in Task 2)

  **Acceptance Criteria**:
  - [ ] File exists at `src/components/dashboard/aluno/workout-exercise-row.tsx`
  - [ ] Exports `WorkoutExerciseRow` component
  - [ ] `mode='combobox'` renders Combobox with exercise options
  - [ ] `mode='input'` renders plain Input for exercise name
  - [ ] Delete button hidden when `onRemove` not provided
  - [ ] Series input uses `Number.parseInt` + `Number.isFinite` guard
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify component renders correctly
    Tool: Bash
    Steps:
      1. Run `npx tsc --noEmit`
      2. Verify exports WorkoutExerciseRow
      3. Verify imports from exercise-options.ts
      4. Run `npm run lint -- src/components/dashboard/aluno/workout-exercise-row.tsx`
      5. Run `npm test`
    Expected Result: Typecheck clean, lint clean, all tests pass
    Evidence: .sisyphus/evidence/task-4-component-exports.txt

  Scenario: Verify both modes exist
    Tool: Grep
    Steps:
      1. Grep file for `mode.*combobox` and `mode.*input`
      2. Verify both mode branches exist
      3. Grep for `onRemove` conditional rendering
    Expected Result: Both combobox and input modes present, delete button conditional
    Evidence: .sisyphus/evidence/task-4-both-modes.txt
  ```

  **Commit**:
  - Message: `refactor(workout): extract WorkoutExerciseRow component`
  - Files: `src/components/dashboard/aluno/workout-exercise-row.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 5. **Delete inline WorkoutGenerator from treinos-client [quick]**

  **What to do**:
  Delete the inline `WorkoutGenerator` function from `src/app/dashboard/treinos/treinos-client.tsx` (L59-191). Replace it with an import from `@/components/dashboard/aluno/workout-generator`. Also remove unused imports that were only needed by the inline version (e.g., `zodResolver`, `WorkoutGeneratorInputSchema`, `Form`, `FormControl`, `FormField`, `FormItem`, `FormLabel` from `@/hookform/resolvers/zod` and `@/components/ui/form`).

  Note: The canonical version uses slightly different responsive classes (`md:grid-cols-2` vs `sm:grid-cols-2`), different card description text ("Preencha seus dados" vs "Preencha os dados do aluno"), and button text ("Gerar Plano Pessoal com IA" vs "Gerar Plano Semanal"). Accept these minor differences, they are intentionally distinct for the instructor-facing context.

  **Must NOT do**:
  - Do NOT change the `onGenerate` callback or `isGenerating` prop wiring (L507)
  - Do NOT modify any other functions in this file (PlanoGeradoParaEdicao, TreinosManagementClient, etc.)
  - Do NOT add the canonical WorkoutGenerator to any other imports
  - Do NOT modify the canonical `workout-generator.tsx`

  **Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 2, 3, 4)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Task 1

  **References**:
  - `src/app/dashboard/treinos/treinos-client.tsx` L59-191 — inline `WorkoutGenerator` function to delete
  - `src/app/dashboard/treinos/treinos-client.tsx` L507 — usage site `onGenerate={handleGenerateWorkout} isGenerating={isGenerating}`
  - `src/components/dashboard/aluno/workout-generator.tsx` L25-31 — canonical component props signature
  - `src/app/dashboard/treinos/treinos-client.tsx` L1-38 — imports to clean up after deletion

  **Acceptance Criteria**:
  - [ ] L59-191 `WorkoutGenerator` function deleted
  - [ ] Import added: `import { WorkoutGenerator } from '@/components/dashboard/aluno/workout-generator'`
  - [ ] Unused imports removed (zodResolver, Form components, etc.)
  - [ ] L507 `<WorkoutGenerator onGenerate={handleGenerateWorkout} isGenerating={isGenerating} />` unchanged
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify inline WorkoutGenerator deleted
    Tool: Grep
    Steps:
      1. Grep treinos-client.tsx for "function WorkoutGenerator"
      2. Verify zero matches
      3. Grep treinos-client.tsx for "from '@/components/dashboard/aluno/workout-generator'"
      4. Verify one match (the import)
      5. Run `npx tsc --noEmit && npm test`
    Expected Result: No inline function, import exists, typecheck+tests pass
    Evidence: .sisyphus/evidence/task-5-inline-deleted.txt

  Scenario: Verify no broken references
    Tool: Bash
    Steps:
      1. Run `npm run lint -- src/app/dashboard/treinos/treinos-client.tsx`
      2. Verify zero unused import warnings
      3. Verify zero undefined function errors
    Expected Result: Lint clean, no dangling references
    Evidence: .sisyphus/evidence/task-5-no-broken-refs.txt
  ```

  **Commit**:
  - Message: `refactor(treinos): replace inline WorkoutGenerator with shared import`
  - Files: `src/app/dashboard/treinos/treinos-client.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 6. **Refactor WorkoutEditor [deep]**

  **What to do**:
  Refactor `src/components/dashboard/aluno/workout-editor.tsx` to use shared modules:
  1. Replace local `exerciciosOptions`, `flatExerciciosOptions`, `exercicioDescriptionsMap` (L19-36) with import from `@/lib/exercise-options`
  2. Replace `useState` for `objetivo`/`exercicios` + `handleAddExercicio`/`handleRemoveExercicio`/`handleExercicioChange` (L48-87) with `useWorkoutExercises` hook from `@/hooks/use-workout-exercises`
  3. Replace inline exercise row UI (L133-197) with `WorkoutExerciseRow` component from `@/components/dashboard/aluno/workout-exercise-row`

  Final component should be ~100 lines shorter. Keep the Card/CardHeader/CardContent/CardFooter layout intact.

  **Must NOT do**:
  - Do NOT change the component's public API (props: `onSave`, `treinoToEdit`, `onCancel`)
  - Do NOT change the save validation logic (L90-97)
  - Do NOT modify the `handleSaveTreino` function logic (L89-106)
  - Do NOT change visual styling or layout structure

  **Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`git-master`, `frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 7, 8, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Tasks 2, 3, 4

  **References**:
  - `src/components/dashboard/aluno/workout-editor.tsx` L1-220 — full file to refactor
  - `src/components/dashboard/aluno/workout-editor.tsx` L19-36 — local exercise options to replace with import
  - `src/components/dashboard/aluno/workout-editor.tsx` L48-87 — local state + handlers to replace with hook
  - `src/components/dashboard/aluno/workout-editor.tsx` L133-197 — exercise row UI to replace with component
  - `src/lib/exercise-options.ts` — new import source (created in Task 2)
  - `src/hooks/use-workout-exercises.ts` — new hook (created in Task 3)
  - `src/components/dashboard/aluno/workout-exercise-row.tsx` — new component (created in Task 4)

  **Acceptance Criteria**:
  - [ ] File imports from `@/lib/exercise-options`
  - [ ] File imports `useWorkoutExercises` from `@/hooks/use-workout-exercises`
  - [ ] File imports `WorkoutExerciseRow` from `@/components/dashboard/aluno/workout-exercise-row`
  - [ ] No local `exerciciosOptions`, `flatExerciciosOptions`, `exercicioDescriptionsMap` definitions
  - [ ] No local `handleAddExercicio`, `handleRemoveExercicio`, `handleExercicioChange` functions
  - [ ] File is ~120 lines (down from 220)
  - [ ] Component props unchanged: `onSave`, `treinoToEdit`, `onCancel`
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify shared modules used
    Tool: Grep
    Steps:
      1. Grep workout-editor.tsx for "from '@/lib/exercise-options'" → 1 match
      2. Grep for "useWorkoutExercises" → ≥1 match
      3. Grep for "WorkoutExerciseRow" → ≥1 match
      4. Grep for "EXERCICIOS_POR_GRUPO" → 0 matches (removed)
      5. Grep for "handleAddExercicio" → 0 matches (removed)
      6. Run `npx tsc --noEmit && npm test`
    Expected Result: Shared imports present, duplicated code removed, all tests pass
    Evidence: .sisyphus/evidence/task-6-workout-editor-refactored.txt

  Scenario: Verify props unchanged
    Tool: Grep
    Steps:
      1. Verify component still accepts onSave, treinoToEdit, onCancel
      2. Verify handleSaveTreino still validates before save
    Expected Result: Public API preserved, validation logic intact
    Evidence: .sisyphus/evidence/task-6-api-preserved.txt
  ```

  **Commit**:
  - Message: `refactor(workout): refactor WorkoutEditor to use shared modules`
  - Files: `src/components/dashboard/aluno/workout-editor.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 7. **Refactor TreinosManagementClient [deep]**

  **What to do**:
  Refactor `src/app/dashboard/treinos/treinos-client.tsx` to use shared modules for the manual workout form section:
  1. Replace local `exerciciosOptions`, `flatExerciciosOptions` (L42-57) with import from `@/lib/exercise-options`
  2. Replace `useState` for `objetivo`/`exercicios` + `handleAddExercicio`/`handleRemoveExercicio`/`handleExercicioChange` (L354-394) with `useWorkoutExercises` hook
  3. Replace inline exercise row UI (L540-604) with `WorkoutExerciseRow` component (mode='combobox')

  Keep: `PlanoGeradoParaEdicao` component, `handleSaveTreino`, `handleGenerateWorkout`, `handleSavePlanoGerado`, `buildExercicios`, `buildWorkoutTreinos`.

  **Must NOT do**:
  - Do NOT modify `PlanoGeradoParaEdicao` (Task 8 handles that)
  - Do NOT change the component's public API
  - Do NOT change AI generation logic or save logic
  - Do NOT change PlanoGeradoParaEdicao's exercise row (L260-305) — that's Task 8

  **Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`git-master`, `frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 8, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Tasks 2, 3, 4, 5

  **References**:
  - `src/app/dashboard/treinos/treinos-client.tsx` L42-57 — local exercise options to replace
  - `src/app/dashboard/treinos/treinos-client.tsx` L354-394 — local state + handlers to replace with hook
  - `src/app/dashboard/treinos/treinos-client.tsx` L540-604 — exercise row UI to replace with WorkoutExerciseRow
  - `src/app/dashboard/treinos/treinos-client.tsx` L193-321 — PlanoGeradoParaEdicao (DO NOT touch)
  - `src/lib/exercise-options.ts` — new import source (Task 2)
  - `src/hooks/use-workout-exercises.ts` — new hook (Task 3)
  - `src/components/dashboard/aluno/workout-exercise-row.tsx` — new component (Task 4)

  **Acceptance Criteria**:
  - [ ] File imports from `@/lib/exercise-options`
  - [ ] File imports `useWorkoutExercises` from `@/hooks/use-workout-exercises`
  - [ ] File imports `WorkoutExerciseRow` from `@/components/dashboard/aluno/workout-exercise-row`
  - [ ] No local `exerciciosOptions`, `flatExerciciosOptions` definitions
  - [ ] No local `handleAddExercicio`, `handleRemoveExercicio`, `handleExercicioChange` for manual form
  - [ ] `PlanoGeradoParaEdicao` unchanged (L193-321)
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify shared modules used in manual form
    Tool: Grep
    Steps:
      1. Grep treinos-client.tsx for "from '@/lib/exercise-options'" → 1 match
      2. Grep for "useWorkoutExercises" → ≥1 match
      3. Grep for "WorkoutExerciseRow" → ≥1 match
      4. Grep for "handleAddExercicio" in TreinosManagementClient → 0 matches
      5. Verify PlanoGeradoParaEdicao still has its own handleExercicioChange (L206-223)
      6. Run `npx tsc --noEmit && npm test`
    Expected Result: Manual form refactored, PlanoGeradoParaEdicao untouched, tests pass
    Evidence: .sisyphus/evidence/task-7-treinos-client-refactored.txt
  ```

  **Commit**:
  - Message: `refactor(treinos): refactor TreinosManagementClient to use shared modules`
  - Files: `src/app/dashboard/treinos/treinos-client.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 8. **Refactor PlanoGeradoParaEdicao [deep]**

  **What to do**:
  Refactor the exercise row rendering inside `PlanoGeradoParaEdicao` (L260-305) to use `WorkoutExerciseRow` component with `mode='input'`. This replaces the 4-field grid layout (L261-304) with a single `<WorkoutExerciseRow>` component.

  Key differences from manual form mode:
  - Uses `mode='input'` instead of `mode='combobox'` (exercise names come from AI, not user selection)
  - No `onRemove` prop (can't remove exercises from AI-generated plan, only edit)
  - Passes `onUpdate` as `(id, field, value) => handleExercicioChange(treinoIndex, exIndex, field, value)`
  - The `id` for each exercise row will be derived from the exercise index: `exercise-${treinoIndex}-${exIndex}` (or use the exercise name as id since AI exercises have unique names per workout)

  **Must NOT do**:
  - Do NOT modify the `handleExercicioChange` function (L206-223)
  - Do NOT modify the `handleNomeTreinoChange` function (L225-229)
  - Do NOT change the overall Card/CardHeader/CardContent/CardFooter layout
  - Do NOT change the plan name input or workout name inputs (L238-257)

  **Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`git-master`, `frontend-design`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 9)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Task 4

  **References**:
  - `src/app/dashboard/treinos/treinos-client.tsx` L193-321 — full `PlanoGeradoParaEdicao` component
  - `src/app/dashboard/treinos/treinos-client.tsx` L260-305 — exercise row grid to replace (4-field: exercise name, series, reps, obs)
  - `src/app/dashboard/treinos/treinos-client.tsx` L206-223 — `handleExercicioChange` (keep, use as onUpdate callback)
  - `src/components/dashboard/aluno/workout-exercise-row.tsx` — `WorkoutExerciseRow` with `mode='input'` (created in Task 4)

  **Acceptance Criteria**:
  - [ ] `PlanoGeradoParaEdicao` uses `WorkoutExerciseRow` with `mode='input'`
  - [ ] No `onRemove` prop passed (AI exercises not removable)
  - [ ] `handleExercicioChange` function unchanged
  - [ ] Plan name input and workout name inputs unchanged
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify WorkoutExerciseRow used in input mode
    Tool: Grep
    Steps:
      1. Grep treinos-client.tsx for "WorkoutExerciseRow" → ≥1 match
      2. Grep for "mode.*input" in PlanoGeradoParaEdicao section → ≥1 match
      3. Verify handleExercicioChange still exists (L206-223)
      4. Run `npx tsc --noEmit && npm test`
    Expected Result: Input mode used, handleExercicioChange preserved, tests pass
    Evidence: .sisyphus/evidence/task-8-plano-gerado-refactored.txt

  Scenario: Verify exercise row simplified
    Tool: Read
    Steps:
      1. Read L260-305 area of treinos-client.tsx
      2. Verify old 4-field grid replaced with single WorkoutExerciseRow
    Expected Result: Row rendering simplified from ~45 lines to ~5 lines
    Evidence: .sisyphus/evidence/task-8-row-simplified.txt
  ```

  **Commit**:
  - Message: `refactor(treinos): refactor PlanoGeradoParaEdicao to use WorkoutExerciseRow`
  - Files: `src/app/dashboard/treinos/treinos-client.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 9. **Extract hooks from MeusTreinosClient [deep]**

  **What to do**:
  Extract two custom hooks from `src/app/aluno/meus-treinos/meus-treinos-client.tsx` to reduce component complexity:

  **Hook 1: `useWorkoutCRUD`** (extract from L56-147)
  - Manages: `meusTreinos` state, `handleSave`, `handleEdit`, `handleDayChange`, `openDeleteAlert`, `handleDelete`
  - Params: `{ initialTreinos: Treino[], userId: string }`
  - Returns: `{ meusTreinos, isAlertOpen, deletingTreino, setIsAlertOpen, editingTreino, isFormVisible, setIsFormVisible, setEditingTreino, handleSave, handleEdit, handleDayChange, openDeleteAlert, handleDelete }`

  **Hook 2: `useWorkoutGeneration`** (extract from L149-209)
  - Manages: `handleGenerate` with AI generation logic
  - Params: `{ userId: string, meusTreinos: Treino[], setMeusTreinos: React.Dispatch<...> }`
  - Returns: `{ isGenerating, handleGenerate }`

  Create these in `src/hooks/use-workout-crud.ts` and `src/hooks/use-workout-generation.ts`. Update `meus-treinos-client.tsx` to import and use both hooks. Component becomes a thin orchestrator (~150 lines, down from 400).

  **Must NOT do**:
  - Do NOT change the component's public API (props: `initialTreinos`, `userId`)
  - Do NOT change `renderWorkoutList` function
  - Do NOT change `handleFinishWorkout` logic
  - Do NOT change `getDiaLabel` function
  - Do NOT change the JSX/visual layout
  - Do NOT add any new npm dependencies

  **Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8)
  - **Parallel Group**: Wave 3
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Task 3

  **References**:
  - `src/app/aluno/meus-treinos/meus-treinos-client.tsx` L1-400 — full file
  - `src/app/aluno/meus-treinos/meus-treinos-client.tsx` L56-147 — CRUD logic for `useWorkoutCRUD`
  - `src/app/aluno/meus-treinos/meus-treinos-client.tsx` L149-209 — generation logic for `useWorkoutGeneration`
  - `src/app/aluno/meus-treinos/meus-treinos-client.tsx` L65-71 — `treinosDoPersonal`/`treinosDoAluno` useMemo (keep in component or move to hook)
  - `src/app/aluno/meus-treinos/meus-treinos-client.tsx` L212-215 — `getDiaLabel` (keep in component)
  - `src/app/aluno/meus-treinos/meus-treinos-client.tsx` L297-310 — `handleFinishWorkout` (keep in component)
  - `src/lib/actions/treinos.ts` — server actions used in hooks

  **Acceptance Criteria**:
  - [ ] `src/hooks/use-workout-crud.ts` exists with exported `useWorkoutCRUD` hook
  - [ ] `src/hooks/use-workout-generation.ts` exists with exported `useWorkoutGeneration` hook
  - [ ] `meus-treinos-client.tsx` imports both hooks
  - [ ] Component is ~150 lines (down from 400)
  - [ ] Component props unchanged: `initialTreinos`, `userId`
  - [ ] `renderWorkoutList` unchanged
  - [ ] `handleFinishWorkout` unchanged
  - [ ] `npx tsc --noEmit` passes
  - [ ] `npm test` passes (101/101)

  **QA Scenarios**:

  ```
  Scenario: Verify hooks extracted correctly
    Tool: Bash
    Steps:
      1. Verify `src/hooks/use-workout-crud.ts` exists
      2. Verify `src/hooks/use-workout-generation.ts` exists
      3. Grep meus-treinos-client.tsx for "useWorkoutCRUD" → ≥1 match
      4. Grep meus-treinos-client.tsx for "useWorkoutGeneration" → ≥1 match
      5. Count lines in meus-treinos-client.tsx → should be ≤160
      6. Run `npx tsc --noEmit`
      7. Run `npm test`
    Expected Result: Hooks exist, imported in component, component slimmed, all tests pass
    Evidence: .sisyphus/evidence/task-9-hooks-extracted.txt

  Scenario: Verify component API preserved
    Tool: Grep
    Steps:
      1. Grep meus-treinos-client.tsx for "renderWorkoutList" → ≥1 match
      2. Grep for "handleFinishWorkout" → ≥1 match
      3. Grep for "treinosDoPersonal" → ≥1 match
      4. Verify component still accepts initialTreinos and userId props
    Expected Result: All internal functions preserved, props unchanged
    Evidence: .sisyphus/evidence/task-9-api-preserved.txt
  ```

  **Commit**:
  - Message: `refactor(meus-treinos): extract custom hooks from MeusTreinosClient`
  - Files: `src/hooks/use-workout-crud.ts`, `src/hooks/use-workout-generation.ts`, `src/app/aluno/meus-treinos/meus-treinos-client.tsx`
  - Pre-commit: `npm run pre-flight`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `general`
      Run `npx tsc --noEmit` + `npm run lint` + `npm test`. Review all changed files for: `as any`, empty catches, console.log in prod, commented-out code. Check extracted functions have proper TypeScript types.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [x] F3. **Real Manual QA** — `general`
      Start from clean state. Execute EVERY QA scenario from EVERY task. Test workout creation flow (manual + AI). Verify no React console warnings.
      Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `general`
      For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Flag unaccounted changes.
      Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| #   | Message                                                                       | Files                                                     | Pre-commit           |
| --- | ----------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------- |
| 1   | `chore(deps): remove unused lodash, framer-motion, motion`                    | `package.json`, `package-lock.json`                       | `npm run pre-flight` |
| 2   | `refactor(workout): extract shared exercise utilities`                        | `src/lib/exercise-options.ts`                             | `npm run pre-flight` |
| 3   | `refactor(workout): extract useWorkoutExercises hook`                         | `src/hooks/use-workout-exercises.ts`                      | `npm run pre-flight` |
| 4   | `refactor(workout): extract WorkoutExerciseRow component`                     | `src/components/dashboard/aluno/workout-exercise-row.tsx` | `npm run pre-flight` |
| 5   | `refactor(treinos): replace inline WorkoutGenerator with shared import`       | `src/app/dashboard/treinos/treinos-client.tsx`            | `npm run pre-flight` |
| 6   | `refactor(workout): refactor WorkoutEditor to use shared modules`             | `src/components/dashboard/aluno/workout-editor.tsx`       | `npm run pre-flight` |
| 7   | `refactor(treinos): refactor TreinosManagementClient to use shared modules`   | `src/app/dashboard/treinos/treinos-client.tsx`            | `npm run pre-flight` |
| 8   | `refactor(treinos): refactor PlanoGeradoParaEdicao to use WorkoutExerciseRow` | `src/app/dashboard/treinos/treinos-client.tsx`            | `npm run pre-flight` |
| 9   | `refactor(meus-treinos): extract custom hooks from MeusTreinosClient`         | `src/app/aluno/meus-treinos/meus-treinos-client.tsx`      | `npm run pre-flight` |

---

## Success Criteria

### Verification Commands

```bash
npm run pre-flight  # Expected: exit 0 (typecheck + lint + format + test)
npm test 2>&1 | grep -E "Tests.*passed"  # Expected: 101 tests passed
npx tsc --noEmit  # Expected: exit 0
npm ls lodash framer-motion motion 2>&1  # Expected: 3 not found
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All 101 tests pass
- [ ] 3 unused deps removed
- [ ] No duplicated exercise form code
- [ ] Shared modules created and imported
- [ ] Large components refactored with extracted hooks
