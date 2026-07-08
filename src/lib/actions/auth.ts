'use server';

import * as Sentry from '@sentry/nextjs';
import { z } from 'zod/v4';
import { createClient } from '@/utils/supabase/server';
import { AUTH_CALLBACK_PATH } from '@/lib/constants';
import { validateNext } from '@/lib/auth-redirect';

// `NEXT_PUBLIC_APP_URL` must be set in any environment that sends magic-link
// or OAuth redirect URLs — otherwise the link target would point at localhost
// and silently break auth in prod/preview. Read it lazily inside `callbackUrl`
// (not at module load) so test harnesses that inject env after import still work.
function callbackUrl(next?: string | null): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error(
      'NEXT_PUBLIC_APP_URL is not set; magic-link and OAuth redirects cannot be built.'
    );
  }
  const validated = validateNext(next);
  // validateNext's inert fallback is '/'; for the OAuth callback we need a
  // concrete post-login destination, so map the inert '/' → '/login' the same
  // way callback/route.ts does.
  const safeNext = validated === '/' ? '/login' : validated;
  return `${appUrl}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(safeNext)}`;
}

const MagicLinkSchema = z.object({
  email: z.email({ error: 'Email is required' }),
});

export async function signInWithMagicLink(formData: FormData): Promise<{ error?: string }> {
  const parsed = MagicLinkSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Email is required' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: callbackUrl('/aluno/dashboard'),
      shouldCreateUser: true,
    },
  });

  if (error) {
    Sentry.captureException(error, { tags: { auth: 'magic-link' } });
    return { error: error.message };
  }
  return {};
}

/**
 * Shared OAuth sign-in. `data.url` is the provider authorize URL; return it
 * on a dedicated `url` field, and errors on `error`, so the client never has
 * to disambiguate by inspecting the error string.
 */
async function signInWithOAuth(provider: 'google' | 'github' | 'apple', next?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(next) },
  });

  if (error) {
    Sentry.captureException(error, { tags: { auth: provider } });
    return { error: error.message };
  }
  if (data.url) return { url: data.url };
  return { error: 'No redirect URL returned' };
}

export async function signInWithGoogle(next?: string): Promise<{ url?: string; error?: string }> {
  return signInWithOAuth('google', next);
}

export async function signInWithGitHub(next?: string): Promise<{ url?: string; error?: string }> {
  return signInWithOAuth('github', next);
}

export async function signInWithApple(next?: string): Promise<{ url?: string; error?: string }> {
  return signInWithOAuth('apple', next);
}
