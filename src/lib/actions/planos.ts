'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PlanoSchema, PlanoBaseSchema } from '@/lib/definitions';
import { createClient } from '@/utils/supabase/server';
import { getErrorMessage, getZodError } from '@/lib/error';

async function assertAuthenticated() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Usuário não autenticado');
  return user;
}

export async function createPlanoAction(data: unknown) {
  try {
    await assertAuthenticated();
    const validated = PlanoBaseSchema.parse(data);

    const plano = await prisma.plano.create({
      data: {
        nome: validated.nome,
        preco: validated.preco,
        duracaoDias: validated.duracaoDias,
      },
    });

    revalidatePath('/dashboard/planos');
    return { success: true, data: PlanoSchema.parse(plano) };
  } catch (error: unknown) {
    const zodError = getZodError(error);
    if (zodError) {
      return { success: false, error: 'Dados inválidos', details: zodError.fieldErrors };
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function updatePlanoAction(id: string, data: unknown) {
  try {
    await assertAuthenticated();
    const validated = PlanoBaseSchema.partial().parse(data);

    const plano = await prisma.plano.update({
      where: { id },
      data: {
        nome: validated.nome,
        preco: validated.preco,
        duracaoDias: validated.duracaoDias,
      },
    });

    revalidatePath('/dashboard/planos');
    return { success: true, data: PlanoSchema.parse(plano) };
  } catch (error: unknown) {
    const zodError = getZodError(error);
    if (zodError) {
      return { success: false, error: 'Dados inválidos', details: zodError.fieldErrors };
    }
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function deletePlanoAction(id: string) {
  try {
    await assertAuthenticated();
    await prisma.plano.delete({ where: { id } });
    revalidatePath('/dashboard/planos');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) };
  }
}
