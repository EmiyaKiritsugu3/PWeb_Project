# AGENTS.md — Five Star Academy (PWeb_Project)

Agent instructions for AI assistants working on this codebase.

> **Constitution**: `.specify/memory/constitution.md` is the authoritative source for
> principles, tech standards, quality gates, and commit discipline. This file contains
> only project-map and operational shortcuts not found there.

## Development Workflow

Every piece of work follows this sequence — no exceptions:

```
PDR → Design Spec → Implementation → Tests → ADR → Report → CHANGELOG
```

## Quality Gates

> Defined in constitution §Development Workflow. Run all 4 before marking done:
> `typecheck` · `lint` · `format:check` · `test`

## Project Map

| Path                  | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `src/app/`            | Next.js App Router pages and layouts     |
| `src/components/`     | React components (UI, dashboard, aluno)  |
| `src/lib/`            | Server actions, Prisma client, utilities |
| `src/services/`       | Business logic layer                     |
| `src/hooks/`          | Custom React hooks                       |
| `src/ai/`             | Google Genkit AI flows                   |
| `src/utils/supabase/` | Supabase SSR client helpers              |
| `prisma/`             | Prisma schema, migrations, seed          |
| `docs/`               | Documentation (ADRs, specs, stories)     |

## Commit Conventions

> Governed by constitution Principle V. Format: `feat(scope): description`
> Valid types: `feat` `fix` `docs` `refactor` `test` `chore` `perf` `ci` `revert`

## Architecture Constraints

> Full stack lock in constitution §Technology Standards. Key enforcement rules:
>
> - Auth via SSR only — no client-side auth on protected routes
> - DB access via Prisma Server Actions only — Prisma must not reach the client
> - AI calls isolated in `src/ai/` with try/catch — no direct Gemini calls from RSCs

## Database Changes

Any schema change requires:

1. `npx prisma migrate dev --name <description>`
2. Updated seed data in `prisma/seed.ts` if needed

## Environment Variables

Never commit secrets. All new env vars must be added to `.env.example` with a placeholder value.
