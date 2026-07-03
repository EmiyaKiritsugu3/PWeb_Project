-- supabase/seed.sql
-- Applied by supabase start on every run. Grants PostgREST access to
-- tables created by prisma db push (which runs as superuser and does NOT
-- create RLS policies or REST grants automatically).
-- Grant anon+authenticated roles access to public schema and tables
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
-- Enable RLS on funcionarios (holds role/permission data)
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
-- Allow authenticated users to read funcionarios rows.
-- Used by middleware and server actions to determine user role.
DROP POLICY IF EXISTS "Authenticated can read funcionarios" ON public.funcionarios;
CREATE POLICY "Authenticated can read funcionarios" ON public.funcionarios
  FOR SELECT
  TO authenticated
  USING (true);
