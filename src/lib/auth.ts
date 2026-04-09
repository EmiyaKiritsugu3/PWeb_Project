import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import type { Role } from '@prisma/client';

/**
 * Asserts that the currently authenticated user has the required role.
 * Redirects to '/login' if no session exists.
 * Redirects to '/dashboard' if role doesn't match (fail-closed on DB errors).
 */
export async function requireRole(allowedRole: Role): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
    return;
  }

  const { data, error } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data || data.role !== allowedRole) {
    redirect('/dashboard');
  }
}
