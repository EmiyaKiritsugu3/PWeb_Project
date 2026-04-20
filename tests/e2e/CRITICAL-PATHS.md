# E2E Critical Paths

**Suite**: Playwright — `tests/e2e/specs/`
**Browser**: Chromium (headless)
**Total scenarios**: 18

## Coverage Table

| #   | File                         | Scenario                                                   | Status     |
| --- | ---------------------------- | ---------------------------------------------------------- | ---------- |
| 1   | `auth.spec.ts`               | GERENTE login → redirects to /dashboard                    | ✅ Covered |
| 2   | `auth.spec.ts`               | RECEPCIONISTA login → redirects to /dashboard              | ✅ Covered |
| 3   | `auth.spec.ts`               | ALUNO login → redirects to /aluno/dashboard                | ✅ Covered |
| 4   | `auth.spec.ts`               | Invalid credentials → stays on /login with error           | ✅ Covered |
| 5   | `financial-access.spec.ts`   | GERENTE accesses /dashboard/financeiro                     | ✅ Covered |
| 6   | `financial-access.spec.ts`   | GERENTE accesses /dashboard/planos                         | ✅ Covered |
| 7   | `financial-access.spec.ts`   | RECEPCIONISTA blocked from /dashboard/financeiro           | ✅ Covered |
| 8   | `financial-access.spec.ts`   | INSTRUTOR blocked from /dashboard/financeiro               | ✅ Covered |
| 9   | `financial-access.spec.ts`   | Unauthenticated → redirected to /login                     | ✅ Covered |
| 10  | `nav-visibility.spec.ts`     | GERENTE sees Financeiro nav; RECEPCIONISTA does not        | ✅ Covered |
| 11  | `nav-visibility.spec.ts`     | GERENTE sees Planos nav; RECEPCIONISTA does not            | ✅ Covered |
| 12  | `nav-visibility.spec.ts`     | Admin nav absent from student portal                       | ✅ Covered |
| 13  | `student-portal.spec.ts`     | ALUNO accesses /aluno/dashboard                            | ✅ Covered |
| 14  | `student-portal.spec.ts`     | ALUNO blocked from admin /dashboard                        | ✅ Covered |
| 15  | `student-portal.spec.ts`     | ALUNO accesses /aluno/meus-treinos                         | ✅ Covered |
| 16  | `workout-session.spec.ts`    | ALUNO completes workout → AI feedback card shown           | ✅ Covered |
| 17  | `enrollment.spec.ts`         | GERENTE creates aluno → appears in list                    | ✅ Covered |
| 18  | `instrutor-workflow.spec.ts` | INSTRUTOR assigns workout → ALUNO sees "Do Personal" badge | ✅ Covered |

## Pending / Future Scenarios

| Scenario                                     | Priority | Notes                                   |
| -------------------------------------------- | -------- | --------------------------------------- |
| Payment status update (inadimplente → ativo) | P2       | Financial write path                    |
| Session expiry → redirect to login           | P2       | Requires time manipulation or short JWT |

## Running Locally

```bash
# Prerequisites: Docker running
npm run supabase:start   # start local Supabase (ports 54321/54322)
npm run seed:e2e         # create 4 deterministic test users
npm run e2e              # run all 18 scenarios
npm run supabase:stop    # cleanup
```

## Running in CI

The `e2e` GitHub Actions job starts Supabase automatically via `supabase start`.
Required secret: `SUPABASE_LOCAL_ANON_KEY` (see RUNBOOK.md for the value).

## Lessons Learned

### Selector Patterns (discovered across It2–It4)

| Situation                          | Problem                                                                                        | Fix                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Shadcn `<Select>` aluno trigger    | `getByRole('combobox', { name: /escolha um aluno/i })` fails if Select value changes           | `.filter({ hasText: /escolha um aluno/i })`                                              |
| Strict mode with enrollment alunos | `getByRole('option', { name: 'Aluno E2E' })` matches all `e2e+timestamp` alunos                | Add `{ exact: true }`                                                                    |
| Custom Combobox (cmdk) trigger     | `getByRole('combobox', { name: /selecione/i })` returns 0 — button has no ARIA accessible name | Scope to container: `locator('div.rounded-md.border.p-4').first().getByRole('combobox')` |
| cmdk option selection              | `.click()` on `getByRole('option')` doesn't reliably trigger `onPointerDown` in portals        | Use `searchInput.press('ArrowDown')` + `searchInput.press('Enter')`                      |
| Shadcn sidebar intercepting clicks | Save button behind sidebar div → pointer-events intercepted                                    | `saveButton.evaluate((el: HTMLElement) => el.click())` (JS click bypasses overlap)       |
| Section card vs row ambiguity      | `div.rounded-lg` matches both outer Card AND inner workout rows                                | Use `div.rounded-lg.border.p-4` to scope to row-level elements only                      |
| Unique test data                   | Repeated runs with same `objetivo` → strict-mode violations on ALUNO assertions                | Append `Date.now()` to objetivo string                                                   |

### Test Data Hygiene

- `seed:e2e` purges **auth users** but NOT Prisma `Aluno` records from enrollment tests.
- Accumulated `e2e+timestamp@test.com` alunos cause `getAlunos()` to return `[]` if any aluno fails `AlunoSchema.parse()` (silent failure — catch returns empty array).
- **Local cleanup**: `npx dotenv -e .env.test -- npx tsx cleanup-e2e.ts` (script deletes all `e2e+` alunos).
- CI is unaffected (ephemeral DB per run).
