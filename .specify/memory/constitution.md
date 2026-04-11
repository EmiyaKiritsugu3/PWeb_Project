# Five Star Gym Constitution

## Core Principles

### I. Dual-Portal Architecture

The system MUST maintain two fully separated user experiences: the Admin Dashboard
(`/dashboard`) and the Student Portal (`/aluno`). Each portal has its own routing
tree, layout, and access control. Cross-portal code sharing is permitted only through
shared component libraries and server-side utilities — never through shared pages or
mixed layouts.

**Rationale**: Security boundaries and UX coherence require that an admin session
can never bleed into a student session and vice versa. Mixing the two introduces
both auth vulnerabilities and design inconsistencies.

### II. Type Safety at Every Boundary

TypeScript MUST be used for all source files (`*.ts`, `*.tsx`). All data entering or
leaving the system — API responses, form inputs, database results, AI outputs —
MUST be validated with Zod schemas at the boundary. `any` types are forbidden unless
accompanied by an inline suppression comment explaining why.

**Rationale**: The project combines Prisma ORM, Supabase Auth, external AI models,
and user-submitted forms. Each integration point is a potential type mismatch. Zod
enforces runtime safety that TypeScript alone cannot provide.

### III. Test-Gated Business Logic

All business logic in `src/lib/` and `src/services/` MUST have unit tests written
with Vitest before implementation is considered complete. E2E tests with Playwright
are required for critical user journeys (student workout completion, admin student
enrollment). Tests MUST fail before implementation begins (Red-Green-Refactor).

**Rationale**: Gamification state (XP, levels, streaks) and financial status are
domain rules that, if broken silently, corrupt user data. Unit tests provide a
safety net that manual QA cannot reliably replace.

### IV. AI as Enhancement, Not Foundation

AI-powered features (Genkit + Gemini) MUST be implemented as optional enhancements
behind clear fallback paths. If the AI service is unavailable, the core feature
(workout creation, feedback display) MUST still function with a degraded but usable
default. AI calls MUST be isolated in `src/ai/` and MUST NOT be called directly from
React Server Components or route handlers without a try/catch boundary.

**Rationale**: External AI APIs have SLA limitations and cost implications. Tightly
coupling the application to an AI call path risks total feature failure on transient
errors and unpredictable billing spikes.

### V. Commit Discipline and Conventional Commits

All commits MUST follow the Conventional Commits specification enforced by
`@commitlint/config-conventional` via Husky pre-commit hooks. `lint-staged` MUST
run ESLint and Prettier on all staged `.ts`/`.tsx` files before a commit is
accepted. Force-pushing to `main` is forbidden. Feature work MUST happen on
dedicated branches following the pattern `<type>/<issue-number>-<short-description>`
(e.g. `feat/004-elite-workflow`, `fix/012-login-redirect`). Valid types mirror
Conventional Commits: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `hotfix`, `perf`, `ci`.

**Rationale**: An academic project reviewed by external evaluators requires a clean,
traceable history. Conventional commits enable automated changelog generation
(CHANGELOG.md) and make code review efficient.

## Technology Standards

The following stack is locked for this project. Deviations require a constitution
amendment:

- **Runtime**: Node.js 18.x or higher
- **Framework**: Next.js 15+ (App Router only — Pages Router is forbidden)
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 4 + Shadcn/UI components + Framer Motion for animation
- **Database**: PostgreSQL via Prisma ORM; migrations tracked in `prisma/`
- **Auth**: Supabase Auth with SSR (`@supabase/ssr`) — custom auth solutions
  are forbidden
- **Validation**: Zod for schemas; React Hook Form for form state
- **AI**: Google Genkit + Gemini models via `@genkit-ai/google-genai` — other AI
  SDKs require explicit approval
- **Testing**: Vitest (unit/integration), Playwright (E2E), Testing Library (React)
- **Package manager**: npm — yarn/pnpm require amendment

## Development Workflow

1. **Branch strategy**: `main` is always deployable. All work branches from `main`
   and merges back via Pull Request. Hotfixes follow the same process.
2. **Quality gates before merge**:
   - `npm run typecheck` — zero TypeScript errors
   - `npm run lint` — zero ESLint errors
   - `npm run test` — all tests passing
   - `npm run format:check` — zero formatting violations
3. **Seed data**: `npm run prisma:seed` MUST produce a deterministic, idempotent
   dataset for local development. Seeds are part of the codebase and reviewed in PRs.
4. **Environment variables**: All required variables MUST be documented in `.env.example`
   at the repo root. Secrets MUST NOT be committed.
5. **Observability**: Server-side errors MUST be logged with structured context
   (route, user ID if available, error message).

## Governance

This constitution supersedes all other practices, informal agreements, and
per-feature decisions. When a PR conflicts with a principle here, the constitution
wins unless an amendment is ratified first.

**Amendment procedure**:

1. Propose the change in a dedicated PR with a clear rationale.
2. The PR description MUST include which principle/section is affected, the old
   rule, the new rule, and a migration plan if existing code needs updating.
3. Version bump follows semantic versioning:
   - **MAJOR**: Principle removal or backward-incompatible redefinition.
   - **MINOR**: New principle or materially expanded guidance added.
   - **PATCH**: Wording clarification, typo fix, non-semantic refinement.
4. The amended constitution file MUST be committed as a standalone commit with
   message: `docs: amend constitution to vX.Y.Z (<summary>)`.

**Compliance review**: All PRs MUST include a Constitution Check section in the
plan confirming no principles are violated. The plan template enforces this gate.

For runtime development guidance see the agent file at
`.specify/templates/agent-file-template.md`.

**Version**: 1.0.2 | **Ratified**: 2026-03-11 | **Last Amended**: 2026-04-10
