import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react';
import { getDashboardStats } from '@/lib/data';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      title: 'Total de Alunos',
      value: stats.totalAlunos.toLocaleString('pt-BR'),
      icon: <Users className="h-5 w-5" />,
      color: 'from-primary/30 to-blue-600/10',
      iconColor: 'text-primary',
      glow: 'glow-cyan',
    },
    {
      title: 'Matrículas Ativas',
      value: stats.matriculasAtivas.toLocaleString('pt-BR'),
      icon: <UserCheck className="h-5 w-5" />,
      color: 'from-cyan-400/30 to-blue-400/10',
      iconColor: 'text-cyan-300',
      glow: 'glow-cyan',
    },
    {
      title: 'Inadimplentes',
      value: stats.alunosInadimplentes.toLocaleString('pt-BR'),
      icon: <UserX className="h-5 w-5" />,
      color: 'from-destructive/30 to-background/10',
      iconColor: 'text-destructive',
      glow: 'shadow-destructive/10',
      isWeighted: true,
    },
    {
      title: 'Faturamento Mensal',
      value: stats.faturamentoMensal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'from-primary/40 to-cyan-300/10',
      iconColor: 'text-primary',
      glow: 'glow-cyan',
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
          <Card
            key={kpi.title}
            className={`glass-card group overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 ${kpi.glow}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                {kpi.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} ${kpi.iconColor} border border-white/5 group-hover:scale-110 transition-transform duration-300`}
              >
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-headline font-black tracking-tight drop-shadow-sm ${
                  kpi.isWeighted ? 'text-destructive-foreground/90' : 'text-foreground'
                }`}
              >
                {kpi.value}
              </div>
              <div className="mt-2 flex items-center text-xs font-bold text-primary uppercase tracking-tighter bg-primary/10 w-fit px-1.5 py-0.5 rounded border border-primary/20">
                <span className="sr-only">Aumento de </span>↑ 12% vs mês anterior
              </div>
            </CardContent>

            {/* Subtle bottom glow line */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r ${kpi.color.replaceAll('/20', '')}`}
            ></div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1">
        <DashboardCharts data={stats.crescimentoAnual} />
      </div>
    </div>
  );
}
