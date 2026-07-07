# PRD — Aprimoramento UI Aluno (PWeb_Project)

**Data**: 2026-07-07
**Status**: Draft (aguarda aprovação)
**Branch alvo**: `feat/008-aluno-ui-premium`
**Dependências**: nenhuma
**Owner**: design + frontend

---

## 1. Contexto

Auditoria exaustiva da superfície Aluno (PWeb_Project / Five Star Gym / Aegis Fitness OS) identificou 25 melhorias concretas, ordenadas por impacto e risco. Esta PRD é a fonte de verdade para a execução.

**Stack**: Next.js 15 App Router · Tailwind v4 (OKLCH) · Inter + Outfit · lucide-icons · dark-first OLED · TypeScript strict.

**Constraint cultural**: ponytail (lazy senior dev) — diff mínimo, stdlib/native first, sem abstração especulativa, sem nova dep sem justificativa.

---

## 2. Visão

> Aluno abre o app e em 3 segundos vê seu próximo treino + progresso real, sem ruído, sem dados falsos, com hierarquia clara que impressiona sem exagerar.

---

## 3. Princípios (premium = disciplina, não efeito)

1. **Sem dados falsos** — KPI inventado destrói confiança.
2. **Hierarquia em 3 níveis** — Headline → ação primária → contexto. Sem 4º nível competindo.
3. **Estado vazio é first-class** — aluno novo vê CTA claro, não tela morta.
4. **A11y não é opcional** — heading semântico, autofocus correto, contrast AAA.
5. **Spec ↔ código alinhados** — pill onde DESIGN.md diz pill.
6. **Ponytail** — 1 arquivo, 1 tarefa, diff mínimo.

---

## 4. Fases

### Fase 1 — Aluno Home (P1, bloqueia tudo)

**Por quê primeiro**: priorizado pelo usuário. Tela que ele abre primeiro.

| ID  | Arquivo                                                | Mudança                                                                                                                        | Verify                                                 | Risk   |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------ |
| T01 | `src/app/aluno/dashboard/dashboard-client.tsx:224`     | Remover KPI hardcoded (Meta Semanal 80%, Power Index 752). Substituir por `treinosConcluidos/semana` real; esconder card se 0. | `npm run typecheck` + screenshot 375px → "Sem treinos" | low    |
| T02 | `src/app/aluno/dashboard/dashboard-client.tsx:266`     | `flex justify-around gap-2` → `flex justify-center gap-2` nos 3 achievement badges.                                            | Visual: badges com mesmo gutter                        | low    |
| T03 | `src/app/aluno/dashboard/dashboard-client.tsx` (topo)  | Empty state quando `treinos.length === 0`: card glass + "Bem-vindo, [nome]" + CTA "Falar com instrutor".                       | Login aluno novo → empty state                         | low    |
| T04 | `src/app/aluno/dashboard/dashboard-client.tsx`         | Hierarquia: próximo treino é o primeiro card visível (não KPIs). Move KPIs para abaixo.                                        | Mobile viewport → próximo treino acima da dobra        | medium |
| T05 | `src/app/aluno/dashboard/dashboard-client.tsx` (timer) | `aria-live="polite"` no timer + `role="timer"` + label humano. Sem pulse em `prefers-reduced-motion`.                          | axe DevTools 0 violations em timer                     | medium |

### Fase 2 — Card-treino + meus-treinos (P1/P2)

**Por quê**: tela mais usada depois do home.

| ID  | Arquivo                                                  | Mudança                                                                                            | Verify                             | Risk   |
| --- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------- | ------ |
| T06 | `src/components/dashboard/aluno/card-treino.tsx:65`      | `<CardTitle>` (renderiza `<div>`) → `<h3>` semântico com mesma classe.                             | axe: heading outline inclui título | low    |
| T07 | `src/components/dashboard/aluno/card-treino.tsx`         | Press feedback: `active:scale-[0.98] transition-transform` + `focus-visible:ring-2 ring-primary`.  | Tab no card → ring visível         | low    |
| T08 | `src/app/aluno/meus-treinos/meus-treinos-client.tsx:183` | Renderizar 2-3 nomes de exercícios truncados abaixo do count.                                      | Card mostra "Supino, Agachamento…" | low    |
| T09 | `src/app/aluno/meus-treinos/meus-treinos-client.tsx`     | Empty state quando 0 treinos: ícone lucide (Dumbbell) + "Você ainda não tem treinos" + CTA.        | Login aluno novo → empty state     | low    |
| T10 | `src/app/aluno/meus-treinos/meus-treinos-client.tsx`     | Loading skeleton (Tailwind `animate-pulse`) no lugar de spinner genérico. Respeita reduced-motion. | Refresh → vê skeleton 200ms        | medium |

### Fase 3 — Login first impression (P1)

**Por quê**: tela que define "esse app é bom?" em 5s.

| ID  | Arquivo                            | Mudança                                                                                                                          | Verify                                             | Risk |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ---- |
| T11 | `src/app/aluno/login/page.tsx:134` | Email: `autoComplete="email" type="email" inputMode="email" autoCapitalize="none"`. Password: `autoComplete="current-password"`. | 1Password preenche; mobile mostra teclado @        | low  |
| T12 | `src/app/aluno/login/page.tsx`     | Erro inline com `role="alert"` + `aria-describedby` no input. Sem toast que some.                                                | Erro de credencial → foco no input, erro anunciado | low  |
| T13 | `src/app/aluno/login/page.tsx`     | Motion de entrada: fade+slide sutil no card (200ms ease-out). `prefers-reduced-motion` → fade only.                              | Reduced-motion ON → sem slide                      | low  |

### Fase 4 — A11y foundation (P1)

**Por quê**: conserta bugs que afetam tudo.

| ID  | Arquivo                                      | Mudança                                                                                      | Verify                       | Risk   |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------- | ------ |
| T14 | `src/components/ui/circular-progress.tsx:61` | Add `viewBox="0 0 100 100"` + `aria-hidden="true"`. Valor numérico em texto separado.        | axe 0 violations             | low    |
| T15 | `src/app/aluno/aluno-header.tsx:89`          | Habilitar item "Perfil" do dropdown + criar rota `/aluno/perfil` (pode ser stub "Em breve"). | Dropdown → "Perfil" navega   | medium |
| T16 | `src/app/aluno/aluno-header.tsx`             | Avatar do menu: `aria-label="Menu do aluno"` (sem nome visível).                             | NVDA anuncia "Menu do aluno" | low    |

### Fase 5 — Design drift (P2)

**Por quê**: alinha spec ↔ código.

| ID  | Arquivo                          | Mudança                                                                                          | Verify                                | Risk   |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------- | ------ |
| T17 | `src/components/ui/button.tsx:8` | `rounded-md` → `rounded-full` no default variant (DESIGN.md: "Pill-shaped for primary actions"). | `npm run build` OK; botões viram pill | low    |
| T18 | `src/app/globals.css`            | Adicionar `.text-gradient-cyan` (referenciada em dashboard-client:65 + landing page).            | gradient visível                      | low    |
| T19 | `src/app/globals.css`            | Validar `--color-muted-foreground` ≥ 4.5:1 (AAA large). Ajustar lightness se <.                  | Lighthouse a11y ≥ 95                  | medium |
| T20 | `src/components/bottom-nav.tsx`  | Active state: além do `border-t-2`, adicionar `text-primary` (só border hoje).                   | Visual: tab ativo texto cyan + border | low    |

### Fase 6 — Brand polish (P3)

**Por quê**: consistência de identidade.

| ID  | Arquivo              | Mudança                                                                                                     | Verify                              | Risk |
| --- | -------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---- |
| T21 | `src/app/page.tsx`   | "Academia Five Star" → "Five Star Gym" (consistente com brand). Tagline idem.                               | Texto da landing bate com DESIGN.md | low  |
| T22 | `src/app/layout.tsx` | Validar `font-display: swap` (FOIT prevention) em Inter+Outfit.                                             | Lighthouse Best Practices 100       | low  |
| T23 | `DESIGN.md`          | Documentar decisão: **Inter (body) + Outfit (headline)** — não SF Pro. Atualizar spec para refletir código. | Markdown diff                       | low  |

### Fase 7 — Motion + reduced-motion pass (P2)

**Por quê**: polish final + acessibilidade.

| ID  | Arquivo                                | Mudança                                                                                                                                                 | Verify                                     | Risk |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| T24 | `src/app/globals.css`                  | `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }` | DevTools reduced-motion ON → zero animação | low  |
| T25 | `src/components/ui/button.tsx` + cards | `hover:scale-[1.02]` → `hover:brightness-110` (mais sutil, sem motion sickness).                                                                        | DevTools mobile test                       | low  |

---

## 5. KPIs (medir sucesso)

| KPI                                        | Meta        | Como medir                                      |
| ------------------------------------------ | ----------- | ----------------------------------------------- |
| Lighthouse a11y score                      | ≥ 95        | Chrome DevTools / Lighthouse CI                 |
| axe DevTools violations (Aluno surfaces)   | 0           | axe-core CLI no CI                              |
| Empty state coverage (treinos, conquistas) | 100%        | Visual review: cada lista tem UI para 0         |
| KPI hardcoded em produção                  | 0           | `grep -E "['\"\`][0-9]+%['\"\`]" src/app/aluno` |
| Pill buttons em CTAs primárias             | 100%        | Visual review                                   |
| `text-gradient-cyan` aplicado              | sim         | grep + visual                                   |
| Mobile first paint                         | não regride | Lighthouse perf                                 |

---

## 6. Ordem de execução

1. **T01-T05** (Fase 1) — user abre app, vê algo bom.
2. **T11-T13** (Fase 3) — user consegue logar com qualidade.
3. **T14-T16** (Fase 4) — a11y base sólida.
4. **T06-T10** (Fase 2) — navegação interna polida.
5. **T17-T20** (Fase 5) — spec/code alinhados.
6. **T21-T25** (Fases 6+7) — polish final.

**Total: 25 tasks · 12 arquivos · 0 deps novos.**

---

## 7. Out of scope (skipped, adicionar quando X)

- Ilustrações SVG custom para empty states — lucide cobre. Designer quando virar feature de marca.
- i18n de strings hardcoded — quando houver user en/es.
- Animações de entrada por rota (Framer Motion) — diff só se user pedir.
- Skeleton library dedicada — `animate-pulse` nativo cobre. Dep quando shapes ficarem complexos.

---

## 8. Workflow sugerido (execução)

### Abordagem: feature branch + PRs por fase

#### 8.1. Setup (1 comando)

```bash
git checkout -b feat/008-aluno-ui-premium
```

#### 8.2. Execução fase-a-fase (recomendado)

Para cada fase:

```bash
# 1. Criar sub-branch
git checkout -b feat/008-fase-N-<slug>

# 2. Implementar tasks (uma por commit, conventional commits)
git commit -m "feat(aluno/dashboard): T01 remove fake KPIs"

# 3. Gates (todos devem passar)
npm run lint && npm run typecheck && npm test

# 4. PR para main (ou merge em feat/008-aluno-ui-premium)
gh pr create --base main --title "feat(aluno): fase N — <título>"

# 5. Aguardar CI + review + merge

# 6. Voltar para feat/008-aluno-ui-premium e rebase
git checkout feat/008-aluno-ui-premium
git rebase main
```

#### 8.3. Validação final

Após merge de todas as fases:

```bash
# 1. E2E suite (deve continuar passando)
npm run e2e

# 2. Lighthouse mobile
npx lighthouse https://staging.example.com/aluno/dashboard --view

# 3. axe-core scan
npx axe https://staging.example.com/aluno/dashboard

# 4. Tag da iteração
git tag v0.9.1-premium-ui
```

---

## 9. Riscos e mitigação

| Risco                                    | Probabilidade | Impacto | Mitigação                                                  |
| ---------------------------------------- | ------------- | ------- | ---------------------------------------------------------- |
| Regressão em E2E tests                   | média         | médio   | Rodar `npm run e2e` após cada fase                         |
| Quebra de design system (tokens globais) | baixa         | alto    | Fases 5+6 em branch isolado, validar visual antes de merge |
| Performance (motion excessivo)           | baixa         | médio   | T24 força reduced-motion global como rede de segurança     |
| Inconsistência entre fases               | média         | baixo   | PRs pequenos por fase facilitam review                     |

---

## 10. Acceptance criteria

Esta PRD está DONE quando:

- [ ] Todas as 25 tasks mergeadas em main
- [ ] Lighthouse a11y ≥ 95 nas 4 rotas Aluno
- [ ] axe DevTools 0 violations
- [ ] Nenhum KPI hardcoded permanece em `src/app/aluno/`
- [ ] E2E suite 100% verde
- [ ] Screenshots mobile (375px) revisados: home, login, treinos, empty states
- [ ] `docs/CURRENT-STATE.md` atualizado refletindo a iteração

---

## 11. Referências

- Audit workflow: `wf_eaffd9ce-9c6` (synthesis falhou; plano derivado inline)
- DESIGN.md: `docs/...` (spec a ser atualizado em T23)
- Memory: `project_mobile_first_prds.md`, `project_prd3_plan_pending.md`
