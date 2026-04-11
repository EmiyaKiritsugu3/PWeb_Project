# ADR-003: Infrastructure & Observability Hardening

## Status
Accepted

## Context
As part of the modernization for Next.js 15, Sentry 10, and Prisma 7, several structural challenges were identified:
1. **PII Vulnerability**: Server-side error logs and client-side session replays were potentially capturing sensitive student data (CPF, health hashes).
2. **Type Safety Decay**: The move to Prisma 7 with the `pg` driver adapter introduced a version conflict in `@types/pg`, leading to the widespread use of `as any` in the database layer.
3. **Connection Governance**: Migrating to a driver adapter pattern (required for some Next.js environments) necessitated more explicit connection pool management to prevent exhaustion in serverless or PgBouncer environments.

## Decisions

### 1. Recursive PII Scrubbing (Sentry)
Instead of relying on basic header scrubbing, we implemented a dedicated recursive sanitization engine in `sentry.server.config.ts`. This engine traverses all event breadcrumbs and extra data, replacing values for a defined list of sensitive keys (`cpf`, `password`, `biometriaHash`, etc.) with `[SCRUBBED]`.

### 2. Dependency Pinning via Overrides
To resolve the `ClientBase` return type mismatch between `@types/pg@v8.18+` and `@prisma/adapter-pg`, we decided to:
- Pin `@types/pg` to version `8.11.11` in both `devDependencies` and the `overrides` field of `package.json`.
- This ensures that all internal and external consumers of the `pg` types are aligned with the Prisma runtime requirements, allowing for the complete removal of unsafe type assertions in `src/lib/prisma.ts`.

### 3. Connection Resilience & Heartbeat
We enhanced the `PrismaClient` initialization with:
- **Pool Governance**: Explicit `idleTimeout` and `connectionTimeout` to handle transient network issues.
- **Boot Heartbeat**: Integrated a `SELECT 1` check into the Next.js `instrumentation.ts` with a 5-second `Promise.race` timeout to verify database health during application startup, preventing "zombie" boot states.

### 4. Genkit AI Flow Contract Hardening
To prevent technical debt in AI integration, we implemented:
- **Strict Schema Enforcement**: All Genkit flows now utilize Zod schemas for input, output, and streaming, eliminating `as any` casts in the frontend.
- **Hallucination Detection**: Added Sentry monitoring to log unrecognized exercise suggestions, ensuring that AI-generated plans remain within physiological and logistical constraints defined in `src/lib/constants.ts`.

### 5. Tailwind 4 & OKLCH Unified Theme
Migrated the entire design system to Tailwind 4 (Oxide engine) to leverage:
- **Native Custom Properties**: Replaced legacy HSL `:root` variables with a unified `@theme` block.
- **OKLCH Color Space**: Adopted OKLCH tokens for consistent vibrancy and accessibility across the "Premium Dark" interface.

## Consequences

### Positive
- **Privacy Compliance**: Strict adherence to data protection standards for student information.
- **Developer Experience**: Restored full IDE intellisense and type-checking in the database and AI layers.
- **Aesthetic Excellence**: Unified, vibrant UI with optimized build performance via Tailwind 4.
- **Operational Visibility**: Sentry alerts for both infrastructure failures and AI "hallucinations".

### Negative
- **Maintenance**: We must monitor Prisma and Genkit SDK updates to revert specific type overrides or casts once upstream packages reach full alignment with Next.js 15.

---

## Visual Documentation

### 1. Premium Dark Interface (Tailwind 4)
The new design system ensures a high-fidelity, high-contrast experience using OKLCH color tokens.

![Student Dashboard - Premium Dark](file:///home/emiyakiritsugu/.gemini/antigravity/brain/f9bac6cb-9ccd-44da-af5f-669178bd052a/student_dashboard_view_1775903233752.png)

### 2. AI Workout Generator (Genkit)
Strictly typed integration between the AI service and the student portal.

![AI Workout Generator UI](file:///home/emiyakiritsugu/.gemini/antigravity/brain/f9bac6cb-9ccd-44da-af5f-669178bd052a/workout_generator_final_result_1775903924170.png)
