# Implementation Plan: Elite Workflow Setup

**Branch**: `004-elite-workflow-setup` | **Date**: 2026-04-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification + research from `specs/004-elite-workflow-setup/`

---

## Summary

Implementação de 7 fases para elevar o SmartManagementSystem ao nível de workflow
profissional elite: protocolo de sessão AI, documentação de processo, staging
environment (Supabase branch), quality gates de ESLint e coverage, testes E2E com
Playwright no CI, error tracking com Sentry, e documentação de operações.

**Sequência obrigatória**: Fases 1-2 não têm dependências. Fase 3 (Supabase staging)
deve preceder Fase 5 (E2E). Fase 3 (ESLint fixes) deve preceder T3.5 (raise to error).

---

## Technical Context

**Language/Version**: TypeScript 5 (strict mode)
**Primary Dependencies**: Next.js 15, Playwright, @sentry/nextjs, Vitest
**Storage**: PostgreSQL via Prisma (produção + branch de staging)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Vercel (produção), Supabase (DB)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: E2E suite < 3min no CI, unit tests < 30s
**Constraints**: Zero breaking changes no app durante esta feature
**Scale/Scope**: 4 suites E2E, 25 correções de `any`, 1 Supabase branch

---

## Constitution Check

| Princípio                         | Status  | Observação                              |
| --------------------------------- | ------- | --------------------------------------- |
| I. Dual-Portal Architecture       | ✅ PASS | Não toca routing ou layouts             |
| II. Type Safety at Every Boundary | ✅ PASS | Fortalece — eleva `any` para `error`    |
| III. Test-Gated Business Logic    | ✅ PASS | Adiciona E2E + eleva coverage threshold |
| IV. AI as Enhancement             | ✅ PASS | Não toca AI flows                       |
| V. Commit Discipline              | ✅ PASS | Segue convenções existentes             |

**Resultado**: Sem violações. Nenhum item de Complexity Tracking necessário.

---

## Project Structure

### Documentação (esta feature)

```text
specs/004-elite-workflow-setup/
├── spec.md          ✅ criado
├── research.md      ✅ criado
├── data-model.md    ✅ criado
├── quickstart.md    ✅ criado
├── plan.md          ← este arquivo
└── tasks.md         (gerado por /speckit.tasks)
```

### Arquivos Afetados

```text
docs/
├── CURRENT-STATE.md              # NOVO
├── DEFINITION-OF-DONE.md         # NOVO
├── security/THREAT-MODEL.md      # NOVO
├── process/RFC-TEMPLATE.md       # NOVO
├── process/POSTMORTEM-TEMPLATE.md# NOVO
├── observability/MONITORING.md   # NOVO
├── observability/SLOS.md         # NOVO
└── operations/
    ├── RUNBOOK.md                # NOVO
    └── INCIDENT-RESPONSE.md      # NOVO

tests/e2e/
├── CRITICAL-PATHS.md             # NOVO
├── helpers/auth.ts               # NOVO
├── helpers/supabase.ts           # NOVO
└── specs/
    ├── auth.spec.ts              # NOVO
    ├── financial-access.spec.ts  # NOVO
    ├── student-portal.spec.ts    # NOVO
    └── nav-visibility.spec.ts    # NOVO

prisma/seed-e2e.ts                # NOVO
playwright.config.ts              # NOVO
sentry.client.config.ts           # NOVO (gerado por wizard)
sentry.server.config.ts           # NOVO (gerado por wizard)
sentry.edge.config.ts             # NOVO (gerado por wizard)
.env.example                      # MODIFICADO
.env.staging                      # NOVO (gitignored)
.github/workflows/ci.yml          # MODIFICADO
eslint.config.mjs                 # MODIFICADO
vitest.config.ts                  # MODIFICADO
next.config.ts                    # MODIFICADO (Sentry wrapper)
package.json                      # MODIFICADO (scripts)
CLAUDE.md                         # MODIFICADO (session protocol)
```

---

## Fases de Implementação

---

## FASE 1 — AI Session Protocol & Documentação Base

> **Objetivo**: Criar o protocolo de sessão AI e documentos de processo.
> Sem dependências. Pode ser executado imediatamente.
> **Estimativa total**: 45 min

---

### T-1.1 — Criar `docs/CURRENT-STATE.md`

**Ação**: Criar o documento de snapshot vivo do projeto.

**Conteúdo exato a criar**:

```markdown
# Current State — SmartManagementSystem

**Atualizado**: 2026-04-09 | **Branch ativa**: 004-elite-workflow-setup

## Em Produção (main)

- Autenticação (US00): login SSR, redirect por role ✅
- Gestão de Alunos (US01): CRUD completo, search, sort, detalhes ✅
- Planos de Preços (US02): CRUD completo ✅
- Controle Financeiro (acesso GERENTE): middleware + page guard ✅
- Portal do Aluno: login, dashboard gamification, meus-treinos ✅

## Em Desenvolvimento

- Feature 004: Elite Workflow Setup (esta branch)
  - Status: Fase 1 iniciada

## Próximo Step Imediato

- T-1.2: Criar docs/DEFINITION-OF-DONE.md

## Blocantes Conhecidos

- Sentry DSN: requer criação manual em sentry.io (T-6.1)
- GitHub Secrets: requer acesso ao repositório (T-5.10)
```

**Verificação**: Arquivo existe em `docs/CURRENT-STATE.md`, ≤ 30 linhas.

---

### T-1.2 — Criar `docs/DEFINITION-OF-DONE.md`

**Ação**: Criar critérios objetivos de "pronto" para cada User Story.

**Conteúdo a criar** (critérios universais + por US):

```markdown
# Definition of Done — SmartManagementSystem

## Critérios Universais (toda US)

- [ ] Código sem erros de TypeScript (`npm run typecheck`)
- [ ] Zero erros de ESLint (`npm run lint`)
- [ ] Testes unitários escritos para toda lógica em src/lib/ ou src/services/
- [ ] Todos os testes passando (`npm run test`)
- [ ] PR reviewed e aprovado
- [ ] CHANGELOG.md atualizado
- [ ] docs/CURRENT-STATE.md atualizado

## US00 — Autenticação e Controle de Acesso ✅ COMPLETO

- [x] Login com email/senha via Supabase Auth
- [x] Redirect por role: GERENTE/RECEPCIONISTA/INSTRUTOR → /dashboard, ALUNO → /aluno
- [x] Middleware bloqueia /dashboard/financeiro para non-GERENTE
- [x] requireRole() com testes unitários (5/5 passando)
- [x] Seeds com 3 roles (GERENTE, RECEPCIONISTA, INSTRUTOR)

## US01 — Gestão de Alunos ✅ COMPLETO

- [x] Tabela com search por nome/CPF e sort por coluna
- [x] CRUD: criar, editar, deletar aluno
- [x] Página de detalhes /dashboard/alunos/[id]
- [x] Status de matrícula visível
- [ ] Upload de foto de perfil (pendente — It4)

## US02 — Planos de Preços ✅ COMPLETO

- [x] CRUD completo (criar, editar, deletar plano)
- [x] Integração com matrículas de alunos
- [x] Validação Zod (nome, preço, duração)

## US03 — Gerador de Treinos IA ⏳ PENDENTE (It3)

- [ ] Formulário: nível, objetivo, dias/semana
- [ ] Genkit flow retorna estrutura de treino válida (Zod-validated)
- [ ] Treino salvo no banco via Prisma
- [ ] UI exibe treino gerado com exercícios e séries
- [ ] Fallback: mensagem de erro se AI indisponível
- [ ] Teste unitário para validação do schema de saída

## US04 — Feedback Motivacional IA ⏳ PENDENTE (It3)

- [ ] Trigger após aluno marcar treino como concluído
- [ ] Genkit flow retorna texto motivacional
- [ ] Feedback exibido no portal do aluno
- [ ] Fallback: mensagem padrão se AI indisponível

## US05 — Portal do Aluno (Gamification) ⏳ PENDENTE (It4)

- [ ] XP calculado e salvo após cada treino concluído
- [ ] Streak calculado (dias consecutivos, reset se falhar)
- [ ] Level-up ao atingir threshold de XP
- [ ] UI: progress bar de XP, badge de nível, contador de streak

## US06 — Gestão de Funcionários ⏳ PENDENTE (It4)

- [ ] CRUD de funcionários (GERENTE only)
- [ ] Filtro por role e nome
- [ ] Revogação de acesso (soft delete ou disable)

## US07 — Histórico de Pagamentos ⏳ PENDENTE (It3)

- [ ] Registro de pagamento (valor, data, método: PIX/Dinheiro/Cartão)
- [ ] Listagem por aluno com filtro por data
- [ ] Status de inadimplência automático (job ou trigger)
```

**Verificação**: Arquivo existe. Cada US tem critérios mensuráveis e binários (sim/não).

---

### T-1.3 — Criar `docs/security/THREAT-MODEL.md`

**Ação**: Criar análise de ameaças STRIDE para os dados críticos do sistema.

**Conteúdo a criar**:

```markdown
# Threat Model — SmartManagementSystem

**Framework**: STRIDE | **Data**: 2026-04-09 | **Versão**: 1.0.0

## Ativos Críticos

| Ativo                                                  | Sensibilidade | Regulamentação                 |
| ------------------------------------------------------ | ------------- | ------------------------------ |
| CPF dos alunos                                         | Alta          | LGPD Art. 5º — dado pessoal    |
| Dados de pagamento (valor, método)                     | Alta          | LGPD — dado financeiro         |
| Sessão de autenticação (JWT)                           | Alta          | Comprometimento = acesso total |
| Dados de saúde implícitos (objetivo treino, biometria) | Média         | LGPD — dado sensível           |
| Histórico de treinos                                   | Baixa         | Sem regulamentação específica  |

## Análise STRIDE

### S — Spoofing (Falsificação de Identidade)

| Ameaça                          | Alvo        | Controle Atual              | Status      |
| ------------------------------- | ----------- | --------------------------- | ----------- |
| Aluno tenta acessar /dashboard  | Rotas admin | requireRole() + middleware  | ✅ MITIGADO |
| RECEPCIONISTA forja role no JWT | JWT payload | JWT assinado pelo Supabase  | ✅ MITIGADO |
| Sessão expirada reutilizada     | Auth tokens | Supabase refresh automático | ✅ MITIGADO |

### T — Tampering (Adulteração de Dados)

| Ameaça                           | Alvo         | Controle Atual                     | Status      |
| -------------------------------- | ------------ | ---------------------------------- | ----------- |
| Aluno edita dados de outro aluno | CRUD actions | Server Actions verificam role      | ✅ MITIGADO |
| Input malicioso em formulários   | Forms        | Zod validation em todas as actions | ✅ MITIGADO |
| SQL injection via Prisma         | Database     | Prisma usa prepared statements     | ✅ MITIGADO |

### R — Repudiation (Repúdio)

| Ameaça                        | Alvo        | Controle Atual             | Status |
| ----------------------------- | ----------- | -------------------------- | ------ |
| Negar que deletou aluno       | Audit trail | Sem audit log implementado | ⚠️ GAP |
| Negar que registrou pagamento | Pagamentos  | Sem log de ações           | ⚠️ GAP |

**Mitigação recomendada** (It5): Adicionar campo `createdBy` e `updatedBy` nos
models críticos. Baixa prioridade para MVP acadêmico.

### I — Information Disclosure (Vazamento de Informação)

| Ameaça                           | Alvo            | Controle Atual                    | Status        |
| -------------------------------- | --------------- | --------------------------------- | ------------- |
| CPF exposto em logs do servidor  | Logs            | Sentry configurado para scrub PII | ✅ após T-6.x |
| Dados de alunos em erro messages | Error responses | Mensagens genéricas ao usuário    | ✅ MITIGADO   |
| Supabase URL exposta             | .env            | .env no .gitignore                | ✅ MITIGADO   |
| JWT em localStorage              | Client storage  | Supabase SSR usa cookies httpOnly | ✅ MITIGADO   |

### D — Denial of Service (Negação de Serviço)

| Ameaça                              | Alvo          | Controle Atual              | Status |
| ----------------------------------- | ------------- | --------------------------- | ------ |
| Flood de requests em Server Actions | API rate      | Sem rate limiting           | ⚠️ GAP |
| AI API bill spike                   | Genkit/Gemini | Sem quota limit configurado | ⚠️ GAP |

**Mitigação recomendada** (It5): Rate limiting via Vercel middleware.
Quota no Google AI Studio para o projeto Gemini.

### E — Elevation of Privilege (Escalada de Privilégio)

| Ameaça                            | Alvo                  | Controle Atual             | Status      |
| --------------------------------- | --------------------- | -------------------------- | ----------- |
| RECEPCIONISTA acessa financeiro   | /dashboard/financeiro | Middleware + requireRole() | ✅ MITIGADO |
| INSTRUTOR deleta aluno            | Ação de GERENTE       | requireRole(Role.GERENTE)  | ✅ MITIGADO |
| Aluno acessa dados de outro aluno | Student portal        | Server-side user context   | ✅ MITIGADO |

## Resumo de Gaps (para It5)

1. Sem audit log de ações críticas (delete, pagamento)
2. Sem rate limiting em Server Actions
3. Sem quota configurada na API do Gemini
4. Sentry precisa de PII scrubbing configurado (resolvido em T-6.4)
```

**Verificação**: Arquivo existe. Todas as células STRIDE preenchidas. Gaps documentados.

---

### T-1.4 — Criar `docs/process/RFC-TEMPLATE.md`

**Ação**: Criar template de RFC para mudanças arquiteturais.

**Conteúdo a criar**:

```markdown
# RFC-[NÚMERO]: [Título]

**Data**: [YYYY-MM-DD]
**Autor**: [nome]
**Status**: Draft | Under Review | Accepted | Rejected | Superseded
**Review deadline**: [data + 48h]

## Problema

[O que está errado ou faltando. Evidência concreta.]

## Proposta

[O que vai ser mudado. Seja específico sobre arquivos, APIs, contratos.]

## Alternativas Consideradas

| Alternativa | Razão para rejeitar |
| ----------- | ------------------- |
| [opção A]   | [por que não]       |

## Impacto

- **Código afetado**: [arquivos/módulos]
- **Breaking change**: Sim / Não
- **Migration necessária**: Sim / Não — [descrever]
- **Constituição**: [princípio afetado, se houver]

## Plano de Rollback

[O que fazer se a mudança for problemática em produção.]

## Decisão

[Preenchido após review] Aceito / Rejeitado por [razão].
```

**Quando criar um RFC**:

- Mudança que afeta mais de 3 arquivos com impacto arquitetural
- Adição ou remoção de dependência principal
- Mudança no schema do banco de dados com migration
- Qualquer mudança à Constitution

**Quando NÃO criar RFC**: Bugfixes, mudanças de UI, novos componentes isolados.

**Verificação**: Arquivo existe. Template tem todas as seções.

---

### T-1.5 — Criar `docs/process/POSTMORTEM-TEMPLATE.md`

**Ação**: Criar template de análise pós-incidente blameless.

**Conteúdo a criar**:

```markdown
# Postmortem: [Título do Incidente]

**Data do incidente**: [YYYY-MM-DD HH:MM]
**Data deste documento**: [YYYY-MM-DD]
**Severidade**: P0 (sistema fora) | P1 (feature crítica impactada) | P2 (degradação)
**Duração**: [ex: 45 minutos]
**Autor**: [nome]

## O que aconteceu

[Descrição factual. Sem julgamentos. O que o usuário experimentou.]

## Timeline

| Hora  | Evento                    |
| ----- | ------------------------- |
| HH:MM | Incidente iniciou         |
| HH:MM | Detectado por [quem/como] |
| HH:MM | Diagnóstico confirmado    |
| HH:MM | Mitigação aplicada        |
| HH:MM | Sistema restaurado        |

## Root Cause

[A causa raiz técnica. Use "5 Whys" se necessário.]

Por que X? → Porque Y.
Por que Y? → Porque Z.
[Continue até a causa real.]

## Impacto

- **Usuários afetados**: [estimativa]
- **Funcionalidades impactadas**: [lista]
- **Dados perdidos**: Sim / Não

## O que funcionou bem

[O que ajudou a resolver mais rápido. Honestidade é encorajada.]

## O que pode melhorar

[Processo, ferramentas, documentação. Sem culpar pessoas.]

## Action Items

| Item              | Responsável | Prazo  | Status   |
| ----------------- | ----------- | ------ | -------- |
| [ação preventiva] | [nome]      | [data] | Pendente |

**Nota**: Este documento é blameless. O objetivo é aprender, não punir.
Sistemas complexos falham — o que importa é não falhar da mesma forma duas vezes.
```

**Verificação**: Arquivo existe. Template tem seção "O que funcionou bem" (indica cultura blameless).

---

### T-1.6 — Atualizar `CLAUDE.md` com Session Protocol

**Ação**: Adicionar seção de protocolo de sessão AI no `CLAUDE.md`.

**Conteúdo a adicionar** (ao final do CLAUDE.md existente):

```markdown
## AI Session Protocol

### Início de sessão obrigatório

1. Ler `docs/CURRENT-STATE.md` (snapshot do estado atual)
2. Ler spec da feature ativa em `specs/{branch}/spec.md`
3. Confirmar qual é o próximo step imediato antes de codar

### Final de sessão obrigatório

1. Atualizar `docs/CURRENT-STATE.md` com o que foi feito e próximo step
2. Atualizar `specs/{branch}/tasks.md` — marcar tasks completadas
3. Rodar `npm run lint && npm run test` — confirmar CI verde

### Contexto mínimo por role de agente

- **Architect**: Ler PDR-001.md + todos os ADRs antes de propor mudanças
- **Implementer**: Ler spec.md + plan.md + tasks.md da feature atual
- **Reviewer**: Ler código + checklist do plan.md + Constitution
- **Debugger**: Ler docs/dev-errors.md + arquivo específico com erro
```

**Verificação**: `CLAUDE.md` contém seção "AI Session Protocol".

---

## FASE 2 — Supabase Staging Branch

> **Objetivo**: Criar ambiente de staging isolado do banco de produção.
> Sem dependências de código. Requer acesso ao Supabase via MCP.
> **Estimativa total**: 30 min

---

### T-2.1 — Criar branch de staging no Supabase

**Ação**: Via Supabase MCP, criar uma database branch chamada `staging`.

**Comando**: Usar `mcp__supabase__create_branch` com:

- `project_ref`: `zqrlsupezgltofwotven` (SmartManagementSystem)
- `name`: `staging`
- `confirm_cost_id`: obter via `mcp__supabase__get_cost` primeiro

**O que acontece após criar**:

- Supabase gera novo PostgreSQL isolado com o mesmo schema
- Branch tem sua própria `SUPABASE_URL` e `ANON_KEY`

**Verificação**: Branch aparece em `mcp__supabase__list_branches`.

---

### T-2.2 — Obter credenciais da branch de staging

**Ação**: Obter a URL e chaves da branch criada.

**Comando**: Usar `mcp__supabase__get_project_url` e `mcp__supabase__get_publishable_keys`
com o branch ID retornado por T-2.1.

**Verificação**: Tem `SUPABASE_URL_STAGING` e `SUPABASE_ANON_KEY_STAGING`.

---

### T-2.3 — Criar `.env.staging`

**Ação**: Criar arquivo com variáveis do ambiente de staging (gitignored).

**Conteúdo**:

```env
# Staging Environment — NÃO COMMITAR
# Banco de dados isolado de produção (Supabase branch: staging)

NEXT_PUBLIC_SUPABASE_URL=[URL da branch staging]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON KEY da branch staging]
DATABASE_URL=[connection string da branch staging]

# Sentry (mesmo DSN de produção, environment diferente)
NEXT_PUBLIC_SENTRY_DSN=[DSN — preencher após T-6.1]
SENTRY_ENVIRONMENT=staging
```

**Verificação**: Arquivo criado. `DATABASE_URL` e `SUPABASE_URL` apontam para branch staging.
Confirmar que `.env.staging` está no `.gitignore`.

---

### T-2.4 — Atualizar `.env.example`

**Ação**: Adicionar todas as novas variáveis de ambiente ao `.env.example`.

**Variáveis a adicionar**:

```env
# Staging (para E2E tests e desenvolvimento isolado)
NEXT_PUBLIC_SUPABASE_URL_STAGING=
NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING=
DATABASE_URL_STAGING=

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ENVIRONMENT=development
```

**Verificação**: `git diff .env.example` mostra as novas variáveis. Sem valores reais.

---

### T-2.5 — Criar `prisma/seed-e2e.ts`

**Ação**: Criar seed determinístico para o banco de staging com usuários de teste.

**Conteúdo**:

```typescript
// prisma/seed-e2e.ts
// Seed determinístico para testes E2E. Roda APENAS em staging.
// UUIDs fixos garantem reprodutibilidade entre execuções.

import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

const TEST_USERS = [
  {
    uuid: '00000000-0000-0000-0000-000000000001',
    email: 'gerente@test.fivestar.com',
    password: 'TestPassword123!',
    nome: 'Gerente Teste',
    role: Role.GERENTE,
  },
  {
    uuid: '00000000-0000-0000-0000-000000000002',
    email: 'recep@test.fivestar.com',
    password: 'TestPassword123!',
    nome: 'Recepcionista Teste',
    role: Role.RECEPCIONISTA,
  },
  {
    uuid: '00000000-0000-0000-0000-000000000003',
    email: 'instrutor@test.fivestar.com',
    password: 'TestPassword123!',
    nome: 'Instrutor Teste',
    role: Role.INSTRUTOR,
  },
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  for (const user of TEST_USERS) {
    // Cria usuário no Supabase Auth (idempotente)
    await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { nome: user.nome },
    });

    // Cria registro em Funcionario (idempotente)
    await prisma.funcionario.upsert({
      where: { email: user.email },
      update: {},
      create: {
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
    });
  }

  console.log('✅ E2E seed concluído:', TEST_USERS.length, 'usuários criados');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Adicionar script ao `package.json`**:

```json
"seed:e2e": "dotenv -e .env.staging -- ts-node prisma/seed-e2e.ts"
```

**Verificação**: `npm run seed:e2e` popula o banco de staging sem erros.
Rodar duas vezes — deve ser idempotente (sem erros na segunda vez).

---

### T-2.6 — Criar `docs/operations/RUNBOOK.md`

**Ação**: Criar runbook de operações com deploy, rollback, e staging.

**Conteúdo**:

````markdown
# Runbook — SmartManagementSystem

## Ambientes

| Ambiente | URL                  | Banco                    | Branch Git                |
| -------- | -------------------- | ------------------------ | ------------------------- |
| Produção | [vercel-url]         | Supabase main            | main                      |
| Staging  | [vercel-preview-url] | Supabase branch: staging | 004-\* / feature branches |

## Deploy para Produção

Processo automático via GitHub Actions:

1. PR aprovado e mergeado em `main`
2. Vercel detecta push → build automático
3. GitHub Actions roda: lint → test → E2E → deploy
4. Deploy completo em ~3 minutos

**Deploy manual de emergência**:

```bash
vercel --prod  # Requer Vercel CLI instalado e autenticado
```
````

## Rollback de Produção

**Via Vercel Dashboard** (mais rápido, ~30s):

1. Acessar vercel.com → Projeto → Deployments
2. Encontrar o deploy anterior (verde)
3. Clicar "..." → "Promote to Production"

**Via CLI**:

```bash
vercel rollback [deployment-url]
```

## Acesso ao Banco de Produção (emergência)

```bash
# NUNCA rodar migrations em produção manualmente
# Usar APENAS para queries de leitura em emergência
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Aluno\";"
```

## Banco de Staging

```bash
# Resetar staging ao estado inicial (apaga dados de teste)
npm run seed:e2e

# Aplicar nova migration em staging
DATABASE_URL=$DATABASE_URL_STAGING npx prisma migrate deploy
```

## Monitoramento

- **Erros**: sentry.io → SmartManagementSystem
- **Uptime**: Vercel Dashboard → Analytics
- **Banco**: Supabase Dashboard → Reports

## Contatos de Escalada

| Nível | Quando              | Contato                                   |
| ----- | ------------------- | ----------------------------------------- |
| L1    | Bug em produção     | Time de dev (GitHub Issues)               |
| L2    | Dados corrompidos   | DBA / Supabase Support                    |
| L3    | Brecha de segurança | Desligar o sistema, notificar responsável |

````

**Verificação**: Arquivo existe. Seções de deploy, rollback, staging, e monitoramento presentes.

---

## FASE 3 — ESLint Quality Gates

> **Objetivo**: Elevar `no-explicit-any` e `no-unused-vars` de `warn` para `error`.
> **Pré-requisito**: Corrigir TODAS as ocorrências existentes primeiro.
> **Estimativa total**: 1.5h (25 violações em ~20 arquivos)

---

### T-3.1 — Auditar violações `any` por arquivo

**Ação**: Mapear exatamente quais linhas precisam de correção vs supressão.

**Comando**:
```bash
npm run lint 2>&1 | grep -B2 "no-explicit-any" | grep -E "^\/.+\.tsx?$"
````

**Output esperado**: Lista de arquivos com contagem. Categorizar:

- **Corrigir**: Tipos Prisma disponíveis (`Aluno`, `Funcionario`, `Treino`, etc.)
- **Suprimir com comentário**: SDK externo sem tipos (Genkit, use-toast)
- **Excluir do lint**: Arquivos 100% gerados (use-toast.ts se for shadcn puro)

**Verificação**: Planilha mental de 3 colunas: arquivo | linha | ação.

---

### T-3.2 — Corrigir `any` em `src/lib/actions/alunos.ts`

**Ação**: Substituir `any` pelos tipos Prisma correspondentes.

**Padrão de correção**:

```typescript
// ANTES
async function action(data: any) { ... }

// DEPOIS
import type { Aluno, Prisma } from '@prisma/client';
async function action(data: Prisma.AlunoCreateInput) { ... }
```

**Verificação**: `npx eslint src/lib/actions/alunos.ts` → 0 warnings de `any`.

---

### T-3.3 — Corrigir `any` em `src/lib/actions/treinos.ts`

Mesmo padrão de T-3.2. Usar tipos `Treino`, `Exercicio`, `Prisma.TreinoCreateInput`.

**Verificação**: `npx eslint src/lib/actions/treinos.ts` → 0 warnings de `any`.

---

### T-3.4 — Corrigir `any` em `src/lib/actions/financeiro.ts`

Mesmo padrão. Usar tipos `Pagamento`, `Matricula`, `Prisma.PagamentoCreateInput`.

**Verificação**: `npx eslint src/lib/actions/financeiro.ts` → 0 warnings de `any`.

---

### T-3.5 — Corrigir `any` em `src/lib/data.ts`

**Ação**: Tipar funções de query com tipos de retorno Prisma explícitos.

**Padrão**:

```typescript
// ANTES
export async function getAlunos(): Promise<any[]> { ... }

// DEPOIS
import type { Aluno, Matricula, Plano } from '@prisma/client';
type AlunoComMatricula = Aluno & { matriculas: (Matricula & { plano: Plano })[] };
export async function getAlunos(): Promise<AlunoComMatricula[]> { ... }
```

**Verificação**: `npx eslint src/lib/data.ts` → 0 warnings de `any`.

---

### T-3.6 — Corrigir `any` em componentes de dashboard

**Arquivos**: `dashboard-charts.tsx`, `form-matricula.tsx`, `workout-generator.tsx`

**Padrão para props de componentes**:

```typescript
// ANTES
interface Props {
  data: any;
}

// DEPOIS — usar tipos de retorno das funções em data.ts
interface Props {
  data: AlunoComMatricula[];
}
```

**Verificação**: `npx eslint src/components/dashboard/` → 0 warnings de `any`.

---

### T-3.7 — Corrigir `any` em hooks e pages

**Arquivos**: `use-workout-tracker.ts`, pages do aluno

**Para hooks com estado complexo**:

```typescript
// ANTES
const [data, setData] = useState<any>(null);

// DEPOIS — inferir do tipo da função que popula o estado
const [data, setData] = useState<TreinoComExercicios | null>(null);
```

**Verificação**: `npx eslint src/hooks/ src/app/aluno/` → 0 warnings de `any`.

---

### T-3.8 — Suprimir `any` justificados com comentário inline

**Arquivos**: `workout-generator-flow.ts` (Genkit SDK), `src/lib/prisma.ts`

**Padrão**:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Genkit SDK v1.31: output type not exported — tracked in issue #XXX
const result = (await flow(input)) as any;
```

**Verificação**: Toda supressão tem comentário explicativo na linha anterior.

---

### T-3.9 — Elevar `no-explicit-any` para `error` no ESLint

**Ação**: Editar `eslint.config.mjs`.

**Mudança exata**:

```javascript
// ANTES
'@typescript-eslint/no-explicit-any': 'warn',

// DEPOIS
'@typescript-eslint/no-explicit-any': 'error',
```

**Verificação**: `npm run lint` → 0 errors, 0 warnings de `any`.
CI deve passar. Se falhar, há `any` não corrigido — voltar para T-3.2–T-3.8.

---

### T-3.10 — Corrigir violações de `no-unused-vars`

**Ação**: Remover imports e variáveis não utilizados em todos os arquivos.

**Identificar**:

```bash
npm run lint 2>&1 | grep "no-unused-vars" | grep -oP "(?<=\s)\S+\.tsx?(?=\s)" | sort -u
```

**Padrão de correção**: Remover o import/declaração. Não comentar — deletar.

**Verificação**: `npm run lint 2>&1 | grep "no-unused-vars"` → vazio.

---

### T-3.11 — Elevar `no-unused-vars` para `error` no ESLint

**Ação**: Editar `eslint.config.mjs`.

**Mudança exata**:

```javascript
// ANTES
'@typescript-eslint/no-unused-vars': 'warn',

// DEPOIS
'@typescript-eslint/no-unused-vars': 'error',
```

**Verificação final**: `npm run lint` → 0 errors, 0 warnings. `npm run test` → all passing.

---

## FASE 4 — Coverage Threshold

> **Objetivo**: Enforçar 80% de coverage em `src/lib/` e `src/services/`.
> Coverage global (1.72%) não é target — UI e framework code ficam fora.
> **Estimativa total**: 1h

---

### T-4.1 — Identificar funções sem cobertura em `src/lib/`

**Ação**: Analisar relatório de coverage e listar funções não testadas.

**Comando**:

```bash
npm run test:coverage 2>&1 | grep -A2 "src/lib"
```

**Funções prioritárias a testar** (baseado no coverage report atual):

- `src/lib/data.ts`: 0% — `getAlunos`, `getAlunoById`, `getFuncionarios`
- `src/lib/actions/alunos.ts`: 0% — `createAluno`, `updateAluno`, `deleteAluno`
- `src/lib/actions/planos.ts`: 0% — `createPlano`, `updatePlano`

**Verificação**: Lista de funções documentada. Entender quais são testáveis em
isolamento (sem Supabase client real) e quais precisam de mock.

---

### T-4.2 — Escrever testes para `src/lib/data.ts`

**Ação**: Criar `src/lib/data.test.ts` com mocks do Prisma.

**Padrão de mock do Prisma em Vitest**:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aluno: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('getAlunos', () => {
  it('returns list of alunos', async () => {
    const mockAlunos = [{ id: '1', nome: 'Teste', cpf: '000.000.000-00' }];
    vi.mocked(prisma.aluno.findMany).mockResolvedValue(mockAlunos as any);

    const result = await getAlunos();
    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Teste');
  });
});
```

**Cobertura mínima**: `getAlunos`, `getAlunoById` (found + not found), `getFuncionarios`.

**Verificação**: `npx vitest run src/lib/data.test.ts` → all passing.

---

### T-4.3 — Escrever testes para `src/lib/actions/alunos.ts`

**Ação**: Criar `src/lib/actions/alunos.test.ts`.

**Casos críticos a testar**:

- `createAluno`: input válido → sucesso
- `createAluno`: input inválido (CPF mal formatado) → erro Zod
- `deleteAluno`: role GERENTE → sucesso
- `deleteAluno`: role RECEPCIONISTA → erro de autorização

**Verificação**: `npx vitest run src/lib/actions/alunos.test.ts` → all passing.

---

### T-4.4 — Configurar coverage threshold em `vitest.config.ts`

**Ação**: Adicionar thresholds scoped para `src/lib/` e `src/services/`.

**Mudança exata no `vitest.config.ts`**:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'lcov'],
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/components/ui/**',  // shadcn gerado
    'src/app/**',            // Next.js pages/layouts
    'src/hooks/**',          // hooks de UI
  ],
  thresholds: {
    'src/lib/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/services/**': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
},
```

**Verificação**: `npm run test:coverage` → CI não falha com threshold.
Se falhar, voltar para T-4.2/T-4.3 e adicionar mais testes.

---

## FASE 5 — Playwright E2E

> **Objetivo**: Proteger os 4 critical paths do sistema com testes automatizados.
> **Pré-requisito**: T-2.1 a T-2.5 (staging com seed) concluídos.
> **Estimativa total**: 2.5h

---

### T-5.1 — Instalar Playwright

**Comando**:

```bash
npm init playwright@latest -- --quiet --lang=ts --no-browsers --no-examples
npx playwright install chromium --with-deps
```

**O que o wizard gera**: `playwright.config.ts`, `tests/` directory, `.gitignore` entries.

**Verificação**: `npx playwright --version` → versão instalada. Sem erros.

---

### T-5.2 — Configurar `playwright.config.ts`

**Ação**: Substituir o config gerado pelo wizard pelo config correto para Next.js + Supabase.

**Conteúdo final**:

```typescript
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.staging' });

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: false, // Evita conflitos no banco de staging
  retries: process.env.CI ? 1 : 0,
  workers: 1, // 1 worker — banco compartilhado de staging
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    },
  },
});
```

**Verificação**: `npx playwright test --list` → lista vazia (sem spec files ainda). Sem erros de config.

---

### T-5.3 — Criar helper de autenticação `tests/e2e/helpers/auth.ts`

**Ação**: Criar função reutilizável de login para os testes.

**Conteúdo**:

```typescript
import { Page } from '@playwright/test';

type TestRole = 'GERENTE' | 'RECEPCIONISTA' | 'INSTRUTOR' | 'ALUNO';

const TEST_CREDENTIALS: Record<TestRole, { email: string; password: string }> = {
  GERENTE: { email: 'gerente@test.fivestar.com', password: 'TestPassword123!' },
  RECEPCIONISTA: { email: 'recep@test.fivestar.com', password: 'TestPassword123!' },
  INSTRUTOR: { email: 'instrutor@test.fivestar.com', password: 'TestPassword123!' },
  ALUNO: { email: 'aluno@test.fivestar.com', password: 'TestPassword123!' },
};

export async function loginAs(page: Page, role: TestRole) {
  const { email, password } = TEST_CREDENTIALS[role];
  const loginUrl = role === 'ALUNO' ? '/aluno/login' : '/login';

  await page.goto(loginUrl);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();
  await page.waitForURL(role === 'ALUNO' ? '/aluno/dashboard' : '/dashboard');
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: /sair/i }).click();
  await page.waitForURL('/login');
}
```

**Verificação**: Arquivo criado sem erros de TypeScript.

---

### T-5.4 — Escrever `tests/e2e/specs/auth.spec.ts`

**Critical path**: Cada role faz login e é redirecionado para a página correta.

**Conteúdo**:

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Autenticação e Redirect por Role', () => {
  test('GERENTE → /dashboard', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    expect(page.url()).toContain('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });

  test('RECEPCIONISTA → /dashboard', async ({ page }) => {
    await loginAs(page, 'RECEPCIONISTA');
    expect(page.url()).toContain('/dashboard');
  });

  test('INSTRUTOR → /dashboard', async ({ page }) => {
    await loginAs(page, 'INSTRUTOR');
    expect(page.url()).toContain('/dashboard');
  });

  test('Login com credenciais inválidas → erro', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('naoexiste@test.com');
    await page.getByLabel(/senha/i).fill('senhaerrada');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByText(/inválid|incorret|erro/i)).toBeVisible();
  });
});
```

**Verificação**: `npx playwright test auth.spec.ts` → 4/4 passing.

---

### T-5.5 — Escrever `tests/e2e/specs/financial-access.spec.ts`

**Critical path**: Acesso financeiro por role (o mais crítico de segurança).

**Conteúdo**:

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Controle de Acesso Financeiro', () => {
  test('GERENTE acessa /dashboard/financeiro', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await page.goto('/dashboard/financeiro');
    expect(page.url()).toContain('/financeiro');
    await expect(page.getByRole('heading', { name: /financeiro/i })).toBeVisible();
  });

  test('RECEPCIONISTA é redirecionado de /dashboard/financeiro', async ({ page }) => {
    await loginAs(page, 'RECEPCIONISTA');
    await page.goto('/dashboard/financeiro');
    expect(page.url()).not.toContain('/financeiro');
    // Deve ser redirecionado para /dashboard ou /dashboard/alunos
  });

  test('INSTRUTOR é redirecionado de /dashboard/financeiro', async ({ page }) => {
    await loginAs(page, 'INSTRUTOR');
    await page.goto('/dashboard/financeiro');
    expect(page.url()).not.toContain('/financeiro');
  });

  test('GERENTE acessa /dashboard/planos', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await page.goto('/dashboard/planos');
    expect(page.url()).toContain('/planos');
  });

  test('RECEPCIONISTA é redirecionado de /dashboard/planos', async ({ page }) => {
    await loginAs(page, 'RECEPCIONISTA');
    await page.goto('/dashboard/planos');
    expect(page.url()).not.toContain('/planos');
  });
});
```

**Verificação**: `npx playwright test financial-access.spec.ts` → 5/5 passing.

---

### T-5.6 — Escrever `tests/e2e/specs/student-portal.spec.ts`

**Critical path**: Portal do aluno acessível e isolado do dashboard admin.

**Conteúdo**:

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Portal do Aluno', () => {
  test('Aluno faz login e acessa /aluno/dashboard', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    expect(page.url()).toContain('/aluno/dashboard');
  });

  test('Aluno não acessa /dashboard admin', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await page.goto('/dashboard');
    expect(page.url()).not.toContain('/dashboard');
    // Deve ser redirecionado para /aluno/dashboard ou /aluno/login
  });

  test('Aluno vê lista de treinos em /aluno/meus-treinos', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await page.goto('/aluno/meus-treinos');
    expect(page.url()).toContain('/meus-treinos');
  });
});
```

**Verificação**: `npx playwright test student-portal.spec.ts` → 3/3 passing.

---

### T-5.7 — Escrever `tests/e2e/specs/nav-visibility.spec.ts`

**Critical path**: Links de navegação corretos por role.

**Conteúdo**:

```typescript
import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Visibilidade de Navegação por Role', () => {
  test('GERENTE vê link Financeiro na nav', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await expect(page.getByRole('link', { name: /financeiro/i })).toBeVisible();
  });

  test('RECEPCIONISTA NÃO vê link Financeiro na nav', async ({ page }) => {
    await loginAs(page, 'RECEPCIONISTA');
    await expect(page.getByRole('link', { name: /financeiro/i })).not.toBeVisible();
  });

  test('INSTRUTOR NÃO vê link Financeiro na nav', async ({ page }) => {
    await loginAs(page, 'INSTRUTOR');
    await expect(page.getByRole('link', { name: /financeiro/i })).not.toBeVisible();
  });
});
```

**Verificação**: `npx playwright test nav-visibility.spec.ts` → 3/3 passing.

---

### T-5.8 — Criar `tests/e2e/CRITICAL-PATHS.md`

**Ação**: Documentar os critical paths cobertos e os que estão pendentes.

**Conteúdo**:

```markdown
# Critical Paths — E2E Coverage

## Cobertos (Fase 5 — Feature 004)

| Path                          | Arquivo                  | Cenários                                        |
| ----------------------------- | ------------------------ | ----------------------------------------------- |
| Login e redirect por role     | auth.spec.ts             | 4 (3 roles + credencial inválida)               |
| Controle de acesso financeiro | financial-access.spec.ts | 5 (GERENTE ok, 2 roles bloqueados × 2 rotas)    |
| Portal do aluno isolado       | student-portal.spec.ts   | 3 (login, acesso admin bloqueado, meus-treinos) |
| Visibilidade de nav por role  | nav-visibility.spec.ts   | 3 (GERENTE vê, RECEP/INSTRUTOR não veem)        |

**Total**: 15 cenários E2E

## Pendentes (It3/It4)

| Path                                     | Prioridade | Quando |
| ---------------------------------------- | ---------- | ------ |
| GERENTE cria aluno → aparece na lista    | Alta       | It3    |
| Gerador de treino IA → salva no banco    | Alta       | It3    |
| Aluno completa treino → XP incrementa    | Média      | It4    |
| Pagamento registrado → status atualizado | Média      | It3    |
```

**Verificação**: Arquivo criado. Tabela de pendentes é o backlog de E2E futuros.

---

### T-5.9 — Adicionar scripts E2E ao `package.json`

**Mudança exata**:

```json
"scripts": {
  "e2e": "playwright test",
  "e2e:ui": "playwright test --ui",
  "e2e:report": "playwright show-report"
}
```

**Verificação**: `npm run e2e -- --list` → lista os 15 cenários.

---

### T-5.10 — Adicionar job E2E ao `.github/workflows/ci.yml`

**Ação**: Adicionar terceiro job após `test`.

**Adição ao YAML**:

```yaml
e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  needs: test # Roda após unit tests passarem
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL_STAGING }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY_STAGING }}
    DATABASE_URL: ${{ secrets.DATABASE_URL_STAGING }}
    PLAYWRIGHT_BASE_URL: http://localhost:3000
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx playwright install chromium --with-deps
    - run: npm run seed:e2e
    - run: npm run e2e
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7
```

**Verificação**: Push no branch → CI mostra 3 jobs. E2E job fica verde após seed.

---

### T-5.11 — Documentar secrets necessários no RUNBOOK

**Ação**: Adicionar seção ao `docs/operations/RUNBOOK.md` com lista de secrets do GitHub.

Ver tabela em `quickstart.md` — copiar para RUNBOOK com instrução de onde configurar.

**Verificação**: RUNBOOK tem seção "GitHub Actions Secrets" com 5 secrets documentados.

---

## FASE 6 — Sentry Error Tracking

> **Objetivo**: Capturar 100% dos erros de produção antes que usuários reclamem.
> **Pré-requisito**: Conta no sentry.io (passo manual T-6.1).
> **Estimativa total**: 45 min (após T-6.1)

---

### T-6.1 — Criar projeto no Sentry [MANUAL]

**Ação humana necessária** (não automatizável):

1. Acessar https://sentry.io/signup/ (conta gratuita)
2. Criar nova organização: "FiveStar" (ou nome preferido)
3. Criar projeto: Platform = **Next.js**, Nome = `smart-management-system`
4. Copiar o **DSN** gerado (formato: `https://[chave]@sentry.io/[projeto-id]`)
5. Gerar **Auth Token**: Settings → Auth Tokens → Create New Token
   - Scopes necessários: `project:releases`, `org:read`

**Output**: `NEXT_PUBLIC_SENTRY_DSN=https://...` e `SENTRY_AUTH_TOKEN=sntrys_...`

**Verificação**: DSN e Auth Token em mãos. Confirmar antes de T-6.2.

---

### T-6.2 — Instalar `@sentry/nextjs` via wizard

**Comando** (após ter o DSN):

```bash
npx @sentry/wizard@latest -i nextjs
```

**O wizard vai perguntar**:

- DSN: colar o DSN de T-6.1
- Source maps: `yes`
- CI/CD: `yes` (para adicionar SENTRY_AUTH_TOKEN)
- Tunnel: `no`

**O wizard gera automaticamente**:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Atualiza `next.config.ts` com `withSentryConfig`
- Atualiza `instrumentation.ts` (ou cria se não existir)

**Verificação**: Arquivos `sentry.*.config.ts` existem. `next.config.ts` tem `withSentryConfig`.

---

### T-6.3 — Configurar PII scrubbing no Sentry

**Ação**: Editar `sentry.server.config.ts` para remover dados sensíveis dos eventos.

**Adição ao config**:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || 'development',

  // PII scrubbing — LGPD compliance
  beforeSend(event) {
    // Remove CPF de breadcrumbs e dados de request
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      if (data.cpf) data.cpf = '[REDACTED]';
    }
    return event;
  },

  // Não capturar erros 404 (muito ruído)
  ignoreErrors: ['NotFoundError', 'NEXT_NOT_FOUND'],
});
```

**Verificação**: Config tem `beforeSend` com redação de CPF.

---

### T-6.4 — Adicionar variáveis Sentry ao `.env.example`

**Mudança** (já planejada em T-2.4, confirmar que está lá):

```env
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ENVIRONMENT=development
```

**Verificação**: `.env.example` tem as 3 variáveis Sentry sem valores reais.

---

### T-6.5 — Testar captura de erro no Sentry

**Ação**: Lançar erro de teste e verificar no dashboard Sentry.

**Método**: Criar rota temporária de teste:

```typescript
// src/app/api/sentry-test/route.ts (DELETAR após verificação)
export function GET() {
  throw new Error('Sentry test error — pode deletar esta rota');
}
```

**Passos**:

1. Rodar `npm run dev`
2. Acessar `http://localhost:3000/api/sentry-test`
3. Verificar no Sentry dashboard: erro deve aparecer em < 30s

**Após verificação**: Deletar `src/app/api/sentry-test/route.ts`.

**Verificação**: Erro visível no Sentry dashboard. Arquivo de teste deletado.

---

### T-6.6 — Criar `docs/observability/MONITORING.md`

**Conteúdo**:

```markdown
# Monitoring — SmartManagementSystem

## Stack de Observabilidade

| Ferramenta         | O que monitora                     | Dashboard              |
| ------------------ | ---------------------------------- | ---------------------- |
| Sentry             | Erros de runtime (server + client) | sentry.io              |
| Vercel Analytics   | Core Web Vitals, tráfego           | vercel.com → Analytics |
| Supabase Dashboard | Queries lentas, tamanho do banco   | supabase.com           |

## Alertas Configurados (Sentry)

| Alerta      | Trigger                      | Destino                |
| ----------- | ---------------------------- | ---------------------- |
| Novo erro   | Qualquer erro inédito        | Email do desenvolvedor |
| Error spike | > 10 erros iguais em 1h      | Email                  |
| Performance | LCP > 3s em > 5% das páginas | Email                  |

## SLOs (ver SLOS.md)

## O que NÃO está monitorado (gaps)

- Rate limiting (não implementado — risco D do threat model)
- Audit log de ações críticas (gap documentado no threat model)
- Uptime externo (sem serviço de healthcheck externo)
```

**Verificação**: Arquivo existe. Seção "gaps" documenta o que falta honestamente.

---

## FASE 7 — SLOs e Incident Response

> **Objetivo**: Documentar targets de qualidade e procedimento de crise.
> Sem dependências de código. Pode ser feito em paralelo com qualquer fase.
> **Estimativa total**: 20 min

---

### T-7.1 — Criar `docs/observability/SLOS.md`

**Conteúdo**:

```markdown
# Service Level Objectives — SmartManagementSystem

**Versão**: 1.0.0 | **Data**: 2026-04-09
**Review**: A cada iteration (a cada ~3 semanas)

## SLOs de Disponibilidade

| Serviço          | SLO                  | Método de medição    |
| ---------------- | -------------------- | -------------------- |
| Dashboard admin  | 99% uptime/mês       | Vercel Analytics     |
| Portal do aluno  | 99% uptime/mês       | Vercel Analytics     |
| Supabase (banco) | 99.9% (Supabase SLA) | Supabase Status page |

## SLOs de Performance (Core Web Vitals)

| Métrica                        | Target  | Página                       |
| ------------------------------ | ------- | ---------------------------- |
| LCP (Largest Contentful Paint) | < 2.5s  | /dashboard, /aluno/dashboard |
| CLS (Cumulative Layout Shift)  | < 0.1   | Todas                        |
| FID/INP (Interaction)          | < 200ms | Formulários e tabelas        |

**Medição**: Vercel Analytics → Web Vitals tab (dados reais de usuários)

## SLOs de Qualidade de Código

| Métrica                    | Target | Frequência de verificação |
| -------------------------- | ------ | ------------------------- |
| Zero erros TypeScript      | 100%   | A cada PR (CI)            |
| Zero erros ESLint          | 100%   | A cada PR (CI)            |
| Coverage src/lib/          | ≥ 80%  | A cada PR (CI)            |
| E2E critical paths passing | 100%   | A cada PR (CI)            |

## Error Budget

Com SLO de 99% de uptime/mês:

- **Budget disponível**: 7.2 horas de downtime/mês
- **Ação se budget consumido**: Freeze de features, foco em estabilidade

## Histórico de Violações

| Data           | SLO violado | Duração | Postmortem |
| -------------- | ----------- | ------- | ---------- |
| (nenhum ainda) | —           | —       | —          |
```

**Verificação**: Arquivo existe. Todos os SLOs têm método de medição.

---

### T-7.2 — Criar `docs/operations/INCIDENT-RESPONSE.md`

**Conteúdo**:

````markdown
# Incident Response — SmartManagementSystem

## Severidades

| Severidade | Definição                                                 | Tempo de resposta |
| ---------- | --------------------------------------------------------- | ----------------- |
| P0         | Sistema completamente fora (todas as páginas 500)         | Imediato          |
| P1         | Feature crítica indisponível (login, cadastro, pagamento) | < 1 hora          |
| P2         | Degradação de performance ou feature secundária           | < 24 horas        |
| P3         | Bug cosmético, não bloqueia uso                           | Próximo sprint    |

## Protocolo P0/P1

1. **Detectar**: Sentry alert, usuário reporta, ou CI falha em main
2. **Confirmar**: Reproduzir em staging. Não age em produção sem confirmar
3. **Comunicar**: Criar GitHub Issue com label `incident` + severidade
4. **Mitigar**: Rollback imediato se deploy recente causou (ver RUNBOOK.md)
5. **Resolver**: Fix em feature branch → PR de emergência → merge rápido
6. **Postmortem**: Criar doc em `docs/postmortems/YYYY-MM-DD-titulo.md`
   usando o template em `docs/process/POSTMORTEM-TEMPLATE.md`

## Checklist de Diagnóstico Rápido

```bash
# 1. Ver erros recentes
# → Sentry dashboard → Issues → ordenar por Last Seen

# 2. Ver se foi deploy recente
git log --oneline -10

# 3. Testar health do banco
psql $DATABASE_URL -c "SELECT 1;"

# 4. Ver logs do servidor
# → Vercel Dashboard → Functions → Logs
```
````

## Contato de Emergência

Projeto acadêmico — escalada para professor/orientador em caso de perda de dados.

```

**Verificação**: Arquivo existe. Protocolo P0 tem 6 passos numerados.

---

## Resumo Executivo

| Fase | Tasks | Estimativa | Dependências |
|---|---|---|---|
| 1 — AI Protocol + Docs | T-1.1 a T-1.6 | 45 min | Nenhuma |
| 2 — Staging Supabase | T-2.1 a T-2.6 | 30 min | Nenhuma |
| 3 — ESLint Gates | T-3.1 a T-3.11 | 1.5h | Nenhuma |
| 4 — Coverage | T-4.1 a T-4.4 | 1h | Fase 3 (tipos corretos) |
| 5 — Playwright E2E | T-5.1 a T-5.11 | 2.5h | Fase 2 (staging) |
| 6 — Sentry | T-6.1 a T-6.6 | 45 min | T-6.1 manual |
| 7 — SLOs + Ops | T-7.1 a T-7.2 | 20 min | Nenhuma |
| **TOTAL** | **40 tasks** | **~7 horas** | — |

**Sequência recomendada para máxima eficiência**:

```

Fases 1 + 2 + 7 em paralelo (pura documentação, sem conflitos)
→ Fase 3 (ESLint — bloqueia Fase 4)
→ Fase 4 (Coverage — precisa de tipos corretos)
→ Fase 6 (Sentry — T-6.1 manual pode ser feito enquanto Fase 3 roda)
→ Fase 5 (E2E — última, depende de staging + tipos corretos)

```

```
