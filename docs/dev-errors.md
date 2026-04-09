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
