
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

export default function AlunosPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [alunos, setAlunos] = useState<Aluno[]>(ALUNOS);

  const handleAddAluno = (newAluno: Omit<Aluno, "id" | "dataCadastro" | "fotoUrl" | "statusMatricula">) => {
    const alunoComDefaults: Aluno = {
      ...newAluno,
      id: `${Date.now()}`,
      dataCadastro: new Date().toISOString().split('T')[0],
      fotoUrl: `https://picsum.photos/seed/${Date.now()}/100/100`,
      statusMatricula: 'ATIVA'
    }
    setAlunos(prevAlunos => [alunoComDefaults, ...prevAlunos]);
  }

  return (
    <>
      <PageHeader
        title="Gestão de Alunos"
        description="Cadastre, visualize e gerencie os alunos da sua academia."
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Cadastrar Aluno
          </Button>
        }
      />
      <FormAluno 
        isOpen={isFormOpen} 
        onOpenChange={setIsFormOpen}
        onSubmit={handleAddAluno}
      />
      <DataTable columns={columns} data={alunos} />
    </>
  );
}
