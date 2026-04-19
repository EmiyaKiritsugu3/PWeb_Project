# Research: It4 — INSTRUTOR Workflow E2E Coverage

## Decision: No new implementation needed

**Decision**: The assign-workout flow is fully implemented in production code.
**Rationale**: `instrutorId` is saved in `createTreinoAction`; `meus-treinos-client`
already segments "Treinos do Personal" by filtering `t.instrutorId !== userId`. The
"Do Personal" badge renders for these treinos. INSTRUTOR login path and seed data
already exist in the E2E helper and `prisma/seed-e2e.ts`.
**Alternatives considered**: Adding a new INSTRUTOR-specific portal (out of scope per spec).

---

## Decision: loginAs('INSTRUTOR') uses /login (staff path)

**Decision**: INSTRUTOR authenticates via `/login` (server-action SSR), same as GERENTE.
**Rationale**: The `auth.ts` helper already defines `INSTRUTOR` credentials with
`loginPath: '/login'` and `redirect: '/dashboard'`. Confirmed in
`tests/e2e/helpers/auth.ts:13-18`.
**Alternatives considered**: Separate INSTRUTOR-specific login page (not needed, not planned).

---

## Decision: Manual treino creation is the E2E path (not AI generation)

**Decision**: Use the "Criar Treino Manual" form in `/dashboard/treinos`, not AI generation.
**Rationale**: AI generation requires `GEMINI_API_KEY` which is absent in the E2E test
environment. Manual creation has no external dependency. The form: select aluno →
fill `objetivo` input → click "Adicionar Exercício" → fill exercise name → click
"Salvar Treino". Constitution Principle IV: AI as enhancement, not foundation.
**Alternatives considered**: AI-generated treino — fails silently in CI without API key.

---

## Decision: Aluno selector uses Shadcn `Select` (not combobox)

**Decision**: Aluno selection at `/dashboard/treinos` uses a Shadcn `<Select>` component
(`SelectTrigger` → `SelectContent` → `SelectItem`).
**Rationale**: Playwright interaction: `page.getByRole('combobox')` maps to the `<Select>`
trigger; `.selectOption()` does NOT work on Shadcn Select (it's not a native `<select>`).
Correct Playwright pattern: `click()` the trigger → `click()` the `SelectItem` by text.
**Alternatives considered**: `.selectOption()` — fails on Shadcn (custom overlay, not native).

---

## Decision: Exercise combobox uses Shadcn Combobox (custom component)

**Decision**: The exercise name field in the manual form uses a custom Combobox
(`exerciciosOptions` driven). Playwright pattern: click trigger → type into search input
→ click the matching option.
**Rationale**: Confirmed in `treinos-client.tsx:522-526`. The component renders a popover
with a search input, not a native select. Safer to use `page.getByPlaceholder` or
`page.locator('[cmdk-input]')` for the search field.
**Alternatives considered**: Native select — not used; would fail.

---

## Decision: Badge assertion uses getByText('Do Personal')

**Decision**: Assert the "Do Personal" badge in `meus-treinos` via `page.getByText('Do Personal')`.
**Rationale**: The badge renders as `<Badge variant="secondary">Do Personal</Badge>`
(confirmed `meus-treinos-client.tsx:256-258`). No `data-testid` exists — text match is stable
since it's hardcoded content, not dynamic.
**Alternatives considered**: `data-testid` on badge — requires source change; unnecessary.

---

## E2E Selector Risk: Shadcn Select / Combobox

**Risk**: Shadcn Select popover may not be in DOM until trigger is clicked.
**Mitigation**: Use `await expect(selectContent).toBeVisible()` before clicking items.
Shadcn Select renders portal into `body`, so use `page.getByRole('option', { name: ... })`
after clicking the trigger — no need to scope to the trigger's container.
