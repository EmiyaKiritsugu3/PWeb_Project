---
description: Mandatory validation loop for project health before concluding a task.
---

// turbo-all
# Workflow: Pre-Flight Check

This workflow ensures that the project is in a stable, buildable state before any significant change is finalized or a session ends.

## 1. Environment Sync
- Run `npm install` to ensure the local `node_modules` is perfectly synced with `package-lock.json`.

## 2. Static Analysis
- Run `npx tsc --noEmit` to verify TypeScript integrity.
- **Goal:** Zero compilation errors.

## 3. Build Verification
- Run `npm run build` to confirm the production bundle can be successfully generated (Next.js/Vite standard).
- If using a dev server for quick checks, ensure `npm run dev` starts without immediate crashes.

## 4. Self-Healing Loop
- If any command above fails:
  - Immediately trigger the `bug-triage.md` workflow.
  - Document the failure in `friction-log.md`.
  - Fix the reported issue and restart the `Pre-Flight Check`.
