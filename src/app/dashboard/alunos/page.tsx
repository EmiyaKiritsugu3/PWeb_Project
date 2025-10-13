
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PlusCircle } from "lucide-react";
import { columns } from "@/components/dashboard/alunos/columns";
import { DataTable } from "@/components/dashboard/alunos/data-table";
import { FormAluno } from "@/components/dashboard/alunos/form-aluno";
import { FormMatricula } from "@/components/dashboard/alunos/form-matricula";
import type { Aluno, Plano, Matricula } from "@/lib/definitions";
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
import { ALUNOS, PLANOS } from "@/lib/data"; // Usando dados estáticos

export default function AlunosPage() {
  // Estado local para simular o banco de dados
  const [alunos, setAlunos] = useState<Aluno[]>(ALUNOS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const [isMatriculaFormOpen, setIsMatriculaFormOpen] = useState(false);
  const [matriculaAluno, setMatriculaAluno] = useState<Aluno | null>(null);

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

  const openMatriculaForm = (aluno: Aluno) => {
    setMatriculaAluno(aluno);
    setIsMatriculaFormOpen(true);
  };

  const openDeleteAlert = (aluno: Aluno) => {
    setDeletingAluno(aluno);
    setIsDeleteAlertOpen(true);
  };

  const handleFormSubmit = (data: Omit<Aluno, "id" | "dataCadastro" | "fotoUrl" | "statusMatricula" | "biometriaHash">) => {
    if (editingAluno) {
      // Editar aluno existente
      const updatedAluno = { ...editingAluno, ...data };
      setAlunos(alunos.map(a => a.id === editingAluno.id ? updatedAluno : a));
      toast({
        title: "Aluno atualizado!",
        description: `${data.nomeCompleto} foi atualizado com sucesso.`,
      });
    } else {
      // Adicionar novo aluno
      const novoAluno: Aluno = {
        ...data,
        id: (alunos.length + 1).toString(), // ID simples para simulação
        dataCadastro: new Date().toISOString(),
        fotoUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
        statusMatricula: 'ATIVA',
        biometriaHash: "",
      };
      setAlunos([novoAluno, ...alunos]);
       toast({
        title: "Aluno cadastrado!",
        description: `${novoAluno.nomeCompleto} foi adicionado ao sistema.`,
      });
    }
    setIsFormOpen(false);
    setEditingAluno(null);
  };

  const handleDeleteAluno = () => {
    if (!deletingAluno) return;
    
    setAlunos(alunos.filter(a => a.id !== deletingAluno.id));
    
    toast({
        title: "Aluno excluído!",
        description: `${deletingAluno.nomeCompleto} foi removido do sistema.`,
    });
    setIsDeleteAlertOpen(false);
    setDeletingAluno(null);
  };

  const handleMatriculaSubmit = (aluno: Aluno, plano: Plano) => {
     // Simular a criação de uma matrícula
    const dataInicio = new Date();
    const dataVencimento = new Date();
    dataVencimento.setDate(dataInicio.getDate() + plano.duracaoDias);

    const novaMatricula: Matricula = {
      id: `mat-${Date.now()}`,
      alunoId: aluno.id,
      planoId: plano.id,
      dataInicio: dataInicio.toISOString(),
      dataVencimento: dataVencimento.toISOString(),
      status: "ATIVA",
    };

    // Atualizar o status do aluno
    setAlunos(alunos.map(a => a.id === aluno.id ? { ...a, statusMatricula: 'ATIVA' } : a));

    toast({
      title: "Matrícula realizada com sucesso!",
      description: `${aluno.nomeCompleto} foi matriculado(a) no ${plano.nome}.`,
      className: "bg-accent text-accent-foreground",
    });

    setIsMatriculaFormOpen(false);
    setMatriculaAluno(null);
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
       <FormMatricula
        isOpen={isMatriculaFormOpen}
        onOpenChange={setIsMatriculaFormOpen}
        aluno={matriculaAluno}
        planos={PLANOS}
        onSubmit={handleMatriculaSubmit}
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
        columns={columns({ onEdit: openFormForEdit, onDelete: openDeleteAlert, onNewMatricula: openMatriculaForm })} 
        data={alunos}
        isLoading={false} 
      />
    </>
  );
}
