---
description: Blueprint for creating new features following the expected PRD definitions.
---

# Workflow: Feature Development

When instructed to build a new feature or component, follow this sequential blueprint layout:

## 1. Documentation Review
- Read `PROJECT_STATUS.md` to identify the current Phase and global context.
- Read `docs/PRD.md` to verify the feature's requirements.
- Read `friction-log.md` to avoid past architectural mistakes.

## 2. Data Layer Definition
- Create or update the relevant Zod schemas. **CRITCAL**: Respect the `BaseSchema` (input validation, no DB-specific IDs) vs `EntitySchema` (full DB record) methodology.

## 3. UI/UX Component Development
- Adhere to the Premium Dark aesthetic (glassmorphism, Tailwind v4, neon gradients).
- **Never** use placeholder components; if necessary, generate mockup data or use real data structures.
- Ensure all interactive elements have rich, subtle micro-animations (e.g., hover states, transitions).

## 4. State Management & Integration
- Wire up the UI using the appropriate server action or fetcher.
- Ensure loading state fallbacks (skeletons) and error boundaries exist.

## 5. Verification
- Validate typings (no `any` types allowed).
- Test layout responsiveness.
- Update `PROJECT_STATUS.md` if the feature marks completion of a significant project milestone.
