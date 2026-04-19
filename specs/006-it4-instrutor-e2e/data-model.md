# Data Model: It4 — INSTRUTOR Workflow E2E

No new entities or schema changes. All models already exist.

## Relevant Existing Entities

### Treino (already in schema)

| Field       | Type           | Relevance                                          |
| ----------- | -------------- | -------------------------------------------------- |
| id          | UUID           | Primary key                                        |
| alunoId     | String (UUID)  | Links treino to student                            |
| instrutorId | String? (UUID) | If set and ≠ alunoId → displayed as "Do Personal"  |
| objetivo    | String         | Workout goal (Hipertrofia / Perda de Peso / Força) |
| exercicios  | Exercicio[]    | Exercises nested within the workout                |

### Key Invariant

`treino.instrutorId !== null && treino.instrutorId !== treino.alunoId`
→ the treino is a "Personal" workout assigned by an INSTRUTOR.

This invariant is enforced by `meus-treinos-client.tsx:66-68`.

## Seed Data (E2E, no changes needed)

| Entity    | UUID                                 | Notes                              |
| --------- | ------------------------------------ | ---------------------------------- |
| INSTRUTOR | 00000000-0000-0000-0000-000000000003 | Funcionário, role=INSTRUTOR        |
| ALUNO     | 00000000-0000-0000-0000-000000000004 | Aluno, email=aluno@test.com        |
| Treino    | 00000000-0000-0000-0000-000000000010 | Already seeded for workout session |
