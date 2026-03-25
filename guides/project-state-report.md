# Relatório de Estado do Projeto: SmartManagementSystem (SMS)

Este relatório detalhado descreve a arquitetura atual, as decisões técnicas, a organização e o status da recente migração arquitetônica do **SmartManagementSystem (Academia Five Star)**.

---

## 1. Visão Geral e Propósito do Sistema

O **SMS** é uma plataforma Full-Stack projetada para solucionar a gestão operacional de academias de ginástica. A aplicação bifásica entrega:
1.  **Painel de Gestão (`/dashboard`)**: Área administrativa reservada à equipe interna (Recepcionistas, Instrutores e Gerentes). Lida com cadastros de alunos, matrículas, pagamentos, geração de rotinas e métricas do negócio.
2.  **Portal do Aluno (`/aluno`)**: Área imersiva voltada para o cliente final. Exibe os treinos do dia, permite o acompanhamento em tempo real durante a execução na academia e gamifica a experiência por meio de inteligência artificial.

## 2. Pilha Tecnológica Atual (Tech Stack)

A arquitetura do projeto espelha as melhores práticas de desenvolvimento web moderno:

### Interface de Usuário (Frontend)
*   **Framework Principal:** Next.js 14 operando via *App Router* para simplificar as rotas baseadas em pastas. A estratégia inclui a mescla de SSR (Server-Side Rendering) nativo para SEO/Setup e CSR (Client-Side Rendering) para telas dinâmicas (como a interface ativa do treino).
*   **Design & CSS:** Tailwind CSS configurado para abordar o *Mobile First* (crucial para alunos utilizando a plataforma via smartphone na academia).
*   **Bibliotecas de UI:** ShadCN / Radix UI para garantir componentes robustos, modais elegantes, formulários validados (React Hook Form) e gráficos responsivos, tudo mantendo consistência e acessibilidade visual.

### Inteligência Artificial Integrada
O SMS tira proveito dos LLMs (Gemini) atuando de forma invisível nos bastidores (Backend API).
*   **Motor:** Google Genkit.
*   **Segurança Típica:** As chamadas para os modelos generativos exigem validação forte. Por isso usa-se *Zod validators* no esquema de System Prompts.
*   **Casos de Uso Implantados:** (1) Geração customizada e instantânea da divisão de treinos inteira de uma semana, dadas as limitações físicas do aluno; (2) Fornecimento de frases motivacionais contextuais pós-exercício, incentivando a fidelização do cliente ao app.

## 3. Arquitetura de Persistência: O Conflito NoSQL x SQL

Recentemente, a arquitetura de base de dados do projeto precisou de um "pivô" estratégico devido a exigências acadêmicas fortes (Disciplina de Projeto e Administração de Banco de Dados).

### O Cenário Inicial Mapeado (`backend.json`)
O protótipo do sistema usava um banco de dados **Firebase Firestore (NoSQL)**. Os dados eram baseados em **Subcoleções** (ex: o esquema natural gravava uma subcoleção "Treinos" dentro do id único de um "Aluno"). Esse cenário funciona magistralmente para reatividade (Sincronização PWA on/off), mas era inflexível quanto às regras restritas de Banco Relacional (Joins, Queries complexas e Transações).

### O Cenário Atual: Migração para PostgreSQL
1.  **Isolamento GitFlow:** O processo de transição ocorre de forma segura e encapsulada na atual branch `feature/postgres-migration`.
2.  **Nova Linguagem de Tabela:** Emprego de um Mapeamento Objeto-Relacional via **Prisma ORM**.
3.  **Adoção Teórica de 7 Entidades Rígidas:** As antigas coleções soltas no NoSQL foram modeladas rigorosamente numa `Single-Source-of-Truth` no arquivo `/prisma/schema.prisma`. São elas: *Funcionário*, *Aluno*, *Plano*, *Matrícula*, *Pagamento*, *Treino*, e *Exercício*.
4.  **Recursos Avançados a Serem Instalados:** Para estar condizente com as obrigações da disciplina e com ecossistemas tradicionais de bancos de dados, preparou-se o terreno para acoplar `Database Triggers`, `Views Analíticas` e transações baseadas em `TCL (BEGIN/COMMIT)` nativas via Prisma e SQL puro.

## 4. Estrutura de Diretórios e Componentes

A taxonomia de arquivos da raiz (root folder) reflete as transições de domínio:

*   **`/src/app/`**: Coração das rotas Next.js. Isolados fisicamente entre as pastilhas `(dashboard)` e `(aluno)` para separar layouts lógicos sem misturar `globals.css` das áreas.
*   **`/src/components/`**: Lógica visual abstrata. Botões, *Cards*, Modais (em `/ui`) e agrupadores funcionais (como relatórios/dashboard).
*   **`/src/lib/`**: Tipos TypeScript (cruciais para estabilizar refatorações drásticas), validadores rígidos (Zod), e helpers para fetchs simples ou *Mock Data* (os famosos seeds manuais).
*   **`/src/firebase/`**: (Legado e Auth). Configuração das chaves de provedor de identidade do Firebase Auth. O serviço continua válido pois as sessões de login JWT delegam apenas senhas cruzadas no front.
*   **`/src/ai/`**: Serviços do Genkit.
*   **`/docs/`**: Antro acadêmico obrigatório. Concentra todos os detalhamentos gerenciais, visões, requisitos de equipe e histórias arquiteturais modeladas.
*   **`/prisma/`**: Repositório da nova camada agnóstica de acesso ao banco (atualmente hospedando o novo `schema.prisma`).
*   **`/guides/`**: Diretório analítico de leitura extensiva sobre as condições estruturais do sistema (Localização deste relatório).

## 5. Próximos Passos (Backlog Ativo)

O sistema encontra-se numa situação delicada de **troca de persistência em andamento**, configurando a prioridade máxima das próximas execuções. O que falta codificar:

1.  **Conexão do SGBD:** Levantar a imagem local do PostgreSQL em segundo plano (seja via Docker ou neon.tech provisionado em cloud).
2.  **Geração e Migração:** Executar os injetores `npx prisma migrate dev` para transformar as tipagens recém criadas no Prisma Schema em Tabelas (`CREATE TABLE`) físicas.
3.  **Refatoração dos Serviços (Services):** Realizar um "busque e substitua" implacável em toda a árvore fonte em `/src/app`, extirpando as referências à base do Firestore (legado NoSQL). Devemos apontá-las diretamente para a poderosa instância exportada da `PrismaClient` conectada ao Postgres.
4.  **Teste Geral E2E:** Abrir a interface web, testar um cadastro híbrido (criar novo Aluno na ponta e vê-lo refletido com segurança no banco relacional conectado).
