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
import { PlusCircle, Save, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Treino, Exercicio } from '@/lib/definitions';
import { useWorkoutExercises } from '@/hooks/use-workout-exercises';
import { WorkoutExerciseRow } from '@/components/dashboard/aluno/workout-exercise-row';

export function WorkoutEditor({
  onSave,
  treinoToEdit,
  onCancel,
  compact = false,
}: Readonly<{
  onSave: (treino: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => void;
  treinoToEdit: Treino | null;
  onCancel: () => void;
  compact?: boolean;
}>) {
  const { toast } = useToast();
  const {
    objetivo,
    setObjetivo,
    exercicios,
    addObjective,
    removeExercise,
    updateExercise,
    hasValidationErrors,
  } = useWorkoutExercises(treinoToEdit?.objetivo || '', treinoToEdit?.exercicios || []);

  const handleSaveTreino = () => {
    if (hasValidationErrors()) {
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

  const content = (
    <>
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
            <div key={exercicio.id} className="rounded-md border p-4">
              <WorkoutExerciseRow
                exercise={exercicio}
                index={index}
                onUpdate={updateExercise}
                onRemove={removeExercise}
              />
            </div>
          ))}
          <Button variant="outline" onClick={addObjective}>
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
    </>
  );

  if (compact) {
    return <div className="grid gap-6">{content}</div>;
  }

  return (
    <div className="grid gap-6">
      <Card>{content}</Card>
    </div>
  );
}
