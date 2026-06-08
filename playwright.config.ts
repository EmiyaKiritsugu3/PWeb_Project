import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// override: true ensures .env.test values win over any pre-loaded .env.local
dotenv.config({ path: '.env.test', override: true });

export default defineConfig({
  testDir: './tests/e2e/specs',
  fullyParallel: false,
  globalSetup: './tests/e2e/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3333',
    trace: 'on-first-retry',
    actionTimeout: 10_000,
    // 60s test + navigation timeout: Next.js dev mode compiles routes on first request.
    // /aluno/dashboard has heavy imports (framer-motion, recharts) that take >15s to
    // compile in CI on first access. 60s gives enough headroom for first-request compilation.
    navigationTimeout: 60_000,
  },
  timeout: 60_000,
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Port 3333 is dedicated to E2E — avoids reusing the dev server on 3001
    // which may carry .env.local (production) credentials.
    command: 'npm run dev -- --port 3333',
    url: 'http://localhost:3333',
    reuseExistingServer: false,
    timeout: 120_000,
    // Explicitly forward test env vars so Next.js cannot fall back to .env.local
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ?? '',
      DATABASE_URL: process.env.DATABASE_URL ?? '',
      DIRECT_URL: process.env.DIRECT_URL ?? '',
    },
  },
});
