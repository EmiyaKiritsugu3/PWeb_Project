# Plan: 10 UI Fixes — Aluno Dashboard

**Date:** 2026-07-07
**Branch:** `feat/aluno-ui-10-fixes`
**Source:** Audit of PRD-UI-Aluno-Aprimoramento.md (25 tasks → 10 valid)
**Constraint:** ponytail — diff mínimo, zero deps novas

---

## Phase 0 — Quick 1-liners

| ID | File | Change |
|---|---|---|
| Q01 | `aluno-header.tsx:75` | aria-label typo fix |
| Q02 | `dashboard-client.tsx:241` | `justify-around` → `justify-center` |
| Q03 | `page.tsx:28` | brand name consistency |

## Phase 1a — A11y

| ID | File | Change |
|---|---|---|
| A01 | `card.tsx:30` | CardTitle `<div>` → `<h3>` |
| A02 | `login/page.tsx` | autocomplete + type attributes |
| A03 | `login/page.tsx` | auth errors: toast → inline `role="alert"` |
| A04 | `circular-progress.tsx:61` | SVG `viewBox` + `aria-hidden` |

## Phase 1b — UX

| ID | File | Change |
|---|---|---|
| U01 | `card-treino.tsx` | press feedback on cards |
| U02 | `meus-treinos-client.tsx` | exercise names truncated below count |
| U03 | `aluno-header.tsx:89` | enable Perfil dropdown + stub route |

## Phase 2 — Polish

| ID | File | Change |
|---|---|---|
| P01 | `button.tsx:8` | `rounded-md` → `rounded-full` |
| P02 | `DESIGN.md` | document Inter+Outfit split |

---

## Gates
```
npm run lint && npm run typecheck && npm test
```
