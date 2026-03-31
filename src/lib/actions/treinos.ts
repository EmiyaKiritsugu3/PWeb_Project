'use server';

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function upsertTreinoAction(treinoData: any) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Usuário não autenticado");

    const { id, alunoId, instrutorId, objetivo, exercicios, diaSemana } = treinoData;

    if (id && id.length > 20) { // Check if it's a UUID/ID from Prisma, or if it's a new one
        // Update
        await prisma.treino.update({
            where: { id },
            data: {
                objetivo,
                diaSemana,
                Exercicios: {
                    deleteMany: {},
                    create: exercicios.map((ex: any) => ({
                        nomeExercicio: ex.nomeExercicio,
                        series: parseInt(ex.series) || 0,
                        repeticoes: String(ex.repeticoes),
                        observacoes: ex.observacoes || "",
                        descricao: ex.descricao || "",
                    }))
                }
            }
        });
    } else {
        // Create
        await prisma.treino.create({
            data: {
                alunoId,
                instrutorId,
                objetivo,
                diaSemana,
                Exercicios: {
                    create: exercicios.map((ex: any) => ({
                        nomeExercicio: ex.nomeExercicio,
                        series: parseInt(ex.series) || 0,
                        repeticoes: String(ex.repeticoes),
                        observacoes: ex.observacoes || "",
                        descricao: ex.descricao || "",
                    }))
                }
            }
        });
    }

    revalidatePath("/aluno/meus-treinos");
    revalidatePath("/dashboard/treinos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar treino:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTreinoDayAction(treinoId: string, diaSemana: number | null) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Usuário não autenticado");

        await prisma.treino.update({
            where: { id: treinoId },
            data: { diaSemana }
        });
        revalidatePath("/aluno/meus-treinos");
        return { success: true };
    } catch (error) {
        console.error("Erro ao atualizar dia do treino:", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteTreinoAction(treinoId: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Usuário não autenticado");

    await prisma.treino.delete({
      where: { id: treinoId }
    });
    revalidatePath("/aluno/meus-treinos");
    revalidatePath("/dashboard/treinos");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir treino:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function registrarHistoricoTreinoAction(historicoData: any) {
    try {
        const { createClient: createSupabaseClient } = await import("@/utils/supabase/server");
        const supabase = await createSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            throw new Error("Usuário não autenticado");
        }

        // Buscar aluno pelo email
        const aluno = await prisma.aluno.findUnique({
            where: { email: user.email! },
        });

        if (!aluno) {
            throw new Error("Perfil de aluno não encontrado");
        }

        const hoje = new Date();
        const hojeStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(hoje); // yyyy-mm-dd


        // 1. Criar Histórico de Treino e Séries em uma transação
        const result = await prisma.$transaction(async (tx) => {
            const historico = await tx.historicoTreino.create({
                data: {
                    alunoId: aluno.id,
                    treinoId: historicoData.treinoId,
                    duracaoMinutos: historicoData.duracaoMinutos,
                    dataExecucao: new Date(historicoData.dataExecucao),
                    SeriesExecutadas: {
                        create: historicoData.exercicios.flatMap((ex: any) => 
                            ex.seriesExecutadas.map((serie: any) => ({
                                exercicioId: ex.exercicioId,
                                nomeExercicio: ex.nomeExercicio,
                                serieNumero: serie.serieNumero,
                                peso: serie.peso ? parseFloat(serie.peso) : null,
                                repeticoesFeitas: serie.repeticoesFeitas ? parseInt(serie.repeticoesFeitas) : null,
                                concluido: serie.concluido
                            }))
                        )
                    }
                }
            });

            // 2. Lógica de Gamificação
            let novoStreak = aluno.streakDiasSeguidos;
            let novoNivel = aluno.nivel;
            let novaExp = aluno.exp;
            let treinosNoMes = aluno.treinosNoMes;

            const dataUltimoTreino = aluno.ultimoTreinoData 
                ? new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date(aluno.ultimoTreinoData))
                : null;

            if (dataUltimoTreino !== hojeStr) {
                // É um novo dia de treino!
                const mesAtualStr = hojeStr.split("-")[1];
                const mesUltimoTreinoStr = dataUltimoTreino ? dataUltimoTreino.split("-")[1] : null;

                if (mesAtualStr !== mesUltimoTreinoStr) {
                    treinosNoMes = 1; // It's a new month, reset
                } else {
                    treinosNoMes += 1;
                }

                novaExp += 100; // 100 XP base por treino completo

                // Bônus por volume de séries concluídas
                const totalSeriesConcluidas = historicoData.exercicios.reduce((acc: number, ex: any) => 
                    acc + ex.seriesExecutadas.filter((s: any) => s.concluido).length, 0
                );
                novaExp += totalSeriesConcluidas * 10; // 10 XP por série

                // Lógica de Streak (Ofensiva)
                const ontem = new Date();
                ontem.setDate(ontem.getDate() - 1);
                const ontemStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(ontem);

                if (dataUltimoTreino === ontemStr) {
                    novoStreak += 1;
                    novaExp += 50; // Bônus de 50 XP por manter a sequência
                } else if (dataUltimoTreino !== hojeStr) {
                    novoStreak = 1;
                }

                // Lógica de Level Up (Nível * 1500 XP - ajustado para o novo sistema)
                const expNecessaria = novoNivel * 1500;
                if (novaExp >= expNecessaria) {
                    novaExp -= expNecessaria;
                    novoNivel += 1;
                }

                // 3. Atualizar Aluno
                await tx.aluno.update({
                    where: { id: aluno.id },
                    data: {
                        exp: novaExp,
                        nivel: novoNivel,
                        streakDiasSeguidos: novoStreak,
                        treinosNoMes: treinosNoMes,
                        ultimoTreinoData: hoje,
                    },
                });
            }

            return historico;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000 
        });

        revalidatePath("/aluno/dashboard");
        revalidatePath("/aluno/meus-treinos");
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Erro ao registrar histórico de treino:", error);
        return { success: false, error: error.message };
    }
}
