"use client";

import { useState } from "react";
import { addDoc, collection, doc, updateDoc, deleteDoc } from "firebase/firestore";
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
import { PLANOS, ALUNOS as mockAlunos } from "@/lib/data"; // Planos ainda são estáticos por enquanto
import { useCollection, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";


export default function AlunosPage() {
  const firestore = useFirestore();

  // Temporariamente usando dados mockados para consistência
  const [alunos, setAlunos] = useState<Aluno[]>(mockAlunos as Aluno[]);
  const isLoading = false;

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

  const handleFormSubmit = async (data: Omit<Aluno, "id" | "dataCadastro" | "fotoUrl" | "biometriaHash">) => {
     // Lógica de simulação com o estado local
    if (editingAluno) {
      setAlunos(alunos.map(a => a.id === editingAluno.id ? { ...a, ...data } : a));
      toast({
          title: "Aluno atualizado! (Simulação)",
          description: `${data.nomeCompleto} foi atualizado com sucesso.`,
      });
    } else {
      const novoAluno: Aluno = {
        ...data,
        id: `aluno-${Date.now()}`,
        dataCadastro: new Date().toISOString(),
        fotoUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
      };
      setAlunos([novoAluno, ...alunos]);
      toast({
          title: "Aluno cadastrado! (Simulação)",
          description: `${novoAluno.nomeCompleto} foi adicionado ao sistema.`,
      });
    }
    
    setIsFormOpen(false);
    setEditingAluno(null);
  };

  const handleDeleteAluno = async () => {
    if (!deletingAluno) return;
    
    setAlunos(alunos.filter(a => a.id !== deletingAluno.id));
    
    toast({
        title: "Aluno excluído! (Simulação)",
        description: `${deletingAluno.nomeCompleto} foi removido do sistema.`,
    });

    setIsDeleteAlertOpen(false);
    setDeletingAluno(null);
  };

  const handleMatriculaSubmit = (aluno: Aluno, plano: Plano) => {
    console.log(`Matriculando ${aluno.nomeCompleto} no plano ${plano.nome}`);

    toast({
      title: "Matrícula realizada com sucesso! (Simulação)",
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
        data={alunos || []}
        isLoading={isLoading} 
      />
    </>
  );
}
