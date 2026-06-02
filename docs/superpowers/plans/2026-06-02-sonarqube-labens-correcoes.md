# SonarQube Labens — Correção de Issues

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolver 209 issues abertas no SonarQube Labens (3 BLOCKER, 5 CRITICAL, 37 MAJOR, 163 MINOR, 1 INFO) e 12 Security Hotspots.

**Architecture:** Correções são independentes por arquivo. Fase 1 (BLOCKER) e Fase 2 (CRITICAL) têm prioridade máxima. Fases 3-4 são lotes por padrão de código. Cada task segue: 1) ler arquivo 2) aplicar correção 3) rodar `lsp_diagnostics` 4) rodar `npm run typecheck && npm run lint` 5) commit.

**Tech Stack:** TypeScript, Next.js, Prisma, MongoDB scripts, shadcn/ui

---

## Fase 1 — BLOCKER + Security Hotspots

### Task 1.1: Extrair senha MongoDB para env var em `crud.js`

**Files:**

- Modify: `database/20261/tarefas/EmiyaKiritsugu3/scripts/crud.js:16-18`

**Context:** String `mongodb://app_atividades:app123@localhost:27017/AtividadesProj` hardcoded. Já tem fallback `process.env.MONGO_URI`.

**Change:** Remover fallback com senha. Manter só env var.

- [ ] **Step 1: Editar fallback URI para remover senha**

```js
// ANTES (L16-18):
const URI =
  process.env.MONGO_URI ||
  'mongodb://app_atividades:app123@localhost:27017/AtividadesProj?authSource=AtividadesProj';

// DEPOIS:
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is required.');
  process.exit(1);
}
const URI = MONGO_URI;
```

- [ ] **Step 2: Verificar**

Run: `npx eslint database/20261/tarefas/EmiyaKiritsugu3/scripts/crud.js` — no new errors

- [ ] **Step 3: Commit**

```bash
git add database/20261/tarefas/EmiyaKiritsugu3/scripts/crud.js
git commit -m "fix: remove hardcoded MongoDB password from crud.js"
```

---

### Task 1.2: Extrair senha MongoDB para env var em `seed.js`

**Files:**

- Modify: `database/20261/tarefas/EmiyaKiritsugu3/scripts/seed.js:5-14`

**Context:** Senha hardcoded em 2 lugares: comentário L5 e fallback URI L12-14.

- [ ] **Step 1: Remover senha do comentário e do fallback**

```js
// ANTES (L5):
//   mongosh "mongodb://app_atividades:app123@localhost:27017/AtividadesProj?authSource=AtividadesProj" seed.js
// DEPOIS (L5):
//   MONGO_URI="mongodb://app_atividades:MONGO_PASSWORD@localhost:27017/AtividadesProj?authSource=AtividadesProj" node seed.js
```

```js
// ANTES (L12-14):
const URI =
  process.env.MONGO_URI ||
  'mongodb://app_atividades:app123@localhost:27017/AtividadesProj?authSource=AtividadesProj';

// DEPOIS:
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('FATAL: MONGO_URI environment variable is required.');
  process.exit(1);
}
const URI = MONGO_URI;
```

- [ ] **Step 2: Verificar**

Run: `npx eslint database/20261/tarefas/EmiyaKiritsugu3/scripts/seed.js` — no new errors

- [ ] **Step 3: Commit**

```bash
git add database/20261/tarefas/EmiyaKiritsugu3/scripts/seed.js
git commit -m "fix: remove hardcoded MongoDB password from seed.js"
```

---

### Task 1.3: Extrair senha MongoDB para env var em `mongo-init.js`

**Files:**

- Modify: `database/20261/tarefas/EmiyaKiritsugu3/scripts/mongo-init.js:14`

**Context:** Security Hotspot — senha hardcoded em script de init.

- [ ] **Step 1: Ler e corrigir**

Read: `database/20261/tarefas/EmiyaKiritsugu3/scripts/mongo-init.js` — identificar linha com senha e substituir por placeholder `$(MONGO_PASSWORD)` ou env var.

- [ ] **Step 2: Commit**

```bash
git add database/20261/tarefas/EmiyaKiritsugu3/scripts/mongo-init.js
git commit -m "fix: remove hardcoded password from mongo-init.js"
```

---

### Task 1.4: Extrair senhas E2E para env var em `seed-e2e.ts`

**Files:**

- Modify: `prisma/seed-e2e.ts:43-73`

**Context:** 4 senhas `Test1234!` hardcoded nos users E2E (gerente, recep, instrutor, aluno).

- [ ] **Step 1: Adicionar fallback para env var nas senhas**

```ts
// ANTES (L44-72):
export const E2E_USERS = {
  gerente: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'gerente@test.com',
    password: 'Test1234!',
    role: Role.GERENTE,
    nomeCompleto: 'Gerente E2E',
  },
  recepcionista: {
    id: '...',
    email: 'recep@test.com',
    password: 'Test1234!',
    role: Role.RECEPCIONISTA,
    nomeCompleto: 'Recepcionista E2E',
  },
  // ... instrutor, aluno
} as const;

// DEPOIS:
const E2E_PASSWORD = process.env.E2E_DEFAULT_PASSWORD || 'Test1234!';

export const E2E_USERS = {
  gerente: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'gerente@test.com',
    password: E2E_PASSWORD,
    role: Role.GERENTE,
    nomeCompleto: 'Gerente E2E',
  },
  recepcionista: {
    id: '...',
    email: 'recep@test.com',
    password: E2E_PASSWORD,
    role: Role.RECEPCIONISTA,
    nomeCompleto: 'Recepcionista E2E',
  },
  // ... instrutor, aluno
} as const;
```

- [ ] **Step 2: Verificar**

Run: `npx eslint prisma/seed-e2e.ts`

- [ ] **Step 3: Commit**

```bash
git add prisma/seed-e2e.ts
git commit -m "fix: extract E2E passwords to env var fallback"
```

---

### Task 1.5: Extrair senhas E2E para env var em `tests/e2e/helpers/auth.ts`

**Files:**

- Modify: `tests/e2e/helpers/auth.ts:3-32`

**Context:** 4 senhas `Test1234!` hardcoded nas credenciais E2E.

- [ ] **Step 1: Usar variável compartilhada**

```ts
// ANTES - CREDENTIALS com password: 'Test1234!' em 4 lugares
// DEPOIS:
const E2E_PASSWORD = process.env.E2E_DEFAULT_PASSWORD || 'Test1234!';
// ... CREDENTIALS usando E2E_PASSWORD
```

- [ ] **Step 2: Verificar**

Run: `npx eslint tests/e2e/helpers/auth.ts`

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/helpers/auth.ts
git commit -m "fix: extract E2E passwords to env var in auth helper"
```

---

### Task 1.6: Adicionar `E2E_DEFAULT_PASSWORD` ao `.env.example`

**Files:**

- Modify: `.env.example`

- [ ] **Step 1: Adicionar variável**

Adicionar ao `.env.example`:

```env
# E2E: default password for test users (used by seed-e2e.ts and auth helper)
# E2E_DEFAULT_PASSWORD=Test1234!
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "chore: add E2E_DEFAULT_PASSWORD to env example"
```

---

### Task 1.7: Verificar hotspots de `Math.random()` em `sidebar.tsx` e `alunos.ts`

**Files:**

- Read-only: `src/components/ui/sidebar.tsx:637`, `src/lib/actions/alunos.ts:97`

**Context:** Security Hotspot por uso de `Math.random()`. Avaliar se é seguro (não criptográfico) e se justifica suppression.

- [ ] **Step 1: Analisar uso**

Determinar se `Math.random()` é usado para ID temporário/UI (falso positivo) ou algo sensível.

- [ ] **Step 2: Se falso positivo — marcar como "Aceito" no SonarQube**

Se for para ID de UI/key de React, é aceitável. Usar `// NOSONAR` no código OU marcar como "Won't Fix" no dashboard.

---

## Fase 2 — CRITICAL

### Task 2.1: Reduzir complexidade cognitiva em `updateSession()` (middleware.ts)

**Files:**

- Modify: `src/utils/supabase/middleware.ts`

**Context:** Função `updateSession` com complexidade 17 (limite 15). Lógica de roteamento misturada com verificação de role.

- [ ] **Step 1: Extrair lógica de autorização**

```ts
// EXTRAIR para função separada (antes do export):

type AuthResult =
  | { user: import('@supabase/supabase-js').User; role: string | null; isFuncionario: boolean }
  | { redirect: NextResponse };

async function getAuthForRoute(
  supabase: ReturnType<typeof createServerClient>,
  pathname: string
): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL('/login', supabaseUrl);
    return { redirect: NextResponse.redirect(loginUrl) };
  }

  const { data: funcionarioProfile } = await supabase
    .from('funcionarios')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  return {
    user,
    role: funcionarioProfile?.role ?? null,
    isFuncionario: !!funcionarioProfile,
  };
}

// DEPOIS, no updateSession:
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      /* ... */
    },
  });

  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAlunoRoute = pathname.startsWith('/aluno') && !pathname.startsWith('/aluno/login');
  const isProtectedRoute = isDashboardRoute || isAlunoRoute;

  if (!isProtectedRoute) return supabaseResponse;

  const auth = await getAuthForRoute(supabase, pathname);
  if ('redirect' in auth) return auth.redirect;

  const { role, isFuncionario } = auth;
  if (isFuncionario && isAlunoRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (!isFuncionario && isDashboardRoute) {
    return NextResponse.redirect(new URL('/aluno/login', request.url));
  }

  return supabaseResponse;
};
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint` — sem erros

- [ ] **Step 3: Commit**

```bash
git add src/utils/supabase/middleware.ts
git commit -m "refactor: reduce cognitive complexity in updateSession (17→~8)"
```

---

### Task 2.2: Reduzir complexidade cognitiva em `upsertTreinoAction()` (treinos.ts)

**Files:**

- Modify: `src/lib/actions/treinos.ts`

**Context:** Complexidade 18 (limite 15). Função grande com validação + upsert + gamificação.

- [ ] **Step 1: Extrair bloco de upsert para função separada**

```ts
// ANTES: tudo dentro de upsertTreinoAction
// DEPOIS: extrair lógica de upsert

async function performTreinoUpsert(
  validatedData: TreinoBase & { id?: string },
  user: { id: string },
  role: string | null,
  derivedInstrutorId: string | null
) {
  const { objetivo, exercicios, diaSemana } = validatedData;
  const alunoId = role === null ? user.id : validatedData.alunoId;

  try {
    const treino = await prisma.treino.upsert({
      where: { id: validatedData.id ?? '' },
      update: { objetivo, exercicios, diaSemana, instrutorId: derivedInstrutorId },
      create: {
        alunoId,
        objetivo,
        exercicios,
        diaSemana,
        instrutorId: derivedInstrutorId,
      },
    });

    const rewards = await calculateTreinoRewards(alunoId);
    return { success: true, treino, rewards };
  } catch (error) {
    Sentry.captureException(error);
    return { success: false, error: 'Erro ao salvar treino' };
  }
}

// upsertTreinoAction fica ~10 linhas
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/treinos.ts
git commit -m "refactor: reduce cognitive complexity in upsertTreinoAction (18→~10)"
```

---

### Task 2.3: Reduzir nesting em `treinos-client.tsx`

**Files:**

- Modify: `src/app/dashboard/treinos/treinos-client.tsx:420-435`

**Context:** Callbacks aninhados >4 níveis no handler de atribuição de plano.

- [ ] **Step 1: Extrair callback para função nomeada**

```tsx
// ANTES (L420-435):
if (!selectedAluno) return;
try {
  const treinos = planoEditado.workouts.map((workout) => ({
    alunoId: selectedAluno.id,
    objetivo: workout.nome,
    exercicios: workout.exercicios.map((ex) => ({
      nomeExercicio: ex.nomeExercicio,
      series: ex.series,
      repeticoes: ex.repeticoes,
      observacoes: ex.observacoes,
      descricao:
        flatExerciciosOptions.find((opt) => opt.value === ex.nomeExercicio)?.description || '',
    })),
    diaSemana: workout.diaSugerido,
  }));

  const result = await batchUpsertTreinoAction(treinos);
  if (!result.success) throw new Error(result.error);
  notify.success('Plano Atribuído!');

// DEPOIS:
function buildWorkoutTreinos(
  planoEditado: PlanoEditado,
  selectedAluno: Aluno,
  flatExerciciosOptions: Option[]
): TreinoBase[] {
  return planoEditado.workouts.map((workout) => ({
    alunoId: selectedAluno.id,
    objetivo: workout.nome,
    exercicios: buildExercicios(workout.exercicios, flatExerciciosOptions),
    diaSemana: workout.diaSugerido,
  }));
}

function buildExercicios(
  exercicios: Exercicio[],
  flatExerciciosOptions: Option[]
): ExercicioBase[] {
  return exercicios.map((ex) => ({
    nomeExercicio: ex.nomeExercicio,
    series: ex.series,
    repeticoes: ex.repeticoes,
    observacoes: ex.observacoes,
    descricao:
      flatExerciciosOptions.find((opt) => opt.value === ex.nomeExercicio)?.description || '',
  }));
}
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/treinos/treinos-client.tsx
git commit -m "refactor: reduce nesting depth in treinos-client.tsx"
```

---

### Task 2.4: Reduzir nesting em `combobox.tsx`

**Files:**

- Modify: `src/components/ui/combobox.tsx:95-104`

**Context:** Callback aninhado dentro de `CommandItem` >4 níveis.

- [ ] **Step 1: Extrair handler para variável**

```tsx
// ANTES:
<CommandItem
  keywords={option.keywords}
  onSelect={(currentValue) => {
    const selectedOption = flatOptions.find(
      (opt) => opt.label.toLowerCase() === currentValue.toLowerCase()
    );
    const finalValue = selectedOption ? selectedOption.value : '';
    onChange(finalValue === value ? '' : finalValue);
    setOpen(false);
  }}
>

// DEPOIS:
const handleSelect = (currentValue: string) => {
  const selectedOption = flatOptions.find(
    (opt) => opt.label.toLowerCase() === currentValue.toLowerCase()
  );
  const finalValue = selectedOption ? selectedOption.value : '';
  onChange(finalValue === value ? '' : finalValue);
  setOpen(false);
};

// No JSX:
<CommandItem
  keywords={option.keywords}
  onSelect={handleSelect}
>
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/combobox.tsx
git commit -m "refactor: reduce nesting in combobox CommandItem handler"
```

---

### Task 2.5: Remover `await` de non-Promise em `workout-generator-flow.ts`

**Files:**

- Modify: `src/ai/flows/workout-generator-flow.ts:52`

**Context:** `await ai.generateStream(...)` — se a API retorna direto o objeto (não Promise), `await` é desnecessário.

- [ ] **Step 1: Investigar e corrigir**

```ts
// ANTES (L52):
const responseStream = await ai.generateStream({...});

// DEPOIS (se generateStream não for async):
const responseStream = ai.generateStream({...});
```

**Verificar tipo de retorno de `generateStream`.** Se for `Promise`, manter. Se não for, remover `await`.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/ai/flows/workout-generator-flow.ts
git commit -m "fix: remove unnecessary await on non-Promise return"
```

---

## Fase 3 — MAJOR

### Task 3.1: Extrair ternários aninhados em `data-table.tsx`

**Files:**

- Modify: `src/components/dashboard/alunos/data-table.tsx:87,137,159,161,167`

- [ ] **Step 1: Corrigir ternários**

Cada ternário aninhado vira `if/else` ou função auxiliar. Exemplo:

```tsx
// ANTES:
const status = a ? (b ? 'x' : 'y') : 'z';

// DEPOIS:
function getStatus(a: boolean, b: boolean): string {
  if (!a) return 'z';
  return b ? 'x' : 'y';
}
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/alunos/data-table.tsx
git commit -m "refactor: extract nested ternaries in data-table.tsx"
```

---

### Task 3.2: Extrair ternário aninhado em `WorkoutSession.tsx`

**Files:**

- Modify: `src/components/WorkoutSession.tsx:190`

- [ ] **Step 1: Extrair lógica**

```tsx
// Identificar o ternário na linha 190 e extrair para variável ou função
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/WorkoutSession.tsx
git commit -m "refactor: extract nested ternary in WorkoutSession.tsx"
```

---

### Task 3.3: Substituir Array index por key única

**Files:**

- Modify: `src/app/dashboard/planos/page.tsx:26`
- Modify: `src/app/dashboard/treinos/treinos-client.tsx:246,258`
- Modify: `src/components/dashboard/alunos/data-table.tsx:81,159,161`
- Modify: `src/components/ui/dashboard-skeletons.tsx:18`

- [ ] **Step 1: Identificar dados únicos disponíveis**

Para cada arquivo, substituir `index` por `item.id` ou propriedade única. Exemplo:

```tsx
// ANTES:
{
  items.map((item, index) => <div key={index}>...</div>);
}

// DEPOIS:
{
  items.map((item) => <div key={item.id}>...</div>);
}
```

Se não existir `id`, usar `item.nome` + `index` como fallback:

```tsx
{
  items.map((item, index) => <div key={`${item.nome}-${index}`}>...</div>);
}
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/planos/page.tsx src/app/dashboard/treinos/treinos-client.tsx src/components/dashboard/alunos/data-table.tsx src/components/ui/dashboard-skeletons.tsx
git commit -m "refactor: replace Array index keys with unique identifiers"
```

---

### Task 3.4: Memoizar context values em providers

**Files:**

- Modify: `src/components/ui/chart.tsx:49`
- Modify: `src/components/ui/form.tsx:36,76`
- Modify: `src/components/ui/carousel.tsx:111`
- Modify: `src/components/providers/i18n-provider.tsx:60`

**Pattern (exemplo para chart.tsx):**

```tsx
// ANTES:
return <ChartContext.Provider value={{...}}>{children}</ChartContext.Provider>;

// DEPOIS:
const chartValue = useMemo(() => ({...}), [deps]);
return <ChartContext.Provider value={chartValue}>{children}</ChartContext.Provider>;
```

- [ ] **Step 1: Aplicar `useMemo` em cada provider**

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/chart.tsx src/components/ui/form.tsx src/components/ui/carousel.tsx src/components/providers/i18n-provider.tsx
git commit -m "perf: memoize context provider values to prevent re-renders"
```

---

### Task 3.5: Top-level await em seed files

**Files:**

- Modify: `prisma/seed.ts:154`
- Modify: `prisma/seed-e2e.ts:214`
- Modify: `database/20261/tarefas/EmiyaKiritsugu3/scripts/crud.js:130`
- Modify: `database/20261/tarefas/EmiyaKiritsugu3/scripts/seed.js:169`

**Pattern geral:**

```js
// ANTES:
(async () => {
  await run();
})().catch(console.error);

// DEPOIS (top-level await — módulo ES ou Node >=14.8):
await run();
```

**Nota:** Verificar se os scripts `.js` estão em CommonJS (`require`). Se sim, manter IIFE ou converter para ES modules (`"type": "module"` no package.json ou extensão `.mjs`).

- [ ] **Step 1: Analisar module system de cada arquivo**

Se CommonJS — manter IIFE, mas mover `.catch()` para `try/catch` interno. Se ESM — usar `await` direto.

- [ ] **Step 2: Aplicar correção**

```js
// Para CommonJS — mínimo suficiente:
async function run() {
  /*...*/
}
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Verificar**

Run: `node --check prisma/seed.ts` (ou arquivo específico)

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts prisma/seed-e2e.ts database/20261/tarefas/EmiyaKiritsugu3/scripts/crud.js database/20261/tarefas/EmiyaKiritsugu3/scripts/seed.js
git commit -m "refactor: use top-level await pattern in seed files"
```

---

### Task 3.6: `return Promise.resolve(x)` → `return x` em `dummyDb.ts`

**Files:**

- Modify: `src/lib/dummyDb.ts:5,9,13,17`

- [ ] **Step 1: Substituir**

```ts
// ANTES:
return Promise.resolve({ id: '...' });
// DEPOIS:
return { id: '...' };
```

A função já é `async` — retorno é automaticamente wrapped em Promise.

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/lib/dummyDb.ts
git commit -m "refactor: remove unnecessary Promise.resolve in async function"
```

---

### Task 3.7: Correções de acessibilidade

**Files:**

- Modify: `src/components/ui/table.tsx:8` — adicionar `<thead>`
- Modify: `src/components/ui/alert.tsx:32` — heading content
- Modify: `src/components/ui/carousel.tsx:122` — aria-label no section
- Modify: `src/components/ui/carousel.tsx:163` — group role semântico

- [ ] **Step 1: Aplicar correções de acessibilidade**

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/table.tsx src/components/ui/alert.tsx src/components/ui/carousel.tsx
git commit -m "fix: accessibility issues in table, alert, carousel"
```

---

### Task 3.8: Correções menores restantes (MAJOR)

**Files:**

- Modify: `src/app/aluno/meus-treinos/meus-treinos-client.tsx:156` — optional chain
- Modify: `src/lib/logger.ts:8` — `readonly`
- Modify: `src/ai/schemas.ts:63` — tipo redundante
- Modify: `src/components/ui/command.tsx:44` — propriedade desconhecida
- Modify: `src/app/dashboard/alunos/alunos-client.tsx:167` — spacing

- [ ] **Step 1: Aplicar cada correção individual**

```ts
// logger.ts — ANTES:  isProduction = process.env...  DEPOIS:  readonly isProduction = ...
// schemas.ts — ANTES: type Alias = Type  DEPOIS: usar Type diretamente
// meus-treinos-client.tsx — ANTES: a && a.b  DEPOIS: a?.b
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/app/aluno/meus-treinos/... src/lib/logger.ts src/ai/schemas.ts src/components/ui/command.tsx src/app/dashboard/alunos/alunos-client.tsx
git commit -m "fix: various MAJOR code smells"
```

---

## Fase 4 — MINOR

### Task 4.1: Adicionar `readonly` a props de componentes

**Files (~30 arquivos):** Ver lista no SonarQube dashboard.

**Padrão:**

```tsx
// ANTES:
export function Component({ prop }: { prop: string }) {
// DEPOIS:
export function Component({ prop }: { readonly prop: string }) {
```

**Ou em interfaces:**

```tsx
// ANTES:
interface Props {
  prop: string;
}
// DEPOIS:
interface Props {
  readonly prop: string;
}
```

- [ ] **Step 1: Rodar script de correção em lote**

```bash
# Identificar arquivos com props sem readonly
# Usar ast-grep para encontrar padrão
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add <arquivos-afetados>
git commit -m "style: add readonly to component props"
```

---

### Task 4.2: Substituir `window` por `globalThis`

**Files:**

- Modify: `src/components/ui/sidebar.tsx:102-103`
- Modify: `src/hooks/use-mobile.tsx:9`

- [ ] **Step 1: Substituir**

```tsx
// ANTES:
const isMobile = window.matchMedia('...');
// DEPOIS:
const isMobile = globalThis.matchMedia('...');
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/sidebar.tsx src/hooks/use-mobile.tsx
git commit -m "style: replace window with globalThis"
```

---

### Task 4.3: Substituir `parseInt` por `Number.parseInt`

**Files (~8 ocorrências):**

- `src/app/dashboard/treinos/treinos-client.tsx:151,216,532`
- `src/components/dashboard/aluno/workout-editor.tsx:159`
- `src/components/dashboard/aluno/workout-generator.tsx:116`
- `src/components/WorkoutSession.tsx:84`
- `src/components/dashboard/alunos/form-aluno.tsx:41`
- `src/app/aluno/meus-treinos/meus-treinos-client.tsx:106`

- [ ] **Step 1: Substituir**

```tsx
// ANTES:
parseInt(value, 10);
// DEPOIS:
Number.parseInt(value, 10);
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add <arquivos-afetados>
git commit -m "style: prefer Number.parseInt over parseInt"
```

---

### Task 4.4: Substituir `JSON.parse(JSON.stringify(x))` por `structuredClone(x)`

**Files:**

- `src/app/aluno/dashboard/page.tsx:79-80`
- `src/app/dashboard/planos/page.tsx:10`
- `src/app/dashboard/alunos/page.tsx:10-11`

- [ ] **Step 1: Substituir**

```tsx
// ANTES:
JSON.parse(JSON.stringify(data));
// DEPOIS:
structuredClone(data);
```

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add <arquivos-afetados>
git commit -m "refactor: prefer structuredClone over JSON.parse(JSON.stringify())"
```

---

### Task 4.5: Substituir `String.replace()` por `String.replaceAll()` e `Number.isNaN` por `isNaN`

**Files:**

- `src/components/ui/chart.tsx:46` — `.replace()` → `.replaceAll()`
- `src/components/dashboard/alunos/form-aluno.tsx:97` — `.replace()` → `.replaceAll()`
- `src/app/dashboard/treinos/treinos-client.tsx:152` — `isNaN` → `Number.isNaN`
- `src/components/dashboard/aluno/workout-generator.tsx:117` — `isNaN` → `Number.isNaN`
- `src/components/dashboard/alunos/form-aluno.tsx:41` — `isNaN` → `Number.isNaN`

- [ ] **Step 1: Aplicar substituições**

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add <arquivos-afetados>
git commit -m "style: use replaceAll and Number.isNaN"
```

---

### Task 4.6: Limpar `ElementRef` deprecated (shadcn/ui) — BATCH

**Files (~60 ocorrências em ~20 arquivos):**

- `src/components/ui/accordion.tsx`, `alert-dialog.tsx`, `avatar.tsx`, `checkbox.tsx`, `command.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `form.tsx`, `label.tsx`, `menubar.tsx`, `popover.tsx`, `progress.tsx`, `radio-group.tsx`, `scroll-area.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `sidebar.tsx`, `slider.tsx`, `switch.tsx`, `tabs.tsx`, `toast.tsx`, `tooltip.tsx`

**Padrão:**

```tsx
// ANTES:
import { ElementRef } from 'react';
// uso: React.ElementRef<typeof Component>

// DEPOIS:
// Em React 19+: ElementRef ainda existe, mas usar ref diretamente
// Ou: ComponentRef<typeof Component>
import { ComponentRef } from 'react';
// uso: ComponentRef<typeof Component>
```

- [ ] **Step 1: Substituir `ElementRef` por `ComponentRef`**

- [ ] **Step 2: Verificar**

Run: `npm run typecheck && npm run lint`

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/*.tsx
git commit -m "chore: migrate from deprecated ElementRef to ComponentRef"
```

---

## Fase 5 — Coverage (Médio Prazo)

### Task 5.1: Aumentar cobertura para módulos críticos

**Target:** Elevar coverage de 4,7% para pelo menos 20%.

**Prioridade:**

1. `src/lib/actions/treinos.ts` — lógica de negócio principal (0% coberto)
2. `src/utils/supabase/middleware.ts` — auth crítico
3. `src/services/gamificationService.ts` — gamificação
4. `src/lib/data.ts` — utilidades

- [ ] **Step 1: Identificar módulos sem teste**

Run: `npm run test:coverage` e analisar relatório.

- [ ] **(Tasks específicas de teste a serem detalhadas em plano separado)**

---

## Resumo de Esforço

| Fase                        | Tarefas     | Arquivos | Esforço Estimado |
| --------------------------- | ----------- | -------- | ---------------- |
| Fase 1 — BLOCKER + Hotspots | 7           | 6-7      | 15min            |
| Fase 2 — CRITICAL           | 5           | 5        | 20min            |
| Fase 3 — MAJOR              | 8           | ~20      | 30min            |
| Fase 4 — MINOR              | 6           | ~50      | 40min            |
| Fase 5 — Coverage           | 1 (parcial) | —        | médio prazo      |
| **Total**                   | **27**      | **~80**  | **~2h**          |
