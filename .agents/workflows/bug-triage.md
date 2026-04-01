---
description: Procedure for identifying, fixing, and properly documenting bugs.
---

// turbo-all
# Workflow: Bug Triage a.k.a Friction Minimization

When investigating an error or a bug, follow these methodical steps:

## 1. Discovery
- Do NOT jump straight into writing code or applying blind patches.
- Read component logic, trace database schemas (Zod vs Prisma), and observe browser/console logs if using terminal/MCP tools.
- Identify the **root cause** of the behavior.

## 2. Context Cross-Referencing
- Consult `friction-log.md`. Did we encounter a similar error before?
- Have there been prior assumptions about API endpoints or data schemas documented in `PROJECT_STATUS.md`?

## 3. Resolution
- Apply the fix cleanly and predictably.
- Run typechecking (e.g., `npx tsc --noEmit`) to verify TS compilation viability without issues.

## 4. Documentation
- Once resolved, document this anomaly IN `friction-log.md`.
- Be precise: Document Date, Issue, Root Cause, Temporary Workaround (if used), and the Permanent Fix you just implemented.
