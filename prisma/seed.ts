/* eslint-disable no-console -- CLI seed script */

import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismaPg adapter type mismatch with pg@8 Pool
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Test1234!';

async function createAuthUser(
  supabase: SupabaseClient,
  email: string,
  password: string,
  id?: string
): Promise<void> {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    ...(id ? { id } : {}),
  });

  if (error) {
    if (
      error.message.includes('already been registered') ||
      error.message.includes('already exists')
    ) {
      console.log(`  Auth user ${email} already exists — skipped`);
    } else {
      console.warn(`  ⚠️  Auth user ${email}: ${error.message}`);
    }
  } else {
    console.log(`  ✅ Auth user created: ${email} (password: ${password})`);
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Limpar dados existentes (ordem reversa das dependências)
  await prisma.exercicio.deleteMany();
  await prisma.treino.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.funcionario.deleteMany();

  // IDs para consistência relacional
  const instrutorId = crypto.randomUUID();
  const planoIds = [
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
    crypto.randomUUID(),
  ];
  const alunoIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];

  const gerenteId = crypto.randomUUID();
  const recepcionistaId = crypto.randomUUID();

  // 2. Funcionários
  const funcionarios = [
    {
      id: instrutorId,
      nomeCompleto: 'João Instrutor',
      email: 'joao.instrutor@academia.com',
      role: 'INSTRUTOR' as const,
    },
    {
      id: gerenteId,
      nomeCompleto: 'Maria Gerente',
      email: 'maria.gerente@academia.com',
      role: 'GERENTE' as const,
    },
    {
      id: recepcionistaId,
      nomeCompleto: 'Carlos Recepcionista',
      email: 'carlos.recepcionista@academia.com',
      role: 'RECEPCIONISTA' as const,
    },
  ];

  await prisma.funcionario.createMany({ data: funcionarios });

  // 3. Planos
  const planos = [
    { id: planoIds[0], nome: 'Plano Mensal', preco: 120, duracaoDias: 30 },
    { id: planoIds[1], nome: 'Plano Trimestral', preco: 330, duracaoDias: 90 },
    { id: planoIds[2], nome: 'Plano Semestral', preco: 600, duracaoDias: 180 },
    { id: planoIds[3], nome: 'Plano Anual', preco: 1080, duracaoDias: 365 },
  ];

  for (const plano of planos) {
    await prisma.plano.create({ data: plano });
  }

  // 4. Alunos
  const alunos = [
    {
      id: alunoIds[0],
      nomeCompleto: 'Ana Silva',
      cpf: '111.222.333-44',
      email: 'ana.silva@example.com',
      telefone: '(11) 98765-4321',
      dataNascimento: new Date('1995-03-15'),
      dataCadastro: new Date('2023-01-10'),
      fotoUrl: 'https://i.imgur.com/8b1Z9T6.jpeg',
      statusMatricula: 'ATIVA' as const,
    },
    {
      id: alunoIds[1],
      nomeCompleto: 'Bruno Costa',
      cpf: '222.333.444-55',
      email: 'bruno.costa@example.com',
      telefone: '(21) 91234-5678',
      dataNascimento: new Date('1988-07-22'),
      dataCadastro: new Date('2022-11-20'),
      fotoUrl: 'https://i.imgur.com/nO2CSSO.jpeg',
      statusMatricula: 'INADIMPLENTE' as const,
    },
    {
      id: alunoIds[2],
      nomeCompleto: 'Carla Dias',
      cpf: '333.444.555-66',
      email: 'carla.dias@example.com',
      telefone: '(31) 95555-4444',
      dataNascimento: new Date('2001-11-30'),
      dataCadastro: new Date('2023-05-01'),
      fotoUrl: 'https://i.imgur.com/A2trT4c.jpeg',
      statusMatricula: 'ATIVA' as const,
    },
  ];

  for (const aluno of alunos) {
    await prisma.aluno.create({ data: aluno });
  }

  // 5. Treinos
  await prisma.treino.create({
    data: {
      id: crypto.randomUUID(),
      alunoId: alunoIds[0],
      instrutorId: instrutorId,
      objetivo: 'Treino A - Superiores (Ênfase Peito/Ombro)',
      diaSemana: 1,
      dataCriacao: new Date('2024-01-15'),
      Exercicios: {
        create: [
          {
            id: crypto.randomUUID(),
            nomeExercicio: 'Supino Reto com Barra',
            series: 4,
            repeticoes: '8-10',
            observacoes: 'Controlar a descida.',
            descricao: 'Deite-se em um banco reto...',
          },
          {
            id: crypto.randomUUID(),
            nomeExercicio: 'Desenvolvimento Militar com Barra',
            series: 3,
            repeticoes: '10-12',
            observacoes: 'Não curvar a lombar.',
            descricao: 'Em pé ou sentado...',
          },
        ],
      },
    },
  });

  // 6. E2E Test Users — cria registros Prisma para usuários de teste
  // (IDs fixos batem com prisma/seed-e2e.ts e tests/e2e/helpers/auth.ts)
  const e2eGerenteId = '550e8400-e29b-41d4-a716-000000000001';
  const e2eRecepcionistaId = '550e8400-e29b-41d4-a716-000000000002';
  const e2eInstrutorId = '550e8400-e29b-41d4-a716-000000000003';
  const e2eAlunoId = '550e8400-e29b-41d4-a716-000000000004';

  await prisma.funcionario.upsert({
    where: { id: e2eGerenteId },
    update: { role: Role.GERENTE },
    create: {
      id: e2eGerenteId,
      email: 'gerente@test.com',
      nomeCompleto: 'Gerente E2E',
      role: Role.GERENTE,
    },
  });
  await prisma.funcionario.upsert({
    where: { id: e2eRecepcionistaId },
    update: { role: Role.RECEPCIONISTA },
    create: {
      id: e2eRecepcionistaId,
      email: 'recep@test.com',
      nomeCompleto: 'Recepcionista E2E',
      role: Role.RECEPCIONISTA,
    },
  });
  await prisma.funcionario.upsert({
    where: { id: e2eInstrutorId },
    update: { role: Role.INSTRUTOR },
    create: {
      id: e2eInstrutorId,
      email: 'instrutor@test.com',
      nomeCompleto: 'Instrutor E2E',
      role: Role.INSTRUTOR,
    },
  });
  await prisma.aluno.upsert({
    where: { id: e2eAlunoId },
    update: {},
    create: {
      id: e2eAlunoId,
      email: 'aluno@test.com',
      nomeCompleto: 'Aluno E2E',
      cpf: '000.000.000-04',
      telefone: '11999990004',
    },
  });

  // 7. Supabase Auth Users — cria credenciais de login para todos os usuários
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey || !supabaseUrl) {
    console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL not set');
    console.log(
      '   Auth users NOT created. Set env vars and re-run seed to create login credentials.'
    );
  } else {
    console.log('🔐 Creating Supabase Auth users...');
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Seed staff
    for (const emp of funcionarios) {
      await createAuthUser(supabase, emp.email, DEFAULT_PASSWORD, emp.id);
    }
    // Seed alunos
    for (const aluno of alunos) {
      await createAuthUser(supabase, aluno.email, DEFAULT_PASSWORD, aluno.id);
    }
    // E2E test users
    await createAuthUser(supabase, 'gerente@test.com', DEFAULT_PASSWORD, e2eGerenteId);
    await createAuthUser(supabase, 'recep@test.com', DEFAULT_PASSWORD, e2eRecepcionistaId);
    await createAuthUser(supabase, 'instrutor@test.com', DEFAULT_PASSWORD, e2eInstrutorId);
    await createAuthUser(supabase, 'aluno@test.com', DEFAULT_PASSWORD, e2eAlunoId);
  }

  console.log('✅ Seed complete!');
}

try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
