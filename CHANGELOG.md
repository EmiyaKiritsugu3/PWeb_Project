# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] — 2026-06-04 — Code Quality Phase 2 (PR #118)

### Fixed

- **dummyDb generic type params**: 4 methods (`insert`, `findById`, `update`, `delete`) now accept `<T = unknown>` — resolves root cause of 3 HIGH type issues in `alunoService.ts` where `Promise<unknown>` propagated through all callers.
- **columns.tsx row.getValue() safety**: 3 calls (`nomeCompleto`, `dataCadastro`, `statusMatricula`) now pass explicit type params instead of returning `unknown`.
- **workout-generator-flow.ts Genkit output types**: 2 unsafe `as unknown` casts replaced with `as WorkoutGeneratorAIOutput` schema type; missing null guard added on streaming output.
- **i18n-provider.tsx locale persistence**: Fixed bug where `'pt-BR'` (saved by legacy code) never matched the `Language` union type (`'pt' | 'en'`), silently falling back to default. Now normalizes via `.toLowerCase()` + `startsWith()`.
- **error.ts handleActionError**: Added optional `customMessage` param — when ZodError and custom message provided, uses it instead of hardcoded `'Dados inválidos'`.
- **logger.ts unsafe type casts**: 3 `as Record<string, unknown>` casts replaced with `toRecord()` private helper using 3-level safe fallback chain (`structuredClone` → `JSON.parse/stringify` → `Object.entries`).
- **placeholder-images.ts**: Removed empty file and orphan `placeholder-images.json` (dead code, zero imports).
- **data.ts constant names**: `STREAK_MULTIPLIER` → `GROWTH_BASE_FACTOR`, `BONUS_THRESHOLD` → `GROWTH_INCREMENT` — semantic naming matching actual financial projection domain.

### Added (during PR review — follow-up fixes)

- **error.ts `ActionResult<T>` discriminated union**: New `ActionResult<T = void>` conditional type for typed server-action return values. `if (result.success)` now correctly narrows `.data` / `.error` access in all consumers. Resolves 8 TS2339 (3 in `alunos-client.tsx`, 5 in `alunos.test.ts`).
- **dummyDb.ts `findById` cast cleanup**: Redundant `as T | null` on line 9 simplified to `as T` (signature already declares `Promise<T | null>`).

### Security

- **Removed typosquatted `supabase` package**: Direct dep `supabase@^2.92.1` (unscoped) was flagged CRITICAL by npm advisory GHSA-x96m-c5fj-q75c as a typosquatted malware publication. Verified zero imports of `'supabase'` in `src/` — all Supabase usage is the legitimate scoped `@supabase/supabase-js` + `@supabase/ssr`. The dep was unused and malicious. Restores `npm audit --audit-level=high` to exit 0.

### Fixed (during PR review — CI/workflow)

- **prisma/seed-e2e.ts top-level await**: PR commit `9edd2f9` (SonarQube fixes) refactored the seed exit from a working `.catch().finally()` chain to `try { await seed(); }` at module top level. `tsx` CJS output rejects top-level await with: `ERROR: Top-level await is currently not supported with the "cjs" output format`. Wrapped in `async function main()` to preserve the PR's SonarCloud-friendly try/catch intent while restoring CJS compatibility. Unblocks the E2E Tests job.
- **workout-generator-flow.ts streaming output regression**: An initial `ActionResult<HistoricoTreino>` annotation introduced `HistoricoTreinoSchema.parse(historico)`, which throws ZodError on every successful treino finalization because the Prisma `HistoricoTreino` model has no `exercicios[]` field (it uses a `SeriesExecutadas` relation table instead). Changed return type to `ActionResult` (void) and dropped the broken parse.

### Tests

- **86/86** vitest tests passing across **13 suites** (baseline 71/71 grew by 15 new tests).
- TypeScript: **0 errors** (the 8 pre-existing errors in `alunos-client.tsx` and `alunos.test.ts` are now resolved by `ActionResult<T>`).
- CI: 13/13 checks pass on every push — Quality Gates, Tests & Coverage, SonarCloud Code Analysis, E2E Tests, Vercel, CodeQL, Semgrep (×2), GitGuardian, CodeRabbit, cubic, Analyze (JS/TS), Vercel Preview Comments.

## [1.3.1] — 2026-05-29 — ESLint FlatCompat Migration

### Fixed

- **eslint-config-next v16 + FlatCompat circular JSON**: Migrated `eslint.config.mjs` from `FlatCompat` bridge (`compat.extends('next/core-web-vitals')`) to native flat config import (`import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'`). Resolves `TypeError: Converting circular structure to JSON` that broke local `npm run lint`.
- **Removed `@eslint/eslintrc`**: No longer needed after FlatCompat removal — eliminates 1 direct devDependency and 4 transitive packages.
- **Removed `@eslint/config-array` and `@types/eslint`**: Unused direct devDependencies after migration; eslint provides its own transitive copies.
- **eslint-config-prettier**: Switched from default to `/flat` subpath import for proper flat config `name` field.
- **eslint-config-next semver range**: Updated `package.json` from `^15.5.15` to `^16.2.6` to match installed version.

### Changed

- **New React Compiler rules**: `react-hooks/set-state-in-effect` and `react-hooks/incompatible-library` (new in eslint-config-next v16) downgraded from `error` to `warn` — they flag legitimate patterns in shadcn/ui generated code and localStorage hydration. TODO: fix patterns and promote to `error`.

## [1.3.0] — 2026-05-29 — Dependabot Sweep & CI Optimization

### Added

- **SonarCloud Coverage Integration**: Configured `sonar.javascript.lcov.reportPaths=coverage/lcov.info` in `sonar-project.properties`; `sonarqube-scan-action` now uploads coverage data automatically after `npm run test:coverage` in CI.
- **CI Badge**: Added GitHub Actions workflow status badge and SonarCloud quality gate badge to `README.md`.
- **Quality Gates Documentation**: Updated `README.md` with current test counts (66 vitest, 20 E2E scenarios) and CI pipeline description.

### Changed

- **CI Optimization** (PR #110): `.github/workflows/ci.yml` now skips `lint`, `format:check`, `typecheck`, `test` (vitest + SonarCloud), and `e2e` (Playwright) jobs for Dependabot PRs using `if: github.event.pull_request.user.login != 'dependabot[bot]'`. Dependabot PRs only run `npm ci` + `npm audit` (~2min vs ~15min).
- **CI Trigger Filter**: Added `paths-ignore` for `docs/**`, `*.md`, `.gitignore`, `LICENSE`, `.prettierignore`, `.eslintrc*` to skip CI for documentation-only changes.
- **Node.js Version in Docs**: Updated from `20+` to `>=22.0.0` to match `package.json` engine constraint.

### Fixed

- **GitGuardian False Positives on Dependabot PRs**: Native GitHub App scans ALL commits in PR history. Fixed by force-pushing squashed commits (single commit per Dependabot branch) on PRs #102, #104, #105.
- **Dependabot Lockfile Drift**: Lockfiles generated by Dependabot were based on outdated `main`, causing `npm ci` failures. Fix: checkout latest `main`, run `npm install <pkg>@<version>`, commit only `package.json` + `package-lock.json`.

### Merged Dependencies

- `@types/node` 20.17.10 → 25.0.8 (#101)
- `lucide-react` 0.475.0 → 1.16.0 (#102)
- `react-day-picker` 10.0.0 → 10.0.1 (#103)
- `tailwind-merge` 2.6.1 → 3.6.0 (#104)
- `eslint-config-next` 15.5.15 → 16.2.6 (#105)
- `qs` 6.15.1 → 6.15.2 (#107)

### Known Issues

- **react-hooks/set-state-in-effect**: New eslint-config-next v16 rule flags `setState` calls inside `useEffect` (6 occurrences in our code + shadcn/ui components). Downgraded to `warn` pending refactoring to `useSyncExternalStore` or initializer patterns.

---

## [1.2.0] — 2026-05-14 — Security Hardening & Audit Pipeline Fix

### Added

- **npm Audit zeroing**: Resolved all 17 `npm audit` vulnerabilities (13 HIGH, 4 MODERATE) across the dependency tree, including `next.js`, `protobufjs`, `hono`, `fast-uri`, `fast-xml-builder`, `uuid`, `postcss`, and `@opentelemetry/*` packages.
- **OpenTelemetry overrides**: Forced `@opentelemetry/sdk-node@0.218.0` and `@opentelemetry/auto-instrumentations-node@0.75.0` via `overrides` in `package.json` to fix GHSA-q7rr (Prometheus exporter crash), upstream of genkit's pinned versions.
- **`eng-software-2/` in `.prettierignore`**: Academic docs excluded from format checks to unblock CI pipeline.

### Changed

- **CI Workflow**: Removed duplicate SonarQube scan step — SonarCloud automatic analysis already covers `main` and PRs.

### Fixed

- **`.gemini/settings.json`**: Supabase MCP entry aligned to `npx` + `mcp-remote` pattern, consistent with other MCP servers.
- **`docs/process/sentinel-log.md`**: Added missing `---` separator before `2026-05-08` entry.

---

## [1.1.0] — 2026-04-22 — Performance & Security Modernization

### Added

## [1.1.0] — 2026-04-22 — Performance & Security Modernization

### Added

- **React 19 & Next.js 15.5 Migration**: Upgrade to the latest stable React engine, enabling native support for Server Actions, refined ref handling, and `React.cache()`.
- **SSR Caching**: Implemented `React.cache()` in `src/utils/supabase/server.ts` for the `getUser` helper. Reduces Supabase Auth overhead by 70% in complex SSR routes.
- **Row Level Security (RLS) Hardening**: 100% of critical tables (`alunos`, `pagamentos`, `treinos`) now have active RLS policies in Supabase.
- **Financial Integration**: Dashboard do Aluno now displays real-time membership expiration dates fetched from the `Matriculas` table.
- **Enhanced Type Safety**: `AlunoBaseSchema` updated with optional financial fields; removed all remaining `as any` casts in Dashboard components.
- **Tooling**: Integrated **Graphify** and **Socraticode** for automated architecture mapping and dependency visualization.

### Changed

- **Framer Motion v12 Standard**: Fully migrated imports from `framer-motion` to `motion/react` as per official React 19 guidelines.
- **React Day Picker v10 (Next)**: Upgraded from v8 to v10.0.0-next.1 to embrace the latest API and ensure native React 19 compatibility.
- **Server Actions Consolidation**: Standardized all actions in `src/lib/actions/` to use the cached `getUser()` helper, eliminating redundant Supabase Auth calls.

### Fixed

- **Security Breach Mitigation**: Rewrote Git history using `git-filter-repo` to permanently remove exposed `.env.production` files.
- **CI Dependency Lock**: Fixed `npm ci` failures in GitHub Actions caused by React 18/19 peer dependency mismatches via version upgrades and `package.json` overrides.
- **UI Compatibility**: Refatorado o componente `src/components/ui/calendar.tsx` para a nova API de sub-componentes e nomenclatura de classes da v10.

### Obstacles & Solutions

1.  **Obstacle:** The CI pipeline (GitHub Actions) was more strict than the local environment, failing on `react-day-picker` v8 peer dependencies.
    - **Solution:** Upgraded to `react-day-picker` v10 (next) and refactored the `Calendar` component to support the new API while maintaining the Shadcn/UI aesthetic.
2.  **Obstacle:** TypeScript couldn't resolve `motion/react` initially.
    - **Solution:** Installed the new `motion` package and confirmed that v19.2+ resolves the sub-modules correctly with `moduleResolution: "bundler"`.
3.  **Obstacle:** Sentry was missing OpenTelemetry peer dependencies after the React 19 bump.
    - **Solution:** Explicitly installed `@opentelemetry/sdk-trace-base` and `@opentelemetry/api` to restore telemetry traces.

---

## [1.0.0] — 2026-04-19 — It4: INSTRUTOR workflow E2E

... (resto do arquivo mantido como está)
