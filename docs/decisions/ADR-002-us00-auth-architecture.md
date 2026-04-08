# ADR-002: US00 Authentication Architecture

**Date:** 2026-04-08
**Status:** Accepted
**Branch:** feat/us00-auth-flow
**Relates to:** PDR-001 (US00), SPEC-002-auth-implementation

---

## Context

The existing `src/app/login/page.tsx` was a `'use client'` component that called `supabase.auth.signInWithPassword` directly on the client side. It also contained an insecure auto-`signUp` block that created admin accounts automatically when login credentials were invalid — a direct violation of the project's architecture constraints.

The system's auth architecture must follow:

- Supabase Auth via SSR — never client-side auth for protected routes
- All DB access via Server Actions — never expose Supabase or Prisma to the client

## Decision

### 1. Server Action (`src/app/actions/auth.ts`)

All authentication logic moved server-side via a `'use server'` action:

- Input validated with Zod (`email`, `password`) before any Supabase call
- `supabase.auth.signInWithPassword` called on the server using `createClient()` (SSR client)
- After successful auth, queries `public.funcionarios` table by `auth.user.id` to determine role
- Redirects to `/dashboard` if a `funcionarios` profile exists, otherwise to `/aluno`
- Returns a typed `{ error: string }` state on failure — never throws to the client

### 2. Login Page (`src/app/login/page.tsx`)

Refactored from complex `react-hook-form` + client-side Supabase to a minimal `'use client'` component:

- Uses `useActionState(login, undefined)` — the React 19 / Next.js 15 standard for Server Action forms
- Plain HTML form with `action={action}` — leverages progressive enhancement
- Removed: `useAuth`, `useRouter`, `useEffect`, `createClient()`, `react-hook-form`, `zodResolver`, all client-side auth logic
- Error state rendered from `state?.error` returned by the Server Action
- `isPending` from `useActionState` handles loading state — no manual `useState`

### 3. Auto-SignUp Removal

The block that called `supabase.auth.signUp` on invalid credentials was removed entirely. User creation is an administrative process (RF01) separate from authentication (US00).

## Consequences

**Positive:**

- Auth credentials never leave the server
- Session cookie managed server-side via Supabase SSR — middleware can verify it immediately
- No client-side Supabase calls on the login route
- Zod validation on server prevents malformed data reaching Supabase
- `useActionState` provides built-in pending/error state — reduced component complexity from 237 to ~120 lines

**Negative / Trade-offs:**

- `useActionState` requires React 19 — already satisfied by Next.js 15 dependency
- Role detection queries `funcionarios` table directly via Supabase client (not Prisma) — acceptable in Server Action context for a single field lookup

## Known Gap

The `src/utils/supabase/middleware.ts` currently only calls `updateSession` (refreshes the session cookie) but does not enforce role-based route protection. A future task must add:

- Verify authenticated user on every request to `/dashboard/:path*` and `/aluno/:path*`
- Redirect unauthenticated users to `/login`
- Optionally, redirect users to the wrong portal (staff to `/aluno` or students to `/dashboard`) back to their correct route
