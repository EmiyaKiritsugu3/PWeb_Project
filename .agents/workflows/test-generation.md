---
description: Standard process for E2E and Unit test generation
---

// turbo-all
# Workflow: Test Generation

When requested to generate tests (e.g., E2E with Playwright or Unit tests with Jest/Vitest), follow these standard procedures to ensure consistency and prevent regressions.

## 1. Context Gathering
- Read the relevant component/page files to understand the DOM structure.
- Check the `BaseSchema` or `EntitySchema` for correct prop/mock structures.

## 2. Test Structure
- Prefix the test file correctly (e.g., `ComponentName.test.tsx` or `feature.spec.ts`).
- Ensure all tests test the actual UI rendering and behavior, not just implementation details.

## 3. Mocking Strategy
- Mock external RPC calls and database interactions.
- Ensure Zod validation schemas are respected in mock data payloads.

## 4. Execution
- If `SafeToAutoRun` is available, run the test locally via terminal to prove it passes before yielding control back to the user.
- If it fails, auto-remediate the test script based on the terminal output.
