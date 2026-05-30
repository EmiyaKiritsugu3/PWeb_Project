# Estado Atual (2026-05-29)

## Estabilizado — ESLint FlatCompat Migration + Dependabot Sweep + CI Otimizado

**Última versão:** 1.3.1
**Branch principal:** `main`
**CI:** Pipeline otimizado — Dependabot PRs pulam testes/E2E; PRs regulares rodam quality gates completos. Lint local funcional.

### O que foi feito

- **ESLint FlatCompat Migration**: `eslint.config.mjs` migrado de `FlatCompat` para flat config nativo do `eslint-config-next` v16. Resolvido `TypeError: Converting circular structure to JSON`. Removidos `@eslint/eslintrc`, `@eslint/config-array`, `@types/eslint` das devDependencies.
- **Dependabot Sweep:** Todos os 6 PRs de dependências (#101 a #107) mergeados com sucesso, incluindo:
  - `@types/node` 20→25
  - `lucide-react` 0.475→1.16
  - `react-day-picker` patch
  - `tailwind-merge` 2→3
  - `eslint-config-next` 15→16
  - `qs` patch
- **CI Otimizado** (PR #110): Testes vitest e E2E pulados para Dependabot; `paths-ignore` para docs-only.
- **Cobertura SonarCloud**: Configurado `sonar.javascript.lcov.reportPaths` para upload de cobertura via `sonarqube-scan-action`.

### Pendências Técnicas

- **react-hooks/set-state-in-effect**: Regra nova do eslint-config-next v16 sinaliza `setState` dentro de `useEffect` (6 ocorrências). Downgradado para `warn`. Refatorar para `useSyncExternalStore` ou padrões de initializer quando conveniente.
