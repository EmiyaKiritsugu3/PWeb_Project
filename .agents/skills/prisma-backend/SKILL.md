# Backend & Prisma Configuration

## Scope
This skill outlines the standard rules for writing Server Actions, API routes, database integrations, and Zod parsers for the Aegis Fitness OS platform.

## 1. Safety and Stability
- Always ensure Server Actions include `'use server';` exactly at the top of the file.
- All incoming payloads must be validated against a pre-established `zod` schema before ANY database interaction occurs to prevent injection.
- Ensure that you utilize robust try-catch blocks to catch and log errors, returning typed `{ success: boolean, data?: any, error?: string }` responses rather than raw objects.

## 2. Prisma Database Integration
- NEVER guess schema fields when querying Prisma. When in doubt, read the `prisma/schema.prisma` file directly or use the MCP Prisma tool to introspect the structure.
- Always use the `prisma` client wrapper (if one is set up) or generate a new Prisma Client instance avoiding memory leaks in development.
- Prioritize batch queries with `.findMany` and optimal `.select` clauses so we do not over-fetch relations or payload data.
- Opt to use `.count` rather than `.findMany().length` for pagination or metric sizing.

## 3. Asynchrony
- Do not mix `.then().catch()` chains with `await`. Use proper `async/await` exclusively in Next.js Server Actions.
- Ensure `revalidatePath` and `revalidateTag` are used to proactively refresh cache keys after an active mutation operation (e.g. creating a new training log). 

## 4. MCP Rule
- Rely on the `Prisma MCP` to write complicated migrations rather than attempting to hand-write SQL. The MCP connection provides absolute confidence in production-grade queries.

## 5. Deep Context Technical Manuals
When architecting complex database migrations or high-performance relations, consult:
▶️ @docs/tech_stack/Prisma ORM Advanced Architecture Deep Dive.md
▶️ @docs/tech_stack/Zod Architecture_ Parse, Don't Validate.md
