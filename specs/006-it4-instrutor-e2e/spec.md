# Specification: It4 — INSTRUTOR Workflow E2E Coverage

**Version**: 1.0.0 | **Date**: 2026-04-19 | **Branch**: `feat/006-it4-instrutor-e2e`

## Context

The INSTRUTOR role exists in production code and has full server-side support
(create treino with `instrutorId`, aluno sees "Treinos do Personal" badge in
`meus-treinos`). However, it has zero E2E test coverage. This iteration adds
the missing test — no new features are implemented.

## User Stories

### US01 — INSTRUTOR assigns workout to student [P1]

**As** an INSTRUTOR,  
**I want to** log in to `/dashboard`, navigate to `/dashboard/treinos`, and
assign a workout to a seeded ALUNO,  
**So that** the ALUNO sees the workout in `/aluno/meus-treinos` under
"Treinos do Personal" with the "Do Personal" badge.

**Acceptance Criteria:**

- INSTRUTOR can log in and access `/dashboard/treinos`
- INSTRUTOR can create a treino assigned to the seeded ALUNO
- The created treino appears in ALUNO's `meus-treinos` with "Do Personal" badge
- E2E test file: `tests/e2e/specs/instrutor-workflow.spec.ts`
- `tests/e2e/CRITICAL-PATHS.md` updated: 17 → 18 covered scenarios
- All 17 existing E2E scenarios continue to pass

## Out of Scope

- New UI pages or portals for INSTRUTOR
- Role-specific nav or dashboard
- Financial write path (separate iteration)
- Payment status updates

## Seed Data (already exists in `prisma/seed-e2e.ts`)

| Role      | UUID                                 | Email                   |
| --------- | ------------------------------------ | ----------------------- |
| INSTRUTOR | 00000000-0000-0000-0000-000000000003 | instrutor@fivestar.test |
| ALUNO     | 00000000-0000-0000-0000-000000000004 | aluno@fivestar.test     |
