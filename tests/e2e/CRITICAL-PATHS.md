# E2E Critical Paths

**Suite**: Playwright — `tests/e2e/specs/`
**Browser**: Chromium (headless)
**Total scenarios**: 17

## Coverage Table

| #   | File                       | Scenario                                            | Status     |
| --- | -------------------------- | --------------------------------------------------- | ---------- |
| 1   | `auth.spec.ts`             | GERENTE login → redirects to /dashboard             | ✅ Covered |
| 2   | `auth.spec.ts`             | RECEPCIONISTA login → redirects to /dashboard       | ✅ Covered |
| 3   | `auth.spec.ts`             | ALUNO login → redirects to /aluno/dashboard         | ✅ Covered |
| 4   | `auth.spec.ts`             | Invalid credentials → stays on /login with error    | ✅ Covered |
| 5   | `financial-access.spec.ts` | GERENTE accesses /dashboard/financeiro              | ✅ Covered |
| 6   | `financial-access.spec.ts` | GERENTE accesses /dashboard/planos                  | ✅ Covered |
| 7   | `financial-access.spec.ts` | RECEPCIONISTA blocked from /dashboard/financeiro    | ✅ Covered |
| 8   | `financial-access.spec.ts` | INSTRUTOR blocked from /dashboard/financeiro        | ✅ Covered |
| 9   | `financial-access.spec.ts` | Unauthenticated → redirected to /login              | ✅ Covered |
| 10  | `nav-visibility.spec.ts`   | GERENTE sees Financeiro nav; RECEPCIONISTA does not | ✅ Covered |
| 11  | `nav-visibility.spec.ts`   | GERENTE sees Planos nav; RECEPCIONISTA does not     | ✅ Covered |
| 12  | `nav-visibility.spec.ts`   | Admin nav absent from student portal                | ✅ Covered |
| 13  | `student-portal.spec.ts`   | ALUNO accesses /aluno/dashboard                     | ✅ Covered |
| 14  | `student-portal.spec.ts`   | ALUNO blocked from admin /dashboard                 | ✅ Covered |
| 15  | `student-portal.spec.ts`   | ALUNO accesses /aluno/meus-treinos                  | ✅ Covered |
| 16  | `workout-session.spec.ts`  | ALUNO completes workout → AI feedback card shown    | ✅ Covered |
| 17  | `enrollment.spec.ts`       | GERENTE creates aluno → appears in list             | ✅ Covered |

## Pending / Future Scenarios

| Scenario                                     | Priority | Notes                                   |
| -------------------------------------------- | -------- | --------------------------------------- |
| INSTRUTOR assigns workout to student         | P2       | Instrutor role E2E not yet covered      |
| Payment status update (inadimplente → ativo) | P2       | Financial write path                    |
| Session expiry → redirect to login           | P2       | Requires time manipulation or short JWT |

## Running Locally

```bash
# Prerequisites: Docker running
npm run supabase:start   # start local Supabase (ports 54321/54322)
npm run seed:e2e         # create 4 deterministic test users
npm run e2e              # run all 17 scenarios
npm run supabase:stop    # cleanup
```

## Running in CI

The `e2e` GitHub Actions job starts Supabase automatically via `supabase start`.
Required secret: `SUPABASE_LOCAL_ANON_KEY` (see RUNBOOK.md for the value).
