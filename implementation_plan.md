# Implementation Plan: Institutionalizing Agnostic Sentinel Protocol (Final Hardening) (PID-SENTINEL)

## 🛡️ Sentinel Baseline Audit

- **Status**: ❌ REGRESSED
- **Detected Hazards**:

```

> nextn@1.0.0 pre-flight
> npm run typecheck && npm run lint && npm run format:check && npm test


> nextn@1.0.0 typecheck
> tsc --noEmit


> nextn@1.0.0 lint
> eslint src


/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/app/aluno/dashboard/dashboard-client.tsx
  56:9  warning  Unexpected console statement  no-console
  75:7  warning  Unexpected console statement  no-console

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/app/aluno/meus-treinos/meus-treinos-client.tsx
  158:7   warning  Unexpected console statement  no-console
  161:7   warning  Unexpected console statement  no-console
  205:13  warning  Unexpected console statement  no-console
  216:9   warning  Unexpected console statement  no-console
  220:7   warning  Unexpected console statement  no-console

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/app/dashboard/dev/page.tsx
  30:7  warning  Unexpected console statement  no-console

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/app/dashboard/treinos/treinos-client.tsx
  408:7   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
  409:56  error    Unexpected any. Specify a different type                                                               ts/no-explicit-any
  419:7   warning  Unexpected console statement                                                                           no-console

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/components/dashboard/alunos/data-table.tsx
  46:17  warning  Compilation Skipped: Use of incompatible library

This API returns functions which cannot be memoized without leading to stale UI. To prevent this, by default React Compiler will skip memoizing this component/hook. However, you may see issues if values from this API are passed to other components/hooks that are memoized.

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/components/dashboard/alunos/data-table.tsx:46:17
  44 |   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  45 |
> 46 |   const table = useReactTable({
     |                 ^^^^^^^^^^^^^ TanStack Table's `useReactTable()` API returns functions that cannot be memoized safely
  47 |     data,
  48 |     columns,
  49 |     getCoreRowModel: getCoreRowModel(),  react-hooks/incompatible-library

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/lib/auth.test.ts
   64:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
   65:52  error    Unexpected any. Specify a different type                                                               ts/no-explicit-any
   74:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
   75:52  error    Unexpected any. Specify a different type                                                               ts/no-explicit-any
   83:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
   84:52  error    Unexpected any. Specify a different type                                                               ts/no-explicit-any
   92:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
   93:52  error    Unexpected any. Specify a different type                                                               ts/no-explicit-any
  101:5   warning  Unused eslint-disable directive (no problems were reported from '@typescript-eslint/no-explicit-any')
  102:52  error    Unexpected any. Specify a different type                                                               ts/no-explicit-any

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/lib/auth.ts
  29:5  warning  Unexpected console statement  no-console

/home/emiyakiritsugu/Projetos_Antigravity/PWeb_Project/src/lib/data.ts
   25:5  warning  Unexpected console statement  no-console
   37:5  warning  Unexpected console statement  no-console
   61:5  warning  Unexpected console statement  no-console
   90:5  warning  Unexpected console statement  no-console
  117:7  warning  Unexpected console statement  no-console
  137:5  warning  Unexpected console statement  no-console

✖ 29 problems (6 errors, 23 warnings)
  0 errors and 6 warnings potentially fixable with the `--fix` option.


```

## 🎯 Sovereign Rationale

> **Architect**: [Role: Lead AI Architect]
> **Goal**: Universalize the Sentinel Protocol (v1.4.1) by removing agent-branding, establishing it as an agnostic AI governance framework, and completing the hardening of PR #61 through rigorous server-side validation, Sentry instrumentation, and dependency resolution to ensure project-wide architectural integrity.
> **Justification**:

## 🔍 Dialectical Audit (Elite Rigor)

> [!CAUTION]
> **Auditor Critique**: iEstablish a deterministic, agent-agnostic baseline for AI collaboration. By decoupling the protocol from specific orchestrator branding, we ensure that the project's quality gates are enforced regardless of which model or interface is interacting with the codebase. This creates a resilient 'immune system' for the repository. :wq
> **Mitigation Strategy**: [IMPLEMENTATION MUST ADDRESS THIS]

## 🗺️ Impact Heatmap

- **Epicenter**:
  - [MODIFY] .env.example
  - [MODIFY] .sentryclirc
  - [MODIFY] .specify/memory/constitution.md
  - [MODIFY] AGENTS.md
  - [MODIFY] CHANGELOG.md
  - [MODIFY] CLAUDE.md
  - [MODIFY] README.md
  - [MODIFY] docs/.obsidian/graph.json
  - [MODIFY] docs/.obsidian/workspace.json
  - [MODIFY] docs/CURRENT-STATE.md
  - [MODIFY] docs/LAST-TRANSFER.md
  - [MODIFY] docs/decisions/ADR-003-infrastructure-observability-hardening.md
  - [MODIFY] docs/observability/SLOS.md
  - [MODIFY] docs/process/ELITE-WORKFLOW.md
  - [MODIFY] docs/process/TRANSFER-SOP.md
  - [MODIFY] docs/security/THREAT-MODEL.md
  - [MODIFY] eslint.config.mjs
  - [MODIFY] instrumentation-client.ts
  - [MODIFY] instrumentation.ts
  - [MODIFY] next.config.ts
  - [MODIFY] package-lock.json
  - [MODIFY] package.json
  - [MODIFY] scripts/generate-transfer.ts
  - [MODIFY] scripts/invariants.json
  - [MODIFY] sentry.edge.config.ts
  - [MODIFY] sentry.server.config.ts
  - [MODIFY] src/ai/flows/workout-generator-flow.ts
  - [MODIFY] src/app/aluno/meus-treinos/meus-treinos-client.tsx
  - [MODIFY] src/app/dashboard/alunos/alunos-client.tsx
  - [MODIFY] src/app/design-system.css
  - [MODIFY] src/app/globals.css
  - [MODIFY] src/app/layout.tsx
  - [MODIFY] src/components/WorkoutSession.tsx
  - [MODIFY] src/components/dashboard/alunos/form-matricula.test.tsx
  - [MODIFY] src/components/dashboard/alunos/form-matricula.tsx
  - [MODIFY] src/components/providers/auth-provider.tsx
  - [MODIFY] src/hooks/use-toast.ts
  - [MODIFY] src/hooks/use-workout-tracker.ts
  - [MODIFY] src/instrumentation-client.ts
  - [MODIFY] src/lib/actions/alunos.ts
  - [MODIFY] src/lib/actions/financeiro.ts
  - [MODIFY] src/lib/actions/treinos.ts
  - [MODIFY] src/lib/constants.ts
  - [MODIFY] src/lib/prisma.ts
  - [MODIFY] src/utils/supabase/server.ts
- **Ripples**: [Audit 1st/2nd degree consumers]

## 🧬 Proof of State (Verification Sovereignty)

| Target File | Assertion | Verification Tool | Proof ID |
| ----------- | --------- | ----------------- | -------- |
| [Path]      | [Claim]   | [Tool]            | [Hash]   |

---

**Protocol Status**: High Rigor (Universal Standard v1.4.1)
**Timestamp**: 2026-04-11T18:32:36.193Z
