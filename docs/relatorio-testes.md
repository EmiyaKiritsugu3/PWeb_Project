# Relatório de Testes — Iteração 4 (P5)

**Disciplina:** Engenharia de Software II — DCT2302
**Projeto:** Five Star Academy — Sistema de Gestão Academia
**Iteração:** 4 — Integração Contínua, Implantação e Qualidade
**Data:** 06 de Julho de 2026
**Desenvolvedor:** José Inamar de Medeiros Júnior (20200018540)

---

## 1. User Story do Membro (P5 §2)

### US13 — Detalhes do Aluno: Tabelas Responsivas Mobile

> **User Story implementada pelo membro nesta iteração**, da camada de visualização até a persistência (camada de visualização responsiva sobre dados Prisma já existentes). Referência: PRD-8 Mobile Card Variant, PR #187 (merge squash em `main`, commit `3ddf0fb`).

**Como** instrutor/gerente,
**Eu quero** ver as tabelas de Matrículas e Pagamentos do detalhe do aluno como cards empilhados no mobile,
**Para que** eu consiga ler os dados sem rolagem horizontal em telas pequenas.

**Especificação (fluxos derivados dos critérios de aceitação PRD-8):**

- **Fluxo A1 — Renderização mobile (<768px):**
  - A1.1 — Abrir `/dashboard/alunos/[id]` em viewport 390×844 (iPhone 12).
  - A1.2 — `MatriculasTable` renderiza como card stacked (`dl`/`dt`/`dd`, `grid-cols-2`) com Plano, Início, Vencimento, Status.
  - A1.3 — `PagamentosTable` renderiza como card stacked (Data, Valor, Método — sem campo status).
  - A1.4 — Nenhuma rolagem horizontal na página.
- **Fluxo A2 — Preservação desktop (≥768px):**
  - A2.1 — Redimensionar viewport para ≥768px.
  - A2.2 — Tabelas `Table` (shadcn) hidratadas e visíveis.
  - A2.3 — Cards mobile ocultos (`md:hidden` / `hidden md:block`), sem regressão desktop.
- **Fluxo A3 — Paridade de conteúdo mobile↔desktop:**
  - A3.1 — Alternar entre mobile e desktop sem JavaScript adicional (CSS-only).
  - A3.2 — Conteúdo de cada tabela idêntico entre mobile e desktop (Matrículas: plano, início, vencimento, status; Pagamentos: data, valor, método).
  - A3.3 — Estrutura semântica acessível (`dl`/`dt`/`dd` em vez de `div`).
  - A3.4 — Assertions existentes preservadas (`getByText` → `getAllByText` cobre mobile card + desktop table).

---

## 2. Tabela 1 — Execução dos Testes da US13

| Teste                                          | Descrição                   | Especificação                                                                                                        | Resultado                                                                                                                                                                                  |
| ---------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Teste 01: Renderizar tabelas mobile (<md)**  | Fluxo A1 (passos A1.1–A1.4) | Implementação segue os passos A1.1–A1.4. Cards `dl`/`dt`/`dd` empilhados, sem rolagem horizontal.                    | ✅ OK. `MatriculasTable` e `PagamentosTable` renderizam como cards em 390×844. Sem scroll horizontal.                                                                                      |
| **Teste 02: Preservar tabelas desktop (≥md)**  | Fluxo A2 (passos A2.1–A2.3) | Implementação segue A2.1–A2.3. Tabelas shadcn visíveis em ≥768px, cards mobile ocultos.                              | ✅ OK. `Table` hydrated em ≥768px. Cards `md:hidden` ocultos. Sem regressão desktop.                                                                                                       |
| **Teste 03: Paridade conteúdo mobile↔desktop** | Fluxo A3 (passos A3.1–A3.4) | Implementação segue A3.1–A3.4. Alternância CSS-only, conteúdo idêntico, estrutura semântica, assertions preservadas. | ✅ OK. Conteúdo idêntico (Matrículas: plano, início, vencimento, status; Pagamentos: data, valor, método). `getAllByText` valida mobile card + desktop table em DOM. Suite 1137/1137 pass. |

---

## 3. Tabela 2 — Providências

> Testes da US13 (01–03) não geraram providências. Testes P5 de infraestrutura/qualidade (04–06) falharam inicialmente e geraram as providências abaixo.

| Teste                                               | Providência                                                                                                                                                                | Tarefas/Tipo                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Teste 04 — Cobertura branch ≥80% (P5 §4)**        | Excluir `src/components/ui/**` do coverage vitest e SonarQube (Radix wrappers, não lógica de negócio). Branch 79.65% → 84.53%. Issue #188.                                 | Tarefa: Bug de Cobertura. (fechada) |
| **Teste 05 — Ambiente Docker reproduzível (P5 §5)** | Criar `docker-compose.yml` (postgres:16-alpine com healthcheck + node:22-alpine dev com migrate/seed auto). Issue #189.                                                    | Tarefa: Infraestrutura. (fechada)   |
| **Teste 06 — Docs de implantação (P5 §5)**          | Criar `docs/doc-deploy.md` (Vercel + compose + CI + SemVer + Conventional Commits + AcademicDevFlow) + `docs/sonarqube/config.md` + `docs/sonarqube/scans.md`. Issue #190. | Tarefa: Documentação. (fechada)     |

---

## 4. Resumo das Métricas P5

| Indicador                    | Meta                 | Resultado           | Status                |
| ---------------------------- | -------------------- | ------------------- | --------------------- |
| Cobertura de Código (branch) | ≥ 80%                | 84.53%              | ✅                    |
| Testes Unitários             | Todos passando       | 1.137/1.137         | ✅                    |
| Testes E2E (Playwright)      | Configurados         | 21 cenários         | ✅                    |
| SonarQube                    | 2x/semana            | 1ª exec. 2026-07-06 | 🟡 (2ª em 2026-07-10) |
| Quality Gate (SonarCloud)    | Pass                 | Pass                | ✅                    |
| Docker Compose               | `docker-compose.yml` | Criado              | ✅                    |
| Deploy doc                   | `docs/doc-deploy.md` | Criado              | ✅                    |
| TypeScript                   | 0 erros              | 0 erros             | ✅                    |
| Lint                         | 0 erros              | 0 erros             | ✅                    |

---

## 5. Arquivos da US13 (PR #187)

- `src/app/dashboard/alunos/[id]/page.tsx` (89+ 40-)
- `src/app/dashboard/alunos/[id]/page.test.tsx` (40+ 5-)

**Testes unitários (4 novos/ajustados):**

- `getAllByText` para status/metodo/plano (mobile card + desktop table ambos em DOM).
- `dl` count: valida estrutura do card mobile (1 `dl` por tabela mobile).
- Suite global: 1137/1137 pass.

**Testes E2E:** fluxo de matrícula em `tests/e2e/specs/enrollment.spec.ts` cobre `/dashboard/alunos/[id]`. Não há spec PRD-8 dedicado — os 21 cenários E2E existentes permanecem verdes (sem regressão), validando A2 (desktop preservado).

---

## 6. CI/CD Pipeline

| Check                           | Status            |
| ------------------------------- | ----------------- |
| TypeScript (`tsc --noEmit`)     | ✅ 0 erros        |
| ESLint (`eslint src`)           | ✅ 0 erros        |
| Prettier (`prettier --check .`) | ✅                |
| Vitest (`vitest run`)           | ✅ 1.137 passando |
| SonarCloud Scan                 | ✅                |
| CodeQL                          | ✅                |
| Semgrep SAST                    | ✅                |
| Semgrep Secrets                 | ✅                |
| GitGuardian                     | ✅                |
| Vercel Preview Deploy           | ✅                |

SonarQube 2x/semana via cron `3 9 * * 1,4` (seg + qui 09:03 UTC) + `workflow_dispatch`.

---

## 7. Conclusão

A Iteração 4 (P5) foi concluída com sucesso. A User Story do membro (US13 — Detalhes do Aluno: Tabelas Responsivas Mobile, PRD-8, PR #187) foi implementada da tela ao banco e todos os seus fluxos (A1, A2, A3) passaram nos testes. As providências da Tabela 2 (cobertura, Docker, docs) foram executadas e validadas. A cobertura de branch atingiu 84.53% (meta ≥80%), todos os 1.137 testes unitários passam, o Quality Gate do SonarCloud está aprovado e o pipeline CI/CD está 100% verde (10/10 checks). Ambiente Docker reproduzível criado e documentação de implantação completa.

---

_Relatório gerado em 06 de Julho de 2026 — Iteração 4 (P5)_
