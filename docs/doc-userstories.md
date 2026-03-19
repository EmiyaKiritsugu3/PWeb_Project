# Documento de User Stories - SmartManagementSystem (SMS)

Este documento contém a lista de User Stories e o detalhamento do caso de uso base para o **SmartManagementSystem (SMS)**.

## Lista de User Stories

ID | Título | Descrição | Prioridade
--- | --- | --- | ---
**US00** | Autenticação de Usuário | Como funcionário ou aluno, quero me autenticar no sistema para acessar minhas funcionalidades. | Essencial
**US01** | Gestão de Alunos | Como gerente, quero cadastrar e gerenciar alunos para manter o controle da academia. | Alta
**US02** | Gestão de Planos | Como gerente, quero gerenciar os planos oferecidos pela academia. | Média
**US03** | Prescrição de Treinos | Como instrutor, quero criar rotinas de treino para os alunos. | Alta
**US04** | Treino com IA | Como instrutor, quero que a IA gere sugestões de treino para agilizar meu trabalho. | Média
**US05** | Portal do Aluno | Como aluno, quero visualizar meu treino do dia no meu celular. | Alta
**US06** | Feedback Motivacional | Como aluno, quero receber feedback da IA ao concluir um treino para me manter motivado. | Baixa

## Detalhamento do US00 - Autenticação de Usuário

**Descrição:**
O sistema deve permitir que funcionários e alunos façam login utilizando e-mail e senha. Após a autenticação, o sistema deve redirecionar o usuário para o layout correspondente ao seu perfil (`/dashboard` para funções administrativas ou `/aluno` para alunos).

**Atores:**
- Funcionário (Gerente, Recepcionista, Instrutor)
- Aluno

**Critérios de Aceite:**
1. O usuário deve informar e-mail e senha.
2. Em caso de sucesso, o e-mail do usuário deve ser verificado na coleção correspondente (`funcionarios` ou `alunos`) para determinar o redirecionamento.
3. Em caso de erro (senha inválida ou e-mail inexistente), uma mensagem de feedback clara deve ser exibida.
4. Sessões devem ser persistentes utilizando o SDK do Firebase.

**Implementação:**
A funcionalidade será implementada utilizando o **Firebase Authentication** e o roteamento do **Next.js (App Router)** com `middleware` para proteção de rotas privadas.

---
### Referências
- [Página de Login no Projeto](../src/app/login/page.tsx)
- [Configuração do Firebase](../src/firebase/config.ts)
