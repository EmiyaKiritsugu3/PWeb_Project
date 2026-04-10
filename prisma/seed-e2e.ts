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
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:54322/postgres',
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- PrismaPg adapter has a type mismatch with pg@8 Pool; upstream issue
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

// Fixed UUIDs — used in E2E tests to reference specific users.
// Credentials MUST match tests/e2e/helpers/auth.ts
export const E2E_USERS = {
  gerente: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'gerente@test.com',
    password: 'Test1234!',
    role: Role.GERENTE,
    nomeCompleto: 'Gerente E2E',
  },
  recepcionista: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'recep@test.com',
    password: 'Test1234!',
    role: Role.RECEPCIONISTA,
    nomeCompleto: 'Recepcionista E2E',
  },
  instrutor: {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'instrutor@test.com',
    password: 'Test1234!',
    role: Role.INSTRUTOR,
    nomeCompleto: 'Instrutor E2E',
  },
  aluno: {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'aluno@test.com',
    password: 'Test1234!',
    cpf: '000.000.000-04',
    nomeCompleto: 'Aluno E2E',
    telefone: '11999990004',
  },
} as const;

async function createAuthUser(id: string, email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.admin.createUser({
    user_metadata: {},
    email,
    password,
    email_confirm: true,
    id,
  });

  if (error && !error.message.includes('already been registered')) {
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  }
}

async function seed(): Promise<void> {
  console.log('Seeding E2E test users...');

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

  console.log('E2E seed complete.');
}

seed()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
