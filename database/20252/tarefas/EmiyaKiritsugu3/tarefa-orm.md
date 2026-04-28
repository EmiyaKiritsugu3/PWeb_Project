# Tarefa: ODBC e ORM

Esta página documenta a resolução da tarefa sobre conectividade de banco de dados e mapeamento objeto-relacional.

## 👨‍🎓 Informações do Aluno

- **Nome:** José Inamar de Medeiros Júnior
- **Matrícula:** 20200018540
- **Email:** inamarjunior2@gmail.com

---

## 🔗 Links Úteis

- [📄 Script DDL/DML (AtividadesBD)](https://github.com/EmiyaKiritsugu3/PWeb_Project/blob/main/database/20252/tarefas/EmiyaKiritsugu3/scripts/atividades-bd.sql)
- [💻 Programa de Conexão (Direta/ODBC-like)](https://github.com/EmiyaKiritsugu3/PWeb_Project/blob/main/database/20252/tarefas/EmiyaKiritsugu3/scripts/odbc-example.ts)
- [🛠️ Programa ORM (Prisma)](https://github.com/EmiyaKiritsugu3/PWeb_Project/blob/main/database/20252/tarefas/EmiyaKiritsugu3/scripts/orm-example.ts)

---

## 📘 Resumo sobre ODBC (Linguagem: TypeScript/Node.js)

**ODBC (Open Database Connectivity)** é um padrão de API para acesso a sistemas de gerenciamento de banco de dados (SGBD). Em Node.js, embora o termo "ODBC" seja mais comum em ambientes Windows/C++, utilizamos drivers de baixo nível como o `pg` (node-postgres) que funcionam de forma análoga:

- Permitem a execução de comandos SQL puros.
- Exigem o gerenciamento manual de conexões e encerramento de cursores.
- Retornam dados em formatos brutos (matrizes ou objetos simples).

**Vantagens:** Performance máxima e controle total sobre a query SQL.
**Desvantagens:** Verboso, propenso a erros de sintaxe e SQL Injection se não houver cuidado.

---

## 📘 Resumo sobre ORM (Framework: Prisma)

**ORM (Object-Relational Mapping)** é uma técnica que permite converter dados entre sistemas incompatíveis (objetos da linguagem vs tabelas do banco). No framework **Prisma** (utilizado neste projeto):

- O banco de dados é modelado em um arquivo `schema.prisma`.
- O Prisma gera um cliente tipado automaticamente (`PrismaClient`).
- As consultas são feitas através de métodos de objetos, eliminando a necessidade de escrever SQL manualmente para tarefas comuns.

**Vantagens:** Type-safety (TypeScript), produtividade, facilidade de manutenção e proteção nativa contra SQL Injection.
**Desvantagens:** Pode gerar queries menos otimizadas em casos extremamente complexos.

---

## 🐳 Configuração do Ambiente (Docker)

O ambiente foi configurado utilizando Docker Compose para subir o PostgreSQL e o PgAdmin.

```yaml
# Exemplo de docker-compose.yml utilizado
version: '3.8'
services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_USER: user_atividades
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: AtividadesBD
    ports:
      - '5432:5432'
```

---

## 🚀 Execução das Questões

### Questão 4 (Acesso Direto)

O script [odbc-example.ts](https://github.com/EmiyaKiritsugu3/PWeb_Project/blob/main/database/20252/tarefas/EmiyaKiritsugu3/scripts/odbc-example.ts) demonstra a inserção, atualização e listagem usando SQL puro.

### Questão 5 (Acesso via ORM)

O script [orm-example.ts](https://github.com/EmiyaKiritsugu3/PWeb_Project/blob/main/database/20252/tarefas/EmiyaKiritsugu3/scripts/orm-example.ts) demonstra as mesmas operações utilizando os métodos do Prisma.
