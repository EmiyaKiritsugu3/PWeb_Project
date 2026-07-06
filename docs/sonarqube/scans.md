# SonarQube — Registro de Execuções

> P5 §4: mínimo 2x/semana. Manter tabela data · coverage · smells · gate · commit.

| Data       | Branch coverage | Code smells | Duplication | Quality Gate | Commit           | Notas                                                                                               |
| ---------- | --------------- | ----------- | ----------- | ------------ | ---------------- | --------------------------------------------------------------------------------------------------- |
| 2026-07-06 | 84.53%          | 0 novos     | < 3%        | PASS         | `3ddf0fb` (main) | Iteração 4 — baseline P5. Excluído `src/components/ui/**` (shadcn). False positives pendentes #160. |
| 2026-07-09 | (cron)          | —           | —           | PENDING      | (HEAD main)      | 2ª exec P5 via cron `3 9 * * 1,4`. Atualizar métricas pós-scan automático.                          |

## Próxima execução

- 2026-07-09 (qui) — scan mid-week via cron `3 9 * * 1,4` (linha PENDING acima será preenchida com métricas reais após execução).

## Como registrar

Após scan (CI step `SonarCloud Scan` no job `test`):

1. Abrir link do dashboard SonarCloud.
2. Anotar métricas na tabela.
3. Commit: `docs(sonarqube): registro scan <data>`.
