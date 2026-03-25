# Documento de Visão

Este documento descreve a visão geral, os perfis de usuários, os requisitos funcionais, os requisitos não-funcionais e os riscos mapeados para o **SmartManagementSystem (SMS)**, um sistema de gestão integrado para a Academia Five Star.

## 1. Descrição do Projeto

O **SmartManagementSystem (SMS)** é uma aplicação web moderna (Single-Page Application) projetada para otimizar a gestão e as operações diárias da Academia Five Star. O projeto visa resolver a ineficiência de processos manuais, oferecendo dois portais integrados: um **Painel de Gestão** para a equipe da academia (recepcionistas e gerentes) controlarem matrículas, planos e inadimplências, além de prescreverem treinos; e um **Portal do Aluno** gamificado, onde o cliente pode acompanhar suas atividades.
O grande diferencial tecnológico do sistema é a integração com Inteligência Artificial (Google Genkit/Gemini) para gerar rotinas de treino otimizadas de forma automática e fornecer feedbacks pós-treino, promovendo maior engajamento dos alunos.

## 2. Equipe e Definição de Papéis

Membro | Papel | E-mail
--- | --- | ---
José Inamar de Medeiros Júnior | Líder Técnico, Analista de Requisitos, Desenvolvedor Full-Stack | joseinamar@ufrn.edu.br
Taciano | Orientador, Cliente Especialista | taciano@bsi.ufrn.br

### Matriz de Competências

Membro | Competências
--- | ---
José Inamar | Next.js, TypeScript, Componentização React, PostgreSQL, Prisma ORM, Tailwind CSS, Inteligência Artificial (Genkit)
Taciano | Engenharia de Software, Arquitetura de Sistemas, Gestão de Projetos

## 3. Perfis dos Usuários

O sistema restringe o acesso e exibe as funcionalidades de acordo com o papel (role) do usuário logado:

Perfil | Descrição
--- | ---
**Gerente** | Possui acesso total e irrestrito. Pode visualizar dados financeiros globais, cadastrar planos, deletar alunos e gerenciar outros funcionários.
**Recepcionista** | Foca no fluxo diário. Pode cadastrar alunos, atualizar matrículas, registrar pagamentos e verificar inadimplência.
**Instrutor** | Profissional de educação física. Pode acessar a lista de alunos e focar-se em prescrever, alterar e gerar treinos utilizando a IA do sistema.
**Aluno** | Usuário final na ponta. Limitado a visualizar apenas os próprios dados, como status de matrícula, rotina de treinos diária, e interação com a IA de feedback.


## 4. Lista de Requisitos Funcionais

Abaixo estão descritos todos os requisitos mapeados para as entidades do sistema, focando em operações de inserção, listagem, atualização e remoção.

### Entidade Funcionário - RF01 - Manter Funcionário
Um funcionário tem ID, nome, e-mail e função (Gerente, Instrutor, Recepcionista).

Requisito | Descrição | Ator
--- | --- | ---
RF01.01 - Inserir Funcionário | Insere novo colaborador informando: nome, e-mail e cargo. | Gerente
RF01.02 - Listar Funcionários | Lista todos os funcionários com filtros por cargo ou nome. | Gerente
RF01.03 - Editar Funcionário | Atualiza o cargo e nome do funcionário. | Gerente
RF01.04 - Excluir Funcionário | Remove o acesso do funcionário ao sistema. | Gerente

---

### Entidade Plano - RF02 - Manter Plano
Um plano (Mensal, Trimestral) tem ID, nome, preço e a duração em dias.

Requisito | Descrição | Ator
--- | --- | ---
RF02.01 - Inserir Plano | Insere novo plano de assinatura: nome, valor financeiro e tempo de duração. | Gerente
RF02.02 - Listar Planos | Exibe o catálogo de planos vigentes. | Gerente, Recepcionista
RF02.03 - Incrementar Preço | Atualiza nomes e reajusta valores dos planos ativos. | Gerente
RF02.04 - Inativar Plano | Oculta um plano para novas contratações sem deletá-lo do banco. | Gerente

---

### Entidade Aluno - RF03 - Manter Aluno
O aluno tem ID, nome, CPF, e-mail, telefone, biometriahash, datas de nascimento e cadastro.

Requisito | Descrição | Ator
--- | --- | ---
RF03.01 - Inserir Aluno | Cadastra um novo aluno capturando os dados base e foto de perfil. | Recepcionista, Gerente
RF03.02 - Listar Alunos | Exibe a listagem de alunos ordenável por nome e filtrável por CPF. | Todos os Profissionais
RF03.03 - Atualizar Aluno | Atualiza número de telefone, foto ou biometria. | Recepcionista, Gerente
RF03.04 - Deletar Aluno | Exclui permanentemente os dados do aluno. | Gerente

---

### Entidade Matrícula - RF04 - Manter Matrícula
Uma matrícula associa um Plano a um Aluno, contendo datas de início e vencimento e o status atual.

Requisito | Descrição | Ator
--- | --- | ---
RF04.01 - Gerar Matrícula | Vincula um plano contratado a um aluno, calculando a data de vencimento. | Recepcionista, Gerente
RF04.02 - Listar Matrículas | Lista o histórico de matrículas ativas e encerradas do aluno. | Recepcionista, Gerente
RF04.03 - Calcular Inadimplência | Regra automática (job) que marca a matrícula como VENCIDA se a data atual for maior que o vencimento. | Sistema
RF04.04 - Renovar Matrícula | Estende a data de vencimento da matrícula vigente após a compensação financeira. | Recepcionista, Gerente

---

### Entidade Pagamento - RF05 - Manter Pagamento
Um pagamento é a baixa financeira feita em cima da matrícula de um aluno. Possui valor, data e método.

Requisito | Descrição | Ator
--- | --- | ---
RF05.01 - Registrar Pagamento | Confirma uma entrada financeira, informando se foi PIX, Dinheiro ou Cartão. | Recepcionista, Gerente
RF05.02 - Emitir Histórico | Lista todos os pagamentos atrelados ao CPF do aluno em uma data estipulada. | Recepcionista, Gerente, Aluno

---

### Entidade Treino - RF06 - Manter Treino
Um treino possui objetivo, data de criação e qual dia da semana ele deve ser executado.

Requisito | Descrição | Ator
--- | --- | ---
RF06.01 - Treino Manual | Instrutor cria uma entidade de treino informando o objetivo e salvando na ficha do aluno. | Instrutor
RF06.02 - Treino Gerado por IA | O sistema envia parâmetros (nível, dias, foco) e a IA devolve os dias e exercícios criados automaticamente. | Instrutor
RF06.03 - Listar Treinos | Exibe o cronograma de treinos (segunda a domingo) no portal específico do aluno logado. | Aluno, Instrutor
RF06.04 - Deletar Treino | Altera totalmente ou limpa o dia da semana do cronograma de treino. | Instrutor
RF06.05 - Feedback IA | Aluno marca um check no treino diário e a IA gera uma frase motivacional em tempo real. | Aluno, Sistema

---

### Entidade Exercício - RF07 - Manter Exercício
Exercícios pertencem a treinos, e explicitam nome, séries, repetições e dicas biomecânicas.

Requisito | Descrição | Ator
--- | --- | ---
RF07.01 - Inserir Exercício | Aloca um exercício específico dentro do treino selecionado (ex: Supino, 4 séries, 10 reps). | Instrutor
RF07.02 - Editar Repetições | Altera o número de repetições e observações de execução do exercício. | Instrutor
RF07.03 - Remover Exercício | Tira do rol do treino específico. | Instrutor

---

### Casos de Uso Complementares
Requisito | Descrição | Ator
--- | --- | ---
RF08.01 - Login Unificado | Todos os usuários disparam login via provedor, com direcionamento condicional para o `dashboard` (equipe) ou `portal` (aluno) | Todos
RF08.02 - Consulta Catraca | Sistema expõe um endpoint de validação (API) onde a catraca da academia faz requisição verificando se a matrícula associada à impressão digital está "ATIVA". | Catraca IoT


### Entidade Operações Avançadas e Banco de Dados (Requisitos SQL)
Atendendo à ementa de Administração de Banco de Dados, o sistema também possuirá a seguinte camada de regras operando diretamente no SGBD PostgreSQL:

Requisito | Descrição | Ator
--- | --- | ---
RF09.01 - Views Gerenciais (Aula 05) | O sistema deve compilar um painel financeiro utilizando views nativas e Common Table Expressions (CTEs) complexas no banco. | Gerente
RF09.02 - Gatilhos Automáticos (Aula 06) | Implementar Triggers (`AFTER INSERT / UPDATE`) no banco de dados para marcar automaticamente a Matrícula como 'VENCIDA' baseada na data de vigência e pagamentos. | SGBD PostgreSQL
RF09.03 - Transação Segura TCL (Aula 16) | A geração combinada de Aluno, Matrícula e o primeiro Pagamento deverá rodar protegida em funções atômicas de banco de dados nativas (`BEGIN/COMMIT/ROLLBACK`), assegurando integridade total. | SGBD PostgreSQL

## 5. Lista de Requisitos Não-Funcionais

Requisito | Descrição
--- | ---
RNF001 - Performance Frontend | A aplicação, servida pelo Next.js (App Router), deve renderizar telas em menos de 1000 milissegundos utilizando componentes de tipologia Server-Side e Client-Side condicionalmente.
RNF002 - Integridade e Segurança Relacional | O acesso em tempo de execução ao PostgreSQL deverá ser intermediado via Prisma ORM de maneira segura contra SQL Injection, enquanto as constraints nativas (Chaves Estrangeiras) controlarão a integridade referencial dura (ex: Proibido deletar aluno com pagamentos atrelados).
RNF003 - Design Moderno e Acessível | O visual deve ser construído via TailwindCSS e ShadCN/UI, resultando numa interface limpa com feedback constante.
RNF004 - Interface Responsiva e Mobile First | Devido ao uso majoritário dos alunos dentro da musculação, o Portal do Aluno deverá emular perfeitamente um webapp nativo com layout fluído nas telas de todas as resoluções Mobile.
RNF005 - Engenharia de Prompt Segura | A integração do Genkit com os LLMs obrigatoriamente fará parsing do texto retornado utilizando *Zod validator*, convertendo a resposta em objetos JSON consistentes.


## 6. Riscos

Data | Risco | Prioridade | Responsável | Status | Solução
--- | --- | --- | --- | --- | ---
19/03/2026 | Dificuldade com orquestração do Firebase Auth x Next.js 14 em middleware | Alta | José Inamar | Resolvido | Foco agora será redirecionado a criar roles baseadas no banco relacional nativo (PostgreSQL).
19/03/2026 | Alucinação da Inteligência Artificial ao injetar dados em formato JSON no app | Máxima | José Inamar | Em andamento | Refinar rigorosamente o `System Prompt` do Google Gemini e forçar chaves estritas (Zod schema) nas respostas de recomendação.
19/03/2026 | Complexidade em Mapeamento Objeto-Relacional (ORM) Next.js | Média | José Inamar | Novo | A adoção do Prisma como ORM requer estudos sobre migrations e relations Typescript-SQL.

### Referências
- [Análise Detalhada dos Sub-Documentos (README e Blueprint)](../ANALISE_PROJETO.md)
- [Esquema Geral do Banco Orientado a Documentos](../backend.json)
