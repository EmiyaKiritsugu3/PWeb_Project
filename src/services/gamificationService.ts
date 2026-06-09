/**
 * Gamification Service
 * Logic for calculating XP, Levels, and Streaks.
 * Extracted from Server Actions for testability and consistency.
 */

interface AlunoGamificationData {
  exp: number;
  nivel: number;
  streakDiasSeguidos: number;
  treinosNoMes: number;
  ultimoTreinoData: Date | null;
}

interface GamificationResult {
  novaExp: number;
  novoNivel: number;
  novoStreak: number;
  novosTreinosNoMes: number;
}

const BASE_XP_PER_WORKOUT = 100;
const XP_PER_COMPLETED_SERIE = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const STREAK_BONUS_XP = 50;
const LEVEL_UP_XP_PER_LEVEL = 1500;

export function calculateTreinoRewards(
  aluno: AlunoGamificationData,
  completedSeriesCount: number,
  today: Date = new Date()
): GamificationResult {
  // Use YYYY-MM-DD for day comparisons and YYYY-MM for month comparisons
  const formatSP = (date: Date) =>
    new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(date);

  const hojeStr = formatSP(today);
  const dataUltimoTreino = aluno.ultimoTreinoData
    ? formatSP(new Date(aluno.ultimoTreinoData))
    : null;

  let novaExp = aluno.exp;
  let novoNivel = aluno.nivel;
  let novoStreak = aluno.streakDiasSeguidos;
  let treinosNoMes = aluno.treinosNoMes;

  // Prevent multiple rewards on the same day (Idempotency)
  if (dataUltimoTreino === hojeStr) {
    return {
      novaExp,
      novoNivel,
      novoStreak,
      novosTreinosNoMes: treinosNoMes,
    };
  }

  // 1. Base Rewards
  novaExp += BASE_XP_PER_WORKOUT;
  novaExp += completedSeriesCount * XP_PER_COMPLETED_SERIE;

  // 2. Monthly count logic (Compare YYYY-MM to avoid year-boundary bugs)
  const mesAtualKey = hojeStr.slice(0, 7); // "YYYY-MM"
  const mesUltimoTreinoKey = dataUltimoTreino ? dataUltimoTreino.slice(0, 7) : null;

  if (mesAtualKey === mesUltimoTreinoKey) {
    treinosNoMes += 1;
  } else {
    treinosNoMes = 1;
  }

  // 3. Streak Logic
  // Derive "yesterday" using absolute timestamp to avoid local TZ arithmetic issues
  const ontemStr = formatSP(new Date(today.getTime() - MS_PER_DAY));

  if (dataUltimoTreino === ontemStr) {
    novoStreak += 1;
    novaExp += STREAK_BONUS_XP; // Streak bonus
  } else {
    novoStreak = 1; // Reset or start streak
  }

  // 4. Level Up Logic (Progressive threshold: Level * 1500)
  // Loop until XP is below threshold to support multiple level gains
  while (novaExp >= novoNivel * LEVEL_UP_XP_PER_LEVEL) {
    novaExp -= novoNivel * LEVEL_UP_XP_PER_LEVEL;
    novoNivel += 1;
  }

  return {
    novaExp,
    novoNivel,
    novoStreak,
    novosTreinosNoMes: treinosNoMes,
  };
}
