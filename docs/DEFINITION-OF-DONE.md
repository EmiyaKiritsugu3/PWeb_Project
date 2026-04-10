# Definition of Done — Five Star Academy

Applies to all features. A task is **Done** only when ALL applicable criteria are met.

## Universal Criteria (every task)

- [x] Code compiles: `npm run typecheck` — 0 errors
- [x] Lint clean: `npm run lint` — 0 errors (warnings reviewed)
- [x] Tests pass: `npm run test` — all green
- [x] No `any` added without inline suppression comment explaining why
- [x] No secrets committed (check `.env*` files before staging)
- [x] Constitution check: no principle violated

## Per Story Criteria

### US1 — Security & Threat Model ✅ Complete

- [x] `docs/security/THREAT-MODEL.md` exists with all 6 STRIDE categories filled
- [x] `docs/operations/INCIDENT-RESPONSE.md` exists with detection + response + rollback sections
- [x] `docs/observability/SLOS.md` exists with availability and latency SLOs defined

### US2 — Staging Environment ✅ Complete

- [x] Local Supabase stack configured (`supabase start` → ports 54321/54322)
- [x] `.env.test` exists locally (gitignored) with local Supabase credentials
- [x] `.env.example` has all staging + Sentry variables documented
- [x] `prisma/seed-e2e.ts` exists with 4 deterministic users (fixed UUIDs)
- [x] `npm run seed:e2e` script added to `package.json`
- [x] `npm run supabase:start` and `npm run supabase:stop` scripts added
- [x] `docs/operations/RUNBOOK.md` documents staging setup, deploy, and rollback

### US3 — ESLint Quality Gates ✅ Complete

- [x] `npm run lint` returns **0 errors** (30 no-console warnings — accepted)
- [x] `no-explicit-any` set to `error` in `eslint.config.mjs`
- [x] `no-unused-vars` set to `error` with `argsIgnorePattern: '^_'` and `caughtErrorsIgnorePattern: '^_'`
- [x] Every remaining suppression has an inline comment with justification

### US4 — Coverage Threshold ⏳ Next

- [ ] `npm run test:coverage` passes without threshold failure
- [ ] `vitest.config.ts` enforces ≥ 80% on `src/lib/**` and `src/services/**`
- [ ] New business logic functions have unit tests before implementation

### US5 — Playwright E2E ⏳ Pending

- [ ] `npm run e2e` → 15/15 scenarios passing
- [ ] All 4 critical paths covered (auth, financial-access, student-portal, nav-visibility)
- [ ] E2E job exists in `.github/workflows/ci.yml` and passes on push
- [ ] `tests/e2e/CRITICAL-PATHS.md` documents covered and pending scenarios
- [ ] Secrets documented in `docs/operations/RUNBOOK.md`

### US6 — Sentry Error Tracking ⏳ Pending

- [ ] Sentry project created at sentry.io (manual step — must be done by user)
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
