import type { Page } from '@playwright/test';

const CREDENTIALS = {
  GERENTE: { email: 'gerente@test.com', password: 'Test1234!', redirect: '/dashboard' },
  RECEPCIONISTA: { email: 'recep@test.com', password: 'Test1234!', redirect: '/dashboard' },
  INSTRUTOR: { email: 'instrutor@test.com', password: 'Test1234!', redirect: '/dashboard' },
  ALUNO: { email: 'aluno@test.com', password: 'Test1234!', redirect: '/aluno/dashboard' },
} as const;

export type TestRole = keyof typeof CREDENTIALS;

export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const { email, password, redirect } = CREDENTIALS[role];
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await page.waitForURL(`**${redirect}**`, { timeout: 15_000 });
}

export async function logout(page: Page): Promise<void> {
  // Navigate to root which redirects unauthenticated users to login
  await page.goto('/');
  // Try to click a logout button if present, otherwise just clear cookies
  const logoutBtn = page.getByRole('button', { name: /sair|logout/i });
  if (await logoutBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await logoutBtn.click();
  }
}
