# AGENTS.md — Five Star Academy (PWeb_Project)

Agent instructions for AI assistants working on this codebase.

## Development Workflow

Every piece of work follows this sequence — no exceptions:

```
PDR → Design Spec → Implementation → Tests → ADR → Report → CHANGELOG
```

## Quality Gates

Before marking any task done, all of the following must pass:

```bash
npm run typecheck      # Zero TypeScript errors
npm run lint           # Zero ESLint errors
npm run format:check   # No Prettier violations
npm run test:coverage  # All tests pass
```

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

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(aluno): add streak reset logic
fix(auth): handle session expiry
chore(deps): upgrade prisma
```

Valid types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`

## Architecture Constraints

- **Auth:** Supabase Auth via SSR — never use client-side auth for protected routes
- **Database:** All DB access via Prisma Server Actions — never expose Prisma to the client
- **AI:** Google Genkit flows only — do not call Gemini API directly
- **Forms:** React Hook Form + Zod — never use uncontrolled forms
- **Styling:** Tailwind CSS + Shadcn/UI — do not add new CSS frameworks

## Database Changes

Any schema change requires:

1. `npx prisma migrate dev --name <description>`
2. Updated seed data in `prisma/seed.ts` if needed

## Environment Variables

Never commit secrets. All new env vars must be added to `.env.example` with a placeholder value.
