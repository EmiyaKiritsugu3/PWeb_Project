import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load environment variables from .env.local for CLI usage
config({ path: path.join(process.cwd(), '.env.local') });

export default defineConfig({
  schema: path.join(process.cwd(), 'prisma', 'schema.prisma'),
  datasource: {
    // For migrations (CLI), we must use DIRECT_URL to bypass PgBouncer
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
