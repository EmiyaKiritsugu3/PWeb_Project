
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
        { title: "Total de Alunos", value: '', icon: <Users className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />, isDestructive: false },
        { title: "Matrículas Ativas", value: '', icon: <UserCheck className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />, isDestructive: false },
        { title: "Inadimplentes", value: '', icon: <UserX className="h-6 w-6 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />, isDestructive: true },
        { title: "Faturamento Mensal", value: '', icon: <DollarSign className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />, isDestructive: false },
      ];
    }

    const totalAlunos = alunos?.length ?? 0;
    const matriculasAtivas = alunos?.filter(a => a.statusMatricula === 'ATIVA').length ?? 0;
    const alunosInadimplentes = alunos?.filter(a => a.statusMatricula === 'INADIMPLENTE').length ?? 0;

    return [
      {
        title: "Total de Alunos",
        value: totalAlunos.toLocaleString("pt-BR"),
        icon: <Users className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />,
      },
      {
        title: "Matrículas Ativas",
        value: matriculasAtivas.toLocaleString("pt-BR"),
        icon: <UserCheck className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />,
      },
      {
        title: "Inadimplentes",
        value: alunosInadimplentes.toLocaleString("pt-BR"),
        icon: <UserX className="h-6 w-6 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />,
        isDestructive: true,
      },
      {
        title: "Faturamento Mensal",
        value: DADOS_DASHBOARD.faturamentoMensal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        icon: <DollarSign className="h-6 w-6 text-primary drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />,
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
          <Card key={kpi.title} className="bg-card/30 backdrop-blur-md border border-primary/10 hover:border-primary/40 hover:shadow-[0_0_20px_rgba(234,88,12,0.15)] transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground/80">{kpi.title}</CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              {isLoading || !alunos ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div
                  className={`text-3xl font-headline font-bold drop-shadow-sm ${
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
        <Card className="bg-card/30 backdrop-blur-md border border-primary/10 hover:border-primary/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="font-headline tracking-wide font-semibold text-primary/90 drop-shadow-sm">Crescimento de Alunos (Últimos 12 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={DADOS_DASHBOARD.crescimentoAnual}>
                <defs>
                  <linearGradient id="neonOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
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
                        backgroundColor: 'rgba(9, 9, 11, 0.95)',
                        borderColor: 'hsl(var(--primary) / 0.3)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(8px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)'
                    }}
                    cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                 />
                <Bar dataKey="alunos" fill="url(#neonOrange)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
