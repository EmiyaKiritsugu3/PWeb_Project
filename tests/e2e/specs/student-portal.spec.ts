import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Student portal — critical path', () => {
  test('ALUNO accesses /aluno/dashboard', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await expect(page).toHaveURL(/\/aluno\/dashboard/);
    // Dashboard should render content
    await expect(page.locator('body')).not.toBeEmpty();
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
    await expect(page.locator('body')).not.toBeEmpty();
  });
});
