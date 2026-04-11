# Implementation Plan: 004 — Elite Workflow Setup

**Branch**: `004-elite-workflow-setup` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-elite-workflow-setup/spec.md`

---

## Summary

Bridge every gap between the current project state and elite-level professional workflow:
staging environment, ESLint quality gates, coverage thresholds, Playwright E2E, and Sentry
error tracking. The approach: local Supabase CLI instead of $9.68/month cloud branch,
per-glob coverage thresholds instead of unreachable global 80%, Playwright wired to local
Supabase stack for reproducible E2E in CI.

**Phases 1–6 complete. Phase 7 (Playwright E2E) is the active phase.**

---

## Technical Context

**Language/Version**: TypeScript 5 (strict mode, `useUnknownInCatchVariables`) + Node.js 20
**Primary Dependencies**: Next.js 15 App Router, Prisma 7, Supabase SSR, Zod 3, Genkit 1.31
**Storage**: PostgreSQL via Prisma; local Supabase CLI for E2E (ports 54321/54322)
**Testing**: Vitest 4 (unit), Playwright (E2E — Phase 7), Testing Library (React)
**Target Platform**: Linux server (Vercel), CI on `ubuntu-latest` (GitHub Actions)
**Project Type**: Web application (Next.js App Router, dual-portal)
**Performance Goals**: No E2E test suite should take > 60s total in CI
**Constraints**: E2E must not hit production DB; local Supabase CLI provides isolation
**Scale/Scope**: 4 critical paths × ~4 scenarios each = ~15 E2E scenarios total

---

## Constitution Check

| Principle                              | Impact                                                                    | Status                             |
| -------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------- |
| I — Dual-Portal Architecture           | E2E tests must respect portal boundaries (no cross-portal auth)           | ✅ Each spec isolates by role      |
| II — Type Safety at Every Boundary     | All new test helpers and config files must be TypeScript; no `any`        | ✅ Enforced by ESLint `error` gate |
| III — Test-Gated Business Logic        | Playwright E2E gates critical paths; unit coverage thresholds already set | ✅ Phase 7 completes this          |
| IV — AI as Enhancement, Not Foundation | No AI calls in E2E paths                                                  | ✅ Not applicable                  |
| V — Commit Discipline                  | All commits via Conventional Commits + lint-staged                        | ✅ Enforced by Husky               |

**Gate**: No violations. Cleared to proceed.

---

## Project Structure

```text
specs/004-elite-workflow-setup/
├── plan.md         ← this file
├── research.md     ← complete (all unknowns resolved)
├── data-model.md   ← N/A (no new entities)
├── quickstart.md   ← complete
└── tasks.md        ← original task list (superseded by this plan for remaining work)

tests/
└── e2e/                          ← Phase 7 creates this
    ├── helpers/
    │   └── auth.ts               ← loginAs(page, role) helper
    ├── specs/
    │   ├── auth.spec.ts          ← 4 scenarios
    │   ├── financial-access.spec.ts ← 5 scenarios
    │   ├── student-portal.spec.ts   ← 3 scenarios
    │   └── nav-visibility.spec.ts   ← 3 scenarios
    └── CRITICAL-PATHS.md         ← coverage table

playwright.config.ts              ← Phase 7 creates/replaces
.github/workflows/ci.yml          ← Phase 7 adds e2e job
```

---

## Implementation Status

### ✅ Phase 1–3 — Governance & Constitution (DONE)

- Constitution v1.0.2 amended (branch naming, removed stale rules)
- `AGENTS.md` compressed to constitution pointers
- `CLAUDE.md` updated with AI Session Protocol + Planning Protocol
- `speckit-pre-plan` hook created and wired in `extensions.yml`

### ✅ Phase 4 — Staging Environment: Local Supabase (DONE)

**Decision deviation**: Cloud branch rejected ($9.68/month). Used `supabase start` instead.

- `supabase/config.toml` created via `npx supabase init`
- `.env.test` created with local Supabase credentials (gitignored)
- `.env.example` updated with all env vars documented
- `prisma/seed-e2e.ts` created with 4 deterministic users (fixed UUIDs):
  - `00000000-0000-0000-0000-000000000001` — GERENTE (`gerente@test.com` / `Test1234!`)
  - `00000000-0000-0000-0000-000000000002` — RECEPCIONISTA (`recep@test.com` / `Test1234!`)
  - `00000000-0000-0000-0000-000000000003` — INSTRUTOR (`instrutor@test.com` / `Test1234!`)
  - `00000000-0000-0000-0000-000000000004` — ALUNO (`aluno@test.com` / `Test1234!`)
- `package.json` scripts: `supabase:start`, `supabase:stop`, `seed:e2e`, `e2e`, `e2e:ui`, `e2e:report`
- `docs/operations/RUNBOOK.md` complete

### ✅ Phase 5 — ESLint Quality Gates (DONE)

- `no-explicit-any` → `error`
- `no-unused-vars` → `error` with `argsIgnorePattern: '^_'` + `caughtErrorsIgnorePattern: '^_'`
- All violations fixed or suppressed with inline justification comments
- `npm run lint` → 0 errors (30 `no-console` warnings accepted — server-side logging)

### ✅ Phase 6 — Coverage Thresholds (DONE)

**Decision deviation**: Per-glob thresholds instead of global 80%.
`src/lib/actions/**` excluded (server actions → E2E coverage in Phase 7).

- `src/lib/utils.ts` → 100% (4 tests added in `utils.test.ts`)
- `src/lib/auth.ts` → 100% (already had 5 tests)
- `src/services/**` → 100% (already had tests)
- `npm run test:coverage` → 18/18 passing, 0 threshold violations
- CI `test` job already runs `npm run test:coverage`

### ⏳ Phase 7 — Playwright E2E (ACTIVE)

See task breakdown below.

### ⏳ Phase 8 — Sentry Error Tracking (PENDING)

T053 (create Sentry project at sentry.io) is a manual step — must be done by user.
Remaining tasks unblock immediately after.

### ⏳ Phase 9 — Polish & PR (PENDING)

Depends on Phases 7 and 8 complete.

---

## Phase 7 Task Breakdown — Playwright E2E

**Goal**: 15 E2E scenarios covering 4 critical paths, running in CI against local Supabase.

**Verify before starting**: `npm run supabase:start` succeeds (Docker running).

---

### Setup (serial)

- [ ] **T038** — Install Playwright in `package.json` — run `npm init playwright@latest -- --quiet --lang=ts --no-browsers --no-examples --no-examples` | verify: `playwright.config.ts` exists, `tests/` excluded from vitest
- [ ] **T039** — Install Chromium browser — run `npx playwright install chromium --with-deps` | verify: `npx playwright --version` exits 0

---

### Configuration (serial, after T038)

- [ ] **T040** — Replace generated `playwright.config.ts` with project config — exact content below | verify: `npx playwright list-files` shows 0 tests (no specs yet)

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

---

### Helpers (parallel, after T040)

- [ ] **T041** — Create `tests/e2e/helpers/auth.ts` — `loginAs(page, role)` that fills email + password and waits for redirect | verify: file compiles — `npx tsc --noEmit`

```ts
// tests/e2e/helpers/auth.ts
import type { Page } from '@playwright/test';

const CREDENTIALS: Record<string, { email: string; password: string; redirect: string }> = {
  GERENTE: { email: 'gerente@test.com', password: 'Test1234!', redirect: '/dashboard' },
  RECEPCIONISTA: { email: 'recep@test.com', password: 'Test1234!', redirect: '/dashboard' },
  INSTRUTOR: { email: 'instrutor@test.com', password: 'Test1234!', redirect: '/dashboard' },
  ALUNO: { email: 'aluno@test.com', password: 'Test1234!', redirect: '/aluno/dashboard' },
};

export async function loginAs(page: Page, role: keyof typeof CREDENTIALS) {
  const { email, password, redirect } = CREDENTIALS[role];
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await page.waitForURL(`**${redirect}**`, { timeout: 10_000 });
}
```

---

### E2E Specs (parallel, after T041)

- [ ] **T042** — Create `tests/e2e/specs/auth.spec.ts` — 4 scenarios | verify: `npx playwright test auth.spec.ts --list` shows 4 tests

```ts
// Scenarios:
// 1. GERENTE login → redirects to /dashboard
// 2. RECEPCIONISTA login → redirects to /dashboard
// 3. ALUNO login → redirects to /aluno/dashboard
// 4. Invalid credentials → stays on /login with error message
```

- [ ] **T043** — Create `tests/e2e/specs/financial-access.spec.ts` — 5 scenarios | verify: list shows 5

```ts
// Scenarios:
// 1. GERENTE accesses /dashboard/financeiro → 200
// 2. GERENTE accesses /dashboard/planos → 200
// 3. RECEPCIONISTA → /dashboard/financeiro → redirected (no access)
// 4. INSTRUTOR → /dashboard/financeiro → redirected (no access)
// 5. Unauthenticated → /dashboard/financeiro → redirected to /login
```

- [ ] **T044** — Create `tests/e2e/specs/student-portal.spec.ts` — 3 scenarios | verify: list shows 3

```ts
// Scenarios:
// 1. ALUNO accesses /aluno/dashboard → sees own dashboard
// 2. ALUNO attempts /dashboard → redirected (no admin access)
// 3. ALUNO accesses /aluno/meus-treinos → page loads (workout list visible)
```

- [ ] **T045** — Create `tests/e2e/specs/nav-visibility.spec.ts` — 3 scenarios | verify: list shows 3

```ts
// Scenarios:
// 1. GERENTE sees "Financeiro" nav link; RECEPCIONISTA does not
// 2. GERENTE sees "Planos" nav link; RECEPCIONISTA does not
// 3. Admin nav (/dashboard) is not shown in student portal (/aluno)
```

---

### Documentation & CI (serial, after specs pass locally)

- [ ] **T046** — Create `tests/e2e/CRITICAL-PATHS.md` — table of all 15 scenarios with status (covered/pending) | verify: file exists

- [ ] **T047** — Add E2E job to `.github/workflows/ci.yml` after `test` job | verify: YAML is valid (`npx js-yaml .github/workflows/ci.yml`)

```yaml
e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  needs: test

  steps:
    - name: Checkout
      uses: actions/checkout@v4

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Install Playwright browsers
      run: npx playwright install chromium --with-deps

    - name: Setup Supabase CLI
      uses: supabase/setup-cli@v1
      with:
        version: latest

    - name: Start local Supabase
      run: supabase start

    - name: Run database migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres

    - name: Seed E2E test users
      run: npx tsx prisma/seed-e2e.ts
      env:
        DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_LOCAL_ANON_KEY }}

    - name: Run E2E tests
      run: npm run e2e
      env:
        NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_LOCAL_ANON_KEY }}
        DATABASE_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
        PLAYWRIGHT_BASE_URL: http://localhost:3000

    - name: Upload Playwright report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 7
```

- [ ] **T048** — Local validation — run `npm run supabase:start && npm run seed:e2e && npm run e2e` | verify: all scenarios pass

- [ ] **T049** — Update `docs/operations/RUNBOOK.md` with E2E run instructions and CI secrets needed (`SUPABASE_LOCAL_ANON_KEY`) | verify: section exists

---

## Phase 8 Task Breakdown — Sentry

**⚠️ T053 is manual — requires user action in browser before any of the others.**

- [ ] **T053** [MANUAL] — Create Sentry project at sentry.io: platform = Next.js, name = `smart-management-system`. Copy DSN + generate Auth Token. Share both values.
- [ ] **T054** — Run Sentry wizard — `npx @sentry/wizard@latest -i nextjs` with DSN from T053 | verify: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` exist; `next.config.ts` updated
- [ ] **T055** — Edit `sentry.server.config.ts`: add `beforeSend` to scrub CPF pattern and ignore 404s | verify: no CPF in Sentry events
- [ ] **T056** — Verify `.env.example` has `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ENVIRONMENT` | verify: all 3 present
- [ ] **T057** — Create `src/app/api/sentry-test/route.ts` → confirm error in Sentry dashboard → delete the route | verify: error visible in dashboard in < 30s
- [ ] **T058** — Create `docs/observability/MONITORING.md` with stack, alert gaps, and on-call procedure | verify: file exists

---

## Phase 9 Task Breakdown — Polish & PR

- [ ] **T059** — Update `docs/CURRENT-STATE.md` to reflect post-Phase-7-and-8 state
- [ ] **T060** — Confirm `.env.staging` and `.env.test` are in `.gitignore` | verify: `git status` does not show either
- [ ] **T061** — Full gate run: `npm run lint && npm run typecheck && npm run test:coverage && npm run e2e && npm run build` | verify: all 5 exit 0
- [ ] **T062** — Update `CHANGELOG.md` with feature 004 entry (E2E, ESLint, coverage, Sentry, staging, docs)
- [ ] **T063** — Create PR to `main` referencing `specs/004-elite-workflow-setup/`, DoD checklist in description

---

## Execution Notes

### Local E2E pre-run checklist

```bash
npm run supabase:start   # start local Supabase (requires Docker)
npm run seed:e2e         # populate test users
npm run e2e              # run Playwright
npm run supabase:stop    # cleanup
```

### CI secret required for E2E job

`SUPABASE_LOCAL_ANON_KEY` — the anon key output by `supabase start`.
It is deterministic for a given `supabase/config.toml` — safe to commit the key value
as a GitHub Actions secret (it only grants access to the ephemeral local stack in CI,
not to any real data).

Current value (from `.env.test`, output of `supabase start`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRFA0NiK7kyqHnwbWLxQ24rC6uSYMIFSdcrHZOJSnxg
```

### Vitest / Playwright separation

`vitest.config.ts` `include` pattern (`src/**/*.test.{ts,tsx}`) does not overlap with
`playwright.config.ts` `testDir` (`tests/e2e/specs`). No collision risk.

---

## Quality Gate Summary

| Gate            | Command                 | Current Status                          |
| --------------- | ----------------------- | --------------------------------------- |
| TypeScript      | `npm run typecheck`     | ✅ 0 errors                             |
| Lint            | `npm run lint`          | ✅ 0 errors                             |
| Unit + Coverage | `npm run test:coverage` | ✅ 18/18, 0 threshold violations        |
| E2E             | `npm run e2e`           | ⏳ Playwright not yet installed         |
| Build           | `npm run build`         | ⏳ Not yet verified with Sentry wrapper |
