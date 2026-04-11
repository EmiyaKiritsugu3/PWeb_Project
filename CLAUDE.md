# PWeb_Project Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-11

## Active Technologies

- TypeScript 5 (strict mode, `useUnknownInCatchVariables`) + Node.js 20 + Next.js 15 App Router, Prisma 7, Supabase SSR, Zod 3, Genkit 1.31 (004-elite-workflow-setup)
- PostgreSQL via Prisma; local Supabase CLI for E2E (ports 54321/54322) (004-elite-workflow-setup)

- TypeScript 5 (strict mode) + Next.js 15, Playwright, @sentry/nextjs (v10), Vitest, instrumentation-client.ts (fix/telemetry-and-e2e-stability)
- PostgreSQL via Prisma (produção + branch de staging) (004-elite-workflow-setup)

- TypeScript 5 (strict mode) + Next.js 15 App Router, Supabase SSR (`@supabase/ssr`), Prisma 7, Zod 3 (003-002-us00-financial)
- PostgreSQL via Prisma; `funcionarios.role` field already populated (003-002-us00-financial)

- TypeScript 5 (strict mode, `useUnknownInCatchVariables` enabled) + React 18, Next.js 15 App Router, Prisma 7, Zod 3, Genkit 1.31 (001-fix-type-safety-bugs)

## Project Structure

```text
src/
tests/
```

## Commands

```bash
npm test          # unit tests (Vitest)
npm run lint      # ESLint quality gate
npm run typecheck # TypeScript strict check
npm run e2e       # Playwright E2E (requires staging env)
```

All 4 gates must pass before merging.

## Code Style

TypeScript 5 (strict mode, `useUnknownInCatchVariables` enabled): Follow standard conventions

## Recent Changes

- 004-elite-workflow-setup: Added TypeScript 5 (strict mode, `useUnknownInCatchVariables`) + Node.js 20 + Next.js 15 App Router, Prisma 7, Supabase SSR, Zod 3, Genkit 1.31
- fix/telemetry-and-e2e-stability: Modernized Sentry to v10 + Next.js 15, implemented Privacy-First Replay, linked Supabase User IDs to observability, and repaired ESLint flat config.

- 004-elite-workflow-setup: Added TypeScript 5 (strict mode) + Next.js 15, Playwright, @sentry/nextjs, Vitest

- 003-002-us00-financial: Added TypeScript 5 (strict mode) + Next.js 15 App Router, Supabase SSR (`@supabase/ssr`), Prisma 7, Zod 3

<!-- MANUAL ADDITIONS START -->

## AI Session Protocol

At the start of every session:

1. Read `docs/CURRENT-STATE.md` — understand what works and what is incomplete.
2. Read `docs/DEFINITION-OF-DONE.md` — know the acceptance criteria before touching code.
3. Run `git branch --show-current` — confirm you are on the correct feature branch.
4. Run `npm run lint && npm run test` — establish a clean baseline before any change.
5. Ask the user: "What is the goal for this session?" if not stated.

At the end of every session:

1. Update `docs/CURRENT-STATE.md` to reflect changes made.
2. Commit with a Conventional Commit message referencing the task ID (e.g. `feat(e2e): T038 install Playwright`).

## Planning Protocol

Triggered by: "crie um plano", "faça um plano", "planeje", "plan this", "implementar", "implemente", "execute o plano", "go ahead", "do it", `/speckit-plan`, `/ultraplan`.

### Phase 0 — Pre-flight (before anything else)

1. Invoke `/speckit-plan` — never plan without it.
2. Verify feature branch: `git branch --show-current` must match `^[0-9]{3,}-`.
3. Read `.specify/feature.json` and confirm `specDirectory` exists on disk.
4. Read `.specify/memory/constitution.md` fully.
5. Read ALL files that will be touched — never propose changes to unread code.
6. List every assumption explicitly. If any is unverified, verify it now.

### Phase 1 — Clarification gate

- Collect ALL unknowns and ask them in a single message before proceeding.
- Do not start designing until every unknown is resolved.
- Do not ask one question at a time — batch everything.

### Phase 2 — Research

- For each unknown: document Decision + Rationale + Alternatives considered.
- No "NEEDS CLARIFICATION" may survive into Phase 3.
- Check if required tools/packages are actually installed before assuming they are.

### Phase 3 — Constitution check (gate)

- Explicitly list which constitution principles each planned change touches.
- If any change violates a principle without a ratified amendment → ERROR, stop.

### Phase 4 — Task design

Each task MUST have all four fields:

```
- [ ] T01 — <verb> in `path/to/file.ts` — <exact change> | verify: <command or observable>
```

Rules:

- One task = one file = one concern. Never combine two files in one task.
- Order tasks by dependency — T02 must not require output from T04.
- Flag risky tasks with `[RISKY]` and include a one-line rollback note.
- If a task has a sub-dependency not yet done, make it a preceding task.

### Phase 5 — Execution

- Complete T01 fully, verify it, mark ✅, then proceed to T02.
- Never batch multiple tasks in one action.
- If a task fails: diagnose root cause before retrying. Never retry blindly.
- If scope changes mid-execution: stop, update the checklist, confirm before continuing.

<!-- MANUAL ADDITIONS END -->
