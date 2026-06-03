'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as Sentry from '@sentry/nextjs';
import { processPayment } from '@/services/pagamentoService';
import { handleActionError } from '@/lib/error';

export async function registrarPagamentoAction(alunoId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      return await processPayment(alunoId, tx);
    });

    if (result.success) {
      revalidatePath('/dashboard/financeiro');
    }

    return result;
  } catch (error) {
    Sentry.captureException(error);
    return handleActionError(error);
  }
}
