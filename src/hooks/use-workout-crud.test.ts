import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWorkoutCRUD } from './use-workout-crud';
import type { Treino } from '@/lib/definitions';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

vi.mock('@/lib/actions/treinos', () => ({
  upsertTreinoAction: vi.fn(),
  updateTreinoDayAction: vi.fn(),
  deleteTreinoAction: vi.fn(),
}));

Object.defineProperty(globalThis, 'scrollTo', { value: vi.fn(), writable: true });

import {
  upsertTreinoAction,
  updateTreinoDayAction,
  deleteTreinoAction,
} from '@/lib/actions/treinos';

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
} as unknown as AppRouterInstance;

const mockNotify = {
  success: vi.fn(),
  error: vi.fn(),
};

const createMockTreino = (id: string, diaSemana: number | null = null): Treino => ({
  id,
  alunoId: 'aluno-1',
  objetivo: 'Hipertrofia',
  diaSemana,
  instrutorId: null,
  exercicios: [],
});

const defaultOptions = () => ({
  initialTreinos: [createMockTreino('t-1', 1), createMockTreino('t-2', 3)],
  userId: 'user-1',
  router: mockRouter,
  notify: mockNotify,
});

describe('useWorkoutCRUD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with provided treinos', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      expect(result.current.meusTreinos).toHaveLength(2);
    });

    it('should have form hidden by default', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      expect(result.current.isFormVisible).toBe(false);
    });

    it('should have no editing treino initially', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      expect(result.current.editingTreino).toBeNull();
    });

    it('should have alert closed initially', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      expect(result.current.isAlertOpen).toBe(false);
    });

    it('should have no deleting treino initially', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      expect(result.current.deletingTreino).toBeNull();
    });
  });

  describe('handleSave - create new', () => {
    it('should call upsertTreinoAction and refresh router on success', async () => {
      vi.mocked(upsertTreinoAction).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      const treinoData = {
        objetivo: 'Força',
        diaSemana: 2,
        exercicios: [],
      };

      await act(async () => {
        await result.current.handleSave(treinoData);
      });

      expect(upsertTreinoAction).toHaveBeenCalledWith({
        ...treinoData,
        alunoId: 'user-1',
      });
      expect(mockRouter.refresh).toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith('Novo treino salvo!');
      expect(result.current.isFormVisible).toBe(false);
    });

    it('should notify error when action returns failure', async () => {
      vi.mocked(upsertTreinoAction).mockResolvedValue({ success: false, error: 'DB error' });
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      await act(async () => {
        await result.current.handleSave({
          objetivo: 'Força',
          diaSemana: null,
          exercicios: [],
        });
      });

      expect(mockNotify.error).toHaveBeenCalledWith('Erro ao salvar', undefined, expect.any(Error));
    });
  });

  describe('handleSave - update existing', () => {
    it('should include editing treino id and not call router.refresh', async () => {
      vi.mocked(upsertTreinoAction).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      act(() => result.current.handleEdit(createMockTreino('t-1', 1)));

      await act(async () => {
        await result.current.handleSave({
          objetivo: 'Updated',
          diaSemana: 1,
          exercicios: [],
        });
      });

      expect(upsertTreinoAction).toHaveBeenCalledWith(
        expect.objectContaining({ id: 't-1', alunoId: 'user-1' })
      );
      expect(mockRouter.refresh).not.toHaveBeenCalled();
      expect(mockNotify.success).toHaveBeenCalledWith('Treino atualizado!');
    });
  });

  describe('handleEdit', () => {
    it('should set editingTreino and show form', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      const treino = createMockTreino('t-1');

      act(() => result.current.handleEdit(treino));

      expect(result.current.editingTreino).toEqual(treino);
      expect(result.current.isFormVisible).toBe(true);
    });

    it('should scroll to top', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      act(() => result.current.handleEdit(createMockTreino('t-1')));

      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('handleDayChange', () => {
    it('should update day and notify success', async () => {
      vi.mocked(updateTreinoDayAction).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      await act(async () => {
        await result.current.handleDayChange('t-1', '2');
      });

      expect(updateTreinoDayAction).toHaveBeenCalledWith('t-1', 2);
      expect(mockNotify.success).toHaveBeenCalledWith('Agenda atualizada!');
      expect(result.current.meusTreinos.find((t) => t.id === 't-1')?.diaSemana).toBe(2);
    });

    it('should set diaSemana to null when selecting "nenhum"', async () => {
      vi.mocked(updateTreinoDayAction).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      await act(async () => {
        await result.current.handleDayChange('t-1', 'nenhum');
      });

      expect(updateTreinoDayAction).toHaveBeenCalledWith('t-1', null);
      expect(result.current.meusTreinos.find((t) => t.id === 't-1')?.diaSemana).toBeNull();
    });

    it('should notify error when day is already occupied', async () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      await act(async () => {
        await result.current.handleDayChange('t-2', '1');
      });

      expect(mockNotify.error).toHaveBeenCalledWith(
        'Dia já ocupado',
        'Já existe outro treino agendado para este dia.'
      );
      expect(updateTreinoDayAction).not.toHaveBeenCalled();
    });

    it('should notify error on action failure', async () => {
      vi.mocked(updateTreinoDayAction).mockRejectedValue(new Error('Network'));
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      await act(async () => {
        await result.current.handleDayChange('t-1', '2');
      });

      expect(mockNotify.error).toHaveBeenCalledWith(
        'Erro ao atualizar agenda',
        undefined,
        expect.any(Error)
      );
    });
  });

  describe('openDeleteAlert', () => {
    it('should set deletingTreino and open alert', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      const treino = createMockTreino('t-1');

      act(() => result.current.openDeleteAlert(treino));

      expect(result.current.deletingTreino).toEqual(treino);
      expect(result.current.isAlertOpen).toBe(true);
    });
  });

  describe('handleDelete', () => {
    it('should delete treino and notify success', async () => {
      vi.mocked(deleteTreinoAction).mockResolvedValue({ success: true });
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      act(() => result.current.openDeleteAlert(createMockTreino('t-1')));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(deleteTreinoAction).toHaveBeenCalledWith('t-1');
      expect(mockNotify.success).toHaveBeenCalledWith('Treino excluído!');
      expect(result.current.meusTreinos).toHaveLength(1);
      expect(result.current.meusTreinos.find((t) => t.id === 't-1')).toBeUndefined();
      expect(result.current.isAlertOpen).toBe(false);
      expect(result.current.deletingTreino).toBeNull();
    });

    it('should do nothing when no deletingTreino', async () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(deleteTreinoAction).not.toHaveBeenCalled();
    });

    it('should notify error on action failure', async () => {
      vi.mocked(deleteTreinoAction).mockRejectedValue(new Error('DB'));
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));

      act(() => result.current.openDeleteAlert(createMockTreino('t-1')));

      await act(async () => {
        await result.current.handleDelete();
      });

      expect(mockNotify.error).toHaveBeenCalledWith(
        'Erro ao excluir',
        undefined,
        expect.any(Error)
      );
      expect(result.current.isAlertOpen).toBe(false);
    });
  });

  describe('setters', () => {
    it('should set isFormVisible via setIsFormVisible', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      act(() => result.current.setIsFormVisible(true));
      expect(result.current.isFormVisible).toBe(true);
    });

    it('should set editingTreino via setEditingTreino', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      const treino = createMockTreino('t-1');
      act(() => result.current.setEditingTreino(treino));
      expect(result.current.editingTreino).toEqual(treino);
    });

    it('should set isAlertOpen via setIsAlertOpen', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      act(() => result.current.setIsAlertOpen(true));
      expect(result.current.isAlertOpen).toBe(true);
    });

    it('should set deletingTreino via setDeletingTreino', () => {
      const { result } = renderHook(() => useWorkoutCRUD(defaultOptions()));
      const treino = createMockTreino('t-1');
      act(() => result.current.setDeletingTreino(treino));
      expect(result.current.deletingTreino).toEqual(treino);
    });
  });
});
