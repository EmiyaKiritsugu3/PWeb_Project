# Project Milestones & Release Plan

**Semester Target:** 2026.1
**Last Updated:** 2026-04-17

## Iteration Plan

| Iteration               | Period          | Status          | Objectives                                                | Deliverables                                          |
| ----------------------- | --------------- | --------------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **It0 (Inception)**     | Mar 10 - Mar 26 | ✅ Complete     | Planning, studies, and tech stack definition.             | Repository setup, initial docs.                       |
| **It1 (Requirements)**  | Mar 27 - Apr 17 | ✅ Complete     | Vision, data models, user stories, full quality pipeline. | PDRs, E2E suite, CI/CD, Sentry, CRUD, Student Portal. |
| **It2 (Stabilization)** | Apr 18 - May 08 | ✅ Complete     | PR #69 + #70 merged, CI 15/15 green, v0.5.0 released.    | Stable main branch, CI fully green, v0.5.0 release.   |
| **It3 (AI & Workouts)** | May 09 - May 29 | ⏳ Planned      | Workout management and AI generation polish.              | Gemini Genkit integrations.                           |
| **It4 (Student App)**   | May 30 - Jun 19 | ⏳ Planned      | Student Portal and Gamification features.                 | Mobile-first portal, feedback.                        |
| **It5 (Wrap-up)**       | Jun 20 - Jul 10 | ⏳ Planned      | Final QA, bug fixes, and closing documentation.           | Complete MVP System.                                  |

### It1 Delivered (ahead of original scope)

Everything originally planned for It1–It2 was delivered during It1:

- ✅ Admin login + role-based access (GERENTE / RECEPCIONISTA / INSTRUTOR)
- ✅ Student login (`/aluno`) with separate session
- ✅ Admin dashboard: student CRM, financial routes, AI workout generator
- ✅ Student portal: workout execution, meus-treinos, gamification (XP, levels, streaks)
- ✅ ESLint 0 errors, TypeScript strict, 18/18 unit tests, 15/15 E2E scenarios
- ✅ CI/CD pipeline (GitHub Actions: lint + test + E2E)
- ✅ Sentry v10 (Next.js 15), structured Logger, privacy-first Replay
- ✅ Ops documentation: RUNBOOK, SLOs, THREAT-MODEL, INCIDENT-RESPONSE

### It2 Delivered

| Task                                              | Priority | Status          |
| ------------------------------------------------- | -------- | --------------- |
| Merge PR #69 (`fix/e2e-auth-stabilization`)       | P1       | ✅ Merged        |
| Merge PR #70 (`chore/update-dependencies`)        | P1       | ✅ Merged        |
| E2E job green in CI (15/15)                       | P1       | ✅ Confirmed     |
| Set `NEXT_PUBLIC_SENTRY_DSN` in production        | P1       | ✅ Done (2026-04-18, via Vercel CLI) |

---

## Release Schedule

| Release          | Target Date | Status        | Scope                                                                      |
| ---------------- | ----------- | ------------- | -------------------------------------------------------------------------- |
| **v0.1.0**       | Apr 17      | ✅ Released   | Documentation, scaffolding, CI/CD, database schema, full feature set.     |
| **v0.5.0**       | Apr 18      | ✅ Released   | CI fully green (15/15 E2E), PR #69 + #70 merged, deps updated.            |
| **v1.0.0 (MVP)** | Jul 10      | ⏳ Planned    | Complete system including Dashboard, Student Portal, and AI integrations.  |
