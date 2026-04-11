'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, Zap, Target, Award } from 'lucide-react';
import type { Treino, Aluno, Exercicio } from '@/lib/definitions';
import { finalizarTreinoAction } from '@/lib/actions/alunos';
import { useToast } from '@/hooks/use-toast';
import { CircularProgress } from '@/components/ui/circular-progress';

import { ExercicioViewer } from '@/components/dashboard/aluno/exercicio-viewer';
import { CardMatricula } from '@/components/dashboard/aluno/card-matricula';
import { CardTreino } from '@/components/dashboard/aluno/card-treino';
import { CardFeedback } from '@/components/dashboard/aluno/card-feedback';

interface AlunoDashboardClientProps {
  aluno: Aluno;
  initialTreino: Treino | null;
}

export default function AlunoDashboardClient({ aluno, initialTreino }: AlunoDashboardClientProps) {
  const { toast } = useToast();

  const [feedback, setFeedback] = useState<{ title: string; message: string } | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null);

  const handleViewExercicio = (exercicio: Exercicio) => {
    setSelectedExercicio(exercicio);
    setIsViewerOpen(true);
  };

  const handleFinishTraining = async (completedExercises: string[]) => {
    if (!initialTreino) return;
    setIsFeedbackLoading(true);
    setFeedback(null);

    try {
      const exerciseNames = completedExercises
        .map((id) => initialTreino.exercicios?.find((ex) => ex.id === id)?.nomeExercicio)
        .filter((name): name is string => !!name);

      // IA Feedback (Fail-safe block)
      try {
        const { generateWorkoutFeedback } = await import('@/ai/flows/workout-feedback-flow');
        const aiResult = await generateWorkoutFeedback({
          goal: initialTreino.objetivo,
          completedExercises: exerciseNames,
          totalExercises: initialTreino.exercicios?.length || 0,
        });
        setFeedback(aiResult);
      } catch (aiError) {
        console.error('AI Feedback Error:', aiError);
        toast({
          title: 'Feedback indisponível',
          description: 'Sincronizando treino sem o comentário da IA.',
        });
      }

      // Main Sincronization Action
      const result = await finalizarTreinoAction(initialTreino.id);
      if (result.success) {
        toast({
          title: 'Treino Sincronizado!',
          description: '+500 XP adicinados ao seu perfil.',
          className: 'glass-card border-cyan-500/50',
        });
      } else {
        toast({ title: 'Erro de conexão', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Action Error:', error);
      toast({ title: 'Erro ao salvar treino', variant: 'destructive' });
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  const xpToNextLevel = aluno.xpToNextLevel as number;
  const progressPerc = aluno.progressPerc as number;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-20 bg-black min-h-screen">
      <ExercicioViewer
        exercicio={selectedExercicio}
        isOpen={isViewerOpen}
        onOpenChange={setIsViewerOpen}
      />

      {/* Header / Hero Section */}
      <motion.div
        className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div>
          <h1 className="text-4xl md:text-6xl font-black headline tracking-tighter text-white">
            FALA,{' '}
            <span className="text-cyan-400">{aluno.nomeCompleto.split(' ')[0].toUpperCase()}!</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Bora subir de nível hoje?</p>
        </div>

        <div className="flex gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card
              glass
              className="px-6 py-4 flex items-center gap-4 bg-[#18181B] border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow"
            >
              <div className="text-center">
                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">
                  Streak
                </p>
                <p className="text-2xl font-mono font-bold tracking-tight text-orange-500">
                  {aluno.streakDiasSeguidos}🔥
                </p>
              </div>
            </Card>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card
              glass
              className="px-6 py-4 flex items-center gap-4 bg-[#18181B] border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow"
            >
              <div className="text-center">
                <p className="text-[10px] uppercase text-zinc-400 font-bold tracking-widest">
                  Treinos/Mês
                </p>
                <p className="text-2xl font-mono font-bold tracking-tight text-cyan-400">
                  {aluno.treinosNoMes}
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0 },
          animate: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
      >
        {/* Main Content: Training */}
        <motion.div
          className="lg:col-span-8 flex flex-col gap-8"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            },
          }}
        >
          <CardTreino
            treino={initialTreino}
            onFinishTraining={handleFinishTraining}
            isFeedbackLoading={isFeedbackLoading}
            onViewExercicio={handleViewExercicio}
          />
          <CardFeedback feedback={feedback} isLoading={isFeedbackLoading} />
        </motion.div>

        {/* Sidebar: Progress & Achievements */}
        <motion.div
          className="lg:col-span-4 flex flex-col gap-8"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: {
              opacity: 1,
              y: 0,
              transition: { type: 'spring', stiffness: 300, damping: 20 },
            },
          }}
        >
          {/* Progress Ring Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card
              glass
              className="bg-[#18181B] p-6 border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <CircularProgress
                  value={progressPerc}
                  size="lg"
                  strokeWidth={10}
                  showValue
                  gradient="cyan"
                  label="Level Progress"
                />
                <div className="mt-6">
                  <h3 className="text-3xl font-mono font-bold tracking-tight text-white">
                    NÍVEL {aluno.nivel}
                  </h3>
                  <p className="text-sm text-zinc-400 font-bold mt-1">
                    {aluno.exp} / {xpToNextLevel} <span className="text-cyan-400">XP</span>
                  </p>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-6" />
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <TrendingUp className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
                    <p className="text-[10px] uppercase text-zinc-400 font-bold italic">
                      Meta Semanal
                    </p>
                    <p className="text-lg font-mono font-bold tracking-tight text-cyan-400">80%</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-[10px] uppercase text-zinc-400 font-bold italic">
                      Power Index
                    </p>
                    <p className="text-lg font-mono font-bold tracking-tight text-cyan-400">752</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Trophy Room (Gamification Step) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Card
              glass
              className="p-6 bg-[#18181B] border-white/10 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold tracking-tight headline flex items-center gap-2 text-white">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  CONQUISTAS
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] uppercase font-bold text-amber-500"
                >
                  Ver Todas
                </Button>
              </div>
              <div className="flex justify-around gap-2">
                <div className="flex flex-col items-center gap-1 opacity-100 group cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center glow-gold text-amber-500">
                    <Award className="h-8 w-8" />
                  </div>
                  <span className="text-[8px] font-bold uppercase text-amber-500 text-center">
                    Iniciante Elite
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40 grayscale group cursor-pointer hover:opacity-70 transition-all">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Target className="h-8 w-8" />
                  </div>
                  <span className="text-[8px] font-bold uppercase text-center text-zinc-400">
                    Mestre da Constância
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40 grayscale group cursor-pointer hover:opacity-70 transition-all">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Zap className="h-8 w-8" />
                  </div>
                  <span className="text-[8px] font-bold uppercase text-center text-zinc-400">
                    Fisioculturista
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          <CardMatricula aluno={aluno} />
        </motion.div>
      </motion.div>
    </div>
  );
}
