# Archived Branches

This file records branches that were deleted after verification of orphan status or confirmed-content-duplication. Each entry preserves the commit metadata for historical reference.

## Archive Bundles (full git bundles, can be re-cloned)

| Branch                           | Bundle                                                                          | Bundle SHA references tip |
| -------------------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| `fix/code-quality-phase2`        | `.sisyphus/evidence/branch-archive-fix-code-quality-phase2.bundle` (15M)        | `5498f4f`                 |
| `fix/sonarcloud-coverage-ci`     | `.sisyphus/evidence/branch-archive-fix-sonarcloud-coverage-ci.bundle` (14M)     | `024f272`                 |
| `fix/sonarqube-labens-correcoes` | `.sisyphus/evidence/branch-archive-fix-sonarqube-labens-correcoes.bundle` (15M) | `5639d6c`                 |
| `pr-108`                         | `.sisyphus/evidence/branch-archive-pr-108.bundle` (14M)                         | `854a6fa`                 |

Each bundle is a complete git repository snapshot. To restore: `git clone <bundle-file> restored-branch` then `git checkout <sha>`.

## pr-108

- **Tip SHA:** `854a6fa7b99cfae16dacd7326aefd1f8cb381355`
- **Last commit message:** `chore: override tmp version to fix high severity vulnerability`
- **Archive date:** 2026-06-05
- **Reason for deletion:** PR #108 was closed unmerged (closed Dependabot workflow experiment for SonarCloud). Work was superseded by PRs #109 and #110 which landed the SonarCloud integration properly. The 6 unmerged commits contained only original #108 work and a tmp override that landed via different path.
- **Verification:**
  - `git log pr-108 --not main --oneline` returned 6 commits of original (unmerged) work
  - `git reflog show pr-108` shows only local reflog activity, no remote activity
  - Work scope (`.github/workflows/sonarcloud.yml`, `sonar-project.properties`) is fully covered by merged PRs #109 and #110
- **Deletion:** deleted from BOTH local and remote (`git push origin --delete pr-108`)

## fix/code-quality-phase2

- **Tip SHA:** `5498f4f39440abb5b7518fbdf83ec1265e974b55`
- **Last commit message:** `ci(sonar): revert action upgrade (caused JRE download 403)`
- **Archive date:** 2026-06-05
- **Reason for deletion:** Branch contained 34 unmerged commits (post-#118 follow-ups never PR'd). Diagnosis showed the 3 cherry-pick candidates (024f272, 5639d6c, 5498f4f) are all EMPTY against origin/main — content already in main via squash merges from PRs #109, #110, #117, #118. Per user decision (1c), the "cherry-pick follow-ups" task reduced to "archive + delete" since no follow-ups exist to extract.
- **Verification:**
  - `git log fix/code-quality-phase2 --not origin/main --oneline` → 34 unmerged
  - `git apply --check --reverse` on cherry-pick → exit 0 (content already in main)
  - All work scope covered by merged PRs
- **Deletion:** deleted from BOTH local and remote (`git push origin --delete fix/code-quality-phase2`)

## fix/sonarcloud-coverage-ci

- **Tip SHA:** `024f272b32a299297ffae7294005349da233fcf6`
- **Last commit message:** `ci: use PR author condition instead of trigger actor for Dependabot skip`
- **Archive date:** 2026-06-05
- **Reason for deletion:** Branch contained 3 unmerged commits; 2 of them (PRs #109 + #110 content) were already squash-merged to main. The 1 cherry-pick candidate (024f272) was verified EMPTY against main (`git apply --check --reverse` exit 0). Per user decision (1c), reduced to archive + delete.
- **Verification:**
  - `git log fix/sonarcloud-coverage-ci --not origin/main --oneline` → 3 unmerged
  - Cherry-pick 024f272 found no content to apply
  - PR #109 (SonarCloud CI) and #110 (paths-ignore) already landed via squash
- **Deletion:** deleted from BOTH local and remote (`git push origin --delete fix/sonarcloud-coverage-ci`)

## fix/sonarqube-labens-correcoes

- **Tip SHA:** `5639d6c24b2ee529aa8749d65710544b586e5a46`
- **Last commit message:** `fix(code-review): address NOSONAR format and batchUpsert auth bypass`
- **Archive date:** 2026-06-05
- **Reason for deletion:** Branch contained 16 unmerged commits. The 1 cherry-pick candidate (5639d6c) was verified EMPTY against main — its auth bypass fix (`role === null ? user.id : data.alunoId`) already exists in main at `src/lib/actions/treinos.ts:51,171` (introduced via squash-merge of PR #117). Per user decision (1c), reduced to archive + delete.
- **Verification:**
  - `git log fix/sonarqube-labens-correcoes --not origin/main --oneline` → 16 unmerged
  - `git show 5639d6c -- src/lib/actions/treinos.ts` and `git apply --check --reverse` → exit 0 (content already in main)
  - PR #117 (SonarQube issues) already landed via squash
- **Deletion:** deleted from BOTH local and remote (`git push origin --delete fix/sonarqube-labens-correcoes`)

## Remote-only: feat/arch-optimization-security

- **Tip SHA:** `58f2681`
- **Last commit message:** `fix: resolve unit test mock format and ESLint any warnings in treinos.test.ts`
- **Archive date:** 2026-06-05 (T5)
- **Reason for deletion:** Branch was merged to main (commit `58f2681` reachable from `origin/main`). Local copy never existed; only the remote ref was stale.
- **Verification:**
  - `git log origin/feat/arch-optimization-security --not origin/main --oneline` → empty (0 unmerged)
  - Tip reachable from main
- **Deletion:** deleted from remote only (`git push origin --delete feat/arch-optimization-security`)

---

**Total archives:** 4 git bundles (~58M total) + 5 deleted refs (1 local, 4 remote).
