
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { DADOS_DASHBOARD } from "@/lib/data"; // Mantemos para faturamento e gráfico
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Aluno } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const alunosCollection = useMemoFirebase(() => 
    firestore && user ? collection(firestore, "alunos") : null, 
    [firestore, user]
  );
  
  const { data: alunos, isLoading } = useCollection<Aluno>(alunosCollection);

  const kpiData = useMemo(() => {
    if (isLoading || !alunos) {
      return [
        { title: "Total de Alunos", value: '', icon: <Users className="h-6 w-6 text-muted-foreground" />, isDestructive: false },
        { title: "Matrículas Ativas", value: '', icon: <UserCheck className="h-6 w-6 text-muted-foreground" />, isDestructive: false },
        { title: "Inadimplentes", value: '', icon: <UserX className="h-6 w-6 text-destructive" />, isDestructive: true },
        { title: "Faturamento Mensal", value: '', icon: <DollarSign className="h-6 w-6 text-muted-foreground" />, isDestructive: false },
      ];
    }

    const totalAlunos = alunos?.length ?? 0;
    const matriculasAtivas = alunos?.filter(a => a.statusMatricula === 'ATIVA').length ?? 0;
    const alunosInadimplentes = alunos?.filter(a => a.statusMatricula === 'INADIMPLENTE').length ?? 0;

    return [
      {
        title: "Total de Alunos",
        value: totalAlunos.toLocaleString("pt-BR"),
        icon: <Users className="h-6 w-6 text-muted-foreground" />,
      },
      {
        title: "Matrículas Ativas",
        value: matriculasAtivas.toLocaleString("pt-BR"),
        icon: <UserCheck className="h-6 w-6 text-muted-foreground" />,
      },
      {
        title: "Inadimplentes",
        value: alunosInadimplentes.toLocaleString("pt-BR"),
        icon: <UserX className="h-6 w-6 text-destructive" />,
        isDestructive: true,
      },
      {
        title: "Faturamento Mensal",
        value: DADOS_DASHBOARD.faturamentoMensal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        icon: <DollarSign className="h-6 w-6 text-muted-foreground" />,
      },
    ];
  }, [alunos, isLoading]);


  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu negócio."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              {isLoading || !alunos ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div
                  className={`text-2xl font-bold ${
                    kpi.isDestructive ? "text-destructive" : ""
                  }`}
                >
                  {kpi.value}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Alunos (Últimos 12 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={DADOS_DASHBOARD.crescimentoAnual}>
                <XAxis
                  dataKey="mes"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                 <Tooltip
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))'
                    }}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                 />
                <Bar dataKey="alunos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
