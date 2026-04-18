import { expect, type Page } from '@playwright/test';

const CREDENTIALS = {
  GERENTE: { email: 'gerente@test.com', password: 'Test1234!', redirect: '/dashboard' },
  RECEPCIONISTA: { email: 'recep@test.com', password: 'Test1234!', redirect: '/dashboard' },
  INSTRUTOR: { email: 'instrutor@test.com', password: 'Test1234!', redirect: '/dashboard' },
  ALUNO: { email: 'aluno@test.com', password: 'Test1234!', redirect: '/aluno/dashboard' },
} as const;

export type TestRole = keyof typeof CREDENTIALS;

export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const { email, password, redirect: expectedPath } = CREDENTIALS[role];
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  // Wait for any navigation away from /login — the server action has completed
  // and set the session cookie in Set-Cookie once the URL changes.
  // Note: for ALUNO, the inline RSC render of /aluno/dashboard sees getUser()=null
  // (cookie is in Set-Cookie, not yet in Cookie header) and immediately redirects
  // to /aluno/login. So the URL never passes through **/dashboard** for ALUNO.
  // We wait for any departure from /login instead, then do a hard navigation that
  // sends the fresh session cookie in the Cookie request header.
  await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15_000 });
  // Hard GET to the expected path — browser now sends the session cookie correctly.
  await page.goto(expectedPath);
  // Confirm the dashboard actually painted
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 15_000 });
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
