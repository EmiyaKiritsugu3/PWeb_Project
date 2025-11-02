
"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { Aluno } from "@/lib/definitions";
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceiroPage() {
  const firestore = useFirestore();

  // Cria uma query para buscar apenas alunos inadimplentes
  const inadimplentesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, "alunos"), where("statusMatricula", "==", "INADIMPLENTE"))
        : null,
    [firestore]
  );

  const { data: inadimplentes, isLoading } = useCollection<Aluno>(inadimplentesQuery);

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
    </>
  );
}
