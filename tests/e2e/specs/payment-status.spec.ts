import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Payment status write-path', () => {
  test('GERENTE registers payment: INADIMPLENTE aluno → ATIVA', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await page.goto('/dashboard/financeiro');

    // Verify INADIMPLENTE aluno is present in the table
    const row = page.getByRole('row', { name: /Aluno Inadimplente E2E/ });
    await expect(row).toBeVisible({ timeout: 15_000 });
    await expect(row.getByText('Inadimplente', { exact: true })).toBeVisible();

    // Click "Registrar Pagamento" scoped to the aluno's row
    await row.getByRole('button', { name: 'Registrar Pagamento' }).click();

    // AlertDialog should open
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Confirmar Pagamento' })).toBeVisible();

    // Confirm payment
    await dialog.getByRole('button', { name: 'Confirmar' }).click();

    // Assert success toast — scope to role="status" to avoid strict-mode on parent/child both matching
    await expect(page.getByRole('status').filter({ hasText: 'Pagamento Registrado!' })).toBeVisible(
      { timeout: 10_000 }
    );

    // Reload and verify persistence — page re-fetches from DB; aluno must be gone from list
    await page.reload();
    await expect(page.getByText('Aluno Inadimplente E2E')).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Não há alunos inadimplentes no momento.')).toBeVisible();
  });
});
