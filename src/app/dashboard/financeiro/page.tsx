
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { useCollection, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter, useUser } from "@/firebase";
import { Aluno } from "@/lib/definitions";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function FinanceiroPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);

  // Query to fetch only delinquent students
  const inadimplentesQuery = useMemoFirebase(
    () =>
      firestore && user
        ? query(collection(firestore, "alunos"), where("statusMatricula", "==", "INADIMPLENTE"))
        : null,
    [firestore, user]
  );

  const { data: inadimplentes, isLoading } = useCollection<Aluno>(inadimplentesQuery);

  const handleOpenAlert = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setIsAlertOpen(true);
  };

  const handleRegisterPayment = async () => {
    if (!selectedAluno || !firestore) return;

    const alunoRef = doc(firestore, "alunos", selectedAluno.id);

    // Update student status
    updateDoc(alunoRef, { statusMatricula: "ATIVA" })
      .then(() => {
          toast({
            title: "Pagamento Registrado!",
            description: `A matrícula de ${selectedAluno.nomeCompleto} foi reativada.`,
            className: "bg-accent text-accent-foreground",
          });
           // TODO: Create a payment record in a /pagamentos subcollection
          // TODO: Update the matricula's expiration date
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: alunoRef.path,
          operation: 'update',
          requestResourceData: { statusMatricula: "ATIVA" },
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          title: "Erro ao registrar pagamento",
          description: "Você não tem permissão para atualizar este aluno.",
          variant: "destructive"
        })
      });

    
    setIsAlertOpen(false);
    setSelectedAluno(null);
  };


  return (
    <>
      <PageHeader
        title="Gestão Financeira"
        description="Acompanhe pagamentos e matrículas inadimplentes."
      />
      <Card>
        <CardHeader>
          <CardTitle>Alunos Inadimplentes</CardTitle>
          <CardDescription>
            Lista de alunos com pagamentos pendentes. Registre um pagamento
            para reativar a matrícula.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
              {isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-36 ml-auto" /></TableCell>
                    </TableRow>
                ))
              )}
              {!isLoading && inadimplentes && inadimplentes.map((aluno) => (
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
                    >
                      Registrar Pagamento
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (!inadimplentes || inadimplentes.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum aluno inadimplente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Pagamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Você confirma o recebimento do pagamento da matrícula de <span className="font-bold">{selectedAluno?.nomeCompleto}</span>? Esta ação irá reativar a matrícula do aluno.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegisterPayment} className="bg-accent hover:bg-accent/90">
              Confirmar e Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
