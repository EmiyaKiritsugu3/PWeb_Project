import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth';

test.describe('INSTRUTOR workflow — assign workout to student', () => {
  test('INSTRUTOR assigns manual workout → ALUNO sees it with "Do Personal" badge', async ({
    page,
  }) => {
    const objetivo = `Hipertrofia E2E It4 ${Date.now()}`;

    // ── INSTRUTOR session ────────────────────────────────────────────────────
    await loginAs(page, 'INSTRUTOR');
    await page.goto('/dashboard/treinos');
    await expect(page).toHaveURL(/\/dashboard\/treinos/);

    // Step 1: Select ALUNO from the Shadcn Select
    const alunoSelectTrigger = page.getByRole('combobox').filter({ hasText: /escolha um aluno/i });
    await expect(alunoSelectTrigger).toBeVisible({ timeout: 10_000 });
    await alunoSelectTrigger.click();
    await expect(page.getByRole('option', { name: 'Aluno E2E', exact: true })).toBeVisible({
      timeout: 5_000,
    });
    await page.getByRole('option', { name: 'Aluno E2E', exact: true }).click();

    // Step 2: Fill objetivo
    const objetivoInput = page.getByLabel(/objetivo do treino/i);
    await expect(objetivoInput).toBeVisible({ timeout: 5_000 });
    await objetivoInput.fill(objetivo);

    // Step 3: Add an exercise via Combobox
    await page.getByRole('button', { name: /adicionar exercício/i }).click();
    // The exercise Combobox trigger has no ARIA name — scope to its container row
    const exerciseRow = page.locator('div.rounded-md.border.p-4').first();
    const exerciseComboTrigger = exerciseRow.getByRole('combobox');
    await expect(exerciseComboTrigger).toBeVisible({ timeout: 5_000 });
    await exerciseComboTrigger.click();

    // Type in the CommandInput search field and select first result via keyboard
    // (cmdk fires onSelect via onPointerDown; keyboard Enter is more reliable in portals)
    const searchInput = page.getByPlaceholder('Buscar...');
    await expect(searchInput).toBeVisible({ timeout: 5_000 });
    await searchInput.fill('Supino');
    await expect(page.getByRole('option').first()).toBeVisible({ timeout: 5_000 });
    await searchInput.press('ArrowDown');
    await searchInput.press('Enter');

    // Step 4: Save the workout
    const saveButton = page.getByRole('button', { name: /salvar treino/i });
    await expect(saveButton).toBeEnabled({ timeout: 5_000 });
    // Sidebar DIV intercepts pointer events at the button's coordinates — use
    // JS .click() to dispatch directly on the DOM element, bypassing overlap.
    await saveButton.evaluate((el: HTMLElement) => el.click());

    // Wait for save to complete (button becomes disabled or form resets)
    await expect(objetivoInput).toHaveValue('', { timeout: 10_000 });

    // ── ALUNO session ────────────────────────────────────────────────────────
    await logout(page);
    await loginAs(page, 'ALUNO');
    await page.goto('/aluno/meus-treinos');
    await expect(page).toHaveURL(/\/aluno\/meus-treinos/);

    // Assert the assigned workout appears with "Do Personal" badge
    // Use .p-4 to scope to the workout row, not the outer section card
    const treinoRow = page.locator('div.rounded-lg.border.p-4').filter({ hasText: objetivo });
    await expect(treinoRow).toBeVisible({ timeout: 15_000 });
    await expect(treinoRow.getByText('Do Personal')).toBeVisible();
  });
});
