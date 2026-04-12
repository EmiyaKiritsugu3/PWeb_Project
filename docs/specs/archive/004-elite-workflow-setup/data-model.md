# Data Model: 004 — Elite Workflow Setup

**Generated**: 2026-04-09
**Note**: Esta feature não modifica o schema do banco de dados.
O "data model" aqui é o modelo de arquivos e configurações criados.

---

## Artefatos Criados / Modificados

### Documentação Nova

```text
docs/
├── CURRENT-STATE.md                    # NOVO — snapshot vivo do projeto
├── DEFINITION-OF-DONE.md               # NOVO — critérios por US
├── security/
│   └── THREAT-MODEL.md                 # NOVO — análise STRIDE
├── process/
│   ├── RFC-TEMPLATE.md                 # NOVO — template de RFC
│   └── POSTMORTEM-TEMPLATE.md          # NOVO — template blameless
├── observability/
│   ├── MONITORING.md                   # NOVO — o que monitorar e como
│   └── SLOS.md                         # NOVO — Service Level Objectives
└── operations/
    ├── RUNBOOK.md                      # NOVO — deploy, rollback, operações
    └── INCIDENT-RESPONSE.md            # NOVO — o que fazer quando quebra
```

### Testes E2E

```text
tests/
└── e2e/
    ├── CRITICAL-PATHS.md               # NOVO — lista de critical paths cobertos
    ├── helpers/
    │   ├── auth.ts                     # NOVO — login helper reutilizável
    │   └── supabase.ts                 # NOVO — setup/teardown de dados de teste
    └── specs/
        ├── auth.spec.ts                # NOVO — login e redirect por role
        ├── financial-access.spec.ts    # NOVO — acesso financeiro por role
        ├── student-portal.spec.ts      # NOVO — portal do aluno
        └── nav-visibility.spec.ts      # NOVO — visibilidade de nav por role
```

### Configuração Sentry

```text
sentry.client.config.ts                 # NOVO — gerado pelo wizard
sentry.server.config.ts                 # NOVO — gerado pelo wizard
sentry.edge.config.ts                   # NOVO — gerado pelo wizard
```

### Seed de Dados para E2E

```text
prisma/
└── seed-e2e.ts                         # NOVO — usuários de teste determinísticos
```

### Arquivos Modificados

```text
.env.example                            # + variáveis Sentry e Supabase staging
.env.staging                            # NOVO — vars do ambiente de staging
.github/workflows/ci.yml                # + job de E2E Playwright
eslint.config.mjs                       # any → error, unused-vars → error
vitest.config.ts                        # + coverage thresholds em src/lib/, src/services/
next.config.ts                          # + Sentry withSentryConfig wrapper
playwright.config.ts                    # NOVO — configuração do Playwright
package.json                            # + scripts: e2e, e2e:ui, seed:e2e
CLAUDE.md                               # + protocolo de sessão AI
```

---

## Protocolo de Sessão AI (CURRENT-STATE.md)

O arquivo `docs/CURRENT-STATE.md` segue esta estrutura fixa:

```markdown
# Current State — SmartManagementSystem

**Atualizado**: [data]

## Em Produção (main)

- [lista do que está live e funcionando]

## Em Desenvolvimento (branch atual)

- [feature em andamento + status]

## Próximo Step Imediato

- [UMA tarefa específica e atômica]

## Blocantes Conhecidos

- [o que está impedindo progresso]
```

Máximo 1 página. Atualizado no **final de cada sessão** de desenvolvimento.

---

## Usuários de Teste E2E (seed-e2e.ts)

Usuários criados no banco de staging com UUIDs fixos para reprodutibilidade:

| Role          | Email                       | UUID fixo                              |
| ------------- | --------------------------- | -------------------------------------- |
| GERENTE       | gerente@test.fivestar.com   | `00000000-0000-0000-0000-000000000001` |
| RECEPCIONISTA | recep@test.fivestar.com     | `00000000-0000-0000-0000-000000000002` |
| INSTRUTOR     | instrutor@test.fivestar.com | `00000000-0000-0000-0000-000000000003` |
| ALUNO         | aluno@test.fivestar.com     | `00000000-0000-0000-0000-000000000004` |

Senha padrão: `TestPassword123!` (documentada apenas para staging — nunca produção).
