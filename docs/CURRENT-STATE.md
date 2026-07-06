# Estado Atual (2026-07-06)

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
