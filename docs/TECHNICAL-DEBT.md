# Technical Debt — Five Star Academy

> **Propósito**: Registrar débitos técnicos identificados mas não resolvidos durante as sessões de desenvolvimento. Atualizado em 2026-06-09.
>
> Itens marcados com **(CI)** bloqueiam a CI ou causam falha em checks. Itens **(WARN)** são conhecidos mas não bloqueantes.

---

## 1. ESLint — 10 Warnings (0 Errors)

**Severidade**: WARN (não bloqueia `npm run lint` — exit 0)

**Última medição**: 2026-06-08 (`npm run lint` → 0 errors, 10 warnings)

### 1.1 `react-hooks/set-state-in-effect` — 7 warnings

Regra do React Compiler (eslint-config-next v16) que proíbe `setState` síncrono dentro de `useEffect`. Downgradado de `error` para `warn` em v1.3.1 (PR #105).

**Arquivos afetados**:

- `src/hooks/use-workout-tracker.ts:12` — `setCheckedExercises` dentro de `useEffect` para restaurar estado do `localStorage`
- `src/components/ui/sidebar.tsx` — 6 ocorrências em componentes shadcn/ui (não authorados pelo projeto)

**Por que não foi resolvido**: Os padrões afetados são legítimos (hidratação de `localStorage`, estado de sidebar). A refatoração para `useSyncExternalStore` ou initializer functions requer mudanças mais profundas.

**Solução proposta**: Refatorar `use-workout-tracker.ts` para usar lazy initializer (`useState(() => { ... })`) ou `useSyncExternalStore`. Componentes shadcn/ui manter suppression.

### 1.2 `react-hooks/incompatible-library` — 2 warnings

Regra do React Compiler que detecta incompatibilidades entre hooks e bibliotecas externas.

**Arquivos afetados**:

- `src/hooks/use-mobile.tsx:13-16` — MediaQueryList listener pattern
- `src/lib/data.ts:28` — `console.log` (no-console)

### 1.3 `no-console` — 1 warning

- `src/lib/data.ts:28` — `console.log` residual em produção.

---

## 2. Prettier — Config Gap em 13 Arquivos Markdown

**Severidade**: LOW (não bloqueia `npm run format:check` — são arquivos de evidência, não de produção)

**Detalhes**: 13 arquivos `.md` em `.sisyphus/evidence/` têm uma quebra de configuração Prettier (provavelmente `printWidth` ou `proseWrap`). Esses arquivos são gerados por agentes e não seguem o padrão do projeto.

**Solução**: Adicionar `*.md` ao `.prettierignore` ou configurar `overrides` no Prettier para arquivos de evidência.

---

## 3. SonarQube — 16 Code Smells (16 Suppressions)

**Severidade**: LOW (falsos positivos conhecidos, suprimidos com `sonar-ignore-next-line`)

**Contexto**: PR #139 corrigiu 31 code smells (47 → 16). Os 16 restantes são falsos positivos justificados (skeletons, padrões de lib, catches intencionais). Script de análise adicionado: `npm run sonar:labens`.

**Arquivos com suppression**:

- `src/components/dashboard/alunos/data-table.tsx` — 3 suppressions (keys em skeleton, falsos positivos)
- `src/components/ui/table.tsx` — 1 suppression (key em skeleton)
- `src/components/ui/command.tsx` — 1 suppression (NOSONAR — cmdk-input-wrapper)
- `src/components/ui/dashboard-skeletons.tsx` — 1 suppression (key em skeleton)
- `src/hooks/use-app-notification.ts` — 1 suppression
- `src/lib/data.ts` — 1 suppression
- `src/lib/logger.ts` — 2 suppressions
- `src/app/dashboard/planos/page.tsx` — 1 suppression (key em skeleton)

**Total**: 16 code smells (todos false positives).

**Observação**: Todas são justificadas (skeleton keys sem reordenação, cmdk exigência de lib externa, logger defensivo). Resolver exigiria ou refatorar componentes ou migrar para SonarQube baseline.

---

## 4. Fallow — Health/Dead-Code Findings Informacionais

**Severidade**: INFO (Fallow configurado como `fail-on-issues: false`, findings em PR comments apenas)

**Config**: `.fallowrc.json` — `health.maxCyclomatic: 20, maxCognitive: 15, maxCrap: 30`

**Métrica atual conhecida**:

- CRAP dos 5 módulos refatorados em PR #138 agora está abaixo do threshold (30)
- Módulos não auditados podem exceder os limites de cyclomatic/cognitive complexity

**Por que não foi resolvido**: Fallow foi configurado como informativo. Findings são postados como PR comments para revisão humana. Não bloqueia CI.

**Ação futura**: Rodar Fallow scan dedicado para identificar módulos acima dos thresholds e priorizar refatorações.

---

## 5. Library Drift — Itens Deferidos (Context7 Audit)

**Severidade**: VARIA (tracked, não bloqueantes)

Estes itens foram identificados no Library Drift Audit (2026-06-05) mas deliberadamente deixados como follow-up:

| Item                                                         | Área        | Severidade | Motivo do Deferimento                                              |
| ------------------------------------------------------------ | ----------- | ---------- | ------------------------------------------------------------------ |
| Next.js 16 migration (middleware→proxy, `cacheComponents`)   | Next.js     | MAJOR      | Gated on Next 16 stable                                            |
| `getClaims()` SSR optimization                               | Next.js     | MINOR      | Gated on Next 16                                                   |
| `generateMetadata` enablement                                | Next.js     | MINOR      | Escopo não incluído                                                |
| `typedRoutes` enablement                                     | Next.js     | INFO       | Escopo não incluído                                                |
| `superjson` serialization                                    | Next.js     | INFO       | Escopo não incluído                                                |
| Full Zod v4 migration                                        | Zod         | MEDIUM     | Gated on Genkit unblocking (`@genkit-ai/core` pins `zod: ^3.23.8`) |
| `getAuthForRoute` N+1 → Prisma                               | Performance | MEDIUM     | Gated on Next 16 middleware                                        |
| Genkit `@genkit-ai/observability` plugin                     | Genkit      | LOW        | Exige nova dependência                                             |
| Genkit 3 LOW findings (annotateSchema, dead code, trace CLI) | Genkit      | LOW        | Escopo não incluído                                                |
| Sentry array attributes                                      | Sentry      | LOW        | Escopo não incluído                                                |
| Architecture & security audit                                | Geral       | MEDIUM     | Fora do escopo Context7                                            |
| Business logic audit                                         | Geral       | MEDIUM     | Fora do escopo Context7                                            |
| Performance profiling                                        | Geral       | LOW        | Fora do escopo Context7                                            |

---

## 6. Test Infrastructure — E2E Fragilidade Residual

**Severidade**: LOW (CI está verde, mas há ressalvas)

**O que foi feito**: PR #138 corrigiu as 7 falhas preexistentes de E2E (session pollution, form reset, enrollment visibility, payment persistence). CI agora passa 21/21 testes E2E.

**Riscos residuais**:

- `loginAs` agora chama `logout` antes de navegar, mas o `logout` limpa cookies + localStorage + sessionStorage — pode mascarar bugs de sessão reais
- Teste `payment-status.spec.ts` depende de `waitForTimeout(1000)` + `page.reload({ waitUntil: 'networkidle' })` — workaround, não correção da causa raiz
- Suite E2E exige `supabase start` (Docker) — não roda em CI sem infraestrutura local

**Ação futura**: Investigar `revalidatePath` timing no fluxo de pagamento. Se possível, substituir workaround E2E por `router.refresh()` no `financeiro-client.tsx`.

---

## 7. Infraestrutura — Pendências CI

**Severidade**: LOW (CI operacional, itens de configuração)

### 7.1 `.env.test` — Renomeação de Variável

- **Pendente**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` no `.env.test`
- **Status**: Marcado no unreleased CHANGELOG, não executado
- **Prioridade**: LOW (ambas funcionam, a nova é a convenção Supabase SSR 0.10+)

### 7.2 Auto-seed antes do Playwright

- **Pendente**: Garantir que o seed automático rode antes dos testes E2E (closes entrada em debt)
- **Status**: Marcado no unreleased CHANGELOG, não executado
- **Prioridade**: LOW (globalSetup já faz seed, mas documentação não reflete)

---

## 8. Dependências Mortas — Remanescentes

**Severidade**: LOW (já removidos lodash + framer-motion em PR #138)

**Status após PR #138**:

- ✅ `lodash` removido
- ✅ `framer-motion` removido
- ✅ Eng-software-2 `.git` aninhado removido (arquivos trackeados)

**Não auditado**: Revisão completa de `package.json` para identificar outras dependências não utilizadas (ex.: verificar se todos os `@types/*` são realmente importados).

---

## 9. Funções que Precisam de Refatoração — CRAP/Complexidade Alta

**Severidade**: MÉDIA (código funcional, mas com manutenibilidade comprometida)

**Contexto**: PR #138 reduziu CRAP de 5 módulos críticos (AlunoLayoutContent 240→30, WorkoutExerciseRow 182→42, etc.), mas há outros módulos grandes que não foram tocados. Abaixo o inventário dos candidatos a refatoração, priorizados por tamanho + densidade de lógica.

### 9.1 Camada de Serviços (services/)

#### `pagamentoService.ts` (106 linhas, 1 função monolítica)

- **Função**: `processPayment()` — busca aluno + matrícula + verifica idempotência + atualiza status + estende vencimento + cria pagamento
- **Problema**: 5 responsabilidades numa única função. Violação SRP. Testabilidade baixa (depende de `tx: any`).
- **Sugestão**: Extrair `findAlunoWithEnrollment()`, `checkPaymentIdempotency()`, `updateAlunoStatus()`, `extendEnrollmentDueDate()`, `createPaymentRecord()`

#### `gamificationService.ts` (95 linhas, 1 função pura)

- **Função**: `calculateTreinoRewards()` — pure function, bem testada
- **Problema**: Nenhum grave. Tamanho aceitável. Monitorar se crescer.

### 9.2 Camada de Ações (lib/actions/)

#### `lib/actions/alunos.ts` (242 linhas, 11 funções)

- **Funções**: `finalizarTreinoAction`, `criarAlunoAction`, `atualizarAlunoAction`, `deletarAlunoAction`, + 7 helpers/utilitários
- **Problema**: Mistura ações de aluno com ações de treino (`finalizarTreinoAction` está aqui, não em treinos.ts). Cada função tem wrapper Sentry + validação + auth — bastante boilerplate repetido.
- **Sugestão**: Extrair `finalizarTreinoAction` para `treinos.ts`. Extrair middleware de Sentry wrapper em helper. Separar por domínio (aluno vs treino).

#### `lib/actions/treinos.ts` (399 linhas, 16 funções)

- **Status**: Nesting corrigido em PR #138 (helpers extraídos)
- **Problema**: Tamanho ainda grande. Mistura upsert individual + batch upsert + delete + operações de historico.
- **Sugestão**: Separar em `treinos.ts` (CRUD) + `treino-historico.ts` (registro de execução). Extrair validação compartilhada.

### 9.3 Camada de Dados (lib/data.ts — 151 linhas)

- **Funções**: `getAlunos()`, `getPlanos()`, `getTreinos()`, `getAlunoDetalhes()`, `getDashboardStats()`
- **Problema**: `getDashboardStats()` (46 linhas) faz 3 queries + raw SQL + projeção de crescimento. Projeção financeira está dentro de um data fetcher — deveria estar em um service.
- **Sugestão**: Extrair `calcularProjecaoCrescimento()` para `services/analyticsService.ts`. Extrair `getFaturamentoMensal()` para `services/faturamentoService.ts`.

### 9.4 Componentes Grandes — Prioridade Alta

| Componente                                   | Linhas | Complexidade                                                   | Sugestão                                                              |
| -------------------------------------------- | ------ | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| `dashboard/treinos/treinos-client.tsx`       | 351    | Muito alta (drawer + editor + save/cancel + streaming AI)      | Extrair `PlanoGeradoParaEdicao`, `TreinoDrawerContent`, `WorkoutList` |
| `aluno/dashboard/dashboard-client.tsx`       | 300    | Alta (finish workout + feedback + progress + exercicio viewer) | Extrair `FeedbackModal`, `TrainingControls`, `ProgressSummary`        |
| `aluno/meus-treinos/meus-treinos-client.tsx` | 265    | Alta (lista + filtros + histórico)                             | Extrair `TreinoCard`, `TreinoFilterBar`, `HistoryTimeline`            |
| `dashboard/alunos/data-table.tsx`            | 224    | Média (tabela com sorting/filtering)                           | Extrair cabeçalho config para arquivo separado                        |
| `dashboard/alunos/form-aluno.tsx`            | 222    | Média (formulário multi-etapa)                                 | Extrair seções em sub-formulários                                     |
| `dashboard/alunos/alunos-client.tsx`         | 184    | Média                                                          | Extrair `AlunoFilters`, `AlunoListActions`                            |
| `dashboard/planos/planos-client.tsx`         | 180    | Média (CRUD planos)                                            | Extrair `PlanoForm`, `PlanoCard`, `PlanoList`                         |
| `dashboard/alunos/columns.tsx`               | 177    | Média (definição de colunas)                                   | Separar colunas por domínio                                           |
| `dashboard/financeiro/financeiro-client.tsx` | 128    | Média                                                          | Extrair `PaymentForm`, `PaymentHistoryList`                           |

### 9.5 Hooks

| Hook                        | Linhas | Observação                                                                  |
| --------------------------- | ------ | --------------------------------------------------------------------------- |
| `use-workout-crud.ts`       | 128    | Gerenciamento de treinos. Pode extrair `useWorkoutSave`, `useWorkoutDelete` |
| `use-workout-generation.ts` | 89     | Geração via IA. Tamanho aceitável.                                          |
| `use-workout-exercises.ts`  | 62     | Bem pequeno. OK.                                                            |

---

### Prioridade de Execução (Recomendada)

```
Wave 1 (CRAP mais urgente — serviços):
  ├── pagamentoService.ts (106 linhas, 1 função SRP-violation)
  ├── lib/data.ts (getDashboardStats → extrair projeção)

Wave 2 (componentes 200+ linhas):
  ├── treinos-client.tsx (351 → ~150 com extrações)
  ├── dashboard-client.tsx (300 → ~120)
  ├── meus-treinos-client.tsx (265 → ~130)

Wave 3 (componentes 150-200 linhas):
  ├── form-aluno.tsx (222 → ~120)
  ├── data-table.tsx (224 → ~100)
  ├── alunos-client.tsx (184 → ~100)
  ├── planos-client.tsx (180 → ~100)
  └── columns.tsx (177 → ~80)

Wave 4 (actions):
  └── actions/alunos.ts (separar por domínio)
  └── actions/treinos.ts (separar historico do CRUD)
```

---

## Resumo

| Categoria                | Itens                                                      | Bloqueante?           |
| ------------------------ | ---------------------------------------------------------- | --------------------- |
| ESLint warnings          | 10 (set-state-in-effect, incompatible-library, no-console) | ❌                    |
| Prettier config gap      | 13 arquivos .md                                            | ❌                    |
| SonarQube suppressions   | 16 (todos false positives)                                 | ❌ (falsos positivos) |
| Fallow findings          | Informacionais                                             | ❌                    |
| Library drift deferred   | 13 itens                                                   | ❌                    |
| E2E fragilidade residual | 2 riscos                                                   | ❌ (CI verde)         |
| CI configuração          | 2 pendências unreleased                                    | ❌                    |
| Dependências mortas      | Não auditado completamente                                 | ❌                    |

**Total de itens bloqueantes**: 0
**Total de itens trackeados**: ~23
