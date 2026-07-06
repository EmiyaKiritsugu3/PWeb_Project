# SonarQube — Configuração e Execução

> PWeb_Project — Engenharia de Software II / Iteração 4 (P5)
> Requisito P5 §4: executar SonarQube **2x por semana**, manter cobertura ≥ 80%.

---

## 1. Plataforma

- **SonarCloud** (SaaS) — sem self-hosted.
- Organization: `emiyakiritsugu3`
- Project Key: `EmiyaKiritsugu3_PWeb_Project`
- Config: `sonar-project.properties` (raiz do repo).

## 2. Configuração (`sonar-project.properties`)

| Prop                                | Valor                                                  | Descrição                                       |
| ----------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| `sonar.projectKey`                  | `EmiyaKiritsugu3_PWeb_Project`                         | id projeto SonarCloud                           |
| `sonar.organization`                | `emiyakiritsugu3`                                      | slug organização                                |
| `sonar.javascript.lcov.reportPaths` | `coverage/lcov.info`                                   | relatório LCOV gerado pelo Vitest               |
| `sonar.exclusions`                  | testes, coverage, node_modules, `src/components/ui/**` | shadcn/Radix wrappers não são lógica de negócio |
| `sonar.tests`                       | `src`                                                  | diretório raiz de testes                        |
| `sonar.test.inclusions`             | `src/**/*.test.ts(x)`, `**.spec.ts(x)`                 | arquivos de teste                               |

## 3. Pré-requisitos

1. Conta SonarCloud vinculada ao GitHub (`https://sonarcloud.io/projects` → Import).
2. `SONAR_TOKEN` no GitHub Secrets (Actions) e local (`~/.sonar/sonar-scanner.properties` ou env).
3. `coverage/lcov.info` gerado **antes** do scan:
   ```bash
   npx vitest run --coverage
   ```

## 4. Execução local

```bash
# 1. gerar cobertura
npm test                   # ou: npx vitest run --coverage

# 2. scan
sonar-scanner \
  -Dsonar.projectKey=EmiyaKiritsugu3_PWeb_Project \
  -Dsonar.organization=emiyakiritsugu3 \
  -Dsonar.login=$SONAR_TOKEN
```

Saída: link para o dashboard SonarCloud com o novo scan.

## 5. CI (GitHub Actions)

Job `sonar` no `.github/workflows/ci.yml` (quando `SONAR_TOKEN` presente):

```yaml
- name: SonarQube Scan
  run: sonar-scanner
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`GITHUB_TOKEN` habilita PR Decoration (comentários inline no PR).

## 6. Cadência semanal (2x)

- **Segunda-feira** — scan baseline da semana.
- **Quinta-feira** — scan mid-week p/ capturar deltas de PRs.

Agendamento sugerido (cron GitHub Actions):

```yaml
on:
  schedule:
    - cron: '0 9 * * 1,4' # seg + qui às 09:00 UTC
  workflow_dispatch:
```

## 7. Métricas-alvo (P5)

| Métrica           | Alvo    | Atual      |
| ----------------- | ------- | ---------- |
| Coverage (branch) | ≥ 80%   | **84.53%** |
| Duplicação        | < 3%    | < 3%       |
| Code smells       | 0 novos | 0          |
| Vulnerabilidades  | 0       | 0          |
| Bugs              | 0       | 0          |

Pendências conhecidas (false positives): 16 smells documentados em `docs/TECHNICAL-DEBT.md` (#160) — skeleton keys, cmdk, logger.

## 8. Quality Gate

SonarCloud Quality Gate default:

- Coverage on new code: ≥ 80%
- Duplications on new code: < 3%
- Bugs/Vulnerabilities/Code Smells on new code: 0

Bloqueia merge via GitHub branch protection (status check `SonarCloud Code Quality`).

## 9. Resolução de false positives

| Padrão                            | Ação                                               |
| --------------------------------- | -------------------------------------------------- |
| `cmdk`, `skeleton` keys           | `// NOSONAR` ou `sonar.exclusions` se wrapper      |
| Logger S2068 (hardcoded password) | marcar `Won't Fix` no SonarCloud com justificativa |
| React hooks S6477                 | revisar; se falso, marcar `False Positive`         |

## 10. Registro de execução

Manter `docs/sonarqube/scans.md` (opcional) com data + coverage + smells:

```
2026-07-06 | branch 84.53% | smells 0 | gate PASS | commit <sha>
```
