# AGENTS.md

**Project:** Aegis Fitness OS (formerly Five Star Academy)
**Framework:** Next.js 15 (App Router), React 19, Tailwind CSS v4
**Backend:** Server Actions, Prisma ORM, PostgreSQL (via Supabase)
**Build/Execution:** `pnpm` MUST be used. Do not use `npm` or `yarn`.

## 1. Prime Directives
- **Atomic Operations:** Ensure commits are atomic and follow the semantic prefix convention (e.g. `feat:`, `fix:`, `docs:`, `ui:`).
- **Stateless Intelligence:** You MUST rely on `.ralph/PRD.md` for current project context before planning, and update `progress.txt` or `friction.log` appropriately. 
- **Wait for Plan Approval:** Do NOT hallucinate architectures. When making major architectural changes or starting a new phase in the PRD, propose a plan using the system and wait for Principal human approval.

## 2. Context Routing
Use the `@filename` (or file link) rules below to load *only* essential context into the cognitive window when instructed for a particular task:

### Design & Frontend
For UI layout, responsive tokens, coloring, and animations, consult:
▶️ @.agents/rules/aegis-design.md
▶️ @.agents/skills/nextjs-ui/SKILL.md

### Backend & Database
For server actions, Zod schemas, error handling, and data hydration, consult:
▶️ @.agents/skills/prisma-backend/SKILL.md

### Core Architecture & Ralph Loop Context
To understand what exists and what is being built right now, ALWAYS review:
▶️ @docs/PRD.md
▶️ @docs/prompt.md

## 3. Strict Prohibitions
- NEVER use generic or vague commit messages.
- Do NOT generate inline CSS when a Tailwind v4 utility exists.
- Do NOT write SQL raw strings where Prisma client methods can explicitly perform the query.

