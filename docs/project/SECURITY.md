# Security Policy

## Supported Versions

The following versions of the project are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please follow these steps:

1.  **Do not disclose it publicly** until it is resolved.
2.  **Open an Issue** on GitHub with the label `security`. 
3.  Include as much detail as possible to help us reproduce and fix the issue.

We will acknowledge your report as soon as possible and work towards a fix.

## Security Best Practices

- **Secrets:** Never commit secrets (API keys, passwords, private keys) to the repository. Use `.env.local` for local development and Environment Variables for production (Vercel/Supabase).
- **Dependencies:** Avoid using unverified or deprecated packages. We run `npm audit` regularly to check for known vulnerabilities.
- **Data Privacy:** Ensure that PII (Personally Identifiable Information) like student emails are handled with proper RLS (Row Level Security) on Supabase.
