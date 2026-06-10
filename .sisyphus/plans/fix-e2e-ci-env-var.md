# Fix E2E CI env var — add SUPABASE_SERVICE_ROLE_KEY to Run E2E tests step

## TL;DR

> **Quick Summary**: PR #134 moved seeding into `globalSetup`, but the CI workflow's "Run E2E tests" step never had `SUPABASE_SERVICE_ROLE_KEY` in its env block — it was previously provided by the now-redundant "Seed E2E test users" step (separate shell, no env persistence). Add 1 line to the env block.
>
> **Deliverables**:
>
> - `.github/workflows/ci.yml` — 1 line addition (add `SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}` to the "Run E2E tests" step's env block)
> - New commit on `fix/payment-status-e2e-auto-seed` branch (no force-push)
> - CI re-runs and the E2E Tests check passes
> - Optional cleanup: remove the now-redundant "Seed E2E test users" step (since globalSetup handles it)
>
> **Estimated Effort**: Quick (1 file, 1-7 lines, CI verification)
> **Parallel Execution**: NO (sequential: edit → commit → push → wait CI)
> **Critical Path**: Edit ci.yml → commit → push → CI green → merge PR

---

## Context

### Original Request

"e2e falhou. descubra o motivo e crie um plano de correção" (E2E failed. Find the reason and create a correction plan.)

### Investigation Summary

**Failing check**: `E2E Tests` job in CI run `27098112117` → step `Run E2E tests` → exit code 1

**Error from CI logs**:

```
Error: globalSetup: missing required env vars: SUPABASE_SERVICE_ROLE_KEY
   at ../global-setup.ts:19
```

### Root Cause

PR #134 changed the e2e flow:

- **Before**: CI ran `seed-e2e.ts` as a SEPARATE step (`Seed E2E test users`) with `SUPABASE_SERVICE_ROLE_KEY` in that step's `env:` block, then ran `npm run e2e` as a different step (different shell, no env persistence between steps unless via `$GITHUB_ENV`).
- **After PR #134**: Seeding is done by `globalSetup` inside Playwright, which runs in the `Run E2E tests` step. The `Seed E2E test users` step was NOT removed (it's now redundant but idempotent — `upsert` makes re-running safe).
- **Bug**: The `Run E2E tests` step's `env:` block never had `SUPABASE_SERVICE_ROLE_KEY` because it was previously provided by the now-redundant seed step. The Playwright globalSetup's required-env check fails immediately.

**Why not in `.env.test`**:

- `.env.test` IS gitignored (line 35 of `.gitignore`: `/.env.test`)
- The CI runner only checks out the repo + npm installs; it never has the local `.env.test` file
- `dotenv -e .env.test` in the e2e npm script silently loads nothing (file doesn't exist in CI)

**Why `SUPABASE_LOCAL_SERVICE_ROLE_KEY` (with prefix) doesn't help**:

- The "Export Supabase keys" step writes `SUPABASE_LOCAL_SERVICE_ROLE_KEY` to `$GITHUB_ENV` (using the `_LOCAL_` prefix to avoid clobbering anything in the runner's global env)
- The "Run E2E tests" step's `env:` block does NOT forward this as `SUPABASE_SERVICE_ROLE_KEY` (unprefixed)
- Playwright's globalSetup looks for the unprefixed name

### CI Workflow Structure (current state)

```yaml
# .github/workflows/ci.yml (lines 100-200, approximate)
e2e:
  ...
  env:
    SUPABASE_LOCAL_ANON_KEY: ''
    SUPABASE_LOCAL_SERVICE_ROLE_KEY: ''
  steps:
    - name: Checkout
    - name: Setup Node.js
    - name: Setup Supabase CLI
    - name: Start local Supabase
    - name: Export Supabase keys   # writes SUPABASE_LOCAL_* to $GITHUB_ENV
    - name: Push database schema
      env:
        DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      run: npx prisma db push --accept-data-loss
    - name: Seed E2E test users    # ← REDUNDANT after PR #134, but harmless
      env:
        DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ env.SUPABASE_LOCAL_ANON_KEY }}
        SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}
      run: npx tsx prisma/seed-e2e.ts
    - name: Run E2E tests          # ← needs SUPABASE_SERVICE_ROLE_KEY in env
      env:
        NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ env.SUPABASE_LOCAL_ANON_KEY }}
        DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        PLAYWRIGHT_BASE_URL: http://localhost:3333
      run: npm run e2e
    - name: Upload Playwright report
```

### Metis Review

**Identified gaps** (auto-applied defaults):

- **Guardrail**: Don't modify any other workflow step. Surgical 1-line change.
- **Guardrail**: The redundant "Seed E2E test users" step is harmless (idempotent upsert). Removing it is optional but reduces CI runtime by ~5s. Plan includes it as a recommendation but not required.
- **Test pollution prevention**: globalSetup runs once per `npx playwright test` invocation. The redundant separate seed step also runs. Two seed runs is OK (idempotent), but wasteful.
- **CI parity**: The fix only adds env forwarding, no logic change. Same behavior as before PR #134 (env was set, just in a different step).

---

## Work Objectives

### Core Objective

Forward `SUPABASE_SERVICE_ROLE_KEY` from `$GITHUB_ENV` to the `Run E2E tests` step's env block in `.github/workflows/ci.yml`, so Playwright's globalSetup can find it.

### Concrete Deliverables

- `.github/workflows/ci.yml` — 1 line added to `Run E2E tests` step's `env:` block
- (Optional) `.github/workflows/ci.yml` — remove the redundant `Seed E2E test users` step (~10 lines removed)
- New commit on `fix/payment-status-e2e-auto-seed` branch
- Branch pushed to origin (no force)
- CI E2E Tests check re-runs and passes
- PR #134 mergeable status: CLEAN

### Definition of Done

- [ ] `gh pr view 134 --json mergeStateStatus -q .mergeStateStatus` returns `CLEAN`
- [ ] All CI checks (Quality Gates, Tests & Coverage, E2E Tests, Vercel, etc.) pass on the new commit
- [ ] Local `npm run e2e` still works (env file path unchanged)

### Must Have

- Surgical 1-line change to `.github/workflows/ci.yml`
- New commit (not amend) on `fix/payment-status-e2e-auto-seed`
- Branch pushed without force

### Must NOT Have (Guardrails)

- No changes to source code (no `.ts`, no `.prisma`, no env file changes)
- No changes to other workflow steps (Quality Gates, Tests & Coverage, Vercel deploy, etc.)
- No force-push
- No amend
- No package.json / dep changes
- No removal of the "Seed E2E test users" step without explicit user approval (it's redundant but removing is a separate decision — see optional cleanup)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — all verification is agent-executed.

### Test Decision

- No new tests required — the fix is CI configuration, verified by CI itself passing.
- After push, CI must show all checks pass (including `E2E Tests` which is the previously-failing one).

### QA Policy

The single QA criterion: **CI `E2E Tests` check returns `success` on the new commit.**

Evidence saved to `.sisyphus/evidence/fix-e2e-ci-env/task-1-*.txt`:

- Pre-push: local `git diff` of ci.yml
- Post-push: `gh pr checks 134` output (wait ~3min for CI to re-run)
- Post-CI: `gh pr view 134 --json statusCheckRollup` showing E2E Tests as `SUCCESS`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (single task, sequential):
├── Task 1: Edit .github/workflows/ci.yml — add 1 env var to Run E2E tests step
└── Task 2: Commit + push + verify CI

Wave FINAL (4 parallel reviews — same as PR #134 final wave):
├── F1: Plan Compliance Audit
├── F2: Diff Audit
├── F3: CI Verification
└── F4: Scope Fidelity Check
```

### Dependency Matrix

- **1**: - - 2
- **2**: 1 - F1-F4
- **F1-F4**: 2 - user-okay

### Agent Dispatch Summary

- **Wave 1**: 1 task — `quick` category (single env line addition)
- **Wave FINAL**: 4 parallel — 1 oracle, 3 unspecified-high

---

## TODOs

> Every task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.

- [x] 1. Add `SUPABASE_SERVICE_ROLE_KEY` to `Run E2E tests` step's env block in `.github/workflows/ci.yml`

  **What to do**:
  - Edit `.github/workflows/ci.yml`
  - Find the `Run E2E tests` step (step name: `Run E2E tests`)
  - In its `env:` block, add the line `SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}`
  - Save the file

  **Must NOT do**:
  - Do NOT modify any other workflow step
  - Do NOT remove the (redundant) `Seed E2E test users` step (optional, separate decision)
  - Do NOT touch any source code

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 1-line addition to a single file
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential with commit/push)
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 2
  - **Blocked By**: None

  **References** (CRITICAL — executor has no context):
  - `.github/workflows/ci.yml` — the workflow file. The `Run E2E tests` step's `env:` block currently has:
    ```yaml
    env:
      NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${{ env.SUPABASE_LOCAL_ANON_KEY }}
      DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      PLAYWRIGHT_BASE_URL: http://localhost:3333
    ```
  - The "Export Supabase keys" step writes `SUPABASE_LOCAL_SERVICE_ROLE_KEY` to `$GITHUB_ENV`. Use this as the source for the env var.
  - `tests/e2e/global-setup.ts:11-15` — the required env vars list (after the recent review fix):
    ```ts
    const required = [
      'DATABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    ];
    ```

  **Acceptance Criteria**:
  - [ ] `.github/workflows/ci.yml` has `SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}` in the `Run E2E tests` step's env block
  - [ ] No other lines in `ci.yml` changed
  - [ ] File still valid YAML (parseable)

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: ci.yml env block contains the new var
    Tool: Bash
    Preconditions: edit applied
    Steps:
      1. grep -B 1 -A 6 "Run E2E tests" .github/workflows/ci.yml
         → Expected: shows step name + env block with new SUPABASE_SERVICE_ROLE_KEY line
      2. python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
         → Expected: exit 0, no YAML errors
    Evidence: .sisyphus/evidence/fix-e2e-ci-env/task-1-ci-yml-edit.txt
  ```

  **Commit**: NO (groups with task 2)

- [x] 2. Commit + push + verify CI

  **What to do**:
  1. Stage ONLY `.github/workflows/ci.yml`
  2. Commit with conventional-commits subject
  3. Push to origin (no force)
  4. Wait for CI to re-run (~3 min)
  5. Verify E2E Tests check passes

  **Must NOT do**:
  - Do NOT use `git add .` or `git add -A`
  - Do NOT use `--force` or `--amend`
  - Do NOT use `--no-verify`
  - Do NOT stage any other file

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: standard git commit + push + CI poll
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: Final Verification Wave
  - **Blocked By**: Task 1

  **References**:
  - `.github/workflows/ci.yml` — workflow file (just edited in Task 1)
  - Current branch: `fix/payment-status-e2e-auto-seed` (from previous PR #134 work)

  **Acceptance Criteria**:
  - [ ] Single new commit on branch with subject `fix(ci): forward SUPABASE_SERVICE_ROLE_KEY to e2e job`
  - [ ] Branch pushed without force
  - [ ] `gh pr checks 134` shows `E2E Tests: pass` within ~5 min
  - [ ] `gh pr view 134 --json mergeStateStatus -q .mergeStateStatus` returns `CLEAN`

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Commit + push succeeds
    Tool: Bash
    Preconditions: Task 1 complete
    Steps:
      1. git add .github/workflows/ci.yml
      2. git status -s   → Expect: M  .github/workflows/ci.yml (only)
      3. git commit -m "fix(ci): forward SUPABASE_SERVICE_ROLE_KEY to e2e job" -m "PR #134 moved seeding from a separate CI step into Playwright's globalSetup, but the Run E2E tests step's env block did not include SUPABASE_SERVICE_ROLE_KEY (it was previously set by the now-redundant Seed E2E test users step, in a separate shell with no env persistence).
  ```

Adds 1 line forwarding SUPABASE_SERVICE_ROLE_KEY from \$GITHUB_ENV to the Run E2E tests step's env block, so globalSetup's required-env check passes." 4. git push origin fix/payment-status-e2e-auto-seed
→ Expect: success, no force needed 5. git log origin/main..HEAD --oneline
→ Expect: 4 commits (3 prior + this new fixes-commit)
Evidence: .sisyphus/evidence/fix-e2e-ci-env/task-2-commit-push.txt

Scenario: CI E2E Tests check passes after re-run
Tool: Bash (gh CLI)
Preconditions: push successful
Steps: 1. sleep 60 # give CI time to start 2. gh pr checks 134
→ Expect: E2E Tests: pending (re-running) 3. sleep 180 # wait for re-run (~3 min) 4. gh pr checks 134
→ Expect: E2E Tests: pass 5. gh pr view 134 --json mergeStateStatus -q .mergeStateStatus
→ Expect: CLEAN (or BLOCKED if any other check still pending)
Evidence: .sisyphus/evidence/fix-e2e-ci-env/task-2-ci-result.txt

````

**Commit**: YES (this IS the commit task)

---

## Final Verification Wave (MANDATORY — after Wave 1)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
Read the plan end-to-end. Verify each "Must Have" present in the diff. Verify each "Must NOT Have" absent. Check evidence files exist. Compare deliverables against plan.
Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Diff Audit** — `unspecified-high`
Verify only `.github/workflows/ci.yml` changed. Verify exactly 1 line added (or 1-7 lines if cleanup). Verify YAML valid. Verify the new env var line syntax matches existing lines in the same block.
Output: `Files [1 changed: ci.yml] | Lines [+1 -0] | YAML valid [yes/no] | VERDICT`

- [ ] F3. **CI Verification** — `unspecified-high`
Query `gh pr checks 134` and `gh pr view 134 --json statusCheckRollup,mergeStateStatus`. Verify E2E Tests check is `SUCCESS` and `mergeStateStatus` is `CLEAN`.
Output: `E2E Tests [pass/fail] | mergeStateStatus [CLEAN/BLOCKED/CONFLICTING] | All checks pass [yes/no] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
For the new commit, read "What to do" vs actual diff. Verify 1:1. Detect any creep. Flag unaccounted changes.
Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **1 commit** on branch `fix/payment-status-e2e-auto-seed`:
- `fix(ci): forward SUPABASE_SERVICE_ROLE_KEY to e2e job`
- 1 file, 1 line
- Body: explains the env var flow change

---

## Success Criteria

### Verification Commands
```bash
gh pr view 134 --json mergeStateStatus,mergeable  # Expect: CLEAN, MERGEABLE
gh pr checks 134                                     # Expect: all 6+ pass
````

### Final Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `Run E2E tests` step env block
- [ ] No other files changed
- [ ] No force-push
- [ ] No amend
- [ ] CI E2E Tests passes
- [ ] PR mergeable: CLEAN
- [ ] User explicit "okay" after Final Verification Wave

---

## Appendix: Why removing the "Seed E2E test users" step is OPTIONAL (not in scope)

The CI workflow has this step AFTER PR #134:

```yaml
- name: Seed E2E test users
  env:
    ...
    SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}
  run: npx tsx prisma/seed-e2e.ts
```

This step is now REDUNDANT because `globalSetup` runs the same seed. Removing it:

- **Pros**: ~5s faster CI runtime, less confusing workflow
- **Cons**: 5-10 lines removed, requires touching the workflow more (small but additional diff)

The seed is idempotent (uses `upsert`), so running it twice (once in the separate step, once in globalSetup) is harmless. The plan does NOT require removing it. If the user wants this cleanup, it's a separate small follow-up plan.

The MINIMAL fix to make CI green is just adding the env var. The plan focuses on that.
