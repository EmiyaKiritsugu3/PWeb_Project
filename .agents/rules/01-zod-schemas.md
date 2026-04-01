---
description: Strategy for handling generic Zod validations mapped to Prisma schema models.
---

# Rule 01: Zod Schemas (BaseSchema vs EntitySchema)

To ensure Type Safety during compilation (Vercel Build Phase), we strictly separate our Zod logic.

**CRITICAL GUIDELINE:**
Database entities inherently have an identity (e.g., `id`, `createdAt`, `updatedAt`). Input forms for creating records DO NOT have these fields initially.

Therefore:
- Use `*BaseSchema` for data ingestion (e.g., registering a new user, submitting a new form). Example:
  ```typescript
  export const AlunoBaseSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
  });
  ```
- Use `*EntitySchema` for database modeling and returning data from the ORM. This is an intersection or extension of the BaseSchema.
  ```typescript
  export const AlunoEntitySchema = AlunoBaseSchema.extend({
    id: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
  });
  ```

Whenever constructing features involving CRUD, ensure you utilize the `BaseSchema` inside the client form actions and validation, while keeping `EntitySchema` for resolving full model data. Failure to do so leads to missing `id` TypeScript errors and failed builds.
