# PWeb_Project Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-09

## Active Technologies

- TypeScript 5 (strict mode) + Next.js 15, Playwright, @sentry/nextjs, Vitest (004-elite-workflow-setup)
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

- 004-elite-workflow-setup: Added TypeScript 5 (strict mode) + Next.js 15, Playwright, @sentry/nextjs, Vitest

- 003-002-us00-financial: Added TypeScript 5 (strict mode) + Next.js 15 App Router, Supabase SSR (`@supabase/ssr`), Prisma 7, Zod 3

- 001-fix-type-safety-bugs: Added TypeScript 5 (strict mode, `useUnknownInCatchVariables` enabled) + React 18, Next.js 15 App Router, Prisma 7, Zod 3, Genkit 1.31

<!-- MANUAL ADDITIONS START -->

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
