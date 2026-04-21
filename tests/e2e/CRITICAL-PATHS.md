# E2E Critical Paths

**Suite**: Playwright — `tests/e2e/specs/`
**Browser**: Chromium (headless)
**Total scenarios**: 19

## Coverage Table

| #   | File                              | Scenario                                                   | Status     |
| --- | --------------------------------- | ---------------------------------------------------------- | ---------- |
| 1   | `auth.spec.ts`                    | GERENTE login → redirects to /dashboard                    | ✅ Covered |
| 2   | `auth.spec.ts`                    | RECEPCIONISTA login → redirects to /dashboard              | ✅ Covered |
| 3   | `auth.spec.ts`                    | ALUNO login → redirects to /aluno/dashboard                | ✅ Covered |
| 4   | `auth.spec.ts`                    | Invalid credentials → stays on /login with error           | ✅ Covered |
| 5   | `financial-access.spec.ts`        | GERENTE accesses /dashboard/financeiro                     | ✅ Covered |
| 6   | `financial-access.spec.ts`        | GERENTE accesses /dashboard/planos                         | ✅ Covered |
| 7   | `financial-access.spec.ts`        | RECEPCIONISTA blocked from /dashboard/financeiro           | ✅ Covered |
| 8   | `financial-access.spec.ts`        | INSTRUTOR blocked from /dashboard/financeiro               | ✅ Covered |
| 9   | `financial-access.spec.ts`        | Unauthenticated → redirected to /login                     | ✅ Covered |
| 10  | `nav-visibility.spec.ts`          | GERENTE sees Financeiro nav; RECEPCIONISTA does not        | ✅ Covered |
| 11  | `nav-visibility.spec.ts`          | GERENTE sees Planos nav; RECEPCIONISTA does not            | ✅ Covered |
| 12  | `nav-visibility.spec.ts`          | Admin nav absent from student portal                       | ✅ Covered |
| 13  | `student-portal.spec.ts`          | ALUNO accesses /aluno/dashboard                            | ✅ Covered |
| 14  | `student-portal.spec.ts`          | ALUNO blocked from admin /dashboard                        | ✅ Covered |
| 15  | `student-portal.spec.ts`          | ALUNO accesses /aluno/meus-treinos                         | ✅ Covered |
| 16  | `workout-session.spec.ts`         | ALUNO completes workout → AI feedback card shown           | ✅ Covered |
| 17  | `enrollment.spec.ts`              | GERENTE creates aluno → appears in list                    | ✅ Covered |
| 18  | `instrutor-workflow.spec.ts`      | INSTRUTOR assigns workout → ALUNO sees "Do Personal" badge | ✅ Covered |
| 19  | `instrutor-auth-negative.spec.ts` | RECEPCIONISTA/ALUNO blocked from /dashboard/treinos        | ✅ Covered |

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
npm run e2e              # run all 19 scenarios
npm run supabase:stop    # cleanup
```

## Running in CI

The `e2e` GitHub Actions job starts Supabase automatically via `supabase start`.
Required secret: `SUPABASE_LOCAL_ANON_KEY` (see RUNBOOK.md for the value).

## Lessons Learned

### Selector Patterns (discovered across It2–It4)

| Situation                          | Problem                                                                                        | Fix                                                                                      | Why                                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Shadcn `<Select>` aluno trigger    | `getByRole('combobox', { name: /escolha um aluno/i })` fails if Select value changes           | `.filter({ hasText: /escolha um aluno/i })`                                              | Shadcn `SelectTrigger` renders the chosen value as its text — accessible name changes after selection |
| Strict mode with enrollment alunos | `getByRole('option', { name: 'Aluno E2E' })` matches all `e2e+timestamp` alunos                | Add `{ exact: true }`                                                                    | Accumulated enrollment alunos share the prefix; strict mode throws on multiple matches                |
| Custom Combobox (cmdk) trigger     | `getByRole('combobox', { name: /selecione/i })` returns 0 — button has no ARIA accessible name | Scope to container: `locator('div.rounded-md.border.p-4').first().getByRole('combobox')` | cmdk trigger button has no `aria-label`; must scope by DOM position instead                           |
| cmdk option selection              | `.click()` on `getByRole('option')` doesn't reliably trigger `onPointerDown` in portals        | Use `searchInput.press('ArrowDown')` + `searchInput.press('Enter')`                      | cmdk listens to `onPointerDown`, not `onClick`; keyboard nav is more reliable in portals              |
| Shadcn sidebar intercepting clicks | Save button behind sidebar div → pointer-events intercepted                                    | `saveButton.evaluate((el: HTMLElement) => el.click())` (JS click bypasses overlap)       | CSS `pointer-events` on overlapping Shadcn sidebar div blocks Playwright synthetic click              |
| Section card vs row ambiguity      | `div.rounded-lg` matches both outer Card AND inner workout rows                                | Use `div.rounded-lg.border.p-4` to scope to row-level elements only                      | Shadcn `Card` and its child rows share `rounded-lg`; the border+padding combo is row-specific         |
| Unique test data                   | Repeated runs with same `objetivo` → strict-mode violations on ALUNO assertions                | Append `Date.now()` to objetivo string                                                   | Treinos persist across runs in local DB; identical text creates multiple matches in strict mode       |
| Tailwind multi-class elements      | `.grid .grid-cols-4 button` — treats two classes as parent/child                               | `div.grid-cols-4 button`                                                                 | Tailwind puts both classes on the **same** element; CSS space selector implies nesting                |
| Ambiguous heading selectors        | `getByRole('heading')` breaks when seed data adds new headings                                 | `getByRole('heading', { name: 'X' })` — always specify name                              | Playwright strict mode throws if the selector matches more than one element                           |
| Dialog scoping                     | `page.getByRole('button', ...).last()` is fragile if page gains new buttons                    | `page.getByRole('dialog').getByRole('button', ...)` — scope to dialog                    | Dialog renders after page-level buttons; `.last()` ordering breaks when DOM changes                   |
| `WorkoutSession` state reset       | `setTreinoEmSessao(null)` in `onFinish` unmounts component before feedback renders             | Call `setTreinoEmSessao(null)` only in `onCancel`, not `onFinish`                        | `onFinish` transitions state; unmounting early drops feedback card before it can appear               |
| CPF uniqueness in E2E              | Hard-coded CPF fails on second run (unique DB constraint)                                      | Use timestamp-derived CPF: `` `${timestamp}`.slice(-11).replace(...) `` or similar       | Enrollment tests persist `Aluno` records; re-running with the same CPF hits a unique constraint       |

### Test Data Hygiene

- `seed:e2e` purges **auth users** but NOT Prisma `Aluno` records from enrollment tests.
- Accumulated `e2e+timestamp@test.com` alunos cause `getAlunos()` to return `[]` if any aluno fails `AlunoSchema.parse()` (silent failure — catch returns empty array).
- **Local cleanup**: `npx dotenv -e .env.test -- npx tsx cleanup-e2e.ts` (script deletes all `e2e+` alunos).
- CI is unaffected (ephemeral DB per run).
