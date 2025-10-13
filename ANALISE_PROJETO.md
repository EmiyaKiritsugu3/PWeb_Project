# Relatório Detalhado do Projeto: Sistema de Gestão da Academia Five Star

## 1. Visão Geral e Objetivo

Este projeto consiste em um **Sistema de Gestão Integrado** para a Academia Five Star, desenvolvido como uma Aplicação Web moderna (Single-Page Application - SPA). O objetivo principal é modernizar e otimizar as operações da academia, substituindo processos manuais e sistemas legados.

A aplicação atende a dois públicos distintos com experiências de usuário totalmente separadas e seguras:

1.  **Painel de Gestão (`/dashboard`)**: Uma área administrativa completa para funcionários (gerentes, recepcionistas, instrutores) gerenciarem alunos, finanças, planos e treinos.
2.  **Portal do Aluno (`/aluno`)**: Uma área de autoatendimento onde os clientes da academia podem acessar seus treinos, verificar o status de sua matrícula e outras informações relevantes.

## 2. Arquitetura e Filosofia de Desenvolvimento

O sistema foi construído sobre uma arquitetura moderna e robusta, priorizando a experiência do desenvolvedor, a performance e a escalabilidade.

-   **Aplicação Full-Stack com Next.js**: Utilizamos o Next.js, um framework React que permite a renderização tanto no servidor quanto no cliente. Isso proporciona uma inicialização rápida da página e uma navegação fluida, característica de uma SPA.
-   **Componentização e Reutilização**: A interface foi dividida em pequenos componentes reutilizáveis, seguindo as melhores práticas do React. Isso torna o código mais limpo, fácil de manter e de expandir.
-   **Backend Serverless com Firebase**: Embora a integração completa ainda esteja em andamento, a arquitetura está preparada para usar o Firebase como um backend "serverless". Isso significa que não precisamos gerenciar servidores. O Firestore atua como banco de dados e o Firebase Authentication como serviço de identidade.
-   **Desenvolvimento "Interface Primeiro" (UI First)**: O projeto foi desenvolvido com foco na construção e validação da interface do usuário (UI) antes da integração completa com o backend. Atualmente, ele opera em um "modo offline", utilizando dados locais para simular o comportamento do banco de dados, o que agiliza o desenvolvimento visual e funcional.

## 3. Tecnologias Utilizadas

A stack tecnológica foi cuidadosamente selecionada para garantir um produto moderno, performático e de alta qualidade.

### 3.1. Frontend

-   **Next.js**: O framework principal que estrutura toda a aplicação, gerenciando o roteamento, a renderização e a otimização de performance.
-   **React**: A biblioteca base para a construção de todas as interfaces de usuário de forma declarativa e componente.
-   **TypeScript**: Adiciona uma camada de tipagem estática ao JavaScript, o que aumenta a robustez do código, previne bugs e melhora a produtividade do desenvolvedor.

### 3.2. Interface de Usuário (UI)

-   **ShadCN/UI**: Uma coleção de componentes de UI de alta qualidade, acessíveis e customizáveis, construídos sobre o Radix UI. Ele fornece a base para todos os elementos visuais, como botões, formulários, tabelas e modais.
-   **Tailwind CSS**: Um framework CSS "utility-first" para estilização rápida e customizável. Ele permite criar designs complexos diretamente no HTML, mantendo a consistência visual.
-   **Lucide React**: Uma biblioteca de ícones leve, bonita e consistente, utilizada em toda a aplicação para melhorar a comunicação visual.

### 3.3. Backend e Banco de Dados (Firebase)

-   **Firebase Authentication**: Serviço utilizado para gerenciar a autenticação de usuários (login com e-mail e senha) de forma segura e escalável, tanto para funcionários quanto para alunos.
-   **Firestore**: O banco de dados NoSQL, flexível e em tempo real que foi projetado para armazenar todos os dados da aplicação, como informações de alunos, planos e treinos. A estrutura de dados já está definida no arquivo `docs/backend.json`.

### 3.4. Ferramentas e Bibliotecas Adicionais

-   **Zod**: Utilizado para a validação de esquemas (schemas). Garante que os dados inseridos nos formulários (como cadastro de alunos) estejam no formato correto antes de serem processados.
-   **React Hook Form**: Uma biblioteca poderosa e performática para o gerenciamento de formulários complexos, integrada com o Zod para validação.
-   **Recharts**: Para a criação de gráficos interativos no dashboard, como o de crescimento de alunos.

## 4. Estrutura de Diretórios do Projeto

A organização dos arquivos foi pensada para ser intuitiva e escalável.

-   **/src/app/**: O coração da aplicação Next.js.
    -   `/(dashboard)` e `/(aluno)`: Grupos de rotas que definem os layouts e páginas específicas para o Painel de Gestão e o Portal do Aluno.
    -   `page.tsx`: Representa uma página acessível por uma URL.
    -   `layout.tsx`: Define a estrutura de layout compartilhada por um grupo de páginas.
    -   `globals.css`: Arquivo de estilos globais e definição do tema de cores da aplicação.
-   **/src/components/**: Contém todos os componentes React reutilizáveis.
    -   `/ui`: Componentes base do ShadCN (Button, Card, Input, etc.).
    -   `/dashboard`: Componentes específicos para o painel de gestão (ex: tabela de alunos, formulários).
-   **/src/lib/**: Lógica de negócio, definições de tipos e dados.
    -   `definitions.ts`: Definições TypeScript para as principais entidades do sistema (Aluno, Plano, etc.).
    -   `data.ts`: Arquivo com os dados estáticos (mock data) usados para simular o banco de dados no "modo offline".
    -   `utils.ts`: Funções utilitárias, como a `cn` para mesclar classes do Tailwind.
-   **/src/firebase/**: Centraliza toda a configuração e inicialização dos serviços do Firebase.
-   **/docs/**: Documentação do projeto.
    -   `backend.json`: Um "plano" detalhado da estrutura de coleções e dos dados que serão armazenados no Firestore.

## 5. Funcionalidades Implementadas (Até o Momento)

-   **Autenticação Segura**: Fluxos de login separados para Gestão e Alunos, com proteção de rotas.
-   **Layouts Distintos**: Experiência visual e de navegação completamente diferente para cada portal.
-   **Painel de Gestão (Modo Offline)**:
    -   **Dashboard**: Visualização de KPIs (indicadores chave) e gráfico de crescimento.
    -   **Gestão de Alunos**: Interface completa para listar, cadastrar, editar e excluir alunos.
    -   **Criação de Matrículas**: Funcionalidade para vincular um plano a um aluno através de um modal.
    -   **Visualização de Planos, Treinos e Financeiro**: Páginas estruturadas para o gerenciamento futuro dessas áreas.
-   **Portal do Aluno (Modo Offline)**:
    -   **Dashboard do Aluno**: Exibe o treino do dia de forma interativa (com checkboxes) e o status da matrícula.
-   **Design Responsivo**: Todas as telas se adaptam bem a diferentes tamanhos de dispositivos, de desktops a celulares.
