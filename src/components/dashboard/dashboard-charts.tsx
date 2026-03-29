"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DashboardChartsProps {
  data: any[];
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <Card className="glass-card overflow-hidden border-white/5 hover:border-primary/30 transition-all duration-500 glow-cyan">
      <CardHeader className="border-b border-white/5 bg-background/20 pb-4">
        <CardTitle className="font-headline tracking-wide font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase text-sm">
          Crescimento de Alunos (Últimos meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 pl-2 pb-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="neonCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={1} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
            <XAxis
              dataKey="mes"
              stroke="#64748b"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
              dx={-10}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.8)",
                borderColor: "rgba(34, 211, 238, 0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 25px rgba(34, 211, 238, 0.15)",
                color: "#f8fafc",
                fontWeight: 600,
              }}
              itemStyle={{ color: "#22d3ee" }}
              cursor={{ fill: "rgba(34, 211, 238, 0.05)" }}
            />
            <Bar dataKey="alunos" fill="url(#neonCyan)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
