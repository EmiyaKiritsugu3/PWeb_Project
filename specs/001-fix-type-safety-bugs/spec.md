# Feature Specification: Code Quality — setState-in-Effect Fixes and Type Safety Cleanup

**Feature Branch**: `001-fix-type-safety-bugs`
**Created**: 2026-04-09
**Status**: Draft
**Input**: User description: "Fix setState-in-effect bugs and no-explicit-any type safety cleanup"

## User Scenarios & Testing

### User Story 1 — Stable UI Without Unintended Re-renders (Priority: P1)

As a student or admin using the application, I expect screens to respond correctly
when my data changes — without freezing, flickering, or producing stale values
caused by state being set inside effects that re-trigger on every render.

**Why this priority**: The three known `setState-in-effect` violations are real
correctness bugs. Each one risks an infinite render loop or a stale-closure trap
that silently shows the user wrong data. These must be fixed before any new feature
work that touches the same components.

**Independent Test**: Load the student portal dashboard and the workout management
pages. Navigate between them, complete a workout, and observe the UI. There must be
no visible flicker, no browser console errors about "Maximum update depth exceeded",
and data shown must match the server's current state.

**Acceptance Scenarios**:

1. **Given** a student opens their dashboard, **When** the server data is loaded,
   **Then** the page renders exactly once without cascading re-renders.
2. **Given** a student completes a workout and XP is awarded, **When** the
   gamification counters update, **Then** the displayed XP and streak values match
   the persisted values without requiring a manual page refresh.
3. **Given** an admin is on the workout management page and selects a student,
   **When** exercises are added or removed, **Then** the form state does not reset
   unexpectedly or duplicate entries.

---

### User Story 2 — Reliable AI Workout and Feedback Flows (Priority: P2)

As an instructor using the AI workout generator, I expect the generated plan to
display correctly and be saveable without silent data corruption caused by untyped
AI output being coerced into the wrong shape.

**Why this priority**: The AI flow handlers currently use unsafe escape hatches
(`as any` casts) when processing streaming AI output. If the AI returns an
unexpected shape, the application silently swallows the error and either shows
blank data or saves corrupted records. Eliminating these untyped paths enforces
the contract between the AI response and the data model at the earliest point.

**Independent Test**: Use the AI workout generator to create a plan, review the
generated plan in the editor, then save it to a student's profile. The saved
workouts must appear correctly in the student's detail page with all exercises,
sets, and rep ranges intact.

**Acceptance Scenarios**:

1. **Given** an instructor generates an AI workout plan, **When** the streaming
   response completes, **Then** the plan editor is populated with all exercises,
   days, and rep ranges as returned by the AI — no fields missing or defaulted to
   zero/empty.
2. **Given** the AI returns a response that omits an optional field, **When** the
   plan is rendered, **Then** the omitted field shows a sensible default (e.g.,
   blank observation) rather than causing a runtime error.

---

### User Story 3 — Consistent Type Checking Across the Codebase (Priority: P3)

As a developer maintaining this project, I need the type checker to reliably catch
contract violations at the boundaries where data enters the system — form inputs,
server action responses, and AI outputs — so that future changes to data models are
caught before they reach production.

**Why this priority**: With ~100 `any`-typed escape hatches, a rename of a Prisma
field or a change to an AI schema can silently break downstream consumers. Removing
`any` from safety-critical boundaries (server action return types, AI schema
consumers, form value types) means future refactors fail loudly at compile time.

**Independent Test**: Running the project's type-check command must produce zero
errors and zero `any` suppressions in the files that handle user-facing data flows
(server actions, AI flow handlers, student data queries).

**Acceptance Scenarios**:

1. **Given** a developer changes a field name in the student data model, **When**
   the type checker runs, **Then** every consumer of that field that was previously
   typed as `any` now produces a compile error pointing to the exact location.
2. **Given** the full codebase is type-checked, **When** the check completes,
   **Then** zero errors are reported and the count of `any`-typed values in
   safety-critical paths (server actions, AI consumers, data query wrappers) is
   zero.

---

### Edge Cases

- A component that currently relies on a setState-in-effect to sync props to state
  must still reflect prop updates when the parent re-renders with new data — the fix
  must not remove reactivity, only eliminate the infinite-loop pattern.
- Some `any` casts may be in third-party type definitions or generated code. These
  are explicitly out of scope — only hand-authored `any` in `src/` is addressed.
- Fixing `any` in one file must not cause type errors to cascade into files that
  were previously passing.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST NOT produce infinite re-render loops or "Maximum
  update depth exceeded" console errors during normal navigation and interaction.
- **FR-002**: State values displayed to the user (XP, streak, workout lists, form
  fields) MUST reflect the current persisted data without requiring a manual
  refresh after the initial load completes.
- **FR-003**: All hand-authored `any` type annotations in server action return
  types MUST be replaced with explicit typed interfaces or inferred types.
- **FR-004**: All hand-authored `any` type annotations in AI flow response
  consumers MUST be replaced with the corresponding Zod-inferred or explicit types.
- **FR-005**: All hand-authored `any` type annotations in data query wrapper
  functions MUST be replaced with the Prisma-generated or explicitly declared types.
- **FR-006**: The type-check step MUST pass with zero errors after all changes are
  applied.
- **FR-007**: All existing automated tests MUST continue to pass after the changes.
- **FR-008**: The lint step MUST report zero `no-explicit-any` errors (not just
  warnings) for files in scope after the cleanup.

### Key Entities

- **Component**: A React component that renders UI; the primary location of
  `setState-in-effect` violations.
- **Server Action**: A server-side function that mutates data and returns a typed
  result; currently typed with `any` in several return shapes.
- **AI Flow Handler**: A client-side function that consumes streaming AI output;
  currently uses `as any` casts to bridge the Genkit output type to the internal
  workout plan type.
- **Data Query Wrapper**: A server-side function that wraps Prisma queries and
  returns typed records; currently returns `any[]` in several places.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero browser console errors of the "Maximum update depth exceeded"
  or "Cannot update a component while rendering a different component" category
  during a full end-to-end walkthrough of both the student portal and admin
  dashboard.
- **SC-002**: The type-check command completes with zero errors on the full source
  tree.
- **SC-003**: The lint command reports zero `no-explicit-any` rule violations
  (severity: error, not warning) across all files in `src/lib/actions/`,
  `src/ai/`, and `src/lib/data.ts`.
- **SC-004**: 100% of existing automated tests pass without modification.
- **SC-005**: No regression in any user-visible feature: all CRUD operations,
  gamification counters, AI workout generation, and AI feedback generation continue
  to work correctly after the changes.

## Assumptions

- The three `setState-in-effect` instances referenced in the project changelog
  are the only ones present; a linter scan at implementation time will confirm
  this and include any newly discovered instances.
- The `no-unused-vars` warnings (~70) are explicitly out of scope for this
  specification and will be addressed in a separate cleanup task.
- Third-party type definitions under `node_modules/` are entirely out of scope.
- Any `any` cast that exists solely because the Genkit SDK's public types are
  incomplete is considered a third-party limitation; it may be suppressed with a
  targeted inline comment explaining why, rather than removed.
- The scope of "safety-critical paths" for the `any` cleanup is:
  `src/lib/actions/`, `src/ai/flows/`, `src/ai/schemas.ts`, `src/lib/data.ts`,
  and `src/lib/definitions.ts`.
- The project's automated test suite (Vitest) provides meaningful coverage of
  the affected logic; passing tests are treated as a non-regression signal.
- This task modifies `src/lib/actions/treinos.ts` for type correctness only.
  The gamification business logic (XP calculation, streak increment, level-up)
  is unchanged in behavior. Constitution Principle III's TDD gate is satisfied
  by the non-regression requirement (FR-007): if existing tests pass after the
  change, no behavioral regression occurred. No new tests are required because
  no new behavior is introduced.
