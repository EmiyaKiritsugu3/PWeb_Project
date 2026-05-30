# 🏋️ Sistema de Gestão Academia Five Star

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Genkit](https://img.shields.io/badge/Genkit-AI-orange?style=for-the-badge&logo=googlecloud)](https://firebase.google.com/docs/genkit)
[![SonarCloud](https://img.shields.io/badge/SonarCloud-Quality_Gate-blue?style=for-the-badge&logo=sonarcloud)](https://sonarcloud.io/project/overview?id=EmiyaKiritsugu3_PWeb_Project)
[![CI](https://img.shields.io/github/actions/workflow/status/EmiyaKiritsugu3/PWeb_Project/ci.yml?branch=main&style=for-the-badge&logo=github)](https://github.com/EmiyaKiritsugu3/PWeb_Project/actions)

Um sistema de gestão **full-stack** moderno para academias, combinando ferramentas administrativas robustas com uma experiência de aluno gamificada e potencializada por **Inteligência Artificial Generativa**.

---

## 🌟 Experiências Integradas

A aplicação oferece duas jornadas totalmente separadas e seguras:

### 🏠 Painel de Gestão (`/dashboard`)

- **Gestão de Alunos:** CRM completo para cadastro, edição e controle de matrículas.
- **Controle Financeiro:** Monitoramento de inadimplência e status de pagamentos.
- **Gerador de Treinos IA:** Criação automatizada de planos semanais personalizados usando **Google Gemini** via Genkit.
- **Análise de Dados:** Dashboards com indicadores de crescimento e retenção.

### 🛡️ Portal do Aluno (`/aluno`)

- **Gamificação (Player Experience):** Sistema de **Nível, XP e Streaks (Ofensivas)** para incentivar a consistência.
- **Treino do Dia:** Interface interativa para execução e conclusão de exercícios.
- **Feedback Motivacional:** Mensagens customizadas geradas por IA após cada treino finalizado.
- **Meus Treinos:** Separação entre planos profissionais (do personal) e treinos pessoais criados pelo aluno.

---

## 🛠️ Stack Tecnológica

### Frontend & UI

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes:** [Shadcn/UI](https://ui.shadcn.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Database

- **Auth:** [Supabase Auth](https://supabase.com/auth) (com suporte a SSR)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (hospedado no Supabase)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Validação:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

### Inteligência Artificial

- **Engine:** [Google Genkit](https://firebase.google.com/docs/genkit)
- **Modelos:** Gemini (Google AI)

### Observabilidade & Performance

- **Error Tracking:** [Sentry](https://sentry.io/) (Next.js v15 integration)
- **Privacidade:** Filtro recursivo de PII (CPF, senhas) no servidor e cliente.
- **Monitoring:** Túnel de telemetria via `/monitoring` para evitar bloqueios por ad-blockers.
- **Sentinel Engine:** Orquestrador de desenvolvimento com IA para planejamento (`plan`), brainstorming (`shout`) e geração de código (`forge`) com governança FPA.

---

## 🛡️ Sentinel Development Engine (CLI)

O projeto inclui o **Sentinel**, um sistema operacional de desenvolvimento alimentado por IA que orquestra o ciclo de vida do software:

- **`npm run sentinel shout`**: Inicia um brainstorm dialético para novas features.
- **`npm run sentinel plan`**: Gera um plano de implementação [PID-SENTINEL] com análise de impacto.
- **`npm run sentinel forge`**: Transforma insights em esqueletos de implementação técnica com cálculo automático de Function Points (FPA).
- **`npm run pre-flight`**: Portão de qualidade obrigatório (Lint, Format, Types, Tests).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js 22+
- Docker (necessário para o stack E2E local via Supabase CLI)
- npm

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes chaves:

```env
# Banco de Dados (Prisma)
DATABASE_URL="postgresql://user:password@host:port/dbname"
DIRECT_URL="postgresql://user:password@host:port/dbname"

# Supabase (Auth & API)
NEXT_PUBLIC_SUPABASE_URL="sua-url-do-supabase"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="sua-chave-publishable"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# Inteligência Artificial
GOOGLE_GENAI_API_KEY="sua-google-ai-key"

# Observabilidade
NEXT_PUBLIC_SENTRY_DSN="sua-dsn-do-sentry"
SENTRY_AUTH_TOKEN="seu-token-sentry"
```

Consulte `.env.example` para a lista completa de variáveis.

### 2. Instalação e Setup

```bash
# Instalar dependências
npm install

# Gerar o cliente Prisma
npx prisma generate

# Aplicar migrations
npx prisma migrate deploy

# (Opcional) Popular o banco com dados de desenvolvimento
npm run prisma:seed
```

### 3. Rodar o Desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3001` para ver a aplicação em execução.

### 4. Quality Gates

```bash
npm run typecheck      # TypeScript strict — 0 erros
npm run lint # ESLint — 0 erros (Native flat config + ESLint 9)
npm run format:check   # Prettier — formatação consistente
npm run test           # Vitest — 66/66 testes (10 suites)
npm run e2e            # Playwright — 20 cenários (requer Docker + supabase start)
npm run test:coverage  # Testes + relatório de cobertura (enviado ao SonarCloud)
```

> **Integração Contínua:** O pipeline CI ([`.github/workflows/ci.yml`](./.github/workflows/ci.yml)) executa todos os quality gates em cada PR.
> Para PRs do **Dependabot**, testes e E2E são pulados para agilizar — apenas `npm ci` + `npm audit` rodam.
> **SonarCloud** analisa cobertura automaticamente via `sonarqube-scan-action` com `coverage/lcov.info`.

---

## 📘 Documentação do Projeto

- [Documento de Visão](./docs/doc-visao.md)
- [Documento de User Stories](./docs/doc-userstories.md)
- [Modelo de Dados](./docs/doc-modelos.md)
- [Estado Atual](./docs/CURRENT-STATE.md)
- [Milestones](./docs/pdr/MILESTONES.md)
- [Tarefa - ODBC e ORM](./database/20252/tarefas/EmiyaKiritsugu3/tarefa-orm.md)
- [Tarefa - MongoDB](./database/20261/tarefas/EmiyaKiritsugu3/tarefa-mongodb.md)

---

## 👨‍🎓 Informações do Aluno (Tarefa)

- **Nome:** José Inamar de Medeiros Júnior
- **Matrícula:** 20200018540
- **Email:** inamarjunior2@gmail.com

---

## 📖 Governança e Segurança

Para garantir a qualidade e a segurança do projeto, seguimos os seguintes guias:

- [Política de Segurança](./SECURITY.md) - Como reportar vulnerabilidades e boas práticas.
- [Changelog](./CHANGELOG.md) - Histórico detalhado de mudanças e versões.
- **Estratégia de Versionamento:** Utilizamos [SemVer](https://semver.org/spec/v2.0.0.html).

---

---

## 📋 Licença e Repositório

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

Repositório principal:
**[https://github.com/EmiyaKiritsugu3/PWeb_Project](https://github.com/EmiyaKiritsugu3/PWeb_Project)**

Desenvolvido para fins acadêmicos e profissionais na área de Engenharia de Software.
