# Tasks: Elite Workflow Setup

**Input**: Design documents from `specs/004-elite-workflow-setup/`
**Branch**: `004-elite-workflow-setup`
**Generated**: 2026-04-09

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de task incompleta)
- **[Story]**: User story correspondente (US1–US7)

---

## Phase 1: Setup (Infraestrutura Compartilhada)

**Purpose**: Verificar pré-requisitos e preparar o ambiente antes de qualquer implementação.

- [ ] T001 Confirmar branch `004-elite-workflow-setup` ativa: `git branch --show-current`
- [ ] T002 Confirmar que `npm run lint && npm run test` passam antes de qualquer mudança
- [ ] T003 [P] Confirmar que notesmd-cli vault `docs` e `specs` estão funcionais: `notesmd-cli list-vaults`

**Checkpoint**: Ambiente limpo. Zero erros de lint e testes. Pronto para implementar.

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Documentos de processo que informam todas as outras fases. Zero dependências externas.

**⚠️ CRÍTICO**: Completar antes de iniciar as user stories.

- [ ] T004 [P] Criar `docs/CURRENT-STATE.md` com snapshot do projeto conforme T-1.1 do plan.md
- [ ] T005 [P] Criar `docs/DEFINITION-OF-DONE.md` com critérios por US conforme T-1.2 do plan.md
- [ ] T006 [P] Criar `docs/process/RFC-TEMPLATE.md` conforme T-1.4 do plan.md
- [ ] T007 [P] Criar `docs/process/POSTMORTEM-TEMPLATE.md` conforme T-1.5 do plan.md
- [ ] T008 Atualizar `CLAUDE.md` com seção "AI Session Protocol" conforme T-1.6 do plan.md

**Checkpoint**: Documentos de processo criados. CLAUDE.md atualizado com protocolo de sessão.

---

## Phase 3: US1 — Security & Threat Model (Priority: P1) 🎯

**Goal**: Documentar ameaças de segurança e criar runbook operacional.

**Independent Test**: Arquivos existem. Threat model tem todas as células STRIDE preenchidas. Runbook tem seções de deploy e rollback.

- [ ] T009 [P] [US1] Criar `docs/security/THREAT-MODEL.md` com análise STRIDE conforme T-1.3 do plan.md
- [ ] T010 [P] [US1] Criar `docs/operations/INCIDENT-RESPONSE.md` conforme T-7.2 do plan.md
- [ ] T011 [P] [US1] Criar `docs/observability/SLOS.md` com SLOs de disponibilidade e performance conforme T-7.1 do plan.md

**Checkpoint**: Documentação de segurança e operações completa. Verificar: 3 arquivos existem, STRIDE tem 6 categorias preenchidas.

---

## Phase 4: US2 — Supabase Staging Branch (Priority: P1) 🎯

**Goal**: Criar banco de dados isolado de produção para testes E2E.

**Independent Test**: `notesmd-cli search-content "staging" --vault docs` retorna RUNBOOK.md. `notesmd-cli search-content "seed:e2e" --vault specs` retorna research.md.

- [ ] T012 [US2] Obter custo de criação de branch: `mcp__supabase__get_cost` para projeto `zqrlsupezgltofwotven`
- [ ] T013 [US2] Criar branch de staging via `mcp__supabase__create_branch` (project_ref: `zqrlsupezgltofwotven`, name: `staging`)
- [ ] T014 [US2] Obter URL e chaves da branch criada via `mcp__supabase__get_project_url` e `mcp__supabase__get_publishable_keys`
- [ ] T015 [US2] Criar `.env.staging` na raiz do projeto com credenciais da branch (conforme T-2.3 do plan.md)
- [ ] T016 [US2] Atualizar `.env.example` com variáveis de staging e Sentry (conforme T-2.4 do plan.md)
- [ ] T017 [US2] Criar `prisma/seed-e2e.ts` com 3 usuários de teste determinísticos (conforme T-2.5 do plan.md)
- [ ] T018 [US2] Adicionar script `"seed:e2e"` ao `package.json`
- [ ] T019 [US2] Criar `docs/operations/RUNBOOK.md` com seções de staging, deploy e rollback (conforme T-2.6 do plan.md)

**Checkpoint**: `notesmd-cli list --vault docs` mostra `operations/RUNBOOK.md`. `.env.staging` existe com URL e keys da branch. `prisma/seed-e2e.ts` compila sem erros: `npx tsc --noEmit prisma/seed-e2e.ts`.

---

## Phase 5: US3 — ESLint Quality Gates (Priority: P2)

**Goal**: Elevar `no-explicit-any` e `no-unused-vars` de `warn` para `error` com CI verde.

**Independent Test**: `npm run lint` retorna `0 errors, 0 warnings`. `npm run test` continua passando.

- [ ] T020 [US3] Auditar violações por arquivo: `npm run lint 2>&1 | grep -E "^\/.+\.tsx?$" | sort -u` e categorizar (corrigir vs suprimir vs excluir)
- [ ] T021 [P] [US3] Corrigir `any` em `src/lib/actions/alunos.ts` usando tipos Prisma (`Prisma.AlunoCreateInput`, etc.)
- [ ] T022 [P] [US3] Corrigir `any` em `src/lib/actions/treinos.ts` usando tipos Prisma (`Treino`, `Exercicio`, etc.)
- [ ] T023 [P] [US3] Corrigir `any` em `src/lib/actions/financeiro.ts` usando tipos Prisma (`Pagamento`, `Matricula`, etc.)
- [ ] T024 [P] [US3] Corrigir `any` em `src/lib/data.ts` com tipos de retorno explícitos (ex: `AlunoComMatricula[]`)
- [ ] T025 [P] [US3] Corrigir `any` em `src/components/dashboard/` (charts, form-matricula, workout-generator)
- [ ] T026 [P] [US3] Corrigir `any` em `src/app/aluno/` e `src/app/actions/auth.ts`
- [ ] T027 [P] [US3] Corrigir `any` em `src/hooks/use-workout-tracker.ts`
- [ ] T028 [US3] Adicionar supressões justificadas com comentário inline em `src/ai/flows/workout-generator-flow.ts` (Genkit SDK gap)
- [ ] T029 [US3] Corrigir todas as violações `no-unused-vars` identificadas no audit
- [ ] T030 [US3] Elevar `no-explicit-any` de `warn` para `error` em `eslint.config.mjs`
- [ ] T031 [US3] Elevar `no-unused-vars` de `warn` para `error` em `eslint.config.mjs`
- [ ] T032 [US3] Verificar: `npm run lint` → 0 errors, 0 warnings. `npm run test` → all passing

**Checkpoint**: `npm run lint` verde com ambas as regras em `error`. CI passa. Commit com mensagem `fix(types): eliminate all any violations, enforce eslint error gates`.

---

## Phase 6: US4 — Coverage Threshold (Priority: P2)

**Goal**: Enforçar 80% de coverage em `src/lib/` e `src/services/` no CI.

**Independent Test**: `npm run test:coverage` passa com thresholds. `npm run lint` continua verde.

**⚠️ Depende de**: Phase 5 (US3) — tipos corretos permitem mocks tipados

- [ ] T033 [US4] Identificar funções sem cobertura: `npm run test:coverage 2>&1 | grep "src/lib"` e listar gaps
- [ ] T034 [US4] Criar `src/lib/data.test.ts` com mocks do Prisma para `getAlunos`, `getAlunoById`, `getFuncionarios` (conforme T-4.2 do plan.md)
- [ ] T035 [US4] Criar `src/lib/actions/alunos.test.ts` para `createAluno` (válido + inválido) e `deleteAluno` (GERENTE + RECEPCIONISTA) (conforme T-4.3 do plan.md)
- [ ] T036 [US4] Configurar coverage thresholds scoped em `vitest.config.ts` para `src/lib/**` e `src/services/**` @ 80% (conforme T-4.4 do plan.md)
- [ ] T037 [US4] Verificar: `npm run test:coverage` passa. Thresholds enforçados. CI verde.

**Checkpoint**: `npm run test:coverage` mostra `src/lib/` ≥ 80% e não falha por threshold. Commit com `test: add data layer unit tests, enforce 80% coverage threshold on src/lib`.

---

## Phase 7: US5 — Playwright E2E (Priority: P1) 🎯

**Goal**: 15 cenários E2E cobrindo os 4 critical paths rodando no CI.

**Independent Test**: `npm run e2e` passa com 15/15 cenários. Job E2E aparece verde no GitHub Actions.

**⚠️ Depende de**: Phase 4 (US2 — staging com seed disponível)

- [ ] T038 [US5] Instalar Playwright: `npm init playwright@latest -- --quiet --lang=ts --no-browsers --no-examples`
- [ ] T039 [US5] Instalar browser: `npx playwright install chromium --with-deps`
- [ ] T040 [US5] Substituir `playwright.config.ts` gerado pela configuração do plan.md (T-5.2): baseURL, webServer, workers=1, staging env
- [ ] T041 [P] [US5] Criar `tests/e2e/helpers/auth.ts` com função `loginAs(page, role)` (conforme T-5.3 do plan.md)
- [ ] T042 [P] [US5] Criar `tests/e2e/helpers/supabase.ts` para setup/teardown de dados de teste
- [ ] T043 [P] [US5] Criar `tests/e2e/specs/auth.spec.ts` — 4 cenários: login por role + credencial inválida (conforme T-5.4 do plan.md)
- [ ] T044 [P] [US5] Criar `tests/e2e/specs/financial-access.spec.ts` — 5 cenários: GERENTE acessa, RECEP/INSTRUTOR bloqueados × 2 rotas (conforme T-5.5 do plan.md)
- [ ] T045 [P] [US5] Criar `tests/e2e/specs/student-portal.spec.ts` — 3 cenários: login aluno, bloqueio admin, meus-treinos (conforme T-5.6 do plan.md)
- [ ] T046 [P] [US5] Criar `tests/e2e/specs/nav-visibility.spec.ts` — 3 cenários: nav por role (conforme T-5.7 do plan.md)
- [ ] T047 [US5] Rodar seed no staging: `npm run seed:e2e` (requer `.env.staging` ativo)
- [ ] T048 [US5] Validar localmente: `npm run e2e` → 15/15 passing
- [ ] T049 [US5] Criar `tests/e2e/CRITICAL-PATHS.md` com tabela de cenários cobertos e pendentes (conforme T-5.8 do plan.md)
- [ ] T050 [US5] Adicionar scripts ao `package.json`: `"e2e"`, `"e2e:ui"`, `"e2e:report"` (conforme T-5.9 do plan.md)
- [ ] T051 [US5] Adicionar job `e2e` ao `.github/workflows/ci.yml` após job `test` (conforme T-5.10 do plan.md)
- [ ] T052 [US5] Documentar secrets necessários no `docs/operations/RUNBOOK.md` (conforme T-5.11 do plan.md)

**Checkpoint**: `npm run e2e` → 15 passed. Push na branch → CI mostra 3 jobs (lint, test, e2e). Commit com `test(e2e): add Playwright suite covering 4 critical paths, add CI job`.

---

## Phase 8: US6 — Sentry Error Tracking (Priority: P2)

**Goal**: Capturar 100% dos erros de produção antes que usuários reportem.

**Independent Test**: Erro de teste visível no Sentry dashboard em < 30s. `npm run build` passa com Sentry wrapper.

**⚠️ T053 é manual** — requer ação humana em sentry.io antes dos demais.

- [ ] T053 [US6] **[MANUAL]** Criar projeto no sentry.io: platform=Next.js, nome=`smart-management-system`. Copiar DSN e gerar Auth Token (conforme T-6.1 do plan.md)
- [ ] T054 [US6] Instalar Sentry: `npx @sentry/wizard@latest -i nextjs` com DSN de T053 (conforme T-6.2 do plan.md)
- [ ] T055 [US6] Editar `sentry.server.config.ts`: adicionar `beforeSend` com redação de CPF e ignorar erros 404 (conforme T-6.3 do plan.md)
- [ ] T056 [US6] Confirmar que `.env.example` tem `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ENVIRONMENT` (conforme T-6.4 do plan.md)
- [ ] T057 [US6] Criar rota de teste `src/app/api/sentry-test/route.ts`, verificar erro no dashboard, deletar rota (conforme T-6.5 do plan.md)
- [ ] T058 [US6] Criar `docs/observability/MONITORING.md` com stack, alertas e gaps (conforme T-6.6 do plan.md)

**Checkpoint**: Sentry dashboard mostra erro de teste. `npm run build` passa. `docs/observability/MONITORING.md` existe. Commit com `feat(observability): add Sentry error tracking with PII scrubbing`.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Fechar gaps remanescentes e validar o estado final.

- [ ] T059 [P] Verificar que `docs/CURRENT-STATE.md` reflete o estado final após todas as fases
- [ ] T060 [P] Adicionar `.env.staging` ao `.gitignore` se ainda não estiver
- [ ] T061 [P] Verificar que `specs/specs` não existe mais e vault `specs` aponta para path correto: `notesmd-cli list-vaults`
- [ ] T062 Rodar validação completa: `npm run lint && npm run test && npm run e2e && npm run build`
- [ ] T063 Atualizar `CHANGELOG.md` com entry para feature 004
- [ ] T064 Criar PR para `main` com descrição referenciando `specs/004-elite-workflow-setup/`

**Checkpoint Final**: Todos os 4 comandos de T062 passam. PR aberto. CHANGELOG atualizado.

---

## Dependencies & Execution Order

### Dependências entre Fases

```
Phase 1 (Setup)          → sem dependências
Phase 2 (Foundational)   → sem dependências (paralelo com Phase 1)
Phase 3 (US1 - Security) → sem dependências (paralelo com Phase 2)
Phase 4 (US2 - Staging)  → sem dependências (paralelo com Phase 2 e 3)
Phase 5 (US3 - ESLint)   → sem dependências (paralelo com Phase 2, 3 e 4)
Phase 6 (US4 - Coverage) → depende de Phase 5 (US3) — tipos corretos
Phase 7 (US5 - E2E)      → depende de Phase 4 (US2) — staging com seed
Phase 8 (US6 - Sentry)   → T053 manual pode rodar a qualquer momento
Phase 9 (Polish)         → depende de todas as fases anteriores
```

### Paralelismo Recomendado

**Sessão 1** (sem dependências — tudo em paralelo):

```
T004-T007  docs de processo (arquivos diferentes)
T009-T011  security + ops + SLOs (arquivos diferentes)
T012       iniciar staging (MCP)
```

**Sessão 2** (após staging criado):

```
T013-T019  completar staging + RUNBOOK
T020-T029  ESLint fixes (por arquivo, paralelos)
T053       [MANUAL] criar projeto Sentry
```

**Sessão 3** (após ESLint clean):

```
T030-T032  elevar ESLint para error + verificar
T033-T037  coverage threshold
T054-T058  Sentry (após T053)
```

**Sessão 4** (após staging + seed prontos):

```
T038-T052  Playwright install + config + specs (E2E)
```

---

## Parallel Examples

### US3 — ESLint (T021-T027 em paralelo)

```bash
# Todos editam arquivos diferentes — rodar em paralelo:
Task: "Corrigir any em src/lib/actions/alunos.ts"      # T021
Task: "Corrigir any em src/lib/actions/treinos.ts"     # T022
Task: "Corrigir any em src/lib/actions/financeiro.ts"  # T023
Task: "Corrigir any em src/lib/data.ts"                # T024
Task: "Corrigir any em src/components/dashboard/"      # T025
Task: "Corrigir any em src/app/aluno/"                 # T026
Task: "Corrigir any em src/hooks/use-workout-tracker"  # T027
```

### US5 — E2E specs (T043-T046 em paralelo)

```bash
# Cada spec é um arquivo diferente — rodar em paralelo:
Task: "Criar tests/e2e/specs/auth.spec.ts"             # T043
Task: "Criar tests/e2e/specs/financial-access.spec.ts" # T044
Task: "Criar tests/e2e/specs/student-portal.spec.ts"   # T045
Task: "Criar tests/e2e/specs/nav-visibility.spec.ts"   # T046
```

---

## Implementation Strategy

### MVP (Sessão 1 — máximo impacto imediato)

1. Phase 1 + 2: Setup + Documentos de processo
2. Phase 3: Security + Ops docs
3. **PARAR e validar**: documentação navegável no Obsidian (`notesmd-cli search-content` funcional)

### Sequência Completa

1. Sessão 1: Phases 1-3 (docs, security) — ~45 min
2. Sessão 2: Phase 4 (staging) + iniciar Phase 5 (ESLint) — ~1.5h
3. Sessão 3: Finish Phase 5 (ESLint) + Phase 6 (coverage) + Phase 8 (Sentry pós-T053) — ~1.5h
4. Sessão 4: Phase 7 (E2E) — ~2.5h
5. Sessão 5: Phase 9 (polish + PR) — ~20 min

---

## Contagem de Tasks

| Phase            | Story | Tasks  | Paralelas |
| ---------------- | ----- | ------ | --------- |
| 1 — Setup        | —     | 3      | 2         |
| 2 — Foundational | —     | 5      | 4         |
| 3 — Security     | US1   | 3      | 3         |
| 4 — Staging      | US2   | 8      | 0         |
| 5 — ESLint       | US3   | 13     | 9         |
| 6 — Coverage     | US4   | 5      | 0         |
| 7 — E2E          | US5   | 15     | 6         |
| 8 — Sentry       | US6   | 6      | 0         |
| 9 — Polish       | —     | 6      | 3         |
| **TOTAL**        |       | **64** | **27**    |
