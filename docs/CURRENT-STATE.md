# Estado Atual (2026-07-09)

## `feat/gerente-dashboard-refactor` — dashboard GERENTE refactor completo (10/10 tasks)

**Branch:** `feat/gerente-dashboard-refactor`. Spec: `docs/superpowers/specs/2026-07-09-gerente-dashboard-refactor-design.md`. Plano: `docs/superpowers/plans/...` (10 tasks TDD, SDD pipeline). Objetivo: equalar dashboard GERENTE ao padrão ALUNO — dados reais (zero fake), tokens de design, empty-states honestos, sem gamification.

### Tarefas (SDD: fresh subagent + task reviewer por task)

- **T1** (`45f193f`): schema real series — `MonthTotalSchema`/`PlanTotalSchema`/`DashboardDeltasSchema` substituem `crescimentoAnual` sintético. `.strict()` em `DashboardStatsSchema`.
- **T2** (`0a3aeba`+`eb98934`): queries Prisma reais (`getMatriculasPorMes` groupBy dataCadastro, `getReceitaPorMes` groupBy dataPagamento, `getMatriculasPorPlano` count ATIVA). `pctDelta()` para KPI deltas. Re-throw em erro DB (sem try/catch swallowing).
- **T3** (`7806e45`): `KpiCard` — Card glass + delta badge (▲▼ ícone+texto verde/vermelho, não só cor), `aria-label`, `data-testid="kpi-<title>"`.
- **T4** (`edb6e50`): `EmptyState` — Card glass tracejado, portado do padrão `card-treino.tsx`. Props `{icon, title, description, testId?}`.
- **T5** (`6d08e64`+`a5abe6e`): `DashboardChartsMulti` — 3 BarCharts recharts tokenizados (matrículas/mês, faturamento/mês, distribuição/plano). `role="img"`+`aria-label` por chart (wrapper div, não BarChart — fix jsdom ResponsiveContainer 0×0). `EmptyState` quando 3 séries vazias.
- **T6** (`68c9d90`): overview page wiring — grid 4 `KpiCard` (Total Alunos, Matrículas Ativas, Inadimplentes, Faturamento Mensal) + `DashboardChartsMulti`. Mapeamento deltas: `.alunos`→Total, `.novos`→Ativas, `.inadimplentes`→Inadimplentes, `.receita`→Faturamento. Moeda BRL.
- **T7** (`6a58de1`): fix double `<main>` landmark — removido `<main>` extra em `layout.tsx`, `pb-20` no inner div. `SidebarInset` (sidebar.tsx) retém `<main>`.
- **T8** (`c87ef7f`+`c2830e6`): tokenize 4 sub-pages (alunos/financeiro/planos/treinos) — `bg-black`→`bg-background`, `#18181B`→`glass-card glow-cyan`, `text-zinc-400`→`text-muted-foreground`, `pb-20`. Suspense em treinos (inerte — prisma findMany precede boundary; `ponytail:` brief-mandated).
- **T9** (`cd89df5`): `loading.tsx` (`DashboardOverviewSkeleton`) + `error.tsx` (`'use client'`, AlertTriangle, `role="alert"`, Button `reset()` "Tentar novamente").
- **T10** (`15f9343`): delete legacy `dashboard-charts.tsx` (+test) — substituído por `dashboard-charts-multi.tsx`. Zero importers.

### Gates (4/4)

- **Vitest**: 1172 pass, 0 fail (subiu de 1164 — novos testes T3-T9).
- **TypeScript** strict: No errors.
- **ESLint**: 0 errors, 0 warnings.
- **E2E**: DEFERIDO para merge-time. Requer Supabase local (54321/54322) + `.env.test` + dev server. Risco baixo: refactor toca só render/token/componente — nenhuma rota/auth/middleware/middleware-rota/API-contract alterado. `npm run e2e` validável antes do PR.

### Notas

- TS7 NO-GO (Next 15.5 build crash + typescript-eslint crash + Prisma block). Mantido TS 6.0.3. Skill `compiler-major-bump-feasibility-audit` extraída.
- `financeiro/page.test.tsx` ganhou assertions `#18181B`+`text-zinc-400` post-review (spec checklist gap do implementer).
- Treinos Suspense é inerte (data fetch no page body precede boundary) — `ponytail:`: brief-mandated, mantém; mover Suspense para dentro de client component se quiser fallback real durante fetch.
- Commits de fixup (`eb98934`, `a5abe6e`) podem ser squashed antes do PR se desejado.

---

## PR #194 `feat/aluno-ui-10-fixes` — review remediation completa (cubic + coderabbit)

**Branch:** `feat/aluno-ui-10-fixes` (PR #194, +956/-371, 23 files). 4 commits de remediação: `f07f39f` (P0-P2), `48d6dd7` (sfU+se1), `7397157` (sfi+PLDGo), `641831d` (P2/P3 test coverage + a11y).

### Remediação final — commit `641831d`

28+ comentários triaged (4 bots: cubic ×2, coderabbit ×2) → 16 fixed / 4 FP / 8 deferred. Última batch resolveu os 8 deferred:

- **O8GbK (P3)**: `card-treino` `focus-visible`→`focus-within` em exercise row div (container não-focusable; focus-within dispara no child focado).
- **O9Faj (P2)**: `.env.example` `NEXT_PUBLIC_APP_URL` revertido para `:3000` (match `next dev` default; `:3001` quebrava dev parity + test env).
- **O9Fap + O9Fa4 (P2)**: OAuth return contract split — campos dedicados `url`/`error` substituem heuristic `startsWith('http')`. `auth.ts` + 2 login pages + `auth.test.ts` atualizados.
- **O8Gaq (P2)**: `meus-treinos-client.test` — assert exercise names render (sliced 3, joined), omitidos quando 0 exercícios.
- **O9FaX + PMTVI (P2)**: `dashboard-client.test` — mock `@/lib/actions/treinos` (desbloqueia Prisma DATABASE_URL import-time failure) + WorkoutSession gate. Cobertura: WorkoutSession state toggle, `router.refresh()` pós `registrarHistoricoTreinoAction` success, error path.
- **PMTVN (P2)**: `aluno/login.test` — account-enumeration guard: "User already registered" + "User has already been registered" ambos mascarados p/ credential error genérico, sem leak, sem push.
- **sfi (resolved prior)**: lazy `NEXT_PUBLIC_APP_URL` read dentro de `callbackUrl()` (não module load) p/ test harness injetar env pós-import.

### Gates

112 test files / 1159 tests pass. Typecheck clean. Lint clean (prettier reformatou hoisted block). Push `641831d` em `7397157..641831d`.

### Threads GitHub

8 threads cubic-dev-ai resolvidas via `resolveReviewThread` (O8Gaq, O8GbK, O9FaX, O9Faj, O9Fap, O9Fa4, PMTVI, PMTVN). 0 unresolved restantes no PR #194.

---

## Iteração 4 (P5) — CI/CD + Docker + SonarQube — PR #191 + #192 merged, tag estabilizada

## Iteração 4 (P5) — CI/CD + Docker + SonarQube — PR #191 + #192 merged, tag estabilizada

**Branch main:** PR #191 (`db60bf9`) + PR #192 (`41dc8a6`) squash-merged. Tag `v1.0.0` em `1a68112` (CHANGELOG commit). Release `RC-v1.0 (Iteração 4)` publicada.
**Tarefa:** [P5-tarefa5](https://github.com/tacianosilva/eng-software-2/blob/main/tarefas/projetos/P5-tarefa5.md).

### Entregas P5 (PR #191 merged)

- **Cobertura branch 79.65% → 84.53%** (alvo 80%): excluído `src/components/ui/**` (shadcn/Radix wrappers) do coverage vitest + SonarQube exclusions. Issue #188 (fechada).
- **Docker:** `docker-compose.yml` (postgres:16-alpine + node:22-alpine dev, migrate/seed auto). Issue #189 (fechada).
- **Docs:** `docs/doc-deploy.md` + `docs/sonarqube/config.md` + `docs/sonarqube/scans.md` (1ª exec 2026-07-06, branch 84.53%, gate PASS). Issue #190 (fechada).
- **CI:** `.github/workflows/ci.yml` `schedule: cron '3 9 * * 1,4'` + `workflow_dispatch` (SonarQube 2x/semana seg+qui).
- **Relatório:** `docs/relatorio-testes.md` iter 3→4 (P5), US13 PRD-8 (#187) US do membro (tela→banco), 2 tabelas modelo taciano + fluxos A1/A2/A3.
- **Issues bugs:** #188 #189 #190 criadas + fechadas. #160 (16 SonarQube FP) + #122 (ESLint upstream) permanecem abertas (fora escopo P5).

### Gates (CI PR #191)

13/14 SUCCESS. GitGuardian FAILURE (FP: `POSTGRES_PASSWORD:-postgres` default dev em `docker-compose.yml`).

### Pendências P5

- **2ª execução SonarQube (2026-07-09, cron automático)** — quinta, não 2026-07-10 (sexta). 4 loc a corrigir R04.
- SonarCloud action pré-existente usa tag `v2.89.0` (Semgrep WARNING pin SHA) — fora escopo P5.

### Remediação P5 — PR #192 (MERGED)

PR #191 merged **sem corrigir 26 reviews** (4 P1, 12 P2, 2 P3 de cubic-dev + coderabbit). Plano auditado em `~/.claude/plans/shimmering-knitting-plum.md`. R01-R12 aplicados (commit `3c712d8`) + cubic P1 bump `sonarqube-scan-action` v4.2.2 → v8.2.0 SHA. PR #192 squash-merged `41dc8a6`. Gates locais: lint ✅ typecheck ✅ test 1137/1137 ✅ format ✅ commitlint ✅. CI 14/14 SUCCESS. GitGuardian ✅ (R01 removeu FP default password).

### T05 ✅ DONE

Tag `v1.0.0` movida de `db60bf9` → `1a68112` (CHANGELOG commit em main pós-rebase). CHANGELOG.md `## [1.0.0]` topo. Release `RC-v1.0 (Iteração 4)` publicada: https://github.com/EmiyaKiritsugu3/PWeb_Project/releases/tag/v1.0.0

Não ações (ponytail): aguardar cron 09/07 p/ métricas reais (T06 placeholder), SonarCloud action pin (fora escopo P5).

---

## Mobile-First Premium Polish (v0.10.0 em andamento)

**Branch ativa:** `feat/workout-session-mobile` (PR #182 aberto, aguardando CI)
**PRs mobile-first:** PR #176 (PRD-1) ✅ → PR #179 (PRD-3) ✅ → PR #180 (PRD-2) ✅ → PR #181 (PRD-4) ✅ → PR #182 (PRD-5) 🟡.

### PRD-5 — Workout Session Fullscreen — PR #182 (open)

`src/components/WorkoutSession.tsx`: mobile fullscreen overlay (`fixed inset-x-0 top-0 z-50 h-dvh bg-background`), desktop inline (`md:static md:bg-transparent`). Card vira flex column: `CardContent` scrollável `overflow-y-auto` + `CardFooter` sticky `backdrop-blur` (timer + Próximo/Finalizar acima da URL bar iOS). Series row `data-testid="series-row"`, check buttons `data-testid={`serie-check-${idx}`}` + `aria-label` + `.touch-target` (44px). `animate-[slide-up_0.3s_ease-out] motion-reduce:animate-none`.

`src/app/globals.css`: `@keyframes slide-up` no utilities layer.

E2E `tests/e2e/specs/workout-session.spec.ts`: `div.grid-cols-4` selector → `getByTestId('serie-check-0')` (2 ocorrências). Stable contra refactor de grid/Tailwind purge.

Unit `src/components/WorkoutSession.test.tsx`: Button mock `filterDomProps` passa `data-*`/`aria-*`/`className`. Toggle test sai de svg/`data-variant` filter frágil → `getByTestId('serie-check-0')`. 15/15 pass, 1133/1133 suite.

### PRD-4 — Meus Treinos Kebab + Primary Action — merged #181

### PRD-4 — Meus Treinos Kebab + Primary Action — PR #181 (open)

`src/app/aluno/meus-treinos/meus-treinos-client.tsx`: card aluno ganha kebab overflow (`Editar`/`Excluir` em shadcn `DropdownMenu`), `Iniciar Treino` promovido a CTA primário full-width mobile. Select dia em linha própria acima das ações. `Excluir` com `text-destructive` dentro do menu (separado da primária, mis-tap risk fixado). Empty state: ícone (Dumbbell) + heading + subtext + CTA `Criar primeiro treino` (reusa trigger `__new__`). `font-headline` (Outfit) no H3. data-testids: `treino-card`, `iniciar-treino`, `treino-kebab`, `editar-treino`, `excluir-treino`.

Banner auto-hide split em effect separado keyed on `showPlanBanner` (react-hooks/set-state-in-effect); eslint-disable scoped no effect de derive de prop.

Test: `useWorkoutCRUD` mock parametrizado para respeitar `initialTreinos` (gap de cobertura real — empty state nunca exercitado antes). Mock dropdown-menu. 3 novos asserts (kebab, primary, empty state). 1132/1132 pass. 0 errors lint/typecheck.

### PRD-3 — Bottom Navigation (mobile) — merged #179

Shared `src/components/bottom-nav.tsx` (client, `md:hidden`, 44pt touch-target, safe-area pb, reduced-motion-safe). Wired into ambos os portais:

- **Aluno** (mobile): 2 items (Dashboard, Meus Treinos).
- **Dashboard** (mobile): GERENTE 5 items, INSTRUTOR/RECEPCIONISTA 3 (FINANCIAL_ROUTES exclui Financeiro+Planos). Dev fica sidebar-only.

Refactor `getNavItems(role)` extraído de `DashboardNav` — single source de nav filtrada por role, compartilhada sidebar + bottom bar. `UserMenu` (aluno) perdeu `navLinks` prop + bloco `md:hidden` redundante no dropdown.

### PRD-2 — Brand Consistency — merged #180

Orange hex landing → oklch primary + `.glow-cyan`/`.text-gradient-cyan` tokens (`page.tsx`: drop-shadow L25, gradient L40, CTA shadow L51). Dashboard KPI: removido badge fake "↑ 12% vs mês anterior" (`getDashboardStats` sem prior-period data) + hack `kpi.color.replaceAll('/20','')` — glow line reusa `kpi.color` gradient direto. `text-orange-400` em Flame streak (alunos/[id]) mantido — semântico (fogo), carve-out spec.

### PRD-1 — Mobile-First Foundation (merged #176)

Viewport `viewportFit: cover`, dvh swap 13 files, 44pt touch-target, safe-area, reduced-motion.

### Sequência mobile-first

PRD-1 ✅ → PRD-2 ✅ → PRD-3 ✅ → PRD-4 🟡 (PR #181 open) → 5 (meus-treinos UX) → 6 (WorkoutSession fullscreen) → 7 (KPI/charts) → 8 (login parity + next/font). PRD-5 próxima após merge PR #181.

---

## v0.9.0 — AI Workout Gen Fix + Meus Treinos UX Overhaul

**Última versão:** v0.9.0
**Branch principal:** `main`
**CI:** 4/4 quality gates.

### Sessão 2026-07-05

**PR #174 — FK fix:** `resolveAlunoId(user)` resolve Prisma `aluno.id` by email para ALUNO role. Fix para foreign key violation em `performTreinoUpsert`. Squash merged.

**PR #175 — UX overhaul:** Editor inline dentro dos cards (WorkoutEditor `compact`). Banner visual "Plano Semanal" pós geração AI (auto-hide 30s). Scroll após gen com `requestAnimationFrame` (max 20 tentativas). Botão "Criar Manual" reposicionado acima da lista. Editor inferior removido. `handleSave` retorna boolean — editor fecha só no success. Silent errors em handleDelete/handleDayChange corrigidos. Auth checks unificados com `resolveAlunoId()`. `onSuccess` opcional em `useWorkoutGeneration`. 12 commits, 10 files.

**Root cause AI gen crash:** `GOOGLE_GENAI_API_KEY` ausente no Vercel deployment env. Adicionado via CLI (`vercel env add`) aos targets production, preview, development. Redeploy feito.

### v0.8.0 — It5: Instrutor Auth + Recharts 3 + Security Audit

**Última versão:** v0.8.0
**Branch principal:** `main`
**CI:** 4/4 quality gates (typecheck · lint · format:check · test). 21/21 E2E.

### O que foi feito

#### It5 — Instrutor Authorization Hardening (spec 007)

12/12 tasks shipped. `requireAnyRole` route gate guarding `/dashboard/treinos` (INSTRUTOR/GERENTE only). Server-derived `instrutorId` via role check in `upsertTreinoAction`, ownership guards on `updateTreinoDayAction`/`deleteTreinoAction`. 19 E2E scenarios, incl. negative auth tests (RECEPCIONISTA redirect, unauthenticated block).

#### Recharts 2 → 3 Upgrade (spec 008)

PR #78 (2026-04-22). Breaking type change absorbed: `TooltipContentProps`, `DefaultLegendContentProps` import pivot. ADR-001 documents decision. No runtime regression.

#### Security Audit & Dependency Fixes

- **postcss CVE GHSA-qx2v-qp2m-jg93**: `next@15.5.20` bundles nested `postcss@8.4.31` (<8.5.10). Fixed via npm `overrides` forcing ^8.5.16 (PR #170).
- **js-yaml CVE**: removed in dep security audit (PR #164).
- **ESLint code smells**: 7 errors, 28 warnings fixed (PR #167).
- **Dependabot PRs #165/#166**: merged (16 minor + 27 patch bumps).
- **npm audit**: 0 high, 2 moderate (OpenTelemetry core, uuid — no fix available, deferred).

#### CI & Test Infrastructure

- **E2E 21/21 green**: fixed PostgREST grants in `supabase/seed.sql`, cookie race via client-side redirect, dotenv clobber in global-setup. Infrastructure tested live after 23-day main break.
- **Coverage**: branch coverage 78.68% (PR #168).
- **4 CI gates**: typecheck 0 errors, ESLint 0 errors (10 pre-existing warnings), 1103/1103 vitest, format:check pass.

#### Maintenance

- 14 stale It3 issue trackers closed (#43-#56).
- ADR dir created (`docs/decisions/`, git-tracked via `!ADR-*.md` negation). ADR-001: recharts 3 upgrade.
- Memory saved: postcss override pattern for nested transitive CVEs.

### Pendências Técnicas

- **ESLint 10 (#122)**: blocked upstream (eslint-config-next #3979).
- **SonarQube 16 smells (#160)**: all false positives (skeleton keys, cmdk, logger).
- **Branch coverage 80% (#159)**: 78.68% → 80% target.
- **Academic trackers**: #96 (ODBC), #106 (MongoDB) kept open.
