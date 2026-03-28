import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import FinanceiroClient from "./financeiro-client";

export const dynamic = 'force-dynamic';

export default async function FinanceiroPage() {
  // Fetch only students with INADIMPLENTE status
  const inadimplentes = await prisma.aluno.findMany({
    where: {
      statusMatricula: 'INADIMPLENTE'
    },
    select: {
      id: true,
      nomeCompleto: true,
      email: true,
      statusMatricula: true
    },
    orderBy: {
      nomeCompleto: 'asc'
    }
  });

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
            para reativar a matrícula e estender o vencimento em 30 dias.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FinanceiroClient initialInadimplentes={inadimplentes} />
        </CardContent>
      </Card>
    </>
  );
}
