'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod/v4';

const loginSchema = z.object({
  email: z.email({ error: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export type LoginResult = { error: string } | { redirectTo: string };

/** @deprecated Use client-side signInWithPassword + role redirect in login/page.tsx instead. */
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

  try {
    const { data: profile, error: profileError } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return { error: 'Erro ao verificar perfil. Por favor, tente novamente.' };
    }

    const redirectTo = profile ? '/dashboard' : '/aluno/dashboard';
    return { redirectTo };
  } catch (err: unknown) {
    Sentry.captureException(err, {
      tags: { action: 'login', step: 'profile-query' },
      level: 'error',
    });
    return { error: 'Ocorreu um erro inesperado. Por favor, tente novamente.' };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
    Sentry.captureException(err, { tags: { action: 'logout' }, level: 'warning' });
  }
  redirect('/login');
}
