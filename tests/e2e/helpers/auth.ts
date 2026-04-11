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
  // Always clear cookies and storage to guarantee a clean unauthenticated state.
  // Supabase SSR stores session tokens in sb-* cookies; a navigation alone is not sufficient.
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
