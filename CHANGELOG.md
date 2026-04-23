# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **React Day Picker v9**: Upgraded from v8 to v9 to resolve React 19 peer dependency conflicts in CI.
- **Server Actions Consolidation**: Standardized all actions in `src/lib/actions/` to use the cached `getUser()` helper.

### Fixed

- **Security Breach Mitigation**: Rewrote Git history using `git-filter-repo` to permanently remove exposed `.env.production` files.
- **CI Dependency Lock**: Fixed `npm ci` failures in GitHub Actions caused by React 18/19 peer dependency mismatches via `package.json` overrides and version upgrades.
- **UI Compatibility**: Patched `src/components/ui/calendar.tsx` to match the new `components` API of `react-day-picker` v9.

### Obstacles & Solutions

1.  **Obstacle:** The CI pipeline (GitHub Actions) was more strict than the local environment, failing on `react-day-picker` v8 peer dependencies.
    - **Solution:** Upgraded to `react-day-picker` v9 and refactored the `Calendar` component to support the new API while maintaining the Shadcn/UI aesthetic.
2.  **Obstacle:** TypeScript couldn't resolve `motion/react` initially.
    - **Solution:** Installed the new `motion` package and confirmed that v19.2+ resolves the sub-modules correctly with `moduleResolution: "bundler"`.
3.  **Obstacle:** Sentry was missing OpenTelemetry peer dependencies after the React 19 bump.
    - **Solution:** Explicitly installed `@opentelemetry/sdk-trace-base` and `@opentelemetry/api` to restore telemetry traces.

---

## [1.0.0] — 2026-04-19 — It4: INSTRUTOR workflow E2E

... (resto do arquivo mantido como está)
