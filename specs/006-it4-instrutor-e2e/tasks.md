# Tasks: It4 — INSTRUTOR Workflow E2E Coverage

**Input**: Design documents from `/specs/006-it4-instrutor-e2e/`
**Branch**: `feat/006-it4-instrutor-e2e`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- No new unit tests required (no new business logic per spec)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm clean baseline before adding new E2E spec.

- [ ] T001 Verify baseline quality gates pass — run `npm run lint && npm run typecheck && npm test` and confirm 0 errors / 22/22 tests

---

## Phase 2: Foundational (Blocking — verify seed ALUNO name)

**Purpose**: Confirm the seeded ALUNO's `nomeCompleto` so selectors in the E2E spec use the correct name.

- [ ] T002 Confirm ALUNO seed name — read `prisma/seed-e2e.ts` and extract the `nomeCompleto` of the ALUNO user (`id: 00000000-0000-0000-0000-000000000004`) to use in Playwright `getByRole('option', { name: ... })`

---

## Phase 3: US01 — INSTRUTOR assigns workout → ALUNO sees "Do Personal"

**Story goal**: INSTRUTOR logs in, creates a manual treino for the seeded ALUNO, then ALUNO session asserts the treino appears in `meus-treinos` with "Do Personal" badge.

**Independent test criteria**: `npm run e2e -- --grep "INSTRUTOR"` passes with 1 new test (18/18 total).

- [ ] T003 [US1] Write E2E spec in `tests/e2e/specs/instrutor-workflow.spec.ts` — implement the full cross-session flow per `quickstart.md`:
  1. `loginAs(page, 'INSTRUTOR')` → navigate to `/dashboard/treinos`
  2. Click Shadcn Select trigger (`getByRole('combobox')`) → wait for option → click ALUNO by name
  3. Fill `objetivo` input with unique value (e.g. `Hipertrofia E2E It4`)
  4. Click "Adicionar Exercício" → interact with exercise Combobox → select first option
  5. Click "Salvar Treino" → assert success (toast or dialog closes)
  6. `await logout(page)` → `loginAs(page, 'ALUNO')`
  7. Navigate to `/aluno/meus-treinos`
  8. Assert card containing "Hipertrofia E2E It4" is visible
  9. Assert `page.getByText('Do Personal')` is visible within that card

- [ ] T004 [P] [US1] Update `tests/e2e/CRITICAL-PATHS.md` — add row 18 for "INSTRUTOR assigns workout → ALUNO sees Do Personal badge"; move from Pending table to Coverage Table; update total from 17 → 18

---

## Phase 4: Polish & Validation

**Purpose**: Confirm all gates pass with the new test included.

- [ ] T005 Run full E2E suite locally — `npm run supabase:start && npm run seed:e2e && npm run e2e` — confirm 18/18 pass; fix any selector failures using patterns from `tests/e2e/CRITICAL-PATHS.md` (Lessons Learned)
- [ ] T006 Run quality gates — `npm run lint && npm run typecheck && npm test` — confirm 0 errors / 22/22 unit tests still pass
- [ ] T007 [P] Update `docs/CURRENT-STATE.md` — bump E2E count from 17 → 18, add It4 progress table, update version header
- [ ] T008 [P] Update `CHANGELOG.md` — add `[Unreleased]` section for It4 with Added entry for `instrutor-workflow.spec.ts`

---

## Dependencies

```text
T001 (baseline) → T002 (seed verification) → T003 (E2E spec) → T005 (local E2E run) → T006 (quality gates)
T004 (CRITICAL-PATHS update) can run in parallel with T003
T007, T008 (docs) can run in parallel after T005 + T006 pass
```

## Parallel Execution

```text
Phase 3 parallelism:
  T003 (write spec) ──┐
  T004 (update docs)  ┘── both target different files, no deps on each other

Phase 4 parallelism:
  T007 (CURRENT-STATE) ──┐
  T008 (CHANGELOG)        ┘── independent doc files
```

## Implementation Strategy (MVP)

1. **MVP = T001 + T002 + T003**: Baseline check + seed verification + E2E spec written and passing locally.
2. **Done = T004 + T005 + T006 + T007 + T008**: All gates green + docs updated.

## Scale / Scope

- **Total tasks**: 8
- **US01 tasks**: 2 (T003, T004)
- **Parallel opportunities**: 3 pairs
- **New files**: 1 (`instrutor-workflow.spec.ts`)
- **Modified files**: 3 (`CRITICAL-PATHS.md`, `CURRENT-STATE.md`, `CHANGELOG.md`)
