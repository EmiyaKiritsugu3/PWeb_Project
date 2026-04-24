# Refactor Toast to useAppNotification Implementation Plan [PID-SENTINEL]

**Goal:** Decouple business logic from the specific toast UI component by replacing direct `useToast` calls with the `useAppNotification` hook in 7 client-side files.

**Architecture:** Centralize notification logic through a custom hook abstraction (`useAppNotification`). This improves maintainability and allows for consistent error logging and UI updates.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS.

---

### Task 1: Refactor src/app/aluno/dashboard/dashboard-client.tsx

**Files:**

- Modify: `src/app/aluno/dashboard/dashboard-client.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
// Replace
import { useToast } from '@/hooks/use-toast';
// With
import { useAppNotification } from '@/hooks/use-app-notification';

// Inside component, replace
const { toast } = useToast();
// With
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls with notify methods**

```typescript
// Replace
toast({
  title: 'Feedback indisponível',
  description: 'Sincronizando treino sem o comentário da IA.',
});
// With
notify.success('Feedback indisponível', 'Sincronizando treino sem o comentário da IA.');

// Replace
toast({
  title: 'Treino Sincronizado!',
  description: '+500 XP adicinados ao seu perfil.',
  className: 'glass-card border-cyan-500/50',
});
// With
notify.success('Treino Sincronizado!', '+500 XP adicinados ao seu perfil.');

// Replace
toast({ title: 'Erro de conexão', variant: 'destructive' });
// With
notify.error('Erro de conexão');

// Replace
toast({ title: 'Erro ao salvar treino', variant: 'destructive' });
// With
notify.error('Erro ao salvar treino');
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`

---

### Task 2: Refactor src/app/aluno/login/page.tsx

**Files:**

- Modify: `src/app/aluno/login/page.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
import { useAppNotification } from '@/hooks/use-app-notification';
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls**

```typescript
// Replace
toast({
  title: 'Conta criada no Supabase!',
  description: 'Agora você pode acessar o sistema.',
});
// With
notify.success('Conta criada no Supabase!', 'Agora você pode acessar o sistema.');

// Replace
toast({
  title: 'Login bem-sucedido!',
  className: 'bg-accent text-accent-foreground',
});
// With
notify.success('Login bem-sucedido!');

// Replace
toast({
  title: 'Erro de autenticação',
  description: error instanceof Error ? error.message : 'Erro desconhecido',
  variant: 'destructive',
});
// With
notify.error(
  'Erro de autenticação',
  error instanceof Error ? error.message : 'Erro desconhecido',
  error
);
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`

---

### Task 3: Refactor src/app/aluno/meus-treinos/meus-treinos-client.tsx

**Files:**

- Modify: `src/app/aluno/meus-treinos/meus-treinos-client.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
import { useAppNotification } from '@/hooks/use-app-notification';
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls**

```typescript
// handleSave
notify.success(editingTreino ? 'Treino atualizado!' : 'Novo treino salvo!');
notify.error('Erro ao salvar');

// handleDayChange
notify.error('Dia já ocupado', 'Já existe outro treino agendado para este dia.');
notify.success('Agenda atualizada!');
notify.error('Erro ao atualizar agenda');

// handleDelete
notify.error('Treino excluído!'); // Original used variant: destructive but it's a success action in context? Actually original was destructive.
notify.error('Erro ao excluir');

// handleGenerate
notify.success('Plano Pessoal Gerado!', `${result.planName} foi criado com sucesso.`);
notify.error('Erro da IA', (error as Error).message, error);

// handleFinishWorkout
notify.success('Treino Finalizado!', 'Seu progresso e XP foram salvos!');
notify.error('Erro ao salvar histórico');
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`

---

### Task 4: Refactor src/app/dashboard/alunos/alunos-client.tsx

**Files:**

- Modify: `src/app/dashboard/alunos/alunos-client.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
import { useAppNotification } from '@/hooks/use-app-notification';
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls**

```typescript
// handleFormSubmit
notify.success(
  editingAluno ? 'Aluno atualizado!' : 'Aluno cadastrado!',
  `${data.nomeCompleto} foi salvo com sucesso.`
);
notify.error('Erro ao salvar', result.error);

// handleDeleteAluno
notify.error('Aluno excluído!', `${deletingAluno.nomeCompleto} foi removido do sistema.`);
notify.error('Erro ao excluir', result.error);

// handleMatriculaSubmit
notify.success(
  'Matrícula realizada!',
  `${aluno.nomeCompleto} foi matriculado(a) no ${plano.nome}.`
);
notify.error('Erro na matrícula', result.error);
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`

---

### Task 5: Refactor src/app/dashboard/financeiro/financeiro-client.tsx

**Files:**

- Modify: `src/app/dashboard/financeiro/financeiro-client.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
import { useAppNotification } from '@/hooks/use-app-notification';
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls**

```typescript
// handleRegisterPayment
notify.success(
  'Pagamento Registrado!',
  `A matrícula de ${selectedAluno.nomeCompleto} foi reativada.`
);
notify.error('Erro ao registrar pagamento', result.error || 'Ocorreu um erro inesperado.');
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`

---

### Task 6: Refactor src/app/dashboard/planos/planos-client.tsx

**Files:**

- Modify: `src/app/dashboard/planos/planos-client.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
import { useAppNotification } from '@/hooks/use-app-notification';
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls**

```typescript
// handleFormSubmit
notify.success(
  editingPlano ? 'Plano atualizado!' : 'Plano criado!',
  `${data.nome} foi salvo com sucesso.`
);
notify.error('Erro ao salvar', result.error);

// handleDelete
notify.error('Plano excluído!', `${deletingPlano.nome} foi removido.`);
notify.error('Erro ao excluir', result.error);
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`

---

### Task 7: Refactor src/app/dashboard/treinos/treinos-client.tsx

**Files:**

- Modify: `src/app/dashboard/treinos/treinos-client.tsx`

- [ ] **Step 1: Replace import and initialization**

```typescript
import { useAppNotification } from '@/hooks/use-app-notification';
const notify = useAppNotification();
```

- [ ] **Step 2: Replace toast calls**

```typescript
// handleSaveTreino
notify.error('Erro ao salvar', 'Verifique os campos obrigatórios.');
notify.success('Treino Salvo!');
notify.error('Erro ao salvar');

// handleGenerateWorkout
notify.error('Selecione um aluno primeiro!');
notify.success('Plano Gerado!');
notify.error('Erro da IA', 'Não foi possível gerar o treino. Tente novamente em instantes.');

// handleSavePlanoGerado
notify.success('Plano Atribuído!');
notify.error('Erro ao salvar plano');
```

- [ ] **Step 3: Run typecheck**
      Run: `npm run typecheck`
