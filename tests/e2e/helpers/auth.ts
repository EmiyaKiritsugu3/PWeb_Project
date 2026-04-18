import { expect, type Page } from '@playwright/test';

const CREDENTIALS = {
  GERENTE: {
    email: 'gerente@test.com',
    password: 'Test1234!',
    loginPath: '/login',
    redirect: '/dashboard',
  },
  RECEPCIONISTA: {
    email: 'recep@test.com',
    password: 'Test1234!',
    loginPath: '/login',
    redirect: '/dashboard',
  },
  INSTRUTOR: {
    email: 'instrutor@test.com',
    password: 'Test1234!',
    loginPath: '/login',
    redirect: '/dashboard',
  },
  // ALUNO uses the dedicated /aluno/login page (client-side Supabase auth + router.push).
  // Using the admin /login server action for ALUNO causes an inline RSC render timing gap
  // where getUser()=null (cookie in Set-Cookie but not yet in Cookie), resulting in a
  // /aluno/dashboard → /aluno/login redirect chain before the browser sends the cookie.
  ALUNO: {
    email: 'aluno@test.com',
    password: 'Test1234!',
    loginPath: '/aluno/login',
    redirect: '/aluno/dashboard',
  },
} as const;

export type TestRole = keyof typeof CREDENTIALS;

export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const { email, password, loginPath, redirect: expectedPath } = CREDENTIALS[role];
  await page.goto(loginPath);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  // For staff roles: server action redirect — wait for any departure from the login page,
  // then do a hard GET so the browser sends the fresh session cookie.
  // For ALUNO: client-side auth + router.push — wait for URL to reach the dashboard directly.
  await page.waitForURL((url) => !url.pathname.startsWith(loginPath), { timeout: 15_000 });
  // Hard GET to confirm the session cookie is in the Cookie header for all subsequent requests.
  await page.goto(expectedPath);
  // Confirm the dashboard actually painted
  // 30s timeout: first-request compilation of /aluno/dashboard in CI dev mode can take ~20s.
  await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 30_000 });
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
