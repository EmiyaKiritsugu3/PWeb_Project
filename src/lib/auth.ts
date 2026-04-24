import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/utils/supabase/server';
import { Logger } from '@/lib/logger';
import type { Role } from '@/lib/definitions';

/**
 * Asserts that the current user holds one of the allowed roles.
 * Redirects to '/login' if unauthenticated; to '/dashboard' if unauthorized
 * or on any DB error (fail-closed).
 */
export async function requireAnyRole(allowedRoles: Role[]): Promise<void> {
  const { user, error: authError } = await getUser();

  if (authError || !user) {
    if (authError) {
      const message = authError instanceof Error ? authError.message : 'Erro no getUser';
      Logger.error(`[auth] Supabase getUser error: ${message}`, authError);
    }
    redirect('/login');
    return;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar role';
    Logger.error(`[auth] DB error fetching role: ${message}`, error);
    redirect('/dashboard');
    return;
  }

  if (!data || !allowedRoles.includes(data.role)) {
    redirect('/dashboard');
  }
}

/**
 * Asserts that the currently authenticated user has the required role.
 * Delegates to requireAnyRole for consistent fail-closed behavior.
 */
export async function requireRole(allowedRole: Role): Promise<void> {
  return requireAnyRole([allowedRole]);
}
