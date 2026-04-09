# PDR-001: Core System & Requirements (SmartManagementSystem)

**Date:** 2026-04-08
**Status:** Approved
**Authors:** José Inamar de Medeiros Júnior, Taciano

---

## 1. Product Vision

The **SmartManagementSystem (SMS)** is a modern Single-Page Application (SPA) designed to optimize the daily operations of Five Star Academy. It replaces inefficient manual processes with two integrated environments:

1. **Management Dashboard:** For gym staff (receptionists and managers) to control enrollments, subscriptions, financial defaults, and prescribe workouts.
2. **Student Portal:** A gamified environment where students can track their daily activities.

**Key Technological Differentiator:** Integration with AI (Google Genkit/Gemini) to automatically generate optimized workout routines and provide post-workout motivational feedback, increasing student engagement.

## 2. User Personas & Roles

Access and capabilities are strictly scoped by the user's role:

| Persona          | Description & Capabilities                                                                                               |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Manager**      | Full unrestricted access. Can view global financial data, manage subscription plans, delete students, and manage staff.  |
| **Receptionist** | Focuses on daily workflow. Can register students, update enrollments, record payments, and check default status.         |
| **Instructor**   | Physical education professional. Focuses on prescribing, editing, and generating AI-assisted workouts.                   |
| **Student**      | End-user. Limited to viewing their own data: enrollment status, daily workout routine, and interacting with AI feedback. |

## 3. Core Entities & Functional Requirements

### RF01 - Staff Management (Funcionário)

- **RF01.01:** Insert new staff (name, email, role). (Actor: Manager)
- **RF01.02:** List staff with role/name filters. (Actor: Manager)
- **RF01.03:** Edit staff role and name. (Actor: Manager)
- **RF01.04:** Delete/revoke staff access. (Actor: Manager)

### RF02 - Subscription Plans (Plano)

- **RF02.01:** Insert new plan (name, price, duration in days). (Actor: Manager)
- **RF02.02:** List active plans. (Actor: Manager, Receptionist)
- **RF02.03:** Update prices and names. (Actor: Manager)
- **RF02.04:** Inactivate plan (soft delete to prevent new enrollments). (Actor: Manager)

### RF03 - Student Management (Aluno)

- **RF03.01:** Register student (base data + profile photo). (Actor: Receptionist, Manager)
- **RF03.02:** List students sortable by name, filterable by CPF. (Actor: All Staff)
- **RF03.03:** Update phone, photo, or biometrics. (Actor: Receptionist, Manager)
- **RF03.04:** Permanently delete student data. (Actor: Manager)

### RF04 - Enrollment Management (Matrícula)

- **RF04.01:** Generate enrollment (link plan to student, calculate expiration). (Actor: Receptionist, Manager)
- **RF04.02:** List enrollment history. (Actor: Receptionist, Manager)
- **RF04.03:** Calculate default status (Automated Job: mark EXPIRED if current date > expiration). (Actor: System)
- **RF04.04:** Renew enrollment (extend expiration upon payment). (Actor: Receptionist, Manager)

### RF05 - Payment Processing (Pagamento)

- **RF05.01:** Record payment (amount, date, method: PIX, Cash, Card). (Actor: Receptionist, Manager)
- **RF05.02:** List payment history by student CPF and date. (Actor: Receptionist, Manager, Student)

### RF06 - Workout Management (Treino)

- **RF06.01:** Manual Workout Creation (objective, exercises). (Actor: Instructor)
- **RF06.02:** AI-Generated Workout (send parameters: level, days, focus → receive structured routine). (Actor: Instructor)
- **RF06.03:** List daily schedule on student portal. (Actor: Student, Instructor)
- **RF06.04:** Delete/Clear workout schedule. (Actor: Instructor)
- **RF06.05:** AI Feedback (student checks off workout → AI generates motivational quote). (Actor: Student, System)

### RF07 - Exercise Management (Exercício)

- **RF07.01:** Insert exercise into workout (name, sets, reps, notes). (Actor: Instructor)
- **RF07.02:** Edit reps and biomechanical notes. (Actor: Instructor)
- **RF07.03:** Remove exercise from workout. (Actor: Instructor)

### RF08 - System Integrations

- **RF08.01:** Unified Login with conditional routing (`/dashboard` vs `/aluno`).
- **RF08.02:** Turnstile API (expose endpoint for IoT turnstile to verify ACTIVE enrollment via biometrics).

### RF09 - Advanced Database Operations (PostgreSQL)

- **RF09.01:** Managerial Views (CTEs for financial dashboard).
- **RF09.02:** Automated Triggers (`AFTER INSERT/UPDATE` to handle expiration status).
- **RF09.03:** TCL Transactions (`BEGIN/COMMIT/ROLLBACK`) for atomic Student+Enrollment+Payment creation.

## 4. Non-Functional Requirements (NFR)

- **RNF001 - Frontend Performance:** Next.js App Router must render pages < 1000ms (RSC + Client Components).
- **RNF002 - Relational Integrity:** PostgreSQL accessed strictly via Prisma ORM. Hard referential integrity (e.g., cannot delete student with active payments).
- **RNF003 - Modern Design:** TailwindCSS + Shadcn/UI for a clean, responsive interface.
- **RNF004 - Mobile-First:** Student Portal must emulate a native webapp layout for gym floor usage.
- **RNF005 - Safe Prompt Engineering:** Genkit LLM outputs must be parsed via Zod validators to ensure strict JSON schemas.

## 5. User Stories

| ID       | Title                 | Description                                                            | Priority  |
| -------- | --------------------- | ---------------------------------------------------------------------- | --------- |
| **US00** | User Authentication   | As a user, I want to authenticate to access my respective area safely. | Essential |
| **US01** | Student Management    | As a manager, I want to register and manage students.                  | High      |
| **US02** | Plan Management       | As a manager, I want to manage subscription plans.                     | Medium    |
| **US03** | Workout Prescription  | As an instructor, I want to create workout routines manually.          | High      |
| **US04** | AI Workout Generation | As an instructor, I want AI to suggest routines to speed up my work.   | Medium    |
| **US05** | Student Portal        | As a student, I want to view my daily workout on my phone.             | High      |
| **US06** | Motivational Feedback | As a student, I want AI feedback upon workout completion.              | Low       |
| **US07** | Financial Dashboard   | As a manager, I want to view financial KPIs to track revenue.          | Medium    |

### Detailed: US00 - User Authentication

- **Rules:** Supabase Auth users must exist in Prisma DB. Next.js Middleware checks roles on every request. Unauthorized access redirects to `/login`. Lockout after successive failures.
- **Data Models:** `auth.users` (Supabase) linked to `public.funcionarios` / `public.alunos` (PostgreSQL).
- **Acceptance Criteria:** Valid credentials login successfully; invalid are denied; routing sends Managers to `/dashboard` and Students to `/aluno`; logout invalidates server session.

## 6. Known Risks

1. **AI Hallucinations (JSON injection):**
   - _Mitigation:_ Rigorous System Prompting and strict Zod schema validation on Genkit outputs.
2. **Next.js ORM Complexity:**
   - _Mitigation:_ Prisma ORM adopted for type-safe relations and migrations.
3. **Auth Orchestration:**
   - _Mitigation:_ Focus shifted to PostgreSQL relational roles combined with Supabase SSR Auth, dropping Firebase.
