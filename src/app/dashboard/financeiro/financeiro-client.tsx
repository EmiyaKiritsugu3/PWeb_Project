'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppNotification } from '@/hooks/use-app-notification';
import { registrarPagamentoAction } from '@/lib/actions/financeiro';

interface AlunoFinanceiro {
  id: string;
  nomeCompleto: string;
  email: string;
  statusMatricula: string;
}

export default function FinanceiroClient({
  initialInadimplentes,
}: {
  initialInadimplentes: AlunoFinanceiro[];
}) {
  const router = useRouter();
  const notify = useAppNotification();
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
      notify.success(
        'Pagamento Registrado!',
        `A matrícula de ${selectedAluno.nomeCompleto} foi reativada.`
      );
      router.refresh();
    } else {
      notify.error('Erro ao registrar pagamento', result.error || 'Ocorreu um erro inesperado.');
    }

    setIsAlertOpen(false);
    setSelectedAluno(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Aluno</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialInadimplentes.map((aluno) => (
            <TableRow key={aluno.id}>
              <TableCell className="font-medium">{aluno.nomeCompleto}</TableCell>
              <TableCell>{aluno.email}</TableCell>
              <TableCell>
                <Badge variant="destructive">Inadimplente</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => handleOpenAlert(aluno)}>
                  Registrar Pagamento
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {initialInadimplentes.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                Não há alunos inadimplentes no momento.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma o recebimento do pagamento de{' '}
              <strong>{selectedAluno?.nomeCompleto}</strong>? Esta ação reativará a matrícula e
              permitirá o acesso ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegisterPayment} disabled={isPending}>
              {isPending ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
