'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EXERCICIOS_POR_GRUPO } from '@/lib/constants';
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
import { PlusCircle, Save, Trash2, Wand2, BrainCircuit, UserCheck, Dumbbell } from 'lucide-react';
import { Logger } from '@/lib/logger';
import type { Aluno, Exercicio } from '@/lib/definitions';
import { useAppNotification } from '@/hooks/use-app-notification';
import { Combobox } from '@/components/ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { streamWorkoutPlan } from '@/ai/flows/workout-generator-flow';
import {
  WorkoutGeneratorInputSchema,
  type WorkoutGeneratorInput,
  type WorkoutGeneratorOutput,
} from '@/ai/schemas';
import { upsertTreinoAction } from '@/lib/actions/treinos';

type WorkoutPlan = WorkoutGeneratorOutput;
type WorkoutExercise = WorkoutPlan['workouts'][0]['exercicios'][0];

const exerciciosOptions = EXERCICIOS_POR_GRUPO.map((grupo) => ({
  label: grupo.grupo,
  options: grupo.exercicios.map((ex) => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    keywords: [grupo.grupo],
  })),
}));

const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap((g) =>
  g.exercicios.map((ex) => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    description: ex.descricao,
  }))
);

function WorkoutGenerator({
  onGenerate,
  isGenerating,
}: {
  onGenerate: (data: WorkoutGeneratorInput) => Promise<void>;
  isGenerating: boolean;
}) {
  const form = useForm<WorkoutGeneratorInput>({
    resolver: zodResolver(WorkoutGeneratorInputSchema),
    defaultValues: {
      diasPorSemana: 3,
      objetivo: 'Hipertrofia',
      nivelExperiencia: 'Iniciante',
      observacoesAdicionais: '',
    },
  });

  return (
    <Card className="bg-secondary border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          Gerador de Plano Semanal com IA
        </CardTitle>
        <CardDescription>
          Preencha os dados do aluno para que a IA crie uma divisão de treinos completa para a
          semana.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="ai-generator-form"
            onSubmit={form.handleSubmit(onGenerate)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <FormField
              control={form.control}
              name="objetivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objetivo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Hipertrofia">Hipertrofia</SelectItem>
                      <SelectItem value="Perda de Peso">Perda de Peso</SelectItem>
                      <SelectItem value="Força">Força</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nivelExperiencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Experiência</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Iniciante">Iniciante</SelectItem>
                      <SelectItem value="Intermediário">Intermediário</SelectItem>
                      <SelectItem value="Avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="diasPorSemana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias/Semana</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={7}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        field.onChange(isNaN(value) ? '' : value);
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <FormField
                control={form.control}
                name="observacoesAdicionais"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lesão no joelho direito" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="ai-generator-form" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <BrainCircuit className="mr-2 h-4 w-4 animate-pulse" /> Gerando Plano...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" /> Gerar Plano Semanal
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function PlanoGeradoParaEdicao({
  plano,
  aluno,
  onSave,
  onCancel,
}: {
  plano: WorkoutPlan;
  aluno: Aluno;
  onSave: (planoEditado: WorkoutPlan) => Promise<void>;
  onCancel: () => void;
}) {
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
      exercicio[field] = typeof value === 'string' ? parseInt(value, 10) || 0 : (value as number);
    } else {
      (exercicio as Record<string, unknown>)[field] = value;
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
          <div key={treinoIndex} className="border p-4 rounded-md space-y-4 bg-muted/30">
            <div className="space-y-2">
              <Label>Nome do Treino</Label>
              <Input
                value={treino.nome}
                onChange={(e) => handleNomeTreinoChange(treinoIndex, e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {treino.exercicios.map((exercicio, exIndex) => (
                <div
                  key={exIndex}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr] items-end gap-3"
                >
                  <div className="grid gap-2">
                    <Label>Exercício</Label>
                    <Input
                      value={exercicio.nomeExercicio}
                      onChange={(e) =>
                        handleExercicioChange(treinoIndex, exIndex, 'nomeExercicio', e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Séries</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={exercicio.series}
                      onChange={(e) =>
                        handleExercicioChange(treinoIndex, exIndex, 'series', e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Reps</Label>
                    <Input
                      className="w-24"
                      value={exercicio.repeticoes}
                      onChange={(e) =>
                        handleExercicioChange(treinoIndex, exIndex, 'repeticoes', e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Observações</Label>
                    <Input
                      value={exercicio.observacoes}
                      onChange={(e) =>
                        handleExercicioChange(treinoIndex, exIndex, 'observacoes', e.target.value)
                      }
                    />
                  </div>
                </div>
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

export default function TreinosManagementClient({ initialAlunos }: { initialAlunos: Aluno[] }) {
  const notify = useAppNotification();
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);
  const [objetivo, setObjetivo] = useState('');
  const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planoGerado, setPlanoGerado] = useState<WorkoutPlan | null>(null);

  const selectedAluno = initialAlunos.find((a) => a.id === selectedAlunoId);

  const handleAddExercicio = () => {
    setExercicios([
      ...exercicios,
      {
        id: `${Date.now()}`,
        nomeExercicio: '',
        series: 3,
        repeticoes: '10-12',
        observacoes: '',
        descricao: '',
      },
    ]);
  };

  const handleRemoveExercicio = (id: string) => {
    setExercicios(exercicios.filter((ex) => ex.id !== id));
  };

  const handleExercicioChange = (id: string, field: keyof Exercicio, value: string | number) => {
    setExercicios(
      exercicios.map((ex) => {
        if (ex.id !== id) return ex;
        if (field === 'nomeExercicio' && typeof value === 'string') {
          const selectedOption = flatExerciciosOptions.find((opt) => opt.value === value);
          return { ...ex, nomeExercicio: value, descricao: selectedOption?.description || '' };
        }
        return { ...ex, [field]: value };
      })
    );
  };

  const handleSaveTreino = async () => {
    if (
      !selectedAlunoId ||
      !objetivo ||
      exercicios.length === 0 ||
      exercicios.some((e) => !e.nomeExercicio)
    ) {
      notify.error('Erro ao salvar', 'Verifique os campos obrigatórios.');
      return;
    }

    try {
      const res = await upsertTreinoAction({
        alunoId: selectedAlunoId,
        objetivo,
        exercicios: exercicios as Exercicio[],
        diaSemana: null,
      });

      if (res.success) {
        notify.success('Treino Salvo!');
        setObjetivo('');
        setExercicios([]);
      } else {
        throw new Error(res.error);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro inesperado';
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
        setPlanoGerado(result as WorkoutGeneratorOutput);
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
      for (const workout of planoEditado.workouts) {
        await upsertTreinoAction({
          alunoId: selectedAluno.id,
          objetivo: workout.nome,
          exercicios: workout.exercicios.map((ex) => ({
            nomeExercicio: ex.nomeExercicio,
            series: ex.series,
            repeticoes: ex.repeticoes,
            observacoes: ex.observacoes,
            descricao:
              flatExerciciosOptions.find((opt) => opt.value === ex.nomeExercicio)?.description ||
              '',
          })),
          diaSemana: workout.diaSugerido,
        });
      }
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
                    <div
                      key={exercicio.id}
                      className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto] items-end gap-3 rounded-md border p-4 bg-muted/20"
                    >
                      <div className="grid gap-2">
                        {index === 0 && <Label className="md:hidden">Exercício</Label>}
                        <Combobox
                          options={exerciciosOptions}
                          flatOptions={flatExerciciosOptions}
                          value={exercicio.nomeExercicio}
                          onChange={(value) =>
                            handleExercicioChange(exercicio.id!, 'nomeExercicio', value)
                          }
                          placeholder="Selecione..."
                          searchPlaceholder="Buscar..."
                        />
                      </div>
                      <div className="grid gap-2">
                        {index === 0 && <Label className="md:hidden">Séries</Label>}
                        <Input
                          type="number"
                          className="w-20"
                          value={exercicio.series || ''}
                          onChange={(e) =>
                            handleExercicioChange(exercicio.id!, 'series', parseInt(e.target.value))
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        {index === 0 && <Label className="md:hidden">Reps</Label>}
                        <Input
                          placeholder="10-12"
                          className="w-24"
                          value={exercicio.repeticoes || ''}
                          onChange={(e) =>
                            handleExercicioChange(exercicio.id!, 'repeticoes', e.target.value)
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        {index === 0 && <Label className="md:hidden">Obs</Label>}
                        <Input
                          placeholder="Opcional"
                          value={exercicio.observacoes || ''}
                          onChange={(e) =>
                            handleExercicioChange(exercicio.id!, 'observacoes', e.target.value)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveExercicio(exercicio.id!)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddExercicio}>
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
