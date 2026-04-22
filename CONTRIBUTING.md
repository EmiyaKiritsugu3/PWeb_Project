# Contributing to PWeb_Project (Five Star Academy)

## Development Workflow

Every piece of work follows this sequence — no exceptions:

```
PDR → Design Spec → Implementation → Tests → ADR → Report → CHANGELOG
```

| Step           | Document                                   | When                                 |
| -------------- | ------------------------------------------ | ------------------------------------ |
| PDR            | `docs/decisions/PDR-XXX-*.md`              | Before any code                      |
| Design Spec    | `docs/architecture/` or `docs/tech_stack/` | Before implementation                |
| Implementation | `src/`                                     | After spec is approved               |
| Tests          | `src/**/*.test.{ts,tsx}`                   | Red-green-refactor cycle             |
| ADR            | `docs/decisions/ADR-XXX-*.md`              | If architectural decisions were made |
| CHANGELOG      | `CHANGELOG.md`                             | Every PR                             |

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<scope>): TXXX <description>

feat(aluno): T041 add streak reset logic on missed workout day
fix(auth): T052 handle session expiry during workout execution
docs(adr): T063 record decision on gamification XP formula
chore(deps): T011 upgrade prisma to v7.5.0
```

**Valid types:** `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `revert`

Commit messages are validated automatically via `commitlint` on every commit.

## Quality Gates

Before opening a PR, all of these must pass locally:

```bash
npm run typecheck      # Zero TypeScript errors
npm run lint           # Zero ESLint errors
npm run format:check   # No Prettier violations
npm run test:coverage  # All tests pass + coverage thresholds met
```

These are also enforced in CI — PRs that fail any gate will not be merged.

## Pre-commit Hooks

Husky runs automatically on `git commit`:

- **pre-commit:** ESLint + Prettier on staged files (`lint-staged`)
- **commit-msg:** commitlint validates commit message format

## Database Changes

Any PR that modifies `prisma/schema.prisma` **must** include:

1. A migration file: `npx prisma migrate dev --name <description>`
2. Updated seed data if applicable: `prisma/seed.ts`
3. Updated type documentation if new models are added

## Environment Variables

Never commit secrets. All environment variables must be:

1. Added to `.env.example` with a placeholder value
2. Documented in `docs/tech_stack/` if they affect architecture
3. Added to CI secrets if required by the pipeline

## Tech Stack Quick Reference

| Layer     | Technology                     |
| --------- | ------------------------------ |
| Framework | Next.js 15 (App Router)        |
| Auth      | Supabase Auth (SSR)            |
| Database  | PostgreSQL via Prisma ORM      |
| UI        | Shadcn/UI + Tailwind CSS v4    |
| AI        | Google Genkit + Gemini         |
| Testing   | Vitest + React Testing Library |
