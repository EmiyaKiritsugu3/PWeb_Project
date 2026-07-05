'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DIAS_DA_SEMANA } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Pencil, FileSignature, User, Play, Sparkles } from 'lucide-react';
import type { Treino, HistoricoTreino } from '@/lib/definitions';
import { useAppNotification } from '@/hooks/use-app-notification';
import { WorkoutSession } from '@/components/WorkoutSession';
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
import { registrarHistoricoTreinoAction } from '@/lib/actions/treinos';
import { useWorkoutCRUD } from '@/hooks/use-workout-crud';
import { useWorkoutGeneration } from '@/hooks/use-workout-generation';

import { WorkoutGenerator } from '@/components/dashboard/aluno/workout-generator';
import { WorkoutEditor } from '@/components/dashboard/aluno/workout-editor';

export default function MeusTreinosClient({
  initialTreinos,
  userId,
}: Readonly<{
  initialTreinos: Treino[];
  userId: string;
}>) {
  const notify = useAppNotification();
  const router = useRouter();

  const {
    meusTreinos,
    isAlertOpen,
    setIsAlertOpen,
    deletingTreino,
    handleSave,
    handleDayChange,
    openDeleteAlert,
    handleDelete,
  } = useWorkoutCRUD({ initialTreinos, userId, router, notify });

  const { isGenerating, handleGenerate, planName } = useWorkoutGeneration({
    userId,
    meusTreinos,
    notify,
    onSuccess: () => {
      router.refresh();
      setTimeout(() => {
        document
          .getElementById('treinos-pessoais')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    },
  });

  const [showPlanBanner, setShowPlanBanner] = useState(false);
  const [bannerPlanName, setBannerPlanName] = useState<string | null>(null);

  useEffect(() => {
    if (planName) {
      setBannerPlanName(planName);
      setShowPlanBanner(true);
      const timer = setTimeout(() => setShowPlanBanner(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [planName]);

  const [treinoEmSessao, setTreinoEmSessao] = useState<Treino | null>(null);
  const [editingTreinoId, setEditingTreinoId] = useState<string | null>(null);

  const handleEditLocal = useCallback((treino: Treino) => {
    setEditingTreinoId(treino.id);
  }, []);

  const { treinosDoPersonal, treinosDoAluno } = useMemo(() => {
    const treinosDoPersonal = meusTreinos.filter((t) => t.instrutorId && t.instrutorId !== userId);
    const treinosDoAluno = meusTreinos.filter((t) => !t.instrutorId || t.instrutorId === userId);
    return { treinosDoPersonal, treinosDoAluno };
  }, [meusTreinos, userId]);

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
            {allowEditing && editingTreinoId === treino.id ? (
              <div className="mt-4 w-full border-t pt-4">
                <WorkoutEditor
                  compact
                  treinoToEdit={treino}
                  onSave={(data) => {
                    handleSave(data, treino.id);
                    setEditingTreinoId(null);
                  }}
                  onCancel={() => setEditingTreinoId(null)}
                />
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base">{treino.objetivo}</h3>
                    {treino.diaSemana !== null && <Badge>{getDiaLabel(treino.diaSemana)}</Badge>}
                    {treino.instrutorId && treino.instrutorId !== userId && (
                      <Badge variant="secondary">Do Personal</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {treino.exercicios.length} exercícios
                  </p>
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
                      <Button variant="secondary" size="sm" onClick={() => handleEditLocal(treino)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteAlert(treino)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}
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
        notify.success('Treino Finalizado!', 'Seu progresso e XP foram salvos!');
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      notify.error('Erro ao salvar histórico', undefined, error);
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

        <WorkoutGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />

        {showPlanBanner && bannerPlanName && (
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="text-primary h-5 w-5" />
                Plano Semanal: {bannerPlanName}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
        <div id="treinos-pessoais">
          {renderWorkoutList(
            treinosDoAluno,
            'Meus Treinos Pessoais',
            'Treinos que voce criou manualmente ou gerou com a IA.',
            <User />,
            true
          )}
        </div>

        <div className="text-center mt-4">
          <Button
            onClick={() => {
              setEditingTreinoId('__new__');
            }}
            variant="outline"
            size="lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Criar Novo Treino Manualmente
          </Button>
        </div>

        {editingTreinoId === '__new__' && (
          <div className="mt-4">
            <WorkoutEditor
              compact
              treinoToEdit={null}
              onSave={(data) => {
                handleSave(data);
                setEditingTreinoId(null);
              }}
              onCancel={() => setEditingTreinoId(null)}
            />
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
