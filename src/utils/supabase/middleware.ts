import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { FINANCIAL_ROUTES } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

type AuthResult =
  | { user: User; role: string | null; isFuncionario: boolean }
  | { redirect: NextResponse };

async function getAuthForRoute(
  supabase: SupabaseClient,
  _pathname: string,
  request: NextRequest
): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  const { data: funcionarioProfile } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return {
    user,
    role: funcionarioProfile?.role ?? null,
    isFuncionario: !!funcionarioProfile,
  };
}

function isProtectedRoute(pathname: string) {
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAlunoRoute = pathname.startsWith('/aluno') && !pathname.startsWith('/aluno/login');
  return { isProtected: isDashboardRoute || isAlunoRoute, isDashboardRoute, isAlunoRoute };
}

function redirectRouteGuard(
  pathname: string,
  isFuncionario: boolean,
  role: string | null,
  request: NextRequest
): NextResponse | null {
  const { isAlunoRoute, isDashboardRoute } = isProtectedRoute(pathname);

  if (isFuncionario && isAlunoRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (!isFuncionario && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/aluno';
    return NextResponse.redirect(url);
  }

  const isFinancialRoute = FINANCIAL_ROUTES.some((r) => pathname.startsWith(r));
  if (isFuncionario && isFinancialRoute && role !== 'GERENTE') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return null;
}

export const updateSession = async (request: NextRequest) => {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([k, v]) => supabaseResponse.headers.set(k, v));
      },
    },
  });

  const pathname = request.nextUrl.pathname;
  const { isProtected } = isProtectedRoute(pathname);
  if (!isProtected) return supabaseResponse;

  const auth = await getAuthForRoute(supabase, pathname, request);
  if ('redirect' in auth) return auth.redirect;

  const redirectResult = redirectRouteGuard(pathname, auth.isFuncionario, auth.role, request);
  if (redirectResult) return redirectResult;

  return supabaseResponse;
};
