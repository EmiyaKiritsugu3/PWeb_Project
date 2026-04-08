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
import { useToast } from '@/hooks/use-toast';
import { FormPlano, type PlanoFormValues } from '@/components/dashboard/planos/form-plano';
import { createPlanoAction, updatePlanoAction, deletePlanoAction } from '@/lib/actions/planos';
import { PageHeader } from '@/components/page-header';
import type { Plano } from '@/lib/definitions';

interface PlanosClientProps {
  initialPlanos: Plano[];
}

function formatDuration(dias: number) {
  if (dias === 30) return 'mês';
  if (dias % 30 === 0) return `${dias / 30} meses`;
  return `${dias} dias`;
}

export function PlanosClient({ initialPlanos }: PlanosClientProps) {
  const router = useRouter();
  const { toast } = useToast();

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
      toast({
        title: editingPlano ? 'Plano atualizado!' : 'Plano criado!',
        description: `${data.nome} foi salvo com sucesso.`,
      });
      setIsFormOpen(false);
      setEditingPlano(null);
      router.refresh();
    } else {
      toast({ title: 'Erro ao salvar', description: result.error, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingPlano) return;
    const result = await deletePlanoAction(deletingPlano.id);
    if (result.success) {
      toast({
        title: 'Plano excluído!',
        description: `${deletingPlano.nome} foi removido.`,
        variant: 'destructive',
      });
      router.refresh();
    } else {
      toast({ title: 'Erro ao excluir', description: result.error, variant: 'destructive' });
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
              <p className="text-3xl font-bold">
                {plano.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                <span className="text-sm font-normal text-muted-foreground">
                  / {formatDuration(plano.duracaoDias)}
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Duração: {plano.duracaoDias} dias
              </p>
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => openFormForEdit(plano)}
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => openDeleteAlert(plano)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {initialPlanos.length === 0 && (
          <Card className="md:col-span-4 border-dashed border-white/10">
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum plano cadastrado. Clique em &ldquo;Adicionar Plano&rdquo; para começar.
            </CardContent>
          </Card>
        )}
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
            <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso excluirá permanentemente o plano{' '}
              <span className="font-bold">{deletingPlano?.nome}</span>. Alunos com matrículas ativas
              neste plano não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
