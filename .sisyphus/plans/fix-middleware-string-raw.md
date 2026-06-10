# Fix: Vercel Build Failure — middleware.ts String.raw

## TL;DR

> **Quick Summary**: Revert `String.raw` template literal in middleware.ts back to regular string. Next.js doesn't support TaggedTemplateExpression in config.matcher.
>
> **Deliverables**:
>
> - Fix `src/middleware.ts` line 17
> - Verify build passes
>
> **Estimated Effort**: Quick (5 min)
> **Parallel Execution**: NO — single fix

---

## Context

### Original Issue

SonarQube flagged `String.raw` usage as a code smell. The fix changed the regex to use `String.raw` template literal. However, Next.js webpack parser can't handle `TaggedTemplateExpression` in the middleware config matcher export.

### Error

```
⨯ Next.js can't recognize the exported `config` field in route "/src/middleware":
Unsupported node type "TaggedTemplateExpression" at "config.matcher[0]".
```

### Root Cause

Next.js static analysis of `export const config` requires the matcher to be a plain string literal or array of string literals. `String.raw` is a tagged template expression which Next.js can't parse.

---

## Work Objectives

### Core Objective

Revert middleware.ts to use plain string instead of String.raw, fixing the Vercel build failure.

### Definition of Done

- [ ] `npm run build` passes
- [ ] Vercel deployment succeeds
- [ ] No SonarQube regression (the String.raw recommendation was cosmetic)

### Must Have

- Build passing
- Middleware matcher working correctly

### Must NOT Have

- Do NOT use `String.raw` (breaks Next.js)
- Do NOT change any other files

---

## TODOs

- [ ] 1. Revert middleware.ts String.raw to plain string

  **What to do**:
  - Read `src/middleware.ts`
  - Change line 17 from `String.raw\`...\`` back to regular string
  - The original regex pattern should be preserved as-is

  **Before**:

  ```typescript
  matcher: [
    String.raw`/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
  ],
  ```

  **After**:

  ```typescript
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  ```

  **Must NOT do**:
  - Do NOT change the regex pattern itself
  - Do NOT modify other files

  **References**:
  - `src/middleware.ts:17` — the problematic line
  - Next.js docs: middleware config matcher must be string literals

  **Acceptance Criteria**:
  - [ ] `npm run build` passes (exit 0)
  - [ ] No `String.raw` in middleware.ts

  **QA Scenarios**:

  ```
  Scenario: Build passes
    Tool: Bash
    Steps:
      1. Run: npm run build
      2. Verify exit code 0
      3. Verify no "TaggedTemplateExpression" error
    Expected: Build completes successfully
    Evidence: .sisyphus/evidence/task-1-build-pass.txt
  ```

  **Commit**: YES
  - Message: `fix(middleware): revert String.raw to plain string for Next.js compatibility`
  - Files: `src/middleware.ts`

---

## Success Criteria

### Verification Commands

```bash
npm run build  # Expected: exit 0
npm test  # Expected: 101/101 pass
```

### Final Checklist

- [ ] Build passes
- [ ] No String.raw in middleware.ts
- [ ] Vercel deployment succeeds
