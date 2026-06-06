# Technical Debt Ledger — Sentinel Protocol [PID-SENTINEL]

Este documento rastreia compromissos arquiteturais e infraestruturais assumidos em prol da velocidade, com caminhos de resolução definidos.

## 📂 Dívidas Ativas

### 1. [INFRA] Ruído de Build: OpenTelemetry Jaeger Warning
- **Data**: 2026-04-24
- **Sintoma**: `Module not found: Can't resolve '@opentelemetry/exporter-jaeger'` durante `next build`.
- **Causa**: O SDK do Genkit tenta carregar exportadores de trace dinamicamente que não estão instalados.
- **Impacto**: Baixo. Apenas poluição visual no log de build. Não afeta a aplicação ou o Sentry.
- **Motivo da Dívida**: Evitar o bloat de dependências desnecessárias no `package.json`.
- **Caminho de Resolução**: Adicionar `externals` ou `ignore` no Webpack (dentro de `next.config.ts`) caso o log precise de silenciamento total para auditorias rigorosas.

### 2. [TEST] Falha de Seed no E2E (Ambiente Local)
- **Data**: 2026-04-24
- **Sintoma**: O teste `payment-status.spec.ts` falha ao buscar "Aluno Inadimplente E2E".
- **Causa**: Inconsistência entre o script de seed e as expectativas do teste Playwright.
- **Impacto**: Médio. Mascara falhas reais de regressão no fluxo de pagamento.
- **Caminho de Resolução**: Sincronizar `prisma/seed-e2e.ts` com os seletores do Playwright.
- **Status**: ✅ Resolved (2026-06-06) — Playwright `globalSetup` agora invoca `prisma/seed-e2e.ts` automaticamente (elimina passo manual `npm run seed:e2e`), e `.env.test` foi renomeado para a convenção Supabase SSR 0.10+ (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`).

---
*Mandato: Uma dívida documentada é um custo gerenciado. Uma dívida oculta é um risco.*
