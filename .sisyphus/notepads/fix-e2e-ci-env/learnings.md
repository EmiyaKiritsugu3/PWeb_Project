## 2026-06-07: globalSetup env var forwarding in GH Actions

- GH Actions env vars do not persist across job steps unless written
  to $GITHUB_ENV by an earlier step.
- "Export Supabase keys" writes SUPABASE_LOCAL_SERVICE_ROLE_KEY to
  $GITHUB_ENV, available as `${{ env.SUPABASE_LOCAL_SERVICE_ROLE_KEY }}`.
- Each step's own `env:` block must explicitly map needed vars by
  name — they do not auto-inherit.
- Playwright globalSetup runs in the same shell as `npm run e2e`, so
  the var must be set on the "Run E2E tests" step env block.
- commitlint footer-max-line-length default = 100 chars. Body lines
  must be wrapped. Use `git commit -F file` with pre-wrapped file
  to avoid argv newline issues.
