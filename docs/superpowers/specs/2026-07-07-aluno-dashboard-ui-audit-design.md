# Design: ALUNO Dashboard UI/UX Audit & Premium Polish

**Date:** 2026-07-07
**Branch:** `fix/aluno-dashboard-ui-audit` (5 PRs, one per phase)
**Scope:** UI/UX corrections on `/aluno/dashboard` + downstream components. Zero schema/API changes in Phase 0/1/4; Phase 2/3 add read-only Prisma queries.

## Context

P5 iter 4 shipped (`v1.0.0` 2026-07-06). Mobile-first PRDs 1-4 merged (#176, #179, #180, #181). PRD-5 (WorkoutSession fullscreen) open (#182). Audit surfaced 8 critical UX issues + 6 missed-by-initial-audit + 8 polish items. Plan sequences fixes by ROI: 1 non-breaking quick-win PR (P0), 1 refactor (P1), 1 empty-state feature (P2), 1 KPI-honesty PR (P3), 1 a11y polish (P4).

User directive: "funcional, agradável, sem exageros, mas que impressione" → maximize signal density per pixel, remove fabrication, zero decorative noise.

## Audit Findings (verified against code 2026-07-07)

### Confirmed P0-P1 (caught by initial audit)

1. **`bg-black` bypasses design tokens** — `dashboard-client.tsx:85` raw `#000` ignores OKLCH `--color-background`.
2. **4 cards duplicate inline classes** — `dashboard-client.tsx:117,134,201,249` repeat `bg-[#18181B] border-white/10 rounded-xl shadow-...`. `card.tsx` already supports `glass` variant — unused.
3. **KPI fabricated** — `dashboard-client.tsx:230` "Meta Semanal 80%" + `237` "Power Index 752" hardcoded. PRD-2 (#180) removed 1 fake badge but left these.
4. **Emoji 🔥 in streak counter** — `dashboard-client.tsx:125` violates "no emoji as structural icons".
5. **`text-[8px]` / `text-[10px]`** — 6 occurrences below 12px legibility floor (8px achievements labels, 10px stat headers).
6. **`motion.div` ignores `prefers-reduced-motion`** — framer-motion uses RAF; global CSS media query (`globals.css:198-207`) has no effect.
7. **CardFeedback silent when AI fails** — `dashboard-client.tsx:60-64` AI throws → toast shown + `feedback` stays `null` → `CardFeedback` returns `null`.
8. **"Ver Todas" conquistas button no-op** — `dashboard-client.tsx:258-264` decorative, no `onClick`.

### Missed by initial audit (P1-P2)

9. **Sequential DB queries = waterfall** — `page.tsx:16-77` `await alunoPromise` then `await treinoPromise`. ~500ms vs ~300ms with `Promise.all`.
10. **"Dia de Descanso" treats new-user same as rest-day** — `card-treino.tsx:38-55` blank for both scenarios. New user sees "descanso ativo" forever, no CTA.
11. **i18n bypass** — `dashboard-client.tsx:212` `label="Level Progress"` literal English while app uses `useI18n()` everywhere else.
12. **`staggerChildren: 0.15`** — 150ms × 2 children = 300ms. UX guideline: 30-50ms per item.
13. **Avatar fetched but unused** — `page.tsx:21` selects `fotoUrl`, `dashboard-client.tsx` never renders it.
14. **Bottom nav 2 items, no fast workout-start path** — `layout.tsx:11-14`.

### Polish (P3)

15. `mb-10` (40px) mobile hero→grid gap oversized for 375px.
16. `font-black` (900) `tracking-tighter` in hero — heavy at small sizes.
17. Conquistas row fixed 3 columns, no responsive wrap.
18. `aria-live="polite"` missing on feedback container.

---

## Design Decisions

**Q1: Fix order — feature-first or bug-first?**
A: Bug-first. P0 is 7 non-breaking surgical fixes (< 1h) that compound with every future PR.

**Q2: Refactor 4 cards into shared `.dashboard-card` class or extract components?**
A: Both. Class for visual unification (`globals.css`), components for future reuse.

**Q3: Empty state — distinguish new user vs rest day?**
A: Yes. `mode: 'workout' | 'rest' | 'new-user'` prop. New-user path highest priority (conversion).

**Q4: Remove KPI fake or backfill with real calculation?**
A: Backfill. Remove = empty-feeling regression. Calculate `treinosNoMes / dias_passados_mes * dias_total_mes` as "Meta Mensal" %. Drop "Power Index" (no schema field).

**Q5: Add achievements backend or replace with simple streak visual?**
A: Replace. Schema lacks `Conquista` table. 7-day strip showing past week as filled/empty dots.

**Q6: Avatar placement?**
A: Hero gets avatar (left of name). Mobile-first, replaces redundant header avatar (UserMenu in dropdown).

**Q7: Use reduced-motion in framer-motion?**
A: Yes. `useReducedMotion()` hook → skip `initial`/`animate` when true.

---

## Phased Workflow

### Phase 0 — Quick Wins (P0, 1 PR)

**Branch:** `fix/dashboard-quick-wins-p0`
**Risk:** Low. 7 atomic commits, each reversible.
**Time:** ~1h.

- [ ] **T01** — `dashboard-client.tsx:85` `bg-black` → `bg-background` | verify: `grep "bg-black" src/app/aluno/dashboard/`
- [ ] **T02** — Same file:125 replace `🔥` with `<Flame />` Lucide | verify: emoji gone
- [ ] **T03** — Same file:212 `label="Level Progress"` → `label={t('dashboard.levelProgress')}` + add i18n key (pt + en) | verify: literal gone
- [ ] **T04** — Same file:258-264 remove decorative "Ver Todas" button | verify: gone
- [ ] **T05** — `page.tsx:16-77` `Promise.all([alunoPromise, treinoPromise])` | verify: `npm run typecheck`
- [ ] **T06** — Same file after AI failure: set fallback `feedback` so CardFeedback always renders | verify: simulate AI fail → card visible
- [ ] **T07** — Same file:94 `mb-10` → `mb-6 md:mb-10` | verify: 375px screenshot

```bash
npm run lint && npm run typecheck && npm test -- dashboard-client page.test
```

---

### Phase 1 — Card Pattern Unification (P1, 1 PR)

**Branch:** `refactor/dashboard-card-pattern`
**Risk:** Medium. Visual regression risk → before/after screenshot.
**Time:** ~2h.

- [ ] **T01** — `globals.css` add `.dashboard-card` utility (OKLCH bg, white/5 border, cyan hover shadow) | verify: build
- [ ] **T02** — `dashboard-client.tsx` replace inline classes on 4 cards with `className="dashboard-card ..."` | verify: 4 visually identical
- [ ] **T03-T06** — Extract `StreakCard`, `WorkoutsCard`, `ProgressCard`, `AchievementsCard` → `src/components/dashboard/aluno/` | verify: 4 imports work
- [ ] **T07** — Update unit tests to mock 4 components | verify: tests pass

Snapshot before/after at 375/768/1440px, pixel diff < 1%.

---

### Phase 2 — Empty State Differentiation (P2, 1 PR)

**Branch:** `feat/aluno-empty-state-distinction`
**Risk:** Medium. Backend query addition.
**Time:** ~2h.

- [ ] **T01** — `page.tsx` add `prisma.treino.count({ where: { OR: [{alunoId}, {instrutorId: alunoId}] } })` parallelized with Promise.all | verify: 1 query
- [ ] **T02** — `CardTreino` add `mode: 'workout' | 'rest' | 'new-user'` prop | verify: typecheck
- [ ] **T03** — Mode `'new-user'`: `<Sparkles />` + "Vamos começar?" + 2 CTAs (Gerar IA / Criar Manual) | verify: clicks navigate
- [ ] **T04** — Mode `'rest'`: current content + "Ver Próximo Treino" → finds next treino with `diaSemana > today` | verify: shows correct day
- [ ] **T05** — Mode `'workout'`: unchanged | verify: existing tests
- [ ] **T06** — Unit tests for 3 modes | verify: pass

---

### Phase 3 — KPI Honesty + Achievements Visual (P3, 1 PR)

**Branch:** `fix/kpi-honesty-achievements-visual`
**Risk:** Low. Pure data swap + visual redesign.
**Time:** ~2-3h.

- [ ] **T01** — Remove hardcoded "Meta Semanal 80%" + "Power Index 752" (lines 224-238) | verify: gone
- [ ] **T02** — Add real metric: `Meta Mensal` = `treinosNoMes / 16` baseline → percentage | verify: dynamic
- [ ] **T03** — Add `Sequência Atual` visual: 7-dot strip (last N filled cyan, others gray) | verify: matches `streakDiasSeguidos`
- [ ] **T04** — Replace 3 hardcoded achievements with 7-day strip | verify: visual matches data
- [ ] **T05** — Add `aria-live="polite"` to feedback card container | verify: SR announces
- [ ] **T06** — Update unit tests | verify: pass

---

### Phase 4 — A11y Premium Polish (P4, 1 PR)

**Branch:** `fix/a11y-premium-polish`
**Risk:** Low. Defensive.
**Time:** ~1-2h.

- [ ] **T01** — `dashboard-client.tsx` import `useReducedMotion`, wrap main `motion.div` line 93 (skip animate when true) | verify: reduced-motion toggle
- [ ] **T02** — Same wrap on 4 child `motion.div` (164, 185, 197, 245) | verify: same
- [ ] **T03** — Replace `text-[8px]` (271, 279, 287) with `text-xs` (12px) | verify: `grep "text-\[8px\]"`
- [ ] **T04** — Replace `text-[10px]` stat labels with `text-xs`, keep `uppercase tracking-widest` | verify: contrast ≥ 4.5:1
- [ ] **T05** — Hero: `text-3xl font-bold tracking-tight md:text-6xl md:font-black md:tracking-tighter` | verify: 375px no overflow
- [ ] **T06** — Hero: add `<Avatar>` with `aluno.fotoUrl` + `<AvatarFallback>` | verify: avatar shows
- [ ] **T07** — Add `data-testid` on CardFeedback container | verify: E2E stable

Lighthouse a11y ≥ 95. Manual reduced-motion toggle + VoiceOver test.

---

## Cross-Phase Concerns

**Memory updates:** After each phase, update `docs/CURRENT-STATE.md` PR section + create memory entry if new pattern discovered.

**PR sequencing:**

```
P0 → merge → P1 → merge → P2 → merge → P3 → merge → P4 → merge
```

Each PR independent. Pause safe at any boundary. Each must pass 4 gates (lint, typecheck, test, format).

**E2E impact:** None expected (UI-only). 21/21 E2E should stay green. Add 1 new E2E in P2 for empty-state-new-user flow.

**SonarQube impact:** Phase 1 adds 4 files; coverage must stay ≥ 80% (component tests included).

**Performance:** P0 (Promise.all) saves ~200ms SSR. P4 (reduced-motion) improves perf when enabled.

**Risk register:**

| Risk | Mitigation |
|------|------------|
| Visual regression P1 | Before/after screenshot, pixel diff |
| P2 query breaks auth | Use `resolveAlunoId` helper from PR #174 |
| P3 removed KPI feels empty | Backfill with real metric (T02) |
| P4 reduced-motion breaks framer | Conditional render, no flicker |

---

## Out of Scope

- PRD-6 KPI/charts — separate roadmap item (`feat/workout-session-mobile`)
- PRD-7 meus-treinos UX — PR #181 merged
- PRD-8 login parity + next/font — separate spec
- Font swap (Barlow + Inter) — breaking visual change, needs PRD
- Achievements backend system — schema change, needs ADR
- i18n full audit — T03 fixes one label only

---

## Acceptance Criteria

- [ ] All 5 phase PRs merged, 4/4 gates green
- [ ] No `bg-black` on dashboard (uses tokens)
- [ ] No 🔥 emoji (uses Lucide Flame)
- [ ] No `text-[8px]`/`text-[10px]` on dashboard
- [ ] No hardcoded fake KPI numbers
- [ ] No `motion.div` without reduced-motion check
- [ ] Empty state distinguishes new-user from rest-day
- [ ] Lighthouse a11y ≥ 95
- [ ] All 21 E2E + new empty-state E2E green
- [ ] Lighthouse mobile perf (dashboard) unchanged or improved
