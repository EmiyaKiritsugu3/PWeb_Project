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

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.title}
            className={`glass-card group overflow-hidden border-white/5 transition-all duration-200 active:scale-[0.98] md:hover:border-primary/30 md:duration-500 md:hover:-translate-y-1 ${kpi.glow}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2 md:p-6">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                {kpi.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${kpi.color} ${kpi.iconColor} border border-white/5 md:group-hover:scale-110 transition-transform duration-300`}
              >
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div
                className={`text-2xl md:text-3xl font-headline font-black tracking-tight drop-shadow-sm ${
                  kpi.isWeighted ? 'text-destructive-foreground/90' : 'text-foreground'
                }`}
              >
                {kpi.value}
              </div>
              {/* ponytail: trend badge removed — getDashboardStats has no prior-period data; fake "↑ 12%" misleads. Re-add when data layer exposes deltas. */}
            </CardContent>

            {/* Subtle bottom glow line — reuses card gradient directly */}
            <div
              className={`absolute bottom-0 left-0 h-1 w-0 md:group-hover:w-full transition-all duration-300 md:duration-700 bg-gradient-to-r ${kpi.color}`}
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
