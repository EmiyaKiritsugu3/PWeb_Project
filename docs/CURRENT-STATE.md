# Estado Atual (2026-06-06)

## Estabilizado — Library Drift Audit (PRs #128, #130, #129, #131, #132 merged)

**Última versão:** 1.5.0
**Branch principal:** `main`
**CI:** 4/4 quality gates verdes (typecheck · lint · format:check · test). 13/13 CI checks pass.

### O que foi feito

- **PR #128 (CRITICAL fix)**: Supabase SSR 0.10 middleware `setAll` headers forwarding — CDN cache-bleed prevention. Bumped `@supabase/ssr` 0.10.2 → 0.10.3.
- **PR #130**: 7-commit observability modernization. Genkit 1.36: removed `output!`, dropped stream-chunk `safeParse`, removed redundant `streamSchema`. Sentry 10.56: 11 server actions wrapped with `withServerActionInstrumentation`, `sendDefaultPii` → `dataCollection` migration, manual `Sentry.startSpan` for Genkit AI flows with `gen_ai.*` attributes.
- **PR #129**: 2-commit Zod forward-compat. ~30 positional `message` → `{ message: '...' }` object form. 22 `z.string().email/uuid/url` → top-level `z.email/uuid/url`. Required `zod/v4` import (v3 lacks top-level format functions).
- **PR #131 hotfix**: TS spread error in Sentry test mock — cast `importOriginal()` to `Record<string, unknown>`.
- **PR #132 hotfix**: 6 treino test regressions from PR #129's v4-strict UUIDs — updated 10 literal UUIDs to v4-valid format.

(2 hotfixes were required because PR #130's test mock + PR #129's zod v4 import both introduced regressions caught by F2 review and local test runs respectively.)

### Testes

- **101/101** vitest tests passing (14 suites) — baseline 86 + 15 new zod-migration smoke
- TypeScript: **0 erros**
- CI 13/13 verde: Quality Gates, Tests & Coverage, SonarCloud, E2E, Vercel, CodeQL, Semgrep ×2, GitGuardian, CodeRabbit, cubic, Analyze JS-TS, Vercel Preview

### Pendências Técnicas

_Nenhuma pendência crítica._ Audits completed: Next.js 15.5 (no critical, all forward-compat work tracked for v16), Genkit 1.36 (3 MEDIUM fixed in #130, 3 LOW deferred), Sentry 10.56 (1 CRITICAL + 2 MAJOR fixed in #130), Zod 3.25+Supabase SSR 0.10 (1 CRITICAL + 2 MEDIUM + 1 LOW fixed across #128/#129, 2 LOW deferred). Out-of-scope items (Next 16, genkit zod v4, full audit beyond Context7) tracked in `.sisyphus/plans/library-drift-audit-2026-06-05.md` and `.sisyphus/evidence/audit-context7-2026-06-05.md`.
