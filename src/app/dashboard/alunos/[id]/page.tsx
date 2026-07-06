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

type Aluno = Awaited<ReturnType<typeof getAlunoDetalhes>>;

const STATUS_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  ATIVA: 'default',
  INADIMPLENTE: 'destructive',
  INATIVA: 'secondary',
  VENCIDA: 'destructive',
};

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function getInitials(name: string) {
  const parts = name.split(' ');
  if (parts.length > 1) return `${parts[0][0]}${parts.at(-1)![0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function formatMetodo(metodo: string) {
  const map: Record<string, string> = { PIX: 'PIX', DINHEIRO: 'Dinheiro', CARTAO: 'Cartão' };
  return map[metodo] ?? metodo;
}

function StatItem({
  icon,
  value,
  label,
}: Readonly<{
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}>) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function InfoField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="grid gap-1 text-sm">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}

function XpProgressBar({ exp, nivel }: Readonly<{ exp: number; nivel: number }>) {
  const expNecessaria = nivel * 1500;
  const xpPercent = Math.min(Math.round((exp / expNecessaria) * 100), 100);

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{exp} XP</span>
        <span>{expNecessaria} XP</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
          style={{ width: `${xpPercent}%` }}
        />
      </div>
    </div>
  );
}

function ProfileDetailsSection({ aluno }: Readonly<{ aluno: NonNullable<Aluno> }>) {
  const matriculaAtiva = aluno.Matriculas.find((m) => m.status === 'ATIVA');

  return (
    <CardContent className="border-t border-white/5 pt-4 space-y-3">
      <InfoField label="CPF" value={aluno.cpf} />
      {aluno.telefone && <InfoField label="Telefone" value={aluno.telefone} />}
      {aluno.dataNascimento && (
        <InfoField
          label="Nascimento"
          value={format(new Date(aluno.dataNascimento), 'dd/MM/yyyy')}
        />
      )}
      <InfoField label="Cadastro" value={format(new Date(aluno.dataCadastro), 'dd/MM/yyyy')} />
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
  );
}

function AlunoProfileCard({ aluno }: Readonly<{ aluno: NonNullable<Aluno> }>) {
  return (
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
          <StatItem
            icon={<Star className="h-4 w-4 text-yellow-400" />}
            value={`Lv${aluno.nivel}`}
            label="Nível"
          />
          <StatItem
            icon={<Flame className="h-4 w-4 text-orange-400" />}
            value={aluno.streakDiasSeguidos}
            label="Streak"
          />
          <StatItem
            icon={<Dumbbell className="h-4 w-4 text-primary" />}
            value={aluno.treinosNoMes}
            label="Treinos/mês"
          />
        </div>

        <XpProgressBar exp={aluno.exp} nivel={aluno.nivel} />
      </CardContent>

      <ProfileDetailsSection aluno={aluno} />
    </Card>
  );
}

function MatriculasTable({
  matriculas,
}: Readonly<{ matriculas: NonNullable<Aluno>['Matriculas'] }>) {
  return (
    <Card className="glass-card border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4 text-primary" />
          Histórico de Matrículas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matriculas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma matrícula registrada.</p>
        ) : (
          <>
            <div className="md:hidden grid gap-3">
              {matriculas.map((m) => (
                <Card key={m.id} className="p-4">
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Plano</dt>
                    <dd className="font-medium">{m.Plano.nome}</dd>
                    <dt className="text-muted-foreground">Início</dt>
                    <dd>{format(new Date(m.dataInicio), 'dd/MM/yyyy')}</dd>
                    <dt className="text-muted-foreground">Vencimento</dt>
                    <dd>{format(new Date(m.dataVencimento), 'dd/MM/yyyy')}</dd>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <Badge variant={STATUS_VARIANT[m.status] ?? 'secondary'} className="text-xs">
                        {m.status}
                      </Badge>
                    </dd>
                  </dl>
                </Card>
              ))}
            </div>
            <div className="hidden md:block">
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
                  {matriculas.map((m) => (
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PagamentosTable({
  pagamentos,
}: Readonly<{ pagamentos: NonNullable<Aluno>['Pagamentos'] }>) {
  return (
    <Card className="glass-card border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4 text-primary" />
          Últimos Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pagamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p>
        ) : (
          <>
            <div className="md:hidden grid gap-3">
              {pagamentos.map((p) => (
                <Card key={p.id} className="p-4">
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Data</dt>
                    <dd>{format(new Date(p.dataPagamento), 'dd/MM/yyyy')}</dd>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="font-medium text-green-400">
                      {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </dd>
                    <dt className="text-muted-foreground">Método</dt>
                    <dd>{formatMetodo(p.metodo)}</dd>
                  </dl>
                </Card>
              ))}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentos.map((p) => (
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TreinosList({ treinos }: Readonly<{ treinos: NonNullable<Aluno>['Treinos'] }>) {
  return (
    <Card className="glass-card border-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Dumbbell className="h-4 w-4 text-primary" />
          Treinos Cadastrados ({treinos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {treinos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum treino cadastrado para este aluno.</p>
        ) : (
          <div className="grid gap-3">
            {treinos.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-sm">{t.objetivo}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.diaSemana === null ? 'Sem dia fixo' : DIAS_SEMANA[t.diaSemana]} •{' '}
                    {t.Exercicios.length} exercício(s)
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {format(new Date(t.dataCriacao), 'dd/MM/yyyy')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AlunoDetalhesPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlunoDetalhesPage({ params }: Readonly<AlunoDetalhesPageProps>) {
  const { id } = await params;
  const aluno = await getAlunoDetalhes(id);

  if (!aluno) notFound();

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
        <AlunoProfileCard aluno={aluno} />

        <div className="lg:col-span-2 space-y-6">
          <MatriculasTable matriculas={aluno.Matriculas} />
          <PagamentosTable pagamentos={aluno.Pagamentos} />
          <TreinosList treinos={aluno.Treinos} />
        </div>
      </div>
    </div>
  );
}
