import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { exerciciosOptions, flatExerciciosOptions } from '@/lib/exercise-options';
import type { Exercicio } from '@/lib/definitions';

interface ExerciseNameFieldProps {
  exerciseId: string;
  value: string;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
  mode?: 'combobox' | 'input';
  showLabel?: boolean;
}

function ExerciseNameField({
  exerciseId,
  value,
  onUpdate,
  mode = 'combobox',
  showLabel,
}: ExerciseNameFieldProps) {
  return (
    <div className="grid gap-2">
      {showLabel && <Label className="md:hidden">Exercício</Label>}
      {mode === 'combobox' ? (
        <Combobox
          options={exerciciosOptions}
          flatOptions={flatExerciciosOptions}
          value={value}
          onChange={(v) => onUpdate(exerciseId, 'nomeExercicio', v)}
          placeholder="Selecione..."
          searchPlaceholder="Buscar..."
          notFoundMessage="Exercício não encontrado..."
        />
      ) : (
        <Input
          placeholder="Nome do exercício"
          value={value}
          onChange={(e) => onUpdate(exerciseId, 'nomeExercicio', e.target.value)}
        />
      )}
    </div>
  );
}

interface WorkoutExerciseRowProps {
  exercise: Partial<Exercicio>;
  index: number;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
  onRemove?: (id: string) => void;
  mode?: 'combobox' | 'input';
}

export function WorkoutExerciseRow({
  exercise,
  index,
  onUpdate,
  onRemove,
  mode = 'combobox',
}: WorkoutExerciseRowProps) {
  const showDelete = Boolean(onRemove);
  const gridCols = showDelete
    ? 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto]'
    : 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr]';
  const showLabel = index === 0;

  return (
    <div className={`grid ${gridCols} items-end gap-3`}>
      <ExerciseNameField
        exerciseId={exercise.id!}
        value={exercise.nomeExercicio ?? ''}
        onUpdate={onUpdate}
        mode={mode}
        showLabel={showLabel}
      />

      <div className="grid gap-2">
        {showLabel && <Label className="md:hidden">Séries</Label>}
        <Input
          type="number"
          className="w-20"
          value={exercise.series || ''}
          onChange={(e) => {
            const parsed = Number.parseInt(e.target.value, 10);
            onUpdate(exercise.id!, 'series', Number.isFinite(parsed) ? parsed : 0);
          }}
        />
      </div>

      <div className="grid gap-2">
        {showLabel && <Label className="md:hidden">Reps</Label>}
        <Input
          placeholder="10-12"
          className="w-24"
          value={exercise.repeticoes ?? ''}
          onChange={(e) => onUpdate(exercise.id!, 'repeticoes', e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        {showLabel && <Label className="md:hidden">Obs</Label>}
        <Input
          placeholder="Opcional"
          value={exercise.observacoes ?? ''}
          onChange={(e) => onUpdate(exercise.id!, 'observacoes', e.target.value)}
        />
      </div>

      {showDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove!(exercise.id!)}
          aria-label="Remover exercício"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
