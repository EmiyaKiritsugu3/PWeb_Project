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
    await page.getByLabel(/senha|password/i).fill('WrongPass99!');
    await page.getByRole('button', { name: /entrar|login/i }).click();
    // Must stay on /login and show an error message
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
    await expect(page.getByText(/inválid|incorret|erro|invalid/i)).toBeVisible({ timeout: 8_000 });
  });
});
