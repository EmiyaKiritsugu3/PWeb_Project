import { useState, useCallback } from 'react';
import type { Treino } from '@/lib/definitions';
import { type WorkoutGeneratorInput } from '@/ai/schemas';
import { streamWorkoutPlan } from '@/ai/flows/workout-generator-flow';
import { upsertTreinoAction } from '@/lib/actions/treinos';
import { EXERCICIOS_POR_GRUPO } from '@/lib/constants';
import { Logger } from '@/lib/logger';
import { getErrorMessage } from '@/lib/error';
import * as Sentry from '@sentry/nextjs';

interface UseWorkoutGenerationOptions {
  userId: string;
  meusTreinos: Treino[];
  notify: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string, error?: unknown) => void;
  };
  onSuccess: () => void;
}

export function useWorkoutGeneration({
  userId,
  meusTreinos,
  notify,
  onSuccess,
}: UseWorkoutGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [planName, setPlanName] = useState<string | null>(null);

  const handleGenerate = useCallback(
    async (data: WorkoutGeneratorInput) => {
      setIsGenerating(true);
      setPlanName(null);
      try {
        Logger.info('Chamando a IA com dados:', data);
        const result = await streamWorkoutPlan(data);
        Logger.info('Resultado da IA retornado:', result);

        if (result?.workouts) {
          for (const workout of result.workouts) {
            const novosExercicios = workout.exercicios.map((ex) => {
              const exercicioMaster = EXERCICIOS_POR_GRUPO.flatMap((g) => g.exercicios).find(
                (ez) => ez.nomeExercicio === ex.nomeExercicio
              );

              if (!exercicioMaster) {
                Sentry.captureMessage(
                  `AI Hallucination: Exercise "${ex.nomeExercicio}" not found in constants.`,
                  {
                    level: 'warning',
                    extra: { workout: workout.nome, goal: data.objetivo },
                  }
                );
              }

              return {
                nomeExercicio: ex.nomeExercicio,
                series: ex.series,
                repeticoes: ex.repeticoes,
                observacoes: ex.observacoes,
                descricao: exercicioMaster?.descricao || '',
              };
            });

            const diaSugerido = workout.diaSugerido;
            const isDayOccupied = meusTreinos.some((t) => t.diaSemana === diaSugerido);

            const res = await upsertTreinoAction({
              alunoId: userId,
              objetivo: workout.nome,
              exercicios: novosExercicios,
              diaSemana: isDayOccupied ? null : diaSugerido,
            });

            if (!res.success) {
              Logger.error('Erro ao salvar treino no banco:', res.error);
              throw new Error('Erro ao salvar no banco: ' + res.error);
            }
          }

          setPlanName(result.planName);
          notify.success('Plano Pessoal Gerado!', `${result.planName} foi criado com sucesso.`);
          onSuccess();
        } else {
          Logger.error('Resultado inesperado da IA:', result);
          throw new Error('Formato de retorno inválido.');
        }
      } catch (error) {
        Logger.error('Erro completo ao gerar plano:', error);
        notify.error('Erro da IA', getErrorMessage(error), error);
      } finally {
        setIsGenerating(false);
      }
    },
    [userId, meusTreinos, notify]
  );

  return { isGenerating, handleGenerate, planName };
}
