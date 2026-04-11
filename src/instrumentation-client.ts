import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay is only available in the browser
  integrations: [
    Sentry.replayIntegration({
      // Mask all text to protect student privacy (PII)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Filter out noisy errors typical in local dev or browser extensions
  ignoreErrors: ['top.GLOBALS', 'chrome-extension://', 'moz-extension://'],
});
