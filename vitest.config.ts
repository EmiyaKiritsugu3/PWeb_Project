import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/**/*.d.ts',
        'src/**/*.config.*',
        'src/app/**/loading.*',
        'src/app/**/error.*',
        'src/app/**/not-found.*',
        'src/app/**/layout.*',
        // Server Actions: tightly coupled to Prisma/Supabase — covered by Playwright E2E (Phase 7)
        'src/lib/actions/**',
      ],
      thresholds: {
        // Pure utility functions — no external deps, must stay fully covered
        'src/lib/utils.ts': { statements: 100, functions: 100, lines: 100 },
        // Auth guard — security-critical, must stay fully covered
        'src/lib/auth.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
        // Business logic services — must stay fully covered
        'src/services/gamificationService.ts': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
