import { describe, it, expect } from 'vitest';
import { calculateTreinoRewards } from './gamificationService';

describe('GamificationService', () => {
  const mockAluno = {
    exp: 0,
    nivel: 1,
    streakDiasSeguidos: 0,
    ultimoTreinoData: null as Date | null,
    treinosNoMes: 0,
  };

  it('calculates base rewards for the first workout', () => {
    const completedSeries = 5;
    const result = calculateTreinoRewards(
      mockAluno,
      completedSeries,
      new Date('2026-04-22T12:00:00')
    );

    // 100 base + (5 series * 10) = 150 XP
    expect(result.novaExp).toBe(150);
    expect(result.novoNivel).toBe(1);
    expect(result.novoStreak).toBe(1);
    expect(result.novosTreinosNoMes).toBe(1);
  });

  it('applies streak bonus and increments level when XP threshold is met', () => {
    const alunoNearLevelUp = {
      ...mockAluno,
      exp: 1400,
      nivel: 1,
      streakDiasSeguidos: 1,
      ultimoTreinoData: new Date('2026-04-21T12:00:00'),
    };

    const completedSeries = 10; // 100 series XP
    const result = calculateTreinoRewards(
      alunoNearLevelUp,
      completedSeries,
      new Date('2026-04-22T12:00:00')
    );

    expect(result.novoNivel).toBe(2);
    expect(result.novaExp).toBe(150);
    expect(result.novoStreak).toBe(2);
  });

  it('resets streak if more than one day has passed', () => {
    const alunoWithOldStreak = {
      ...mockAluno,
      streakDiasSeguidos: 10,
      ultimoTreinoData: new Date('2026-04-10T12:00:00'),
    };

    const result = calculateTreinoRewards(alunoWithOldStreak, 5, new Date('2026-04-22T12:00:00'));

    expect(result.novoStreak).toBe(1);
  });

  it('resets monthly workouts count on a new month', () => {
    const alunoFromLastMonth = {
      ...mockAluno,
      treinosNoMes: 15,
      ultimoTreinoData: new Date('2026-03-31T12:00:00'),
    };

    const result = calculateTreinoRewards(alunoFromLastMonth, 5, new Date('2026-04-01T12:00:00'));

    expect(result.novosTreinosNoMes).toBe(1);
    expect(result.novoStreak).toBe(1); // Streak also resets if not consecutive
  });

  it('prevents multiple rewards on the same day', () => {
    const today = new Date('2026-04-22T12:00:00');
    const alunoAlreadyTrained = {
      ...mockAluno,
      exp: 500,
      ultimoTreinoData: today,
    };

    const result = calculateTreinoRewards(alunoAlreadyTrained, 10, today);

    expect(result.novaExp).toBe(500); // No XP added
    expect(result.novosTreinosNoMes).toBe(mockAluno.treinosNoMes);
  });

  it('handles zero completed series correctly', () => {
    const result = calculateTreinoRewards(mockAluno, 0, new Date('2026-04-22T12:00:00'));
    // 100 base + 0 series = 100 XP
    expect(result.novaExp).toBe(100);
  });

  it('starts a new streak if there was no previous workout', () => {
    const result = calculateTreinoRewards(mockAluno, 5, new Date('2026-04-22T12:00:00'));
    expect(result.novoStreak).toBe(1);
  });
});
