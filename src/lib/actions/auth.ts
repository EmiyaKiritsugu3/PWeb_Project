'use server';

import { createClient } from '@/utils/supabase/server';
import { AUTH_CALLBACK_PATH } from '@/lib/constants';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

function validateNext(next: string | null): string {
  const allowedPrefixes = ['/dashboard', '/aluno'] as const;
  if (next && allowedPrefixes.some((p) => next.startsWith(p)) && !next.startsWith('//')) {
    return next;
  }
  return '/login';
}

function callbackUrl(next?: string | null): string {
  const safeNext = validateNext(next ?? null);
  return `${appUrl}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(safeNext)}`;
}

export async function signInWithMagicLink(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  if (!email) return { error: 'Email is required' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl('/aluno/dashboard'),
      shouldCreateUser: true,
    },
  });

  if (error) return { error: error.message };
  return {};
}

export async function signInWithGoogle(next?: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl(next),
    },
  });

  if (error) return { error: error.message };
  if (data.url) return { error: data.url };
  return { error: 'No redirect URL returned' };
}

export async function signInWithGitHub(next?: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: callbackUrl(next),
    },
  });

  if (error) return { error: error.message };
  if (data.url) return { error: data.url };
  return { error: 'No redirect URL returned' };
}

export async function signInWithApple(next?: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: callbackUrl(next),
    },
  });

  if (error) return { error: error.message };
  if (data.url) return { error: data.url };
  return { error: 'No redirect URL returned' };
}
