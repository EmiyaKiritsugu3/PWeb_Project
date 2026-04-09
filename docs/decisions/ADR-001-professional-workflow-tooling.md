# ADR-001: Professional Development Workflow Tooling

**Date:** 2026-04-08
**Status:** Accepted
**Authors:** VOX Development Team

---

## Context

The project had no automated code style enforcement, pre-commit hooks, or coverage reporting. `next lint` was broken due to a circular reference in `eslint-config-next` v16 when loaded via `FlatCompat`. Tests existed but included `.aiox-core/` internal tooling (5 failing files unrelated to the application).

## Decisions

### 1. ESLint — Native Flat Config (no FlatCompat)

`eslint-config-next` v16 exports native ESLint 9 flat config objects. The previous `FlatCompat` bridge caused a circular JSON reference error at runtime. The config was rewritten to import directly:

```js
import nextConfig from 'eslint-config-next/core-web-vitals';
```

This imports the full `next/core-web-vitals` ruleset (React, React Hooks, Next.js, TypeScript, accessibility) as a native flat config array, without the FlatCompat overhead.

**`eslint-config-prettier`** is applied after to disable all formatting rules that conflict with Prettier.

**`npm run lint`** changed from `next lint` (broken) to `eslint src`.

**Rule severity decisions for existing codebase:**

| Rule                                 | Severity | Rationale                                                                                              |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------ |
| `@typescript-eslint/no-explicit-any` | warn     | 100+ pre-existing violations; raised to `error` after type-cleanup sprint                              |
| `@typescript-eslint/no-unused-vars`  | warn     | 70 pre-existing dead imports; raised to `error` after cleanup sprint                                   |
| `react-hooks/rules-of-hooks`         | warn     | 1 pre-existing architectural issue in `columns.tsx` (hook in cell render); raised to `error` after fix |
| `react-hooks/set-state-in-effect`    | warn     | 3 pre-existing instances; raised to `error` after fix                                                  |
| `react-hooks/incompatible-library`   | warn     | TanStack Table v8 compatibility issue; raised to `error` after upgrade                                 |
| `no-console`                         | warn     | Intentional for development logging; raised to `error` before production release                       |
| `no-debugger`                        | error    | Hard block — no exceptions                                                                             |
| `prefer-const`                       | error    | Immediate enforcement — no existing violations                                                         |

**`src/components/ui/sidebar.tsx`** excluded from ESLint — generated Shadcn component, not maintained manually.

### 2. Prettier

Config: single quotes, 100-char print width, ES5 trailing commas, `jsxSingleQuote: false` (JSX uses double quotes per HTML convention).

`.prettierignore` excludes: `node_modules/`, `.next/`, `coverage/`, `package-lock.json`, `prisma/migrations/`, `public/`, `.aiox-core/`, `.agents/`, `.agent/`.

### 3. Husky v9 + lint-staged + commitlint

Same configuration as vox-core. `HUSKY=0` set in CI environment.

### 4. Vitest Coverage — No Hard Thresholds (Yet)

`@vitest/coverage-v8` added for coverage reporting via `npm run test:coverage`.

The project currently has 2 test files covering `src/services/` and `src/components/dashboard/alunos/`. Overall line coverage is ~1.4%. Setting meaningful thresholds requires a minimum viable test suite.

**Coverage thresholds will be enforced once the test suite reaches meaningful breadth.** Target milestones:

- 10+ test files → introduce 20% thresholds
- 25+ test files → raise to 50%
- 40+ test files → raise to 80%

### 5. Vitest Scope — `src/**` only

Previous config picked up `.aiox-core/workflow-intelligence/` tests (5 failing files, 6 failures). Those tests are internal tooling for the AIOX framework, not application tests. The `include` pattern was scoped to `src/**/*.test.{ts,tsx}`.

### 6. CI/CD Pipeline

Two-job pipeline identical to vox-core pattern. CodeQL analysis (existing weekly + push/PR workflow) remains separate and is not affected.

### 7. Pre-existing Violations Surfaced

Making linting functional for the first time surfaced pre-existing violations. These are documented as known technical debt:

| Violation                         | Count | Files                                                           | Priority                         |
| --------------------------------- | ----- | --------------------------------------------------------------- | -------------------------------- |
| `no-explicit-any`                 | ~100  | Multiple                                                        | Medium — type-cleanup sprint     |
| `no-unused-vars`                  | 70    | Multiple                                                        | Low — dead import cleanup sprint |
| `react-hooks/set-state-in-effect` | 3     | `use-workout-tracker.ts`, `card-feedback.tsx`, `data-table.tsx` | High — performance bug           |
| `react-hooks/rules-of-hooks`      | 1     | `columns.tsx`                                                   | High — React violation           |
| `react/no-unescaped-entities`     | 4     | `planos/page.tsx`, `card-feedback.tsx`                          | Fixed in this ADR                |

## Consequences

**Positive:**

- `next lint` is no longer broken — linting is functional for the first time in this project
- Pre-commit hooks prevent new dead imports and `any` types from being introduced
- Coverage reporting gives a baseline for test investment decisions
- Test scope is now correct — application tests only

**Negative / Trade-offs:**

- 160 warnings visible in lint output — these are pre-existing technical debt, not new violations
- No coverage thresholds yet — coverage is reported but not enforced
- `sidebar.tsx` excluded from lint — accepted because it is generated code

## Alternatives Considered

| Decision Point                             | Alternative                              | Reason Rejected                                                                                               |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `no-explicit-any: error` from day 1        | Setting all rules to `error` immediately | 100+ violations would permanently block CI; phased approach is more pragmatic                                 |
| Keep `FlatCompat` + fix circular reference | Monkey-patch the React plugin            | Fragile; native flat config is the supported path                                                             |
| Include `.aiox-core/` in tests             | Run all tests including internal tooling | 6 pre-existing failures in unrelated code would permanently fail CI                                           |
| Coverage thresholds from day 1             | Set 20% threshold                        | 1.4% current coverage means CI would always fail; thresholds only add value when the test suite is meaningful |
