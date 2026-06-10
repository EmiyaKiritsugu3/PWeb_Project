## Task 3: use-workout-exercises hook

- Created `src/hooks/use-workout-exercises.ts` extracting duplicated exercise state from treinos-client.tsx and workout-editor.tsx
- Uses Map-based O(1) lookup via `exercicioDescriptionsMap` (better than treinos-client's `flatExerciciosOptions.find` approach)
- Added `Number.parseInt` + `Number.isFinite` safety for series field (workout-editor lacked this)
- All functions wrapped in `useCallback` for stable references
- Accepts optional initial values for edit mode support
- `hasValidationErrors` uses memoized closure for consistent references
- tsc --noEmit passes cleanly
