/**
 * E2E Test Seed — Five Star Academy
 *
 * Creates deterministic test users for Playwright E2E tests.
 * Requires local Supabase stack running: `npm run supabase:start`
 * Run with: npm run seed:e2e
 *
 * UUIDs are fixed so tests can reference them directly.
 * Credentials MUST match tests/e2e/helpers/auth.ts.
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY env var is required. Run: npm run supabase:start && npm run env:pull'
  );
}
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const E2E_PASSWORD = process.env.E2E_DEFAULT_PASSWORD || 'Test1234!';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL env var is required. Run: npm run supabase:start && npm run env:pull'
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismaPg adapter has a type mismatch with pg@8 Pool; upstream issue
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// Fixed UUIDs — used in E2E tests to reference specific users.
// Credentials MUST match tests/e2e/helpers/auth.ts
export const E2E_USERS = {
  gerente: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'gerente@test.com',
    password: E2E_PASSWORD,
    role: Role.GERENTE,
    nomeCompleto: 'Gerente E2E',
  },
  recepcionista: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'recep@test.com',
    password: E2E_PASSWORD,
    role: Role.RECEPCIONISTA,
    nomeCompleto: 'Recepcionista E2E',
  },
  instrutor: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'instrutor@test.com',
    password: E2E_PASSWORD,
    role: Role.INSTRUTOR,
    nomeCompleto: 'Instrutor E2E',
  },
  aluno: {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'aluno@test.com',
    password: E2E_PASSWORD,
    cpf: '000.000.000-04',
    nomeCompleto: 'Aluno E2E',
    telefone: '11999990004',
  },
} as const;

async function purgeAuthUsers(emails: string[]): Promise<void> {
  // Deleting via SQL ensures we remove any existing user regardless of their UUID,
  // so that admin.createUser can recreate them with the fixed deterministic IDs.
  await pool.query('DELETE FROM auth.users WHERE email = ANY($1::text[])', [emails]);
}

async function createAuthUser(id: string, email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.admin.createUser({
    user_metadata: {},
    email,
    password,
    email_confirm: true,
    id,
  });

  if (error) {
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  }
}

async function seed(): Promise<void> {
  console.log('Seeding E2E test users...');

  // Purge existing auth users so fixed UUIDs are always honoured
  const allEmails = Object.values(E2E_USERS).map((u) => u.email);
  await purgeAuthUsers(allEmails);
  console.log('  Purged existing auth users.');

  // Create Supabase Auth users
  for (const user of [E2E_USERS.gerente, E2E_USERS.recepcionista, E2E_USERS.instrutor]) {
    await createAuthUser(user.id, user.email, user.password);
    console.log(`  Auth user created: ${user.email}`);
  }
  await createAuthUser(E2E_USERS.aluno.id, E2E_USERS.aluno.email, E2E_USERS.aluno.password);
  console.log(`  Auth user created: ${E2E_USERS.aluno.email}`);

  // Upsert Funcionarios (admin staff)
  for (const user of [E2E_USERS.gerente, E2E_USERS.recepcionista, E2E_USERS.instrutor]) {
    await prisma.funcionario.upsert({
      where: { id: user.id },
      update: { role: user.role },
      create: {
        id: user.id,
        email: user.email,
        nomeCompleto: user.nomeCompleto,
        role: user.role,
      },
    });
    console.log(`  Funcionario upserted: ${user.nomeCompleto} (${user.role})`);
  }

  // Upsert Aluno
  await prisma.aluno.upsert({
    where: { id: E2E_USERS.aluno.id },
    update: {},
    create: {
      id: E2E_USERS.aluno.id,
      email: E2E_USERS.aluno.email,
      nomeCompleto: E2E_USERS.aluno.nomeCompleto,
      cpf: E2E_USERS.aluno.cpf,
      telefone: E2E_USERS.aluno.telefone,
    },
  });
  console.log(`  Aluno upserted: ${E2E_USERS.aluno.nomeCompleto}`);

  // Seed Plano + INADIMPLENTE Aluno + Matricula (required for payment-status E2E)
  const planoE2eId = '00000000-0000-0000-0000-000000000020';
  const alunoInadimplenteId = '00000000-0000-0000-0000-000000000005';
  const matriculaE2eId = '00000000-0000-0000-0000-000000000030';

  await prisma.plano.upsert({
    where: { id: planoE2eId },
    update: { nome: 'Plano Mensal E2E', preco: 99.9, duracaoDias: 30 },
    create: {
      id: planoE2eId,
      nome: 'Plano Mensal E2E',
      preco: 99.9,
      duracaoDias: 30,
    },
  });
  console.log('  Plano E2E upserted: Plano Mensal E2E');

  // No auth user needed — GERENTE is the actor; aluno only needs a Prisma record
  await prisma.aluno.upsert({
    where: { id: alunoInadimplenteId },
    update: { statusMatricula: 'INADIMPLENTE' },
    create: {
      id: alunoInadimplenteId,
      email: 'aluno-inadimplente@test.com',
      nomeCompleto: 'Aluno Inadimplente E2E',
      cpf: '000.000.000-05',
      telefone: '11999990005',
      statusMatricula: 'INADIMPLENTE',
    },
  });
  console.log('  Aluno INADIMPLENTE upserted: Aluno Inadimplente E2E');

  await prisma.matricula.upsert({
    where: { id: matriculaE2eId },
    update: { status: 'VENCIDA', dataVencimento: new Date('2025-01-01') },
    create: {
      id: matriculaE2eId,
      alunoId: alunoInadimplenteId,
      planoId: planoE2eId,
      dataVencimento: new Date('2025-01-01'),
      status: 'VENCIDA',
    },
  });
  console.log('  Matricula E2E upserted: Plano Mensal E2E (VENCIDA)');

  // Seed 1 Treino for ALUNO (required for workout-session E2E)
  const treinoE2eId = '00000000-0000-0000-0000-000000000010';
  await prisma.treino.upsert({
    where: { id: treinoE2eId },
    update: {},
    create: {
      id: treinoE2eId,
      alunoId: E2E_USERS.aluno.id,
      instrutorId: E2E_USERS.instrutor.id,
      objetivo: 'Treino E2E',
      diaSemana: 1,
      Exercicios: {
        create: [
          { nomeExercicio: 'Supino Reto', series: 3, repeticoes: '10-12', observacoes: '' },
          { nomeExercicio: 'Crucifixo', series: 3, repeticoes: '12-15', observacoes: '' },
        ],
      },
    },
  });
  console.log('  Treino E2E upserted: Treino E2E (2 exercícios)');

  console.log('E2E seed complete.');
}

async function main(): Promise<void> {
  try {
    await seed();
  } catch (err: unknown) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
