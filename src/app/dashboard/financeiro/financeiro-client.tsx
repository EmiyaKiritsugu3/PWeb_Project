'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { registrarPagamentoAction } from "@/lib/actions/financeiro";

interface AlunoFinanceiro {
  id: string;
  nomeCompleto: string;
  email: string;
  statusMatricula: string;
}

export default function FinanceiroClient({ initialInadimplentes }: { initialInadimplentes: AlunoFinanceiro[] }) {
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<AlunoFinanceiro | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleOpenAlert = (aluno: AlunoFinanceiro) => {
    setSelectedAluno(aluno);
    setIsAlertOpen(true);
  };

  const handleRegisterPayment = async () => {
    if (!selectedAluno) return;

    setIsPending(true);
    const result = await registrarPagamentoAction(selectedAluno.id);
    setIsPending(false);

    if (result.success) {
      toast({
        title: "Pagamento Registrado!",
        description: `A matrícula de ${selectedAluno.nomeCompleto} foi reativada.`,
        className: "bg-accent text-accent-foreground",
      });
    } else {
      toast({
        title: "Erro ao registrar pagamento",
        description: result.error || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }

    setIsAlertOpen(false);
    setSelectedAluno(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialInadimplentes.map((aluno) => (
            <TableRow key={aluno.id}>
              <TableCell className="font-medium">
                {aluno.nomeCompleto}
              </TableCell>
              <TableCell>{aluno.email}</TableCell>
              <TableCell>
                <Badge variant="destructive">{aluno.statusMatricula}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => handleOpenAlert(aluno)}
                  disabled={isPending}
                >
                  Registrar Pagamento
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {initialInadimplentes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Nenhum aluno inadimplente.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma o recebimento do pagamento da matrícula de <span className="font-bold">{selectedAluno?.nomeCompleto}</span>? Esta ação irá reativar a matrícula do aluno e estender o vencimento por 30 dias.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleRegisterPayment();
              }} 
              className="bg-accent hover:bg-accent/90"
              disabled={isPending}
            >
              {isPending ? "Processando..." : "Confirmar e Reativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
