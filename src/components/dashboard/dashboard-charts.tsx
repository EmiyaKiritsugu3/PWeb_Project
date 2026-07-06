'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartDataPoint {
  mes: string;
  alunos: number;
}

interface DashboardChartsProps {
  data: ChartDataPoint[];
}

export function DashboardCharts({ data }: Readonly<DashboardChartsProps>) {
  return (
    <Card className="glass-card overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 glow-cyan">
      <CardHeader className="border-b border-white/5 bg-background/20 pb-4">
        <CardTitle className="font-headline tracking-wide font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase text-sm">
          Crescimento de Alunos (Últimos meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pl-2 pb-2 h-[200px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} maxBarSize={32}>
            <defs>
              <linearGradient id="neonCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.7 0.25 190)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="oklch(0.7 0.25 190)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="oklch(0.7 0.25 190 / 0.08)"
            />
            <XAxis
              dataKey="mes"
              stroke="oklch(0.7 0.1 230 / 0.5)"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              dy={12}
            />
            <YAxis
              stroke="oklch(0.7 0.1 230 / 0.5)"
              fontSize={11}
              fontWeight={700}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              dx={-12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'oklch(0.18 0.05 230 / 0.7)',
                borderColor: 'oklch(0.7 0.25 190 / 0.3)',
                borderRadius: '14px',
                backdropFilter: 'blur(24px)',
                boxShadow:
                  '0 20px 40px -15px oklch(0.15 0.05 230 / 0.5), 0 0 15px oklch(0.7 0.25 190 / 0.1)',
                color: 'oklch(0.95 0.01 230)',
                fontWeight: 700,
                border: '1px solid oklch(1 0 0 / 0.1)',
                padding: '12px 16px',
              }}
              itemStyle={{ color: 'oklch(0.7 0.25 190)', fontSize: '14px' }}
              cursor={{ fill: 'oklch(0.7 0.25 190 / 0.03)' }}
            />
            <Bar dataKey="alunos" fill="url(#neonCyan)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
