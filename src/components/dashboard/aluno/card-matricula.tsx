import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Info, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Aluno } from '@/lib/definitions';

export function CardMatricula({ aluno }: { aluno: Aluno | null }) {
  if (!aluno) return null;

  const statusConfig = {
    ATIVA: {
      text: 'Matrícula Ativa',
      icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
      glow: 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    },
    INADIMPLENTE: {
      text: 'Pagamento Pendente',
      icon: <AlertCircle className="h-5 w-5 text-red-400" />,
      glow: 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    },
    INATIVA: {
      text: 'Matrícula Inativa',
      icon: <Info className="h-5 w-5 text-gray-400" />,
      glow: 'border-gray-500/30',
    },
  };

  const config = statusConfig[aluno.statusMatricula] || statusConfig.INATIVA;

  // Usa a data de vencimento injetada pelo servidor ou uma data fallback segura
  const dataVencimento = aluno.dataVencimento ? new Date(aluno.dataVencimento) : null;

  return (
    <Card glass className={cn('overflow-hidden', config.glow)}>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white/5 border border-white/10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Status do Plano
            </p>
            <h3 className="text-xl font-bold headline flex items-center gap-2">{config.text}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase">Vencimento</p>
          <p className="font-bold text-white/90">
            {dataVencimento ? dataVencimento.toLocaleDateString('pt-BR') : '--/--/----'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
