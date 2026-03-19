# Documento de Visão - SmartManagementSystem (SMS)

Este documento descreve a visão geral, os requisitos e os riscos para o **SmartManagementSystem (SMS)**, um sistema de gestão integrado para a Academia Five Star.

## Descrição do Projeto

O **SmartManagementSystem (SMS)** é uma aplicação web moderna projetada para otimizar a gestão de academias, integrando um painel administrativo para a equipe e um portal gamificado para os alunos. O sistema utiliza Inteligência Artificial para gerar planos de treino personalizados e fornecer feedbacks motivacionais, elevando a experiência do usuário e a eficiência operacional.

## Equipe e Definição de Papéis

Membro | Papel | E-mail
--- | --- | ---
José Inamar de Medeiros Júnior | Líder Técnico, Desenvolvedor Full-Stack, Analista | joseinamar@ufrn.edu.br
Taciano | Cliente Professor | taciano@bsi.ufrn.br

### Matriz de Competências

Membro | Competências
--- | ---
José Inamar | Next.js, TypeScript, Firebase, Tailwind CSS, Inteligência Artificial (Genkit)
Taciano | Orientador, Engenharia de Software

## Perfis dos Usuários

Perfil | Descrição
--- | ---
**Gerente / Recepcionista** | Gerencia alunos, matrículas, finanças e indicadores do negócio no dashboard administrativo.
**Instrutor** | Cria e atribui treinos (manuais ou via IA) para os alunos cadastrados.
**Aluno** | Acessa seu portal pessoal para visualizar treinos, marcar exercícios concluídos e receber feedback da IA.

## Lista de Requisitos Funcionais

### Entidade Aluno - US01 - Manter Aluno
Requisito | Descrição | Ator
--- | --- | ---
RF01.01 - Cadastrar Aluno | Insere novo aluno com nome, CPF, e-mail e telefone. | Gerente/Recepcionista
RF01.02 - Listar Alunos | Exibe todos os alunos com filtros de busca. | Gerente/Recepcionista/Instrutor
RF01.03 - Editar Aluno | Atualiza informações cadastrais do aluno. | Gerente/Recepcionista
RF01.04 - Excluir Aluno | Remove o cadastro do aluno do sistema. | Gerente

### Entidade Matrícula - US02 - Manter Matrícula
Requisito | Descrição | Ator
--- | --- | ---
RF02.01 - Vincular Plano | Associa um aluno a um plano de pagamento (Mensal, Trimestral, etc.). | Gerente/Recepcionista
RF02.02 - Verificar Inadimplência | Identifica automaticamente alunos com mensalidades em atraso. | Sistema
RF02.03 - Renovar Matrícula | Atualiza a data de vencimento após confirmação de pagamento. | Gerente/Recepcionista

### Entidade Treino - US03 - Manter Treino
Requisito | Descrição | Ator
--- | --- | ---
RF03.01 - Criar Treino Manual | Instrutor define exercícios, séries e repetições para um aluno. | Instrutor
RF03.02 - Gerar Treino via IA | IA cria um plano semanal baseado no objetivo e nível do aluno. | Instrutor
RF03.03 - Visualizar Treino | Aluno consulta sua rotina de exercícios no Portal do Aluno. | Aluno
RF03.04 - Finalizar Treino | Aluno marca exercícios como concluídos e recebe feedback da IA. | Aluno

## Lista de Requisitos Não-Funcionais

Requisito | Descrição
--- | ---
RNF001 - Performance | As páginas devem carregar em menos de 1.5 segundos.
RNF002 - Segurança | Utilização de Firebase Authentication para proteção de rotas e dados.
RNF003 - Responsividade | A interface deve ser totalmente adaptável a dispositivos móveis.
RNF004 - IA Generativa | Utilização do framework Genkit para integração com modelos Gemini.

## Riscos

Data | Risco | Prioridade | Responsável | Status | Solução
--- | --- | --- | --- | --- | ---
19/03/2026 | Curva de aprendizado com Genkit | Média | José Inamar | Vigente | Estudar documentação oficial e tutoriais do Google AI.
19/03/2026 | Atrasos na integração do Firebase | Baixa | José Inamar | Resolvido | Configuração inicial concluída com sucesso.

### Referências
- [Repositório do Projeto](https://github.com/EmiyaKiritsugu3/PWeb_Project)
- [Documentação do Next.js](https://nextjs.org/docs)
