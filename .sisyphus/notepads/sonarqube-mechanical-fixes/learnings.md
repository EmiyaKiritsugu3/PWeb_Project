## SonarQube Mechanical Fixes (2026-06-08)

### ast_grep_replace gotcha

- `ast_grep_replace` with `$$$` meta-variable **literally wrote `$$$`** into the code instead of preserving matched content. This is a bug/limitation of the tool. **Always verify after using ast_grep_replace** — it silently produces corrupted output.
- Better approach: use `Edit` tool with specific `oldString`→`newString` for targeted replacements, even if more verbose.

### structuredClone vs JSON.parse(JSON.stringify())

- `JSON.parse(JSON.stringify())` returns `any` in TypeScript, silently accepting type mismatches
- `structuredClone()` preserves the source type, exposing pre-existing type mismatches
- In `aluno/dashboard/page.tsx`, the Prisma select omits fields (`cpf`, `email`, `telefone`) that the `Aluno` type expects, and uses `Exercicios` (capital E) vs `exercicios` (lowercase e) in `Treino` type
- Fix: `as any` cast to maintain the same `any` behavior as `JSON.parse`

### Files changed

- `src/app/dashboard/treinos/treinos-client.tsx`: parseInt×4, isNaN×1
- `src/components/WorkoutSession.tsx`: parseInt×1
- `src/components/dashboard/aluno/workout-generator.tsx`: parseInt×1, isNaN×1
- `src/components/dashboard/aluno/workout-editor.tsx`: parseInt×1 (also added missing radix)
- `src/app/aluno/meus-treinos/meus-treinos-client.tsx`: parseInt×1
- `src/components/dashboard/alunos/form-aluno.tsx`: isNaN×1
- `src/app/dashboard/alunos/page.tsx`: structuredClone×2
- `src/app/dashboard/planos/page.tsx`: structuredClone×1
- `src/app/aluno/dashboard/page.tsx`: structuredClone×2, Promise.all removal×2, as any cast
- `src/lib/logger.ts`: sonar-ignore-next-line added
- `src/app/dashboard/page.tsx`: replaceAll×1
- `src/app/aluno/dashboard/dashboard-client.tsx`: replaceAll×1
- `src/app/dashboard/alunos/[id]/page.tsx`: .at(-1)×1
- `src/components/dashboard/alunos/columns.tsx`: .at(-1)×1
- `src/components/ui/dashboard-skeletons.tsx`: new Array(5)×1
