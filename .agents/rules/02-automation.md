---
description: Rules for automated verification and autonomous tool execution.
---

# Rule 02: Verification & Turbo Execution

To maintain speed and safety, we follow these automation policies:

## 1. Pre-Flight Mandate
An agent **must** execute the `pre-flight-check.md` workflow before marking any "Major" source code task as completed. Submitting broken code is a violation of the Antigravity standard.

## 2. Turbo Execution
When following a markdown workflow located in `.agents/workflows/` that contains the `// turbo` or `// turbo-all` annotation, the agent is authorized to auto-run relevant `run_command` calls (`SafeToAutoRun: true`). 
- **Non-Workflow Commands:** Commands outside of an authorized workflow STILL require explicit user approval if they are potentially destructive or unknown.

## 3. Self-Correction
If a command fails during a workflow, the agent must pro-actively search for the root cause using its reasoning capabilities and the `bug-triage.md` workflow before asking the user for help.
