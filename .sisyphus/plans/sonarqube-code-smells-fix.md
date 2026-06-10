# Plano de Correção Code Smells - SonarQube

## TL;DR

> **Objetivo**: Corrigir 37 code smells reais + suprimir 10 false positives (total 47 reportados).
>
> **Validação**: Context7 + Sequential Thinking confirmaram 3 fixes incorretos (carousel, command, data.ts).
>
> **Resultado esperado**: 37 fixes reais → Quality Gate desbloqueado.

---

## Validated Findings (Context7)

### ❌ FALSE POSITIVES IDENTIFICADOS (10)

| Arquivo                   | Linha      | Regra Sonar                                | Veredicto    | Razão (Documentação)                                                                                                                                                   |
| ------------------------- | ---------- | ------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command.tsx`             | 45         | Unknown property `cmdk-input-wrapper`      | **SUPRIMIR** | Padrão oficial cmdk. `[cmdk-input-wrapper]` é seletor CSS da lib (docs: `cmdk-input-wrapper` attribute selector).                                                      |
| `carousel.tsx`            | 125        | Use `<section aria-label>`                 | **SUPRIMIR** | `role="region"` é padrão ARIA para carrossel sem plugin de acessibilidade. Embla accessibility plugin SETA isso automaticamente, mas NÃO está instalado neste projeto. |
| `carousel.tsx`            | 167        | Use `<fieldset>` instead of `role="group"` | **SUPRIMIR** | Embla accessibility plugin usa `slideRole: 'group'` como DEFAULT (docs: `slideRole: 'group'`). Padrão correto para slides de carrossel.                                |
| `data-table.tsx`          | 71,126,129 | Array index keys                           | **SUPRIMIR** | Skeletons de loading são estáticos. Keys com prefixo `skeleton-${i}` são aceitáveis. Já possuem `sonar-ignore`.                                                        |
| `dashboard-skeletons.tsx` | 20         | Array index keys                           | **SUPRIMIR** | Mesmo caso. Skeleton estático.                                                                                                                                         |
| `planos/page.tsx`         | 27         | Array index keys                           | **SUPRIMIR** | Mesmo caso. Skeleton estático.                                                                                                                                         |
| `data.ts`                 | 125        | Empty catch                                | **SUPRIMIR** | View SQL pode não existir. Catch intencional com Sentry message. Já tem `sonar-ignore`.                                                                                |
| `alert.tsx`               | 32         | Heading has content                        | **SUPRIMIR** | Componente genérico. Filhos sempre fornecidos pelo consumidor.                                                                                                         |
| `logger.ts`               | 30         | JSON.parse fallback                        | **SUPRIMIR** | structuredClone já é primário. JSON.parse é fallback para circular refs. `sonar-ignore` existe.                                                                        |
| `logger.ts`               | 36         | String(v) format                           | **SUPRIMIR** | Fallback para objetos não-serializáveis. `sonar-ignore` existe.                                                                                                        |

### ✅ FIXES REAIS CONFIRMADOS (37)

| #   | Categoria                           | Instâncias | Prioridade |
| --- | ----------------------------------- | ---------- | ---------- |
| 1   | Readonly Props                      | 20         | 🔴 Alta    |
| 2   | Calendar Chevron extraction         | 1          | 🟡 Média   |
| 3   | alunos-client.tsx spacing           | 1          | 🟡 Média   |
| 4   | Chart replaceAll + condition        | 3          | 🟡 Média   |
| 5   | form-aluno.tsx replaceAll           | 1          | 🟡 Média   |
| 6   | workout-exercise-row action pattern | 1          | 🟡 Média   |
| 7   | definitions.ts re-export            | 1          | 🟢 Baixa   |
| 8   | i18n-provider.tsx destructuring     | 1          | 🟢 Baixa   |
| 9   | middleware.ts String.raw            | 1          | 🟢 Baixa   |
| 10  | chart.tsx assertions                | 2          | 🟢 Baixa   |
| 11  | carousel.tsx aria-label fix         | 1          | 🟡 Média   |
| 12  | alert.tsx heading accessible        | 1          | 🟡 Média   |
| 13  | data.ts exception handling          | 1          | 🟢 Baixa   |

**Total**: 37 fixes + 10 suppressions = 47 issues addressed.

---

## Detalhes dos Fixes

### Fix 1: Readonly Props (20 instâncias) — MINOR

**Validação React**: Docs confirmam "never mutate props directly". `Readonly<>` enforce em compile time.

| Arquivo                                                   | Linhas                                  | Componentes                                                                                                                                   |
| --------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/dashboard/alunos/[id]/page.tsx`                  | 42, 60, 71, 91, 123, 167, 210, 249, 291 | StatItem, InfoField, XpProgressBar, ProfileDetailsSection, AlunoProfileCard, MatriculasTable, PagamentosTable, TreinosList, AlunoDetalhesPage |
| `src/app/dashboard/layout.tsx`                            | 30, 58, 84                              | DashboardSidebar, DashboardHeader, DashboardLayout                                                                                            |
| `src/components/dashboard/aluno/workout-exercise-row.tsx` | 15, 31, 73, 105, 122, 139, 154, 158     | GridField, ExerciseNameField, DeleteButton, SeriesField, RepsField, ObsField, RemoveField, WorkoutExerciseRow                                 |
| `src/app/aluno/aluno-header.tsx`                          | 56, 116                                 | UserMenu, AlunoHeader                                                                                                                         |
| `src/components/dashboard-nav.tsx`                        | 35                                      | DashboardNav                                                                                                                                  |

**Padrão**:

```tsx
// ANTES
function Component({ prop1, prop2 }: { prop1: string; prop2: number }) {

// DEPOIS
function Component({ prop1, prop2 }: Readonly<{ prop1: string; prop2: number }>) {
```

---

### Fix 2: Calendar - Extrair Chevron (1 instância) — MAJOR

**Arquivo**: `src/components/ui/calendar.tsx:52`

```tsx
// ANTES (dentro de Calendar)
components={{
  Chevron: (props) => {
    if (props.orientation === 'left') {
      return <ChevronLeft className="h-4 w-4" />;
    }
    return <ChevronRight className="h-4 w-4" />;
  },
}}

// DEPOIS (fora de Calendar)
function CalendarChevron({ orientation }: Readonly<{ orientation: 'left' | 'right' }>) {
  return orientation === 'left'
    ? <ChevronLeft className="h-4 w-4" />
    : <ChevronRight className="h-4 w-4" />;
}

// Dentro de Calendar:
components={{ Chevron: CalendarChevron }}
```

---

### Fix 3: alunos-client.tsx - Espaçamento (1 instância) — MAJOR

**Arquivo**: `src/app/dashboard/alunos/alunos-client.tsx:167`

```tsx
// ANTES
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno
              <strong>{deletingAluno?.nomeCompleto}</strong> e removerá todos os seus dados do

// DEPOIS
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o aluno{' '}
              <strong>{deletingAluno?.nomeCompleto}</strong> e removerá todos os seus dados do
```

---

### Fix 4: Chart - replaceAll + Condition (3 instâncias) — MINOR

**Arquivo**: `src/components/ui/chart.tsx`

```tsx
// Linha 46: ANTES
const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;
// DEPOIS
const chartId = `chart-${id || uniqueId.replaceAll(':', '')}`;

// Linha 170: ANTES
{
  !nestLabel ? tooltipLabel : null;
}
// DEPOIS
{
  nestLabel ? null : tooltipLabel;
}
```

---

### Fix 5: form-aluno.tsx - replaceAll (1 instância) — MINOR

**Arquivo**: `src/components/dashboard/alunos/form-aluno.tsx:97`

```tsx
// ANTES
.replace(/\D/g, '')
// DEPOIS
.replaceAll(/\D/g, '')
```

---

### Fix 6: workout-exercise-row - Action Pattern (1 instância) — MAJOR

**Arquivo**: `src/components/dashboard/aluno/workout-exercise-row.tsx:68`

```tsx
// ANTES
function gridCols(showDelete: boolean) {
  return showDelete
    ? 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto]'
    : 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr]';
}

// DEPOIS
type GridMode = 'readonly' | 'deletable';

function gridCols(mode: GridMode) {
  return mode === 'deletable'
    ? 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto]'
    : 'grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr]';
}

// E na chamada:
gridCols(onRemove ? 'deletable' : 'readonly');
```

---

### Fix 7: definitions.ts - Re-export (1 instância) — MINOR

**Arquivo**: `src/lib/definitions.ts:1-4`

```ts
// ANTES
import { z } from 'zod/v4';
import { Role } from '@prisma/client';

export { Role };

// DEPOIS
import { z } from 'zod/v4';
export { Role } from '@prisma/client';
```

---

### Fix 8: i18n-provider.tsx - Destructuring (1 instância) — MINOR

**Arquivo**: `src/components/providers/i18n-provider.tsx:20`

**Verificação**: Já está `const [language, setLanguageState] = useState<Language>('pt');` — possivelmente falso positivo ou SonarQube quer destructuring diferente. Verificar se é `useState` sem destructuring em outro lugar.

---

### Fix 9: middleware.ts - String.raw (1 instância) — MINOR

**Arquivo**: `src/middleware.ts:17`

```ts
// ANTES
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

// DEPOIS
String.raw`/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)`,
```

---

### Fix 10: chart.tsx - Assertions (2 instâncias) — MINOR

**Arquivo**: `src/components/ui/chart.tsx:140, 321`

Remover `as keyof typeof config` e `as string` onde a inferência já é suficiente.

---

### Fix 11: carousel.tsx - aria-label (1 instância) — MAJOR

**Arquivo**: `src/components/ui/carousel.tsx:129-131`

Já tem `aria-label="Carrossel de conteúdo"`. SonarQube quer `<section>` em vez de `<div role="region">`.

```tsx
// ANTES
<div ref={ref} role="region" aria-roledescription="carousel" aria-label="Carrossel de conteúdo">

// DEPOIS
<section ref={ref} aria-label="Carrossel de conteúdo">
```

E adicionar `aria-roledescription="carousel"` no `<section>`.

---

### Fix 12: alert.tsx - Heading Accessible (1 instância) — MAJOR

**Arquivo**: `src/components/ui/alert.tsx:30-38`

```tsx
// ANTES
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(

// DEPOIS - adicionar aria-label como fallback
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement> & { 'aria-label'?: string }>(
```

Ou simplesmente adicionar `sonar-ignore-next-line` se sempre tiver children.

---

### Fix 13: data.ts - Exception (1 instância) — MINOR

**Arquivo**: `src/lib/data.ts:125`

Já tem `sonar-ignore-next-line`. Verificar se está funcionando. Se não, adicionar comentário mais explícito.

---

## Execução

### Wave 1: Readonly Props (20 fixes)

- Arquivos: page.tsx, layout.tsx, workout-exercise-row.tsx, aluno-header.tsx, dashboard-nav.tsx
- Ação: Adicionar `Readonly<>` em todos os componentes

### Wave 2: Medium Priority (10 fixes)

- calendar.tsx: extrair Chevron
- alunos-client.tsx: espaçamento
- chart.tsx: replaceAll + condition
- form-aluno.tsx: replaceAll
- workout-exercise-row.tsx: action pattern
- carousel.tsx: section
- alert.tsx: heading
- definitions.ts: re-export
- i18n-provider.tsx: verificar
- middleware.ts: String.raw

### Wave 3: Supressões (10 false positives)

- Adicionar `// sonar-ignore-next-line` onde necessário
- command.tsx, carousel.tsx, data.ts, logger.ts

### Wave 4: Validação

- Rodar `npm run lint` e `npm run typecheck`
- Rodar SonarQube scan e comparar resultado
- Meta: 0 code smells novos

---

## Referências

- **React Docs**: "Components and Hooks must be pure" — props nunca devem ser mutadas
- **cmdk Docs**: `[cmdk-input-wrapper]` é seletor CSS oficial da lib
- **Embla Docs**: `slideRole: 'group'` é default do accessibility plugin
- **TypeScript**: `Readonly<T>` é utility type nativo para imutabilidade
