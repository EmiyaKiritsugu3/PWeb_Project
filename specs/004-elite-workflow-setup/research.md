# Research: 004 — Elite Workflow Setup

**Generated**: 2026-04-09
**Status**: Complete — all unknowns resolved

---

## Decisions

### 1. Error Tracking: Sentry

**Decision**: `@sentry/nextjs` com plano gratuito (5k errors/month, 1 user)

**Rationale**: Integração nativa com Next.js App Router, source maps automáticos,
suporte a Edge Runtime, e wizard de setup que configura `instrumentation.ts`
automaticamente. Plano free suficiente para academia pequena.

**Setup crítico**:

- `npx @sentry/wizard@latest -i nextjs` gera `sentry.client.config.ts`,
  `sentry.server.config.ts`, `sentry.edge.config.ts`, e atualiza `next.config.ts`
- DSN vai em `NEXT_PUBLIC_SENTRY_DSN` (público — ok, não é segredo)
- `SENTRY_AUTH_TOKEN` vai em GitHub Actions secrets (para source maps upload)
- Não requer `instrumentation.ts` manual no Next.js 15 — wizard cuida disso

**Alternativa rejeitada**: GlitchTip (open-source, self-hosted) — overhead de
manutenção de infraestrutura não justificado para projeto acadêmico.

---

### 2. E2E em CI: Playwright no GitHub Actions

**Decision**: Playwright rodando no GitHub Actions como terceiro job após `test`

**Rationale**: Playwright tem action oficial (`microsoft/playwright-github-action`)
e imagem Docker otimizada. E2E deve rodar contra staging (não produção) para
isolamento. Job separado permite paralelização futura.

**Setup crítico**:

- `npx playwright install --with-deps chromium` no CI (só Chromium — mais rápido)
- Variáveis de ambiente do Supabase staging injetadas via GitHub Actions secrets
- `PLAYWRIGHT_BASE_URL` aponta para `http://localhost:3000` (dev server no CI)
- Next.js server inicia antes dos testes com `webServer` config no `playwright.config.ts`

**Gotcha**: Testes E2E com Supabase real requerem usuários de teste no banco de
staging. Criar via `prisma/seed-e2e.ts` com UUIDs fixos e determinísticos.

---

### 3. Staging Environment: Supabase Branch

**Decision**: Supabase Database Branching (recurso nativo)

**Rationale**: Supabase branches criam um PostgreSQL isolado com o mesmo schema
da branch principal. Migrations aplicadas automaticamente. Dados de teste
independentes de produção. URL diferente → credenciais diferentes.

**Setup crítico**:

- Branch criada via MCP: `mcp__supabase__create_branch`
- Branch gera novas credenciais: `SUPABASE_URL_STAGING` e `SUPABASE_ANON_KEY_STAGING`
- `.env.local` usa produção; `.env.staging` usa staging
- GitHub Actions usa staging secrets para E2E
- `npm run seed:e2e` popula o banco de staging com usuários de teste

---

### 4. Coverage Strategy: Scoped, não Global

**Decision**: Coverage enforcement em `src/lib/**` e `src/services/**` @ 80%

**Rationale**: Coverage global de 1.72% — elevar para 60% global exigiria testar
componentes UI e server actions do Next.js, que são notoriamente difíceis de
unit-testar (dependem de contexto de request, Supabase client, Prisma). Elite
companies não enforcement coverage em código de framework ou UI gerada. Targets
scoped em business logic (lib/, services/) são mais valiosos.

**Evidência**: `src/lib/auth.ts` e `src/services/alunoService.ts` já em 100%.
`src/lib/data.ts` (0%) e `src/lib/actions/*.ts` (0%) são os gaps reais.

**Alternativa rejeitada**: Global 60% — força testes de componentes UI sem valor
real, e bloqueia CI permanentemente com trabalho de baixo ROI.

---

### 5. `any` Violations: 25 ocorrências em 20 arquivos

**Breakdown por categoria**:

| Categoria            | Arquivos                                   | Abordagem                                           |
| -------------------- | ------------------------------------------ | --------------------------------------------------- |
| Genkit SDK type gaps | `workout-generator-flow.ts`                | Inline `// eslint-disable-next-line` com comentário |
| shadcn gerado        | `use-toast.ts`, `data-table.tsx`           | Adicionar ao `.eslintignore` / `eslint-disable`     |
| Actions sem tipo     | `alunos.ts`, `treinos.ts`, `financeiro.ts` | Tipar com tipos Prisma existentes                   |
| Pages com erros      | `auth.ts`, `page.tsx` files                | Tipar com `NextResponse` / Zod schemas              |
| Hooks customizados   | `use-workout-tracker.ts`                   | Tipar com interfaces explícitas                     |

**Estimativa de esforço**: 8-12 correções simples (trocar `any` por tipo correto),
5-8 supressões justificadas, 5 exclusões de arquivos gerados.

---

### 6. Threat Model: STRIDE aplicado ao SMS

**Ativos críticos identificados**:

- CPF dos alunos (PII — Lei Geral de Proteção de Dados)
- Dados financeiros (pagamentos, inadimplência)
- Credenciais de acesso (Supabase Auth tokens)
- Dados de saúde implícitos (objetivos de treino, biometria)

**Ameaças prioritárias** (para o Threat Model doc):

1. **Spoofing**: Aluno acessa rota `/dashboard` → mitigado por `requireRole()`
2. **Elevation of Privilege**: RECEPCIONISTA acessa financeiro → mitigado por middleware
3. **Information Disclosure**: CPF exposto em logs → mitigar com log sanitization
4. **Tampering**: Server Action sem validação Zod → mitigado pela Constitution II
