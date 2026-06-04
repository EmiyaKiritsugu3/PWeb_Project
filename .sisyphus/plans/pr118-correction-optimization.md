# Correction & Optimization Plan — PR #118 Code Quality Fixes

**Branch**: `fix/code-quality-phase2` | **Date**: 2026-06-03

---

## TL;DR

> Fix 15 code quality issues from PR #118 code review across 10 files. Root cause: `dummyDb.ts` returns `Promise<unknown>` cascading into `alunoService.ts` (3 HIGH issues). Remaining issues: type safety in `columns.tsx` (3 HIGH), Genkit output types (2 HIGH+1 LOW), i18n locale bug (1 HIGH), error handler generic (1 MEDIUM), logger unsafe casts (1 MEDIUM), dead files (2 LOW), misleading names (1 LOW).
>
> **Deliverables**: 8 atomic commits → all 15 issues resolved. Type-check + unit tests for each.
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 2 waves (4 parallel agents Wave 1, integration Wave 2)
> **Critical Path**: Wave 0 setup → Wave 1 parallel → `npm run typecheck && npm run test`

---

## Context

### Original Request

User requested: _"crie um plano completo de correção e otimização"_ after full code review of PR #118 revealed 15 issues.

### Interview Summary

**Key Discussions**:

- Full code review completed on PR #118 (5 parallel agents)
- 15 issues identified: 9 HIGH, 2 MEDIUM, 4 LOW
- All affected files read directly
- Test infrastructure confirmed (vitest + React Testing Library, strict TS)

### Metis Review

**Identified Gaps** (addressed):

- **Logger non-enumerable Error properties**: Current spread `...(error as Record<string, unknown>)` silently loses Error.message, Error.stack, Error.name. Fix: extract enumerable + non-enumerable props.
- **Circular refs in logger**: `JSON.parse(JSON.stringify())` throws. Fix: use `structuredClone` with try/catch fallback.
- **i18n case-insensitive locale**: `'PT-BR'`, `'pt-br'`, `'en-US'` not handled. Fix: normalize to lowercase before mapping.
- **columns.tsx nullable values**: `row.getValue()` might return undefined. Fix: use `?? ''` fallback.
- **error.ts param name collision**: `context` too generic. Fix: use `customMessage` instead.

---

## Work Objectives

### Core Objective

Fix all 15 code quality issues from PR #118 with zero behavioral changes.

### Concrete Deliverables

8 atomic commits across 10 files, each with type-check + unit test verification

### Definition of Done

- [ ] `grep -r` for `placeholder-images` → zero results (files deleted)
- [ ] `grep -r` for old constant names `STREAK_MULTIPLIER`, `BONUS_THRESHOLD` → zero results
- [ ] All 8 commits applied with atomic messages
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes (66/66 or updated count)

### Must Have

- 15 issues fixable in isolation or controlled cascade
- dummyDb.ts generic type params with `unknown` default for backward compat
- error.ts `customMessage` param optional
- placeholder file deletion verified by grep

### Must NOT Have (Guardrails)

- No behavioral changes (type-only, naming-only, additive-optional only)
- No adjacent refactoring beyond the 15 issues
- No dummyDb.ts restructuring (type params only)
- No full i18n framework rewrite
- No winston/pino logger rewrite
- No row.original ↔ row.getValue() conversion pattern changes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification agent-executed. No exceptions.

### Test Decision

- **Infrastructure exists**: YES (vitest v4 + React Testing Library)
- **Automated tests**: YES (tests-after per commit)
- **Framework**: vitest + `tsc --noEmit` for type-only fixes
- **If TDD**: Write type-check assertion first, then fix, then verify

### QA Policy

Every task includes agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/`.

- **Type fixes** (dummyDb, columns, Genkit): `tsc --noEmit` compilation check + grep for remnant `as` casts
- **Behavioral fixes** (i18n, error.ts, logger): vitest test with concrete assertions
- **File deletions**: grep for imports → zero results
- **Rename**: grep for old names → zero results

---

## Execution Strategy

### Dependency Matrix

```
Issue Group         | Blocks | Blocked By
────────────────────┼────────┼─────────────
Wave 0: Setup       | W1-W4  | (none)
Commit 1: dummyDb   | -      | W0
Commit 2: columns   | -      | W0
Commit 3: Genkit    | -      | W0
Commit 4: i18n      | -      | W0
Commit 5: error.ts  | -      | W0
Commit 6: logger    | -      | W0
Commit 7: delete    | -      | W0
Commit 8: rename    | -      | W0
Integration: typecheck+test | - | W1-W4
```

### Parallel Execution Waves

```
Wave 0 (Setup — sequential):
├── grep placeholder-images imports
├── grep STREAK_MULTIPLIER / BONUS_THRESHOLD
├── check Genkit version
└── `npm run test` baseline

Wave 1 (MAX PARALLEL — 4 agents):
├── Agent A: Commit 1 (dummyDb + alunoService) + Commit 2 (columns.tsx)
├── Agent B: Commit 3 (workout-generator-flow) + Commit 4 (i18n-provider)
├── Agent C: Commit 5 (error.ts + treinos.ts) + Commit 6 (logger.ts)
└── Agent D: Commit 7 (delete files) + Commit 8 (rename constants)

Wave 2 (Integration — sequential):
├── `npm run typecheck`
├── `npm run test`
├── `npm run lint`
└── Verify all 15 issues addressed
```

---

## TODOs

- [x] 1. Wave 0: Setup & baseline verification

  **What to do**:
  1. Search for any imports referencing placeholder-images files:
     ```bash
     grep -r 'placeholder-images' src/ --include='*.{ts,tsx,js,json}'
     ```
  2. Search for old constant names across codebase:
     ```bash
     grep -r 'STREAK_MULTIPLIER\|BONUS_THRESHOLD' src/ --include='*.{ts,tsx}'
     ```
  3. Check Genkit version in package.json for output type definitions
  4. Run `npm run test` to establish baseline pass
  5. Document findings in task evidence

  **Must NOT do**:
  - Do not modify any files in this task
  - Do not change any code

  **Recommended Agent Profile**:
  - Category: `quick` — pure investigation, no code changes
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: NO (sequential prerequisite)
  - Blocks: All task 2-9
  - Blocked By: None

  **Acceptance Criteria**:
  - [ ] grep results documented (expected: zero imports for placeholder-images)
  - [ ] Old constant name usages mapped (expected: only inside data.ts and maybe tests)
  - [ ] Genkit version recorded
  - [ ] Baseline test results: `npm run test` passes

  **QA Scenarios**:

  ```
  Scenario: Baseline verification
    Tool: Bash
    Steps:
      1. Run: grep -r 'placeholder-images' src/ --include='*.{ts,tsx,js,json}' > .sisyphus/evidence/wave0-imports.txt
      2. Run: grep -r 'STREAK_MULTIPLIER\|BONUS_THRESHOLD' src/ --include='*.{ts,tsx}' > .sisyphus/evidence/wave0-constants.txt
      3. Run: npm run test 2>&1 | tee .sisyphus/evidence/wave0-baseline.txt
    Expected Result: grep returns zero results for imports; test suite passes
    Evidence: .sisyphus/evidence/wave0-*.txt
  ```

  **Commit**: NO

- [ ] 2. Fix dummyDb generic types + alunoService cascade (Fixes #6-8 HIGH)

  **What to do**:
  1. In `src/lib/dummyDb.ts`, add generic type params to all 4 methods with `unknown` default:

     ```typescript
     // Before:
     async insert(_table: string, data: unknown): Promise<unknown> {
     async findById(_table: string, id: string): Promise<unknown> {
     async update(_table: string, id: string, data: unknown): Promise<unknown> {
     async delete(_table: string, _id: string): Promise<boolean> {

     // After:
     async insert<T = unknown>(_table: string, data: T): Promise<T> {
     async findById<T = unknown>(_table: string, id: string): Promise<T | null> {
     async update<T = unknown>(_table: string, id: string, data: Partial<T>): Promise<T> {
     async delete(_table: string, _id: string): Promise<boolean> {
     ```

     Note: `findById` returns `T | null` (might not exist), `delete` stays boolean-typed (no generic needed).
     Also remove the `(data as Record<string, unknown>)` cast in `update()` — with generic `T`, the spread works naturally.

  2. In `src/services/alunoService.ts`:
     - `createAluno()`: `const result = await db.insert<Aluno>('alunos', newAluno);` — explicit type param
     - `getAluno()`: `const result = await db.findById<Aluno>('alunos', id);` — explicit type param, add `?? null` fallback
     - `updateAluno()`: `const result = await db.update<Aluno>('alunos', id, updateData);` — explicit type param

  3. Add type-check assertion test:
     ```
     tests/services/alunoService.test.ts — verify createAluno returns Aluno, getAluno returns Aluno | null
     ```

  **Must NOT do**:
  - Do not restructure dummyDb.ts beyond type params
  - Do not add other methods to dummyDb
  - Do not change Prisma imports or database logic

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 3-5)
  - Blocks: None
  - Blocked By: Task 1 (Wave 0 setup)

  **References**:
  - `src/lib/dummyDb.ts` — current methods all return `Promise<unknown>`
  - `src/services/alunoService.ts` — calls `db.insert()`, `db.findById()`, `db.update()` without type params

  **Acceptance Criteria**:
  - [ ] `tsc --noEmit` passes on both files
  - [ ] `alunoService.createAluno()` returns `Promise<Aluno>` not `Promise<unknown>`
  - [ ] `alunoService.getAluno()` returns `Promise<Aluno | null>` not `Promise<unknown>`
  - [ ] `alunoService.updateAluno()` returns `Promise<Aluno>` not `Promise<unknown>`

  **QA Scenarios**:

  ```
  Scenario: dummyDb type safety
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit src/lib/dummyDb.ts src/services/alunoService.ts 2>&1 | tee .sisyphus/evidence/task2-typecheck.txt
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task2-typecheck.txt

  Scenario: alunoService returns typed result
    Steps:
      1. Check that alunoService.ts has no unchecked return of db methods
      2. Run: grep -rn ': Promise<unknown>' src/services/alunoService.ts
    Expected Result: grep returns 0 matches
  ```

  **Commit**: YES
  - Message: `fix(db): add generic type params to dummyDb methods`
  - Files: `src/lib/dummyDb.ts`, `src/services/alunoService.ts`

- [ ] 3. Fix columns.tsx row.getValue() type safety (Fixes #1-3 HIGH)

  **What to do**:
  1. In `src/components/dashboard/alunos/columns.tsx`:
     - Line 124: `const nome = row.getValue('nomeCompleto');` → `const nome = row.getValue<string>('nomeCompleto') ?? '';`
     - Line 144: `const date = row.getValue('dataCadastro');` → `const date = row.getValue<string>('dataCadastro');`
       (already has null check `if (!date) return null;` on line 145 — safe)
     - Line 158: `const status = row.getValue('statusMatricula');` → `const status = row.getValue<Aluno['statusMatricula']>('statusMatricula');`
       (passed to `getStatusVariant()` which expects `Aluno['statusMatricula']`)

  **Must NOT do**:
  - Do not convert row.getValue() → row.original patterns
  - Do not refactor column definitions
  - Do not change the ActionsCell component

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2, 4, 5)
  - Blocks: None
  - Blocked By: Task 1

  **References**:
  - `src/components/dashboard/alunos/columns.tsx:123-131` — row.getValue('nomeCompleto')
  - `src/components/dashboard/alunos/columns.tsx:143-151` — row.getValue('dataCadastro')
  - `src/components/dashboard/alunos/columns.tsx:157-164` — row.getValue('statusMatricula')
  - TanStack Table types: `row.getValue` signature is `getValue<TValue = unknown>(id: string): TValue`

  **Acceptance Criteria**:
  - [ ] `tsc --noEmit` passes on columns.tsx
  - [ ] No `row.getValue(` calls without explicit type parameter
  - [ ] `nomeCompleto` cell handles undefined (?? '' fallback)
  - [ ] `statusMatricula` value matches `Aluno['statusMatricula']` type

  **QA Scenarios**:

  ```
  Scenario: Type-check columns.tsx
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit src/components/dashboard/alunos/columns.tsx 2>&1
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task3-typecheck.txt

  Scenario: No bare getValue calls
    Steps:
      1. grep -n 'row\.getValue(' src/components/dashboard/alunos/columns.tsx
    Expected Result: All matches include type parameter
    Evidence: .sisyphus/evidence/task3-getvalue.txt
  ```

  **Commit**: YES
  - Message: `fix(components): add type params to row.getValue() calls`
  - Files: `src/components/dashboard/alunos/columns.tsx`

- [ ] 4. Fix workout-generator-flow Genkit output types (Fixes #4-5 HIGH, #15 LOW)

  **What to do**:
  1. Import the output type at top:

     ```typescript
     import type { WorkoutGeneratorAIOutput } from '@/ai/schemas';
     ```

  2. Fix streaming chunk output (line 59):

     ```typescript
     // Before:
     if (chunk?.output) {
       sendChunk(chunk.output);
     }
     // After:
     if (chunk?.output) {
       sendChunk(chunk.output as WorkoutGeneratorAIOutput);
     }
     ```

     Note: Genkit streaming chunks return `unknown` for custom schemas — `as` cast with the schema type is the documented Genkit pattern.

  3. Fix final output (lines 65-68):

     ```typescript
     // Before:
     if (!finalOutput?.output) { throw new Error(...); }
     return finalOutput.output;
     // After:
     if (!finalOutput?.output) { throw new Error(...); }
     return finalOutput.output as WorkoutGeneratorAIOutput;
     ```

  4. Fix `generateWorkoutPlan` return (line 81):
     ```typescript
     // Before:
     return output;
     // After (add null check):
     if (!output) throw new Error('A IA não retornou um plano de treino válido.');
     return output;
     ```

  **Must NOT do**:
  - Do not change the AI prompt
  - Do not change Genkit flow definition
  - Do not restructure streaming logic

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2, 3, 5)
  - Blocks: None
  - Blocked By: Task 1

  **References**:
  - `src/ai/flows/workout-generator-flow.ts:58-62` — streaming chunk output
  - `src/ai/flows/workout-generator-flow.ts:64-68` — final output
  - `src/ai/flows/workout-generator-flow.ts:73-81` — generateWorkoutPlan return
  - `src/ai/schemas.ts:51-55` — WorkoutGeneratorAIOutputSchema + WorkoutGeneratorAIOutput type

  **Acceptance Criteria**:
  - [ ] `tsc --noEmit` passes on workout-generator-flow.ts
  - [ ] `chunk.output` narrowed to WorkoutGeneratorAIOutput
  - [ ] `finalOutput.output` narrowed to WorkoutGeneratorAIOutput
  - [ ] `generateWorkoutPlan()` has null check before return

  **QA Scenarios**:

  ```
  Scenario: Type-check workout-generator-flow
    Tool: Bash
    Steps:
      1. Run: npx tsc --noEmit src/ai/flows/workout-generator-flow.ts 2>&1
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task4-typecheck.txt

  Scenario: Null check present
    Steps:
      1. grep -n 'if (!output)' src/ai/flows/workout-generator-flow.ts
    Expected Result: Match on generateWorkoutPlan null check
    Evidence: .sisyphus/evidence/task4-nullcheck.txt
  ```

  **Commit**: YES
  - Message: `fix(ai): type-narrow Genkit streaming output via schema`
  - Files: `src/ai/flows/workout-generator-flow.ts`

- [ ] 5. Fix i18n-provider locale persistence bug (Fixes #9 HIGH)

  **What to do**:
  1. In `src/components/providers/i18n-provider.tsx`:
     - Fix the savedLang assignment (line 25):

       ```typescript
       // Before:
       const raw = localStorage.getItem('app-language');
       const savedLang: Language = raw === 'pt-BR' || raw === 'en' ? raw : 'pt-BR';
       if (savedLang === 'pt' || savedLang === 'en') {
         setLanguageState(savedLang);
       }

       // After:
       const raw = localStorage.getItem('app-language');
       const normalized = raw?.toLowerCase() ?? '';
       let savedLang: Language = 'pt';
       if (normalized.startsWith('pt')) {
         savedLang = 'pt';
       } else if (normalized.startsWith('en')) {
         savedLang = 'en';
       }
       setLanguageState(savedLang);
       ```

     - This handles: `'pt-BR'` → `'pt'`, `'pt'` → `'pt'`, `'en'` → `'en'`, `'en-US'` → `'en'`, `'PT-BR'` → `'pt'`

  **What to test**:
  - localStorage with `'pt-BR'` → language state equals `'pt'`
  - localStorage with `'pt'` → language state equals `'pt'`
  - localStorage with `'en'` → language state equals `'en'`
  - localStorage with `'en-US'` → language state equals `'en'`
  - localStorage with `'PT-BR'` (uppercase) → language state equals `'pt'`
  - localStorage with null/empty → language state equals `'pt'` (default)

  **Must NOT do**:
  - Do not rewrite i18n architecture
  - Do not add full i18n framework (next-intl, react-i18next)
  - Do not change the `setLanguage` function's save logic

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2-4)
  - Blocks: None
  - Blocked By: Task 1

  **References**:
  - `src/components/providers/i18n-provider.tsx:24-28` — current broken savedLang logic
  - `src/components/providers/i18n-provider.tsx:7` — `type Language = 'pt' | 'en'`

  **Acceptance Criteria**:
  - [ ] localStorage `'pt-BR'` → language is `'pt'`
  - [ ] localStorage `'pt'` → language is `'pt'`
  - [ ] localStorage `'en'` → language is `'en'`
  - [ ] localStorage `'en-US'` → language is `'en'`
  - [ ] localStorage null → language is `'pt'` (default)

  **QA Scenarios**:

  ```
  Scenario: pt-BR mapped to pt
    Tool: Bash
    Steps:
      1. Create test file or add unit test verifying: given localStorage 'pt-BR',
         the language state is 'pt'
    Expected Result: State is 'pt', NOT 'pt-BR'
    Evidence: .sisyphus/evidence/task5-ptbr.txt

  Scenario: Case-insensitive locale
    Steps:
      1. Verify: given localStorage 'PT-BR' or 'Pt-bR',
         the language state is 'pt'
    Expected Result: State is 'pt'
  ```

  **Commit**: YES
  - Message: `fix(i18n): map legacy 'pt-BR' locale to 'pt' language`
  - Files: `src/components/providers/i18n-provider.tsx`

- [ ] 6. Fix handleActionError with customizable ZodError message (Fixes #10 MEDIUM)

  **What to do**:
  1. In `src/lib/error.ts`:

     ```typescript
     // Before:
     export function handleActionError(error: unknown) {
       if (error instanceof Error && error.name === 'ZodError') {
         return { success: false as const, error: 'Dados inválidos' };
       }
       return { success: false as const, error: getErrorMessage(error) };
     }

     // After:
     export function handleActionError(error: unknown, customMessage?: string) {
       if (error instanceof Error && error.name === 'ZodError') {
         const zodMessage = getZodError(error)
           ? (customMessage ?? 'Dados inválidos')
           : 'Dados inválidos';
         return { success: false as const, error: zodMessage };
       }
       return { success: false as const, error: getErrorMessage(error) };
     }
     ```

     This preserves existing behavior when `customMessage` is omitted.
     When provided and error contains ZodError details, uses custom message.

  **Must NOT do**:
  - Do not add overloads or success-case handlers
  - Do not rename existing function signature
  - Do not change call sites unnecessarily

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2-5)
  - Blocks: None
  - Blocked By: Task 1

  **References**:
  - `src/lib/error.ts:27-32` — handleActionError current implementation
  - `src/lib/error.ts:10-18` — getZodError helper (used in new logic)
  - `src/lib/actions/treinos.ts:149-152` — call site with generic message

  **Acceptance Criteria**:
  - [ ] `handleActionError(zodError)` with no customMessage returns 'Dados inválidos' (backward compat)
  - [ ] `handleActionError(zodError, 'Custom message')` returns custom message
  - [ ] `handleActionError(nonZodError)` returns `getErrorMessage(error)` (unchanged)

  **QA Scenarios**:

  ```
  Scenario: Backward compat (no customMessage)
    Tool: Bash
    Steps:
      1. Run vitest test: handleActionError with ZodError, no customMessage
    Expected Result: Returns 'Dados inválidos'
    Evidence: .sisyphus/evidence/task6-default.txt

  Scenario: Custom message
    Steps:
      1. Run vitest test: handleActionError with ZodError, customMessage='Custom error'
    Expected Result: Returns 'Custom error'
    Evidence: .sisyphus/evidence/task6-custom.txt
  ```

  **Commit**: YES
  - Message: `fix(utils): add optional customMessage param to handleActionError`
  - Files: `src/lib/error.ts`

- [ ] 7. Fix logger unsafe type casts (Fixes #11 MEDIUM)

  **What to do**:
  1. In `src/lib/logger.ts`, replace all 3 `as Record<string, unknown>` casts with a safe helper:

     Add a private static helper method:

     ```typescript
     private static toRecord(value: unknown): Record<string, unknown> {
       if (typeof value !== 'object' || value === null) return {};
       // Handle Error objects whose properties are non-enumerable
       if (value instanceof Error) {
         return {
           message: value.message,
           name: value.name,
           stack: value.stack,
           ...Object.fromEntries(
             Object.entries(value).filter(([k]) => k !== 'message' && k !== 'name' && k !== 'stack')
           ),
         };
       }
       // Use structuredClone for plain objects, with fallback
       try {
         return structuredClone(value) as Record<string, unknown>;
       } catch {
         // Fallback: copy enumerable properties safely
         try {
           return JSON.parse(JSON.stringify(value));
         } catch {
           return Object.fromEntries(
             Object.entries(value as Record<string, unknown>).map(([k, v]) => [
               k,
               typeof v === 'object' ? String(v) : v,
             ])
           );
         }
       }
     }
     ```

  2. Replace 3 occurrences:
     - Line 21: `(context as Record<string, unknown>)` → `this.toRecord(context)`
     - Line 33: `(context as Record<string, unknown>)` → `this.toRecord(context)`
     - Line 46: `(error as Record<string, unknown>)` → `this.toRecord(error)`

  **What to test**:
  - Error enumerable properties (message, name, stack) are captured
  - Circular object doesn't throw
  - null/undefined/string/numbers don't throw
  - Plain objects serialize normally

  **Must NOT do**:
  - Do not restructure Logger class
  - Do not add winston/pino
  - Do not change public API

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2-6)
  - Blocks: None
  - Blocked By: Task 1

  **References**:
  - `src/lib/logger.ts:21` — `(context as Record<string, unknown>)` in info()
  - `src/lib/logger.ts:33` — `(context as Record<string, unknown>)` in warn()
  - `src/lib/logger.ts:46` — `(error as Record<string, unknown>)` in error()

  **Acceptance Criteria**:
  - [ ] No `as Record<string, unknown>` casts remain in logger.ts
  - [ ] Error properties (message, name, stack) preserved in Sentry breadcrumb
  - [ ] Circular objects don't throw
  - [ ] `npm run test` passes

  **QA Scenarios**:

  ```
  Scenario: No unsafe casts remain
    Tool: Bash
    Steps:
      1. Run: grep -n 'as Record<string, unknown>' src/lib/logger.ts
    Expected Result: 0 matches
    Evidence: .sisyphus/evidence/task7-nocasts.txt

  Scenario: Circular object safety
    Tool: Bash
    Steps:
      1. Create a one-off test with circular object: const a: any = { b: 1 }; a.self = a;
      2. Call Logger.info('test', a)
    Expected Result: No throw
  ```

  **Commit**: YES
  - Message: `fix(utils): replace unsafe type casts in logger with safe helper`
  - Files: `src/lib/logger.ts`

- [ ] 8. Delete empty placeholder-images files (Fixes #12-13 LOW)

  **What to do**:
  1. Verify zero imports reference these files (already done in Task 1, confirm again):
     ```bash
     grep -r 'placeholder-images' src/ --include='*.{ts,tsx,js,json}'
     ```
  2. Delete the files:
     - `src/lib/placeholder-images.ts` (0 lines, empty)
     - `src/lib/placeholder-images.json` (orphaned companion)
  3. Check if any git-tracked: `git ls-files src/lib/placeholder-images.*`
  4. If tracked, `git rm` them; if untracked, just delete

  **Must NOT do**:
  - Do not delete any other files
  - Do not modify any other files
  - Do not create replacement files

  **Recommended Agent Profile**:
  - Category: `quick` — simple file deletion
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2-7)
  - Blocks: None
  - Blocked By: Task 1 (grep verification done there)

  **References**:
  - `src/lib/placeholder-images.ts` — 0 lines, empty file
  - `src/lib/placeholder-images.json` — orphaned companion

  **Acceptance Criteria**:
  - [ ] grep for `placeholder-images` returns 0 results
  - [ ] Both files no longer exist on filesystem
  - [ ] No compilation errors from deletion

  **QA Scenarios**:

  ```
  Scenario: Files deleted
    Tool: Bash
    Steps:
      1. ls src/lib/placeholder-images.*
    Expected Result: "No such file or directory"
    Evidence: .sisyphus/evidence/task8-deleted.txt

  Scenario: No imports broken
    Steps:
      1. grep -r 'placeholder-images' src/ --include='*.{ts,tsx,js,json}'
    Expected Result: 0 results
    Evidence: .sisyphus/evidence/task8-imports.txt
  ```

  **Commit**: YES
  - Message: `chore: remove empty placeholder-images.ts and orphan .json`
  - Files: `src/lib/placeholder-images.ts`, `src/lib/placeholder-images.json`

- [ ] 9. Rename misleading growth projection constants (Fixes #14 LOW)

  **What to do**:
  1. In `src/lib/data.ts`, rename:
     - Line 124: `STREAK_MULTIPLIER` → `GROWTH_BASE_FACTOR`
     - Line 124: comment up top — update to clarify these are growth projection factors, not streak-related
     - Line 125: `BONUS_THRESHOLD` → `GROWTH_INCREMENT`
  2. Verify no other files reference old names (task 1 grep already done)
  3. Update any test files referencing old constants

  **Must NOT do**:
  - Do not change calculated values (keep 0.7 and 0.05)
  - Do not refactor the growth projection logic
  - Do not extract additional constants

  **Recommended Agent Profile**:
  - Category: `quick`
  - Skills: `[]`

  **Parallelization**:
  - Can Run In Parallel: YES (Wave 1, with tasks 2-8)
  - Blocks: None
  - Blocked By: Task 1

  **References**:
  - `src/lib/data.ts:124-125` — const STREAK_MULTIPLIER = 0.7, const BONUS_THRESHOLD = 0.05
  - `src/lib/data.ts:129` — usage in `crescimentoAnual` map function

  **Acceptance Criteria**:
  - [ ] grep for `STREAK_MULTIPLIER` returns 0 results
  - [ ] grep for `BONUS_THRESHOLD` returns 0 results
  - [ ] `GROWTH_BASE_FACTOR` and `GROWTH_INCREMENT` exist in data.ts
  - [ ] Calculated values unchanged (0.7 and 0.05)

  **QA Scenarios**:

  ```
  Scenario: Old names removed
    Tool: Bash
    Steps:
      1. grep -rn 'STREAK_MULTIPLIER\|BONUS_THRESHOLD' src/ --include='*.{ts,tsx}'
    Expected Result: 0 matches
    Evidence: .sisyphus/evidence/task9-old-names.txt

  Scenario: New names present
    Steps:
      1. grep -n 'GROWTH_BASE_FACTOR\|GROWTH_INCREMENT' src/lib/data.ts
    Expected Result: 2 matches with correct values
    Evidence: .sisyphus/evidence/task9-new-names.txt
  ```

  **Commit**: YES
  - Message: `refactor(data): rename misleading growth projection constants`
  - Files: `src/lib/data.ts`

- [ ] F1. Plan Compliance Audit — Verify 15 issues fixed, 8 commits match plan, Must Have satisfied, Must NOT Have not violated
- [ ] F2. Code Quality — `npm run typecheck` passes, `npm run test` passes, `npm run lint` passes
- [ ] F3. Real Manual QA — Execute every QA scenario from every task, capture evidence
- [ ] F4. Scope Fidelity — 1:1 check: only 15 issues fixed, no scope creep

---

## Commit Strategy

| #   | Message                                                             | Files                                              |
| --- | ------------------------------------------------------------------- | -------------------------------------------------- |
| 1   | `fix(db): add generic type params to dummyDb methods`               | `dummyDb.ts`, `alunoService.ts`                    |
| 2   | `fix(components): add type params to row.getValue() calls`          | `columns.tsx`                                      |
| 3   | `fix(ai): type-narrow Genkit streaming output via schema`           | `workout-generator-flow.ts`                        |
| 4   | `fix(i18n): map legacy 'pt-BR' locale to 'pt' language`             | `i18n-provider.tsx`                                |
| 5   | `fix(utils): add optional customMessage param to handleActionError` | `error.ts`                                         |
| 6   | `fix(utils): replace unsafe type casts in logger with safe helper`  | `logger.ts`                                        |
| 7   | `chore: remove empty placeholder-images.ts and orphan .json`        | `placeholder-images.ts`, `placeholder-images.json` |
| 8   | `refactor(data): rename misleading growth projection constants`     | `data.ts`                                          |

---

## Success Criteria

### Verification Commands

```bash
npm run typecheck  # Expected: 0 errors
npm run test       # Expected: 66+ tests passing
npm run lint       # Expected: 0 warnings
grep -r 'placeholder-images' src/ --include='*.{ts,tsx,js,json}'  # Expected: 0 results
grep -r 'STREAK_MULTIPLIER\|BONUS_THRESHOLD' src/ --include='*.{ts,tsx}'  # Expected: 0 results
```

### Final Checklist

- [ ] All 15 issues fixed
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run lint` passes
- [ ] No behavioral changes
- [ ] No scope creep
- [ ] Evidence saved to `.sisyphus/evidence/`
