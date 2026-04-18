import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import AlunoDashboardClient from './dashboard-client';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default async function AlunoDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/aluno/login');
  }

  // 1. Buscar Aluno no PostgreSQL usando o email do Supabase Auth
  const aluno = await prisma.aluno.findUnique({
    where: { email: user.email },
    select: {
      id: true,
      nomeCompleto: true,
      fotoUrl: true,
      nivel: true,
      exp: true,
      streakDiasSeguidos: true,
      treinosNoMes: true,
      ultimoTreinoData: true,
      Matriculas: {
        where: { status: 'ATIVA' },
        take: 1,
        select: { id: true, status: true, dataVencimento: true, planoId: true },
      },
    },
  });

  if (!aluno) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <h2 className="text-2xl font-semibold leading-none tracking-tight">Sinto muito!</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Seu perfil de aluno não foi encontrado no novo sistema.</p>
            <p className="text-sm text-muted-foreground">
              Por favor, procure o administrador da academia para vincular seu email ({user.email}).
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Buscar Treino do Dia
  const today = new Date().getDay(); // 0-6 (Dom-Sab)

  const treinoDoDia = await prisma.treino.findFirst({
    where: {
      alunoId: aluno.id,
      diaSemana: today,
    },
    select: {
      id: true,
      objetivo: true,
      diaSemana: true,
      Exercicios: {
        select: {
          id: true,
          nomeExercicio: true,
          series: true,
          repeticoes: true,
          observacoes: true,
          descricao: true,
        },
      },
    },
  });

  // 3. Serializar objetos e injetar DTOs Calculados (Evitar erros de Symbol/Date)
  // [PID-SENTINEL] Defensive XP Serialization
  const xp = aluno.exp ?? 0;
  const nivel = aluno.nivel ?? 1;
  const xpToNextLevel = Math.max(nivel * 1500, 1500); // Floor at 1500 to avoid div by zero
  const progressPerc = Math.min(Math.round((xp / xpToNextLevel) * 100) || 0, 100);

  const serializedAluno = {
    ...JSON.parse(JSON.stringify(aluno)),
    xpToNextLevel,
    progressPerc,
    exp: xp,
    nivel: nivel,
  };

  const serializedTreino = treinoDoDia ? JSON.parse(JSON.stringify(treinoDoDia)) : null;

  return <AlunoDashboardClient aluno={serializedAluno} initialTreino={serializedTreino} />;
}
