import * as Sentry from '@sentry/nextjs';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { validateNext } from '@/lib/auth-redirect';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/login';
    errorUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(errorUrl);
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/login';

  // Open-redirect prevention: single shared helper so this route and the auth
  // server actions cannot drift. validateNext rejects protocol-relative
  // (`//`), path traversal (`/aluno/../admin`), and sibling-prefix spoofing
  // (`/alunox`). Falls back to '/login' for OAuth callback context.
  const validatedRoot = validateNext(next);
  const validatedNext = validatedRoot === '/' ? '/login' : validatedRoot;

  if (!code) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/login';
    errorUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(errorUrl);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = validatedNext;
  redirectUrl.search = '';

  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([k, v]) => {
          response.headers.set(k, v);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Capture before redirect so auth failures are observable — a bare
    // redirect here silently drops the Supabase exchange error.
    Sentry.captureException(error, {
      extra: { callbackUrl: request.url, next },
    });
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/login';
    errorUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(errorUrl);
  }

  return response;
}
