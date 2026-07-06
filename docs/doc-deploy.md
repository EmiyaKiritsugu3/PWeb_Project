# Documento de Implantação (Deploy)

> PWeb_Project — Engenharia de Software II / Iteração 4 (P5)
> Cobertura: ambiente local (Docker Compose), pipeline de CI, deploy de produção (Vercel), versionamento.

---

## 1. Visão geral

| Camada | Tecnologia | Ambiente |
|---|---|---|
| App | Next.js 15 (App Router) + TypeScript 5 | dev / preview / produção |
| DB | PostgreSQL via Prisma 7 | local (Docker) / Supabase / Vercel Postgres |
| Auth | Supabase Auth SSR (`@supabase/ssr`) | dev / produção |
| AI | Google Genkit 1.31 (Gemini) | produção (Vercel) |
| CI | GitHub Actions (lint·typecheck·test·format) | push/PR |
| Quality | SonarQube (`sonar-project.properties`) | 2x/semana |
| E2E | Playwright 1.59 (staging) | agendado / manual |
| Deploy | Vercel (preview/production) | merge em `main` |

---

## 2. Ambiente local — Docker Compose

`docker-compose.yml` sobe Postgres 16 + Next.js dev com migrate/seed automáticos.

### Pré-requisitos
- Docker Engine ≥ 24
- Docker Compose v2
- Variáveis em `.env` (copiar de `.env.example`):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `GEMINI_API_KEY` (ou `GOOGLE_GENAI_API_KEY`) para AI workout gen
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### Subir

```bash
cp .env.example .env        # preencher chaves Supabase/AI
docker compose up -d         # db + app
docker compose logs -f app   # acompanhar boot
# app em http://localhost:3000
```

Comando do serviço `app`:
```sh
npm install && npx prisma migrate deploy && npx prisma db seed && npm run dev
```

### Parâmetros (`.env`, opcionais)

| Var | Default | Descrição |
|---|---|---|
| `POSTGRES_USER` | `postgres` | usuário do DB |
| `POSTGRES_PASSWORD` | `postgres` | senha do DB |
| `POSTGRES_DB` | `pweb` | nome do DB |
| `POSTGRES_PORT` | `5432` | porta exposta |
| `APP_PORT` | `3000` | porta da app |
| `NODE_ENV` | `development` | env Next |

### Reset

```bash
docker compose down -v   # derruba + apaga volume do DB
```

> **Nota:** Auth Supabase é externa ao compose. Para Auth + PostgREST local, use o Supabase CLI local (`supabase start`, ports 54321/54322) — ver `docs/CURRENT-STATE.md` seção E2E.

---

## 3. Pipeline de CI (`.github/workflows/ci.yml`)

4 gates obrigatórios antes do merge (`main`):

| Gate | Comando |
|---|---|
| typecheck | `npm run typecheck` (TS strict) |
| lint | `npm run lint` (ESLint) |
| test | `npm test` (Vitest, coverage 80%+ branch) |
| format | `npm run format:check` (Prettier) |

E2E (`npm run e2e`) roda em branch de staging contra Supabase local.

### Cobertura
- Reporter: Vitest v8 (`coverage/lcov.info`)
- Threshold: branch ≥ 80% (atual: **84.53%**)
- Exclusões (10 patterns, alinhadas com `vitest.config.ts`):
  - `src/lib/actions/**` (server actions, E2E Prisma/Supabase)
  - `src/components/ui/**` (shadcn/Radix wrappers, E2E)
  - `src/test/**` (infra de teste)
  - `src/**/*.d.ts` (declarações de tipo)
  - `src/**/*.config.*` (configs)
  - `src/app/**/loading.*`, `error.*`, `not-found.*`, `layout.*` (Next.js special files)

---

## 4. SonarQube

Config: `sonar-project.properties` na raiz.
Frequência: **2x por semana** (segunda + quinta).

```bash
sonar-scanner \
  -Dsonar.projectKey=PWeb_Project \
  -Dsonar.login=$SONAR_TOKEN
```

Cobertura importada de `coverage/lcov.info` (`sonar.javascript.lcov.reportPaths`).

Ver detalhes em `docs/sonarqube/config.md`.

---

## 5. Deploy — Vercel (produção)

1. Conectar repo `PWeb_Project` ao Vercel (Project Settings).
2. Framework preset: **Next.js**.
3. Build: `npm run build`.
4. Variáveis de ambiente (Vercel → Settings → Environment Variables):
   - `DATABASE_URL`, `DIRECT_URL` (Vercel Postgres)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY` / `GOOGLE_GENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL`, `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
5. Domínios: produção `app.dominio.com`, preview automático por branch.
6. Cada PR abre **Preview Deployment**; merge em `main` → produção.

### Manual (CLI)

```bash
npm i -g vercel
vercel        # preview
vercel --prod # produção
```

---

## 6. Versionamento (SemVer)

- Formato: `MAJOR.MINOR.PATCH` (ex: `v1.0.0`)
- Bump: feature → MINOR, fix → PATCH, breaking → MAJOR
- Tag no commit de release: `git tag v1.0.0 && git push --tags`
- `CHANGELOG.md` mantém histórico por versão (reverse-chrono).

### Release RC-v1.0 (Iteração 4 — P5)

Release candidato do MVP da Iteração 4 (Docker + Implantação + Qualidade Final):

- **Tag:** `v1.0.0` (semântica SemVer release final; `package.json` já em `1.0.0`)
- **GitHub Release:** título `RC-v1.0 (Iteração 4)`, tag `v1.0.0`
- **Referência:** [plano-iterações 2026.1](https://github.com/tacianosilva/eng-software-2/blob/main/projetos/20261/plano-iteracoes.md) — It4 `RC-v1.0`
- **Aplicada:** pós-merge PR #191, no SHA squash em `main`

---

## 7. Conventional Commits

Padrão: `type(scope): mensagem`

| Type | Uso |
|---|---|
| `feat` | nova funcionalidade |
| `fix` | correção de bug |
| `docs` | documentação |
| `test` | testes |
| `chore` | build/config/dev |
| `refactor` | refactor sem mudança de comportamento |
| `ci` | pipeline CI |

Scope: área do código (`aluno`, `auth`, `dashboard`, `e2e`, `mobile`).
Rodapé: `Refs #<task-id>` quando associado a tracker.

Ex: `feat(aluno): PRD-8 mobile card variant for detail tables Refs #187`

---

## 8. AcademicDevFlow

Fluxo acadêmico (LabEnS — `labens.dct.ufrn.br/academicflow`):
1. Planejar iteração (`docs/plano-iteracao.md`)
2. Implementar US da tela ao banco
3. Testes unidade (dev) + aceitação (relatório)
4. SonarQube 2x/semana
5. Documentar + versionar + tag

### Iteração 4 (P5) — cobertura ADF + release RC-v1.0

| Step ADF | Evidência |
| --- | --- |
| 1. Planejar | `docs/plano-iteracao.md` + plano de remediação |
| 2. Implementar US tela-banco | US13 PRD-8 PR #187 (merge squash `3ddf0fb`) |
| 3. Testes unidade + aceitação | 1137/1137 unit, 21 E2E, `docs/relatorio-testes.md` (modelo taciano) |
| 4. SonarQube 2x/semana | cron `3 9 * * 1,4` em `ci.yml`, registry `docs/sonarqube/scans.md` |
| 5. Documentar + versionar + tag | `docs/doc-deploy.md` + tag `v1.0.0` + CHANGELOG + GitHub Release `RC-v1.0` |

Release RC-v1.0 aplicada na It4, tag `v1.0.0` no SHA pós-merge PR #191 em `main`.
