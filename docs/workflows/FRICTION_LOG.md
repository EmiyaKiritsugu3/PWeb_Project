# Friction Log

This document serves as a "Lessons Learned" ledger to track operational anomalies, architectural gotchas, and recurring bugs across the project. 

The Antigravity AI should ALWAYS consult this log at the start of a session to prevent reproducing known issues.

## Format
- **Date:** [YYYY-MM-DD]
- **Issue/Anomaly:** [Description of the problem]
- **Root Cause:** [Why it happened]
- **Workaround:** [Temporary fix, if any]
- **Prevention/Permanent Fix:** [How we fixed it or avoid it long-term]

---

## Log Entries

### Example Entry (Replace when recording real friction)
- **Date:** 2026-03-31
- **Issue/Anomaly:** Database records missing IDs when mutating.
- **Root Cause:** Zod schemas were merged without separating the input payload from the database entity, violating the `id` field requirement.
- **Workaround:** Manually mapped fields before DB injection.
- **Prevention/Permanent Fix:** Adopted the `BaseSchema` vs `EntitySchema` standard (enforced via `.agents/rules/01-zod-schemas.md`).
