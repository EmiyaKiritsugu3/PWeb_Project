import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos' }],
  },
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/node_modules', '**/graphify-out/**', '**/.genkit/**', '**/scripts/**'],
    };
    return config;
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'five-star-academy',
  project: 'smartmanagementesystem',
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
});
