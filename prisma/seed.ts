import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Limpar dados existentes (ordem reversa das dependências)
  await prisma.exercicio.deleteMany();
  await prisma.treino.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.matricula.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.plano.deleteMany();
  await prisma.funcionario.deleteMany();

  // 2. Funcionários (Instrutores)
  const func1 = await prisma.funcionario.create({
    data: {
      id: "func1",
      nomeCompleto: "João Instrutor",
      email: "joao.instrutor@academia.com",
      role: "INSTRUTOR",
    },
  });

  // 3. Planos
  const planos = [
    { id: "1", nome: "Plano Mensal", preco: 120, duracaoDias: 30 },
    { id: "2", nome: "Plano Trimestral", preco: 330, duracaoDias: 90 },
    { id: "3", nome: "Plano Semestral", preco: 600, duracaoDias: 180 },
    { id: "4", nome: "Plano Anual", preco: 1080, duracaoDias: 365 },
  ];

  for (const plano of planos) {
    await prisma.plano.create({ data: plano });
  }

  // 4. Alunos
  const alunos = [
    {
      id: "1",
      nomeCompleto: "Ana Silva",
      cpf: "111.222.333-44",
      email: "ana.silva@example.com",
      telefone: "(11) 98765-4321",
      dataNascimento: new Date("1995-03-15"),
      dataCadastro: new Date("2023-01-10"),
      fotoUrl: "https://i.imgur.com/8b1Z9T6.jpeg",
      statusMatricula: "ATIVA" as const,
    },
    {
      id: "2",
      nomeCompleto: "Bruno Costa",
      cpf: "222.333.444-55",
      email: "bruno.costa@example.com",
      telefone: "(21) 91234-5678",
      dataNascimento: new Date("1988-07-22"),
      dataCadastro: new Date("2022-11-20"),
      fotoUrl: "https://i.imgur.com/nO2CSSO.jpeg",
      statusMatricula: "INADIMPLENTE" as const,
    },
    {
      id: "3",
      nomeCompleto: "Carla Dias",
      cpf: "333.444.555-66",
      email: "carla.dias@example.com",
      telefone: "(31) 95555-4444",
      dataNascimento: new Date("2001-11-30"),
      dataCadastro: new Date("2023-05-01"),
      fotoUrl: "https://i.imgur.com/A2trT4c.jpeg",
      statusMatricula: "ATIVA" as const,
    },
  ];

  for (const aluno of alunos) {
    await prisma.aluno.create({ data: aluno });
  }

  // 5. Treinos
  await prisma.treino.create({
    data: {
      id: "t1",
      alunoId: "1",
      instrutorId: "func1",
      objetivo: "Treino A - Superiores (Ênfase Peito/Ombro)",
      diaSemana: 1,
      dataCriacao: new Date("2024-01-15"),
      Exercicios: {
        create: [
          {
            id: "ex1",
            nomeExercicio: "Supino Reto com Barra",
            series: 4,
            repeticoes: "8-10",
            observacoes: "Controlar a descida.",
            descricao: "Deite-se em um banco reto...",
          },
          {
            id: "ex2",
            nomeExercicio: "Desenvolvimento Militar com Barra",
            series: 3,
            repeticoes: "10-12",
            observacoes: "Não curvar a lombar.",
            descricao: "Em pé ou sentado...",
          },
        ],
      },
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
