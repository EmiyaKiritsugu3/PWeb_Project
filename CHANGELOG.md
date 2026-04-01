# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-31

### Added
- **Base vs Entity Pattern**: Introduced strict Zod schemas for splitting input validation (`BaseSchema`) from database records (`EntitySchema`).
- **Strict Typing**: Enforced mandatory `id` field for all entities (Aluno, Treino, Plano, Matricula, Pagamento).
- **Security Policy**: Initial `SECURITY.md` for vulnerability reporting.
- **Semantic Versioning**: Established SemVer for consistent release management.

### Fixed
- **Vercel Build Error**: Resolved `id: string | undefined` type mismatch that blocked production builds.
- **Workout Sessions**: Fixed temporary series creation by generating UUIDs for initial state.
- **UI Tweaks**: Resolved `null/undefined` issues in Avatar components.

### Changed
- Refactored `src/lib/data.ts` to return strict `Entity` types instead of partials.
- Updated Server Actions in `src/lib/actions/` to use separate input and output validation.
