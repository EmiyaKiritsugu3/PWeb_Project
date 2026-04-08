import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAlunoDetalhes } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Dumbbell, Star, Flame, CalendarDays, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlunoDetalhesPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  ATIVA: 'default',
  INADIMPLENTE: 'destructive',
  INATIVA: 'secondary',
  VENCIDA: 'destructive',
};

function getInitials(name: string) {
  const parts = name.split(' ');
  if (parts.length > 1) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function formatMetodo(metodo: string) {
  const map: Record<string, string> = { PIX: 'PIX', DINHEIRO: 'Dinheiro', CARTAO: 'Cartão' };
  return map[metodo] ?? metodo;
}

export default async function AlunoDetalhesPage({ params }: AlunoDetalhesPageProps) {
  const { id } = await params;
  const aluno = await getAlunoDetalhes(id);

  if (!aluno) notFound();

  const matriculaAtiva = aluno.Matriculas.find((m) => m.status === 'ATIVA');
  const expNecessaria = aluno.nivel * 1500;
  const xpPercent = Math.min(Math.round((aluno.exp / expNecessaria) * 100), 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/alunos">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card border-white/5 lg:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={aluno.fotoUrl ?? undefined} alt={aluno.nomeCompleto} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {getInitials(aluno.nomeCompleto)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{aluno.nomeCompleto}</h1>
              <p className="text-sm text-muted-foreground">{aluno.email}</p>
            </div>
            <Badge variant={STATUS_VARIANT[aluno.statusMatricula] ?? 'secondary'}>
              {aluno.statusMatricula}
            </Badge>

            <div className="w-full grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
              <div className="flex flex-col items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-lg font-bold">Lv{aluno.nivel}</span>
                <span className="text-xs text-muted-foreground">Nível</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Flame className="h-4 w-4 text-orange-400" />
                <span className="text-lg font-bold">{aluno.streakDiasSeguidos}</span>
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Dumbbell className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold">{aluno.treinosNoMes}</span>
                <span className="text-xs text-muted-foreground">Treinos/mês</span>
              </div>
            </div>

            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{aluno.exp} XP</span>
                <span>{expNecessaria} XP</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </CardContent>

          <CardContent className="border-t border-white/5 pt-4 space-y-3">
            <div className="grid gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                CPF
              </span>
              <span>{aluno.cpf}</span>
            </div>
            {aluno.telefone && (
              <div className="grid gap-1 text-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Telefone
                </span>
                <span>{aluno.telefone}</span>
              </div>
            )}
            {aluno.dataNascimento && (
              <div className="grid gap-1 text-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Nascimento
                </span>
                <span>{format(new Date(aluno.dataNascimento), 'dd/MM/yyyy')}</span>
              </div>
            )}
            <div className="grid gap-1 text-sm">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Cadastro
              </span>
              <span>{format(new Date(aluno.dataCadastro), 'dd/MM/yyyy')}</span>
            </div>
            {matriculaAtiva && (
              <div className="grid gap-1 text-sm">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Plano Atual
                </span>
                <span className="font-medium text-primary">{matriculaAtiva.Plano.nome}</span>
                <span className="text-xs text-muted-foreground">
                  Vence em{' '}
                  {format(new Date(matriculaAtiva.dataVencimento), "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-4 w-4 text-primary" />
                Histórico de Matrículas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aluno.Matriculas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma matrícula registrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plano</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aluno.Matriculas.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.Plano.nome}</TableCell>
                        <TableCell>{format(new Date(m.dataInicio), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{format(new Date(m.dataVencimento), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Badge
                            variant={STATUS_VARIANT[m.status] ?? 'secondary'}
                            className="text-xs"
                          >
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="h-4 w-4 text-primary" />
                Últimos Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aluno.Pagamentos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aluno.Pagamentos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{format(new Date(p.dataPagamento), 'dd/MM/yyyy')}</TableCell>
                        <TableCell className="font-medium text-green-400">
                          {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell>{formatMetodo(p.metodo)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="h-4 w-4 text-primary" />
                Treinos Cadastrados ({aluno.Treinos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aluno.Treinos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum treino cadastrado para este aluno.
                </p>
              ) : (
                <div className="grid gap-3">
                  {aluno.Treinos.map((t) => {
                    const dias = [
                      'Domingo',
                      'Segunda',
                      'Terça',
                      'Quarta',
                      'Quinta',
                      'Sexta',
                      'Sábado',
                    ];
                    return (
                      <div
                        key={t.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-sm">{t.objetivo}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.diaSemana !== null ? dias[t.diaSemana] : 'Sem dia fixo'} •{' '}
                            {t.Exercicios.length} exercício(s)
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {format(new Date(t.dataCriacao), 'dd/MM/yyyy')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
