
'use client';

import { useState, useEffect } from 'react';
import { Treino, Exercicio, SerieExecutada } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check, Timer } from 'lucide-react';
import { useTimer } from 'react-timer-hook';

// Props para o componente
interface WorkoutSessionProps {
  treino: Treino;
  onFinish: (historico: Omit<HistoricoTreino, 'id' | 'alunoId'>) => void;
  onCancel: () => void;
}

// Estado para cada exercício durante a sessão
type ExercicioEmSessao = {
  exercicioOriginal: Exercicio;
  seriesExecutadas: SerieExecutada[];
};

export function WorkoutSession({ treino, onFinish, onCancel }: WorkoutSessionProps) {
  const [exerciciosEmSessao, setExerciciosEmSessao] = useState<ExercicioEmSessao[]>([]);
  const [exercicioAtualIndex, setExercicioAtualIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Hook para o cronômetro de descanso
  const { seconds, minutes, isRunning, start, restart } = useTimer({ expiryTimestamp: new Date() });

  // Inicializa o estado da sessão quando o treino é carregado
  useEffect(() => {
    setStartTime(new Date());
    const exerciciosParaSessao = treino.exercicios.map((ex) => ({
      exercicioOriginal: ex,
      seriesExecutadas: Array.from({ length: ex.series }, (_, i) => ({
        id: `${ex.id}-serie-${i}`,
        serieNumero: i + 1,
        peso: null,
        repeticoesFeitas: null,
        concluido: false,
      })),
    }));
    setExerciciosEmSessao(exerciciosParaSessao);
  }, [treino]);

  const exercicioAtual = exerciciosEmSessao[exercicioAtualIndex];

  if (!exercicioAtual) {
    return <div>Carregando treino...</div>;
  }

  // --- Funções de Manipulação de Estado ---

  const handleSerieChange = (serieId: string, campo: 'peso' | 'repeticoesFeitas', valor: string) => {
    const valorNumerico = valor === '' ? null : parseInt(valor, 10);

    setExerciciosEmSessao(exerciciosEmSessao.map((ex, index) => {
      if (index !== exercicioAtualIndex) return ex;

      const seriesAtualizadas = ex.seriesExecutadas.map(serie =>
        serie.id === serieId ? { ...serie, [campo]: valorNumerico } : serie
      );

      return { ...ex, seriesExecutadas: seriesAtualizadas };
    }));
  };

  const handleSerieToggle = (serieId: string) => {
    let serieConcluida = false;
    setExerciciosEmSessao(exerciciosEmSessao.map((ex, index) => {
        if (index !== exercicioAtualIndex) return ex;

        const seriesAtualizadas = ex.seriesExecutadas.map(serie => {
            if (serie.id === serieId) {
                serieConcluida = !serie.concluido;
                return { ...serie, concluido: serieConcluida };
            }
            return serie;
        });
        return { ...ex, seriesExecutadas: seriesAtualizadas };
    }));

    if (serieConcluida) {
        const time = new Date();
        time.setSeconds(time.getSeconds() + 90); // Descanso de 90 segundos
        restart(time);
    }
  };

  const handleProximoExercicio = () => {
    if (exercicioAtualIndex < exerciciosEmSessao.length - 1) {
      setExercicioAtualIndex(exercicioAtualIndex + 1);
    }
  };

  const handleExercicioAnterior = () => {
    if (exercicioAtualIndex > 0) {
      setExercicioAtualIndex(exercicioAtualIndex - 1);
    }
  };

  const handleFinalizarTreino = () => {
    if (!startTime) return;

    const endTime = new Date();
    const duracaoMinutos = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const historico: Omit<HistoricoTreino, 'id' | 'alunoId'> = {
      treinoId: treino.id,
      dataExecucao: startTime.toISOString(),
      duracaoMinutos,
      exercicios: exerciciosEmSessao.map(ex => ({
        exercicioId: ex.exercicioOriginal.id,
        nomeExercicio: ex.exercicioOriginal.nomeExercicio,
        seriesExecutadas: ex.seriesExecutadas,
      })),
    };

    onFinish(historico);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">{exercicioAtual.exercicioOriginal.nomeExercicio}</CardTitle>
        <div className="text-center text-muted-foreground">
          Exercício {exercicioAtualIndex + 1} de {exerciciosEmSessao.length}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Descrição do Exercício Planejado */}
        <div className="text-center bg-secondary text-secondary-foreground rounded-lg p-3">
          <p className="font-bold">Planejado: {exercicioAtual.exercicioOriginal.series} séries x {exercicioAtual.exercicioOriginal.repeticoes} reps</p>
          {exercicioAtual.exercicioOriginal.observacoes && (
            <p className="text-sm">Obs: {exercicioAtual.exercicioOriginal.observacoes}</p>
          )}
        </div>

        {/* Tabela de Séries */}
        <div className="space-y-4">
          {exercicioAtual.seriesExecutadas.map((serie) => (
            <div key={serie.id} className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Série {serie.serieNumero}</Label>
              <Input
                type="number"
                placeholder="Peso (kg)"
                onChange={(e) => handleSerieChange(serie.id, 'peso', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Reps"
                onChange={(e) => handleSerieChange(serie.id, 'repeticoesFeitas', e.target.value)}
              />
              <Button
                size="icon"
                variant={serie.concluido ? 'default' : 'outline'}
                onClick={() => handleSerieToggle(serie.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Cronômetro de Descanso */}
        {isRunning && (
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <Timer />
                <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
            </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleExercicioAnterior} disabled={exercicioAtualIndex === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
        </Button>

        {exercicioAtualIndex === exerciciosEmSessao.length - 1 ? (
          <Button onClick={handleFinalizarTreino} className="bg-green-600 hover:bg-green-700">
            Finalizar Treino
          </Button>
        ) : (
          <Button onClick={handleProximoExercicio}>
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
