'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { z } from 'zod/v4';

const loginSchema = z.object({
  email: z.email({ error: 'Por favor, insira um e-mail válido.' }),
  password: z.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres.' }),
});

export async function login(_prevState: { error: string } | undefined, formData: FormData) {
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
    // Fetch profile role to determine redirect destination
    const { data: profile, error: profileError } = await supabase
      .from('funcionarios')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    // PGRST116 = "no rows found" — expected for alunos; any other code is a real DB error
    if (profileError && profileError.code !== 'PGRST116') {
      return { error: 'Erro ao verificar perfil. Por favor, tente novamente.' };
    }

    if (profile) {
      redirect('/dashboard');
    } else {
      redirect('/aluno/dashboard');
    }
  } catch (err: unknown) {
    // redirect() throws internally — must re-throw or the navigation is swallowed
    if (isRedirectError(err)) throw err;
    return { error: 'Ocorreu um erro inesperado. Por favor, tente novamente.' };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err: unknown) {
    if (isRedirectError(err)) throw err;
  }
  redirect('/login');
}
