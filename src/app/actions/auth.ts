'use server';

import { createClient } from '@/utils/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod/v4';

const loginSchema = z.object({
  email: z.email({ error: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export type LoginResult = { error: string } | { success: true; redirectTo: string };

export async function login(
  _prevState: LoginResult | undefined,
  formData: FormData
): Promise<LoginResult> {
  const data = Object.fromEntries(formData);
  const result = loginSchema.safeParse(data);

  if (!result.success) {
    return { error: 'Dados inválidos. Verifique o e-mail e a senha.' };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: 'E-mail ou senha inválidos. Por favor, tente novamente.' };
  }

  // signInWithPassword already returns the session + sets cookies via supabase-ssr setAll.
  if (!authData.session) {
    return { error: 'Erro ao estabelecer sessão. Por favor, tente novamente.' };
  }

  try {
    // Fetch profile role to determine redirect destination
    const { data: profile, error: profileError } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    // PGRST116 = "no rows found" — expected for alunos; any other code is a real DB error
    if (profileError && profileError.code !== 'PGRST116') {
      Sentry.captureMessage(`Profile lookup failed: ${profileError.code}`, 'error');
      return { error: 'Erro ao verificar perfil. Por favor, tente novamente.' };
    }

    // Return redirect path instead of calling redirect() to avoid server action
    // cookie timing issues in Next.js 15. Client will handle the navigation.
    if (profile) {
      return { success: true, redirectTo: '/dashboard' };
    } else {
      return { success: true, redirectTo: '/aluno/dashboard' };
    }
  } catch (err: unknown) {
    Sentry.captureException(err, { tags: { action: 'login' }, level: 'error' });
    return { error: 'Ocorreu um erro inesperado. Por favor, tente novamente.' };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err: unknown) {
    Sentry.captureException(err, { tags: { action: 'logout' }, level: 'warning' });
  }
  // Client will handle redirect after logout succeeds
}
