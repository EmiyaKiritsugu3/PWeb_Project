# Quickstart: It4 — INSTRUTOR Workflow E2E

## E2E Test Scenario (US01)

### Preconditions

- Local Supabase running: `npm run supabase:start`
- E2E seed applied: `npm run seed:e2e`
- Dev server on port 3333: managed by Playwright `reuseExistingServer: false`

### Flow

1. **INSTRUTOR logs in** via `/login` → redirected to `/dashboard`
2. **Navigate to** `/dashboard/treinos`
3. **Select ALUNO** from the Shadcn Select ("Escolha um aluno...") → click trigger → click "Aluno E2E" option
4. **Fill objetivo** in the text input → type "Hipertrofia E2E It4"
5. **Add exercise**: click "Adicionar Exercício" → Shadcn Combobox search → click first option
6. **Save**: click "Salvar Treino" → expect success toast
7. **Switch to ALUNO session**: logout INSTRUTOR, login ALUNO
8. **Navigate to** `/aluno/meus-treinos`
9. **Assert**: card with "Hipertrofia E2E It4" is visible and has "Do Personal" badge

### Selector Strategy

| Element              | Playwright selector                                               |
| -------------------- | ----------------------------------------------------------------- |
| Aluno Select trigger | `page.getByRole('combobox', { name: /escolha um aluno/i })`       |
| Aluno option         | `page.getByRole('option', { name: /aluno e2e/i })`                |
| Objetivo input       | `page.getByPlaceholder(/objetivo/i)` or `getByLabel(/objetivo/i)` |
| Add exercise button  | `page.getByRole('button', { name: /adicionar exercício/i })`      |
| Exercise search      | `page.locator('[cmdk-input]')` or `getByPlaceholder(/buscar/i)`   |
| Save button          | `page.getByRole('button', { name: /salvar treino/i })`            |
| "Do Personal" badge  | ALUNO session: `page.getByText('Do Personal')`                    |

### Key Risk: Shadcn Select Interaction

Shadcn `<Select>` renders its popover into `document.body` (portal).
After clicking the trigger, wait for `page.getByRole('option')` to be visible before clicking.

### Cross-Session Pattern

This test requires TWO roles in sequence. Use `logout()` helper between sessions
(clears cookies + localStorage) then `loginAs()` for ALUNO.

## Running the Test

```bash
npm run supabase:start
npm run seed:e2e
npm run e2e -- --grep "INSTRUTOR"
```
