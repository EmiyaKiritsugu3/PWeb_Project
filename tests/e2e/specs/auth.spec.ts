import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Authentication — critical path', () => {
  test('GERENTE login redirects to /dashboard', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('RECEPCIONISTA login redirects to /dashboard', async ({ page }) => {
    await loginAs(page, 'RECEPCIONISTA');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('ALUNO login redirects to /aluno/dashboard', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await expect(page).toHaveURL(/\/aluno\/dashboard/);
  });

  test('Invalid credentials stay on /login with error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('naoexiste@test.com');
    // See helpers/auth.ts for why label locator on password is fragile on
    // the aluno page; here on /login it works, but input[type] is uniform.
    await page.locator('input[type="password"]').fill('WrongPass99!');
    // Anchored regex — unanchored /entrar/i matches the 3 login buttons.
    await page.getByRole('button', { name: /^entrar( no sistema)?$/i }).click();
    // Must stay on /login and show an error message
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
    await expect(page.getByText(/inválid|incorret|erro|invalid/i)).toBeVisible({ timeout: 8_000 });
  });
});
