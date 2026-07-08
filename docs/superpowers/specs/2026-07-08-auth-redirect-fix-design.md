# Auth Redirect Fix — Magic-Link + OAuth (Local / Preview / Production)

**Date:** 2026-07-08
**Branch:** `feat/aluno-ui-10-fixes`
**Status:** Approved design, pre-implementation

## Problem

Magic-link and OAuth (Google / GitHub / Apple) login silently fail in Vercel
Preview and Production deployments. Password login works. The E2E suite passes
locally only because it exercises the password path, not magic-link / OAuth.

Investigation found **five root causes**, two of which are latent failures
masked by a hard throw:

### Root cause 1 — `NEXT_PUBLIC_APP_URL` set to empty string in Production

`src/lib/actions/auth.ts` `callbackUrl()` reads
`process.env.NEXT_PUBLIC_APP_URL` and **throws** when it is unset. Verified via
`vercel env pull production`:

```
NEXT_PUBLIC_APP_URL=""
```

An empty string is *set* (not `undefined`), so the nullish-coalescing fallback
to `VERCEL_URL` never fires — `callbackUrl()` builds
`"" + "/auth/callback?next=..."` → malformed URL → Supabase rejects the
redirect / OAuth provider 400s. This is worse than the throw-on-unset documented
in the code: `??` cannot distinguish `undefined` from `""`.

### Root cause 2 — `VERCEL_URL` fallback absent

Vercel auto-injects `VERCEL_URL` (e.g. `smartmanagementsystem-abc123-...`)
for every preview deployment. The current code never reads it, so even if
`NEXT_PUBLIC_APP_URL` were unset, preview deploys would still break.

### Root cause 3 — `supabase/config.toml` allowlist mismatches

```toml
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
```

- Host `127.0.0.1` ≠ `localhost` — the Next.js dev server default binds
  `localhost`, and browsers resolve `localhost` to `::1`/`127.0.0.1`, but
  Supabase compares redirect URLs as strings; `http://localhost:3000` ≠
  `http://127.0.0.1:3000`.
- Scheme `https://127.0.0.1:3000` — local dev is plain HTTP. HTTPS-on-local
  in the allowlist is dead weight and never matches.
- No `localhost:3000`, no `*.vercel.app` glob, no production URL.

### Root cause 4 — No preview / production allowlist entries

Preview deployment URLs (`*-emiyakiritsugu3s-projects.vercel.app`) and the
canonical production alias (`smartmanagementsystem.vercel.app`) are absent
from the redirect allowlist. Supabase 400s any OAuth / magic-link redirect
not in the allowlist.

### Root cause 5 — Cloud Supabase allowlist (Dashboard) likely stale

The local `config.toml` is applied via `supabase db push` only for local CLI.
The **cloud** Supabase project used by Vercel deploys has its own allowlist in
the Dashboard (Authentication → URL Configuration → Redirect URLs). It must
mirror Fix B's entries or cloud auth fails regardless of code.

## Non-goals

- No new dependencies (Supabase JS / `@supabase/ssr` already installed).
- No refactor of `validateNext` (open-redirect guard already correct — PR #194
  remediation shipped it).
- No changes to password login (works).
- No changes to the OAuth provider client config in Supabase Dashboard (out of
  scope; providers already configured).

## Affected surfaces

| File / surface | Change |
|---|---|
| `src/lib/actions/auth.ts` | Rewrite `callbackUrl()` — empty-string guard + `NEXT_PUBLIC_VERCEL_URL` fallback + localhost default. No throw. |
| `supabase/config.toml` | `site_url` → `http://localhost:3000`; `additional_redirect_urls` → localhost + vercel.app glob + prod. |
| `.env.example` | Add comment: Preview should leave `NEXT_PUBLIC_APP_URL` unset for `NEXT_PUBLIC_VERCEL_URL` fallback. Prod must set canonical URL. |
| Vercel env (Production) | Remove empty `NEXT_PUBLIC_APP_URL`, set `https://smartmanagementsystem.vercel.app`. |
| Vercel env (Preview) | Leave `NEXT_PUBLIC_APP_URL` unset — `NEXT_PUBLIC_VERCEL_URL` fallback applies. |
| Cloud Supabase Dashboard | Manual: mirror allowlist from Fix B. (Documented step, not code.) |
| `src/lib/actions/auth.test.ts` | New test file — `callbackUrl` resolution tiers. |

`src/app/auth/callback/route.ts` is **unchanged** — it already resolves
`validatedNext` via the shared `validateNext` helper and uses
`request.nextUrl.origin` (the live request origin, which is automatically in
the allowlist because Supabase sent the redirect there). The bug is purely in
**building** the redirect URL in the server action, not **consuming** it.

## Design

### Fix A — `callbackUrl()` tiered resolution

```ts
function callbackUrl(next?: string | null): string {
  // .trim() before nullish: Vercel Production has NEXT_PUBLIC_APP_URL=""
  // (empty string set, not undefined). "" is falsy but not nullish, so
  // explicit || null converts falsy → null for ?? to fall through.
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base =
    (explicit || null)
    ?? (process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : null)
    ?? 'http://localhost:3000';
  const validated = validateNext(next);
  const safeNext = validated === '/' ? '/login' : validated;
  return base + AUTH_CALLBACK_PATH + '?next=' + encodeURIComponent(safeNext);
}
```

Resolution tiers (first non-empty wins):

1. **`NEXT_PUBLIC_APP_URL`** (trimmed) — Production. Operator sets canonical
   domain. Trim guards against accidental `" "` / `""`.
2. **`NEXT_PUBLIC_VERCEL_URL`** — Preview deployments. Vercel auto-injects
   per-deploy hostname; prefix `https://`. This URL is unique per deployment,
   so it must be covered by the `**.vercel.app/*` glob in the Supabase allowlist.
3. **`http://localhost:3000`** — Local dev default. No env needed. Tests run
   on this tier.

No throw. Local dev works zero-config. Empty-string in prod falls through
instead of building a broken `""/auth/callback` URL.

`validateNext` + `'/'` → `/login` mapping preserved exactly (open-redirect
guard from PR #194 unchanged).

### Fix B — `supabase/config.toml`

```toml
site_url = "http://localhost:3000"
additional_redirect_urls = [
  "http://localhost:3000/auth/callback",
  "https://**.vercel.app/auth/callback",
  "https://smartmanagementsystem.vercel.app/auth/callback"
]
```

- `localhost` (not `127.0.0.1`) — matches dev server bind + browser resolution.
- `http://localhost:3000/auth/callback` (not `https`) — local is plain HTTP.
- `https://**.vercel.app/auth/callback` — Supabase wildcard. Per Context7
  (supabase.com/docs/guides/auth/redirect-urls): `*` matches a sequence of
  non-separator chars (separators are `.` and `/`), `**` matches any sequence
  of chars. Preview deploy hostnames are multi-hyphen-group
  (`smartmanagementsystem-6rfj2hapr-emiyakiritsugu3s-projects.vercel.app`) —
  `-` is not a separator, so a single `*` could span it, but `**` is the
  documented, unambiguous choice for "any sequence of characters" and is the
  Supabase-recommended pattern for Netlify/Vercel preview URLs.
- `https://smartmanagementsystem.vercel.app/auth/callback` — Production
  canonical alias. Also covered by the glob, but listed explicitly so a future
  allowlist-glob regression can't break prod silently. Supabase docs recommend
  exact paths for production even though `**` covers preview/localhost.

`/auth/callback` suffix included because `callbackUrl()` builds
`${base}${AUTH_CALLBACK_PATH}` with `AUTH_CALLBACK_PATH = '/auth/callback'`
(see `src/lib/constants.ts`). Supabase matches on the full URL string.

### Fix C — Vercel env (Production)

Remove the empty-string value, set the canonical production URL:

```bash
vercel env rm NEXT_PUBLIC_APP_URL production
echo "https://smartmanagementsystem.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production
```

Manual confirmation: `vercel env pull /tmp/v.json --environment production` →
`NEXT_PUBLIC_APP_URL=https://smartmanagementsystem.vercel.app`.

### Fix D — Vercel env (Preview)

Intentionally **unset** `NEXT_PUBLIC_APP_URL` in Preview. With `callbackUrl()`
fixed, preview falls to the `NEXT_PUBLIC_VERCEL_URL` tier — each preview deploy gets its
own deploy-host callback URL, all matching the allowlist glob.

### Fix E — Cloud Supabase Dashboard

Non-code step. In Supabase Dashboard → the cloud project used by Vercel →
Authentication → URL Configuration:

- **Site URL:** `http://localhost:3000` (or the prod URL; Supabase uses this as
  the default when no redirect is specified — local is safe since we always
  pass an explicit `emailRedirectTo` / `redirectTo`).
- **Redirect URLs:** mirror Fix B's `additional_redirect_urls`.

If the cloud allowlist does not contain the vercel.app glob and the prod URL,
cloud deploys fail regardless of the code fix. This is the most likely reason
magic-link / OAuth are broken in Vercel Preview **today** even after the
code fix lands — the cloud allowlist must be updated in lockstep.

### Fix F — `.env.example`

Annotate the existing line:

```
# Preview deploys: leave unset so callbackUrl() falls back to NEXT_PUBLIC_VERCEL_URL.
# Production: set to the canonical domain (e.g. https://smartmanagementsystem.vercel.app).
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Fix G — Test

New file `src/lib/actions/auth.test.ts`, vitest. Covers the resolution tiers
via env manipulation in `beforeEach` / `afterEach`:

1. `NEXT_PUBLIC_APP_URL` set → used (trimmed if whitespace).
2. `NEXT_PUBLIC_APP_URL=""` → falls to `NEXT_PUBLIC_VERCEL_URL`.
3. `NEXT_PUBLIC_APP_URL` unset + `NEXT_PUBLIC_VERCEL_URL` set → `https://${NEXT_PUBLIC_VERCEL_URL}`.
4. Both unset → `http://localhost:3000`.
5. `next` param validated by `validateNext` (`/aluno/../admin` → `/admin`
   rejected → `/login`; `/aluno/dashboard` → preserved).
6. `'/'` → `/login` mapping.

`callbackUrl` is module-private. The test imports the public
`signInWithMagicLink` / `signInWithGoogle` and asserts the constructed
redirect URL was passed to `supabase.auth.signInWithOtp` /
`signInWithOAuth` via a mocked `@supabase/ssr` server client. This tests the
tier resolution through the real function rather than exporting `callbackUrl`
just for the test (no export-add-for-test).

## Verification

After implementation:

```bash
npm run typecheck   # strict
npm test           # new callbackUrl tier tests pass + existing 1159 green
npm run e2e        # 21/21 (password path — magic-link/OAuth are cloud-only)
```

Cloud-only verification (manual, post-deploy):

1. Deploy to Vercel preview.
2. Visit preview `/aluno/login`, click `Entrar com Google`.
3. Confirm redirect to Google → back to `https://<preview>.vercel.app/auth/callback?...` → `/aluno/dashboard`.
4. Repeat for GitHub, Apple, magic-link email.

## Rollback

Pure config + env. Revert `auth.ts` `callbackUrl` to the throw version,
restore `config.toml` `site_url`/`additional_redirect_urls`, unset the Vercel
prod env. No schema migration, no DB change, no data loss path.

## Scope check

Single implementation plan. One source file (`auth.ts`) rewrite of one helper
(~8 lines), one config file (`config.toml`), one env doc (`.env.example`),
one test file (`auth.test.ts`), plus out-of-band Vercel CLI + Supabase
Dashboard steps. No decomposition needed.
