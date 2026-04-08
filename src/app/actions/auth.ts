'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Por favor, insira um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export async function login(prevState: any, formData: FormData) {
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

  // Fetch profile role to determine redirect
  const { data: profile } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', authData.user.id)
    .single();

  if (profile) {
    redirect('/dashboard');
  } else {
    redirect('/aluno');
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
