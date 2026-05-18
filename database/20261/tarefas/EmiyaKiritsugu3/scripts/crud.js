// ============================================================================
// crud.js — Programa CRUD para MongoDB (AtividadesProj)
// ============================================================================
// Demonstra as quatro operações:
//   CREATE  → inserir nova atividade em projeto existente
//   READ    → listar projetos com suas atividades
//   UPDATE  → alterar líder de um projeto
//   DELETE   → remover uma atividade de um projeto
// ============================================================================
// Uso:
//   node crud.js
// ============================================================================

const { MongoClient } = require("mongodb");

const URI =
  process.env.MONGO_URI ||
  "mongodb://app_atividades:app123@localhost:27017/AtividadesProj?authSource=AtividadesProj";

async function run() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db("AtividadesProj");

    console.log("=".repeat(60));
    console.log("🚀 PROGRAMA CRUD — MongoDB / AtividadesProj");
    console.log("=".repeat(60));

    // ────────────────────────────────────────────────────────────────────────
    // CREATE — Inserir nova atividade em um projeto existente
    // ────────────────────────────────────────────────────────────────────────
    console.log("\n📌 CREATE — Inserindo nova atividade no PROJ-002...");

    const novaAtividade = {
      codigo: "ATV-006",
      titulo: "Configurar monitoramento com Sentry",
      descricao: "Integrar Sentry para rastreamento de erros no app mobile",
      projeto: "PROJ-002",
      responsavel: "E004",
      dataInicio: new Date("2025-04-01"),
      dataFim: null,
      prioridade: "Média",
      status: "Planejada",
    };

    const insertResult = await db
      .collection("atividades")
      .insertOne(novaAtividade);
    console.log(`   ✓ Atividade inserida com _id: ${insertResult.insertedId}`);

    // ────────────────────────────────────────────────────────────────────────
    // READ — Listar todos os projetos e suas atividades
    // ────────────────────────────────────────────────────────────────────────
    console.log("\n📌 READ — Listando projetos e suas atividades...\n");

    const projetos = await db.collection("projetos").find({}).toArray();

    for (const proj of projetos) {
      console.log(`━━━ ${proj.nome} (${proj.codigo}) ━━━`);
      console.log(`   Líder: ${proj.lider}  |  Status: ${proj.status}`);

      const atividades = await db
        .collection("atividades")
        .find({ projeto: proj.codigo })
        .toArray();

      if (atividades.length === 0) {
        console.log("   (nenhuma atividade cadastrada)");
      } else {
        for (const atv of atividades) {
          console.log(
            `   [${atv.codigo}] ${atv.titulo} — ` +
              `Resp: ${atv.responsavel} — Prioridade: ${atv.prioridade} — Status: ${atv.status}`
          );
        }
      }
      console.log();
    }

    // ────────────────────────────────────────────────────────────────────────
    // UPDATE — Alterar líder de um projeto específico
    // ────────────────────────────────────────────────────────────────────────
    console.log("📌 UPDATE — Alterando líder do PROJ-001 para E002...");

    const updateResult = await db
      .collection("projetos")
      .updateOne({ codigo: "PROJ-001" }, { $set: { lider: "E002" } });

    console.log(
      `   ✓ ${updateResult.matchedCount} projeto(s) encontrado(s), ${updateResult.modifiedCount} alterado(s)`
    );

    // Verificação
    const projAtualizado = await db
      .collection("projetos")
      .findOne({ codigo: "PROJ-001" });
    console.log(`   ✓ Novo líder do PROJ-001: ${projAtualizado.lider}`);

    // Reverte para não quebrar consistência dos dados de exemplo
    await db
      .collection("projetos")
      .updateOne({ codigo: "PROJ-001" }, { $set: { lider: "E003" } });
    console.log(`   ↻ Líder restaurado para E003 (consistência dos dados)`);

    // ────────────────────────────────────────────────────────────────────────
    // DELETE — Remover uma atividade de um projeto
    // ────────────────────────────────────────────────────────────────────────
    console.log("\n📌 DELETE — Removendo atividade ATV-006 (criada acima)...");

    const deleteResult = await db
      .collection("atividades")
      .deleteOne({ codigo: "ATV-006" });

    console.log(
      `   ✓ ${deleteResult.deletedCount} atividade(s) removida(s) (ATV-006)`
    );

    // ────────────────────────────────────────────────────────────────────────
    // Resumo final
    // ────────────────────────────────────────────────────────────────────────
    console.log("\n" + "=".repeat(60));
    console.log("✅ CRUD concluído com sucesso!");
    console.log("=".repeat(60));
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error("❌ Erro no CRUD:", err);
  process.exit(1);
});
