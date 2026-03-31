# 🏋️ Sistema de Gestão Academia Five Star

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Genkit](https://img.shields.io/badge/Genkit-AI-orange?style=for-the-badge&logo=googlecloud)](https://firebase.google.com/docs/genkit)

Um sistema de gestão **full-stack** moderno para academias, combinando ferramentas administrativas robustas com uma experiência de aluno gamificada e potencializada por **Inteligência Artificial Generativa**.

---

## 🌟 Experiências Integradas

A aplicação oferece duas jornadas totalmente separadas e seguras:

### 🏠 Painel de Gestão (`/dashboard`)
*   **Gestão de Alunos:** CRM completo para cadastro, edição e controle de matrículas.
*   **Controle Financeiro:** Monitoramento de inadimplência e status de pagamentos.
*   **Gerador de Treinos IA:** Criação automatizada de planos semanais personalizados usando **Google Gemini** via Genkit.
*   **Análise de Dados:** Dashboards com indicadores de crescimento e retenção.

### 🛡️ Portal do Aluno (`/aluno`)
*   **Gamificação (Player Experience):** Sistema de **Nível, XP e Streaks (Ofensivas)** para incentivar a consistência.
*   **Treino do Dia:** Interface interativa para execução e conclusão de exercícios.
*   **Feedback Motivacional:** Mensagens customizadas geradas por IA após cada treino finalizado.
*   **Meus Treinos:** Separação entre planos profissionais (do personal) e treinos pessoais criados pelo aluno.

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

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18.x ou superior
- Instância do PostgreSQL (ou projeto Supabase)
- Chave de API do Google AI (Gemini)

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:

```env
# Banco de Dados (Prisma)
DATABASE_URL="postgresql://user:password@host:port/dbname"

# Supabase (Auth & API)
NEXT_PUBLIC_SUPABASE_URL="sua-url-do-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"

# Inteligência Artificial
GOOGLE_GENAI_API_KEY="sua-google-ai-key"
```

### 2. Instalação e Setup
```bash
# Instalar dependências
npm install

# Gerar o cliente Prisma
npx prisma generate

# Sincronizar o banco de dados
npx prisma db push

# (Opcional) Popular o banco com dados iniciais
npm run prisma:seed
```

### 3. Rodar o Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000` para ver a aplicação em execução.

---

## 📋 Licença e Repositório

Este projeto está versionado publicamente em:
**[https://github.com/EmiyaKiritsugu3/PWeb_Project](https://github.com/EmiyaKiritsugu3/PWeb_Project)**

Desenvolvido para fins acadêmicos e profissionais na área de Engenharia de Software.
