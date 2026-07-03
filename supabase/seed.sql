-- supabase/seed.sql
-- Applied by supabase start BEFORE prisma db push. Tables may not exist yet.
-- Grants anon/authenticated access to public schema. Default privileges ensure
-- future tables created by prisma db push inherit grants automatically.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- RLS + policy for funcionarios — idempotent, safe on first run when
-- prisma db push hasn't created the table yet.
DO $$
BEGIN
  ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "Authenticated can read funcionarios" ON public.funcionarios;
  CREATE POLICY "Authenticated can read funcionarios" ON public.funcionarios
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;
