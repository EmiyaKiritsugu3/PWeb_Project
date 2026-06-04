# Correção de Qualidade de Código — Remanescentes

> **For agentic workers:** Sub-tasks use checkbox (`- [ ]`) syntax. Each step follows: 1) ler arquivo 2) aplicar correção 3) rodar `lsp_diagnostics` 4) rodar `npm run typecheck && npm run lint` 5) commit.

**Goal:** Corrigir code smells além do escopo do SonarQube (0 issues restantes via API) — type safety, error handling consistente, DRY violations, e limpeza de código.

**Context:** PR #117 já resolveu 209 issues SonarQube (3 BLOCKER, 5 CRITICAL, 37 MAJOR, 163 MINOR, 1 INFO) + 12 Security Hotspots. Este plano cobre padrões que SonarQube atualmente não detecta ou que foram deixados propositalmente por serem INFO/MINOR.

**Branch:** `main` (PR #117 merged).

**Tech Stack:** TypeScript 5 strict, Next.js 15, Prisma, shadcn/ui

**Architecture:** Correções independentes por arquivo. Tasks organizadas por tier de impacto. Cada task é autônoma — pode ser executada em paralelo via subagent-driven development.

---

## Fase 1 — Error Handling & Type Safety (Alto Impacto)

### Task 1.1: Criar utilitário `getErrorMessage`

**Files:**

- Create: `src/lib/error.ts`

**Context:** Padrão `(error as Error).message` aparece 7+ vezes em 4 arquivos. Sem `instanceof Error` check, se algo que não é `Error` for lançado, o cast retorna `undefined`.

- [ ] **Step 1: Criar `src/lib/error.ts`**

```ts
/**
 * Safely extracts message from an unknown error value.
 * Returns 'Erro desconhecido' for non-Error throws.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido';
}
```

- [ ] **Step 2: Verificar**

Run: `lsp_diagnostics` on `src/lib/error.ts`, then `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/lib/error.ts
git commit -m "feat: add getErrorMessage utility for safe error extraction"
```

---

### Task 1.2: Aplicar `getErrorMessage` em `treinos.ts`

**Files:**

- Modify: `src/lib/actions/treinos.ts` — lines 239, 276

**Context:** 2 ocorrências de `(error as Error).message` sem `instanceof` guard.

- [ ] **Step 1: Substituir casts**

```ts
// ANTES:
return { success: false, error: (error as Error).message };

// DEPOIS:
import { getErrorMessage } from '@/lib/error';
return { success: false, error: getErrorMessage(error) };
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/treinos.ts
git commit -m "refactor: use getErrorMessage in treinos.ts error handlers"
```

---

### Task 1.3: Aplicar `getErrorMessage` em `financeiro.ts`

**Files:**

- Modify: `src/lib/actions/financeiro.ts` — line 21

**Context:** O pior caso — cast direto sem `instanceof` check.

- [ ] **Step 1: Substituir cast**

```ts
// ANTES:
return { success: false, error: (error as Error).message };

// DEPOIS:
return { success: false, error: getErrorMessage(error) };
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/financeiro.ts
git commit -m "refactor: use getErrorMessage in financeiro.ts"
```

---

### Task 1.4: Aplicar `getErrorMessage` em `planos.ts` e `meus-treinos-client.tsx`

**Files:**

- Modify: `src/lib/actions/planos.ts` — lines 38, 63, 74
- Modify: `src/app/aluno/meus-treinos/meus-treinos-client.tsx` — line 205

**Context:** 4 ocorrências adicionais do mesmo padrão.

- [ ] **Step 1: Substituir todos os `(error as Error).message`**

Em `planos.ts`, 3 ocorrências.
Em `meus-treinos-client.tsx`, 1 ocorrência.

```ts
// ANTES:
error: (error as Error).message;

// DEPOIS:
error: getErrorMessage(error);
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/planos.ts src/app/aluno/meus-treinos/meus-treinos-client.tsx
git commit -m "refactor: use getErrorMessage in planos.ts and meus-treinos-client.tsx"
```

---

### Task 1.5: Simplificar cast complexo em `planos.ts`

**Files:**

- Modify: `src/lib/actions/planos.ts` — lines 34, 59

**Context:** Cast `error as Error & { name?: string; flatten?: ... }` aparece IDENTICAMENTE em 2 funções. Violação DRY + tipo complexo.

- [ ] **Step 1: Extrair função auxiliar OU substituir por `getErrorMessage` + Zod handling**

```ts
// ANTES (L34 e L59):
const err = error as Error & { name?: string; flatten?: () => { fieldErrors: unknown } };

// DEPOIS (no início do arquivo ou em error.ts):
interface ZodErrorLike {
  name?: string;
  flatten?: () => { fieldErrors: unknown };
}

function getZodError(error: unknown): { fieldErrors: unknown } | null {
  if (
    error instanceof Error &&
    error.name === 'ZodError' &&
    typeof (error as ZodErrorLike).flatten === 'function'
  ) {
    return (error as ZodErrorLike).flatten!();
  }
  return null;
}
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/planos.ts src/lib/error.ts
git commit -m "refactor: extract ZodError handling, remove complex intersection cast"
```

---

## Fase 2 — Type Assertions (Médio Impacto)

### Task 2.1: Remover `as any` em `alunoService.ts`

**Files:**

- Modify: `src/services/alunoService.ts` — lines 15, 20, 28

**Context:** `result as Aluno` sem validação. Se `prisma.aluno.findUnique` retornar `null`, o cast mascara o tipo.

- [ ] **Step 1: Usar type guards do Prisma**

```ts
// ANTES:
const result = await prisma.aluno.findUnique({ where: { id } });
return result as Aluno;

// DEPOIS:
const result = await prisma.aluno.findUnique({ where: { id } });
if (!result) return null;
return result;
```

Se o retorno da função for `Promise<Aluno | null>`, o Prisma já tipa `result` corretamente.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/services/alunoService.ts
git commit -m "refactor: remove unnecessary type assertions in alunoService.ts"
```

---

### Task 2.2: Remover `as` assertions em `workout-generator-flow.ts`

**Files:**

- Modify: `src/ai/flows/workout-generator-flow.ts` — lines 60, 81

**Context:** `chunk.output as WorkoutGeneratorAIOutput` e `output as WorkoutGeneratorAIOutput` — o Genkit já infere o tipo se tipado corretamente no `defineFlow`.

- [ ] **Step 1: Verificar tipagem do Genkit**

Se `defineFlow<typeof WorkoutGeneratorAIOutput>` está definida, o `output` já é do tipo correto.

```ts
// ANTES:
const chunk = { output: result as WorkoutGeneratorAIOutput };

// DEPOIS: remover cast, confiar na inferência do Genkit
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/ai/flows/workout-generator-flow.ts
git commit -m "refactor: remove redundant type assertions in workout-generator-flow.ts"
```

---

### Task 2.3: Remover `as` assertions em `treinos-client.tsx`

**Files:**

- Modify: `src/app/dashboard/treinos/treinos-client.tsx` — lines 216, 218, 404, 431

**Context:** `as number`, `as Record<string, unknown>`, `as Exercicio[]`, `as WorkoutGeneratorAIOutput` — 4 casts que podem ser substituídos por type guards ou tipagem adequada.

- [ ] **Step 1: Substituir cada cast**

```tsx
// ANTES (L216):
value as number;

// DEPOIS:
Number(value)(
  // ANTES (L218):
  exercicio as Record<string, unknown>
)[field];

// DEPOIS: tipar exercicio corretamente na fonte
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/treinos/treinos-client.tsx
git commit -m "refactor: remove unsafe type assertions in treinos-client.tsx"
```

---

### Task 2.4: Remover `as` redundante em `columns.tsx`

**Files:**

- Modify: `src/components/dashboard/alunos/columns.tsx` — lines 124, 144, 158

**Context:** `row.getValue(...) as string` e `as Aluno['statusMatricula']` — `getValue` já infere tipo do schema da coluna.

- [ ] **Step 1: Remover casts redundantes**

```tsx
// ANTES:
const status = row.getValue('statusMatricula') as Aluno['statusMatricula'];

// DEPOIS:
const status: Aluno['statusMatricula'] = row.getValue('statusMatricula');
```

Ou confiar na inferência se as colunas estão tipadas com `accessorKey`.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/alunos/columns.tsx
git commit -m "refactor: remove redundant type assertions in columns.tsx"
```

---

### Task 2.5: Remover casts em `logger.ts`

**Files:**

- Modify: `src/lib/logger.ts` — lines 20, 31, 41

**Context:** `context as Record<string, unknown>` e `error as unknown as Record<string, unknown>` — triple cast `as unknown as` é code smell.

- [ ] **Step 1: Simplificar casts**

```ts
// ANTES:
const ctx = context as Record<string, unknown>;

// DEPOIS: se context já é objeto, usar spread ou typeof guard
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/logger.ts
git commit -m "refactor: simplify type assertions in logger.ts"
```

---

### Task 2.6: Remover casts em `i18n-provider.tsx`

**Files:**

- Modify: `src/components/providers/i18n-provider.tsx` — lines 24, 40-41

**Context:** `localStorage.getItem('app-language') as Language` — cast sem validação em runtime. Se o valor no localStorage for inválido, o tipo é enganoso.

- [ ] **Step 1: Adicionar validação**

```tsx
// ANTES:
const savedLang = localStorage.getItem('app-language') as Language;

// DEPOIS:
const raw = localStorage.getItem('app-language');
const savedLang: Language = raw === 'pt-BR' || raw === 'en' ? raw : 'pt-BR';
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/providers/i18n-provider.tsx
git commit -m "refactor: add runtime validation for localStorage language cast"
```

---

### Task 2.7: Remover casts em `treinos/page.tsx`

**Files:**

- Modify: `src/app/dashboard/treinos/page.tsx` — line 23

**Context:** `a.statusMatricula as 'ATIVA' | 'INADIMPLENTE' | 'INATIVA'` — cast desnecessário se o schema do Prisma já infere o tipo.

- [ ] **Step 1: Remover cast**

```tsx
// ANTES:
const status = a.statusMatricula as 'ATIVA' | 'INADIMPLENTE' | 'INATIVA';

// DEPOIS: confiar na inferência do Prisma
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/treinos/page.tsx
git commit -m "refactor: remove unnecessary cast in treinos page.tsx"
```

---

## Fase 3 — DRY & Limpeza (Médio-Baixo Impacto)

### Task 3.1: Extrair error handler compartilhado para Server Actions

**Files:**

- Modify: `src/lib/actions/treinos.ts` — lines 150-153, 199-202, 362-365
- Modify: `src/lib/actions/alunos.ts` — lines 106-109, 139-142
- Modify: `src/lib/actions/financeiro.ts`
- Modify: `src/lib/actions/planos.ts`
- Modify: `src/lib/error.ts`

**Context:** Toda server action duplica:

```ts
if (error instanceof Error && error.name === 'ZodError') {
  return { success: false, error: 'Dados inválidos' };
}
return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
```

- [ ] **Step 1: Adicionar `handleActionError` em `error.ts`**

```ts
import { getErrorMessage } from './error';

export function handleActionError(error: unknown) {
  if (error instanceof Error && error.name === 'ZodError') {
    return { success: false as const, error: 'Dados inválidos' };
  }
  return { success: false as const, error: getErrorMessage(error) };
}
```

- [ ] **Step 2: Aplicar em cada server action**

```ts
// ANTES:
catch (error) {
  Sentry.captureException(error);
  if (error instanceof Error && error.name === 'ZodError') {
    return { success: false, error: 'Dados inválidos' };
  }
  return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
}

// DEPOIS:
catch (error) {
  Sentry.captureException(error);
  return handleActionError(error);
}
```

Arquivos afetados: `treinos.ts`, `alunos.ts`, `financeiro.ts`, `planos.ts`, `meus-treinos-client.tsx`.

- [ ] **Step 3: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 4: Commit**

```bash
git add src/lib/error.ts src/lib/actions/treinos.ts src/lib/actions/alunos.ts src/lib/actions/financeiro.ts src/lib/actions/planos.ts src/app/aluno/meus-treinos/meus-treinos-client.tsx
git commit -m "refactor: extract shared handleActionError to eliminate DRY violations"
```

---

### Task 3.2: Remover exports não utilizados

**Files:**

- Modify: `src/lib/placeholder-images.ts` — `ImagePlaceholder`, `PlaceHolderImages`
- Modify: `src/services/gamificationService.ts` — `AlunoGamificationData`, `GamificationResult`
- Modify: `src/services/pagamentoService.ts` — `PaymentResult`
- Modify: `src/hooks/use-toast.ts` — `reducer`, `toast`

**Context:** `ts-unused-exports` confirma que esses exports não são consumidos por nenhum outro módulo em `src/`.

- [ ] **Step 1: Verificar se cada export é usado internamente no próprio arquivo**

Se usado apenas internamente (nunca importado externamente), remover `export` keyword.

```ts
// ANTES:
export interface PaymentResult { ... }

// DEPOIS (se não for importado externamente):
interface PaymentResult { ... }
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint` — garantir que nada quebrou

- [ ] **Step 3: Commit**

```bash
git add src/lib/placeholder-images.ts src/services/gamificationService.ts src/services/pagamentoService.ts src/hooks/use-toast.ts
git commit -m "chore: remove unused exports from service files"
```

---

### Task 3.3: Substituir magic numbers por constantes nomeadas

**Files:**

- Modify: `src/app/dashboard/planos/planos-client.tsx` — lines 30-31 (magic `30`)
- Modify: `src/services/gamificationService.ts` — lines 52-53, 67 (`100`, `10`, `86400000`)
- Modify: `src/lib/data.ts` — lines 124-128 (`0.7`, `0.05`)

- [ ] **Step 1: Extrair constantes**

```ts
// planos-client.tsx — ANTES:
const diffDays = Math.round(Math.abs((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))); // 30

// DEPOIS:
const MS_PER_DAY = 1000 * 60 * 60 * 24; // ou importar de constantes
```

```ts
// gamificationService.ts — ANTES:
const baseXp = 100;
const serieXp = 10;
const msPerDay = 86400000;

// DEPOIS:
const BASE_XP_PER_WORKOUT = 100;
const XP_PER_COMPLETED_SERIE = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000; // mais legível
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/planos/planos-client.tsx src/services/gamificationService.ts src/lib/data.ts
git commit -m "refactor: replace magic numbers with named constants"
```

---

### Task 3.4: Remover `dotenv` redundante em `genkit.ts`

**Files:**

- Modify: `src/ai/genkit.ts` — lines 3, 5

**Context:** Next.js 15 já carrega `.env.local` automaticamente. `dotenv.config()` só é necessário se este arquivo for executado standalone (fora do Next.js).

- [ ] **Step 1: Verificar se `genkit.ts` é usado standalone**

Se for importado apenas via Next.js (App Router), remover:

```ts
// ANTES:
import * as dotenv from 'dotenv';
dotenv.config();

// DEPOIS: remover ambas as linhas
```

Se houver uso standalone, manter com comentário.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/ai/genkit.ts
git commit -m "chore: remove redundant dotenv config in Next.js context"
```

---

## Fase 4 — Shadowing & Consistência (Baixo Impacto)

### Task 4.1: Renomear variável `error` em catch blocks para evitar shadowing

**Files:**

- `src/lib/actions/treinos.ts` — 5 catch blocks
- `src/lib/actions/alunos.ts` — 8 catch blocks
- `src/lib/actions/planos.ts` — 3 catch blocks
- `src/app/dashboard/treinos/treinos-client.tsx` — 3 catch blocks
- `src/app/aluno/meus-treinos/meus-treinos-client.tsx` — 5 catch blocks

**Pattern:** `catch (error)` onde `error: unknown` já é implicitamente tipado. Renomear para `err` ou `caught` só é necessário se houver shadowing real. Na maioria dos casos, o escopo do catch já é isolado.

- [ ] **Step 1: Analisar shadowing real**

Onde `error` é declarado no escopo de função e também no catch:

```ts
// Exemplo de shadowing real:
async function someAction() {
  const error = ...; // outer scope
  try {
    ...
  } catch (error) { // shadows outer
    ...
  }
}
```

Se houver shadowing real, renomear o catch para `err`.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add <arquivos-afetados>
git commit -m "refactor: fix variable shadowing in catch blocks"
```

---

### Task 4.2: Adicionar `noUnusedLocals` ao tsconfig

**Files:**

- Modify: `tsconfig.json`

**Context:** TypeScript strict mode não inclui `noUnusedLocals`. Adicionar para pegar variáveis não utilizadas em compile-time.

- [ ] **Step 1: Adicionar ao `compilerOptions`**

```json
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

- [ ] **Step 2: Corrigir erros**

Run: `npm run typecheck` — esperar alguns erros de variáveis não usadas. Corrigir cada um.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: enable noUnusedLocals and noUnusedParameters"
```

---

## Resumo de Esforço

| Fase      | Descrição                    | Tasks  | Arquivos       | Esforço    |
| --------- | ---------------------------- | ------ | -------------- | ---------- |
| Fase 1    | Error Handling & Type Safety | 5      | ~8             | ~20min     |
| Fase 2    | Type Assertions              | 7      | ~10            | ~25min     |
| Fase 3    | DRY & Limpeza                | 4      | ~10            | ~15min     |
| Fase 4    | Shadowing & Consistência     | 2      | ~8             | ~10min     |
| **Total** |                              | **18** | **~25 únicos** | **~70min** |

## Arquivos Mais Impactados

| Arquivo                                              | Tasks              |
| ---------------------------------------------------- | ------------------ |
| `src/lib/error.ts`                                   | 1.1, 3.1 (criado)  |
| `src/lib/actions/treinos.ts`                         | 1.2, 3.1, 4.1      |
| `src/lib/actions/planos.ts`                          | 1.4, 1.5, 3.1, 4.1 |
| `src/lib/actions/financeiro.ts`                      | 1.3, 3.1           |
| `src/lib/actions/alunos.ts`                          | 3.1, 4.1           |
| `src/app/dashboard/treinos/treinos-client.tsx`       | 2.3, 4.1           |
| `src/app/aluno/meus-treinos/meus-treinos-client.tsx` | 1.4, 3.1, 4.1      |
| `src/components/dashboard/alunos/columns.tsx`        | 2.4                |
| `src/services/alunoService.ts`                       | 2.1                |
| `src/ai/flows/workout-generator-flow.ts`             | 2.2                |
| `src/lib/logger.ts`                                  | 2.5                |
| `src/components/providers/i18n-provider.tsx`         | 2.6                |
| `src/app/dashboard/treinos/page.tsx`                 | 2.7                |
| `src/ai/genkit.ts`                                   | 3.4                |
| `tsconfig.json`                                      | 4.2                |
