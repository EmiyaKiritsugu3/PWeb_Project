import { useState, useCallback } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type { Treino } from '@/lib/definitions';
import {
  upsertTreinoAction,
  updateTreinoDayAction,
  deleteTreinoAction,
} from '@/lib/actions/treinos';

interface UseWorkoutCRUDOptions {
  initialTreinos: Treino[];
  userId: string;
  router: AppRouterInstance;
  notify: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string, error?: unknown) => void;
  };
}

export function useWorkoutCRUD({ initialTreinos, userId, router, notify }: UseWorkoutCRUDOptions) {
  const [meusTreinos, setMeusTreinos] = useState<Treino[]>(initialTreinos);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTreino, setEditingTreino] = useState<Treino | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deletingTreino, setDeletingTreino] = useState<Treino | null>(null);

  const handleSave = useCallback(
    async (treinoData: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => {
      try {
        const res = await upsertTreinoAction({
          ...treinoData,
          ...(editingTreino ? { id: editingTreino.id } : {}),
          alunoId: userId,
        });

        if (res.success) {
          notify.success(editingTreino ? 'Treino atualizado!' : 'Novo treino salvo!');
          if (editingTreino) {
            setMeusTreinos((prev) =>
              prev.map((t) => (t.id === editingTreino.id ? { ...t, ...treinoData } : t))
            );
          } else {
            router.refresh();
          }
          setIsFormVisible(false);
          setEditingTreino(null);
        } else {
          throw new Error(res.error);
        }
      } catch (error) {
        notify.error('Erro ao salvar', undefined, error);
      }
    },
    [editingTreino, userId, router, notify]
  );

  const handleEdit = useCallback((treino: Treino) => {
    setEditingTreino(treino);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDayChange = useCallback(
    async (treinoId: string, dia: string) => {
      const novoDia = dia === 'nenhum' ? null : Number.parseInt(dia, 10);

      if (
        novoDia !== null &&
        meusTreinos.some((t) => t.diaSemana === novoDia && t.id !== treinoId)
      ) {
        notify.error('Dia já ocupado', 'Já existe outro treino agendado para este dia.');
        return;
      }

      try {
        const res = await updateTreinoDayAction(treinoId, novoDia);
        if (res.success) {
          notify.success('Agenda atualizada!');
          setMeusTreinos((prev) =>
            prev.map((t) => (t.id === treinoId ? { ...t, diaSemana: novoDia } : t))
          );
        }
      } catch (error) {
        notify.error('Erro ao atualizar agenda', undefined, error);
      }
    },
    [meusTreinos, notify]
  );

  const openDeleteAlert = useCallback((treino: Treino) => {
    setDeletingTreino(treino);
    setIsAlertOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deletingTreino) return;

    try {
      const res = await deleteTreinoAction(deletingTreino.id);
      if (res.success) {
        notify.success('Treino excluído!');
        setMeusTreinos((prev) => prev.filter((t) => t.id !== deletingTreino.id));
      }
    } catch (error) {
      notify.error('Erro ao excluir', undefined, error);
    }

    setIsAlertOpen(false);
    setDeletingTreino(null);
  }, [deletingTreino, notify]);

  return {
    meusTreinos,
    isFormVisible,
    setIsFormVisible,
    editingTreino,
    setEditingTreino,
    isAlertOpen,
    setIsAlertOpen,
    deletingTreino,
    setDeletingTreino,
    handleSave,
    handleEdit,
    handleDayChange,
    openDeleteAlert,
    handleDelete,
  };
}
