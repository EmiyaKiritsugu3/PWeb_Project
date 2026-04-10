# Threat Model — Five Star Academy

**Method**: STRIDE
**Last Updated**: 2026-04-10
**Scope**: Web application — Admin Dashboard + Student Portal

---

## Assets

| Asset                                     | Sensitivity | Description                     |
| ----------------------------------------- | ----------- | ------------------------------- |
| Student personal data (CPF, email, phone) | High        | PII — legal exposure if leaked  |
| Financial data (pagamentos, planos)       | High        | Business-critical               |
| Authentication tokens (Supabase JWT)      | Critical    | Full account takeover if stolen |
| Admin credentials                         | Critical    | Full system access              |
| AI-generated workout data                 | Low         | Not sensitive                   |
| Prisma DB connection string               | Critical    | Direct DB access                |

---

## STRIDE Analysis

### S — Spoofing (Identity Forgery)

| Threat                                                   | Likelihood | Impact   | Mitigation                                                                  | Status       |
| -------------------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------------- | ------------ |
| Attacker forges student JWT to access admin dashboard    | Low        | Critical | Supabase validates JWT on every SSR request; `requireRole()` checks DB role | ✅ Mitigated |
| Attacker brute-forces admin password                     | Medium     | High     | Supabase rate-limits auth endpoints; no custom auth                         | ✅ Mitigated |
| Student accesses another student's data by guessing UUID | Low        | Medium   | All queries filter by authenticated user ID from JWT                        | ✅ Mitigated |

### T — Tampering (Data Modification)

| Threat                                                        | Likelihood | Impact | Mitigation                                                    | Status       |
| ------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------- | ------------ |
| Client modifies Server Action parameters to bypass role check | Medium     | High   | `requireRole()` called server-side before any DB write        | ✅ Mitigated |
| Direct DB write bypassing Prisma validation                   | Low        | High   | DB not exposed; all access via Prisma Server Actions          | ✅ Mitigated |
| Tampering with Zod-validated form inputs via API              | Low        | Medium | Zod validates at boundary; unvalidated input never reaches DB | ✅ Mitigated |

### R — Repudiation (Deny Actions)

| Threat                                          | Likelihood | Impact | Mitigation                                                                | Status           |
| ----------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- | ---------------- |
| Admin denies creating/deleting a student record | Low        | Medium | Supabase Auth logs all sign-in events; no application-level audit log yet | ⚠️ Partial       |
| No audit trail for financial changes            | Medium     | High   | No `auditLog` table — gap                                                 | ❌ Not mitigated |

**Action Item**: Add `AuditLog` table for financial mutations (future RFC).

### I — Information Disclosure (Data Leak)

| Threat                                        | Likelihood | Impact   | Mitigation                                                          | Status                        |
| --------------------------------------------- | ---------- | -------- | ------------------------------------------------------------------- | ----------------------------- |
| Server error exposes stack trace to client    | Medium     | Medium   | Next.js hides stack in production; Sentry captures server-side      | ✅ Mitigated (Sentry pending) |
| CPF/email logged to stdout in plain text      | Medium     | High     | `beforeSend` in Sentry config scrubs PII fields                     | ✅ Planned (T055)             |
| `.env` committed with secrets                 | Low        | Critical | `.gitignore` covers `.env*`; `.env.example` uses placeholders       | ✅ Mitigated                  |
| DB connection string exposed in client bundle | Low        | Critical | Prisma only runs server-side; `DIRECT_URL` never in `NEXT_PUBLIC_*` | ✅ Mitigated                  |

### D — Denial of Service

| Threat                                  | Likelihood | Impact | Mitigation                                                             | Status       |
| --------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------- | ------------ |
| Flooding AI workout generation endpoint | Medium     | Medium | Genkit calls wrapped in try/catch; no rate limiting yet                | ⚠️ Partial   |
| Large file upload via form              | Low        | Low    | No file uploads in current feature set                                 | N/A          |
| DB connection pool exhaustion           | Low        | High   | Prisma singleton pattern (`src/lib/prisma.ts`) prevents pool explosion | ✅ Mitigated |

**Action Item**: Add rate limiting to AI endpoints (future RFC).

### E — Elevation of Privilege

| Threat                                               | Likelihood | Impact   | Mitigation                                                              | Status       |
| ---------------------------------------------------- | ---------- | -------- | ----------------------------------------------------------------------- | ------------ |
| RECEPCIONISTA accesses GERENTE-only financial routes | Medium     | High     | Middleware + page guard + `requireRole()` (3-layer defense)             | ✅ Mitigated |
| Student accesses admin dashboard                     | Medium     | Critical | Separate session cookies; middleware redirects `/dashboard` to `/login` | ✅ Mitigated |
| INSTRUTOR creates or deletes student records         | Low        | High     | Server Actions check role before any write                              | ✅ Mitigated |

---

## Risk Summary

| Risk Level       | Count | Examples                                        |
| ---------------- | ----- | ----------------------------------------------- |
| ✅ Mitigated     | 14    | Role checks, Zod validation, Prisma server-side |
| ⚠️ Partial       | 2     | Repudiation (no audit log), DoS on AI endpoint  |
| ❌ Not mitigated | 1     | Financial audit trail missing                   |

## Recommended Next Actions

1. **RFC**: Add `AuditLog` table for financial mutations (addresses R gap)
2. **Rate limiting**: Add middleware rate limit on `/api/ai/*` routes (addresses D gap)
3. **Sentry PII scrubbing**: Implement `beforeSend` in T055 (addresses I gap)
