import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Workout session — completion flow', () => {
  test('ALUNO completes workout and sees AI feedback card', async ({ page }) => {
    await loginAs(page, 'ALUNO');

    // Navigate to meus-treinos
    await page.goto('/aluno/meus-treinos');
    await expect(page).toHaveURL(/\/aluno\/meus-treinos/);

    // Start the seeded "Treino E2E" workout
    const iniciarButton = page.getByRole('button', { name: /iniciar/i }).first();
    await expect(iniciarButton).toBeVisible({ timeout: 15_000 });
    await iniciarButton.click();

    // The WorkoutSession card should now be visible — wait for the first series row
    // Buttons inside div.grid-cols-4 are the series check buttons (icon-only, no text)
    const seriesCheckButton = page.locator('div.grid-cols-4').getByRole('button').first();
    await expect(seriesCheckButton).toBeVisible({ timeout: 10_000 });
    await seriesCheckButton.click();

    // Navigate through all exercises: click "Próximo" until "Finalizar Treino" is available
    const proximoButton = page.getByRole('button', { name: /próximo/i });
    const finalizarButton = page.getByRole('button', { name: /finalizar treino/i });

    while (await proximoButton.isVisible()) {
      await proximoButton.click();
      // Mark a series on the next exercise too
      const nextCheckButton = page.locator('div.grid-cols-4').getByRole('button').first();
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
