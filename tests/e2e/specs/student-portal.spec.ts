import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Student portal — critical path', () => {
  test('ALUNO accesses /aluno/dashboard', async ({ page }) => {
    await loginAs(page, 'ALUNO');
    await expect(page).toHaveURL(/\/aluno\/dashboard/);
    // [PID-SENTINEL] Stabilized selector using data-testid
    await expect(page.getByTestId('dashboard-welcome')).toBeVisible({ timeout: 15_000 });
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
    // Pin to h1 — nav/sidebar reuse i18n "myWorkouts":"Meus Treinos" as a
    // label, and shadcn CardTitle renders <h3>, so an unscoped heading query
    // resolves to 2+ elements (PageHeader <h1> + mirrored nav heading).
    // level:1 targets only the page's PageHeader heading.
    await expect(page.getByRole('heading', { name: 'Meus Treinos', level: 1 })).toBeVisible({
      timeout: 15_000,
    });
  });
});
