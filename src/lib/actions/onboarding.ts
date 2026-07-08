'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { OnboardingBaseSchema } from '@/lib/definitions';
import { getUser } from '@/utils/supabase/server';
import * as Sentry from '@sentry/nextjs';
import { handleActionError, type ActionResult } from '@/lib/error';

/**
 * First-login onboarding for OAuth users (Google/GitHub/Apple) who have no
 * `alunos` row. Creates the row with a real CPF + address collected from the
 * onboarding form — replaces the placeholder-CPF auto-provision that lived in
 * the dashboard page. The form is the sole writer of new OAuth-origin rows.
 *
 * Race guard: if two concurrent submits both miss the findUnique and both try
 * to create, the unique constraint on `cpf` (or `email`) throws — caught,
 * re-read by email, surfaced as success so the user lands on the dashboard.
 */
export async function completeOnboardingAction(
  data: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  return await Sentry.withServerActionInstrumentation(
    'completeOnboardingAction',
    { headers: await headers(), formData: undefined, recordResponse: true },
    async () => {
      try {
        const { user, error: authError } = await getUser();
        if (authError || !user) throw new Error('Usuário não autenticado');

        // Email + nome/foto come from the authenticated Supabase session, not
        // the form, so a user cannot spoof another account's email via the
        // onboarding payload. The form's email field is display-only.
        const meta = user.user_metadata ?? {};
        const nomeCompleto =
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          user.email ??
          'Aluno Google';
        const fotoUrl = (meta.avatar_url as string | undefined) ?? null;

        const validated = OnboardingBaseSchema.parse({
          ...data,
          email: user.email,
          nomeCompleto,
        });

        const select = { id: true } as const;

        try {
          const aluno = await prisma.aluno.create({
            data: {
              email: user.email!,
              nomeCompleto,
              fotoUrl,
              cpf: validated.cpf,
              telefone: validated.telefone,
              dataNascimento: validated.dataNascimento ? new Date(validated.dataNascimento) : null,
              cep: validated.cep,
              endereco: validated.endereco,
              numero: validated.numero,
              bairro: validated.bairro,
              cidade: validated.cidade,
              estado: validated.estado,
            },
            select,
          });
          revalidatePath('/aluno/dashboard');
          return { success: true, data: aluno } satisfies ActionResult<{ id: string }>;
        } catch (e) {
          // Unique-violation race: another concurrent request already created
          // the row. Surface success — idempotent end state.
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            const existing = await prisma.aluno.findUnique({
              where: { email: user.email },
              select,
            });
            if (existing) {
              revalidatePath('/aluno/dashboard');
              return { success: true, data: existing } satisfies ActionResult<{ id: string }>;
            }
          }
          throw e;
        }
      } catch (error) {
        Sentry.captureException(error);
        return handleActionError(error);
      }
    }
  );
}
