---
description: Automating the ledger synchronization at the end of a session.
---

# Workflow: End-Session Sync

This workflow handles the "administrative" updates to keep the project's documentation current with the actual state of the code.

## 1. Metadata Analysis
- Review the last 10-20 tool calls and file changes in the current session.
- Identify major milestones reached (e.g., "Phase 2 reached DONE").

## 2. Status Update
- Update `PROJECT_STATUS.md` with the latest metadata, build status, and health metrics.
- Ensure the "Next Steps" reflect the actual remaining backlog items.

## 3. Changelog Maintenance
- Append a concise entry to `CHANGELOG.md` under the `[Unreleased]` or current version header.
- Categorize changes: Added, Fixed, Changed, Removed.

## 4. Friction Sync
- If any new architectural gotchas were documented in `friction-log.md`, ensure they have clear descriptions for future sessions.
