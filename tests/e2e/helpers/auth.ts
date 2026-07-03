import { expect, type Page } from '@playwright/test';

const E2E_PASSWORD = process.env.E2E_DEFAULT_PASSWORD || 'Test1234!';

const CREDENTIALS = {
  GERENTE: {
    email: 'gerente@test.com',
    password: E2E_PASSWORD,
    loginPath: '/login',
    redirect: '/dashboard',
  },
  RECEPCIONISTA: {
    email: 'recep@test.com',
    password: E2E_PASSWORD,
    loginPath: '/login',
    redirect: '/dashboard',
  },
  INSTRUTOR: {
    email: 'instrutor@test.com',
    password: E2E_PASSWORD,
    loginPath: '/login',
    redirect: '/dashboard',
  },
  // ALUNO uses the dedicated /aluno/login page (client-side Supabase auth + router.push).
  // Using the admin /login server action for ALUNO causes an inline RSC render timing gap
  // where getUser()=null (cookie in Set-Cookie but not yet in Cookie), resulting in a
  // /aluno/dashboard → /aluno/login redirect chain before the browser sends the cookie.
  ALUNO: {
    email: 'aluno@test.com',
    password: E2E_PASSWORD,
    loginPath: '/aluno/login',
    redirect: '/aluno/dashboard',
  },
} as const;

export type TestRole = keyof typeof CREDENTIALS;

export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const { email, password, loginPath, redirect: expectedPath } = CREDENTIALS[role];
  // Clear any prior session to prevent auto-redirect from bypassing the login page.
  // Without this, leftover cookies cause /aluno/login → /aluno/dashboard redirect,
  // the email field never renders, and fill() times out.
  // NOTE: logout() must run AFTER page.goto() because it calls page.evaluate() to
  // clear localStorage/sessionStorage, which is inaccessible on about:blank.
  await page.goto(loginPath);
  await logout(page);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|login/i }).click();
  // For staff roles: server action redirect — wait for any departure from the login page,
  // then do a hard GET so the browser sends the fresh session cookie.
  // For ALUNO: client-side auth + router.push — wait for URL to reach the dashboard directly.
  // 30s timeout: Next.js 15 dev mode compiles server actions on first invocation, which
  // can take ~20s in CI (cold start). Combined with cookie flush latency, 15s is too tight.
  await page.waitForURL((url) => !url.pathname.startsWith(loginPath), { timeout: 30_000 });
  // Hard GET to confirm the session cookie is in the Cookie header for all subsequent requests.
  // If the server action redirect didn't carry session cookies, the GET will trigger middleware
  // which calls getUser() and redirects back to /login — this test catches that gap.
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
