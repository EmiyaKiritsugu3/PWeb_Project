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
      icon: <Users className="h-5 w-5" />,
      color: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-400",
      glow: "shadow-cyan-500/10",
    },
    {
      title: "Matrículas Ativas",
      value: stats.matriculasAtivas.toLocaleString("pt-BR"),
      icon: <UserCheck className="h-5 w-5" />,
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400",
      glow: "shadow-emerald-500/10",
    },
    {
      title: "Inadimplentes",
      value: stats.alunosInadimplentes.toLocaleString("pt-BR"),
      icon: <UserX className="h-5 w-5" />,
      color: "from-red-500/20 to-rose-500/20",
      iconColor: "text-rose-400",
      glow: "shadow-rose-500/10",
      isDestructive: true,
    },
    {
      title: "Faturamento Mensal",
      value: stats.faturamentoMensal.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      icon: <DollarSign className="h-5 w-5" />,
      color: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      glow: "shadow-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <PageHeader
        title="Dashboard"
        description="Bem-vindo ao centro de comando da Five Star Gym."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className={`glass-card group overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 ${kpi.glow}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} ${kpi.iconColor} border border-white/5 group-hover:scale-110 transition-transform duration-300`}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-headline font-black tracking-tight drop-shadow-sm ${
                  kpi.isDestructive ? "text-rose-500" : "text-foreground"
                }`}
              >
                {kpi.value}
              </div>
              <div className="mt-2 flex items-center text-[10px] font-bold text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 w-fit px-1.5 py-0.5 rounded">
                ↑ 12% vs mês anterior
              </div>
            </CardContent>
            
            {/* Subtle bottom glow line */}
            <div className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r ${kpi.color.replace('/20', '')}`}></div>
          </Card>
        ))}
      </div>
      
      <div className="mt-6 grid grid-cols-1">
        <DashboardCharts data={stats.crescimentoAnual} />
      </div>
    </div>
  );
}
