// ============================================================================
// mongo-init.js — Script de inicialização do MongoDB (executado ao primeiro
// start do container via /docker-entrypoint-initdb.d/)
// ============================================================================
// Cria banco, usuário de aplicação e coleções iniciais.
//
// ⚠️  SEGURANÇA: A senha do usuário é lida da variável de ambiente
//    $MONGO_PASSWORD. Defina-a no ambiente Docker/compose antes de iniciar.
//    Exemplo (docker-compose.yml):
//      environment:
//        - MONGO_PASSWORD=senha_forte_aqui
// ============================================================================

/* eslint-disable no-redeclare */

/* global db: true, print: true */

// Conecta ao banco alvo
 
db = db.getSiblingDB("AtividadesProj");

// ── 1. Cria usuário da aplicação ───────────────────────────────────────────
const mongoPassword = process.env["MONGO_PASSWORD"];
if (!mongoPassword) {
  throw new Error("Variável de ambiente MONGO_PASSWORD não definida!");
}
db.createUser({
  user: "app_atividades",
  pwd: mongoPassword,
  roles: [
    { role: "readWrite", db: "AtividadesProj" },
    { role: "dbAdmin", db: "AtividadesProj" },
  ],
});

// ── 2. Coleções (criadas implicitamente ao inserir) ────────────────────────
// Não precisamos criar explicitamente; insertMany() cria a coleção.

print("✓ Banco AtividadesProj e usuário app_atividades criados com sucesso.");
