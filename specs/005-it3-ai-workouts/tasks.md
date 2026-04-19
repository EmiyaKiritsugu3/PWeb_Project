# Tasks: It3 — AI Workout Integration & E2E Coverage

**Input**: `specs/005-it3-ai-workouts/plan.md` + `spec.md`
**Branch**: `feat/005-it3-ai-workouts`
**Total tasks**: 9 | **Parallel opportunities**: 2 (T004, T005)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Baseline Gates)

**Purpose**: Confirm clean baseline before any change.

- [x] T001 Run `npm run lint && npm run typecheck && npm run test && npm run e2e` from repo root and confirm 0 errors, 15/15 E2E passing — establishes baseline

---

## Phase 2: Foundational (Seed Extension)

**Purpose**: E2E tests for workout session require at least 1 `Treino` seeded for the ALUNO user.
Without this, T005 has no workout to start.

**⚠️ CRITICAL**: T005 depends on this phase being complete.

- [x] T002 Extend `prisma/seed-e2e.ts` — after ALUNO user creation, create 1 `Treino` record (objetivo: "Treino E2E", diaSemana: 1) with 2 `Exercicio` rows (e.g. "Supino Reto": 3×10-12, "Crucifixo": 3×12-15) linked to the ALUNO fixed UUID and INSTRUTOR fixed UUID | verify: `npm run seed:e2e` runs without error and treino appears in DB

**Checkpoint**: Seed ready — E2E workout test can now be implemented.

---

## Phase 3: US06 — Feedback Motivacional (Priority: P1)

**Goal**: After completing a workout, the student sees an AI-generated feedback card with title and motivational message.

**Independent Test**: Start dev server, log in as ALUNO, open a workout in `/aluno/meus-treinos`, mark exercises done, click "Finalizar Treino" — a feedback card with title and message must appear. If AI is unavailable, a fallback message must still appear.

### Constitution Gate (Principle III)

Unit test MUST be written (T003) before the implementation (T004).

- [x] T003 Create `src/ai/flows/workout-feedback-flow.test.ts` — mock `generateWorkoutFeedback` to resolve with `{ title: "Parabéns!", message: "Ótimo treino." }` and verify the feedback state updates correctly; mock it to reject and verify feedback state shows fallback; use `vi.mock('@/ai/flows/workout-feedback-flow')` | verify: `npm run test` — new test file passes

- [x] T004 [P] [US06] Modify `src/components/WorkoutSession.tsx` — (a) import `generateWorkoutFeedback` and `type WorkoutFeedbackOutput` from `@/ai/flows/workout-feedback-flow`; (b) add state `const [feedback, setFeedback] = useState<WorkoutFeedbackOutput | null>(null)`; (c) after `registrarHistoricoTreinoAction` resolves successfully, call `generateWorkoutFeedback` inside try/catch with `{ goal: treino.objetivo, completedExercises: [...], totalExercises: treino.Exercicios.length }` and `setFeedback(result)`; (d) if catch, set fallback `{ title: "Treino Concluído!", message: "Continue assim!" }`; (e) render a `<Card>` below the completion summary with `feedback.title` and `feedback.message` when `feedback !== null` | verify: T003 passes, manual test shows feedback card

---

## Phase 4: E2E — Workout Session Completion (Priority: P1)

**Goal**: Playwright test that covers ALUNO starting a workout, completing exercises, finishing, and verifying XP updated on dashboard.

**Independent Test**: `npm run e2e -- --grep "workout session"` passes.

- [x] T005 [US-E2E] Create `tests/e2e/specs/workout-session.spec.ts` — test: (1) loginAs(page, 'ALUNO'); (2) goto `/aluno/meus-treinos`; (3) click "Iniciar Treino" on the seeded treino (expect button with text "Iniciar" or "Play"); (4) for each exercise in the session, mark series as done (click checkboxes or concluir buttons); (5) click "Finalizar Treino"; (6) wait for feedback card to appear (data-testid="workout-feedback-card" or text "Treino Concluído"); (7) goto `/aluno/dashboard`; (8) expect XP badge to be visible and contain a number > 0 | verify: `npm run e2e -- --grep "workout"` passes

---

## Phase 5: E2E — Student Enrollment Flow (Priority: P1)

**Goal**: Playwright test that covers GERENTE creating a new aluno via the dashboard form and verifying it appears in the student list.

**Independent Test**: `npm run e2e -- --grep "enrollment"` passes.

- [x] T006 [P] [US-E2E] Create `tests/e2e/specs/enrollment.spec.ts` — test: (1) loginAs(page, 'GERENTE'); (2) goto `/dashboard/alunos`; (3) click "Novo Aluno" or equivalent button to open enrollment form; (4) fill form: nomeCompleto = `"Aluno E2E ${Date.now()}"`, email = `"e2e+${Date.now()}@test.com"`, password = "Senha123!", planoId = first available plan; (5) submit form; (6) expect success toast or confirmation; (7) expect new aluno name to appear in the student list | verify: `npm run e2e -- --grep "enrollment"` passes

---

## Phase 6: Polish & Documentation

**Purpose**: Update documentation to reflect new coverage, run full quality gate suite.

- [x] T007 Add `data-testid="workout-feedback-card"` attribute to the feedback card rendered in `src/components/WorkoutSession.tsx` — required for T005 selector stability | verify: attribute present in rendered DOM (check with browser devtools or `grep`)

- [x] T008 Update `tests/e2e/CRITICAL-PATHS.md` — move "Workout session completion" and "Student enrollment flow" from "Pending" to "Coverage Table" with ✅ status; update total count from 15 to 17; add `workout-session.spec.ts` and `enrollment.spec.ts` to the file column | verify: file reflects 17 covered scenarios

- [x] T009 Run full quality gate suite: `npm run lint && npm run typecheck && npm run test && npm run e2e` — confirm 0 errors, 0 lint errors, all unit tests pass, 17/17 E2E passing | verify: all 4 gates green

---

## Dependencies

```
T001 (baseline) → T002 (seed) → T005 (workout E2E)
T001 (baseline) → T003 (unit test) → T004 (component) → T007 (testid) → T005
T001 (baseline) → T006 (enrollment E2E)
T004, T005, T006, T007 → T008 (docs) → T009 (final gates)
```

## Parallel Opportunities

- **T004 + T006**: Independent files (`WorkoutSession.tsx` vs `enrollment.spec.ts`) — can run in parallel after T003 and T002 complete respectively.
- **T003 + T002**: Independent (unit test vs seed extension) — can run in parallel after T001.

## Implementation Strategy (MVP First)

1. **MVP** (T001–T004 + T007): US06 feedback integration — student sees AI response after workout
2. **E2E Expansion** (T002 + T005 + T006): Cover the two P1 pending paths
3. **Polish** (T008–T009): Docs + final gate confirmation
