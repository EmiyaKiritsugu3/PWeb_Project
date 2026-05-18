// ============================================================================
// mongo-init.js — Script de inicialização do MongoDB (executado ao primeiro
// start do container via /docker-entrypoint-initdb.d/)
// ============================================================================
// Cria banco, usuário de aplicação e coleções iniciais.
// ============================================================================

// Conecta ao banco alvo
db = db.getSiblingDB("AtividadesProj");

// ── 1. Cria usuário da aplicação ───────────────────────────────────────────
db.createUser({
  user: "app_atividades",
  pwd: "app123",
  roles: [
    { role: "readWrite", db: "AtividadesProj" },
    { role: "dbAdmin", db: "AtividadesProj" },
  ],
});

// ── 2. Coleções (criadas implicitamente ao inserir) ────────────────────────
// Não precisamos criar explicitamente; insertMany() cria a coleção.

print("✓ Banco AtividadesProj e usuário app_atividades criados com sucesso.");
