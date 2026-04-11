# Service Level Objectives — Five Star Academy

**Last Updated**: 2026-04-11
**Review Cadence**: Monthly

---

## SLO Definitions

### SLO-01: Authentication Availability

| Metric              | Target          | Measurement                               |
| ------------------- | --------------- | ----------------------------------------- |
| Login success rate  | ≥ 99.5% / month | Successful Supabase auth / total attempts |
| Login latency (p95) | < 2s            | Time from submit to dashboard redirect    |

**Why**: Auth failure = zero app usability. 99.5% allows ~3.6h downtime/month.

**Alert**: Sentry error rate > 5 auth errors/min → P1 incident.

---

### SLO-02: Admin Dashboard Availability

| Metric                       | Target        | Measurement                                 |
| ---------------------------- | ------------- | ------------------------------------------- |
| Page load success rate       | ≥ 99% / month | HTTP 200 / total requests on `/dashboard/*` |
| Dashboard load latency (p95) | < 1.5s        | Time to interactive (LCP proxy)             |

**Why**: Admins use dashboard daily for operations. Degradation blocks gym management.

---

### SLO-03: Student Portal Availability

| Metric                                     | Target        | Measurement                    |
| ------------------------------------------ | ------------- | ------------------------------ | -------------------------------------------------------------- | -------------------------------- |
| Portal load success rate                   | ≥ 99% / month | HTTP 200 / total on `/aluno/*` |
| Server error exposes stack trace to client | Medium        | Medium                         | Next.js hides stack in production; Sentry captures server-side | ✅ Mitigated (Sentry active)     |
| CPF/email logged to stdout in plain text   | Medium        | High                           | `beforeSend` in Sentry config scrubs PII fields                | ✅ Mitigated (beforeSend active) |

---

### SLO-04: AI Workout Generation

| Metric                   | Target        | Measurement                                 |
| ------------------------ | ------------- | ------------------------------------------- |
| Generation success rate  | ≥ 95% / month | Successful Genkit response / total requests |
| Generation latency (p95) | < 8s          | Time from submit to workout display         |

**Why**: AI is an enhancement (not foundation per Principle IV). 95% allows degraded fallback.

**Alert**: > 3 consecutive failures → log to Sentry with structured context.

---

### SLO-05: CI Pipeline

| Metric                  | Target        | Measurement                          |
| ----------------------- | ------------- | ------------------------------------ |
| Build success rate      | ≥ 98% / month | Green CI runs / total runs on `main` |
| Total CI duration (p95) | < 5 min       | From push to all jobs green          |

---

## Error Budget

| SLO                   | Target | Monthly Budget (minutes) |
| --------------------- | ------ | ------------------------ |
| SLO-01 Auth           | 99.5%  | ~216 min                 |
| SLO-02 Dashboard      | 99%    | ~432 min                 |
| SLO-03 Student Portal | 99%    | ~432 min                 |
| SLO-04 AI Generation  | 95%    | ~2160 min                |
| SLO-05 CI Pipeline    | 98%    | ~864 min                 |

**Policy**: If error budget for SLO-01 or SLO-02 is > 50% consumed mid-month →
freeze non-critical feature work until budget recovers.

---

## Gaps & Tooling

| SLO    | Current Tooling                   | Status      |
| ------ | --------------------------------- | ----------- |
| SLO-01 | Supabase Auth logs + Sentry       | ✅ Tracking |
| SLO-02 | Sentry Performance Monitoring     | ✅ Active   |
| SLO-03 | Sentry Performance Monitoring     | ✅ Active   |
| SLO-04 | Genkit + Sentry User Traceability | ✅ Unified  |
| SLO-05 | GitHub Actions badges             | ✅ Active   |

**Update**: Sentry is now fully configured for Next.js 15 (v10) with user traceability on both client and server. Latency metrics are captured automatically via `src/instrumentation-client.ts`. Transaction tracing includes Prisma database spans. Linked to project: `smartmanagementesystem`.
