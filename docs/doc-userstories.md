# Documento de User Stories - SmartManagementSystem (SMS)

Este documento contém a lista de User Stories e o detalhamento do caso de uso base para o **SmartManagementSystem (SMS)**.

## Lista de User Stories

| ID       | Título                  | Descrição                                                                                         | Prioridade |
| -------- | ----------------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| **US00** | Autenticação de Usuário | Como funcionário ou aluno, quero me autenticar no sistema para acessar minhas funcionalidades.    | Essencial  |
| **US01** | Gestão de Alunos        | Como gerente, quero cadastrar e gerenciar alunos para manter o controle da academia.              | Alta       |
| **US02** | Gestão de Planos        | Como gerente, quero gerenciar os planos oferecidos pela academia.                                 | Média      |
| **US03** | Prescrição de Treinos   | Como instrutor, quero criar rotinas de treino para os alunos.                                     | Alta       |
| **US04** | Treino com IA           | Como instrutor, quero que a IA gere sugestões de treino para agilizar meu trabalho.               | Média      |
| **US05** | Portal do Aluno         | Como aluno, quero visualizar meu treino do dia no meu celular.                                    | Alta       |
| **US06** | Feedback Motivacional   | Como aluno, quero receber feedback da IA ao concluir um treino para me manter motivado.           | Baixa      |
| **US07** | Dashboard Financeiro    | Como gerente, quero visualizar indicadores financeiros para acompanhar o faturamento da academia. | Média      |

## Detalhamento do US00 - Autenticação de Usuário

### Descrição

O sistema deve permitir que funcionários e alunos façam login utilizando e-mail e senha. Após a autenticação bem-sucedida, o sistema deve redirecionar o usuário para o ambiente (layout) correspondente ao seu perfil de acesso (`/dashboard` para funções administrativas ou `/aluno` para alunos), garantindo segurança e integridade das sessões de usuário através de JWT e Supabase SSR.

### Regras de Negócio (RN)

- **RN01:** Apenas e-mails autenticados no Supabase Auth e presentes na base de dados relacional podem acessar as áreas restritas.
- **RN02:** O perfil de usuário (role) deve ser verificado a cada requisição via Middleware do Next.js.
- **RN03:** A tentativa de acesso a uma rota sem permissão adequada deve redirecionar o usuário para a página de login.
- **RN04:** O sistema deve bloquear o acesso após sucessivas falhas de login (política padrão Supabase).

### Mensagens (Sucesso/Erro)

- **Sucesso:** "Login realizado com sucesso! Redirecionando..."
- **Erro (Geral):** "E-mail ou senha inválidos. Por favor, tente novamente."
- **Erro (Serviço):** "Serviço de autenticação indisponível no momento."

### Modelo de Dados Relacionado

- **auth.users (Supabase):** ID do usuário e e-mail.
- **public.funcionarios / public.alunos (Prisma/PostgreSQL):** Tabela que associa o ID do auth com o papel específico do usuário no sistema.

### Lista de Testes de Aceitação

- **TA01:** O usuário deve conseguir fazer login com credenciais válidas.
- **TA02:** O sistema deve negar acesso caso o e-mail ou a senha estejam incorretos.
- **TA03:** O sistema deve redirecionar corretamente o Gerente para a rota `/dashboard`.
- **TA04:** O sistema deve redirecionar corretamente o Aluno para a rota `/aluno`.
- **TA05:** O usuário logado deve conseguir realizar o logout, invalidando a sessão no servidor.

---

### Referências

- [Página de Login no Projeto](../src/app/login/page.tsx)
- [Middleware de Segurança](../src/middleware.ts)
- [Configuração do Supabase](../src/lib/supabase/config.ts)
