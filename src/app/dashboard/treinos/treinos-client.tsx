'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, UserCheck, Dumbbell } from 'lucide-react';
import { Logger } from '@/lib/logger';
import type { Aluno } from '@/lib/definitions';
import { useAppNotification } from '@/hooks/use-app-notification';
import { flatExerciciosOptions } from '@/lib/exercise-options';
import { useWorkoutExercises } from '@/hooks/use-workout-exercises';
import { WorkoutExerciseRow } from '@/components/dashboard/aluno/workout-exercise-row';
import { streamWorkoutPlan } from '@/ai/flows/workout-generator-flow';
import { type WorkoutGeneratorInput, type WorkoutGeneratorAIOutput } from '@/ai/schemas';
import { WorkoutGenerator } from '@/components/dashboard/aluno/workout-generator';
import { batchUpsertTreinoAction, upsertTreinoAction } from '@/lib/actions/treinos';

type WorkoutPlan = WorkoutGeneratorAIOutput;
type WorkoutExercise = WorkoutPlan['workouts'][0]['exercicios'][0];

function PlanoGeradoParaEdicao({
  plano,
  aluno,
  onSave,
  onCancel,
}: Readonly<{
  plano: WorkoutPlan;
  aluno: Aluno;
  onSave: (planoEditado: WorkoutPlan) => Promise<void>;
  onCancel: () => void;
}>) {
  const [planoEditado, setPlanoEditado] = useState(plano);

  const handleExercicioChange = (
    treinoIndex: number,
    exIndex: number,
    field: keyof WorkoutExercise,
    value: string | number
  ) => {
    const novoPlano = { ...planoEditado };
    const exercicio = novoPlano.workouts[treinoIndex].exercicios[exIndex];

    if (field === 'series') {
      const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
      exercicio[field] = Number.isFinite(parsed) ? parsed : (undefined as unknown as number);
    } else {
      Object.assign(exercicio, { [field]: value });
    }

    setPlanoEditado(novoPlano);
  };

  const handleNomeTreinoChange = (treinoIndex: number, nome: string) => {
    const novoPlano = { ...planoEditado };
    novoPlano.workouts[treinoIndex].nome = nome;
    setPlanoEditado(novoPlano);
  };

  return (
    <Card className="border-primary shadow-lg">
      <CardHeader>
        <CardTitle>Revisar Plano para {aluno.nomeCompleto}</CardTitle>
        <CardDescription>Ajuste os detalhes antes de salvar no perfil do aluno.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Nome do Plano</Label>
          <Input
            value={planoEditado.planName}
            onChange={(e) => setPlanoEditado({ ...planoEditado, planName: e.target.value })}
          />
        </div>

        {planoEditado.workouts.map((treino, treinoIndex) => (
          <div
            key={`${treino.nome}-${treinoIndex}`}
            className="border p-4 rounded-md space-y-4 bg-muted/30"
          >
            <div className="space-y-2">
              <Label>Nome do Treino</Label>
              <Input
                value={treino.nome}
                onChange={(e) => handleNomeTreinoChange(treinoIndex, e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {treino.exercicios.map((exercicio, exIndex) => (
                <WorkoutExerciseRow
                  key={`${exercicio.nomeExercicio}-${exIndex}`}
                  exercise={{ ...exercicio, id: `temp-${treinoIndex}-${exIndex}` }}
                  index={exIndex}
                  mode="input"
                  onUpdate={(_id, field, value) =>
                    handleExercicioChange(
                      treinoIndex,
                      exIndex,
                      field as keyof WorkoutExercise,
                      value
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(planoEditado)}>
          <Save className="mr-2 h-4 w-4" />
          Salvar e Atribuir
        </Button>
      </CardFooter>
    </Card>
  );
}

function buildExercicios(
  exercicios: WorkoutExercise[],
  options: Array<{ value: string; description?: string }>
) {
  return exercicios.map((ex) => ({
    nomeExercicio: ex.nomeExercicio,
    series: ex.series,
    repeticoes: ex.repeticoes,
    observacoes: ex.observacoes,
    descricao: options.find((opt) => opt.value === ex.nomeExercicio)?.description ?? '',
  }));
}

function buildWorkoutTreinos(
  planoEditado: WorkoutPlan,
  selectedAluno: { id: string },
  options: Array<{ value: string; description?: string }>
) {
  return planoEditado.workouts.map((workout) => ({
    alunoId: selectedAluno.id,
    objetivo: workout.nome,
    exercicios: buildExercicios(workout.exercicios, options),
    diaSemana: workout.diaSugerido,
  }));
}

export default function TreinosManagementClient({
  initialAlunos,
}: Readonly<{ initialAlunos: Aluno[] }>) {
  const notify = useAppNotification();
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const {
    objetivo,
    setObjetivo,
    exercicios,
    addObjective,
    removeExercise,
    updateExercise,
    hasValidationErrors,
    reset,
  } = useWorkoutExercises();
  const [isGenerating, setIsGenerating] = useState(false);
  const [planoGerado, setPlanoGerado] = useState<WorkoutPlan | null>(null);

  const selectedAluno = initialAlunos.find((a) => a.id === selectedAlunoId);

  const handleSaveTreino = async () => {
    if (!selectedAlunoId || hasValidationErrors()) {
      notify.error('Erro ao salvar', 'Verifique os campos obrigatórios.');
      return;
    }

    try {
      const res = await upsertTreinoAction({
        alunoId: selectedAlunoId,
        objetivo,
        exercicios: exercicios.map(
          ({ id: _id, nomeExercicio, series, repeticoes, observacoes, descricao }) => ({
            nomeExercicio: nomeExercicio ?? '',
            series: series || 0,
            repeticoes: repeticoes ?? '',
            observacoes: observacoes ?? null,
            descricao: descricao ?? null,
          })
        ),
        diaSemana: null,
      });

      if (res.success) {
        notify.success('Treino Salvo!');
        reset();
      } else {
        Logger.error('upsertTreinoAction failed:', res.error);
        throw new Error(res.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
      Logger.error('handleSaveTreino error:', error);
      notify.error('Erro ao salvar', message, error);
    }
  };

  const handleGenerateWorkout = async (data: WorkoutGeneratorInput) => {
    if (!selectedAluno) {
      notify.error('Selecione um aluno primeiro!');
      return;
    }
    setIsGenerating(true);
    try {
      // Usar a chamada direta do flow em vez de stream para maior estabilidade em produção
      const result = await streamWorkoutPlan(data);
      if (result) {
        setPlanoGerado(result);
        notify.success('Plano Gerado!');
      } else {
        throw new Error('A IA não retornou um resultado válido.');
      }
    } catch (error: unknown) {
      Logger.error('Erro na geração de treino:', error);
      notify.error(
        'Erro da IA',
        'Não foi possível gerar o treino. Tente novamente em instantes.',
        error
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlanoGerado = async (planoEditado: WorkoutPlan) => {
    if (!selectedAluno) return;
    try {
      const treinos = buildWorkoutTreinos(planoEditado, selectedAluno, flatExerciciosOptions);
      const result = await batchUpsertTreinoAction(treinos);
      if (!result.success) throw new Error(result.error);

      notify.success('Plano Atribuído!');
      setPlanoGerado(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao salvar plano';
      notify.error('Erro ao salvar plano', message, error);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="text-primary" />
            Passo 1: Selecionar Aluno
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedAlunoId} value={selectedAlunoId || ''}>
            <SelectTrigger className="w-full md:w-1/2">
              <SelectValue placeholder="Escolha um aluno para gerenciar treinos..." />
            </SelectTrigger>
            <SelectContent>
              {initialAlunos.map((aluno) => (
                <SelectItem key={aluno.id} value={aluno.id}>
                  {aluno.nomeCompleto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAluno && (
        <>
          <WorkoutGenerator onGenerate={handleGenerateWorkout} isGenerating={isGenerating} />

          {planoGerado && (
            <PlanoGeradoParaEdicao
              plano={planoGerado}
              aluno={selectedAluno}
              onSave={handleSavePlanoGerado}
              onCancel={() => setPlanoGerado(null)}
            />
          )}

          {!planoGerado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="text-primary" />
                  Passo 2: Criar Treino Manual para {selectedAluno.nomeCompleto}
                </CardTitle>
                <CardDescription>Monte um treino específico para este aluno.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="objetivo">Objetivo do Treino</Label>
                  <Input
                    id="objetivo"
                    placeholder="Ex: Peito e Tríceps"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                  />
                </div>

                <div className="grid gap-4">
                  <h3 className="font-medium">Exercícios</h3>
                  {exercicios.map((exercicio, index) => (
                    <div key={exercicio.id} className="rounded-md border p-4 bg-muted/20">
                      <WorkoutExerciseRow
                        exercise={exercicio}
                        index={index}
                        onUpdate={updateExercise}
                        onRemove={removeExercise}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addObjective}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Exercício
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSaveTreino}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  disabled={exercicios.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" /> Salvar Treino
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
