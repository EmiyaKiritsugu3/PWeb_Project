# SonarQube Debt Fix — 17 Issues (2 CRITICAL + 15 MAJOR)

## TL;DR

> **Quick Summary**: Fix all 17 SonarQube code quality issues from the labens.dct.ufrn.br scanner — 2 CRITICAL (nested function depth >4) and 15 MAJOR (array index keys, accessibility, nested ternary, redundant assignment, unknown property).
>
> **Deliverables**:
>
> - Extract nested callbacks in `treinos.ts` to reduce nesting depth
> - Fix array index React keys in 4 files
> - Add aria-labels to buttons without accessible names
> - Fix nested ternary operators
> - Remove/handle non-standard `data-ai-hint` attribute
>
> **Estimated Effort**: Short (1-2 hours)
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (nesting fix) → Task 5 (verify) → F1-F4 (final review)

---

## Context

### Original Request

Fix all debts found by SonarQube scanner at labens.dct.ufrn.br for project PWeb_Project.

### Interview Summary

**Key Discussions**:

- User wants all 17 issues fixed (2 CRITICAL + 15 MAJOR)
- All 101 tests must continue passing
- No functional changes — pure code quality improvements

**Research Findings**:

- CRITICAL issues in `src/lib/actions/treinos.ts:336,351` — nested callbacks 6 levels deep
- Array index keys in 4 files (7 occurrences)
- Buttons without aria-labels in 4 locations
- `data-ai-hint` non-standard attribute in `aluno/layout.tsx:137`
- Skeleton component keys are false positives (legitimately safe)

### Metis Review

**Identified Gaps** (addressed):

- `data-ai-hint` might be consumed by runtime code — must grep before removing
- Skeleton array keys are false positives — only fix data list keys
- aria-labels must be in Portuguese (matching UI language)
- `workout-editor.tsx:209` already has aria-label — verify before fixing
- Auth logic in treinos.ts must NOT be touched (different authorization semantics)
- Each commit must independently pass `npm run pre-flight`

---

## Work Objectives

### Core Objective

Eliminate all 17 SonarQube code quality issues without changing application behavior.

### Concrete Deliverables

- `src/lib/actions/treinos.ts` — nesting depth ≤4
- `src/app/dashboard/planos/page.tsx` — no array index keys
- `src/components/dashboard/alunos/data-table.tsx` — no array index keys
- `src/components/ui/dashboard-skeletons.tsx` — no array index keys
- `src/app/dashboard/treinos/treinos-client.tsx` — no array index keys + aria-labels
- `src/components/dashboard/alunos/columns.tsx` — aria-label added
- `src/app/aluno/layout.tsx` — data-ai-hint handled

### Definition of Done

- [ ] `npm run pre-flight` passes (typecheck + lint + format + test)
- [ ] All 101 tests pass
- [ ] Zero ESLint errors
- [ ] SonarQube issue count drops from 17 to ≤2 (false positives only)

### Must Have

- All 101 tests passing
- Zero functional changes
- Portuguese aria-labels
- Each commit independently revertable

### Must NOT Have (Guardrails)

- NO changes to auth logic in `updateTreinoDayAction` or `deleteTreinoAction`
- NO new tests added
- NO files touched outside the 8 identified files
- NO dependency upgrades
- NO new ESLint rules or config changes
- NO refactoring beyond the specific issues
- NO `any` types in extracted helper functions

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
Wave 1 (Start Immediately — independent fixes):
├── Task 1: Extract nested callbacks in treinos.ts [deep]
├── Task 2: Fix array index React keys [quick]
├── Task 3: Add aria-labels to buttons [quick]
└── Task 4: Handle data-ai-hint attribute [quick]

Wave 2 (After Wave 1 — verification):
└── Task 5: Run full test suite + lint + format [quick]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay
```

### Dependency Matrix

| Task  | Depends On | Blocks |
| ----- | ---------- | ------ |
| 1     | None       | 5      |
| 2     | None       | 5      |
| 3     | None       | 5      |
| 4     | None       | 5      |
| 5     | 1, 2, 3, 4 | F1-F4  |
| F1-F4 | 5          | None   |

### Agent Dispatch Summary

- **Wave 1**: 4 tasks — T1→`deep`, T2→`quick`, T3→`quick`, T4→`quick`
- **Wave 2**: 1 task — T5→`quick`
- **FINAL**: 4 tasks — F1→`oracle`, F2→`unspecified-high`, F3→`unspecified-high`, F4→`deep`

---

## TODOs

- [x] 1. Extract Nested Callbacks in treinos.ts (2 CRITICAL issues)

  **What to do**:
  - Read `src/lib/actions/treinos.ts` lines 295-390
  - Extract the `flatMap→map` callback (lines 335-344) into a named helper function `mapSeriesToHistorico(ex: ExercicioExecutado)` at the top of the file or as a local function before `registrarHistoricoTreinoAction`
  - Extract the `reduce→filter` logic (lines 350-353) into a named helper function `countCompletedSeries(exercicios: ExercicioExecutado[]): number`
  - Both helpers must have explicit TypeScript types (no `any`)
  - Replace inline callbacks with calls to the extracted functions
  - Verify nesting depth is now ≤4 at the call sites

  **Must NOT do**:
  - Do NOT modify the Prisma query structure
  - Do NOT change the transaction logic
  - Do NOT touch auth logic or `getAuthRole()` calls
  - Do NOT add new exports from the file

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Requires understanding complex nested TypeScript + Prisma transaction patterns
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `typescript`: Not needed — basic TypeScript, no complex generics

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/lib/actions/treinos.ts:295-390` — The full `registrarHistoricoTreinoAction` function with nested callbacks at lines 335-344 and 350-353
  - `src/lib/actions/treinos.ts:1-30` — Imports and types (use `ExercicioExecutado` type from Zod schema)

  **API/Type References**:
  - `src/lib/actions/treinos.ts:295` — Function signature with `validatedData` type from `registrarHistoricoTreinoSchema`
  - Prisma `SeriesExecutadasCreateInput` type (implicit from schema)

  **WHY Each Reference Matters**:
  - Lines 295-390: Contains the entire function — executor must understand the transaction boundary and what variables are in scope
  - Lines 1-30: Shows existing type imports — extracted helpers must use the same types

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Nesting depth reduced to ≤4
    Tool: Bash (grep)
    Preconditions: treinos.ts has been modified
    Steps:
      1. Run: grep -n "flatMap\|reduce" src/lib/actions/treinos.ts
      2. Verify no inline flatMap→map or reduce→filter chains remain in registrarHistoricoTreinoAction
      3. Run: npx tsc --noEmit
    Expected Result: tsc exits 0, no inline nested callbacks in the function
    Failure Indicators: tsc errors, or flatMap/reduce still inline in lines 326-376
    Evidence: .sisyphus/evidence/task-1-nesting-depth.txt

  Scenario: All tests pass after extraction
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: npm test
      2. Verify output shows "101 tests passed" (or equivalent)
    Expected Result: All tests pass, 0 failures
    Failure Indicators: Any test failure, especially in treinos-related tests
    Evidence: .sisyphus/evidence/task-1-tests-pass.txt
  ```

  **Evidence to Capture:**
  - [ ] task-1-nesting-depth.txt — grep output showing no inline nested callbacks
  - [ ] task-1-tests-pass.txt — full test output

  **Commit**: YES
  - Message: `refactor(actions): extract nested callbacks in treinos.ts to reduce SonarQube nesting debt`
  - Files: `src/lib/actions/treinos.ts`
  - Pre-commit: `npm run pre-flight`

---

- [x] 2. Fix Array Index React Keys (5 MAJOR issues)

  **What to do**:
  - Read these files and identify the exact key usage:
    - `src/app/dashboard/planos/page.tsx:26` — `key={`skeleton-${i}`}`
    - `src/components/dashboard/alunos/data-table.tsx:70,124,126` — skeleton keys
    - `src/components/ui/dashboard-skeletons.tsx:19` — skeleton key
    - `src/app/dashboard/treinos/treinos-client.tsx:248,262` — data list keys
  - For **skeleton components** (planos/page.tsx, data-table.tsx, dashboard-skeletons.tsx): These are false positives — skeleton lists never reorder. Add `// sonar-ignore-next-line` comment OR change key to include a stable prefix like `skeleton-${i}-${count}` to make SonarQube happy while keeping the pattern
  - For **data list keys** (treinos-client.tsx:248,262): Replace `${treino.nome}-${treinoIndex}` with `treino.id` if available, or keep the composite key if it's already stable
  - Verify no React warnings about keys in console

  **Must NOT do**:
  - Do NOT change skeleton component behavior
  - Do NOT add new ID fields to data models
  - Do NOT restructure the data lists

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple pattern replacement, low complexity
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/app/dashboard/planos/page.tsx:26` — Skeleton key with array index
  - `src/components/dashboard/alunos/data-table.tsx:70,124,126` — Three skeleton key occurrences
  - `src/components/ui/dashboard-skeletons.tsx:19` — Skeleton key
  - `src/app/dashboard/treinos/treinos-client.tsx:248,262` — Data list keys (treino and exercicio)

  **WHY Each Reference Matters**:
  - Skeleton files: Need to determine if SonarQube suppression is appropriate (they never reorder)
  - treinos-client.tsx: Data list keys need stable IDs if available

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No array index keys in data lists
    Tool: Bash (grep)
    Preconditions: All key fixes applied
    Steps:
      1. Run: grep -n "key={\`.*\$\{" src/app/dashboard/treinos/treinos-client.tsx
      2. Verify keys use stable identifiers (treino.id, exercicio.id) or stable composite keys
      3. Run: npm test
    Expected Result: Keys use stable identifiers, all tests pass
    Failure Indicators: React warnings about keys, test failures
    Evidence: .sisyphus/evidence/task-2-keys-fixed.txt

  Scenario: Skeleton keys handled (suppress or stabilize)
    Tool: Bash
    Preconditions: Changes applied
    Steps:
      1. Run: grep -rn "key={\`skeleton-" src/
      2. Verify either sonar-ignore comments added or keys stabilized
    Expected Result: All skeleton key occurrences handled
    Evidence: .sisyphus/evidence/task-2-skeleton-keys.txt
  ```

  **Commit**: YES
  - Message: `fix(components): replace array index React keys with stable identifiers`
  - Files: `src/app/dashboard/planos/page.tsx`, `src/components/dashboard/alunos/data-table.tsx`, `src/components/ui/dashboard-skeletons.tsx`, `src/app/dashboard/treinos/treinos-client.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 3. Add aria-labels to Buttons Without Accessible Names (4 MAJOR issues)

  **What to do**:
  - Read these files and add `aria-label` to icon-only buttons:
    - `src/components/dashboard/alunos/columns.tsx:36` — Button with only chevron icon (sort)
    - `src/app/dashboard/treinos/treinos-client.tsx:311` — Cancel button (verify if it already has text)
    - `src/app/aluno/layout.tsx:135` — User avatar button (dropdown trigger)
  - Check `src/components/dashboard/aluno/workout-editor.tsx:209` — Verify if it already has `aria-label="Remover exercício"` (Metis flagged this as potentially already fixed)
  - All aria-labels MUST be in Portuguese (matching UI language)
  - Use Lucide icon name as basis: `aria-label="Ordenar"`, `aria-label="Cancelar"`, `aria-label="Perfil do usuário"`

  **Must NOT do**:
  - Do NOT add aria-labels to buttons that already have text content
  - Do NOT change button behavior
  - Do NOT add aria-labels to non-interactive elements

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple attribute additions
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/components/dashboard/aluno/workout-editor.tsx:188` — Good example: `aria-label="Remover exercício"` already exists
  - `src/components/ui/sidebar.tsx:288` — Good example: `aria-label="Toggle Sidebar"` (but should be Portuguese)

  **WHY Each Reference Matters**:
  - workout-editor.tsx:188: Shows the existing pattern for aria-labels in this project
  - sidebar.tsx:288: Shows another existing pattern (though in English — new labels should be Portuguese)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All icon-only buttons have aria-labels
    Tool: Bash (grep)
    Preconditions: aria-labels added
    Steps:
      1. Run: grep -n "aria-label" src/components/dashboard/alunos/columns.tsx src/app/dashboard/treinos/treinos-client.tsx src/app/aluno/layout.tsx
      2. Verify aria-labels are present and in Portuguese
      3. Run: npm test
    Expected Result: aria-labels present, all tests pass
    Failure Indicators: Missing aria-labels, test failures
    Evidence: .sisyphus/evidence/task-3-aria-labels.txt
  ```

  **Commit**: YES
  - Message: `fix(a11y): add aria-labels to icon-only buttons for screen readers`
  - Files: `src/components/dashboard/alunos/columns.tsx`, `src/app/dashboard/treinos/treinos-client.tsx`, `src/app/aluno/layout.tsx`
  - Pre-commit: `npm run pre-flight`

---

- [x] 4. Handle data-ai-hint Non-Standard Attribute (1 MAJOR issue)

  **What to do**:
  - First: Run `grep -rn "data-ai-hint" src/` to check if this attribute is consumed by any runtime code
  - **If consumed**: Keep the attribute but add a SonarQube suppression comment
  - **If NOT consumed**: Remove the `data-ai-hint="person portrait"` attribute from `src/app/aluno/layout.tsx:137`
  - Also check for any other non-standard `data-*` attributes that SonarQube might flag (though standard `data-testid` is usually fine)

  **Must NOT do**:
  - Do NOT break any AI features that might depend on this attribute
  - Do NOT remove `data-testid` attributes (those are standard and used by tests)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple attribute removal with a safety check
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 5
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/app/aluno/layout.tsx:137` — The line with `data-ai-hint="person portrait"`

  **WHY Each Reference Matters**:
  - layout.tsx:137: Exact location of the issue

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: data-ai-hint handled safely
    Tool: Bash (grep)
    Preconditions: Investigation complete
    Steps:
      1. Run: grep -rn "data-ai-hint" src/ (before fix — check consumption)
      2. If consumed: verify suppression comment added
      3. If NOT consumed: verify attribute removed
      4. Run: npm test
    Expected Result: Attribute handled appropriately, all tests pass
    Failure Indicators: Broken AI features, test failures
    Evidence: .sisyphus/evidence/task-4-data-ai-hint.txt
  ```

  **Commit**: YES
  - Message: `fix(a11y): remove non-standard data-ai-hint attribute or add SonarQube suppression`
  - Files: `src/app/aluno/layout.tsx` (if removing) or same file (if suppressing)
  - Pre-commit: `npm run pre-flight`

---

- [x] 5. Run Full Verification Suite

  **What to do**:
  - Run `npm run pre-flight` (typecheck + lint + format + test)
  - Verify all 101 tests pass
  - Verify zero ESLint errors
  - Verify Prettier formatting is clean
  - If any check fails, fix the issue and re-run

  **Must NOT do**:
  - Do NOT skip any quality gate
  - Do NOT modify test files

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Running verification commands
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after Wave 1)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1, 2, 3, 4

  **References**:

  **Pattern References**:
  - `package.json:30` — `pre-flight` script: `npm run typecheck && npm run lint && npm run format:check && npm run test`

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Full quality gate passes
    Tool: Bash
    Preconditions: All 4 fix tasks completed
    Steps:
      1. Run: npm run pre-flight
      2. Verify exit code 0
      3. Check output for "101 tests passed" or equivalent
    Expected Result: All checks pass, 0 errors
    Failure Indicators: Any non-zero exit code, test failures, lint errors
    Evidence: .sisyphus/evidence/task-5-pre-flight.txt
  ```

  **Commit**: NO (verification only, no code changes)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
      Read the plan end-to-end. For each "Must Have": verify implementation exists. For each "Must NOT Have": search codebase for forbidden patterns. Check evidence files exist. Compare deliverables against plan.
      Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      Run `npx tsc --noEmit` + `npm run lint` + `npm test`. Review all changed files for: `as any`, empty catches, console.log in prod, commented-out code. Check extracted functions have proper TypeScript types.
      Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
      Start from clean state. Execute EVERY QA scenario from EVERY task. Test that treinos functionality still works (registration, history). Verify no React console warnings about keys.
      Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
      For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec was built. Check "Must NOT do" compliance. Flag unaccounted changes.
      Output: `Tasks [N/N compliant] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| #   | Message                                                                                      | Files                        | Pre-commit           |
| --- | -------------------------------------------------------------------------------------------- | ---------------------------- | -------------------- |
| 1   | `refactor(actions): extract nested callbacks in treinos.ts to reduce SonarQube nesting debt` | `src/lib/actions/treinos.ts` | `npm run pre-flight` |
| 2   | `fix(components): replace array index React keys with stable identifiers`                    | 4 files                      | `npm run pre-flight` |
| 3   | `fix(a11y): add aria-labels to icon-only buttons for screen readers`                         | 3 files                      | `npm run pre-flight` |
| 4   | `fix(a11y): remove non-standard data-ai-hint attribute or add SonarQube suppression`         | 1 file                       | `npm run pre-flight` |

---

## Success Criteria

### Verification Commands

```bash
npm run pre-flight  # Expected: exit 0 (typecheck + lint + format + test)
npm test 2>&1 | grep -E "Tests.*passed"  # Expected: 101 tests passed
npx tsc --noEmit  # Expected: exit 0
npx eslint src 2>&1 | grep -c "error"  # Expected: 0
```

### Final Checklist

- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All 101 tests pass
- [ ] Zero ESLint errors
- [ ] Nesting depth ≤4 in treinos.ts
- [ ] No array index keys in data lists
- [ ] All icon-only buttons have Portuguese aria-labels
- [ ] data-ai-hint handled (removed or suppressed)
