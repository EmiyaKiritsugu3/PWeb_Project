# Documento de Visão - Five Star Academy

**Versão:** 1.0
**Data:** Julho de 2026
**Disciplina:** Engenharia de Software II

---

## 1. Introdução

### 1.1 Projeto

O **Five Star Academy** é um sistema de gestão full-stack moderno para academias de musculação, desenvolvido como parte da disciplina de Engenharia de Software II. O sistema combina ferramentas administrativas robustas com uma experiência gamificada para alunos, potencializada por Inteligência Artificial Generativa.

A aplicação é construída sobre Next.js 15 com App Router, TypeScript estrito, Prisma ORM com PostgreSQL hospedado no Supabase, autenticação via Supabase Auth com suporte SSR, e integração com Google Gemini para geração inteligente de conteúdo.

### 1.2 Propósito

O propósito do Five Star Academy é oferecer uma plataforma unificada que atenda às necessidades operacionais de uma academia de médio porte, unindo em um único sistema:

- A gestão administrativa de alunos, matrículas, planos e pagamentos.
- A criação e o acompanhamento de treinos personalizados.
- Um portal do aluno com elementos de gamificação para engajamento.
- Geração automatizada de planos de treino e feedback motivacional via IA.

O sistema busca resolver problemas comuns do setor, como a falta de ferramentas integradas de CRM, o alto índice de evasão de alunos por falta de engajamento, e a dificuldade de personalização de treinos em escala.

### 1.3 Escopo

O escopo do projeto abrange o desenvolvimento de uma aplicação web responsiva com duas áreas principais de acesso:

- **Painel de Gestão (/dashboard):** Destinado a funcionários da academia (gerentes, instrutores e recepcionistas), oferecendo funcionalidades de cadastro e gestão de alunos, controle de matrículas e planos, monitoramento financeiro, dashboards analíticos e geração de treinos por IA.
- **Portal do Aluno (/aluno):** Destinado aos alunos da academia, oferecendo visualização e execução de treinos diários, histórico de atividades, gerenciamento de treinos pessoais ("Meus Treinos") com agendamento por dia da semana, sistema de gamificação com níveis, experiência (XP) e streaks, além de feedback motivacional gerado por IA.

O escopo não inclui aplicativos mobile nativos, integração com sistemas de terceiros (como ERPs contábeis), ou módulo de vendas de produtos (loja).

---

## 2. Descrição dos Stakeholders

### 2.1 Alunos

**Descrição:** Clientes da academia que utilizam o sistema para acessar seus treinos, acompanhar seu progresso e manter sua rotina de exercícios.

**Necessidades principais:**

- Visualizar o treino do dia com instruções claras de execução.
- Registrar séries executadas, pesos e repetições.
- Acompanhar seu nível, experiência (XP) e streaks de comparecimento.
- Receber feedback motivacional ao finalizar um treino.
- Diferenciar entre treinos criados por instrutores e treinos pessoais.

**Quantidade estimada:** Centenas de usuários simultâneos nos horários de pico.

### 2.2 Instrutores

**Descrição:** Profissionais de educação física responsáveis por criar e acompanhar os planos de treino dos alunos.

**Necessidades principais:**

- Visualizar a lista de alunos sob sua supervisão.
- Criar e editar planos de treino personalizados para cada aluno.
- Gerar treinos automaticamente com auxílio de IA.
- Acompanhar o histórico de execução dos treinos pelos alunos.

### 2.3 Recepcionistas

**Descrição:** Funcionários responsáveis pelo atendimento inicial, cadastro de novos alunos e gestão de matrículas e pagamentos.

**Necessidades principais:**

- Realizar cadastro completo de novos alunos (dados pessoais, foto, biometria).
- Gerenciar matrículas e vínculo a planos.
- Registrar pagamentos e consultar status financeiro dos alunos.
- Atualizar dados cadastrais dos alunos.

### 2.4 Gerentes

**Descrição:** Administradores da academia responsáveis pela visão estratégica do negócio, incluindo análise de indicadores e definição de planos.

**Necessidades principais:**

- Acessar dashboards com indicadores de crescimento, retenção e inadimplência.
- Gerenciar planos oferecidos (preços, duração e características).
- Visualizar relatórios financeiros consolidados.
- Gerenciar funcionários e suas permissões de acesso.

### 2.5 Equipe de Desenvolvimento

**Descrição:** Desenvolvedores responsáveis pela construção, manutenção e evolução do sistema.

**Necessidades principais:**

- Código-fonte com TypeScript estrito e tipagem forte.
- Documentação técnica clara (modelo de dados, arquitetura, qualidade).
- Pipeline de CI/CD com quality gates automatizados.
- Ferramentas de observabilidade (Sentry, cobertura de testes).

---

## 3. Visão Geral do Produto

### 3.1 Problema

Academias de pequeno e médio porte frequentemente operam com ferramentas desconectadas: uma planilha para cadastro de alunos, outro sistema para controle financeiro, quadro branco para treinos. Essa fragmentação gera retrabalho, perda de informações e dificuldade de análise estratégica. Além disso, a falta de engajamento dos alunos é uma das principais causas de evasão, e poucas ferramentas oferecem mecanismos para incentivar a consistência nos treinos.

### 3.2 Solução

O Five Star Academy propõe uma plataforma integrada que centraliza todas as operações da academia em um único sistema. O produto oferece:

- **Gestão unificada:** Um banco de dados único para alunos, matrículas, planos, pagamentos e treinos, eliminando silos de informação.
- **Inteligência Artificial:** Geração automatizada de planos de treino semanais personalizados usando Google Gemini, e feedback motivacional gerado por IA após cada treino concluído.
- **Gamificação:** Sistema de níveis, experiência (XP), streaks de comparecimento e conquistas para incentivar a frequência e a consistência dos alunos.
- **Duas jornadas isoladas:** Painel de gestão para funcionários e portal do aluno com acesso separado e seguro, cada um com funcionalidades adaptadas ao seu perfil.
- **Qualidade de software:** Codebase com TypeScript estrito, testes automatizados (unitários, integração e E2E), CI/CD com quality gates, e observabilidade via Sentry.

### 3.3 Diferenciais

- Geração de treinos por IA Generativa (Google Gemini via Genkit).
- Gamificação com sistema de progressão (nível, XP e streaks).
- Arquitetura moderna Next.js 15 com Server Components e Server Actions.
- Integração contínua com quality gates rigorosos (lint, typecheck, testes, cobertura).
- Filtro de dados sensíveis (PII) para conformidade com privacidade.

---

## 4. Funcionalidades Principais

### 4.1 Gestão de Alunos

Módulo de CRM completo que permite cadastrar, editar e gerenciar alunos. Inclui campos como nome, CPF, email, telefone, data de nascimento, foto e biometria hash. O sistema mantém o status da matrícula (ativa, inadimplente, inativa) e oferece busca e filtro para localização rápida.

### 4.2 Gestão de Planos e Matrículas

Permite definir planos com nome, preço e duração em dias. Cada aluno pode ser matriculado em um plano, com data de início e vencimento controlados pelo sistema. O status da matrícula é atualizado automaticamente conforme a data de vencimento.

### 4.3 Controle Financeiro

Módulo para registro e consulta de pagamentos, com suporte a múltiplos métodos (PIX, dinheiro, cartão). O sistema permite identificar alunos inadimplentes e acompanhar o histórico financeiro de cada matrícula.

### 4.4 Gestão de Treinos

Funcionalidade para criação de treinos personalizados, associando exercícios com séries, repetições e observações. Os treinos podem ser criados por instrutores ou gerados automaticamente por IA. Cada treino é vinculado a um aluno e pode ser organizado por dia da semana.

### 4.5 Geração de Treinos com IA

Integração com Google Genkit e modelo Gemini para criar planos de treino semanais personalizados. O instrutor informa o objetivo do aluno (ex.: hipertrofia, emagrecimento, resistência) e o sistema gera automaticamente um plano completo com exercícios, séries e repetições.

### 4.6 Portal do Aluno e Gamificação

Área restrita onde o aluno acessa seu treino do dia, registra a execução dos exercícios e visualiza seu progresso. O sistema de gamificação inclui:

- **Níveis:** O aluno ganha experiência e sobe de nível conforme treina.
- **XP:** Pontos de experiência acumulados a cada treino concluído.
- **Streaks (Ofensivas):** Dias consecutivos de treino registrados, incentivando a consistência.
- **Treino do Dia:** Interface interativa para execução passo a passo dos exercícios.
- **Feedback Motivacional:** Mensagem personalizada gerada por IA ao finalizar cada treino.

### 4.7 Dashboard Analítico

Painel com indicadores-chave para gerentes, incluindo total de alunos ativos, taxa de inadimplência, receita do período, crescimento de matrículas e engajamento dos alunos. Os dados são agregados em tempo real a partir do banco de dados.

---

## 5. Requisitos Funcionais

### 5.1 Módulo de Autenticação e Acesso

| ID   | Descrição                                                                                 | Prioridade |
| ---- | ----------------------------------------------------------------------------------------- | ---------- |
| RF01 | O sistema deve permitir login de funcionários via email e senha utilizando Supabase Auth. | Alta       |
| RF02 | O sistema deve permitir login de alunos via email e senha em portal separado.             | Alta       |
| RF03 | O sistema deve utilizar autenticação SSR (Server-Side Rendering) para rotas protegidas.   | Alta       |
| RF04 | O sistema deve redirecionar usuários não autenticados para a página de login.             | Alta       |
| RF05 | O sistema deve diferenciar permissões por papel: GERENTE, INSTRUTOR e RECEPCIONISTA.      | Alta       |

### 5.2 Módulo de Gestão de Alunos

| ID   | Descrição                                                                                             | Prioridade |
| ---- | ----------------------------------------------------------------------------------------------------- | ---------- |
| RF06 | O sistema deve permitir cadastrar aluno com nome completo, CPF, email, telefone e data de nascimento. | Alta       |
| RF07 | O sistema deve permitir editar dados cadastrais de um aluno existente.                                | Alta       |
| RF08 | O sistema deve permitir consultar a lista de alunos com busca e filtros.                              | Alta       |
| RF09 | O sistema deve exibir o status da matrícula de cada aluno (ativa, inadimplente, inativa).             | Alta       |
| RF10 | O sistema deve armazenar hash de biometria e URL de foto do aluno.                                    | Média      |

### 5.3 Módulo de Planos e Matrículas

| ID   | Descrição                                                                                                    | Prioridade |
| ---- | ------------------------------------------------------------------------------------------------------------ | ---------- |
| RF11 | O sistema deve permitir cadastrar planos com nome, preço e duração em dias.                                  | Alta       |
| RF12 | O sistema deve permitir editar e excluir planos existentes.                                                  | Alta       |
| RF13 | O sistema deve permitir matricular um aluno em um plano com data de início e vencimento.                     | Alta       |
| RF14 | O sistema deve atualizar automaticamente o status da matrícula para VENCIDA ao passar da data de vencimento. | Média      |

### 5.4 Módulo Financeiro

| ID   | Descrição                                                                                      | Prioridade |
| ---- | ---------------------------------------------------------------------------------------------- | ---------- |
| RF15 | O sistema deve permitir registrar pagamentos com valor, data e método (PIX, dinheiro, cartão). | Alta       |
| RF16 | O sistema deve exibir o histórico de pagamentos de cada matrícula.                             | Alta       |
| RF17 | O sistema deve identificar alunos com status INADIMPLENTE.                                     | Alta       |
| RF18 | O sistema deve exibir um resumo financeiro com receita do período.                             | Média      |

### 5.5 Módulo de Treinos

| ID   | Descrição                                                                                            | Prioridade |
| ---- | ---------------------------------------------------------------------------------------------------- | ---------- |
| RF19 | O sistema deve permitir criar treinos para um aluno com objetivo e dia da semana.                    | Alta       |
| RF20 | O sistema deve permitir associar exercícios a um treino com nome, séries, repetições e observações.  | Alta       |
| RF21 | O sistema deve permitir que o instrutor edite treinos e exercícios existentes.                       | Alta       |
| RF22 | O sistema deve gerar planos de treino semanais utilizando Google Gemini via Genkit.                  | Alta       |
| RF23 | O sistema deve exibir o treino do dia para o aluno com lista de exercícios.                          | Alta       |
| RF24 | O sistema deve permitir que o aluno registre a execução de cada série (peso, repetições, conclusão). | Alta       |
| RF25 | O sistema deve armazenar o histórico de treinos executados com data e duração.                       | Alta       |

### 5.6 Módulo de Gamificação

| ID   | Descrição                                                                | Prioridade |
| ---- | ------------------------------------------------------------------------ | ---------- |
| RF26 | O sistema deve conceder XP ao aluno ao finalizar um treino.              | Média      |
| RF27 | O sistema deve gerenciar níveis do aluno com base no XP acumulado.       | Média      |
| RF28 | O sistema deve controlar streaks de dias consecutivos de treino.         | Média      |
| RF29 | O sistema deve gerar feedback motivacional por IA ao concluir um treino. | Média      |

### 5.7 Módulo de Dashboard

| ID   | Descrição                                                                              | Prioridade |
| ---- | -------------------------------------------------------------------------------------- | ---------- |
| RF30 | O sistema deve exibir no dashboard o total de alunos ativos, inadimplentes e inativos. | Alta       |
| RF31 | O sistema deve exibir indicadores de crescimento de matrículas.                        | Média      |
| RF32 | O sistema deve exibir a receita acumulada no período.                                  | Média      |
| RF33 | O sistema deve exibir o engajamento dos alunos (treinos realizados no período).        | Média      |

---

## 6. Requisitos Não-Funcionais

### 6.1 Desempenho

| ID    | Descrição                                                                             | Prioridade |
| ----- | ------------------------------------------------------------------------------------- | ---------- |
| RNF01 | O sistema deve carregar a página inicial em até 3 segundos em conexão de banda larga. | Alta       |
| RNF02 | As consultas ao banco de dados devem responder em até 500ms para operações comuns.    | Alta       |
| RNF03 | O sistema deve suportar até 100 usuários simultâneos sem degradação significativa.    | Média      |
| RNF04 | As Server Actions devem processar requisições em até 2 segundos.                      | Média      |

### 6.2 Segurança

| ID    | Descrição                                                                                      | Prioridade |
| ----- | ---------------------------------------------------------------------------------------------- | ---------- |
| RNF05 | O sistema deve utilizar autenticação SSR com Supabase para rotas protegidas.                   | Alta       |
| RNF06 | Senhas e dados sensíveis (CPF) devem ser filtrados em logs e respostas da API.                 | Alta       |
| RNF07 | O Prisma não deve ser acessível a partir do código cliente (apenas Server Actions e services). | Alta       |
| RNF08 | O sistema deve utilizar variáveis de ambiente para chaves de API e configurações sensíveis.    | Alta       |
| RNF09 | O sistema deve implementar sanitização de entrada para prevenir XSS e SQL injection.           | Alta       |

### 6.3 Usabilidade

| ID    | Descrição                                                                                 | Prioridade |
| ----- | ----------------------------------------------------------------------------------------- | ---------- |
| RNF10 | O sistema deve ser responsivo e funcional em dispositivos móveis e desktop.               | Alta       |
| RNF11 | Os componentes de interface devem utilizar Tailwind CSS e shadcn/ui com tema consistente. | Média      |
| RNF12 | O sistema deve exibir mensagens de erro claras e amigáveis para o usuário final.          | Média      |
| RNF13 | O sistema deve fornecer feedback visual para ações do usuário (loading, sucesso, erro).   | Média      |

### 6.4 Manutenibilidade

| ID    | Descrição                                                                    | Prioridade |
| ----- | ---------------------------------------------------------------------------- | ---------- |
| RNF14 | O código deve ser escrito em TypeScript com modo estrito ativado.            | Alta       |
| RNF15 | O sistema deve possuir cobertura de testes superior a 80%.                   | Alta       |
| RNF16 | O pipeline CI deve executar lint, typecheck, testes e formatação em cada PR. | Alta       |
| RNF17 | O sistema deve utilizar Prisma ORM com schema versionado via migrations.     | Alta       |

### 6.5 Confiabilidade

| ID    | Descrição                                                                                  | Prioridade |
| ----- | ------------------------------------------------------------------------------------------ | ---------- |
| RNF18 | O sistema deve utilizar Sentry para monitoramento de erros em produção.                    | Alta       |
| RNF19 | As chamadas de IA do Genkit devem ser isoladas com try/catch para não quebrar a interface. | Alta       |
| RNF20 | O sistema deve exibir mensagens amigáveis em caso de falha na geração de treino por IA.    | Média      |

---

## 7. Restrições e Premissas

### 7.1 Restrições Técnicas

- **Frontend:** O sistema deve ser construído exclusivamente com Next.js 15+ e React, utilizando App Router.
- **Estilização:** Toda a estilização deve utilizar Tailwind CSS e componentes shadcn/ui.
- **Banco de Dados:** O banco de dados deve ser PostgreSQL, acessado exclusivamente via Prisma ORM.
- **Autenticação:** O sistema deve utilizar Supabase Auth com suporte SSR.
- **IA:** Toda funcionalidade de Inteligência Artificial deve utilizar Google Genkit com modelos Gemini.
- **Observabilidade:** O monitoramento de erros deve ser feito exclusivamente via Sentry.
- **Idioma:** A interface do sistema deve estar em português brasileiro (pt-BR).

### 7.2 Restrições de Projeto

- **Prazo:** O desenvolvimento segue o calendário acadêmico da disciplina de Engenharia de Software II.
- **Equipe:** Projeto desenvolvido individualmente por um único aluno.
- **Qualidade:** O código deve passar por quality gates obrigatórios: typecheck, lint, format:check e testes antes de cada commit.
- **Versionamento:** O projeto utiliza Git com Conventional Commits e segue SemVer.

### 7.3 Premissas

- Os usuários possuem acesso à internet e um navegador web moderno (Chrome, Firefox, Edge ou Safari).
- A academia possui um estoque de planos pré-definidos para oferta aos alunos.
- Os instrutores possuem conhecimento básico para operar um sistema web.
- Os alunos possuem smartphone ou computador para acessar o portal do aluno.
- O banco de dados PostgreSQL está hospedado no Supabase e acessível via Prisma.
- A chave de API do Google Generative AI está configurada para uso do Genkit.

---

## 8. Referências

- Next.js Documentation. Disponível em: https://nextjs.org/docs
- Prisma ORM Documentation. Disponível em: https://www.prisma.io/docs
- Supabase Documentation. Disponível em: https://supabase.com/docs
- Google Genkit Documentation. Disponível em: https://firebase.google.com/docs/genkit
- Tailwind CSS Documentation. Disponível em: https://tailwindcss.com/docs
- shadcn/ui Documentation. Disponível em: https://ui.shadcn.com
- Sentry Documentation. Disponível em: https://docs.sentry.io
- Sommerville, I. Engenharia de Software. 10. ed. Pearson, 2018.
- Repositório do Projeto. Disponível em: https://github.com/EmiyaKiritsugu3/PWeb_Project
