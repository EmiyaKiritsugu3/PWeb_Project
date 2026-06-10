# Learnings — meus-treinos-hooks extraction

- Component went from 400 LOC → 265 LOC (34% reduction). Remaining ~265 lines are mostly JSX template — further reduction requires sub-component extraction (e.g., `WorkoutListItem`).
- Both hooks accept a `notify` interface `{ success, error }` to avoid coupling to `useAppNotification` inside the hooks — keeps hooks testable and framework-agnostic.
- `handleDayChange` stayed in CRUD hook despite not being in original task spec lines (it was lines 106-125) — it belongs with CRUD operations since it mutates `meusTreinos` state.
- `handleFinishWorkout` stayed in component — it's thin (3 lines) and tightly coupled to the `WorkoutSession` component lifecycle.
- `treinoEmSessao` state stayed in component — it's presentation state, not business logic.
- All hooks use `useCallback` for stable references (avoids unnecessary re-renders in child components like `WorkoutGenerator`).
- Hook option interfaces use explicit `notify` type instead of importing `useAppNotification` — decouples hooks from specific notification implementation.
