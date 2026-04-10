# Feature Spec: 004 — Elite Workflow Setup

**Branch**: `004-elite-workflow-setup`
**Date**: 2026-04-09
**Status**: Approved
**Author**: José Inamar de Medeiros Júnior

---

## 1. Problem Statement

The SmartManagementSystem has a solid technical foundation but is missing the
process infrastructure that separates good projects from elite professional ones.
Specifically: no staging environment, no E2E tests, no error tracking in production,
no enforced coverage thresholds, no security threat model, no operations runbooks,
and no canonical "current state" document for AI session continuity.

These gaps create compounding risk: bugs reach production undetected, AI sessions
lose context and repeat work, critical paths have no automated protection, and
the team has no observability into what breaks and when.

## 2. Goal

Bridge every identified gap between the current project state and elite-level
professional workflow — without disrupting active feature development (It3).

## 3. Non-Goals

- Replacing the existing CI/CD pipeline (extend it, don't replace)
- Implementing feature flags (out of scope for academic timeline)
- Penetration testing (out of scope — documented as It5 QA work)
- Implementing OpenAPI specs (Server Actions don't map to REST contracts)

## 4. Success Criteria

| Criterion                                                      | Verification                                           |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| `npm run lint` exits 0 with `any` and `unused-vars` as `error` | CI green                                               |
| Playwright E2E suite covers all 4 critical paths               | `npx playwright test` passes                           |
| Sentry captures errors in staging and production               | Test error visible in Sentry dashboard                 |
| Supabase staging branch exists and is isolated from production | Branch visible in Supabase dashboard                   |
| Coverage threshold ≥ 60% enforced in CI                        | `npm run test:coverage` exits non-zero below threshold |
| `docs/CURRENT-STATE.md` exists and is ≤ 1 page                 | File exists, updated at session end                    |
| `docs/DEFINITION-OF-DONE.md` exists with DoD per US            | File exists, reviewed by team                          |
| `docs/security/THREAT-MODEL.md` exists                         | File exists                                            |
| `docs/operations/RUNBOOK.md` exists                            | File exists                                            |

## 5. Scope

### Phase 1 — AI Session Protocol & Documentation (zero code)

- `docs/CURRENT-STATE.md`
- `docs/DEFINITION-OF-DONE.md`
- `docs/security/THREAT-MODEL.md`
- `docs/process/RFC-TEMPLATE.md`
- `docs/process/POSTMORTEM-TEMPLATE.md`

### Phase 2 — Supabase Staging Branch

- Create branch via Supabase MCP
- Document staging env vars
- Update `.env.example`
- Create `docs/operations/RUNBOOK.md`

### Phase 3 — ESLint Quality Gates

- Fix all remaining `any` violations
- Raise `no-explicit-any` → `error`
- Fix all `unused-vars` violations
- Raise `no-unused-vars` → `error`

### Phase 4 — Coverage Threshold

- Baseline current coverage
- Write missing unit tests to reach 60%
- Enforce 60% threshold in `vitest.config.ts`

### Phase 5 — Playwright E2E

- Install and configure Playwright
- Write 4 critical path test suites
- Add to GitHub Actions CI
- Create `tests/e2e/CRITICAL-PATHS.md`

### Phase 6 — Sentry Error Tracking

- Install `@sentry/nextjs`
- Configure client, server, and edge
- Add to `.env.example`
- Create `docs/observability/MONITORING.md`

### Phase 7 — SLOs & Incident Response

- `docs/observability/SLOS.md`
- `docs/operations/INCIDENT-RESPONSE.md`

## 6. Dependencies

| Dependency                           | Status                       | Blocker for          |
| ------------------------------------ | ---------------------------- | -------------------- |
| `no-explicit-any` violations count   | Needs audit                  | Phase 3 tasks        |
| Sentry project DSN                   | Manual creation at sentry.io | Phase 6 tasks        |
| GitHub Actions secrets configuration | Manual step                  | Phase 5 + 6 CI tasks |
| Supabase staging branch URL          | Created in Phase 2           | Phase 5 E2E tests    |
