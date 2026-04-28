import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runORMExample() {
  try {
    console.log("Conectado ao banco via Prisma ORM");

    // 1. Inserir uma atividade
    await prisma.$executeRaw`INSERT INTO atividades (descricao, id_projeto) VALUES ('Nova tarefa via ORM', 1)`;
    // Ou usando métodos do Prisma (se o schema estiver gerado):
    // await prisma.atividade.create({ data: { descricao: 'Nova tarefa', id_projeto: 1 } });
    
    console.log("Atividade inserida via ORM.");

    // 2. Atualizar o líder do projeto
    await prisma.$executeRaw`UPDATE projetos SET id_lider = 1 WHERE id = 1`;
    console.log("Líder atualizado via ORM.");

    // 3. Listar projetos e atividades
    // Exemplo usando SQL raw no Prisma para compatibilidade com o esquema manual
    const listagem = await prisma.$queryRaw`
      SELECT p.nome as projeto, a.descricao as atividade 
      FROM projetos p 
      LEFT JOIN atividades a ON a.id_projeto = p.id
    `;
    console.log("Listagem via ORM:", listagem);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

runORMExample();
