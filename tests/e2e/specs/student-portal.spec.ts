import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Student portal — critical path', () => {
  test('ALUNO accesses /aluno/dashboard', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await expect(page).toHaveURL(/\/aluno\/dashboard/);
    // Dashboard should render the student portal heading
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 15_000 });
  });

  test('ALUNO is blocked from admin /dashboard', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await page.goto('/dashboard');
    // Should be redirected — not allowed to stay on /dashboard
    await expect(page).not.toHaveURL(/^.*\/dashboard$/);
  });

  test('ALUNO accesses /aluno/meus-treinos', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await page.goto('/aluno/meus-treinos');
    await expect(page).toHaveURL(/\/aluno\/meus-treinos/);
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 15_000 });
  });
});
