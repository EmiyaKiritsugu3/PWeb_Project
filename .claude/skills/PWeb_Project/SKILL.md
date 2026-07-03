```markdown
# PWeb_Project Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development conventions and workflows used in the `PWeb_Project` TypeScript codebase. It covers file naming, import/export styles, commit patterns, documentation update workflows, and testing practices. The repository is structured for academic and milestone-driven web projects, with an emphasis on clear documentation and code quality tracking.

## Coding Conventions

### File Naming
- **Style:** kebab-case
- **Example:**  
  ```
  user-profile.ts
  app-config.ts
  ```

### Import Style
- **Relative imports are used.**
- **Example:**
  ```typescript
  import { UserService } from './user-service';
  import { config } from '../config/app-config';
  ```

### Export Style
- **Named exports are preferred.**
- **Example:**
  ```typescript
  // user-service.ts
  export function getUser() { ... }
  export const USER_ROLE = 'admin';
  ```

### Commit Patterns
- **Conventional commits with prefixes (e.g., `docs:`)**
- **Example:**
  ```
  docs: update vision document with new requirements
  docs: add iteration plan for milestone 2
  ```

## Workflows

### Update Documentation Artifacts
**Trigger:** When a new project iteration is completed or new documentation is required for academic evaluation.  
**Command:** `/update-docs`

1. Edit or create documentation files in the `docs/` directory:
    - `docs/doc-visao.md`
    - `docs/doc-modelos.md`
    - `docs/doc-userstories.md`
    - `docs/doc-arquitetura.md`
    - `docs/plano-iteracao.md`
    - `docs/relatorio-testes.md`
2. Update `README.md` with new documentation links if necessary.
3. Adjust `.gitignore` to allow tracking of new documentation files if needed.
4. Commit all documentation changes together using a conventional commit message:
    ```
    docs: update user stories and architecture docs for iteration 3
    ```

### SonarQube LabENS Execution Logging
**Trigger:** When a SonarQube LabENS scan is executed and its results need to be recorded for traceability or academic purposes.  
**Command:** `/log-sonarqube`

1. Run SonarQube LabENS scan via npm or CI.
2. Update `docs/plano-iteracao.md` with execution details (e.g., execution number, date, results table).
3. Update `docs/relatorio-testes.md` with coverage results and SonarQube dashboard links.
4. Commit documentation updates using a conventional commit message:
    ```
    docs: log SonarQube execution #4 and update coverage results
    ```

## Testing Patterns

- **Test files follow the pattern:** `*.test.*`
- **Testing framework:** Not explicitly detected; check for files like `user-service.test.ts`
- **Example test file:**
  ```typescript
  // user-service.test.ts
  import { getUser } from './user-service';

  describe('getUser', () => {
    it('should return user data', () => {
      // test implementation
    });
  });
  ```

## Commands

| Command         | Purpose                                                          |
|-----------------|------------------------------------------------------------------|
| /update-docs    | Update or add documentation artifacts for milestones or reviews. |
| /log-sonarqube  | Log SonarQube LabENS scan results into documentation.            |
```
