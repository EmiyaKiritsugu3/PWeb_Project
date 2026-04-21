import { prisma } from '@/lib/prisma';
import { requireAnyRole } from '@/lib/auth';
import { PageHeader } from '@/components/page-header';
import TreinosManagementClient from './treinos-client';
import type { Aluno } from '@/lib/definitions';

export default async function TreinosPage() {
  await requireAnyRole(['INSTRUTOR', 'GERENTE']);

  // Buscar todos os alunos para a seleção via Prisma
  const alunosPrisma = await prisma.aluno.findMany({
    orderBy: { nomeCompleto: 'asc' },
  });

  const alunosData: Aluno[] = alunosPrisma.map((a) => ({
    id: a.id,
    nomeCompleto: a.nomeCompleto,
    cpf: a.cpf,
    email: a.email,
    telefone: a.telefone || '',
    dataNascimento: a.dataNascimento?.toISOString() || '',
    dataCadastro: a.dataCadastro.toISOString(),
    statusMatricula: a.statusMatricula as 'ATIVA' | 'INADIMPLENTE' | 'INATIVA',
    fotoUrl: a.fotoUrl || '',
    nivel: a.nivel,
    exp: a.exp,
    streakDiasSeguidos: a.streakDiasSeguidos,
    treinosNoMes: a.treinosNoMes,
    ultimoTreinoData: a.ultimoTreinoData?.toISOString() || null,
  }));

  return (
    <>
      <PageHeader
        title="Gestão de Treinos"
        description="Monte treinos manualmente ou use a IA para gerar sugestões personalizadas para os alunos."
      />
      <TreinosManagementClient initialAlunos={alunosData} />
    </>
  );
}
