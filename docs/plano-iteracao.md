# Plano de Iteração — Iteração 3 (P4)

**Disciplina:** Engenharia de Software II — DCT2302
**Projeto:** Five Star Academy — Sistema de Gestão Academia
**Iteração:** 3 — Evolução, Testes de Aceitação e Qualidade
**Período:** 14/05/2026 a 10/06/2026 (oficial) | Estendido até 02/07/2026 (entrega)
**Desenvolvedor:** José Inamar de Medeiros Júnior (20200018540)

---

## 1. Objetivo da Iteração

Esta iteração tem como foco a **evolução do sistema**, a execução de **testes de aceitação** e a garantia de **qualidade** do software. Com o sistema já funcional, o objetivo é:

- Documentar formalmente todos os artefatos do projeto
- Consolidar a cobertura de testes unitários
- Executar e documentar testes de aceitação
- Garantir métricas de qualidade via SonarCloud
- Preparar release para entrega

---

## 2. User Stories Implementados e Testados

### US01 — Cadastro e Gestão de Alunos

| Campo                      | Valor                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                     | US01                                                                                                                                                               |
| **Título**                 | Cadastro e Gestão de Alunos                                                                                                                                        |
| **Ator**                   | Admin, Recepcionista                                                                                                                                               |
| **Descrição**              | Como recepcionista, desejo cadastrar, visualizar, editar e gerenciar alunos da academia                                                                            |
| **Critérios de Aceitação** | Cadastrar aluno com CPF único; listar alunos com filtros; editar dados do aluno; visualizar detalhes do aluno                                                      |
| **Status**                 | ✅ Implementado e Testado                                                                                                                                          |
| **Tela**                   | `/dashboard/alunos`                                                                                                                                                |
| **Testes**                 | `src/app/dashboard/alunos/page.test.tsx`, `src/app/dashboard/alunos/alunos-client.test.tsx`, `src/services/alunoService.test.ts`, `src/lib/actions/alunos.test.ts` |

### US02 — Gestão de Planos

| Campo                      | Valor                                                                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                     | US02                                                                                                                                               |
| **Título**                 | Criação e Gestão de Planos de Academia                                                                                                             |
| **Ator**                   | Admin, Gerente                                                                                                                                     |
| **Descrição**              | Como gerente, desejo criar e gerenciar planos de assinatura da academia                                                                            |
| **Critérios de Aceitação** | Criar plano com nome, preço e duração; listar planos; editar/excluir planos                                                                        |
| **Status**                 | ✅ Implementado e Testado                                                                                                                          |
| **Tela**                   | `/dashboard/planos`                                                                                                                                |
| **Testes**                 | `src/app/dashboard/planos/page.test.tsx`, `src/app/dashboard/planos/planos-client.test.tsx`, `src/components/dashboard/planos/form-plano.test.tsx` |

### US03 — Gestão de Matrículas

| Campo                      | Valor                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **ID**                     | US03                                                                                  |
| **Título**                 | Gerenciamento de Matrículas de Alunos                                                 |
| **Ator**                   | Admin, Recepcionista                                                                  |
| **Descrição**              | Como recepcionista, desejo associar um aluno a um plano e gerenciar sua matrícula     |
| **Critérios de Aceitação** | Matricular aluno em um plano; definir data de vencimento; alterar status da matrícula |
| **Status**                 | ✅ Implementado e Testado                                                             |
| **Entidade**               | `Matricula` (Prisma)                                                                  |
| **Testes**                 | Cobertos pelos testes de Alunos e Planos                                              |

### US04 — Controle Financeiro

| Campo                      | Valor                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **ID**                     | US04                                                                                                                                             |
| **Título**                 | Controle Financeiro e Pagamentos                                                                                                                 |
| **Ator**                   | Admin, Gerente                                                                                                                                   |
| **Descrição**              | Como gerente, desejo visualizar inadimplência e gerenciar pagamentos dos alunos                                                                  |
| **Critérios de Aceitação** | Listar pagamentos por aluno; registrar novo pagamento; visualizar status financeiro                                                              |
| **Status**                 | ✅ Implementado e Testado                                                                                                                        |
| **Tela**                   | `/dashboard/financeiro`                                                                                                                          |
| **Testes**                 | `src/app/dashboard/financeiro/page.test.tsx`, `src/app/dashboard/financeiro/financeiro-client.test.tsx`, `src/services/pagamentoService.test.ts` |

### US05 — Criação de Treinos

| Campo                      | Valor                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                     | US05                                                                                                                              |
| **Título**                 | Criação de Treinos Personalizados                                                                                                 |
| **Ator**                   | Instrutor                                                                                                                         |
| **Descrição**              | Como instrutor, desejo criar treinos personalizados com exercícios para meus alunos                                               |
| **Critérios de Aceitação** | Criar treino com objetivo e dia da semana; adicionar exercícios com séries e repetições; associar treino a aluno                  |
| **Status**                 | ✅ Implementado e Testado                                                                                                         |
| **Tela**                   | `/dashboard/treinos`                                                                                                              |
| **Testes**                 | `src/app/dashboard/treinos/page.test.tsx`, `src/app/dashboard/treinos/treinos-client.test.tsx`, `src/lib/actions/treinos.test.ts` |

### US06 — Geração de Treinos com IA

| Campo                      | Valor                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                     | US06                                                                                                                                                                      |
| **Título**                 | Geração de Treinos com Inteligência Artificial                                                                                                                            |
| **Ator**                   | Instrutor                                                                                                                                                                 |
| **Descrição**              | Como instrutor, desejo gerar planos de treino automatizados usando IA para meus alunos                                                                                    |
| **Critérios de Aceitação** | Selecionar aluno e objetivo; gerar treino via IA; revisar e salvar treino gerado                                                                                          |
| **Status**                 | ✅ Implementado e Testado                                                                                                                                                 |
| **IA**                     | Google Genkit + Gemini                                                                                                                                                    |
| **Testes**                 | `src/ai/flows/workout-generator-flow.test.ts`, `src/ai/flows/__tests__/workout-generator-validation.test.ts`, `src/components/dashboard/aluno/workout-generator.test.tsx` |

### US07 — Autenticação

| Campo                      | Valor                                                                                                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                     | US07                                                                                                                                                            |
| **Título**                 | Login e Autenticação de Usuários                                                                                                                                |
| **Ator**                   | Todos                                                                                                                                                           |
| **Descrição**              | Como usuário, desejo fazer login com email/senha para acessar o sistema                                                                                         |
| **Critérios de Aceitação** | Login com credenciais válidas; proteção de rotas; logout seguro; SSR auth                                                                                       |
| **Status**                 | ✅ Implementado e Testado                                                                                                                                       |
| **Tela**                   | `/login`, `/aluno/login`                                                                                                                                        |
| **Testes**                 | `src/app/login/page.test.tsx`, `src/app/aluno/login/page.test.tsx`, `src/app/actions/auth.test.ts`, `src/lib/auth.test.ts`, `src/utils/supabase/server.test.ts` |

### US08 — Portal do Aluno

| Campo                      | Valor                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| **ID**                     | US08                                                                                         |
| **Título**                 | Portal do Aluno — Dashboard Pessoal                                                          |
| **Ator**                   | Aluno                                                                                        |
| **Descrição**              | Como aluno, desejo acessar meu dashboard pessoal com meus dados de treino e progresso        |
| **Critérios de Aceitação** | Visualizar nível, XP e streak; ver treino do dia; acessar próximos treinos                   |
| **Status**                 | ✅ Implementado e Testado                                                                    |
| **Tela**                   | `/aluno/dashboard`                                                                           |
| **Testes**                 | `src/app/aluno/dashboard/page.test.tsx`, `src/app/aluno/dashboard/dashboard-client.test.tsx` |

### US09 — Execução de Treino

| Campo                      | Valor                                                                                                                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ID**                     | US09                                                                                                                                                                                         |
| **Título**                 | Execução de Treino do Dia                                                                                                                                                                    |
| **Ator**                   | Aluno                                                                                                                                                                                        |
| **Descrição**              | Como aluno, desejo executar meu treino do dia, marcando séries como concluídas                                                                                                               |
| **Critérios de Aceitação** | Visualizar exercícios do treino; marcar séries como concluídas; registrar duração do treino; receber feedback ao finalizar                                                                   |
| **Status**                 | ✅ Implementado e Testado                                                                                                                                                                    |
| **Componente**             | `WorkoutSession`                                                                                                                                                                             |
| **Testes**                 | `src/components/WorkoutSession.test.tsx`, `src/components/dashboard/aluno/workout-exercise-row.test.tsx`, `src/hooks/use-workout-tracker.test.ts`, `src/hooks/use-workout-exercises.test.ts` |

### US10 — Gamificação

| Campo                      | Valor                                                                                                                    |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **ID**                     | US10                                                                                                                     |
| **Título**                 | Sistema de Gamificação                                                                                                   |
| **Ator**                   | Aluno                                                                                                                    |
| **Descrição**              | Como aluno, desejo ganhar XP, subir de nível e manter streaks para me motivar                                            |
| **Critérios de Aceitação** | Ganhar XP ao concluir treinos; subir de nível com XP acumulado; manter streak de dias consecutivos; visualizar progresso |
| **Status**                 | ✅ Implementado e Testado                                                                                                |
| **Serviço**                | `gamificationService`                                                                                                    |
| **Testes**                 | `src/services/gamificationService.test.ts`                                                                               |

### US11 — Meus Treinos

| Campo                      | Valor                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| **ID**                     | US11                                                                                                  |
| **Título**                 | Meus Treinos — Pessoais e do Instrutor                                                                |
| **Ator**                   | Aluno                                                                                                 |
| **Descrição**              | Como aluno, desejo visualizar meus treinos separados entre profissionais e pessoais                   |
| **Critérios de Aceitação** | Listar treinos do instrutor; listar treinos pessoais; visualizar detalhes de cada treino              |
| **Status**                 | ✅ Implementado e Testado                                                                             |
| **Tela**                   | `/aluno/meus-treinos`                                                                                 |
| **Testes**                 | `src/app/aluno/meus-treinos/page.test.tsx`, `src/app/aluno/meus-treinos/meus-treinos-client.test.tsx` |

### US12 — Feedback IA Pós-Treino

| Campo                      | Valor                                                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **ID**                     | US12                                                                                                                  |
| **Título**                 | Feedback Motivacional com IA Pós-Treino                                                                               |
| **Ator**                   | Aluno                                                                                                                 |
| **Descrição**              | Como aluno, desejo receber feedback motivacional personalizado por IA após concluir um treino                         |
| **Critérios de Aceitação** | Gerar feedback contextual após conclusão; mensagem personalizada baseada no desempenho; exibição na tela de conclusão |
| **Status**                 | ✅ Implementado e Testado                                                                                             |
| **IA**                     | Google Genkit + Gemini                                                                                                |
| **Testes**                 | `src/ai/flows/workout-feedback-flow.test.ts`                                                                          |

---

## 3. Resumo de Testes

### Testes Unitários (Vitest)

| Métrica                    | Valor             |
| -------------------------- | ----------------- |
| **Arquivos de Teste**      | 107               |
| **Testes Totais**          | 1.070             |
| **Status**                 | ✅ Todos passando |
| **Cobertura (Statements)** | 85.23%            |
| **Cobertura (Branches)**   | 73.53%            |
| **Cobertura (Functions)**  | 81.26%            |
| **Cobertura (Lines)**      | 85.97%            |
| **Meta de Cobertura**      | 65% (✅ Atingida) |

### Testes E2E (Playwright)

| Métrica      | Valor           |
| ------------ | --------------- |
| **Cenários** | 20              |
| **Status**   | ✅ Configurados |
| **Execução** | `npm run e2e`   |

### Cobertura por Módulo

| Módulo                | Statements | Status |
| --------------------- | ---------- | ------ |
| `src/services/`       | 100%       | ✅     |
| `src/hooks/`          | 98.91%     | ✅     |
| `src/lib/`            | 91.66%     | ✅     |
| `src/components/ui/`  | 89.72%     | ✅     |
| `src/utils/supabase/` | 91.07%     | ✅     |

---

## 4. Qualidade de Código

### SonarCloud (CI Automático)

| Métrica                   | Valor                          |
| ------------------------- | ------------------------------ |
| **Plataforma**            | SonarCloud                     |
| **Projeto**               | `EmiyaKiritsugu3_PWeb_Project` |
| **Quality Gate**          | ✅ Pass                        |
| **Code Smells**           | Resolvidos (47 → 16)           |
| **Execuções na Iteração** | Múltiplas (via CI e manual)    |

### SonarQube LabENS (Execuções Manuais)

| Execução | Data           | Status               | Dashboard                                                                      |
| -------- | -------------- | -------------------- | ------------------------------------------------------------------------------ |
| **#1**   | 02/07/2026     | ✅ EXECUTION SUCCESS | [PWeb_Project](https://labens.dct.ufrn.br/sonarqube/dashboard?id=PWeb_Project) |
| **#2**   | _(a executar)_ | —                    | —                                                                              |

> **Script:** `npm run sonar:labens` (Docker + `SONAR_TOKEN`)

### CI/CD

| Pipeline                    | Status                              |
| --------------------------- | ----------------------------------- |
| **GitHub Actions (ci.yml)** | ✅ 13/13 checks                     |
| **Quality Gates**           | typecheck, lint, format:check, test |
| **SonarCloud Scan**         | ✅                                  |
| **CodeQL**                  | ✅                                  |
| **Semgrep**                 | ✅                                  |
| **GitGuardian**             | ✅                                  |
| **Vercel Preview**          | ✅                                  |

---

## 5. Atividades Realizadas na Iteração

| Atividade                            | Status | Evidência                  |
| ------------------------------------ | ------ | -------------------------- |
| Revisão do Documento de Visão        | ✅     | `docs/doc-visao.md`        |
| Revisão do Documento de Modelos      | ✅     | `docs/doc-modelos.md`      |
| Atualização da Lista de User Stories | ✅     | `docs/doc-userstories.md`  |
| Atualização do Projeto Arquitetural  | ✅     | `docs/doc-arquitetura.md`  |
| Implementação dos User Stories       | ✅     | 12 USs implementados       |
| Testes Unitários (Vitest)            | ✅     | 1.070 testes, 107 arquivos |
| Testes de Aceitação                  | ✅     | `docs/relatorio-testes.md` |
| Relatório de Testes                  | ✅     | `docs/relatorio-testes.md` |
| Correções SonarQube                  | ✅     | Code smells reduzidos      |
| Cobertura de Código                  | ✅     | 85.23% (meta: 65%)         |
| Release                              | ✅     | v0.6.0                     |

---

## 6. Commits Relevantes da Iteração

| Commit    | Descrição                                                       |
| --------- | --------------------------------------------------------------- |
| `da96861` | fix(dashboard): use title instead of tooltip on Settings button |
| `9051d75` | fix(dashboard): logout button not working in management tab     |
| `0a7cd1f` | Merge PR #142: fix/vercel-build-errors                          |
| `08aabad` | docs(plans): fix docs issues from cubic/coderabbit reviews      |
| `f9e011e` | fix: resolve SonarQube issues and increase coverage to 86%      |
| `a8e64f5` | test: reach 80% coverage (4.4% → 81%)                           |
| `bffe63b` | Merge PR #139: fix/sonarqube-code-smells                        |
| `f4cf50c` | Merge PR #138: fix/sonarqube-debt-17-issues                     |
| `c77877a` | ci: add Fallow codebase intelligence to CI pipeline             |

---

## 7. Próximos Passos (Iteração 4)

- Implementação de novas funcionalidades (se houver demanda)
- Melhoria contínua da cobertura de branches
- Expansão dos testes E2E
- Otimizações de performance

---

## 8. Links

- **Repositório:** [github.com/EmiyaKiritsugu3/PWeb_Project](https://github.com/EmiyaKiritsugu3/PWeb_Project)
- **SonarCloud:** [sonarcloud.io/project/overview?id=EmiyaKiritsugu3_PWeb_Project](https://sonarcloud.io/project/overview?id=EmiyaKiritsugu3_PWeb_Project)
- **Release:** [github.com/EmiyaKiritsugu3/PWeb_Project/releases](https://github.com/EmiyaKiritsugu3/PWeb_Project/releases)

---

_Documento gerado em 02/07/2026 — Iteração 3 (P4)_
