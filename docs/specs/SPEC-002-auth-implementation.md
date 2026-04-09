# SPEC-002: Implementation Plan for US00 (Authentication)

**Date:** 2026-04-08
**Status:** In Progress
**Context:** PDR-001 (US00)

## Implementation Plan

### 1. Middleware Protection (src/middleware.ts / src/utils/supabase/middleware.ts)

- Modify `updateSession` to verify authentication status (`supabase.auth.getUser()`).
- Define protected route patterns (`/dashboard/:path*`, `/aluno/:path*`).
- Redirect unauthorized users to `/login`.
- Verify role/profile existence in the database (Prisma) to ensure only authorized users access protected routes.

### 2. Login Page (src/app/login/page.tsx)

- Implement UI using Shadcn/UI Form.
- Implement server-side action (`src/app/actions/auth.ts`) to handle login via Supabase.
- Handle success/error states as defined in PDR-001 (US00).

### 3. Role-Based Redirection

- Implement a helper function to determine route based on user profile role (`dashboard` for staff, `aluno` for students).
- Use this helper in the login action and middleware check.

## Verification

- Test unauthorized access to `/dashboard` (expect redirect).
- Test login with valid staff credential (expect redirect to `/dashboard`).
- Test login with valid student credential (expect redirect to `/aluno`).
