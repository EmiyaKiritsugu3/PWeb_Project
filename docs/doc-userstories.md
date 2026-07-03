# Documento de User Stories — Five Star Academy

## Introdução

Este documento reúne as **User Stories** do sistema de gestão Five Star Academy, seguindo o modelo clássico:

> **Como** [ator], **desejo** [ação] **para** [objetivo]

Cada história contém critérios de aceitação objetivos que definem quando a funcionalidade pode ser considerada concluída. As histórias estão organizadas por módulo funcional e representam todas as funcionalidades atualmente implementadas no sistema.

### Atores

| Ator | Descrição |
|------|-----------|
| **Admin / Gerente** | Administrador geral da academia. Acesso completo ao painel de gestão. |
| **Recepcionista** | Funcionário responsável pelo atendimento presencial. Acesso a alunos, matrículas e finanças. |
| **Instrutor / Personal** | Profissional de educação física. Cria e gerencia treinos dos alunos. |
| **Aluno** | Cliente da academia. Acessa o portal do aluno para treinos e acompanhamento. |

### Legenda de Status

| Status | Significado |
|--------|-------------|
| **Implementado** | Funcionalidade desenvolvida, testada e em produção. |
| **Em andamento** | Funcionalidade em desenvolvimento. |
| **Pendente** | Funcionalidade planejada mas não iniciada. |

---

## Módulo: Gestão de Alunos

### US01 — Cadastro e Gestão de Alunos

| Campo | Valor |
|-------|-------|
| **ID** | US01 |
| **Ator** | Admin / Gerente / Recepcionista |
| **Título** | Cadastro e gestão de alunos |
| **Descrição** | Como **admin, gerente ou recepcionista**, desejo cadastrar, editar, visualizar e buscar alunos da academia para manter o cadastro atualizado e gerenciar o relacionamento com cada cliente. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O usuário deve acessar a lista de alunos em `/dashboard/alunos` com uma tabela contendo nome, e-mail, telefone, status da matrícula e ações disponíveis.
2. O formulário de cadastro deve permitir inserir nome completo, CPF (único), e-mail (único), telefone, data de nascimento e foto.
3. Deve ser possível editar todos os campos de um aluno existente e salvar as alterações.
4. A lista deve permitir busca por nome ou CPF e exibir indicadores visuais do status da matrícula (Ativa, Inadimplente, Inativa).
5. A página de detalhes do aluno (`/dashboard/alunos/[id]`) deve exibir informações completas, histórico de matrículas e opção de gerenciar treinos.

---

### US02 — Gestão de Planos de Academia

| Campo | Valor |
|-------|-------|
| **ID** | US02 |
| **Ator** | Admin / Gerente |
| **Título** | Gestão de planos de academia |
| **Descrição** | Como **admin ou gerente**, desejo criar e gerenciar planos de academia com diferentes preços e durações para oferecer opções de contratação aos alunos. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O usuário deve acessar a gestão de planos em `/dashboard/planos` com uma listagem de todos os planos cadastrados.
2. Deve ser possível cadastrar um novo plano informando nome, preço (em reais) e duração em dias.
3. Cada plano deve poder ser editado e excluído (com confirmação).
4. A lista de planos deve exibir nome, valor formatado em moeda brasileira e duração em dias.
5. Ao excluir um plano, o sistema deve verificar se existem matrículas ativas vinculadas antes de permitir a exclusão.

---

### US03 — Gerenciamento de Matrículas

| Campo | Valor |
|-------|-------|
| **ID** | US03 |
| **Ator** | Admin / Gerente / Recepcionista |
| **Título** | Gerenciamento de matrículas de alunos |
| **Descrição** | Como **admin, gerente ou recepcionista**, desejo matricular alunos em planos e gerenciar o ciclo de matrícula para controlar o acesso aos serviços da academia. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O usuário deve poder matricular um aluno em um plano selecionando o plano desejado e definindo a data de vencimento.
2. A matrícula deve registrar automaticamente a data de início e vincular aluno ao plano.
3. O sistema deve exibir o status da matrícula (Ativa ou Vencida) no perfil do aluno e na listagem geral.
4. Matrículas vencidas devem ser identificáveis para que o financeiro possa agir.
5. O histórico de matrículas do aluno deve ficar acessível na página de detalhes do aluno.

---

## Módulo: Gestão Financeira

### US04 — Controle Financeiro e Pagamentos

| Campo | Valor |
|-------|-------|
| **ID** | US04 |
| **Ator** | Admin / Gerente / Recepcionista |
| **Título** | Controle financeiro e pagamentos |
| **Descrição** | Como **admin, gerente ou recepcionista**, desejo visualizar alunos inadimplentes e registrar pagamentos para manter a saúde financeira da academia. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O usuário deve acessar o controle financeiro em `/dashboard/financeiro` com a lista de alunos inadimplentes.
2. A listagem deve exibir nome, e-mail e status da matrícula de cada aluno inadimplente.
3. Deve ser possível registrar um pagamento para um aluno inadimplente, informando o valor, método de pagamento (PIX, Dinheiro, Cartão) e confirmando a operação.
4. Ao registrar o pagamento, o status da matrícula do aluno deve ser atualizado automaticamente para Ativa.
5. O dashboard principal (`/dashboard`) deve exibir indicadores de faturamento mensal, total de alunos, matrículas ativas e quantidade de inadimplentes.
6. O dashboard deve conter um gráfico de crescimento anual de alunos.

---

## Módulo: Gestão de Treinos

### US05 — Criação de Treinos Personalizados

| Campo | Valor |
|-------|-------|
| **ID** | US05 |
| **Ator** | Instrutor / Admin |
| **Título** | Criação de treinos personalizados |
| **Descrição** | Como **instrutor**, desejo criar treinos personalizados para cada aluno, selecionando exercícios, séries e repetições, para montar planos de treino alinhados aos objetivos do aluno. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O instrutor deve acessar a página de treinos em `/dashboard/treinos` e selecionar um aluno para gerenciar seus treinos.
2. Deve ser possível criar um treino manual informando objetivo e adicionando exercícios com nome, séries, repetições e observações.
3. O catálogo de exercícios deve ser selecionável a partir de uma lista pré-definida organizada por grupo muscular.
4. Deve ser possível adicionar múltiplos exercícios ao mesmo treino e remover exercícios indesejados.
5. O treino deve ser salvo e associado ao aluno selecionado, ficando disponível no portal do aluno.

---

### US06 — Geração de Treinos com IA

| Campo | Valor |
|-------|-------|
| **ID** | US06 |
| **Ator** | Instrutor / Admin |
| **Título** | Geração de treinos com inteligência artificial |
| **Descrição** | Como **instrutor**, desejo gerar planos de treino semanais completos usando inteligência artificial (Google Gemini via Genkit) para otimizar a criação de programas personalizados para meus alunos. |
| **Prioridade** | Média |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O instrutor deve acessar um formulário de geração de treino com campos para objetivo principal, nível de experiência, dias por semana e observações adicionais.
2. Ao submeter, a IA deve gerar um plano semanal com nome do plano, treinos para cada dia, exercícios, séries, repetições e grupo muscular.
3. O plano gerado deve ser exibido para revisão antes de ser salvo, permitindo editar nome do plano, nomes dos treinos, exercícios, séries e repetições.
4. Após revisão, o instrutor deve poder salvar e atribuir o plano ao aluno em lote.
5. Cada treino do plano deve ser persistido no banco de dados como um treino individual associado ao aluno.
6. Em caso de falha da IA, o sistema deve exibir uma mensagem de erro amigável e permitir nova tentativa.

---

## Módulo: Autenticação e Acesso

### US07 — Login e Autenticação

| Campo | Valor |
|-------|-------|
| **ID** | US07 |
| **Ator** | Admin / Gerente / Recepcionista / Aluno |
| **Título** | Login e autenticação de usuários |
| **Descrição** | Como **usuário do sistema (admin, funcionário ou aluno)**, desejo fazer login de forma segura utilizando e-mail e senha para acessar o painel ou portal correspondente ao meu perfil. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. A tela de login administrativo deve estar disponível em `/login` e a de alunos em `/aluno/login`.
2. O login deve utilizar Supabase Auth com suporte a SSR (Server-Side Rendering).
3. Após autenticação, admins e funcionários devem ser redirecionados ao dashboard (`/dashboard`).
4. Após autenticação, alunos devem ser redirecionados ao portal do aluno (`/aluno/dashboard`).
5. Rotas protegidas devem redirecionar usuários não autenticados para a tela de login apropriada.
6. O sistema deve exibir o menu do usuário logado com opção de sair (logout).

---

## Módulo: Portal do Aluno

### US08 — Dashboard do Aluno

| Campo | Valor |
|-------|-------|
| **ID** | US08 |
| **Ator** | Aluno |
| **Título** | Dashboard pessoal do aluno |
| **Descrição** | Como **aluno**, desejo acessar um dashboard pessoal após o login para visualizar meu progresso, treino do dia e informações da minha matrícula. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O dashboard do aluno deve ser acessível em `/aluno/dashboard` e exibir uma saudação personalizada com o nome do aluno.
2. Deve mostrar o treino do dia (se houver) com a lista de exercícios a serem realizados.
3. Deve exibir cards com informações de streak (dias seguidos), treinos no mês e nível atual com barra de progresso de XP.
4. Deve conter uma seção de conquistas (gamificação) com badges visuais.
5. Deve exibir o status da matrícula do aluno.
6. O layout deve ser responsivo e com design moderno (tema escuro).

---

### US09 — Execução do Treino do Dia

| Campo | Valor |
|-------|-------|
| **ID** | US09 |
| **Ator** | Aluno |
| **Título** | Execução do treino do dia |
| **Descrição** | Como **aluno**, desejo iniciar o treino do dia, visualizar os exercícios com instruções e marcar as séries como concluídas para registrar meu progresso. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O aluno deve poder visualizar o treino do dia com todos os exercícios, séries, repetições e observações.
2. Para cada exercício, deve haver um botão para visualizar detalhes e instruções em um modal (ExercicioViewer).
3. Durante a execução, o aluno deve poder marcar séries como concluídas com informações de peso e repetições realizadas.
4. Ao finalizar o treino, o sistema deve registrar o histórico de treino (`HistoricoTreino` e `SerieExecutada`) e conceder XP ao aluno.
5. Após finalizar, o sistema deve exibir uma notificação de sucesso informando os XP ganhos.

---

### US10 — Gamificação: XP, Nível e Streaks

| Campo | Valor |
|-------|-------|
| **ID** | US10 |
| **Ator** | Aluno |
| **Título** | Sistema de gamificação (XP, nível e streaks) |
| **Descrição** | Como **aluno**, desejo acumular experiência (XP), subir de nível e manter uma sequência de dias consecutivos de treino (streak) para me manter motivado e consistente. |
| **Prioridade** | Média |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O aluno deve ganhar XP ao completar treinos, com valor fixo por treino finalizado (por exemplo, 500 XP).
2. O progresso de XP deve ser exibido no dashboard com uma barra circular indicando a porcentagem para o próximo nível.
3. O streak (dias seguidos de treino) deve ser calculado com base no histórico de treinos e exibido no dashboard.
4. O nível atual do aluno deve ser exibido no dashboard ao lado da contagem de XP.
5. O sistema deve exibir badges de conquistas, com algumas já desbloqueadas e outras bloqueadas (efeito visual de escala de cinza).
6. O total de treinos no mês deve ser contabilizado e exibido como métrica no dashboard.

---

### US11 — Meus Treinos (Pessoais e do Instrutor)

| Campo | Valor |
|-------|-------|
| **ID** | US11 |
| **Ator** | Aluno |
| **Título** | Meus treinos pessoais e do instrutor |
| **Descrição** | Como **aluno**, desejo visualizar todos os meus treinos em uma página separada, diferenciando os treinos criados por mim dos treinos enviados pelo meu personal, para organizar minha rotina de exercícios. |
| **Prioridade** | Alta |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. O aluno deve acessar a página em `/aluno/meus-treinos` com duas seções: "Planos do Personal" e "Meus Treinos Pessoais".
2. Treinos do personal devem ser exibidos com badge "Do Personal" e não devem permitir edição ou exclusão pelo aluno.
3. Treinos pessoais devem permitir edição, exclusão e agendamento por dia da semana.
4. O aluno deve poder criar novos treinos manualmente, adicionando exercícios com séries e repetições.
5. O aluno deve poder usar o gerador de treinos com IA na página, com os mesmos parâmetros do painel administrativo.
6. Cada treino deve ter um botão "Iniciar" que abre uma sessão de treino interativa (`WorkoutSession`).

---

## Módulo: Inteligência Artificial

### US12 — Feedback Motivacional com IA Pós-Treino

| Campo | Valor |
|-------|-------|
| **ID** | US12 |
| **Ator** | Aluno |
| **Título** | Feedback motivacional gerado por IA após o treino |
| **Descrição** | Como **aluno**, desejo receber uma mensagem de feedback personalizada gerada por IA após finalizar meu treino para obter incentivo e dicas práticas baseadas no meu desempenho. |
| **Prioridade** | Média |
| **Status** | Implementado |

**Critérios de Aceitação:**

1. Imediatamente após finalizar um treino, o sistema deve chamar o flow de IA `generateWorkoutFeedback` com o objetivo do treino e os exercícios concluídos.
2. O feedback deve conter um título vibrante e motivacional e uma mensagem de 2 a 3 frases.
3. A mensagem deve incluir um reforço positivo sobre o esforço e uma dica prática relacionada ao objetivo do treino (hipertrofia, perda de peso, etc.).
4. Caso o aluno não tenha concluído nenhum exercício, o sistema deve retornar uma mensagem padrão de incentivo sem chamar a IA.
5. Se a IA falhar, o sistema deve exibir uma notificação informando que o feedback está indisponível, mas o treino deve ser sincronizado normalmente.
6. O feedback deve ser exibido em um card visual na tela do dashboard (`CardFeedback`).

---

## Tabela Resumo

| ID | Título | Módulo | Ator | Prioridade | Status |
|----|--------|--------|------|------------|--------|
| US01 | Cadastro e Gestão de Alunos | Gestão de Alunos | Admin / Gerente / Recepcionista | Alta | Implementado |
| US02 | Gestão de Planos de Academia | Gestão de Alunos | Admin / Gerente | Alta | Implementado |
| US03 | Gerenciamento de Matrículas | Gestão de Alunos | Admin / Gerente / Recepcionista | Alta | Implementado |
| US04 | Controle Financeiro e Pagamentos | Gestão Financeira | Admin / Gerente / Recepcionista | Alta | Implementado |
| US05 | Criação de Treinos Personalizados | Gestão de Treinos | Instrutor / Admin | Alta | Implementado |
| US06 | Geração de Treinos com IA | Gestão de Treinos | Instrutor / Admin | Média | Implementado |
| US07 | Login e Autenticação | Autenticação | Admin / Funcionário / Aluno | Alta | Implementado |
| US08 | Dashboard Pessoal do Aluno | Portal do Aluno | Aluno | Alta | Implementado |
| US09 | Execução do Treino do Dia | Portal do Aluno | Aluno | Alta | Implementado |
| US10 | Gamificação (XP, Nível, Streaks) | Portal do Aluno | Aluno | Média | Implementado |
| US11 | Meus Treinos | Portal do Aluno | Aluno | Alta | Implementado |
| US12 | Feedback Motivacional com IA | IA | Aluno | Média | Implementado |

---

## Histórico de Revisão

| Data | Versão | Descrição | Autor |
|------|--------|-----------|-------|
| 2026-07-02 | 1.0 | Criação inicial do documento com 12 user stories mapeando todas as funcionalidades implementadas. | — |
