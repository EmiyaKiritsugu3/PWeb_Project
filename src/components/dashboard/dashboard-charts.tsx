"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface DashboardChartsProps {
  data: any[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <Card className="bg-card/30 backdrop-blur-md border border-primary/10 hover:border-primary/20 transition-all duration-300">
      <CardHeader>
        <CardTitle className="font-headline tracking-wide font-semibold text-primary/90 drop-shadow-sm">
          Crescimento de Alunos (Últimos meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="neonOrange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
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
                backgroundColor: "rgba(9, 9, 11, 0.95)",
                borderColor: "hsl(var(--primary) / 0.3)",
                borderRadius: "8px",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
              }}
              cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
            />
            <Bar dataKey="alunos" fill="url(#neonOrange)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
