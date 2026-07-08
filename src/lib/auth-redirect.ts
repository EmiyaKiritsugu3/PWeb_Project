/**
 * Shared open-redirect prevention for post-login `next` params.
 *
 * Used by both the OAuth callback route (src/app/auth/callback/route.ts) and
 * the auth server actions (src/lib/actions/auth.ts) so the two paths cannot
 * drift — every redirect target is validated by the same logic.
 *
 * Guards:
 * - Only allowlisted prefixes (`/dashboard`, `/aluno`).
 * - Path-segment boundary: `/aluno$` or `/aluno/...` pass, `/alunox` fails.
 * - No protocol-relative (`//evil.com` → `evil.com`) open redirects.
 * - Normalizes `next` via URL.pathname so `/aluno/../admin` collapses to
 *   `/admin` *before* the prefix check, defeating traversal.
 *
 * Returns the safe target or `'/'` as the inert fallback. Callers that need a
 * login-redirect default can map `'/' → '/login'` at the boundary.
 */
const ALLOWED_PREFIXES = ['/dashboard', '/aluno'] as const;

export function validateNext(next: string | null | undefined): string {
  if (!next) return '/';
  if (next.startsWith('//')) return '/';

  // Normalize so `/aluno/../admin` collapses to `/admin` before the prefix
  // check, defeating path traversal bypasses.
  const normalized = new URL(next, 'http://localhost').pathname;
  const safe = ALLOWED_PREFIXES.some((p) => normalized === p || normalized.startsWith(`${p}/`));
  return safe ? normalized : '/';
}
