import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALUNOS } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const inadimplentes = ALUNOS.filter(a => a.statusMatricula === 'INADIMPLENTE');

export default function FinanceiroPage() {
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
            Lista de alunos com pagamentos pendentes. Registre um pagamento para reativar a matrícula.
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
                    {inadimplentes.map(aluno => (
                        <TableRow key={aluno.id}>
                            <TableCell className="font-medium">{aluno.nomeCompleto}</TableCell>
                            <TableCell>{aluno.email}</TableCell>
                            <TableCell>
                                <Badge variant="destructive">{aluno.statusMatricula}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">Registrar Pagamento</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                     {inadimplentes.length === 0 && (
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
