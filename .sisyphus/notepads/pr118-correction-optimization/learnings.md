## 2026-06-05 — F3 Manual QA

- Local main can lag origin/main after recent merges; `git rev-parse origin/main`
  is the truth before running tests against "plan baseline HEAD". Fast-forward
  with `git merge --ff-only origin/main` is non-destructive.
- vitest filter `zod-migration.smoke` matches the file basename pattern
  `src/lib/__tests__/zod-migration.smoke.test.ts` — exact substring works.
- npm run lint exits 0 with warnings; only `errors` count breaks the gate.
- `gh pr view` does not support `--json merged`; use `state` (MERGED/CLOSED/OPEN)
  or `mergedAt`.
- `git branch -r --contains <sha>` shows `origin/HEAD -> origin/main` alias as
  an extra line; the real ref is the line below.
- 4 evidence bundles total ~56 MB; `git bundle verify` is fast (sha1 walk).

## 2026-06-05 — F3 Issues Found

- `test/zod-migration-smoke` remote branch persists after PR #123 merge.
  Repo auto-delete-on-merge likely disabled. Cosmetic only; merge content is
  on main.
- 3 Dependabot grouped PRs (#124-#126) appeared after T7 (PR #121) merged —
  expected effect of new grouped config, not a regression.
- The T7 `ci/dependabot-harden` worktree was already cleaned up, so the plan
  baseline state list slightly overstates what currently exists.
