# Incident Response Runbook — Five Star Academy

**Last Updated**: 2026-04-10

---

## Severity Levels

| Level | Definition                                      | Response Time | Example             |
| ----- | ----------------------------------------------- | ------------- | ------------------- |
| P1    | Total outage — no user can login                | Immediate     | Auth service down   |
| P2    | Partial degradation — feature broken for subset | < 1h          | AI generation fails |
| P3    | Minor impact — cosmetic or non-critical         | < 24h         | Chart not rendering |

---

## Detection

### Signals to Watch

- Sentry error rate spike (> 10 errors/min on same route)
- Supabase dashboard: DB CPU > 80% or connection pool near limit
- GitHub Actions CI failure on `main`
- User report via GitHub Issue

### Where to Look First

| Symptom                  | Check                                             |
| ------------------------ | ------------------------------------------------- |
| Login broken             | Supabase Auth logs → Dashboard → Logs             |
| DB errors                | Supabase → Database → Logs                        |
| Build failure            | GitHub Actions → CI workflow → step output        |
| 500 errors in production | Sentry → Issues → Latest                          |
| AI generation failing    | Check `GEMINI_API_KEY` env var; check Genkit logs |

---

## Response Procedure

### Step 1 — Triage (< 5 min)

1. Identify severity (P1 / P2 / P3)
2. Determine affected users and features
3. Check if recent deploy caused the issue: `git log --oneline -5`

### Step 2 — Contain

**If a bad deploy caused it:**

```bash
# Revert last commit (safe — creates new commit)
git revert HEAD
git push origin main

# Or roll back Vercel deployment:
# Vercel Dashboard → Deployments → Previous → Promote to Production
```

**If DB migration is the cause:**

```bash
# Check migration status
npx prisma migrate status

# Roll back last migration (if reversible)
npx prisma migrate resolve --rolled-back <migration_name>
```

**If Supabase branch is the cause:**

```bash
# Switch app to production DB temporarily
# Update NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env
```

### Step 3 — Fix

1. Create hotfix branch: `git checkout -b hotfix/NNN-description`
2. Apply minimal fix
3. Run: `npm run lint && npm run test && npm run build`
4. Open PR with `[HOTFIX]` prefix in title
5. Merge and deploy

### Step 4 — Validate

- [ ] Error no longer appears in Sentry
- [ ] Affected feature works end-to-end
- [ ] No regression: `npm run e2e`

### Step 5 — Document

- Open postmortem from `docs/process/POSTMORTEM-TEMPLATE.md`
- Complete within 48h of resolution
- Add action items to backlog

---

## Rollback Checklist

| Action                 | Command                              |
| ---------------------- | ------------------------------------ |
| Revert last commit     | `git revert HEAD && git push`        |
| Revert Vercel deploy   | Vercel Dashboard → promote previous  |
| Restore DB from backup | Supabase Dashboard → Backups         |
| Reset staging branch   | `mcp__supabase__reset_branch`        |
| Disable AI feature     | Set `AI_ENABLED=false` in Vercel env |

---

## Contacts

| Role              | Responsibility                     |
| ----------------- | ---------------------------------- |
| Project owner     | All P1 decisions                   |
| Developer on call | First responder for all severities |
