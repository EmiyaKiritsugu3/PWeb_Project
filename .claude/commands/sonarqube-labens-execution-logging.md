---
name: sonarqube-labens-execution-logging
description: Workflow command scaffold for sonarqube-labens-execution-logging in PWeb_Project.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /sonarqube-labens-execution-logging

Use this workflow when working on **sonarqube-labens-execution-logging** in `PWeb_Project`.

## Goal

Logs the execution and results of SonarQube LabENS code quality scans, including coverage and quality gate results, into project documentation.

## Common Files

- `docs/plano-iteracao.md`
- `docs/relatorio-testes.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Run SonarQube LabENS scan via npm or CI.
- Update docs/plano-iteracao.md with execution details (e.g., execution number, date, results table).
- Update docs/relatorio-testes.md with coverage results and SonarQube dashboard links.
- Commit documentation updates.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.