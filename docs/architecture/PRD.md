# Aegis OS Product Requirements Document

## 1. Problem Definition
The current physical education application requires a modern, stable, secure management UI that handles user authentication, student analytics, workout routines, and gamified progress.

## 2. Core Value Pillars
- **Security & Authorization:** Role-based access exclusively controlling Manager vs. Student routes. Use Zod parsing + Supabase Row Level Security logic. 
- **Premium User Experience:** High-visibility analytics with dark-mode aesthetic (electric blue accents). Fast client navigation leveraging React transitions and Server Components.
- **Gamification Mechanics:** Tracking student streaks, leveling formulas based on training, and showing metric progression across months.

## 3. Product Roadmap
The execution is structured into explicit phases:

### Phase 1: Authentication & Layout Scaffold [DONE]
- Integrate Clerk or Supabase Auth.
- Create `/manager` layout and protected routes.
- Implement sidebar and main view topology matching `DESIGN.md`.

### Phase 2: Core Data Engine (Students & Workouts) [DONE]
- Prisma Schema integration (Alunos, Treinos).
- Standardized CRUD API boundaries (Server Actions).
- Dashboard data hydration for total enrollments and revenue.

### Phase 3: Gamification & Engagement [TODO]
- Level computation algorithms.
- Progressive streak tracking.
- Client-side animations testing progression bars filling up.

### Phase 4: Polish & Integration Deployment [TODO]
- End-to-End Vercel staging deploy.
- Vercel performance and Edge-node optimizations matching Vercel standard configs.
- AI telemetry tracing through Genkit setup.
