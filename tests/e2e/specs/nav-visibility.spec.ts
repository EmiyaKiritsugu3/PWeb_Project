import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Navigation visibility — role-based', () => {
  test('GERENTE sees Financeiro nav link; RECEPCIONISTA does not', async ({ page }) => {
    // Gerente
    await loginAs(page, 'GERENTE');
    const financeiroLink = page.getByRole('link', { name: /financeiro/i });
    await expect(financeiroLink).toBeVisible();

    // Recepcionista — new page context resets session via cookies
    await page.context().clearCookies();
    await loginAs(page, 'RECEPCIONISTA');
    await expect(financeiroLink).not.toBeVisible();
  });

  test('GERENTE sees Planos nav link; RECEPCIONISTA does not', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    const planosLink = page.getByRole('link', { name: /planos/i });
    await expect(planosLink).toBeVisible();

    await page.context().clearCookies();
    await loginAs(page, 'RECEPCIONISTA');
    await expect(planosLink).not.toBeVisible();
  });

  test('Admin nav is not shown in student portal', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    // There should be no link pointing to /dashboard from the student portal
    const adminLinks = page.getByRole('link', { name: /dashboard/i });
    const count = await adminLinks.count();
    // Either 0 links or no link with href="/dashboard"
    for (let i = 0; i < count; i++) {
      const href = await adminLinks.nth(i).getAttribute('href');
      expect(href).not.toBe('/dashboard');
    }
  });
});
