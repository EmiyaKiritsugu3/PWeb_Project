/**
 * Gamification Service
 * Logic for calculating XP, Levels, and Streaks.
 * Extracted from Server Actions for testability and consistency.
 */

export interface AlunoGamificationData {
  exp: number;
  nivel: number;
  streakDiasSeguidos: number;
  treinosNoMes: number;
  ultimoTreinoData: Date | null;
}

export interface GamificationResult {
  novaExp: number;
  novoNivel: number;
  novoStreak: number;
  novosTreinosNoMes: number;
}

export function calculateTreinoRewards(
  aluno: AlunoGamificationData,
  completedSeriesCount: number,
  today: Date = new Date()
): GamificationResult {
  const hojeStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(today);

  const dataUltimoTreino = aluno.ultimoTreinoData
    ? new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(
        new Date(aluno.ultimoTreinoData)
      )
    : null;

  let novaExp = aluno.exp;
  let novoNivel = aluno.nivel;
  let novoStreak = aluno.streakDiasSeguidos;
  let treinosNoMes = aluno.treinosNoMes;

  // Prevent multiple rewards on the same day
  if (dataUltimoTreino === hojeStr) {
    return {
      novaExp,
      novoNivel,
      novoStreak,
      novosTreinosNoMes: treinosNoMes,
    };
  }

  // 1. Base Rewards
  novaExp += 100; // 100 XP base per workout
  novaExp += completedSeriesCount * 10; // 10 XP per completed series

  // 2. Monthly count logic
  const mesAtualStr = hojeStr.split('-')[1];
  const mesUltimoTreinoStr = dataUltimoTreino ? dataUltimoTreino.split('-')[1] : null;

  if (mesAtualStr !== mesUltimoTreinoStr) {
    treinosNoMes = 1;
  } else {
    treinosNoMes += 1;
  }

  // 3. Streak Logic
  const ontem = new Date(today);
  ontem.setDate(ontem.getDate() - 1);
  const ontemStr = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'America/Sao_Paulo',
  }).format(ontem);

  if (dataUltimoTreino === ontemStr) {
    novoStreak += 1;
    novaExp += 50; // Streak bonus
  } else {
    novoStreak = 1; // Reset or start streak
  }

  // 4. Level Up Logic (Progressive threshold: Level * 1500)
  const expNecessaria = novoNivel * 1500;
  if (novaExp >= expNecessaria) {
    novaExp -= expNecessaria;
    novoNivel += 1;
  }

  return {
    novaExp,
    novoNivel,
    novoStreak,
    novosTreinosNoMes: treinosNoMes,
  };
}
