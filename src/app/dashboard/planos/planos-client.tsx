'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useAppNotification } from '@/hooks/use-app-notification';
import { FormPlano, type PlanoFormValues } from '@/components/dashboard/planos/form-plano';
import { createPlanoAction, updatePlanoAction, deletePlanoAction } from '@/lib/actions/planos';
import { PageHeader } from '@/components/page-header';
import type { Plano } from '@/lib/definitions';

interface PlanosClientProps {
  initialPlanos: Plano[];
}

const DAYS_PER_MONTH = 30;

function formatDuration(dias: number) {
  if (dias === DAYS_PER_MONTH) return 'mês';
  if (dias % DAYS_PER_MONTH === 0) return `${dias / DAYS_PER_MONTH} meses`;
  return `${dias} dias`;
}

export function PlanosClient({ initialPlanos }: PlanosClientProps) {
  const router = useRouter();
  const notify = useAppNotification();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingPlano, setDeletingPlano] = useState<Plano | null>(null);

  const openFormForNew = () => {
    setEditingPlano(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setIsFormOpen(true);
  };

  const openDeleteAlert = (plano: Plano) => {
    setDeletingPlano(plano);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = async (data: PlanoFormValues) => {
    const result = editingPlano
      ? await updatePlanoAction(editingPlano.id, data)
      : await createPlanoAction(data);

    if (result.success) {
      notify.success(
        editingPlano ? 'Plano atualizado!' : 'Plano criado!',
        `${data.nome} foi salvo com sucesso.`
      );
      setIsFormOpen(false);
      setEditingPlano(null);
      router.refresh();
    } else {
      notify.error('Erro ao salvar', result.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingPlano) return;
    const result = await deletePlanoAction(deletingPlano.id);
    if (result.success) {
      notify.success('Plano excluído!', `${deletingPlano.nome} foi removido.`);
      router.refresh();
    } else {
      notify.error('Erro ao excluir', result.error);
    }
    setIsDeleteAlertOpen(false);
    setDeletingPlano(null);
  };

  return (
    <>
      <PageHeader
        title="Planos da Academia"
        description="Gerencie os planos de mensalidade oferecidos."
        actions={
          <Button onClick={openFormForNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Plano
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialPlanos.map((plano) => (
          <Card
            key={plano.id}
            className="glass-card group border-white/5 hover:border-primary/30 transition-all duration-300 flex flex-col"
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{plano.nome}</CardTitle>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {formatDuration(plano.duracaoDias)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-2xl font-bold mb-1">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(plano.preco)}
              </div>
            </CardContent>
            <CardFooter className="pt-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => openFormForEdit(plano)}
              >
                <Pencil className="mr-1 h-3 w-3" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => openDeleteAlert(plano)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <FormPlano
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        plano={editingPlano ?? undefined}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Plano</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o plano <strong>{deletingPlano?.nome}</strong>? Esta
              ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
