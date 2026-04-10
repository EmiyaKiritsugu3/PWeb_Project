# Postmortem: [Incident Title]

**Date**: YYYY-MM-DD
**Duration**: Xh Ym (HH:MM → HH:MM UTC)
**Severity**: P1 (total outage) | P2 (partial degradation) | P3 (minor impact)
**Author**: [Name]
**Status**: Draft | In Review | Final

---

## Summary

2-3 sentences. What happened, what broke, who was affected, how it was resolved.

## Timeline

| Time (UTC) | Event                                     |
| ---------- | ----------------------------------------- |
| HH:MM      | [First signal — alert, user report, etc.] |
| HH:MM      | [Investigation started]                   |
| HH:MM      | [Root cause identified]                   |
| HH:MM      | [Fix deployed]                            |
| HH:MM      | [Incident resolved]                       |

## Impact

- **Users affected**: [number or %]
- **Features affected**: [list]
- **Data loss**: Yes / No — [detail]
- **Revenue impact**: [if applicable]

## Root Cause

**Primary**: [The direct technical cause]

**Contributing factors**:

1. [Factor 1]
2. [Factor 2]

**Why it wasn't caught earlier**:

- [Missing test / alert / review step]

## What Went Well

- [Thing 1 that helped contain or resolve the incident]
- [Thing 2]

## What Went Poorly

- [Thing 1 that slowed response]
- [Thing 2]

## Action Items

| Action            | Owner  | Due        | Status |
| ----------------- | ------ | ---------- | ------ |
| [Specific fix]    | [Name] | YYYY-MM-DD | Open   |
| [Add test for X]  | [Name] | YYYY-MM-DD | Open   |
| [Add alert for Y] | [Name] | YYYY-MM-DD | Open   |

## Lessons Learned

1-3 key takeaways that apply beyond this incident.
