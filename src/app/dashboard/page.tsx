import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      title: "Total de Alunos",
      value: stats.totalAlunos.toLocaleString("pt-BR"),
      icon: <Users className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />,
    },
    {
      title: "Matrículas Ativas",
      value: stats.matriculasAtivas.toLocaleString("pt-BR"),
      icon: <UserCheck className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />,
    },
    {
      title: "Inadimplentes",
      value: stats.alunosInadimplentes.toLocaleString("pt-BR"),
      icon: <UserX className="h-6 w-6 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />,
      isDestructive: true,
    },
    {
      title: "Faturamento Mensal",
      value: stats.faturamentoMensal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: <DollarSign className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="bg-card/30 backdrop-blur-md border border-primary/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(234,88,12,0.15)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-headline font-bold drop-shadow-sm ${
                  kpi.isDestructive ? "text-destructive" : ""
                }`}
              >
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-1">
        <DashboardCharts data={stats.crescimentoAnual} />
      </div>
    </>
  );
}
