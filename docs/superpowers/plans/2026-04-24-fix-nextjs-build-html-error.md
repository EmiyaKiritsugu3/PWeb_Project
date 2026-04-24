# Fix: Next.js 15 Html Build Error [PID-SENTINEL]

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the `<Html> should not be imported outside of pages/_document` build error by aligning Sentry configuration with Next.js 15 standards and enforcing App Router strictness.

**Architecture:**

1.  **Decommission Legacy Instrumentation:** Remove `instrumentation-client.ts` and align Sentry configs to the mandatory `sentry.{client|server|edge}.config.ts` pattern.
2.  **App Router Isolation:** Strictly limit `<html>` and `<body>` tags to root `layout.tsx` and `global-error.tsx`, ensuring no `next/document` imports exist.
3.  **Correct Plugin Integration:** Use `withSentryConfig` in `next.config.ts` to ensure build-time instrumentation is App Router aware.

**Tech Stack:** Next.js 15.5.15, Sentry SDK v10, TypeScript.

---

### Task 1: Sentry Configuration Alignment [PID-SENTINEL]

**Files:**

- Create/Modify: `sentry.client.config.ts`
- Modify: `sentry.server.config.ts`
- Modify: `sentry.edge.config.ts`
- Delete: `instrumentation-client.ts`

- [ ] **Step 1: Standardize Client Config**
      Ensure the client config is robust and explicitly defined.

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

- [ ] **Step 2: Standardize Server Config**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

- [ ] **Step 3: Standardize Edge Config**

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

- [ ] **Step 4: Cleanup legacy files**

```bash
rm instrumentation-client.ts 2>/dev/null
```

---

### Task 2: Instrumentation & Next.js Plugin [PID-SENTINEL]

**Files:**

- Modify: `instrumentation.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Configure instrumentation.ts**
      Use lazy async imports for configs.

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
```

- [ ] **Step 2: Update next.config.ts with withSentryConfig**

```typescript
import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
};

export default withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: 'five-star-academy',
    project: 'smartmanagementesystem',
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

---

### Task 3: Root Layout & Global Error Cleanup [PID-SENTINEL]

**Files:**

- Modify: `src/app/layout.tsx`
- Modify: `src/app/global-error.tsx`

- [ ] **Step 1: Restore and fix Root Layout**
      Remove manual `<head>` and use standard tags.

```tsx
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import React from 'react';
import { SupabaseAuthProvider } from '@/components/providers/auth-provider';

export const metadata: Metadata = {
  title: 'Five Star Gym Manager',
  description: 'Integrated Management System for Academia Five Star',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Simplify Global Error**

```tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Algo deu errado no sistema!</h2>
            <button
              onClick={() => reset()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

### Task 4: Clean Build & Validation [PID-SENTINEL]

- [ ] **Step 1: Clear all caches**

```bash
rm -rf .next tsconfig.tsbuildinfo
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

- [ ] **Step 3: Verification**
      Confirm that the build completes and `/404` is generated without `<Html>` errors.
