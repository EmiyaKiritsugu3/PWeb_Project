# Development Error Log

Errors found during development — logged immediately, updated with solution and effectiveness.
Format: discovered → root cause → fix → effectiveness.

---

## ERR-001 — Middleware bloqueando `/aluno/login` para usuários não autenticados

- **Data:** 2026-04-09
- **Contexto:** Portal do Aluno — botão "Acessar Portal do Aluno" na tela de login não fazia nada
- **Sintoma:** Clicar no botão parecia não ter efeito; usuário permanecia em `/login`
- **Causa raiz:** `isAlunoRoute = pathname.startsWith('/aluno')` incluía `/aluno/login`, causando redirect loop silencioso para usuários não autenticados
- **Fix:** `src/utils/supabase/middleware.ts` — excluir `/aluno/login` de `isAlunoRoute`:
  ```ts
  const isAlunoRoute = pathname.startsWith('/aluno') && !pathname.startsWith('/aluno/login');
  ```
- **Efetividade:** ✅ Resolvido — `/aluno/login` agora acessível sem autenticação

---

## ERR-002 — `redirect('/aluno')` após login de aluno resulta em 404

- **Data:** 2026-04-09
- **Contexto:** `src/app/actions/auth.ts` — ação de login para não-funcionários
- **Sintoma:** Login bem-sucedido como aluno resultava em página 404
- **Causa raiz:** `redirect('/aluno')` aponta para uma rota sem `page.tsx`; apenas `layout.tsx` existe em `/aluno`
- **Fix:** `src/app/actions/auth.ts` — alterar para `redirect('/aluno/dashboard')`
- **Efetividade:** ✅ Resolvido — alunos são direcionados corretamente ao dashboard

---

## ERR-003 — Testes usando `rejects.toThrow()` com mock de `redirect()` que não lança exceção

- **Data:** 2026-04-09
- **Contexto:** `src/lib/auth.test.ts` — testes unitários de `requireRole()`
- **Sintoma:** Testes falhavam com `received function did not throw`
- **Causa raiz:** Em Vitest, `redirect()` mockado é um no-op; não lança `NEXT_REDIRECT` como em produção
- **Fix:** Substituir `expect(...).rejects.toThrow()` por verificação direta do mock:
  ```ts
  expect(mockRedirect).toHaveBeenCalledWith('/login');
  ```
  Adicionar `return` após `redirect('/login')` em `auth.ts` para evitar execução continuar com `user === null`
- **Efetividade:** ✅ Resolvido — 5/5 testes passando

---

## ERR-004 — `import { Role }` deveria ser `import type { Role }`

- **Data:** 2026-04-09
- **Contexto:** `src/lib/auth.ts` — import de enum do Prisma
- **Sintoma:** Warning ESLint: `@typescript-eslint/consistent-type-imports`
- **Causa raiz:** Enums do Prisma usados apenas como anotação de tipo devem usar `import type`
- **Fix:** `import type { Role } from '@prisma/client'`
- **Efetividade:** ✅ Resolvido — 0 erros de lint

---

## ERR-005 — `as any` em mocks do Supabase nos testes

- **Data:** 2026-04-09
- **Contexto:** `src/lib/auth.test.ts` — mock do cliente Supabase
- **Sintoma:** Warning ESLint: `@typescript-eslint/no-explicit-any`
- **Causa raiz:** Interface do Supabase é complexa; mock parcial requer cast
- **Fix:** `eslint-disable-next-line @typescript-eslint/no-explicit-any` com comentário justificando
- **Efetividade:** ✅ Resolvido (workaround aceitável para mocks de test)

---

## ERR-006 — Commit rejeitado por `body-max-line-length` no commitlint

- **Data:** 2026-04-09
- **Contexto:** Primeiro commit do US00 — mensagem com linhas > 100 caracteres
- **Sintoma:** Hook `commit-msg` rejeitou o commit: `body-max-line-length[72]`
- **Causa raiz:** Commitlint configurado com limite de 72 chars por linha no body
- **Fix:** Reescrever mensagem do commit com linhas mais curtas (quebrar frases longas)
- **Efetividade:** ✅ Resolvido — sempre verificar comprimento de linha antes de commitar

---

## ERR-007 — Feature branch criada com nome inválido para o setup-plan.sh

- **Data:** 2026-04-09
- **Contexto:** Tentativa de criar spec para US00 a partir da branch `feat/us01-student-management`
- **Sintoma:** `setup-plan.sh` rejeitou o nome da branch
- **Causa raiz:** Script exige padrão `NNN-feature-name`; `feat/us01-student-management` não segue o padrão
- **Fix:** Criar nova branch com nome correto: `002-us00-financial-role-access`
- **Efetividade:** ✅ Resolvido — seguir padrão `NNN-feature-name` para branches de feature

---

## ERR-008 — Commits foram para branch errada (`003-002-us00-financial` em vez de `002-us00-financial-role-access`)

- **Data:** 2026-04-09
- **Contexto:** Após implementação do US00
- **Sintoma:** Commits apareceram na branch temporária, não na branch de trabalho
- **Causa raiz:** `setup-plan.sh` criou uma branch temporária `003-002-us00-financial`; não foi feito checkout da branch correta antes de commitar
- **Fix:** `git checkout 002-us00-financial-role-access && git merge 003-002-us00-financial` (fast-forward)
- **Efetividade:** ✅ Resolvido — sempre verificar branch ativa antes de commitar

---

## ERR-009 — PR sem seguir template obrigatório do repositório

- **Data:** 2026-04-09
- **Contexto:** PR #57 criado sem as seções "Type of Change", "Related Documents" e "Checklist"
- **Sintoma:** Alerta de CI: "The description lacks the required template structure"
- **Causa raiz:** PR criado com template próprio em vez de usar `.github/pull_request_template.md`
- **Fix:** `gh pr edit 57 --body "..."` com as seções obrigatórias preenchidas
- **Efetividade:** ✅ Resolvido — sempre consultar `.github/pull_request_template.md` ao criar PRs

---

## ERR-010 — `feature.json` apontando para spec antiga após criação de nova feature

- **Data:** 2026-04-09
- **Contexto:** Após criar spec para US00 com `setup-plan.sh`
- **Sintoma:** Comandos speckit referenciavam `specs/001-fix-type-safety-bugs` em vez de `specs/003-002-us00-financial`
- **Causa raiz:** `feature.json` não foi atualizado automaticamente pelo script
- **Fix:** Editar manualmente `feature.json` para apontar para o diretório correto
- **Efetividade:** ✅ Resolvido — verificar `feature.json` após criar nova feature

---

## ERR-011 — CI Security Audit: DoS no Next.js 15.5.14

- **Data:** 2026-04-10
- **Contexto:** CI pipeline — job Quality Gates, step `npm audit`
- **Sintoma:** `npm audit` retornou HIGH severity, travando o CI
- **Causa raiz:** `next@15.5.14` continha vulnerabilidade DoS (GHSA-q4gf-8mx6-v5v3) via request headers; patch disponível em `15.5.15`
- **Fix:** `npm audit fix` — atualizou `next` de `15.5.14` para `15.5.15` automaticamente
- **Efetividade:** ✅ Resolvido — `npm audit` passou sem high/critical
- **Lição:** Manter dependências atualizadas; `next` tem releases frequentes de segurança

---

## ERR-012 — CI Format Check: Bundles Minificados do Obsidian não Ignorados

- **Data:** 2026-04-10
- **Contexto:** CI pipeline — job Quality Gates, step `npm run format:check`
- **Sintoma:** Prettier falhou em `docs/.obsidian/plugins/*/main.js` (bundles minificados de plugins)
- **Causa raiz:** `docs/.obsidian/` não estava no `.prettierignore`; Prettier tentou formatar arquivos JS minificados de terceiros
- **Fix:** Adicionar `docs/.obsidian/` ao `.prettierignore`
- **Efetividade:** ✅ Resolvido
- **Lição:** Qualquer diretório com código de terceiros ou gerado deve estar no `.prettierignore`. Revisar ao adicionar novas ferramentas ao projeto.

---

## ERR-013 — CI E2E Seed: Extração de Chaves Supabase via Grep Falhou

- **Data:** 2026-04-10
- **Contexto:** CI pipeline — job E2E Tests, step Seed E2E test users
- **Sintoma:** `supabaseKey is required` — variável `SUPABASE_LOCAL_ANON_KEY` ficou vazia
- **Causa raiz:** `supabase status` em modo padrão não exporta chaves em formato parseável; a saída varia por versão da CLI. `grep 'anon key'` não encontrava nada.
- **Tentativa ineficiente:** Regex/grep na saída plain text do `supabase status`
- **Fix:** Usar `supabase status --output env` (disponível desde CLI v1.23) + fallback com JWTs padrão do Supabase demo:
  ```bash
  STATUS_ENV=$(supabase status --output env 2>/dev/null || echo "")
  ANON_KEY=$(echo "$STATUS_ENV" | grep "^ANON_KEY=" | cut -d= -f2- | sed "s/^[\"']//; s/[\"']$//")
  if [ -z "$ANON_KEY" ]; then
    ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # fallback padrão
  fi
  ```
- **Efetividade:** ✅ Resolvido

---

## ERR-014 — CI E2E Seed: `prisma migrate deploy` é No-Op sem Migrations

- **Data:** 2026-04-10
- **Contexto:** CI pipeline — job E2E Tests, step Push database schema
- **Sintoma:** Seed falhou com erros de tabela não encontrada; `migrate deploy` completou sem erros mas não criou tabelas
- **Causa raiz:** O projeto usa workflow `db push` (sem diretório `prisma/migrations/`). `migrate deploy` verifica se há migrations pendentes — sem o diretório, retorna silenciosamente com "No pending migrations to apply" sem criar nenhuma tabela.
- **Fix:** Substituir `npx prisma migrate deploy` por `npx prisma db push --accept-data-loss`
- **Efetividade:** ✅ Resolvido — tabelas criadas, seed executou com sucesso
- **Lição:** Sempre verificar se o projeto usa `migrate` ou `db push` antes de configurar o CI. Projetos com `db push` não têm o diretório `migrations/`.

---

## ERR-015 — CI E2E Seed: JWT Inválido — Aspas Duplas no `--output env`

- **Data:** 2026-04-10
- **Contexto:** CI pipeline — job E2E Tests, step Seed E2E test users
- **Sintoma:** `invalid JWT: token is malformed: could not base64 decode header: illegal base64 data at input byte 0`
- **Causa raiz:** `supabase status --output env` retorna valores entre aspas: `ANON_KEY="eyJ..."`. Após `cut -d= -f2-`, o valor ficava `"eyJ..."` — com a aspa `"` inicial, que é um caractere inválido em base64, quebrando o decode do JWT.
- **Diagnóstico:** O erro "input byte 0" indica que o primeiro byte do token já é inválido — revelador da aspa.
- **Fix:** Adicionar `sed "s/^[\"']//; s/[\"']$//"` após o `cut` para remover aspas envolventes
- **Debug útil adicionado:** `echo "Extracted anon key length: ${#ANON_KEY}"` para confirmar nos logs que a chave foi extraída
- **Efetividade:** ✅ Resolvido

---

## ERR-016 — CI E2E Webserver: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` Não Definida

- **Data:** 2026-04-10
- **Contexto:** CI pipeline — job E2E Tests, step Run E2E tests
- **Sintoma:** `Error: Your project's URL and Key are required to create a Supabase client!` no webserver do Playwright (`src/utils/supabase/middleware.ts:15`)
- **Causa raiz:** Supabase renomeou o "anon key" para "publishable default key". O código fonte (`middleware.ts`, `client.ts`, `server.ts`) já usava o novo nome `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`. O CI e o `.env.test` ainda usavam o nome antigo `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A variável correta nunca foi definida no ambiente do webserver.
- **Como o webserver recebe env vars:** O webserver Playwright (`npm run dev`) é processo filho do runner do Playwright, que herda `process.env`. Se a variável não está no env do processo pai, não chega ao webserver.
- **Fix:** Adicionar ao step "Run E2E tests":
  ```yaml
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ env.SUPABASE_LOCAL_ANON_KEY }}
  ```
  E ao `.env.test` local: mesma variável com o mesmo valor do anon key.
- **Efetividade:** ✅ Resolvido — webserver inicializou corretamente
- **Lição:** Quando o Supabase (ou qualquer lib) renomeia variáveis, buscar sistematicamente: (1) o que o `src/` lê, (2) o que os `.env.*` definem, (3) o que o CI injeta.

---

## ERR-017 — E2E Test: Timeout no `getByRole('heading')` após SSR com Prisma

- **Data:** 2026-04-10
- **Contexto:** `tests/e2e/specs/student-portal.spec.ts:9` — teste "ALUNO accesses /aluno/dashboard"
- **Sintoma:** `expect(locator).toBeVisible() failed — Timeout: 5000ms — element(s) not found — waiting for getByRole('heading')`
- **Causa raiz:** A página `/aluno/dashboard` é um Server Component que executa 2 queries Prisma antes de retornar o HTML com o `h1`. Em CI (runner mais lento, dev server compilando on-demand), esse processo pode levar 5-8 segundos — além do timeout padrão de 5000ms do Playwright. Falhou em ambas as tentativas (original + retry).
- **Contexto adicional:** O `h1` está dentro de um `motion.div` do framer-motion com `initial={{ opacity: 0 }}`, mas `opacity: 0` não esconde o elemento para `toBeVisible()` do Playwright — o problema era exclusivamente de timing.
- **Fix:** `{ timeout: 15_000 }` na asserção, igual ao timeout já usado pelo `loginAs()`:
  ```ts
  await expect(page.getByRole('heading')).toBeVisible({ timeout: 15_000 });
  ```
  Aplicado também preventivamente ao teste de `meus-treinos` (mesma estrutura).
- **Efetividade:** Pendente — CI em andamento
- **Lição:** Em CI, nunca usar o timeout padrão de Playwright (5000ms) para asserções em elementos que dependem de dados carregados server-side. Usar pelo menos 15_000ms.
