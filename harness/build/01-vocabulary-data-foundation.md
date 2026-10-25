# Phase 01 — Vocabulary data foundation

Status: Complete (2026-10-25)

## Source inputs

- `AGENTS.md`
- `PLANS.md`
- `docs/PRD.md`, especially sections 10–12 and 16–18
- `.codex/skills/mongodb-srs/SKILL.md`
- `.codex/skills/lingo-german-domain/SKILL.md`

## Objective

Create the validated, user-scoped MongoDB foundation for vocabulary and review data without exposing CRUD routes, UI behavior, or SRS rating behavior from later phases.

## In scope

- Zod validation and deterministic German-headword normalization.
- Mongoose schemas and required indexes for vocabulary words, review state/log/session, vocabulary sets, lessons, and lesson progress.
- Server-only repositories that require an explicit authenticated `userId` for personal data.
- A service that creates a vocabulary word and its initial review state atomically.
- Idempotent A1 lesson seed data with at least four lessons, forty curated vocabulary items, and twenty bilingual examples.
- Unit tests for validation, normalization, schema indexes, and seed integrity.
- Atlas integration tests isolated to `lingo_deutsch_test` for atomic creation, duplicate protection, and user scoping.

## Explicit non-goals

- Vocabulary Route Handlers, Server Actions, forms, search UI, filters, pagination UI, or import UI.
- Due-queue queries, SRS interval transitions, review rating, review-session recovery, or dashboard aggregation.
- Creating learner-owned vocabulary sets or words in the production `lingo_deutsch` database.
- Authentication provider changes, deployment, or external infrastructure changes.

## Safety boundaries

- Integration tests must reject any database name that does not end in `_test`.
- Tests may delete only records created inside the isolated test database.
- Production credentials remain in `.env.local`; no URI, username, password, or secret may appear in logs or committed files.
- Seed execution is explicit and upserts only public lesson content by stable slug.

## Red-green-refactor and verification

1. Write failing unit tests for validation, normalization, indexes, and seed integrity.
2. Implement the smallest validation, model, and seed modules that satisfy them.
3. Write failing integration tests for atomic creation, duplicate protection, and tenant scoping.
4. Implement repository/service boundaries and run the tests only against `lingo_deutsch_test`.
5. Run unit tests, integration tests, typecheck, lint, format check, production build, existing Playwright smoke tests, and dependency audit.
6. Record exact observed results in `harness/build-log.md`.

## Acceptance criteria

- German normalization preserves umlauts and `ß` while normalizing Unicode, case, and whitespace.
- Nouns require a valid article; plural and `noPlural` cannot conflict; non-nouns reject noun-only fields.
- Required compound and unique indexes match the PRD.
- Creating a word also creates exactly one initial review state with server time and the PRD defaults.
- Duplicate active headwords are rejected within one user but allowed across users and after archival.
- Repository reads and updates cannot cross `userId` boundaries.
- The A1 seed contains at least four lessons and forty valid items, includes all mandatory examples, and can run repeatedly without duplicates.
- All verification commands pass and no Phase 02+ behavior is introduced.

## Handoff condition

Phase 01 may be marked complete only after the isolated Atlas integration tests and all repository checks pass, with evidence appended to `harness/build-log.md`.

## Completion evidence

- Unit validation, normalization, index, environment-safety, and seed-integrity coverage passes.
- Atlas integration coverage passes against the derived `lingo_deutsch_test` database only.
- The idempotent CLI seed was exercised twice on the test database before production use.
- Production `lingo_deutsch` contains four A1 lessons and forty curated vocabulary items after seeding.
- TypeScript, ESLint, Prettier, production build, Playwright, and dependency audit finish gates pass.
- No Phase 02 route, action, CRUD UI, search UI, or import behavior was introduced.
