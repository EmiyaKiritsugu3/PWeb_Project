import { PageHeader } from '@/components/page-header';
import { getDashboardStats } from '@/lib/data';
import { KpiCard } from './_components/kpi-card';
import { DashboardChartsMulti } from '@/components/dashboard/dashboard-charts-multi';
import { Users, UserCheck, UserX, DollarSign } from 'lucide-react';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const kpis = [
    {
      title: 'Total de Alunos',
      value: stats.totalAlunos.toLocaleString('pt-BR'),
      delta: stats.deltas.alunos,
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Matrículas Ativas',
      value: stats.matriculasAtivas.toLocaleString('pt-BR'),
      delta: stats.deltas.novos,
      icon: <UserCheck className="h-5 w-5" />,
    },
    {
      title: 'Inadimplentes',
      value: stats.alunosInadimplentes.toLocaleString('pt-BR'),
      delta: stats.deltas.inadimplentes,
      icon: <UserX className="h-5 w-5" />,
    },
    {
      title: 'Faturamento Recente',
      value: stats.faturamentoMensal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      delta: stats.deltas.receita,
      icon: <DollarSign className="h-5 w-5" />,
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
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            delta={kpi.delta}
            icon={kpi.icon}
          />
        ))}
      </div>

      <DashboardChartsMulti
        matriculasPorMes={stats.matriculasPorMes}
        receitaPorMes={stats.receitaPorMes}
        matriculasPorPlano={stats.matriculasPorPlano}
      />
    </div>
  );
}
