
"use client";

import { useState } from "react";
import { collection } from "firebase/firestore";
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
import { PLANOS } from "@/lib/data"; // Planos ainda são estáticos por enquanto
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

export default function AlunosPage() {
  const firestore = useFirestore();

  // Busca os dados da coleção 'alunos' do Firestore em tempo real
  const alunosQuery = useMemoFirebase(() => collection(firestore, 'alunos'), [firestore]);
  const { data: alunos, isLoading } = useCollection<Aluno>(alunosQuery);

  // Estados para controlar os modais e diálogos
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
      // Lógica de Edição (será conectada ao Firebase no próximo passo)
      console.log("Editando aluno:", { ...editingAluno, ...data });
      toast({
        title: "Aluno atualizado! (Simulação)",
        description: `${data.nomeCompleto} foi atualizado com sucesso.`,
      });
    } else {
      // Lógica de Adição (será conectada ao Firebase no próximo passo)
      const novoAluno: Aluno = {
        ...data,
        id: (alunos?.length || 0 + 1).toString(), // ID simples para simulação
        dataCadastro: new Date().toISOString(),
        fotoUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
        statusMatricula: 'ATIVA',
      };
      console.log("Adicionando novo aluno:", novoAluno);
       toast({
        title: "Aluno cadastrado! (Simulação)",
        description: `${novoAluno.nomeCompleto} foi adicionado ao sistema.`,
      });
    }
    setIsFormOpen(false);
    setEditingAluno(null);
  };

  const handleDeleteAluno = () => {
    if (!deletingAluno) return;
    
    // Lógica de exclusão (será conectada ao Firebase)
    console.log("Excluindo aluno:", deletingAluno);
    
    toast({
        title: "Aluno excluído! (Simulação)",
        description: `${deletingAluno.nomeCompleto} foi removido do sistema.`,
    });
    setIsDeleteAlertOpen(false);
    setDeletingAluno(null);
  };

  const handleMatriculaSubmit = (aluno: Aluno, plano: Plano) => {
    // Lógica de matrícula (será conectada ao Firebase)
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
