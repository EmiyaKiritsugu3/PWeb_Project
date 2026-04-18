'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXERCICIOS_POR_GRUPO, DIAS_DA_SEMANA } from '@/lib/constants';
import { Logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Pencil, FileSignature, User, Play } from 'lucide-react';
import type { Treino, HistoricoTreino } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { WorkoutSession } from '@/components/WorkoutSession';
import { streamWorkoutPlan } from '@/ai/flows/workout-generator-flow';
import { type WorkoutGeneratorInput } from '@/ai/schemas';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  upsertTreinoAction,
  updateTreinoDayAction,
  deleteTreinoAction,
  registrarHistoricoTreinoAction,
} from '@/lib/actions/treinos';

import { WorkoutGenerator } from '@/components/dashboard/aluno/workout-generator';
import { WorkoutEditor } from '@/components/dashboard/aluno/workout-editor';

export default function MeusTreinosClient({
  initialTreinos,
  userId,
}: {
  initialTreinos: Treino[];
  userId: string;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [meusTreinos, setMeusTreinos] = useState<Treino[]>(initialTreinos);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTreino, setEditingTreino] = useState<Treino | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingTreino, setDeletingTreino] = useState<Treino | null>(null);
  const [treinoEmSessao, setTreinoEmSessao] = useState<Treino | null>(null);

  const { treinosDoPersonal, treinosDoAluno } = useMemo(() => {
    // Se tem um instrutor que não é o próprio aluno, é do Personal.
    const treinosDoPersonal = meusTreinos.filter((t) => t.instrutorId && t.instrutorId !== userId);
    // Se não tem instrutor (criado por IA) ou se o instrutor foi definido como o próprio aluno (manual)
    const treinosDoAluno = meusTreinos.filter((t) => !t.instrutorId || t.instrutorId === userId);
    return { treinosDoPersonal, treinosDoAluno };
  }, [meusTreinos, userId]);

  const handleSave = async (treinoData: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => {
    try {
      const res = await upsertTreinoAction({
        ...treinoData,
        id: editingTreino?.id,
        alunoId: userId,
        instrutorId: userId,
      });

      if (res.success) {
        toast({
          title: editingTreino ? 'Treino atualizado!' : 'Novo treino salvo!',
          className: 'bg-accent text-accent-foreground',
        });
        if (editingTreino) {
          setMeusTreinos((prev) =>
            prev.map((t) => (t.id === editingTreino.id ? { ...t, ...treinoData } : t))
          );
        } else {
          router.refresh();
        }
        setIsFormVisible(false);
        setEditingTreino(null);
      } else {
        throw new Error(res.error);
      }
    } catch (_error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  const handleEdit = (treino: Treino) => {
    setEditingTreino(treino);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDayChange = async (treinoId: string, dia: string) => {
    const novoDia = dia === 'nenhum' ? null : parseInt(dia, 10);

    if (novoDia !== null && meusTreinos.some((t) => t.diaSemana === novoDia && t.id !== treinoId)) {
      toast({
        title: 'Dia já ocupado',
        description: 'Já existe outro treino agendado para este dia.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await updateTreinoDayAction(treinoId, novoDia);
      if (res.success) {
        toast({ title: 'Agenda atualizada!' });
        setMeusTreinos(
          meusTreinos.map((t) => (t.id === treinoId ? { ...t, diaSemana: novoDia } : t))
        );
      }
    } catch (_error) {
      toast({ title: 'Erro ao atualizar agenda', variant: 'destructive' });
    }
  };

  const openDeleteAlert = (treino: Treino) => {
    setDeletingTreino(treino);
    setIsAlertOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTreino) return;

    try {
      const res = await deleteTreinoAction(deletingTreino.id);
      if (res.success) {
        toast({ title: 'Treino excluído!', variant: 'destructive' });
        setMeusTreinos(meusTreinos.filter((t) => t.id !== deletingTreino.id));
      }
    } catch (_error) {
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }

    setIsAlertOpen(false);
    setDeletingTreino(null);
  };

  const handleGenerate = async (data: WorkoutGeneratorInput) => {
    setIsGenerating(true);
    try {
      Logger.info('Chamando a IA com dados:', data);
      // Chama a Server Action (o proxy gerado pelo Next.js da Flow)
      const result = await streamWorkoutPlan(data);
      Logger.info('Resultado da IA retornado:', result);

      if (result && result.workouts) {
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
            instrutorId: undefined,
            objetivo: workout.nome,
            exercicios: novosExercicios,
            diaSemana: isDayOccupied ? null : diaSugerido,
          });

          if (!res.success) {
            Logger.error('Erro ao salvar treino no banco:', res.error);
            throw new Error('Erro ao salvar no banco: ' + res.error);
          }
        }

        toast({
          title: 'Plano Pessoal Gerado!',
          description: `${result.planName} foi criado com sucesso.`,
          duration: 5000,
        });
      } else {
        Logger.error('Resultado inesperado da IA:', result);
        throw new Error('Formato de retorno inválido.');
      }
    } catch (error) {
      Logger.error('Erro completo ao gerar plano:', error);
      toast({ title: 'Erro da IA', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDiaLabel = (diaSemana: number | null) => {
    if (diaSemana === null) return null;
    return DIAS_DA_SEMANA.find((d) => d.value === diaSemana)?.label;
  };

  const renderWorkoutList = (
    treinos: Treino[],
    title: string,
    description: string,
    icon: React.ReactNode,
    allowEditing: boolean
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon} {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {treinos.map((treino) => (
          <div
            key={treino.id}
            className={cn(
              'rounded-lg border p-4 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4',
              treino.diaSemana !== null && 'bg-accent/10 border-accent'
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base">{treino.objetivo}</h3>
                {treino.diaSemana !== null && <Badge>{getDiaLabel(treino.diaSemana)}</Badge>}
                {treino.instrutorId && treino.instrutorId !== userId && (
                  <Badge variant="secondary">Do Personal</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{treino.exercicios.length} exercícios</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={treino.diaSemana === null ? 'nenhum' : String(treino.diaSemana)}
                onValueChange={(value) => handleDayChange(treino.id, value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Agendar dia..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum (Desativado)</SelectItem>
                  {DIAS_DA_SEMANA.map((dia) => (
                    <SelectItem key={dia.value} value={String(dia.value)}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => setTreinoEmSessao(treino)}>
                <Play className="mr-2 h-4 w-4" />
                Iniciar
              </Button>
              {allowEditing && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(treino)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteAlert(treino)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
        {treinos.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-10">
            {allowEditing
              ? 'Você ainda não criou nenhum treino.'
              : 'Nenhum treino prescrito pelo seu personal ainda.'}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const handleFinishWorkout = async (historico: Omit<HistoricoTreino, 'id' | 'alunoId'>) => {
    try {
      const res = await registrarHistoricoTreinoAction(historico);
      if (res.success) {
        toast({
          title: 'Treino Finalizado!',
          description: 'Seu progresso e XP foram salvos!',
          className: 'bg-green-600 text-white',
        });
        setTreinoEmSessao(null);
      } else {
        throw new Error(res.error);
      }
    } catch (_error) {
      toast({ title: 'Erro ao salvar histórico', variant: 'destructive' });
    }
  };

  if (treinoEmSessao) {
    return (
      <WorkoutSession
        treino={treinoEmSessao}
        onFinish={handleFinishWorkout}
        onCancel={() => setTreinoEmSessao(null)}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Meus Treinos"
        description="Agende os treinos enviados pelo seu personal ou crie e gerencie seus próprios planos."
      />

      <div className="grid gap-8">
        {renderWorkoutList(
          treinosDoPersonal,
          'Planos do Personal',
          'Treinos criados e enviados pelo seu instrutor.',
          <FileSignature className="text-primary" />,
          false
        )}

        {renderWorkoutList(
          treinosDoAluno,
          'Meus Treinos Pessoais',
          'Treinos que você criou manualmente ou gerou com a IA.',
          <User />,
          true
        )}

        <WorkoutGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />

        {isFormVisible && (
          <div className="mb-8">
            <WorkoutEditor
              onSave={handleSave}
              treinoToEdit={editingTreino}
              onCancel={() => {
                setIsFormVisible(false);
                setEditingTreino(null);
              }}
            />
          </div>
        )}

        {!isFormVisible && (
          <div className="text-center">
            <Button
              onClick={() => {
                setEditingTreino(null);
                setIsFormVisible(true);
              }}
              variant="outline"
              size="lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Novo Treino Manualmente
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação excluirá permanentemente o treino{' '}
              <span className="font-bold">{deletingTreino?.objetivo}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
