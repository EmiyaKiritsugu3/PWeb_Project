
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";
import { ALUNOS } from "@/lib/data";
import { columns } from "@/components/dashboard/alunos/columns";
import { DataTable } from "@/components/dashboard/alunos/data-table";
import { FormAluno } from "@/components/dashboard/alunos/form-aluno";
import type { Aluno } from "@/lib/definitions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>(ALUNOS);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [deletingAluno, setDeletingAluno] = useState<Aluno | null>(null);

  const { toast } = useToast();

  const openFormForNew = () => {
    setEditingAluno(null);
    setIsFormOpen(true);
  };

  const openFormForEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setIsFormOpen(true);
  };

  const openDeleteAlert = (aluno: Aluno) => {
    setDeletingAluno(aluno);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = (data: Omit<Aluno, "id" | "dataCadastro" | "fotoUrl" | "statusMatricula">) => {
    if (editingAluno) {
      // Editar aluno existente
      setAlunos(prevAlunos => 
        prevAlunos.map(a => 
          a.id === editingAluno.id ? { ...a, ...data } : a
        )
      );
    } else {
      // Adicionar novo aluno
      const alunoComDefaults: Aluno = {
        ...data,
        id: `${Date.now()}`,
        dataCadastro: new Date().toISOString().split('T')[0],
        fotoUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
        statusMatricula: 'ATIVA'
      };
      setAlunos(prevAlunos => [alunoComDefaults, ...prevAlunos]);
    }
  };

  const handleDeleteAluno = () => {
    if (!deletingAluno) return;
    setAlunos(prev => prev.filter(a => a.id !== deletingAluno.id));
    toast({
        title: "Aluno excluído!",
        description: `${deletingAluno.nomeCompleto} foi removido do sistema.`,
    });
    setIsDeleteAlertOpen(false);
    setDeletingAluno(null);
  };

  return (
    <>
      <PageHeader
        title="Gestão de Alunos"
        description="Cadastre, visualize e gerencie os alunos da sua academia."
        actions={
          <Button onClick={openFormForNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar Aluno
          </Button>
        }
      />
      <FormAluno 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        aluno={editingAluno || undefined}
      />
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o aluno <span className="font-bold">{deletingAluno?.nomeCompleto}</span> do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAluno} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <DataTable 
        columns={columns({ onEdit: openFormForEdit, onDelete: openDeleteAlert })} 
        data={alunos} 
      />
    </>
  );
}
