import { Client } from 'pg';

async function runDirectQuery() {
  const client = new Client({
    connectionString: "postgresql://user_atividades:password123@localhost:5432/AtividadesBD",
  });

  try {
    await client.connect();
    console.log("Conectado ao banco via Driver Direto (ODBC-like)");

    // 1. Inserir uma atividade
    await client.query("INSERT INTO atividades (descricao, id_projeto) VALUES ($1, $2)", 
      ["Nova tarefa via Driver", 1]);
    console.log("Atividade inserida.");

    // 2. Atualizar o líder do projeto
    await client.query("UPDATE projetos SET id_lider = $1 WHERE id = $2", [1, 1]);
    console.log("Líder atualizado.");

    // 3. Listar projetos e atividades
    const res = await client.query(`
      SELECT p.nome as projeto, a.descricao as atividade 
      FROM projetos p 
      LEFT JOIN atividades a ON a.id_projeto = p.id
    `);
    console.log("Listagem:", res.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

runDirectQuery();
