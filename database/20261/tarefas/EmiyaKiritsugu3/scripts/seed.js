// ============================================================================
// seed.js — Script de povoamento inicial do MongoDB (AtividadesProj)
// ============================================================================
// Uso:
//   MONGO_URI="mongodb://app_atividades:MONGO_PASSWORD@localhost:27017/AtividadesProj?authSource=AtividadesProj" node seed.js
// ou via Node.js:
//   node seed.js
// ============================================================================

const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("FATAL: MONGO_URI environment variable is required.");
  process.exit(1);
}
const URI = MONGO_URI;

async function seed() {
  const client = new MongoClient(URI);
  try {
    await client.connect();
    const db = client.db("AtividadesProj");

    // ── Coleção: empregados ──────────────────────────────────────────────
    const empregados = [
      {
        matricula: "E001",
        nome: "Ana Beatriz Oliveira",
        email: "ana.oliveira@empresa.com",
        cargo: "Desenvolvedora Sênior",
        departamento: "TI",
        dataContratacao: new Date("2020-03-15"),
      },
      {
        matricula: "E002",
        nome: "Carlos Eduardo Mendes",
        email: "carlos.mendes@empresa.com",
        cargo: "Analista de Sistemas",
        departamento: "TI",
        dataContratacao: new Date("2021-07-01"),
      },
      {
        matricula: "E003",
        nome: "Fernanda Lima Costa",
        email: "fernanda.costa@empresa.com",
        cargo: "Gerente de Projetos",
        departamento: "TI",
        dataContratacao: new Date("2019-11-20"),
      },
      {
        matricula: "E004",
        nome: "Gabriel Santos Rocha",
        email: "gabriel.rocha@empresa.com",
        cargo: "Desenvolvedor Júnior",
        departamento: "TI",
        dataContratacao: new Date("2023-01-10"),
      },
    ];

    // ── Coleção: projetos ────────────────────────────────────────────────
    const projetos = [
      {
        codigo: "PROJ-001",
        nome: "Sistema de Gestão de Academia",
        descricao: "Plataforma full-stack para gerenciamento de academias",
        lider: "E003",
        equipe: ["E001", "E002", "E004"],
        dataInicio: new Date("2024-01-15"),
        dataPrevisaoFim: new Date("2025-06-30"),
        status: "Em andamento",
      },
      {
        codigo: "PROJ-002",
        nome: "App de Entregas Mobile",
        descricao: "Aplicativo mobile para rastreamento de entregas",
        lider: "E001",
        equipe: ["E002", "E004"],
        dataInicio: new Date("2024-06-01"),
        dataPrevisaoFim: new Date("2025-03-31"),
        status: "Em andamento",
      },
      {
        codigo: "PROJ-003",
        nome: "Migração de Infraestrutura Cloud",
        descricao: "Migração de servidores on-premise para AWS",
        lider: "E003",
        equipe: ["E001"],
        dataInicio: new Date("2025-02-01"),
        dataPrevisaoFim: new Date("2025-08-31"),
        status: "Planejado",
      },
    ];

    // ── Coleção: atividades ──────────────────────────────────────────────
    const atividades = [
      {
        codigo: "ATV-001",
        titulo: "Implementar módulo de autenticação",
        descricao: "Desenvolver login com JWT e refresh token",
        projeto: "PROJ-001",
        responsavel: "E001",
        dataInicio: new Date("2025-01-10"),
        dataFim: new Date("2025-02-15"),
        prioridade: "Alta",
        status: "Concluída",
      },
      {
        codigo: "ATV-002",
        titulo: "Criar dashboard financeiro",
        descricao: "Tela com gráficos de faturamento e inadimplência",
        projeto: "PROJ-001",
        responsavel: "E002",
        dataInicio: new Date("2025-02-01"),
        dataFim: null,
        prioridade: "Média",
        status: "Em andamento",
      },
      {
        codigo: "ATV-003",
        titulo: "Desenvolver API de entregas",
        descricao: "REST API para criação e rastreamento de entregas",
        projeto: "PROJ-002",
        responsavel: "E001",
        dataInicio: new Date("2025-03-01"),
        dataFim: null,
        prioridade: "Alta",
        status: "Em andamento",
      },
      {
        codigo: "ATV-004",
        titulo: "Configurar ambiente AWS EKS",
        descricao: "Provisionar cluster Kubernetes na AWS",
        projeto: "PROJ-003",
        responsavel: "E001",
        dataInicio: null,
        dataFim: null,
        prioridade: "Média",
        status: "Planejada",
      },
      {
        codigo: "ATV-005",
        titulo: "Testes de integração contínua",
        descricao: "Pipeline CI/CD com GitHub Actions e Playwright",
        projeto: "PROJ-002",
        responsavel: "E004",
        dataInicio: new Date("2025-03-15"),
        dataFim: null,
        prioridade: "Baixa",
        status: "Em andamento",
      },
    ];

    // ── Inserção ─────────────────────────────────────────────────────────
    await db.collection("empregados").deleteMany({});
    await db.collection("projetos").deleteMany({});
    await db.collection("atividades").deleteMany({});

    const r1 = await db.collection("empregados").insertMany(empregados);
    const r2 = await db.collection("projetos").insertMany(projetos);
    const r3 = await db.collection("atividades").insertMany(atividades);

    console.log(`✓ Empregados inseridos: ${r1.insertedCount}`);
    console.log(`✓ Projetos inseridos:   ${r2.insertedCount}`);
    console.log(`✓ Atividades inseridas: ${r3.insertedCount}`);
    console.log("Seed concluído com sucesso!");
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
