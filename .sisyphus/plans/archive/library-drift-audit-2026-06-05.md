# Library Drift Audit — Context7 Plan

## TL;DR

> **Quick Summary**: Audit of 4 library areas (Next 15.5, Genkit 1.36, Sentry 10.56, Zod 3.25+Supabase SSR 0.10) against current docs. Result: 3 actionable PRs covering 1 CRITICAL Supabase SSR bug, 4 Genkit modernization items, 1 Zod forward-compat cleanup, 1 Sentry AI instrumentation gap.
>
> **Deliverables**:
>
> - 1 audit findings doc
> - PR-A: Supabase SSR 0.10 setAll headers fix (CRITICAL cache-bleed)
> - PR-B: Genkit 1.36 modernization (F1-F3) + Sentry 10.56 server-action tracing (M-1) + dataCollection (M-2) + Sentry×Genkit instrumentation (C-1)
> - PR-C: Zod forward-compat cleanup (positional `message` → object; deprecated `z.string().email/uuid/url` → top-level)
> - 4 quality gates green at every PR
>
> **Estimated Effort**: Short (5-8h total)
> **Parallel Execution**: YES — PRs sequential (shared files in some)
> **Critical Path**: PR-A (CDN bleed) → PR-B (modernization) → PR-C (zod)

---

## Context

### Original Request

User asked for a focused Context7 audit of code+structure to identify library drift after recent dependabot bumps (PR #127 bumped genkit 1.32→1.36, sentry 10.53→10.56, supabase 2.105→2.107; #124 bumped patches; #123 added smoke test).

### Interview Summary

- **Scope chosen**: Option A (Focused Context7 audit on 4 areas). NOT full code+structure audit.
- **4 areas**: Next.js 15.5 App Router · Genkit 1.36 · Sentry 10.56 · Zod 3.25 + Supabase SSR 0.10
- **Test strategy**: tests-after (matches repo convention from #118)
- **Excluded**: architecture review, security audit, business logic, performance profiling (Context7 doesn't cover these; would need different methodology)

### Research Findings Summary

All 4 librarian agents returned structured findings with severity tags:

| Area                | CRITICAL                              | MAJOR                                                       | MEDIUM                                                        | MINOR                                                                     | INFO |
| ------------------- | ------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- | ---- |
| Next.js 15.5        | 0                                     | 0 (3 track-for-16)                                          | 0                                                             | 3 (JSON.parse, typedRoutes, generateMetadata)                             | 5    |
| Genkit 1.36         | 0                                     | 0                                                           | 4 (output!, safeParse hot path, streamSchema dup, ESM verify) | 3 (annotateSchema, dead code, trace CLI)                                  | 2    |
| Sentry 10.56        | 1 (no Sentry×Genkit integration)      | 3 (server-action tracing ×11, dataCollection, project type) | 0                                                             | 1 (array attrs)                                                           | 6    |
| Zod 3.25 + SSR 0.10 | 1 (middleware setAll missing headers) | 0                                                           | 2 (zod positional msg, middleware double-write)               | 3 (zod top-level deprecations, server.ts setAll, .single vs .maybeSingle) | 2    |

**Net actionable work**: 1 CRITICAL CDN-cache-bleed bug + 2 MAJOR Sentry items + 6 MEDIUM items across 3 PRs.

### Metis Review

Skipped per user's "focused + fast" choice. Findings are well-evidenced with permalinks; synthesis clear; risk-stratified.

---

## Work Objectives

### Core Objective

Patch 1 CRITICAL security-adjacent bug (CDN cache bleed) + modernize Genkit/Sentry/zod usage to current library best practices, in 3 atomic PRs.

### Concrete Deliverables

- `.sisyphus/evidence/audit-context7-2026-06-05.md` — full findings doc
- `.sisyphus/plans/library-drift-audit-2026-06-05.md` — this plan
- PR-A: `fix(supabase): forward cache-bust headers in middleware setAll (Supabase SSR 0.10)`
- PR-B: `feat(observability): Genkit 1.36 modernization + Sentry 10.56 server-action tracing + Sentry×Genkit`
- PR-C: `refactor(schemas): zod forward-compat (positional message → object; deprecated string formats → top-level)`
- All 4 quality gates green
- F1-F4 reviews at end

### Definition of Done

- [ ] All 4 quality gates green on main after each PR merge
- [ ] Audit findings doc persisted
- [ ] Each PR has 1 specific concern (atomic, not mixed)
- [ ] Smoke test still passes (zod version-agnostic — shouldn't break)
- [ ] No regression in build / test / lint
- [ ] F1-F4 reviews APPROVE
- [ ] Vercel preview green for PR-B (Sentry config change is risky)

### Must Have

- All quality gates per constitution §Development Workflow
- Single concern per PR per AGENTS.md
- Atomic commits `feat|fix|docs|refactor|test|chore|perf|ci|revert`
- Squash-merge to main
- Manual eyeball of Vercel preview for PR-B
- Smoke test (`zod-migration.smoke.test.ts`) re-runs green after each PR

### Must NOT Have

- No bumping deps in audit PRs (this is a code audit, not a dep bump)
- No refactoring beyond the audit's findings (no scope creep)
- No new tests beyond what audit fixes require
- No `as any` / `@ts-ignore` additions
- No constitution changes
- No Next 16 bump (out of scope — track separately per MAJOR-1/2/3 in next audit findings)
- No zod v4 migration (genkit cap confirmed — out of scope until genkit unblocks)
- No Supabase Realtime adoption (not used in project)

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: YES (vitest 4.1.7 + Playwright E2E)
- **Automated tests**: tests-after (matches repo convention)
- **Smoke test**: `zod-migration.smoke.test.ts` from #123 — already version-agnostic, must keep passing

### QA Policy

Every task MUST include QA scenarios. Evidence in `.sisyphus/evidence/`.

- **Backend/lib**: `npm run typecheck && npm run lint && npm run format:check && npm test`
- **Supabase SSR**: e2e via Playwright + curl on auth route → assert `Cache-Control` header
- **Sentry**: build + manual check of generated source maps + verify no PII leak in spans
- **Zod**: smoke test + grep-verified 0 deprecation patterns

---

## Execution Strategy

### Parallel Execution Waves

````bash
Wave 1 (Foundation):
├── T1: Compile audit findings doc
├── T2: Re-run smoke test (baseline)
└── T3: Confirm Vercel preview works on current main

Wave 2 (CRITICAL fix — PR-A):
└── T4: Fix middleware setAll headers + double-write + update to 0.10.3

Wave 3 (Observability modernization — PR-B):
├── T5: Genkit F1 (output! null guard)
├── T6: Genkit F2 (drop safeParse from chunk loop)
├── T7: Genkit F3 (remove redundant streamSchema)
├── T8: Genkit F10 verify (ESM .mjs resolution in build)
├── T9: Sentry M-1 (withServerActionInstrumentation × 11)
├── T10: Sentry M-2 (dataCollection migration)
├── T11: Sentry C-1 (choose Sentry×Genkit integration approach)

Wave 4 (Zod forward-compat — PR-C):
├── T12: Zod MEDIUM positional message → object (~30 sites)
└── T13: Zod LOW deprecated z.string().email/uuid/url → top-level (~20 sites)

Wave 5 (Verification + merge):
├── T14: PR-A merge + Vercel verify
├── T15: PR-B merge + Vercel verify + manual Genkit flow test
├── T16: PR-C merge
└── T17: F1-F4 reviews
```bash

### Dependency Matrix

- T1: none (parallel)
- T2: none
- T3: none
- T4 → T5-T11 (PR-A first because CDN bleed is CRITICAL security risk; PR-B touches shared files)
- T5-T11: T4 done; T5-T7 are 3 sequential edits to same file (worktree recommended); T8 independent; T9-T10 sequential (sentry config); T11 design decision required
- T12-T13: sequential (same file edits); after PR-B
- T14-T16: sequential merges
- T17: after T16

### Agent Dispatch Summary

- T1: `writing` (compile findings doc)
- T2-T3: `quick` (baseline checks)
- T4: `quick` (single file, critical fix)
- T5-T7: `quick` (3 mechanical edits to `workout-generator-flow.ts` and `workout-feedback-flow.ts`)
- T8: `quick` (build + verify)
- T9: `unspecified-high` (11 server actions, mechanical but large)
- T10: `quick` (sentry config file edit)
- T11: `unspecified-high` (design decision + Sentry×Genkit integration choice)
- T12: `quick` (~30 sed-grade edits)
- T13: `quick` (~20 sed-grade edits)
- T14-T16: `quick` (merge + verify)
- T17 (F1-F4): parallel `oracle` / `unspecified-high` / `unspecified-high+playwright` / `deep`

---

## TODOs

- [ ] T1. **Compile audit findings doc**
      **What**: Synthesize all 4 librarian research outputs into `.sisyphus/evidence/audit-context7-2026-06-05.md`. One section per area (Next 15.5, Genkit 1.36, Sentry 10.56, Zod 3.25+Supabase SSR 0.10). Include: severity table, each finding with file:line + fix, sources, validation commands used.
      **Must NOT**: add new findings not in research; omit findings; merge research into one undifferentiated blob.
      **Recommended Agent Profile**: `writing`
      **Parallelization**: Can Run In Parallel: YES; Parallel Group: Wave 1
      **References**: 4 research outputs in conversation
      **Acceptance Criteria**:
  - File exists, >3000 words
  - 4 sections with severity tables
  - Each finding cites file:line + source permalink
  - No `Fix` sections (those go in PRs)
    **QA Scenarios**:

````

Scenario: Findings doc complete
Tool: Bash
Steps: 1. ls .sisyphus/evidence/audit-context7-2026-06-05.md 2. wc -l file (expect >100) 3. grep -c "## " file (expect ≥4 sections) 4. grep -c "🔴\|🟡\|🟢" file (expect severity markers)
Expected: all pass
Evidence: .sisyphus/evidence/t1-findings-doc.log

```

**Commit**: NO (evidence file only)

- [ ] T2. **Re-run smoke test (baseline)**
    **What**: `npm test -- zod-migration.smoke` on current main (092f077). Verify 15/15 pass. Confirms baseline before any PRs.
    **Must NOT**: modify any code; skip quality gates.
    **Recommended Agent Profile**: `quick`
    **Parallelization**: Can Run In Parallel: YES
    **References**: `.sisyphus/evidence/f3-manual-qa.md` (prior baseline)
    **Acceptance Criteria**:
- `npm test -- zod-migration.smoke` → 15/15 pass
- No test modified: `git diff src/lib/__tests__/zod-migration.smoke.test.ts` empty
- main HEAD = 092f077
  **QA Scenarios**:

```

Scenario: Smoke baseline green
Tool: Bash
Steps: 1. git rev-parse origin/main → 092f077 2. npm test -- zod-migration.smoke 2>&1 | tail -10 3. git diff origin/main -- src/lib/**tests**/zod-migration.smoke.test.ts | wc -l → 0
Expected: 15/15 pass, no test modified
Evidence: .sisyphus/evidence/t2-smoke-baseline.log

```

**Commit**: NO

- [ ] T3. **Confirm Vercel preview works on current main**
    **What**: Get current Vercel preview URL for main (from PR #127's preview or the latest commit). Hit `/`, `/login`, `/dashboard` to confirm no baseline issue. If unavailable, skip (informational only).
    **Must NOT**: trigger new deploy; force push; modify config.
    **Recommended Agent Profile**: `quick`
    **Parallelization**: Can Run In Parallel: YES
    **References**: README "Vercel Preview Comments" check in PRs
    **Acceptance Criteria**:
- Vercel preview URL found (from last Vercel check in #127 or current)
- `/` returns 200 (or 307 redirect to /login, expected)
- `/login` returns 200
- `/dashboard` returns 307 to /login (expected for unauth)
- No 5xx errors
  **QA Scenarios**:

```

Scenario: Vercel preview baseline
Tool: Bash (curl)
Steps: 1. Find latest Vercel preview URL from #127 commit checks 2. curl -I <preview>/ → 200 or 307 3. curl -I <preview>/login → 200 4. curl -I <preview>/dashboard → 307 to /login
Expected: all match expected status
Evidence: .sisyphus/evidence/t3-vercel-baseline.log

````

**Commit**: NO

- [ ] T4. **PR-A: Supabase SSR 0.10 setAll headers fix (CRITICAL)**
    **What**: Fix the `setAll` 2nd-arg `headers` forwarding in `src/utils/supabase/middleware.ts` (CRITICAL — CDN cache-bleed risk) + same fix in `server.ts` (LOW). Bump `@supabase/ssr` to 0.10.3 (current latest). Remove redundant double-write to `request.cookies`.
    **Edit pattern**:
```ts
// middleware.ts
setAll(cookiesToSet, headers) {  // ← ADD headers arg
  cookiesToSet.forEach(({ name, value, options }) =>
    supabaseResponse.cookies.set(name, value, options)  // write to response ONLY
  );
  Object.entries(headers).forEach(([k, v]) => supabaseResponse.headers.set(k, v));
},
````

**Bump**: `@supabase/ssr` `^0.10.2` → `^0.10.3` in package.json (lockfile-only).
**Must NOT**: touch unrelated supabase code; modify cookie names; remove `request.cookies` reads.
**Recommended Agent Profile**: `quick`
**Parallelization**: Can Run In Parallel: NO; Blocked By: T1, T2; Blocks: T5-T16 (shared file with PR-B? — no, PR-B is in `src/lib/actions/*` and `sentry.*.config.ts`, not supabase files)
**References**:

- `src/utils/supabase/middleware.ts:52-60` (current `setAll` signature)
- `src/utils/supabase/server.ts:17-24` (same pattern, server component)
- 0.10 release notes on `setAll` 2nd arg
- Vercel CDN cache headers behavior
  **Acceptance Criteria**:
- `src/utils/supabase/middleware.ts` `setAll` takes 2nd `headers` arg
- `src/utils/supabase/middleware.ts` writes headers to `supabaseResponse.headers` via `Object.entries(headers).forEach(...)`
- `src/utils/supabase/middleware.ts` does NOT write to `request.cookies` in setAll (only response)
- `src/utils/supabase/server.ts` same fix applied
- `@supabase/ssr` version `^0.10.3` in package.json
- `npm ls @supabase/ssr` shows `0.10.3` resolved
- `npm run typecheck && npm test` → exit 0
- `npm test -- zod-migration.smoke` → 15/15 pass (no regression)
- E2e: `curl -I <preview>/login` → response includes `cache-control: private, no-cache, no-store, must-revalidate, max-age=0`
  **QA Scenarios**:

```
Scenario: setAll headers forwarded correctly
  Tool: Bash (curl) + grep
  Steps:
    1. grep -n "setAll" src/utils/supabase/middleware.ts → 2-arg signature
    2. grep -n "Object.entries(headers)" src/utils/supabase/middleware.ts → present
    3. npm ls @supabase/ssr → 0.10.3
    4. npm test 2>&1 | tail -5 → all pass
    5. (Vercel preview) curl -I <preview>/login | grep -i cache-control
  Expected: cache-control header present, all green
  Evidence: .sisyphus/evidence/t4-pr-a-ssr-fix.log
```

**Commit**: YES (squash at PR-A merge)

- Message: `fix(supabase): forward cache-bust headers in middleware setAll (Supabase SSR 0.10)`
- Files: `src/utils/supabase/middleware.ts`, `src/utils/supabase/server.ts`, `package.json`, `package-lock.json`
- [ ] T5. **PR-B-T1: Genkit F1 — replace `output!` with null guard**
      **What**: In `src/ai/flows/workout-feedback-flow.ts:99`, replace `return output!` with explicit null guard. 1.36 docs canonical pattern: `if (output == null) throw new Error('flow failed to produce output')`. Fixes non-null assertion lying to type-checker.
      **Edit pattern**:

  ```ts
  // Before
  return output!;
  // After
  if (output == null) throw new Error('workoutFeedbackFlow: output is null');
  return output;
  ```

  **Must NOT**: change flow logic; rename flow; refactor other patterns.
  **Recommended Agent Profile**: `quick`
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T4; Sequential with T6/T7 (same file area, can be combined into 1 worktree)
  **References**:
  - `src/ai/flows/workout-feedback-flow.ts:99` (line number may shift)
  - Genkit 1.36 docs "defineFlow" pattern
  - Finding F1 in audit doc
    **Acceptance Criteria**:
  - `grep -n "return output!" src/ai/flows/workout-feedback-flow.ts` returns 0
  - `grep -nE "if \(output == null\)" src/ai/flows/workout-feedback-flow.ts` returns ≥1
  - `npm test -- workout-generator-validation` → all 4 pass
  - `npm run typecheck` exit 0
    **QA Scenarios**:

  ```
  Scenario: output! replaced
    Tool: Bash (grep) + npm test
    Steps:
      1. grep -n "return output!" src/ai/flows/workout-feedback-flow.ts → no match
      2. grep -nE "if \(output == null\)" src/ai/flows/workout-feedback-flow.ts → match
      3. npm test -- workout-generator-validation 2>&1 | tail -5 → all pass
      4. npm run typecheck 2>&1 | tail -3 → exit 0
    Expected: all pass
    Evidence: .sisyphus/evidence/t5-genkit-f1-output-guard.log
  ```

  **Commit**: YES (commit on PR-B branch)
  - Message: `refactor(ai): replace output! with null guard in workout-feedback-flow (Genkit 1.36)`
  - Files: `src/ai/flows/workout-feedback-flow.ts`
  - Pre-commit: `npm test -- workout-generator-validation`

- [ ] T6. **PR-B-T2: Genkit F2 — drop `safeParse` from stream-chunk hot path**
      **What**: In `src/ai/flows/workout-generator-flow.ts:60-65`, drop the per-chunk `safeParse(chunk.output)` calls. 1.36 native constrained generation (#5393) makes chunks schema-conformant already. Keep ONLY the final-output safeParse as defense-in-depth.
      **Edit pattern**:

  ```ts
  // Before
  for await (const chunk of stream) {
    const result = WorkoutGeneratorAIOutputSchema.safeParse(chunk.output);
    if (!result.success) throw new Error(result.error.message);
    yield result.data;
  }
  // After
  for await (const chunk of stream) {
    if (chunk.output == null) continue; // skip empty chunks
    yield chunk.output;
  }
  ```

  **Must NOT**: remove the FINAL-output safeParse after the stream loop; change schema; add new types.
  **Recommended Agent Profile**: `quick`
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T4; Sequential with T5/T7 (worktree)
  **References**:
  - `src/ai/flows/workout-generator-flow.ts:60-75` (current stream loop)
  - Genkit 1.36 PR #5393 (native constrained gen)
  - Finding F2 in audit doc
    **Acceptance Criteria**:
  - `grep -n "safeParse" src/ai/flows/workout-generator-flow.ts` returns ≤1 (only final-output safeParse)
  - `npm test -- workout-generator-validation` all 4 pass
  - `npm run typecheck` exit 0
    **QA Scenarios**:

  ```
  Scenario: safeParse only on final output
    Tool: Bash (grep) + npm test
    Steps:
      1. grep -nE "safeParse" src/ai/flows/workout-generator-flow.ts → ≤1
      2. npm test -- workout-generator-validation 2>&1 | tail -5 → all pass
      3. npm run typecheck → exit 0
    Expected: green
    Evidence: .sisyphus/evidence/t6-genkit-f2-stream-safeparse.log
  ```

  **Commit**: YES (commit on PR-B branch)
  - Message: `refactor(ai): drop safeParse from stream chunk loop (Genkit 1.36 native constrained gen)`
  - Files: `src/ai/flows/workout-generator-flow.ts`
  - Pre-commit: `npm test -- workout-generator-validation`

- [ ] T7. **PR-B-T3: Genkit F3 — remove redundant `streamSchema`**
      **What**: In `src/ai/flows/workout-generator-flow.ts:27`, remove the `streamSchema: WorkoutGeneratorAIOutputSchema` line. Defaults to `outputSchema` when omitted.
      **Edit pattern**:

  ```ts
  // Before
  export const workoutGeneratorFlow = ai.defineFlow(
    { name: 'workoutGeneratorFlow', inputSchema, outputSchema, streamSchema: WorkoutGeneratorAIOutputSchema },
    async (input) => { ... }
  );
  // After
  export const workoutGeneratorFlow = ai.defineFlow(
    { name: 'workoutGeneratorFlow', inputSchema, outputSchema },
    async (input) => { ... }
  );
  ```

  **Must NOT**: remove `outputSchema`; add new schema; change flow name.
  **Recommended Agent Profile**: `quick`
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T4; Sequential with T5/T6
  **References**:
  - `src/ai/flows/workout-generator-flow.ts:27`
  - Genkit 1.36 docs (streamSchema defaults to outputSchema)
  - Finding F3 in audit doc
    **Acceptance Criteria**:
  - `grep -n "streamSchema" src/ai/flows/workout-generator-flow.ts` returns 0
  - `npm test -- workout-generator-validation` all pass
  - `npm run typecheck` exit 0
    **QA Scenarios**:

  ```
  Scenario: streamSchema removed
    Tool: Bash (grep) + npm test
    Steps:
      1. grep -n "streamSchema" src/ai/flows/workout-generator-flow.ts → no match
      2. npm test -- workout-generator-validation 2>&1 | tail -5 → all pass
    Expected: green
    Evidence: .sisyphus/evidence/t7-genkit-f3-stream-schema.log
  ```

  **Commit**: YES (commit on PR-B branch)
  - Message: `refactor(ai): remove redundant streamSchema (defaults to outputSchema)`
  - Files: `src/ai/flows/workout-generator-flow.ts`
  - Pre-commit: `npm test -- workout-generator-validation`

- [ ] T8. **PR-B-T4: Genkit F10 — verify ESM `.mjs` resolution after genkit 1.36**
      **What**: Per Genkit 1.36 PR #5387, ESM output rewrites `.js` → `.mjs`. Verify project's `next build` doesn't break on `.mjs` resolution. Run clean build, check for errors.
      **Edit pattern**: none — verification only.
      **Must NOT**: modify next.config without need; transpilePackages without evidence of error; skip if no build error.
      **Recommended Agent Profile**: `quick`
      **Parallelization**: Can Run In Parallel: YES (verification, doesn't touch code)
      **References**:
  - Genkit 1.36 PR #5387
  - Next.js 15 + ESM resolution rules
    **Acceptance Criteria**:
  - `rm -rf .next && npm run build` exit 0
  - No `.mjs` resolution errors in build log
  - If errors found → document in evidence, escalate (NOT auto-fix)
    **QA Scenarios**:
  ```
  Scenario: Build clean with genkit 1.36
    Tool: Bash (npm)
    Steps:
      1. rm -rf .next (clean state)
      2. npm run build 2>&1 | tee /tmp/build.log
      3. grep -E "(error|ERROR|failed)" /tmp/build.log | grep -iE "mjs|resolve" → no match
    Expected: clean build, no mjs errors
    Evidence: .sisyphus/evidence/t8-genkit-f10-esm-build.log
  ```
  **Commit**: YES (commit on PR-B branch as empty or "chore: verify genkit 1.36 ESM compat" if log captured)
  - Message: `chore(ai): verify genkit 1.36 ESM build (no code change)`
  - Files: none
- [ ] T9. **PR-B-T5: Sentry M-1 — wrap server actions with `withServerActionInstrumentation`**
      **What**: In `src/lib/actions/{treinos,alunos,financeiro}.ts` (11 server actions), wrap each with `Sentry.withServerActionInstrumentation(name, { headers, formData, recordResponse: true }, fn)`. Provides distributed tracing + auto-capture of headers/formData/response.
      **Edit pattern** (example):

  ```ts
  // Before
  export async function upsertTreinoAction(treinoData: TreinoBase | ...) {
    try { ... } catch (error) { Sentry.captureException(error); return handleActionError(error); }
  }
  // After
  export async function upsertTreinoAction(treinoData: TreinoBase | ...) {
    return await Sentry.withServerActionInstrumentation(
      'upsertTreinoAction',
      { headers: await headers(), formData: undefined, recordResponse: true },
      async () => {
        try { ... } catch (error) { Sentry.captureException(error); return handleActionError(error); }
      }
    );
  }
  ```

  **11 sites**: treinos.ts:5, alunos.ts:5, financeiro.ts:1. Each gets named instrumentation.
  **Must NOT**: change action signatures; remove existing captureException (keep as backup); add Sentry imports where absent.
  **Recommended Agent Profile**: `unspecified-high` (mechanical but 11 sites)
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T4; Sequential with T10/T11 (different files, can be in same worktree)
  **References**:
  - `src/lib/actions/treinos.ts` (5 server actions)
  - `src/lib/actions/alunos.ts` (5 server actions)
  - `src/lib/actions/financeiro.ts` (1 server action)
  - Sentry 10.56 docs: Server Action tracing
  - Finding M-1 in audit doc
    **Acceptance Criteria**:
  - 11 `withServerActionInstrumentation` wrappers (one per server action)
  - Each named after the action
  - `npm run typecheck` exit 0
  - `npm test` all pass (mocked actions should still work)
  - `npm test -- zod-migration.smoke` 15/15
  - Build successful
    **QA Scenarios**:

  ```
  Scenario: All 11 server actions wrapped
    Tool: Bash (grep) + npm test
    Steps:
      1. grep -rn "withServerActionInstrumentation" src/lib/actions/ | wc -l → 11
      2. npm run typecheck 2>&1 | tail -3 → exit 0
      3. npm test 2>&1 | tail -5 → all pass
      4. npm test -- zod-migration.smoke 2>&1 | tail -5 → 15/15
      5. npm run build 2>&1 | tail -5 → success
    Expected: green
    Evidence: .sisyphus/evidence/t9-sentry-m1-server-action-instr.log
  ```

  **Commit**: YES (commit on PR-B branch)
  - Message: `feat(observability): wrap server actions with Sentry.withServerActionInstrumentation`
  - Files: `src/lib/actions/treinos.ts`, `src/lib/actions/alunos.ts`, `src/lib/actions/financeiro.ts`
  - Pre-commit: `npm run typecheck && npm test`

- [ ] T10. **PR-B-T6: Sentry M-2 — `sendDefaultPii: false` → `dataCollection` migration**
      **What**: In `sentry.server.config.ts`, replace `sendDefaultPii: false` with `dataCollection: { userInfo: false, httpHeaders: { request: false, response: false }, cookies: false, ipAddress: false }`. Sentry 10.54 introduced this; `sendDefaultPii` will be removed in future.
      **Edit pattern**:

  ```ts
  // Before
  Sentry.init({
    dsn: ...,
    sendDefaultPii: false,
    beforeSend: ...,
  });
  // After
  Sentry.init({
    dsn: ...,
    // dataCollection replaces sendDefaultPii (deprecated path)
    dataCollection: {
      userInfo: false,
      httpHeaders: { request: false, response: false },
      cookies: false,
      ipAddress: false,
    },
    beforeSend: ...,
  });
  ```

  **Must NOT**: remove `beforeSend` (PII scrubber still needed); change dsn; modify edge config.
  **Recommended Agent Profile**: `quick`
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T4; Sequential with T11
  **References**:
  - `sentry.server.config.ts:9` (current `sendDefaultPii`)
  - Sentry 10.54 changelog (`dataCollection` introduction)
  - Finding M-2 in audit doc
    **Acceptance Criteria**:
  - `grep -n "sendDefaultPii" sentry.server.config.ts` returns 0
  - `grep -n "dataCollection" sentry.server.config.ts` returns ≥1
  - `npm run build` exit 0 (Sentry config validates)
  - `npm test` all pass
    **QA Scenarios**:

  ```
  Scenario: dataCollection in sentry config
    Tool: Bash (grep) + npm
    Steps:
      1. grep -n "sendDefaultPii" sentry.server.config.ts → no match
      2. grep -n "dataCollection" sentry.server.config.ts → match
      3. npm run build 2>&1 | tail -5 → success
      4. npm test 2>&1 | tail -5 → all pass
    Expected: green
    Evidence: .sisyphus/evidence/t10-sentry-m2-data-collection.log
  ```

  **Commit**: YES (commit on PR-B branch)
  - Message: `refactor(observability): migrate sendDefaultPii to dataCollection (Sentry 10.54+)`
  - Files: `sentry.server.config.ts`
  - Pre-commit: `npm run build`

- [ ] T11. **PR-B-T7: Sentry C-1 — Genkit AI flow instrumentation (manual `Sentry.startSpan`, no new deps)**
      **What**: Sentry 10.56 has no official Genkit integration. **Default: manual `Sentry.startSpan` around `ai.generate()` calls** (no new deps, complies with "no new deps" rule). Future option: `@genkit-ai/observability` plugin (requires new dep, NOT in this plan).
      **Edit pattern** (default — manual span, `workout-generator-flow.ts`):
  ```ts
  // src/ai/flows/workout-generator-flow.ts
  import * as Sentry from '@sentry/nextjs';
  // ...
  export const workoutGeneratorFlow = ai.defineFlow(
    { name: 'workoutGeneratorFlow', inputSchema, outputSchema },
    async (input) => {
      return await Sentry.startSpan(
        { op: 'gen_ai.generate_content', name: 'workoutGeneratorFlow' },
        async (span) => {
          span.setAttribute('gen_ai.system', 'google_genai');
          span.setAttribute('gen_ai.request.model', 'gemini-2.5-flash');
          const r = await ai.generate({...});
          span.setAttribute('gen_ai.usage.input_tokens', r.usage?.inputTokens ?? 0);
          span.setAttribute('gen_ai.usage.output_tokens', r.usage?.outputTokens ?? 0);
          return r;
        }
      );
    }
  );
  ```
  Same pattern in `workout-feedback-flow.ts`.
  **Future option** (NOT this plan, requires new dep): `@genkit-ai/observability` plugin with `sentry: { dsn }` config — community OTel export to Sentry. Defer to separate PR.
  **Must NOT**: add Sentry to RSCs (AGENTS.md says no); break streaming flow (T6 already simplified); change prompt content; remove existing `safeParse` defense; install new packages.
  **Recommended Agent Profile**: `unspecified-high` (integration + design)
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T4, T10 (sentry config first); Sequential with T9
  **References**:
  - Sentry AI Agent Monitoring: https://docs.sentry.io/platforms/javascript/guides/connect/ai-agent-monitoring/
  - Future option: https://firebase-genkit.mintlify.app/concepts/observability
  - Finding C-1 in audit doc
    **Acceptance Criteria**:
  - `Sentry.startSpan` wrappers in BOTH flow files (`workout-generator-flow.ts` + `workout-feedback-flow.ts`)
  - `op: 'gen_ai.generate_content'`, `name: <flowName>` per Sentry AI Agent Monitoring schema
  - `gen_ai.system`, `gen_ai.request.model`, `gen_ai.usage.input_tokens`, `gen_ai.usage.output_tokens` attributes set
  - **NO new deps in `package.json`** (per Must NOT rule)
  - `npm test -- workout-generator-validation` all 4 pass
  - `npm run typecheck` exit 0
  - `npm run build` exit 0
  - Vercel preview: trigger one Genkit flow, check Sentry dashboard for the span
    **QA Scenarios**:
  ```
  Scenario: Genkit flow spans show in Sentry (manual path, no new dep)
    Tool: Bash + manual Sentry check
    Steps:
      1. grep -n "Sentry.startSpan" src/ai/flows/workout-generator-flow.ts src/ai/flows/workout-feedback-flow.ts → ≥2
      2. grep -n "Sentry.startSpan" src/ai/genkit.ts → 0 (no RSC instrumentation)
      3. git diff origin/main -- package.json | grep -E "^\+[^+]" | grep "@genkit-ai/observability" → no match (no new dep)
      4. npm test -- workout-generator-validation 2>&1 | tail -5 → all pass
      5. npm run build 2>&1 | tail -5 → success
      6. (Vercel preview) trigger workout generator, check Sentry dashboard for span
    Expected: span visible, no new dep, all green
    Evidence: .sisyphus/evidence/t11-sentry-c1-genkit-instr.log
  ```
  **Commit**: YES (commit on PR-B branch)
  - Message: `feat(observability): instrument Genkit AI flows with Sentry manual spans`
  - Files: `src/ai/flows/workout-generator-flow.ts`, `src/ai/flows/workout-feedback-flow.ts`
  - Pre-commit: `npm run typecheck && npm test -- workout-generator-validation`
- [ ] T12. **PR-C-T1: Zod positional `message` arg → object form**
      **What**: In `src/lib/definitions.ts` (~30 sites) + `src/app/actions/auth.ts` (1 site), convert `z.string().min(3, 'msg')` to `z.string().min(3, { message: 'msg' })`. Same for `z.string().email('msg')`, `z.string().uuid('msg')`. Works in v3 + v4, no behavior change in 3.25.
      **Edit pattern**:

  ```ts
  // Before
  z.string().min(3, 'Nome deve ter pelo menos 3 caracteres');
  // After
  z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' });
  ```

  **AST-grep pattern**: `$SCHEMA.$METHOD($N, $MSG)` where $MSG is a string literal → `$SCHEMA.$METHOD($N, { message: $MSG })`.
**Must NOT**: change schema shape; add new constraints; touch schemas with `error`callback (already object form).
**Recommended Agent Profile**:`quick`
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T11 (sequential PRs); Blocks: T13 (same file)
  **References**:
  - `src/lib/definitions.ts` (~30 sites, line numbers in audit)
  - `src/app/actions/auth.ts:9` (`z.string().email('Por favor, insira um e-mail válido.')`)
  - zod v4 migration guide
    **Acceptance Criteria**:
  - `grep -nE "\.min\(\d+,\s*['\"]" src/lib/definitions.ts` returns 0
  - `grep -nE "\.email\(['\"]" src/lib/definitions.ts` returns 0 (combined with T13 fix)
  - `grep -nE "\.email\(['\"]" src/app/actions/auth.ts` returns 0
  - `npm test -- zod-migration.smoke` 15/15 (test is version-agnostic)
  - `npm test` all pass
  - `npm run typecheck` exit 0
  - `npm run lint` exit 0
    **QA Scenarios**:

  ```
  Scenario: All positional message args converted
    Tool: Bash (grep) + npm test
    Steps:
      1. grep -nE "\.min\(\d+,\s*['\"]" src/lib/definitions.ts → no match
      2. grep -nE "\.email\(['\"]" src/lib/definitions.ts src/app/actions/auth.ts → no match
      3. grep -c "{ message:" src/lib/definitions.ts → ≥30
      4. npm test 2>&1 | tail -5 → all pass
      5. npm test -- zod-migration.smoke 2>&1 | tail -5 → 15/15
      6. npm run typecheck 2>&1 | tail -3 → exit 0
    Expected: all green
    Evidence: .sisyphus/evidence/t12-zod-positional-message.log
  ```

  **Commit**: YES (commit on PR-C branch)
  - Message: `refactor(schemas): convert positional zod error messages to object form (v4 forward-compat)`
  - Files: `src/lib/definitions.ts`, `src/app/actions/auth.ts`
  - Pre-commit: `npm test -- zod-migration.smoke && npm test`

- [ ] T13. **PR-C-T2: Zod deprecated `z.string().email/uuid/url` → top-level**
      **What**: In `src/lib/definitions.ts` (~20 sites) + `src/app/actions/auth.ts:9` (1 site), convert `z.string().email()` → `z.email()`, `z.string().uuid()` → `z.uuid()`, `z.string().url()` → `z.url()`. Same in form-aluno.tsx (1 site). Works in v3 (deprecated but functional) + v4 (canonical).
      **Edit pattern**:

  ```ts
  // Before
  z.string().email('Email inválido');
  // After
  z.email({ error: 'Email inválido' }); // or just z.email() if no custom msg
  ```

  **AST-grep pattern**: `z.string().$FORMAT($MSG)` where $FORMAT is email/uuid/url → `z.$FORMAT($MSG)` or `z.$FORMAT({ error: $MSG })`.
**Must NOT**: change schemas that use `z.string().email().or(z.string())`(chain breakage — manual fix); add new constraints.
**Recommended Agent Profile**:`quick`
  **Parallelization**: Can Run In Parallel: NO; Blocked By: T12 (same file)
  **References**:
  - `src/lib/definitions.ts:14` (email), `:18` (url), 18× uuid sites
  - `src/app/actions/auth.ts:9` (email)
  - `src/components/dashboard/alunos/form-aluno.tsx:36` (email)
  - zod v4 migration: top-level format methods
    **Acceptance Criteria**:
  - `grep -nE "z\.string\(\)\.(email|uuid|url|ip|cidr)\(" src/` returns 0
  - `grep -nE "\bz\.(email|uuid|url|ipv4|ipv6)\(" src/lib/definitions.ts src/app/actions/auth.ts src/components/dashboard/alunos/form-aluno.tsx` returns ≥20
  - `npm test -- zod-migration.smoke` 15/15
  - `npm test` all pass
  - `npm run typecheck` exit 0
    **QA Scenarios**:

  ```
  Scenario: All deprecated zod string formats replaced
    Tool: Bash (grep) + npm test
    Steps:
      1. grep -nE "z\.string\(\)\.(email|uuid|url|ip|cidr)\(" src/ → no match
      2. grep -cE "\bz\.(email|uuid|url)\(" src/ → ≥20
      3. npm test -- zod-migration.smoke 2>&1 | tail -5 → 15/15
      4. npm test 2>&1 | tail -5 → all pass
    Expected: green
    Evidence: .sisyphus/evidence/t13-zod-top-level-formats.log
  ```

  **Commit**: YES (commit on PR-C branch)
  - Message: `refactor(schemas): use top-level zod format methods (email/uuid/url)`
  - Files: `src/lib/definitions.ts`, `src/app/actions/auth.ts`, `src/components/dashboard/alunos/form-aluno.tsx`
  - Pre-commit: `npm test -- zod-migration.smoke && npm test`

- [ ] T14. **Merge PR-A + Vercel verify**
      **What**: Squash-merge PR-A (Supabase SSR fix) to main. Wait for Vercel preview. Hit `/login` and confirm `cache-control: private, no-cache, no-store, must-revalidate, max-age=0` in response headers (proves headers are propagating).
      **Must NOT**: skip Vercel verify; merge if CI red.
      **Recommended Agent Profile**: `quick`
      **Parallelization**: Can Run In Parallel: NO; Blocked By: T4 + CI green; Blocks: T15
      **References**: PR-A diff + Vercel preview URL
      **Acceptance Criteria**:
  - PR-A MERGED in main
  - Vercel preview shows correct `cache-control` header on `/login`
  - main HEAD includes PR-A commit
  - No new test failures in CI
    **QA Scenarios**:

  ```
  Scenario: PR-A merged + cache headers verified
    Tool: Bash (gh + curl)
    Steps:
      1. gh pr view <A> --json state → MERGED
      2. git log origin/main --oneline -1 → PR-A commit
      3. curl -I <Vercel preview>/login | grep -i cache-control → match
    Expected: all pass
    Evidence: .sisyphus/evidence/t14-pr-a-merged.log
  ```

  **Commit**: NO (merge is the deliverable)

- [ ] T15. **Merge PR-B + Vercel verify + manual Genkit flow test**
      **What**: Squash-merge PR-B (observability) to main. Wait for Vercel. Trigger one Genkit flow (workout generator or feedback) via preview. Verify Sentry dashboard shows the flow execution (trace or span). Confirm no new Sentry errors.
      **Must NOT**: merge if Vercel fails; merge if Sentry shows no trace (instrumentation broken).
      **Recommended Agent Profile**: `unspecified-high` + sentry-cli skill
      **Parallelization**: Can Run In Parallel: NO; Blocked By: T5-T11 + CI green; Blocks: T16
      **References**:
  - PR-B diff
  - Sentry project dashboard (org: inamarjunior2_personal_org)
  - Vercel preview URL
    **Acceptance Criteria**:
  - PR-B MERGED in main
  - Vercel preview green
  - Genkit flow triggered on preview returns 200/expected response
  - Sentry dashboard shows the flow execution (manual eyeball)
  - No NEW Sentry errors in 24h post-merge
    **QA Scenarios**:

  ```
  Scenario: PR-B merged + Genkit flow traced in Sentry
    Tool: Bash + sentry-cli + manual
    Steps:
      1. gh pr view <B> --json state → MERGED
      2. git log origin/main --oneline -1 → PR-B commit
      3. Vercel preview URL → trigger workout generator via UI or API
      4. Check Sentry dashboard for the flow span (manual)
      5. No new errors in last 24h
    Expected: trace visible, no errors
    Evidence: .sisyphus/evidence/t15-pr-b-merged.log
  ```

  **Commit**: NO

- [ ] T16. **Merge PR-C**
      **What**: Squash-merge PR-C (zod forward-compat) to main. Verify smoke test still passes.
      **Must NOT**: skip smoke test.
      **Recommended Agent Profile**: `quick`
      **Parallelization**: Can Run In Parallel: NO; Blocked By: T12-T13 + CI green; Blocks: T17
      **References**: PR-C diff
      **Acceptance Criteria**:
  - PR-C MERGED
  - `npm test -- zod-migration.smoke` 15/15 on main
  - `grep -nE "z\.string\(\)\.(email|uuid|url|ip)\(" src/` returns 0
  - main HEAD includes PR-C commit
    **QA Scenarios**:

  ```
  Scenario: PR-C merged + smoke test green
    Tool: Bash (gh + npm)
    Steps:
      1. gh pr view <C> --json state → MERGED
      2. git log origin/main --oneline -1 → PR-C commit
      3. npm test -- zod-migration.smoke 2>&1 | tail -5 → 15/15
      4. grep -nE "z\.string\(\)\.(email|uuid|url|ip|cidr)\(" src/ → no match
    Expected: all green
    Evidence: .sisyphus/evidence/t16-pr-c-merged.log
  ```

  **Commit**: NO

- [ ] T17. **F1-F4 final reviews**
      **What**: Run 4 parallel reviews against main HEAD (with all 3 PRs merged). Wait for user explicit "okay" before marking plan complete.
      **Recommended Agent Profile**: F1=oracle · F2=unspecified-high · F3=unspecified-high+playwright · F4=deep
      **Parallelization**: All 4 in parallel after T16
      **Acceptance Criteria**: All 4 APPROVE + user says "okay"
      **QA Scenarios**: per Final Verification Wave section in plan header
      **Commit**: NO (reviews only)

---

## Final Verification Wave (MANDATORY)

> 4 review agents run in PARALLEL. ALL must APPROVE.

- [ ] F1. Plan Compliance Audit — `oracle`
- [ ] F2. Code Quality Review — `unspecified-high`
- [ ] F3. Real Manual QA — `unspecified-high + playwright`
- [ ] F4. Scope Fidelity Check — `deep`

---

## Commit Strategy

Per AGENTS.md §Commit Conventions:

| PR  | Title                                                                       | Atomic commits              |
| --- | --------------------------------------------------------------------------- | --------------------------- |
| A   | `fix(supabase): forward cache-bust headers in middleware setAll`            | 1 commit                    |
| B   | `feat(observability): Genkit 1.36 modernize + Sentry 10.56 instrumentation` | 7 internal commits (5-11)   |
| C   | `refactor(schemas): zod forward-compat`                                     | 2 internal commits (12, 13) |

All squash-merged to main.

---

## Success Criteria

````bash
# After all PRs merged
npm run typecheck     # exit 0
npm run lint          # exit 0
npm run format:check   # exit 0
npm test               # 101/101 baseline pass + smoke unchanged
npm run build          # exit 0
git grep -E "\.string\(\)\.email|\.string\(\)\.uuid|\.string\(\)\.url|\.string\(\)\.ip" src/  # 0 matches (after PR-C)
gh pr list --state open  # 0
```bash

### Final Checklist

- [ ] Audit findings doc saved
- [ ] 3 PRs merged (A, B, C)
- [ ] Quality gates green at every PR
- [ ] Smoke test green at every PR
- [ ] Vercel preview green for PR-B
- [ ] F1-F4 reviews APPROVE
- [ ] No scope creep beyond audit findings
````
