import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load environment variables from .env.local for CLI usage
config({ path: path.join(process.cwd(), '.env.local') });

export default defineConfig({
  schema: path.join(process.cwd(), 'prisma', 'schema.prisma'),
  url: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
