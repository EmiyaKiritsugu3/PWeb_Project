'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EmptyState } from '@/app/dashboard/_components/empty-state';
import { CalendarOff } from 'lucide-react';
import type { MonthTotal, PlanTotal } from '@/lib/definitions';

interface Props {
  matriculasPorMes: MonthTotal[];
  receitaPorMes: MonthTotal[];
  matriculasPorPlano: PlanTotal[];
}

export function DashboardChartsMulti({
  matriculasPorMes,
  receitaPorMes,
  matriculasPorPlano,
}: Readonly<Props>) {
  const isEmpty = !matriculasPorMes.length && !receitaPorMes.length && !matriculasPorPlano.length;
  if (isEmpty) {
    return (
      <EmptyState
        testId="charts-empty"
        icon={<CalendarOff className="h-16 w-16 text-muted-foreground/50" />}
        title="Sem histórico ainda"
        description="Assim que houver matrículas ou pagamentos, os gráficos aparecem aqui."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="glass-card overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 glow-cyan">
        <CardHeader className="border-b border-white/5 bg-background/20 pb-4">
          <CardTitle className="font-headline tracking-wide font-black uppercase text-sm text-foreground">
            Matrículas por mês
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pl-2 pb-2 h-[280px]">
          <div role="img" aria-label="Gráfico de matrículas por mês" className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matriculasPorMes} maxBarSize={32}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="color-mix(in oklch, var(--color-primary) 8%, transparent)"
                />
                <XAxis
                  dataKey="mes"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  dy={12}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  dx={-12}
                />
                <Tooltip
                  cursor={{ fill: 'color-mix(in oklch, var(--color-primary) 3%, transparent)' }}
                  contentStyle={{
                    background: 'var(--background-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 glow-cyan">
        <CardHeader className="border-b border-white/5 bg-background/20 pb-4">
          <CardTitle className="font-headline tracking-wide font-black uppercase text-sm text-foreground">
            Faturamento por mês
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pl-2 pb-2 h-[280px]">
          <div role="img" aria-label="Gráfico de faturamento por mês" className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={receitaPorMes} maxBarSize={32}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="color-mix(in oklch, var(--color-primary) 8%, transparent)"
                />
                <XAxis
                  dataKey="mes"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  dy={12}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  dx={-12}
                />
                <Tooltip
                  cursor={{ fill: 'color-mix(in oklch, var(--color-primary) 3%, transparent)' }}
                  contentStyle={{
                    background: 'var(--background-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Bar dataKey="total" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card overflow-hidden border-white/5 hover:border-gold/30 transition-all duration-500 col-span-1 lg:col-span-2">
        <CardHeader className="border-b border-white/5 bg-background/20 pb-4">
          <CardTitle className="font-headline tracking-wide font-black uppercase text-sm text-foreground">
            Distribuição de matrículas por plano
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pl-2 pb-2 h-[280px]">
          <div
            role="img"
            aria-label="Distribuição de matrículas por plano"
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={matriculasPorPlano} maxBarSize={32}>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="color-mix(in oklch, var(--color-gold) 8%, transparent)"
                />
                <XAxis
                  dataKey="plano"
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  dy={12}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                  dx={-12}
                />
                <Tooltip
                  cursor={{ fill: 'color-mix(in oklch, var(--color-gold) 3%, transparent)' }}
                  contentStyle={{
                    background: 'var(--background-glass)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '14px',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Bar dataKey="total" fill="var(--color-gold)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
