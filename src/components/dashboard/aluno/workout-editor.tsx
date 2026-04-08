import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save, Trash2, Dumbbell } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { useToast } from '@/hooks/use-toast';
import type { Treino, Exercicio } from '@/lib/definitions';
import { EXERCICIOS_POR_GRUPO } from '@/lib/constants';

const flatExerciciosOptions = EXERCICIOS_POR_GRUPO.flatMap((g) =>
  g.exercicios.map((ex) => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    description: ex.descricao,
  }))
);
const exercicioDescriptionsMap = new Map(
  flatExerciciosOptions.map((opt) => [opt.value, opt.description])
);
const exerciciosOptions = EXERCICIOS_POR_GRUPO.map((grupo) => ({
  label: grupo.grupo,
  options: grupo.exercicios.map((ex) => ({
    value: ex.nomeExercicio,
    label: ex.nomeExercicio,
    keywords: [grupo.grupo],
  })),
}));

export function WorkoutEditor({
  onSave,
  treinoToEdit,
  onCancel,
}: {
  onSave: (treino: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => void;
  treinoToEdit: Treino | null;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [objetivo, setObjetivo] = useState(treinoToEdit?.objetivo || '');
  const [exercicios, setExercicios] = useState<Partial<Exercicio>[]>(
    treinoToEdit?.exercicios || []
  );

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

        // Se o campo alterado for o nome do exercício, busca e preenche a descrição.
        if (field === 'nomeExercicio' && typeof value === 'string') {
          return {
            ...ex,
            nomeExercicio: value,
            descricao: exercicioDescriptionsMap.get(value) || '', // Preenche a descrição
          };
        }
        return { ...ex, [field]: value };
      })
    );
  };

  const handleSaveTreino = () => {
    if (!objetivo || exercicios.length === 0 || exercicios.some((e) => !e.nomeExercicio)) {
      toast({
        title: 'Erro ao salvar',
        description: 'Preencha o objetivo e todos os exercícios antes de salvar.',
        variant: 'destructive',
      });
      return;
    }

    const novoTreino: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'> = {
      objetivo,
      exercicios: exercicios as Exercicio[],
      diaSemana: treinoToEdit ? treinoToEdit.diaSemana : null,
      dataCriacao: new Date().toISOString(),
    };
    onSave(novoTreino);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell />
            {treinoToEdit ? 'Editar Treino Pessoal' : 'Criar Novo Treino Pessoal'}
          </CardTitle>
          <CardDescription>
            Crie um plano de treino do zero ou ajuste um existente que você criou.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="objetivo">Nome/Objetivo do Treino</Label>
            <Input
              id="objetivo"
              placeholder="Ex: Treino de adaptação"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            <h3 className="font-medium">Exercícios</h3>
            {exercicios.map((exercicio, index) => (
              <div
                key={exercicio.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto] items-end gap-3 rounded-md border p-4"
              >
                <div className="grid gap-2">
                  {index === 0 && <Label className="md:hidden">Nome</Label>}
                  <Combobox
                    options={exerciciosOptions}
                    flatOptions={flatExerciciosOptions}
                    value={exercicio.nomeExercicio}
                    onChange={(value) =>
                      handleExercicioChange(exercicio.id!, 'nomeExercicio', value)
                    }
                    placeholder="Selecione..."
                    searchPlaceholder="Buscar exercício..."
                    notFoundMessage="Nenhum exercício encontrado."
                  />
                </div>
                <div className="grid gap-2">
                  {index === 0 && <Label className="md:hidden">Séries</Label>}
                  <Input
                    type="number"
                    className="w-full md:w-20"
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
                    className="w-full md:w-24"
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
                  aria-label="Remover exercício"
                  className="justify-self-end"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" onClick={handleAddExercicio}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Exercício Manualmente
            </Button>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            onClick={handleSaveTreino}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Save className="mr-2 h-4 w-4" />
            {treinoToEdit ? 'Salvar Alterações' : 'Salvar Novo Treino'}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
