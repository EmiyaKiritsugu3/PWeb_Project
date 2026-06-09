'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { columns } from '@/components/dashboard/alunos/columns';
import { DataTable } from '@/components/dashboard/alunos/data-table';
import {
  FormAluno,
  type FormValues as AlunoFormValues,
} from '@/components/dashboard/alunos/form-aluno';
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
import { useAppNotification } from '@/hooks/use-app-notification';
import {
  createAlunoAction,
  updateAlunoAction,
  deleteAlunoAction,
  createMatriculaAction,
} from '@/lib/actions/alunos';

interface AlunosClientProps {
  initialAlunos: Aluno[];
  planos: Plano[];
}

export function AlunosClient({ initialAlunos, planos }: Readonly<AlunosClientProps>) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const [isMatriculaFormOpen, setIsMatriculaFormOpen] = useState(false);
  const [matriculaAluno, setMatriculaAluno] = useState<Aluno | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);

  const notify = useAppNotification();

  const openFormForNew = () => {
    setEditingAluno(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setIsFormOpen(true);
  };

  const openMatriculaForm = (aluno: Aluno) => {
    setMatriculaAluno(aluno);
    setIsMatriculaFormOpen(true);
  };

  const openDeleteAlert = (aluno: Aluno) => {
    setDeletingAluno(aluno);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = async (data: AlunoFormValues) => {
    let result;
    if (editingAluno) {
      result = await updateAlunoAction(editingAluno.id, data);
    } else {
      result = await createAlunoAction(data);
    }

    if (result.success) {
      notify.success(
        editingAluno ? 'Aluno atualizado!' : 'Aluno cadastrado!',
        `${data.nomeCompleto} foi salvo com sucesso.`
      );
      setIsFormOpen(false);
      setEditingAluno(null);
      router.refresh();
    } else {
      notify.error('Erro ao salvar', result.error);
    }
  };

  const handleDeleteAluno = async () => {
    if (!deletingAluno) return;

    const result = await deleteAlunoAction(deletingAluno.id);
    if (result.success) {
      notify.success('Aluno excluído!', `${deletingAluno.nomeCompleto} foi removido do sistema.`);
      router.refresh();
    } else {
      notify.error('Erro ao excluir', result.error);
    }

    setIsDeleteAlertOpen(false);
    setDeletingAluno(null);
  };

  const handleMatriculaSubmit = async (aluno: Aluno, plano: Plano) => {
    const result = await createMatriculaAction(aluno.id, plano.id);
    if (result.success) {
      notify.success(
        'Matrícula realizada!',
        `${aluno.nomeCompleto} foi matriculado(a) no ${plano.nome}.`
      );
      setIsMatriculaFormOpen(false);
      setMatriculaAluno(null);
      router.refresh();
    } else {
      notify.error('Erro na matrícula', result.error);
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

      <DataTable
        columns={columns({
          onEdit: openFormForEdit,
          onDelete: openDeleteAlert,
          onNewMatricula: openMatriculaForm,
        })}
        data={initialAlunos}
      />

      <FormAluno
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        aluno={editingAluno ?? undefined}
      />

      <FormMatricula
        isOpen={isMatriculaFormOpen}
        onOpenChange={setIsMatriculaFormOpen}
        onSubmit={handleMatriculaSubmit}
        aluno={matriculaAluno}
        planos={planos}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno
              <strong>{deletingAluno?.nomeCompleto}</strong> e removerá todos os seus dados do
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAluno}
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
