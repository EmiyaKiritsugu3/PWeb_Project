'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { columns } from '@/components/dashboard/alunos/columns';
import { DataTable } from '@/components/dashboard/alunos/data-table';
import { FormAluno } from '@/components/dashboard/alunos/form-aluno';
import { FormMatricula } from '@/components/dashboard/alunos/form-matricula';
import type { Aluno, Plano } from '@/lib/definitions';
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
import { useToast } from '@/hooks/use-toast';
import {
  createAlunoAction,
  updateAlunoAction,
  deleteAlunoAction,
  createMatriculaAction,
} from '@/lib/actions/alunos';

interface AlunosClientProps {
  initialAlunos: any[];
  planos: any[];
}

export function AlunosClient({ initialAlunos, planos }: AlunosClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<any | null>(null);

  const [isMatriculaFormOpen, setIsMatriculaFormOpen] = useState(false);
  const [matriculaAluno, setMatriculaAluno] = useState<any | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingAluno, setDeletingAluno] = useState<any | null>(null);

  const { toast } = useToast();

  const openFormForNew = () => {
    setEditingAluno(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (aluno: any) => {
    setEditingAluno(aluno);
    setIsFormOpen(true);
  };

  const openMatriculaForm = (aluno: any) => {
    setMatriculaAluno(aluno);
    setIsMatriculaFormOpen(true);
  };

  const openDeleteAlert = (aluno: any) => {
    setDeletingAluno(aluno);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    let result;
    if (editingAluno) {
      result = await updateAlunoAction(editingAluno.id, data);
    } else {
      result = await createAlunoAction(data);
    }

    if (result.success) {
      toast({
        title: editingAluno ? 'Aluno atualizado!' : 'Aluno cadastrado!',
        description: `${data.nomeCompleto} foi salvo com sucesso.`,
      });
      setIsFormOpen(false);
      setEditingAluno(null);
    } else {
      toast({
        title: 'Erro ao salvar',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAluno = async () => {
    if (!deletingAluno) return;

    const result = await deleteAlunoAction(deletingAluno.id);
    if (result.success) {
      toast({
        title: 'Aluno excluído!',
        description: `${deletingAluno.nomeCompleto} foi removido do sistema.`,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Erro ao excluir',
        description: result.error,
        variant: 'destructive',
      });
    }

    setIsDeleteAlertOpen(false);
    setDeletingAluno(null);
  };

  const handleMatriculaSubmit = async (aluno: any, plano: any) => {
    const result = await createMatriculaAction(aluno.id, plano.id);
    if (result.success) {
      toast({
        title: 'Matrícula realizada!',
        description: `${aluno.nomeCompleto} foi matriculado(a) no ${plano.nome}.`,
      });
      setIsMatriculaFormOpen(false);
      setMatriculaAluno(null);
    } else {
      toast({
        title: 'Erro na matrícula',
        description: result.error,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Alunos</h1>
          <p className="text-muted-foreground">
            Cadastre, visualize e gerencie os alunos da sua academia.
          </p>
        </div>
        <Button onClick={openFormForNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Cadastrar Aluno
        </Button>
      </div>

      <FormAluno
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        aluno={editingAluno || undefined}
      />

      <FormMatricula
        isOpen={isMatriculaFormOpen}
        onOpenChange={setIsMatriculaFormOpen}
        aluno={matriculaAluno}
        planos={planos}
        onSubmit={handleMatriculaSubmit}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o aluno{' '}
              <span className="font-bold">{deletingAluno?.nomeCompleto}</span> do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAluno}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable
        columns={columns({
          onEdit: openFormForEdit,
          onDelete: openDeleteAlert,
          onNewMatricula: openMatriculaForm,
        })}
        data={initialAlunos}
      />
    </>
  );
}
