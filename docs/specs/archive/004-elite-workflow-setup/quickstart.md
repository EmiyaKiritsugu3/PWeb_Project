# Quickstart: 004 — Elite Workflow Setup

**Após completar todas as tasks desta feature, o ambiente funciona assim:**

---

## Desenvolvimento Local

```bash
# 1. Instalar dependências (Playwright browsers)
npx playwright install chromium

# 2. Rodar dev server
npm run dev

# 3. Rodar todos os testes (unit + E2E)
npm run test              # unit tests (Vitest)
npm run e2e               # E2E tests (Playwright, requer dev server rodando)
npm run e2e:ui            # UI interativa do Playwright

# 4. Ver coverage
npm run test:coverage     # relatório no terminal
```

---

## Staging Environment

```bash
# Usar variáveis do staging (banco isolado de produção)
cp .env.staging .env.local   # NÃO commitar — .gitignore já exclui

# Popular banco de staging com dados de teste
npm run seed:e2e

# Rodar E2E contra staging
PLAYWRIGHT_BASE_URL=<staging-url> npm run e2e
```

---

## CI/CD Flow (GitHub Actions)

Após um push ou PR, o pipeline roda em 3 jobs sequenciais:

```
Job 1: lint       → eslint + typecheck (falha imediata em any ou erro TS)
Job 2: test       → vitest + coverage threshold em src/lib/ e src/services/
Job 3: e2e        → Playwright contra dev server com banco de staging
```

PR só pode ser mergeado se os 3 jobs estão verdes.

---

## Monitoramento de Erros (Sentry)

- **Dashboard**: https://sentry.io/organizations/[sua-org]/projects/smart-management/
- **Alertas**: Configurados para erros novos e spike em error rate
- **Source maps**: Uploadados automaticamente pelo CI em cada deploy

---

## Secrets Necessários no GitHub

| Secret                      | Onde encontrar                        | Usado em              |
| --------------------------- | ------------------------------------- | --------------------- |
| `SENTRY_AUTH_TOKEN`         | sentry.io → Settings → Auth Tokens    | CI source maps upload |
| `NEXT_PUBLIC_SENTRY_DSN`    | sentry.io → Project → DSN             | Client error tracking |
| `SUPABASE_URL_STAGING`      | Supabase → Branch → Settings          | E2E job               |
| `SUPABASE_ANON_KEY_STAGING` | Supabase → Branch → Settings          | E2E job               |
| `DATABASE_URL_STAGING`      | Supabase → Branch → Connection string | seed:e2e              |

---

## Verificação de Saúde

```bash
npm run lint          # deve retornar: 0 errors, 0 warnings
npm run typecheck     # deve retornar: Found 0 errors
npm run test          # deve retornar: 9+ tests passing, coverage ≥ 80% em src/lib/
npm run e2e           # deve retornar: 4 suites passing
```
