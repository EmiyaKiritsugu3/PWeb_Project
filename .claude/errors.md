# Development Error Log (AI Context)

Mirror of `docs/dev-errors.md`. Updated in real time during development.
Format: found → root cause → fix applied → effectiveness.

See `docs/dev-errors.md` for full entries.

---

## ERR-001 — Middleware bloqueando `/aluno/login` ✅

`isAlunoRoute` incluía `/aluno/login` → redirect loop silencioso.
Fix: `!pathname.startsWith('/aluno/login')` na condição.

## ERR-002 — `redirect('/aluno')` → 404 ✅

Sem `page.tsx` em `/aluno`. Fix: `redirect('/aluno/dashboard')`.

## ERR-003 — `rejects.toThrow()` com mock de `redirect()` ✅

Mock não lança exceção. Fix: verificar `mockRedirect.toHaveBeenCalledWith(...)` + `return` após redirect.

## ERR-004 — `import { Role }` → deve ser `import type { Role }` ✅

Enums usados só como tipo exigem `import type`. Fix: trocar import.

## ERR-005 — `as any` em mocks Supabase ✅

Workaround: `eslint-disable-next-line` com justificativa.

## ERR-006 — Commit rejeitado por linha > 72 chars no body ✅

commitlint enforça `body-max-line-length`. Fix: quebrar linhas longas.

## ERR-007 — Branch com nome inválido para setup-plan.sh ✅

Script exige `NNN-feature-name`. Fix: criar branch com padrão correto.

## ERR-008 — Commits em branch errada ✅

Verificar branch ativa antes de commitar. Fix: merge fast-forward para branch correta.

## ERR-009 — PR sem template obrigatório ✅

Sempre usar `.github/pull_request_template.md`. Fix: `gh pr edit --body "..."`.

## ERR-010 — `feature.json` desatualizado após nova feature ✅

Script não atualiza automaticamente. Fix: editar `feature.json` manualmente após criar feature.
