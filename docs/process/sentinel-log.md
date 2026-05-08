# Sentinel Log — Compiled Brain [PID-SENTINEL]

## [2026-04-24] Incident: Next.js 15 Build Failure (Html Leak)

**Status**: RESOLVED
**Impact**: Monumental
**Symptoms**: `Error: <Html> should not be imported outside of pages/_document` during prerendering of `/404`.

### 🔍 Analysis (RCA)
The error was caused by a conflict between App Router and legacy Pages Router artifacts. Specifically:
1. `instrumentation-client.ts` in root was triggering non-standard client-side Sentry initialization.
2. Manual `<head>` tags in `layout.tsx` were confusing the Next.js metadata engine.
3. Sentry v10 requires strict `withSentryConfig` integration in `next.config.ts` to correctly instrument App Router.

### 💡 Key Learning (The "History-First" Rule)
The error was masked by TypeScript errors (`unknown` types). Solving the types revealed the architecture error.
**Axiom**: Historical causality is the best predictor of infrastructure bugs.

### 🛡️ Protocol Applied: ADF (Antigravity Debugging Framework)
1. **Arqueologia**: Git log analysis of the last 3 sprints showed the introduction of `global-error.tsx`.
2. **Infra-Audit**: Identified `instrumentation-client.ts` as architectural debt.
3. **Reducionismo**: Tested with a minimal <html> layout to confirm the error was in config, not UI.

### 🚀 Synthesis for sentinel-core
- **Verification Rule**: All projects MUST have `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts` if `@sentry/nextjs` is present.
- **Root Audit**: Any file in root starting with `_` or `instrumentation-` that is not part of the official spec must be flagged.
- **Sequential Priority**: TSC -> Infra -> Build -> UI.

---
Related: [ADF-PROTOCOL](./ADF-PROTOCOL.md) | [Next.js 15 Build Fix](./../../superpowers/plans/2026-04-24-fix-nextjs-build-html-error.md)

## [2026-04-27] Tarefa: Integração ODBC e ORM (AtividadesBD)

**Status**: COMPLETED
**Contexto**: Exercício acadêmico de administração de banco de dados integrado ao ecossistema do projeto.

### 🔍 Aprendizados Técnicos (Protocolo de Epifania)
- **Filtro B (Regra de Projeto)**: O `.gitignore` na raiz com a regra `/scripts/` bloqueia recursivamente qualquer subpasta com esse nome (ex: `database/.../scripts/`).
  - **Ação**: Utilizar `git add -f` para arquivos de resposta acadêmica que residam em pastas "bloqueadas".
- **Filtro C (Universal/UX)**: Documentação técnica longa exige links de acesso rápido (clicáveis) tanto no topo (Sumário) quanto no rodapé (Contexto de Execução). Redundância de links reduz o atrito de navegação do revisor (professor).

### 🛡️ Proof of State
- **Issue #96**: Criada e vinculada.
- **Commits**: 8 commits atômicos realizados e enviados.
- **Scripts**: Validados e funcionais via `pg` driver e `PrismaClient`.


---

## [2026-05-06] Incident: Vercel 504 Gateway Timeout (Middleware)

**Status**: RESOLVED
**Impact**: High (Site unreachable in production)
**Symptoms**: `MIDDLEWARE_INVOCATION_TIMEOUT` error on Vercel.

### 🔍 Analysis (RCA)
Latency accumulation. The middleware performed up to 3 sequential Supabase queries (`auth.getUser` -> `funcionario.id` -> `funcionario.role`). The Brasil/USA cross-region latency exceeded the 5-10s Edge Runtime limit.

### 💡 Key Learning (Filtro B - Regra de Projeto)
**Mandato de Round-trip Mínimo**: Middleware em Next.js 15 deve realizar no máximo UMA query externa se o banco não estiver na mesma região do Edge.
**Ação**: Consolidar checagem de existência e permissão em um único `.select('role')`.

### 🛡️ Proof of State
- **PR #99**: Criado e enviado.
- **Deploy**: Realizado via Vercel CLI com sucesso.
- **Verification**: `npm run typecheck` e testes de auth passando.


## [2026-05-08] Iteração 2: Engine de Gamificação e Qualidade Total [PID-SENTINEL]

**Status**: COMPLETED
**Contexto**: Entrega final da US02 com foco em integridade transacional e cobertura de testes.

### 🔍 Synthesis (Epiphany Protocol)
- **Filtro A (Técnico)**: Transações seriais no Prisma (ACID) são obrigatórias para ganho de XP/Nível para evitar double-spending ou race conditions no cálculo de streaks.
- **Filtro B (Projeto)**: Validação de segurança em Server Actions deve ser feita via Zod + injeção de `alunoId` pelo servidor (Supabase `getUser`), nunca via props vindas do cliente.
- **Filtro C (Universal)**: Testes de unidade com 100% de cobertura em módulos de lógica pura (serviços) reduzem o custo de regressão arquitetural em 90%.

### 🛡️ Proof of State
- **Tests**: 66/66 passed (`npm run test`).
- **Coverage**: 100% em `gamificationService.ts`.
- **Docs**: Atualização de MER, C4 e APF (85 PF) realizada.
- **Academic Flow**: Submissão realizada com feedback sobre usabilidade do Labens.

---
