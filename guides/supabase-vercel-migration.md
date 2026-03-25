# Plano Tático: Migração para Supabase & Vercel 🚀

> **Personas Ativas:** Desenvolvedor Full-Stack Sênior & Engenheiro de Qualidade e Banco de Dados (DBA)

Este guia prático e objetivo mapeia os passos exatos para migrar a base do **SmartManagementSystem (SMS)** para a nuvem. Aproveitando que trocamos o NoSQL pelo PostgreSQL via Prisma, o **Supabase** é a escolha "padrão-ouro" moderna para hospedar o banco. Já a **Vercel**, criadora do Next.js, é o parceiro natural para hospedar a interface gráfica.

---

## 1. Fase Supabase (Banco de Dados em Nuvem)

Nesta etapa, assumimos o chapéu de **DBA**. Não vamos mais hospedar o banco "solto" ou em Firebase, mas em um contêiner real de PostgreSQL no Supabase.

### 1.1 Configuração Inicial do Projeto
1.  **Criar Organização/Projeto:** Crie um novo projeto no site oficial do [Supabase](https://supabase.com). Selecione a região `São Paulo (sa-east-1)` para a menor latência em sistemas brasileiros.
2.  **Anotar as Credenciais:** Vá em `Settings > Database`. Você precisará de duas URLs essenciais para o Prisma:
    *   **DATABASE_URL (Transaction):** Usada pela aplicação em tempo de execução via *Connection Pooling*.
    *   **DIRECT_URL (Session):** Usada para rodar as *migrations* direto contra o banco físico.

### 1.2 Integração com Prisma ORM
No seu arquivo `.env` local, configure as chaves que você copiou:
```env
# Banco de Dados da Nuvem (Supabase)
DATABASE_URL="postgres://postgres.xxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgres://postgres.xxx:[PASSWORD]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
```

No seu arquivo `prisma/schema.prisma` já criado, ajuste o bloco `datasource`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 1.3 Rodando a Primeira Migration
Com o `schema.prisma` que escrevemos no último guia, basta "empurrá-lo" para a nuvem. No terminal do seu projeto:
```bash
npx prisma migrate dev --name init_sms_schema
```
**Resultado Esperado:** O Prisma vai gerar o código TypeScript (`PrismaClient`) na sua máquina e injetar as tabelas oficiais (`Aluno`, `Treino`, `Matricula`, etc.) no dashboard do Supabase.

---

## 2. Fase de Pivotagem da Autenticação (Setup Firebase ➡️ Supabase Auth)

Como **Engenheiro de Arquitetura**, recomendo fortemente: já que o Supabase vai guardar nossas tabelas, ele deve guardar nossa Autenticação! Integrar a autenticação de volta no Firebase enquanto o PG roda no Supabase adiciona latência inútil.

1.  **Excluir Firebase Legacy:** Remova todas as referências do Firebase App Client do seu repositório `/src/firebase/`.
2.  **Instalar SSR do Supabase:** Vamos usar a biblioteca pesada para App Router e Server Actions.
    ```bash
    npm install @supabase/ssr @supabase/supabase-js
    ```
3.  **Variáveis Globais:** Adicione ao `.env`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOi..."
    ```
4.  **Integração no Next.js:** Trocar as proteções do `middleware.ts` antigo do Firebase para a validação de Cookies JWT nativa do `@supabase/ssr`.

---

## 3. Fase Vercel (Hospedagem e Edge Network)

Nesta etapa focada em DevOps/Fullstack, subimos nosso Frontend para o mundo. O Next.js "brilha" na Vercel compilando páginas em frações de segundos.

### 3.1 Setup Contínuo (CI/CD)
1.  **Vercel Dashboard:** Conecte sua conta do GitHub em [vercel.com](https://vercel.com) e crie um "Add New Project" apontando para o seu repositório `PWeb_Project`.
2.  **Build Command:** A Vercel entende que é um projeto Next.js. Ela só precisa que você avise o Prisma antes de rodar o *Build*. Altere a configuração *Build Command* para:
    ```bash
    npx prisma generate && next build
    ```

### 3.2 Variáveis de Produção
Antes de clicar em 'Deploy', insira nas "Environment Variables" da Vercel todas as chaves do seu `.env` local:
*   `DATABASE_URL` (Supabase)
*   `DIRECT_URL` (Supabase)
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `GOOGLE_GENAI_API_KEY` (Sua chave do Gemini/Genkit para Treinos).

### 3.3 Deploy Ativo
Clique em Deploy.
**Resultado Esperado:** A Vercel fará o clone, vai ler seu `schema.prisma`, compilar a planta do App Router e te devolver uma URL ativa (PWA `sms.vercel.app` ou seu domínio customizado). A cada `git push origin main`, a Vercel refará esse processo automaticamente.

---

## 4. Checklist de Ação Imediata para o Dev
Para começar a migração hoje, ataque as demandas exatas na seguinte ordem:
- [ ] 1. Criar o Projeto na Plataforma Supabase (Pegar as Senhas).
- [ ] 2. Ajustar o `schema.prisma` com o `directUrl`.
- [ ] 3. Disparar a Migration inicial contra a nuvem Supabase.
- [ ] 4. (Opcional - mas recomendado) Refatorar Auth Firebase p/ Auth Supabase.
- [ ] 5. Conectar GitHub na Vercel e configurar `npx prisma generate && next build`.
