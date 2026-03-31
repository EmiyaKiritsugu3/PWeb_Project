# Git Workflow & Atomic Commit Rules

## 1. Commit Prefix Standard
All agents and developers MUST use standard semantic prefixes:
- `feat:` for a new feature implementation or enhancement.
- `fix:` for fixing a bug or regression.
- `ui:` for design, CSS, or visual markup that doesn't alter logic.
- `docs:` for updates to PRD, skills, rules, README, or markdown logs.
- `refactor:` for restructuring code without functional changes.
- `chore:` for updating dependencies, build scripts, or configurations.
- `test:` for creating or modifying automated tests.

## 2. Atomic Commits
- You must make **atomic commits**. Never bundle multiple disparate changes across unrelated components into a single commit.
- After successfully resolving a task block, verify the changes and commit it immediately with a descriptive message.
- If you finish `aegis-design.md`, commit it. If you finish `SKILLS.md`, commit it separately. This prevents massive diffs and ensures reliable rollbacks.
