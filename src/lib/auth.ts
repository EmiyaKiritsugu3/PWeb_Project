import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { Logger } from '@/lib/logger';
import type { Role } from '@/lib/definitions';

/**
 * Asserts that the current user holds one of the allowed roles.
 * Redirects to '/login' if unauthenticated; to '/dashboard' if unauthorized
 * or on any DB error (fail-closed).
 */
export async function requireAnyRole(allowedRoles: Role[]): Promise<void> {
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

  if (error) {
    Logger.error(`[requireAnyRole] DB error fetching role: ${error.message}`, error);
    redirect('/dashboard');
  }

  if (!data || !allowedRoles.includes(data.role)) {
    redirect('/dashboard');
  }
}

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

  if (error) {
    Logger.error(`[requireRole] DB error fetching role: ${error.message}`, error);
    redirect('/dashboard');
  }

  if (!data || data.role !== allowedRole) {
    redirect('/dashboard');
  }
}
