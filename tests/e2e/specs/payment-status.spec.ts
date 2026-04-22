import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Payment status write-path', () => {
  test('GERENTE registers payment: INADIMPLENTE aluno → ATIVA', async ({ page }) => {
    await loginAs(page, 'GERENTE');
    await page.goto('/dashboard/financeiro');

    // Verify INADIMPLENTE aluno is present in the table
    await expect(page.getByText('Aluno Inadimplente E2E')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('INADIMPLENTE')).toBeVisible();

    // Click "Registrar Pagamento" scoped to the aluno's row
    const row = page.getByRole('row', { name: /Aluno Inadimplente E2E/ });
    await row.getByRole('button', { name: 'Registrar Pagamento' }).click();

    // AlertDialog should open
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Confirmar Pagamento?' })).toBeVisible();

    // Confirm payment
    await dialog.getByRole('button', { name: 'Confirmar e Reativar' }).click();

    // Assert success toast
    await expect(page.getByText('Pagamento Registrado!')).toBeVisible({ timeout: 10_000 });

    // Reload and verify persistence — aluno should no longer appear in inadimplente list
    await page.reload();
    await expect(page.getByText('Aluno Inadimplente E2E')).not.toBeVisible({ timeout: 15_000 });
  });
});
