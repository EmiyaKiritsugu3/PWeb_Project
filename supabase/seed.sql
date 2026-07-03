-- supabase/seed.sql
-- Applied by supabase start BEFORE prisma db push. Only schema-level grants
-- and default privileges go here — they apply even before tables exist.
-- Table-specific RLS policies live in prisma/seed-e2e.ts, which runs AFTER
-- prisma db push when all tables are guaranteed to exist.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
