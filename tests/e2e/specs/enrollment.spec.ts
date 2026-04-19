import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';

test.describe('Student enrollment — GERENTE creates new aluno', () => {
  test('GERENTE creates new aluno and it appears in the list', async ({ page }) => {
    await loginAs(page, 'GERENTE');

    await page.goto('/dashboard/alunos');
    await expect(page).toHaveURL(/\/dashboard\/alunos/);

    // Open enrollment form
    const cadastrarButton = page.getByRole('button', { name: /cadastrar aluno/i });
    await expect(cadastrarButton).toBeVisible({ timeout: 15_000 });
    await cadastrarButton.click();

    // Fill enrollment form with unique test data
    const timestamp = Date.now();
    const nomeCompleto = `Aluno E2E ${timestamp}`;
    const email = `e2e+${timestamp}@test.com`;

    // Wait for the dialog to be visible before filling
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible({ timeout: 5_000 });

    await dialog.getByLabel(/nome completo/i).fill(nomeCompleto);
    await dialog.getByLabel(/email/i).fill(email);

    // Use timestamp-based CPF to avoid unique constraint violations
    const cpfDigits = String(timestamp).slice(-9).padStart(9, '1');
    const cpf = `${cpfDigits.slice(0, 3)}.${cpfDigits.slice(3, 6)}.${cpfDigits.slice(6, 9)}-01`;
    await dialog.getByLabel(/cpf/i).fill(cpf);
    await dialog.getByLabel(/telefone/i).fill('11999990099');

    // dataNascimento is required (z.string().refine(!isNaN(Date.parse(val))))
    await dialog.getByLabel(/data de nascimento/i).fill('2000-01-01');

    // Submit within the dialog
    await dialog.getByRole('button', { name: /^cadastrar$/i }).click();

    // Wait for dialog to close (confirms submission succeeded and form handler ran)
    await expect(dialog).not.toBeVisible({ timeout: 10_000 });

    // Hard reload to get fresh server data after revalidatePath
    await page.goto('/dashboard/alunos');
    // Check the table row — avoids strict-mode ambiguity between the mobile <p> and desktop <div> email cells
    await expect(page.getByRole('row').filter({ hasText: email })).toBeVisible({ timeout: 15_000 });
  });
});
