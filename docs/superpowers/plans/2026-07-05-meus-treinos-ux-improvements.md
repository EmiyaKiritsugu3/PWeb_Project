# Meus Treinos UX Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inline editor (editor inside card, no scroll), visual grouper banner after AI gen, after-gen scroll anchor, remove bottom-of-page editor.

**Architecture:** State `editingTreinoId` drives which card shows inline `WorkoutEditor`. `WorkoutEditor` gets `compact` prop to drop outer Card wrapper. `useWorkoutGeneration` exposes `planName`. Banner + scroll driven by local state in `meus-treinos-client.tsx`.

**Tech Stack:** React 18, TypeScript 5, Next.js 15 App Router, Vitest

## Global Constraints

- UX only — zero schema/API changes
- 6 files touched max
- Quality gates (lint, format, typecheck, test) must pass
- Branch: `fix/meus-treinos-ux-improvements`

**Architecture note:** The treino list cards are inline `<div>` blocks inside `meus-treinos-client.tsx` `renderWorkoutList()`, NOT the `CardTreino` component (`card-treino.tsx` is for workout session tracking with checkboxes — different feature). Inline editor goes into `renderWorkoutList`, not `card-treino.tsx`.

---

### Task 1: Add `compact` prop to WorkoutEditor

**Files:**
- Modify: `src/components/dashboard/aluno/workout-editor.tsx`
- Modify: `src/components/dashboard/aluno/workout-editor.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks
- Produces: `WorkoutEditor({ onSave, treinoToEdit, onCancel, compact? })` — `compact?: boolean` suppresses outer `<Card>`, renders content in plain `<div>`

- [ ] **Step 1: Add compact prop + conditional Card wrapper**

```typescript
// In workout-editor.tsx, change signature to:
export function WorkoutEditor({
  onSave,
  treinoToEdit,
  onCancel,
  compact = false,
}: Readonly<{
  onSave: (treino: Omit<Treino, 'id' | 'alunoId' | 'instrutorId'>) => void;
  treinoToEdit: Treino | null;
  onCancel: () => void;
  compact?: boolean;
}>) {
```

Extract the return content into a `const content = (<>...</>)` variable, then return conditionally:

```typescript
  if (compact) {
    return <div className="grid gap-6">{content}</div>;
  }
  return (
    <div className="grid gap-6">
      <Card>{content}</Card>
    </div>
  );
```

- [ ] **Step 2: Add tests for compact prop**

```typescript
// In workout-editor.test.tsx, add after existing describe block:
  describe('compact mode', () => {
    it('does not render outer Card when compact', () => {
      render(
        <WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} compact />
      );
      expect(screen.queryByTestId('card')).toBeNull();
    });

    it('renders outer Card by default', () => {
      render(
        <WorkoutEditor onSave={mockOnSave} treinoToEdit={null} onCancel={mockOnCancel} />
      );
      expect(screen.getByTestId('card')).toBeTruthy();
    });
  });
```

- [ ] **Step 3: Run tests — verify all pass**

```
npx vitest run --reporter verbose src/components/dashboard/aluno/workout-editor.test.tsx
```
Expected: 9 tests pass (7 original + 2 new compact mode).

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/aluno/workout-editor.tsx src/components/dashboard/aluno/workout-editor.test.tsx
git commit -m "feat(ux): add compact prop to WorkoutEditor for inline rendering"
```

---

### Task 2: Expose planName from useWorkoutGeneration

**Files:**
- Modify: `src/hooks/use-workout-generation.ts`

**Interfaces:**
- Consumes: nothing
- Produces: hook return `{ isGenerating, handleGenerate, planName }` where `planName: string | null`

- [ ] **Step 1: Add planName state + expose in return**

```typescript
// Add state after isGenerating useState:
  const [planName, setPlanName] = useState<string | null>(null);

// In handleGenerate, after workout loop completes, before notify.success:
          setPlanName(result.planName);

// Change return statement (line ~72):
  return { isGenerating, handleGenerate, planName };
```

- [ ] **Step 2: Run typecheck**

```
npx tsc --noEmit
```
Expected: pass — `planName` is `string | null`, compatible with existing interface.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-workout-generation.ts
git commit -m "feat(ux): expose planName from useWorkoutGeneration for visual grouper banner"
```

---

### Task 3: Inline editor in meus-treinos-client + remove bottom editor

**Files:**
- Modify: `src/app/aluno/meus-treinos/meus-treinos-client.tsx`
- Modify: `src/hooks/use-workout-crud.ts`

**Interfaces:**
- Consumes: `WorkoutEditor` compact prop (Task 1), `planName` (Task 2)
- Produces: inline editor per card, no bottom editor, `handleEdit` triggers inline mode

- [ ] **Step 1: Add editingTreinoId state + replace handleEdit**

```typescript
// After line 71, add:
  const [editingTreinoId, setEditingTreinoId] = useState<string | null>(null);

// Remove handleEdit from useWorkoutCRUD destructuring (line 59).
// Add local handleEdit:
  const handleEditLocal = useCallback((treino: Treino) => {
    setEditingTreinoId(treino.id);
  }, []);
```

- [ ] **Step 2: Render inline WorkoutEditor inside card when editing**

In `renderWorkoutList`, inside the card `<div>`, after the `objetivo`/Badge header, replace the exercise count + buttons with conditional:

```typescript
{allowEditing && editingTreinoId === treino.id ? (
  <div className="mt-4 w-full border-t pt-4">
    <WorkoutEditor
      compact
      treinoToEdit={treino}
      onSave={(data) => {
        handleSave(data);
        setEditingTreinoId(null);
      }}
      onCancel={() => setEditingTreinoId(null)}
    />
  </div>
) : (
  // all existing non-editing content:
  <div className="flex-1">
    {/* ... existing header, badges, exercise count ... */}
  </div>
  // ... existing buttons (Select, Play, Edit, Delete)
)}
```

- [ ] **Step 3: Move "Criar Manual" button above lists, use WorkoutEditor inline**

Remove lines 214-241 (bottom editor + button). Replace with:

```typescript
{/* Above renderWorkoutList calls, before the lists: */}
<div id="treinos-pessoais">
  {renderWorkoutList(
    treinosDoAluno,
    'Meus Treinos Pessoais',
    'Treinos que voce criou manualmente ou gerou com a IA.',
    <User />,
    true
  )}
</div>

<div className="text-center mt-4">
  <Button
    onClick={() => {
      setEditingTreinoId('__new__');
    }}
    variant="outline"
    size="lg"
  >
    <PlusCircle className="mr-2 h-4 w-4" />
    Criar Novo Treino Manualmente
  </Button>
</div>

{editingTreinoId === '__new__' && (
  <div className="mt-4">
    <WorkoutEditor
      compact
      treinoToEdit={null}
      onSave={(data) => {
        handleSave(data);
        setEditingTreinoId(null);
      }}
      onCancel={() => setEditingTreinoId(null)}
    />
  </div>
)}
```

- [ ] **Step 4: Remove window.scrollTo from use-workout-crud.ts**

```typescript
// In use-workout-crud.ts line 60, delete:
// window.scrollTo({ top: 0, behavior: 'smooth' });
// Replace with nothing (remove the line).
```

- [ ] **Step 5: Run typecheck + lint**

```
npx tsc --noEmit
npx eslint src/app/aluno/meus-treinos/meus-treinos-client.tsx src/hooks/use-workout-crud.ts
```
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/aluno/meus-treinos/meus-treinos-client.tsx src/hooks/use-workout-crud.ts
git commit -m "feat(ux): inline editor inside treino cards, remove bottom editor"
```

---

### Task 4: Visual grouper banner + after-gen scroll

**Files:**
- Modify: `src/app/aluno/meus-treinos/meus-treinos-client.tsx`

**Interfaces:**
- Consumes: `planName` from Task 2
- Produces: banner above treino list (auto-clears 30s), smooth scroll after gen

- [ ] **Step 1: Add banner state + auto-clear effect**

```typescript
// After useWorkoutGeneration call (line ~70), add:
  const [showPlanBanner, setShowPlanBanner] = useState(false);
  const [bannerPlanName, setBannerPlanName] = useState<string | null>(null);

  // Capture planName changes into banner state
  useEffect(() => {
    if (planName) {
      setBannerPlanName(planName);
      setShowPlanBanner(true);
      const timer = setTimeout(() => setShowPlanBanner(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [planName]);
```

- [ ] **Step 2: Update onSuccess with scroll**

```typescript
// In useWorkoutGeneration options:
  onSuccess: () => {
    router.refresh();
    setTimeout(() => {
      document.getElementById('treinos-pessoais')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  },
```

- [ ] **Step 3: Render banner above treino list**

```typescript
// Import Sparkles from lucide-react (line 16, already imported)
// Before <div id="treinos-pessoais">, add:
{showPlanBanner && bannerPlanName && (
  <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Sparkles className="text-primary h-5 w-5" />
        Plano Semanal: {bannerPlanName}
      </CardTitle>
    </CardHeader>
  </Card>
)}
```

- [ ] **Step 4: Run typecheck + lint**

```
npx tsc --noEmit
npx eslint src/app/aluno/meus-treinos/meus-treinos-client.tsx
```
Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/aluno/meus-treinos/meus-treinos-client.tsx
git commit -m "feat(ux): visual grouper banner + after-gen scroll anchor"
```

---

### Task 5: Update tests

**Files:**
- Modify: `src/app/aluno/meus-treinos/meus-treinos-client.test.tsx`

- [ ] **Step 1: Add planName to mock**

```typescript
// Lines 57-62, add planName to hook mock return:
vi.mock('@/hooks/use-workout-generation', () => ({
  useWorkoutGeneration: () => ({
    isGenerating: false,
    handleGenerate: vi.fn(),
    planName: null,
  }),
}));
```

- [ ] **Step 2: Import useWorkoutGeneration for dynamic mocking**

```typescript
// Add at top after existing imports:
import { useWorkoutGeneration } from '@/hooks/use-workout-generation';
```

- [ ] **Step 3: Add banner test**

```typescript
// After last test in meus-treinos-client.test.tsx:
  it('renders plan banner when planName is set', () => {
    (useWorkoutGeneration as ReturnType<typeof vi.fn>).mockReturnValue({
      isGenerating: false,
      handleGenerate: vi.fn(),
      planName: 'Hipertrofia 3x',
    });
    render(<MeusTreinosClient initialTreinos={mockTreinos} userId="user-1" />);
    expect(screen.getByText(/Plano Semanal/)).toBeTruthy();
    expect(screen.getByText(/Hipertrofia 3x/)).toBeTruthy();
  });
```

- [ ] **Step 4: Run tests**

```
npx vitest run --reporter verbose src/app/aluno/meus-treinos/
```
Expected: all existing tests pass + new banner test.

- [ ] **Step 5: Run all quality gates**

```
npx prettier --write src/app/aluno/meus-treinos/meus-treinos-client.tsx src/components/dashboard/aluno/workout-editor.tsx src/hooks/use-workout-generation.ts src/hooks/use-workout-crud.ts
npx eslint src
npx tsc --noEmit
npx vitest run
```
Expected: all gates pass.

- [ ] **Step 6: Commit**

```bash
git add src/app/aluno/meus-treinos/meus-treinos-client.test.tsx
git commit -m "test(ux): update tests for inline editor + banner"
```

---

### Task 6: Push + PR

- [ ] **Step 1: Push**

```bash
git push origin fix/meus-treinos-ux-improvements
```

- [ ] **Step 2: Open PR**

```bash
gh pr create --repo EmiyaKiritsugu3/PWeb_Project \
  --base main \
  --head fix/meus-treinos-ux-improvements \
  --title "feat(ux): inline editor + visual grouper for meus treinos" \
  --body "## Changes

- WorkoutEditor renders inline inside treino cards (no scroll jump)
- Visual grouper banner after AI weekly plan generation (auto-hides 30s)
- After-gen smooth scroll to treino list
- Create button moved above treino list, opens inline editor
- Removed bottom-of-page editor

## Files

- \`workout-editor.tsx\` — \`compact\` prop for inline rendering
- \`use-workout-generation.ts\` — exposes \`planName\`
- \`meus-treinos-client.tsx\` — inline editor, banner, scroll, repositioned create button
- \`use-workout-crud.ts\` — removed scrollTo call

Closes UX issues from design spec 2026-07-05.

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

- [ ] **Step 3: Wait for CI, merge**

Monitor checks, merge when green.
