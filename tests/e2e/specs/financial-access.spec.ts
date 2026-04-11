import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Financial access — role gate', () => {
  test('GERENTE accesses /dashboard/financeiro', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await page.goto('/dashboard/financeiro');
    await expect(page).toHaveURL(/\/dashboard\/financeiro/);
    // Should not be redirected away
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('GERENTE accesses /dashboard/planos', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await page.goto('/dashboard/planos');
    await expect(page).toHaveURL(/\/dashboard\/planos/);
    await expect(page.getByRole('heading').first()).toBeVisible();
  });

  test('RECEPCIONISTA is blocked from /dashboard/financeiro', async ({ page }) => {
    await loginAs(page, 'RECEPCIONISTA');
    await page.goto('/dashboard/financeiro');
    // Should be redirected to /dashboard (not /financeiro)
    await expect(page).not.toHaveURL(/\/dashboard\/financeiro/);
  });

  test('INSTRUTOR is blocked from /dashboard/financeiro', async ({ page }) => {
    await loginAs(page, 'INSTRUTOR');
    await page.goto('/dashboard/financeiro');
    await expect(page).not.toHaveURL(/\/dashboard\/financeiro/);
  });

  test('Unauthenticated user is redirected to /login from /dashboard/financeiro', async ({
    page,
  }) => {
    await page.goto('/dashboard/financeiro');
    await expect(page).toHaveURL(/\/login/);
  });
});
