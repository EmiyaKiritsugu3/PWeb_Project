# Spec: It3 — AI Workout Integration & E2E Coverage

**Branch**: `feat/005-it3-ai-workouts`
**Iteration**: It3 (May 09 – May 29, 2026)
**User Stories**: US06 (primary) + E2E gaps from CRITICAL-PATHS.md

## Problem Statement

It2 delivered the AI workout infrastructure (Genkit flows, gamification logic, student portal),
but two integration gaps remain:

1. **US06 – Feedback Motivacional**: `workout-feedback-flow.ts` exists and is tested in isolation,
   but `WorkoutSession.tsx` does not call `generateWorkoutFeedback` after workout completion.
   Students finish workouts without seeing AI feedback or motivational messages.

2. **E2E Coverage gaps**: Two P1 paths documented in `tests/e2e/CRITICAL-PATHS.md` are untested:
   - Workout session completion (start → finish → XP awarded)
   - Student enrollment flow (admin creates aluno)

## Scope

### In Scope

- **T1**: Integrate `generateWorkoutFeedback` into `WorkoutSession.tsx` — call after
  `registrarHistoricoTreinoAction` succeeds, display feedback card to student.
- **T2**: E2E test — workout session completion (ALUNO starts workout, marks exercises done,
  finishes, verifies XP/streak update on dashboard).
- **T3**: E2E test — student enrollment flow (GERENTE fills form, submits, verifies aluno appears
  in list).

### Out of Scope

- INSTRUTOR E2E (P2, deferred to It4)
- Payment status update E2E (P2, deferred to It4)
- Workout history visualization improvements (It4)
- New Genkit flows or new AI features

## Acceptance Criteria

- [ ] After completing a workout session in `/aluno/meus-treinos`, a feedback card appears with
      `title` and `message` from the AI (or fallback if AI unavailable).
- [ ] Feedback does not block the session finish — displayed after XP is updated.
- [ ] If `generateWorkoutFeedback` throws, the workout still completes (graceful degradation).
- [ ] E2E: `workout-session.spec.ts` → ALUNO completes workout → dashboard shows updated XP.
- [ ] E2E: `enrollment.spec.ts` → GERENTE creates aluno → aluno appears in `/dashboard/alunos`.
- [ ] All 4 quality gates pass: lint, typecheck, test, e2e (17 scenarios after this iteration).

## Technical Constraints

- Constitution Principle IV: AI call MUST be inside try/catch; fallback path MUST exist.
- Constitution Principle III: Business logic change (feedback display) must have unit test.
- `generateWorkoutFeedback` is already defined with input/output Zod schemas — do not change the
  flow signature.
- E2E seed already includes INSTRUTOR + ALUNO users with fixed UUIDs — reuse them.
