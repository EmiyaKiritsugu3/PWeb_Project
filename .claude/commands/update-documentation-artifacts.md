---
name: update-documentation-artifacts
description: Workflow command scaffold for update-documentation-artifacts in PWeb_Project.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-documentation-artifacts

Use this workflow when working on **update-documentation-artifacts** in `PWeb_Project`.

## Goal

Updates or adds documentation artifacts required for project milestones or academic deliverables, such as vision documents, architecture, user stories, iteration plans, and test reports.

## Common Files

- `docs/doc-visao.md`
- `docs/doc-modelos.md`
- `docs/doc-userstories.md`
- `docs/doc-arquitetura.md`
- `docs/plano-iteracao.md`
- `docs/relatorio-testes.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit or create documentation files in the docs/ directory (e.g., doc-visao.md, doc-modelos.md, doc-userstories.md, doc-arquitetura.md, plano-iteracao.md, relatorio-testes.md).
- Update README.md with new documentation links if necessary.
- Adjust .gitignore to allow tracking of new documentation files if needed.
- Commit all documentation changes together.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.