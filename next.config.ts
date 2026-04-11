import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: 'ufrn-universidade-federal-do-r',
  project: 'smartmanagementesystem',

  // Auth token for source map uploads (set in CI via SENTRY_AUTH_TOKEN secret)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Proxy Sentry requests through Next.js to avoid ad-blockers
  tunnelRoute: '/monitoring',

  // Upload source maps in CI only (requires SENTRY_AUTH_TOKEN)
  silent: !process.env.CI,

  // Tree-shake Sentry debug code in production builds
  widenClientFileUpload: true,

  // Modern replacement for disableLogger as per Sentry warning
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // OPTIMIZATION: Disable Sentry plugins in development to resolve
  // [webpack.cache.PackFileCacheStrategy] warnings and speed up dev builds.
  sourcemaps: {
    disable: process.env.NODE_ENV === 'development',
  },
});
