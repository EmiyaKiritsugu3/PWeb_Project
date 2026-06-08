import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { exerciciosOptions, flatExerciciosOptions } from '@/lib/exercise-options';
import type { Exercicio } from '@/lib/definitions';

interface GridFieldProps {
  label: string;
  showLabel: boolean;
  children: React.ReactNode;
}

function GridField({ label, showLabel, children }: GridFieldProps) {
  return (
    <div className="grid gap-2">
      {showLabel && <Label className="md:hidden">{label}</Label>}
      {children}
    </div>
  );
}

interface ExerciseNameFieldProps {
  exerciseId: string;
  value: string;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
  mode?: 'combobox' | 'input';
}

function ExerciseNameField({
  exerciseId,
  value,
  onUpdate,
  mode = 'combobox',
}: ExerciseNameFieldProps) {
  if (mode === 'combobox') {
    return (
      <Combobox
        options={exerciciosOptions}
        flatOptions={flatExerciciosOptions}
        value={value}
        onChange={(v) => onUpdate(exerciseId, 'nomeExercicio', v)}
        placeholder="Selecione..."
        searchPlaceholder="Buscar..."
        notFoundMessage="Exercicio nao encontrado..."
      />
    );
  }
  return (
    <Input
      placeholder="Nome do exercicio"
      value={value}
      onChange={(e) => onUpdate(exerciseId, 'nomeExercicio', e.target.value)}
    />
  );
}

interface WorkoutExerciseRowProps {
  exercise: Partial<Exercicio>;
  index: number;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
  onRemove?: (id: string) => void;
  mode?: 'combobox' | 'input';
}

function gridCols(showDelete: boolean) {
  return showDelete
    ? 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto]'
    : 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr]';
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label="Remover exercicio">
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}

function handleSeriesChange(
  id: string,
  value: string,
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void
) {
  const parsed = Number.parseInt(value, 10);
  onUpdate(id, 'series', Number.isFinite(parsed) ? parsed : 0);
}

function handleFieldChange(
  id: string,
  field: keyof Exercicio,
  value: string,
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void
) {
  onUpdate(id, field, value);
}

export function WorkoutExerciseRow({
  exercise,
  index,
  onUpdate,
  onRemove,
  mode = 'combobox',
}: WorkoutExerciseRowProps) {
  const showLabel = index === 0;

  return (
    <div className={`grid ${gridCols(Boolean(onRemove))} items-end gap-3`}>
      <GridField showLabel={showLabel} label="Exercicio">
        <ExerciseNameField
          exerciseId={exercise.id!}
          value={exercise.nomeExercicio ?? ''}
          onUpdate={onUpdate}
          mode={mode}
        />
      </GridField>

      <GridField showLabel={showLabel} label="Series">
        <Input
          type="number"
          className="w-20"
          value={exercise.series || ''}
          onChange={(e) => handleSeriesChange(exercise.id!, e.target.value, onUpdate)}
        />
      </GridField>

      <GridField showLabel={showLabel} label="Reps">
        <Input
          placeholder="10-12"
          className="w-24"
          value={exercise.repeticoes ?? ''}
          onChange={(e) => handleFieldChange(exercise.id!, 'repeticoes', e.target.value, onUpdate)}
        />
      </GridField>

      <GridField showLabel={showLabel} label="Obs">
        <Input
          placeholder="Opcional"
          value={exercise.observacoes ?? ''}
          onChange={(e) => handleFieldChange(exercise.id!, 'observacoes', e.target.value, onUpdate)}
        />
      </GridField>

      {onRemove && <DeleteButton onClick={() => onRemove(exercise.id!)} />}
    </div>
  );
}
