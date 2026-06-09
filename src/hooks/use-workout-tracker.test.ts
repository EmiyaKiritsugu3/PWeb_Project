import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutTracker } from './use-workout-tracker';
import type { Treino } from '@/lib/definitions';

const mockTreino: Treino = {
  id: 'treino-uuid-123',
  alunoId: 'aluno-uuid-456',
  objetivo: 'Hipertrofia',
  diaSemana: 1,
  instrutorId: null,
  exercicios: [],
};

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((_index: number) => null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('useWorkoutTracker', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty checkedExercises when treino is null', () => {
    const { result } = renderHook(() => useWorkoutTracker(null));
    expect(result.current.checkedExercises).toEqual({});
  });

  it('should initialize with empty checkedExercises when no saved state exists', () => {
    const { result } = renderHook(() => useWorkoutTracker(mockTreino));
    expect(result.current.checkedExercises).toEqual({});
  });

  it('should load saved state from localStorage on mount', () => {
    const storageKey = `checkedExercises-2025-06-10-${mockTreino.id}`;
    const savedState = { 'ex-1': true, 'ex-2': false };
    localStorageMock.setItem(storageKey, JSON.stringify(savedState));

    const { result } = renderHook(() => useWorkoutTracker(mockTreino));
    expect(result.current.checkedExercises).toEqual(savedState);
    expect(localStorageMock.getItem).toHaveBeenCalledWith(storageKey);
  });

  it('should toggle exercise check state and persist to localStorage', () => {
    const { result } = renderHook(() => useWorkoutTracker(mockTreino));
    const storageKey = `checkedExercises-2025-06-10-${mockTreino.id}`;

    act(() => result.current.handleCheckChange('ex-1'));

    expect(result.current.checkedExercises).toEqual({ 'ex-1': true });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      storageKey,
      JSON.stringify({ 'ex-1': true })
    );
  });

  it('should toggle off a previously checked exercise', () => {
    const { result } = renderHook(() => useWorkoutTracker(mockTreino));

    act(() => result.current.handleCheckChange('ex-1'));
    expect(result.current.checkedExercises['ex-1']).toBe(true);

    act(() => result.current.handleCheckChange('ex-1'));
    expect(result.current.checkedExercises['ex-1']).toBe(false);
  });

  it('should not persist when treino is null', () => {
    const { result } = renderHook(() => useWorkoutTracker(null));

    act(() => result.current.handleCheckChange('ex-1'));
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('should track multiple exercises independently', () => {
    const { result } = renderHook(() => useWorkoutTracker(mockTreino));

    act(() => result.current.handleCheckChange('ex-1'));
    act(() => result.current.handleCheckChange('ex-2'));

    expect(result.current.checkedExercises).toEqual({ 'ex-1': true, 'ex-2': true });

    act(() => result.current.handleCheckChange('ex-1'));
    expect(result.current.checkedExercises).toEqual({ 'ex-1': false, 'ex-2': true });
  });

  it('should use date-based storage key', () => {
    const { result } = renderHook(() => useWorkoutTracker(mockTreino));
    const storageKey = `checkedExercises-2025-06-10-${mockTreino.id}`;

    act(() => result.current.handleCheckChange('ex-1'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(storageKey, expect.any(String));
  });
});
