# Quickstart: Verifying the Code Quality Fix

## What This Guide Covers

How to verify that the setState-in-effect bugs and `any` type cleanup were applied
correctly, without running the full application.

## Prerequisites

- Node.js 18+
- Project dependencies installed (`npm install`)
- `.env` file configured (only needed for full E2E smoke test)

---

## Step 1: Type Check — Zero Errors

```bash
npm run typecheck
```

**Expected**: Process exits with code 0. No output (or only informational lines).
**Fail condition**: Any `error TS...` line in the output.

---

## Step 2: Lint — Zero `no-explicit-any` Errors in Scope

```bash
npm run lint 2>&1 | grep "no-explicit-any"
```

**Expected**: No output (zero matches).
**Fail condition**: Any line containing `no-explicit-any` from files in
`src/lib/actions/`, `src/ai/`, or `src/lib/data.ts`.

> Note: The Genkit streaming suppression comment in `treinos-client.tsx` should
> result in zero lint _errors_. If the comment format is wrong, it will still show.

---

## Step 3: Tests Pass

```bash
npm test
```

**Expected**: All test suites pass. Coverage numbers unchanged or improved.
**Fail condition**: Any `FAIL` or test error output.

---

## Step 4: Smoke Test — No Console Errors (Manual)

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` and perform this walkthrough:

1. Log in as an **admin** (`/dashboard`):
   - Navigate to Students → open any student detail page
   - Navigate to Workouts → select a student → generate an AI plan
   - Verify the plan populates in the editor without blank fields

2. Log in as a **student** (`/aluno`):
   - Open the student dashboard — verify XP and streak show correct values
   - Open Meus Treinos — verify the list loads correctly
   - If a workout exists, start a workout session — enter weights and mark sets
   - Navigate away and back — verify workout session state does NOT reset

**Open browser DevTools console during the entire walkthrough.**
**Expected**: Zero `Maximum update depth exceeded` or `Cannot update a component`
errors in the console.

---

## Step 5: Verify Specific File Changes

```bash
# Confirm no unguarded `any` in actions
grep -rn ": any\|as any" src/lib/actions/ src/lib/data.ts

# Should only show:
# - catch(error) lines (which should now use `error instanceof Error`)
# - The Genkit suppression comment in treinos-client.tsx

# Confirm useEffect-setState anti-pattern removed
grep -n "setAluno(initial\|setMeusTreinos(initial" src/app/aluno/
# Expected: no matches
```
