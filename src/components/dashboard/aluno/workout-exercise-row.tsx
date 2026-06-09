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

function GridField({ label, showLabel, children }: Readonly<GridFieldProps>) {
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
}: Readonly<ExerciseNameFieldProps>) {
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

type GridMode = 'readonly' | 'deletable';

function gridCols(mode: GridMode) {
  return mode === 'deletable'
    ? 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto]'
    : 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr]';
}

function DeleteButton({ onClick }: Readonly<{ onClick: () => void }>) {
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

interface SeriesFieldProps {
  exerciseId: string;
  series: number | undefined | null;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
}

function SeriesField({ exerciseId, series, onUpdate }: Readonly<SeriesFieldProps>) {
  return (
    <Input
      type="number"
      className="w-20"
      value={series || ''}
      onChange={(e) => handleSeriesChange(exerciseId, e.target.value, onUpdate)}
    />
  );
}

interface RepsFieldProps {
  exerciseId: string;
  repeticoes: string | undefined | null;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
}

function RepsField({ exerciseId, repeticoes, onUpdate }: Readonly<RepsFieldProps>) {
  return (
    <Input
      placeholder="10-12"
      className="w-24"
      value={repeticoes ?? ''}
      onChange={(e) => handleFieldChange(exerciseId, 'repeticoes', e.target.value, onUpdate)}
    />
  );
}

interface ObsFieldProps {
  exerciseId: string;
  observacoes: string | undefined | null;
  onUpdate: (id: string, field: keyof Exercicio, value: string | number) => void;
}

function ObsField({ exerciseId, observacoes, onUpdate }: Readonly<ObsFieldProps>) {
  return (
    <Input
      placeholder="Opcional"
      value={observacoes ?? ''}
      onChange={(e) => handleFieldChange(exerciseId, 'observacoes', e.target.value, onUpdate)}
    />
  );
}

interface RemoveFieldProps {
  exerciseId: string;
  onRemove: (id: string) => void;
}

function RemoveField({ exerciseId, onRemove }: Readonly<RemoveFieldProps>) {
  return <DeleteButton onClick={() => onRemove(exerciseId)} />;
}

export function WorkoutExerciseRow({
  exercise,
  index,
  onUpdate,
  onRemove,
  mode = 'combobox',
}: Readonly<WorkoutExerciseRowProps>) {
  const showLabel = index === 0;
  const exerciseId = exercise.id!;

  return (
    <div className={`grid ${gridCols(onRemove ? 'deletable' : 'readonly')} items-end gap-3`}>
      <GridField showLabel={showLabel} label="Exercicio">
        <ExerciseNameField
          exerciseId={exerciseId}
          value={exercise.nomeExercicio ?? ''}
          onUpdate={onUpdate}
          mode={mode}
        />
      </GridField>

      <GridField showLabel={showLabel} label="Series">
        <SeriesField exerciseId={exerciseId} series={exercise.series} onUpdate={onUpdate} />
      </GridField>

      <GridField showLabel={showLabel} label="Reps">
        <RepsField exerciseId={exerciseId} repeticoes={exercise.repeticoes} onUpdate={onUpdate} />
      </GridField>

      <GridField showLabel={showLabel} label="Obs">
        <ObsField exerciseId={exerciseId} observacoes={exercise.observacoes} onUpdate={onUpdate} />
      </GridField>

      {onRemove && <RemoveField exerciseId={exerciseId} onRemove={onRemove} />}
    </div>
  );
}
