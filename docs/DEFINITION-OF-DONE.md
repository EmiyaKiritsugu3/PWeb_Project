# Definition of Done — Five Star Academy

Applies to all features. A task is **Done** only when ALL applicable criteria are met.

## Universal Criteria (every task)

- [ ] Code compiles: `npm run typecheck` — 0 errors
- [ ] Lint clean: `npm run lint` — 0 errors (warnings reviewed)
- [ ] Tests pass: `npm run test` — all green
- [ ] No `any` added without inline suppression comment explaining why
- [ ] No secrets committed (check `.env*` files before staging)
- [ ] Constitution check: no principle violated

## Per Story Criteria

### US1 — Security & Threat Model

- [ ] `docs/security/THREAT-MODEL.md` exists with all 6 STRIDE categories filled
- [ ] `docs/operations/INCIDENT-RESPONSE.md` exists with detection + response + rollback sections
- [ ] `docs/observability/SLOS.md` exists with availability and latency SLOs defined

### US2 — Staging Environment

- [ ] Supabase staging branch exists and is reachable
- [ ] `.env.staging` exists locally (not committed)
- [ ] `.env.example` has all staging + Sentry variables documented
- [ ] `prisma/seed-e2e.ts` runs without errors: `npx tsx prisma/seed-e2e.ts`
- [ ] `npm run seed:e2e` script works against staging DB
- [ ] `docs/operations/RUNBOOK.md` documents staging setup, deploy, and rollback

### US3 — ESLint Quality Gates

- [ ] `npm run lint` returns **0 errors, 0 warnings**
- [ ] `no-explicit-any` set to `error` in `eslint.config.mjs`
- [ ] `no-unused-vars` set to `error` in `eslint.config.mjs`
- [ ] Every remaining suppression has an inline comment with justification

### US4 — Coverage Threshold

- [ ] `npm run test:coverage` passes without threshold failure
- [ ] `vitest.config.ts` enforces ≥ 80% on `src/lib/**` and `src/services/**`
- [ ] New business logic functions have unit tests before implementation

### US5 — Playwright E2E

- [ ] `npm run e2e` → 15/15 scenarios passing
- [ ] All 4 critical paths covered (auth, financial-access, student-portal, nav-visibility)
- [ ] E2E job exists in `.github/workflows/ci.yml` and passes on push
- [ ] `tests/e2e/CRITICAL-PATHS.md` documents covered and pending scenarios
- [ ] Secrets documented in `docs/operations/RUNBOOK.md`

### US6 — Sentry Error Tracking

- [ ] Sentry project created at sentry.io (manual step)
- [ ] `@sentry/nextjs` installed and wizard completed
- [ ] `beforeSend` hook: CPF/email scrubbed, 404s ignored
- [ ] Test error appears in Sentry dashboard in < 30s
- [ ] `npm run build` passes with Sentry wrapper
- [ ] `docs/observability/MONITORING.md` documents stack and alerting gaps

## PR Criteria (before merge to main)

- [ ] All 4 gates pass: `npm run lint && npm run test && npm run e2e && npm run build`
- [ ] `CHANGELOG.md` updated with feature entry
- [ ] `docs/CURRENT-STATE.md` reflects post-implementation state
- [ ] PR description references `specs/004-elite-workflow-setup/`
- [ ] No `.env.staging` or secrets staged
