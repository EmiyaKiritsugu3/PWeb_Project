---
name: speckit-pre-plan
description: Pre-plan setup guard — ensures a valid feature branch and feature.json before /speckit-plan runs
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: local
user-invocable: false
disable-model-invocation: true
---

# Pre-Plan Setup Guard

This hook runs automatically before `/speckit-plan`. It solves two recurring failures:

1. `setup-plan.sh` crashing with "Not on a feature branch" when on `main`
2. `feature.json` pointing to a stale or nonexistent spec directory

## Step 1 — Validate feature branch

Run:

```bash
git branch --show-current
```

Check if the output matches either:

- `^(feat|fix|chore|docs|refactor|test|hotfix|perf|ci)/[0-9]{3,}-` (preferred, e.g. `feat/004-elite-workflow`)
- `^[0-9]{3,}-` (legacy, e.g. `004-elite-workflow`) — still valid

**If YES**: branch is valid — proceed to Step 2.

**If NO (e.g. `main`, `develop`, or any non-prefixed branch)**:

- Inform the user: "You are on branch `<branch>`. A feature branch is required before planning."
- Ask: "What is the feature name or number for this plan? (e.g. `feat/005-my-feature`)"
- Wait for user input.
- Run:
  ```bash
  git checkout -b <user-provided-branch>
  ```
- Confirm checkout succeeded before proceeding.

## Step 2 — Validate feature.json

Read the file `.specify/feature.json`.

Extract the `specDirectory` field (may also appear as `featureDirectory` or `directory`).

Check if that directory exists on disk.

**If the directory EXISTS**: feature.json is valid — proceed to Step 3.

**If the directory DOES NOT EXIST**:

- Try to infer from the current branch name: the spec directory should be `specs/<branch-name>/` (e.g. branch `004-elite-workflow-setup` → `specs/004-elite-workflow-setup/`)
- If that inferred directory exists, update `feature.json` to point to it.
- If neither exists, create the directory:
  ```bash
  mkdir -p specs/<branch-name>
  ```
  Then update `feature.json`:
  ```json
  { "specDirectory": "specs/<branch-name>" }
  ```
- Inform the user what was updated.

## Step 3 — Report and hand off

Output a one-line summary:

```
[pre-plan] ✓ Branch: <branch> | Spec dir: <specDirectory>
```

Then proceed — `setup-plan.sh` will now run without errors.
