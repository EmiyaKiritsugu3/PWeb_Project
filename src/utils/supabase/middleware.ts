import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { FINANCIAL_ROUTES } from '@/lib/constants';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAlunoRoute = pathname.startsWith('/aluno');
  const isProtectedRoute = isDashboardRoute || isAlunoRoute;

  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  if (user && isProtectedRoute) {
    const { data: funcionarioProfile } = await supabase
      .from('funcionarios')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    const isFuncionario = !!funcionarioProfile;

    if (isFuncionario && isAlunoRoute) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }

    if (!isFuncionario && isDashboardRoute) {
      const alunoUrl = request.nextUrl.clone();
      alunoUrl.pathname = '/aluno';
      return NextResponse.redirect(alunoUrl);
    }

    const isFinancialRoute = FINANCIAL_ROUTES.some((r) => pathname.startsWith(r));

    if (isFuncionario && isFinancialRoute) {
      const { data: roleData, error } = await supabase
        .from('funcionarios')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error || roleData?.role !== 'GERENTE') {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return supabaseResponse;
};
