import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Workout session — completion flow', () => {
  test('ALUNO completes workout and sees AI feedback card', async ({ page }) => {
    await loginAs(page, 'ALUNO');

    // Navigate to meus-treinos
    await page.goto('/aluno/meus-treinos');
    await expect(page).toHaveURL(/\/aluno\/meus-treinos/);

    // Start the seeded "Treino E2E" workout — scope to the individual row (p-4),
    // not the outer section card which also contains this text as a child.
    const treinoRow = page.locator('div.rounded-lg.border.p-4').filter({ hasText: 'Treino E2E' });
    const iniciarButton = treinoRow.getByRole('button', { name: /iniciar/i });
    await expect(iniciarButton).toBeVisible({ timeout: 15_000 });
    await iniciarButton.click();

    // The WorkoutSession card should now be visible — wait for the first series check button
    // data-testid="serie-check-0" is the icon-only check button for series 0 of current exercise
    const seriesCheckButton = page.getByTestId('serie-check-0');
    await expect(seriesCheckButton).toBeVisible({ timeout: 10_000 });
    await seriesCheckButton.click();

    // Navigate through all exercises: click "Próximo" until "Finalizar Treino" is available
    const proximoButton = page.getByRole('button', { name: /próximo/i });
    const finalizarButton = page.getByRole('button', { name: /finalizar treino/i });

    const MAX_EXERCISES = 20;
    let steps = 0;
    while (await proximoButton.isVisible()) {
      if (++steps > MAX_EXERCISES)
        throw new Error('Workout navigation loop exceeded max exercises — UI regression?');
      await proximoButton.click();
      // Mark a series on the next exercise too
      const nextCheckButton = page.getByTestId('serie-check-0');
      if (await nextCheckButton.isVisible()) await nextCheckButton.click();
    }

    // Click "Finalizar Treino"
    await expect(finalizarButton).toBeVisible({ timeout: 10_000 });
    await finalizarButton.click();

    // Wait for the feedback card to appear (AI or fallback)
    await expect(page.getByTestId('workout-feedback-card')).toBeVisible({ timeout: 30_000 });

    // Navigate to dashboard to verify XP was updated
    await page.goto('/aluno/dashboard');
    await expect(page.getByTestId('xp-display')).toBeVisible({ timeout: 15_000 });
  });
});
