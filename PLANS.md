# Lingo Deutsch implementation plan

This file owns the planned phase sequence. Detailed scope and verification for each phase belong in `harness/build/`.

| Phase | Name | Status | Outcome |
|---|---|---|---|
| 00 | Repository foundation | In progress | Next.js foundation, tooling, MongoDB connection boundary, authentication skeleton, design tokens, and green baseline checks |
| 01 | Vocabulary data foundation | Not started | Mongoose models, indexes, validation, repositories, services, and seed data |
| 02 | Vocabulary library | Not started | Searchable/filterable word library, add/edit/archive, sets, and import preview |
| 03 | SRS vertical slice | Not started | Due queue, review sessions, deterministic scheduling, idempotent rating, and recovery |
| 04 | Today and A1 learning path | Not started | Data-backed dashboard, minimal A1 path, sample lesson, and save-word flow |
| 05 | Hardening and preview deployment | Not started | Responsive QA, accessibility, E2E coverage, error states, security review, and preview deployment |

## Phase gates

- Complete phases in order unless a documented dependency justifies a change.
- A phase is complete only when its acceptance criteria and verification evidence are recorded.
- New product capabilities require an explicit PRD decision before entering a build phase.
- Production deployment is not implied by completing Phase 05 and requires separate user authorization.

## Current phase

Phase 00 is described in `harness/build/00-repository-foundation.md`.
