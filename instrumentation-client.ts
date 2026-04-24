import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  // Optimization: Lower sample rate in production to save quota
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  debug: false,

  // Replay is only available in the browser
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media to protect student privacy (PII)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session Replay
  replaysSessionSampleRate: 0.1,
  // Optimization: Lower error replay rate in production
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Privacy: Ensure no PII is sent by default
  sendDefaultPii: false,

  // Scrub potentially sensitive data from client logs
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers['cookie'];
      delete event.request.headers['authorization'];
    }
    return event;
  },

  // Filter out noisy errors typical in local dev or browser extensions
  ignoreErrors: ['top.GLOBALS', 'chrome-extension://', 'moz-extension://'],
});

/**
 * Capture client-side navigation transactions.
 * Required for Next.js 15 App Router.
 */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
