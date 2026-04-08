# SPEC-001: Data Models & Dictionary

**Date:** 2026-04-08
**Status:** Approved
**Target:** PostgreSQL via Prisma ORM

---

## 1. Conceptual ERD

```mermaid
erDiagram
    ALUNO {
        string id PK
        string nomeCompleto
        string cpf
        string email
        string telefone
        datetime dataNascimento
        datetime dataCadastro
        string fotoUrl
        string biometriaHash
        string statusMatricula
    }

    MATRICULA {
        string id PK
        string alunoId FK
        string planoId FK
        datetime dataInicio
        datetime dataVencimento
        string status
    }

    PAGAMENTO {
        string id PK
        string matriculaId FK
        string alunoId FK
        float valor
        datetime dataPagamento
        string metodo
    }

    PLANO {
        string id PK
        string nome
        float preco
        int duracaoDias
    }

    TREINO {
        string id PK
        string alunoId FK
        string instrutorId FK
        string objetivo
        datetime dataCriacao
        int diaSemana
    }

    EXERCICIO {
        string id PK
        string nomeExercicio
        int series
        string repeticoes
        string observacoes
        string descricao
    }

    FUNCIONARIO {
        string id PK
        string nomeCompleto
        string email
        string role
    }

    ALUNO ||--o{ MATRICULA : "possui"
    ALUNO ||--o{ PAGAMENTO : "realiza"
    ALUNO ||--o{ TREINO : "pratica"
    PLANO ||--o{ MATRICULA : "define"
    MATRICULA ||--o{ PAGAMENTO : "gera"
    TREINO ||--o{ EXERCICIO : "contem"
```

## 2. Data Dictionary

_Note: Legacy documents referenced Firebase UIDs. The architecture has since migrated to Supabase Auth + PostgreSQL via Prisma. The `id` fields represent UUIDs linked to Supabase `auth.users` where applicable._

### Entity: Aluno (Student)

| Attribute         | Type        | Description                                         |
| ----------------- | ----------- | --------------------------------------------------- |
| `id`              | UUID/String | Primary Key (matches Supabase Auth UID).            |
| `nomeCompleto`    | String      | Full legal name.                                    |
| `cpf`             | String      | Formatted CPF document.                             |
| `email`           | String      | Electronic mail address.                            |
| `statusMatricula` | Enum        | Current status: `ATIVA`, `INADIMPLENTE`, `INATIVA`. |

### Entity: Plano (Subscription Plan)

| Attribute     | Type          | Description                                 |
| ------------- | ------------- | ------------------------------------------- |
| `id`          | UUID/String   | Primary Key.                                |
| `nome`        | String        | Commercial name (e.g., Monthly, Quarterly). |
| `preco`       | Float/Decimal | Monetary value.                             |
| `duracaoDias` | Integer       | Validity in days.                           |

### Entity: Treino (Workout)

| Attribute     | Type        | Description                                                       |
| ------------- | ----------- | ----------------------------------------------------------------- |
| `id`          | UUID/String | Primary Key.                                                      |
| `alunoId`     | UUID/String | Foreign Key referencing Aluno.                                    |
| `instrutorId` | UUID/String | Foreign Key referencing Funcionário (or 'IA' for auto-generated). |
| `objetivo`    | String      | Physical objective (e.g., Hypertrophy, Weight Loss).              |

### Entity: Funcionário (Staff)

| Attribute      | Type        | Description                                                      |
| -------------- | ----------- | ---------------------------------------------------------------- |
| `id`           | UUID/String | Primary Key (matches Supabase Auth UID).                         |
| `nomeCompleto` | String      | Full legal name.                                                 |
| `role`         | Enum        | System permission role: `RECEPCIONISTA`, `INSTRUTOR`, `GERENTE`. |
