import { test, expect } from '@playwright/test';
import { loginAs, logout } from '../helpers/auth';

test.describe('INSTRUTOR auth — negative scenarios', () => {
  test('RECEPCIONISTA cannot access /dashboard/treinos — redirected to /dashboard', async ({
    page,
  }) => {
    await loginAs(page, 'RECEPCIONISTA');
    await page.goto('/dashboard/treinos');
    await page.waitForURL((url) => !url.pathname.startsWith('/dashboard/treinos'), {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/dashboard(?!\/treinos)/);
  });

  test('ALUNO cannot access /dashboard/treinos — redirected away', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await page.goto('/dashboard/treinos');
    await page.waitForURL((url) => !url.pathname.startsWith('/dashboard/treinos'), {
      timeout: 15_000,
    });
    expect(page.url()).not.toContain('/dashboard/treinos');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });
});
