# Tarefa: MongoDB

Esta página documenta a resolução da tarefa sobre o SGBD NoSQL MongoDB para gerenciamento de atividades em projetos com empregados.

## 👨‍🎓 Informações do Aluno

- **Nome:** José Inamar de Medeiros Júnior
- **Matrícula:** 20200018540
- **Email:** inamarjunior2@gmail.com

---

## 🔗 Links Úteis

| Recurso                                    | Link                                               |
| ------------------------------------------ | -------------------------------------------------- |
| 📄 Script de Inicialização (mongo-init.js) | [mongo-init.js](./scripts/mongo-init.js)           |
| 📦 Docker Compose                          | [docker-compose.yml](./scripts/docker-compose.yml) |
| 🌱 Script de Seed (povoamento)             | [seed.js](./scripts/seed.js)                       |
| 💻 Programa CRUD                           | [crud.js](./scripts/crud.js)                       |

---

## 📘 Resumo sobre MongoDB (Linguagem: JavaScript/Node.js)

### O que é MongoDB?

**MongoDB** é um sistema gerenciador de banco de dados **NoSQL** orientado a documentos (_document database_). Em vez de armazenar dados em tabelas com linhas e colunas (como em bancos relacionais), o MongoDB armazena dados em documentos **BSON** (Binary JSON), uma extensão binária do JSON.

### Principais Características

| Característica                 | Descrição                                                                              |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| **Modelo Documento**           | Dados armazenados como documentos JSON/BSON, permitindo estruturas aninhadas e arrays. |
| **Schema Flexível**            | Cada documento pode ter campos diferentes — não há esquema rígido como em SQL.         |
| **Escalabilidade Horizontal**  | Suporte nativo a _sharding_ para distribuir dados entre múltiplos servidores.          |
| **Alta Disponibilidade**       | _Replica Sets_ garantem redundância e failover automático.                             |
| **Linguagem de Consulta Rica** | Operações CRUD poderosas com aggregation pipeline, índices e geolocalização.           |
| **Indexação**                  | Suporte a índices simples, compostos, TTL, text search e geoespaciais.                 |
| **Transações Multi-documento** | A partir da versão 4.0, suporte a transações ACID em múltiplos documentos.             |

### Vantagens para o Cenário Proposto

- **Documentos aninhados** permitem representar atividades dentro de projetos de forma natural.
- **Schema flexível** facilita evolução do modelo sem migrations.
- **Alta disponibilidade** essencial para sistemas departamentais que não podem parar.

---

## 🐳 Configuração do Ambiente (Docker)

### Servidor Standalone

```yaml
# docker-compose.yml (servidor único com autenticação)
services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb-atividades
    restart: unless-stopped
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
      MONGO_INITDB_DATABASE: AtividadesProj
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    command: ['mongod', '--auth']
```

### Subindo o Servidor

```bash
docker compose up -d
```

### Verificando a Conexão

```bash
docker exec -it mongodb-atividades mongosh -u admin -p admin123 --authenticationDatabase admin

# Dentro do shell:
use AtividadesProj
db.auth("app_atividades", "app123")
show collections
```

---

## 🗄️ Esquema das Coleções

Baseado no tema **gerenciamento de atividades em projetos com empregados**, foram definidas três coleções principais:

### 1. `empregados`

```javascript
{
  matricula: String,        // unique identifier
  nome: String,             // nome completo
  email: String,            // email corporativo
  cargo: String,            // cargo/função
  departamento: String,     // departamento
  dataContratacao: Date     // data de admissão
}
```

### 2. `projetos`

```javascript
{
  codigo: String,           // unique identifier (ex: "PROJ-001")
  nome: String,             // nome do projeto
  descricao: String,         // descrição do projeto
  lider: String,            // matrícula do líder (ref. empregados)
  equipe: [String],         // array de matrículas da equipe
  dataInicio: Date,         // data de início
  dataPrevisaoFim: Date,    // previsão de término
  status: String            // "Em andamento" | "Planejado" | "Concluído"
}
```

### 3. `atividades`

```javascript
{
  codigo: String,           // unique identifier (ex: "ATV-001")
  titulo: String,           // título da atividade
  descricao: String,        // descrição detalhada
  projeto: String,          // código do projeto (ref. projetos)
  responsavel: String,      // matrícula do responsável (ref. empregados)
  dataInicio: Date,         // data de início
  dataFim: Date,            // data de conclusão (null se não concluída)
  prioridade: String,       // "Alta" | "Média" | "Baixa"
  status: String            // "Planejada" | "Em andamento" | "Concluída"
}
```

### Diagrama de Relacionamento (Lógico)

```
empregados ──< líder (projetos)
empregados ──< equipe (projetos)
empregados ──< responsavel (atividades)
projetos    ──< projeto (atividades)
```

---

## 🌱 Script de Povoamento (Seed)

O script [`seed.js`](./scripts/seed.js) insere documentos nas três coleções:

| Coleção      | Documentos Inseridos                               |
| ------------ | -------------------------------------------------- |
| `empregados` | 4 (Ana, Carlos, Fernanda, Gabriel)                 |
| `projetos`   | 3 (Sistema Academia, App Entregas, Migração Cloud) |
| `atividades` | 5 (distribuídas entre os projetos)                 |

**Execução:**

```bash
node database/20261/tarefas/EmiyaKiritsugu3/scripts/seed.js
```

---

## 💻 Programa CRUD

O programa [`crud.js`](./scripts/crud.js) implementa as quatro operações:

### CREATE

Insere uma nova atividade (`ATV-006`) no projeto **PROJ-002** (App de Entregas Mobile).

```javascript
db.collection("atividades").insertOne({ codigo: "ATV-006", ... });
```

### READ

Lista todos os projetos e, para cada projeto, as atividades associadas.

```javascript
const projetos = await db.collection('projetos').find({}).toArray();
for (const proj of projetos) {
  const atividades = await db.collection('atividades').find({ projeto: proj.codigo }).toArray();
  // exibe projeto + atividades
}
```

### UPDATE

Altera o líder do projeto **PROJ-001** (de `E003` para `E002`), com verificação e reversão para consistência.

```javascript
db.collection('projetos').updateOne({ codigo: 'PROJ-001' }, { $set: { lider: 'E002' } });
```

### DELETE

Remove a atividade `ATV-006` (criada no CREATE).

```javascript
db.collection('atividades').deleteOne({ codigo: 'ATV-006' });
```

**Execução:**

```bash
node database/20261/tarefas/EmiyaKiritsugu3/scripts/crud.js
```

---

## 🏛️ Questão 7 — Replica Sets no MongoDB

### O que é um Replica Set?

**Replica Set** é um grupo de instâncias MongoDB que mantêm o mesmo conjunto de dados, fornecendo **alta disponibilidade** e **tolerância a falhas**. É a base da arquitetura de produção do MongoDB.

### Membros e seus Papéis (Roles)

| Membro                     | Papel       | Descrição                                                                                                                                                                                            |
| -------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primário (Primary)**     | Read/Write  | Aceita todas as operações de escrita. Toda alteração é registrada no _oplog_ (operation log) e replicada para os secundários.                                                                        |
| **Secundário (Secondary)** | Read-Only   | Mantém cópia dos dados através da replicação do oplog do primário. Pode ser configurado para aceitar leituras (read preference). Em caso de falha do primário, um secundário é eleito novo primário. |
| **Arbiter (Arbitro)**      | Voto apenas | Não armazena dados. Participa apenas das eleições para desempatar quando há número par de membros votantes. Arbiter não pode se tornar primário.                                                     |

### Como funciona a eleição?

Quando o primário fica indisponível, os secundários detectam a falta de heartbeat e iniciam uma **eleição**. O nó com prioridade mais alta e dados mais recentes (maior _oplog timestamp_) é eleito novo primário. O processo é automático e leva segundos.

### Vantagens

- **Failover automático** sem intervenção manual.
- **Backup**: backups podem ser feitos em secundários sem impacto no primário.
- **Read scaling**: leituras podem ser distribuídas entre secundários.
- **Manutenção**: janelas de manutenção possíveis com eleições programadas.

---

## ⚙️ Questão 8 — Configuração de Replica Set com Docker

Para transformar o servidor MongoDB standalone em um **Replica Set de 3 membros** (Primary + Secondary + Arbiter) para o banco **AtividadesProj**, são necessárias as seguintes etapas:

### Etapa 1: Arquivo docker-compose para Replica Set

Crie um override file (`docker-compose.rs.yml`) com três serviços:

```yaml
# docker-compose.rs.yml — Replica Set de 3 membros
services:
  mongodb-primary:
    image: mongo:7.0
    container_name: mongodb-primary
    command: ['mongod', '--replSet', 'rs0', '--bind_ip_all', '--auth']
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - rs_primary_data:/data/db

  mongodb-secondary:
    image: mongo:7.0
    container_name: mongodb-secondary
    command: ['mongod', '--replSet', 'rs0', '--bind_ip_all', '--auth']
    ports:
      - '27018:27017'
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: admin123
    volumes:
      - rs_secondary_data:/data/db

  mongodb-arbiter:
    image: mongo:7.0
    container_name: mongodb-arbiter
    command: ['mongod', '--replSet', 'rs0', '--bind_ip_all', '--auth']
    ports:
      - '27019:27017'
    volumes:
      - rs_arbiter_data:/data/db

volumes:
  rs_primary_data:
  rs_secondary_data:
  rs_arbiter_data:
```

### Etapa 2: Subir os contêineres

```bash
docker compose -f docker-compose.yml -f docker-compose.rs.yml up -d
```

### Etapa 3: Iniciar o Replica Set via mongosh

Conecte-se ao primário:

```bash
docker exec -it mongodb-primary mongosh -u admin -p admin123 --authenticationDatabase admin
```

Dentro do shell, execute:

```javascript
rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongodb-primary:27017', priority: 2 },
    { _id: 1, host: 'mongodb-secondary:27017', priority: 1 },
    { _id: 2, host: 'mongodb-arbiter:27017', arbiterOnly: true },
  ],
});
```

### Etapa 4: Verificar o status

```javascript
rs.status();
```

A saída deve mostrar:

- `members[0].stateStr: "PRIMARY"`
- `members[1].stateStr: "SECONDARY"`
- `members[2].stateStr: "ARBITER"`

### Etapa 5: Criar usuário da aplicação no Replica Set

```javascript
db.getSiblingDB('AtividadesProj').createUser({
  user: 'app_atividades',
  pwd: 'app123',
  roles: [{ role: 'readWrite', db: 'AtividadesProj' }],
});
```

### Etapa 6: String de Conexão para o Replica Set

```
mongodb://app_atividades:app123@mongodb-primary:27017,mongodb-secondary:27018/AtividadesProj?replicaSet=rs0&authSource=AtividadesProj
```

### Considerações Importantes

- **Rede**: Todos os membros devem estar na mesma rede Docker e conseguir se comunicar.
- **Autenticação**: Com `--auth`, é necessário criar o usuário admin **antes** de iniciar o replica set, ou usar `--keyFile` para autenticação entre membros.
- **IPs resolvíveis**: Os nomes dos containers (`mongodb-primary`, `mongodb-secondary`, `mongodb-arbiter`) devem ser resolvíveis via DNS interno do Docker.
- **Oplog**: O tamanho padrão do oplog é 5% do disco; pode ser configurado com `oplogSizeMB`.

---

## 📋 Checklist de Execução

1. ✅ Servidor MongoDB configurado com Docker (`docker compose up -d`)
2. ✅ Banco `AtividadesProj` e usuário `app_atividades` criados
3. ✅ Coleções modeladas (empregados, projetos, atividades)
4. ✅ Script de seed com dados de exemplo (mín. 3 documentos por coleção)
5. ✅ Programa CRUD funcional (Create, Read, Update, Delete)
6. ✅ Replica Set explicado conceitualmente
7. ✅ Configuração Docker para Replica Set de 3 membros documentada
