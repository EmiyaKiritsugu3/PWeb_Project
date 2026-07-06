# SonarQube — Registro de Execuções

> P5 §4: mínimo 2x/semana. Manter tabela data · coverage · smells · gate · commit.

| Data       | Branch coverage | Code smells | Duplication | Quality Gate | Commit           | Notas                                                                                               |
| ---------- | --------------- | ----------- | ----------- | ------------ | ---------------- | --------------------------------------------------------------------------------------------------- |
| 2026-07-06 | 84.53%          | 0 novos     | < 3%        | PASS         | `3ddf0fb` (main) | Iteração 4 — baseline P5. Excluído `src/components/ui/**` (shadcn). False positives pendentes #160. |

## Próxima execução

- 2026-07-10 (qui) — scan mid-week via cron `3 9 * * 1,4`.

## Como registrar

Após scan (CI job `SonarCloud Scan`):

1. Abrir link do dashboard SonarCloud.
2. Anotar métricas na tabela.
3. Commit: `docs(sonarqube): registro scan <data>`.
