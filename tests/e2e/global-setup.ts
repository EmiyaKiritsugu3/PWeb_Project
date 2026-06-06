/**
 * Playwright globalSetup — invokes prisma/seed-e2e.ts once before specs.
 * .env.test must load (override: true) BEFORE spawn so the child inherits test env.
 */
import { spawn } from 'node:child_process';
import dotenv from 'dotenv';

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: '.env.test', override: true });

  const required = ['DATABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_URL'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`globalSetup: missing required env vars: ${missing.join(', ')}`);
  }

  console.log('▶ Running E2E seed (globalSetup)...');
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npx', ['tsx', 'prisma/seed-e2e.ts'], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`prisma/seed-e2e.ts exited with code ${code}`));
    });
    child.on('error', reject);
  });

  console.log('✅ E2E seed complete (globalSetup)');
}
