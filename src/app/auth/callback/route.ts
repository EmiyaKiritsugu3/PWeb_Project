import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

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

  // Open redirect prevention: only allow paths under /dashboard or /aluno
  const validatedNext =
    next.startsWith('/dashboard') || next.startsWith('/aluno') ? next : '/login';

  // Missing code — cannot proceed with exchange
  if (!code) {
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/login';
    errorUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(errorUrl);
  }

  // Build the success redirect early so cookies.setAll can attach to it
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
    const errorUrl = request.nextUrl.clone();
    errorUrl.pathname = '/login';
    errorUrl.searchParams.set('error', 'auth_callback_failed');
    return NextResponse.redirect(errorUrl);
  }

  return response;
}
