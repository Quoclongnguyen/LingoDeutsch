# Lingo Deutsch implementation plan

This file owns the planned phase sequence. Detailed scope and verification for each phase belong in `harness/build/`.

| Phase | Name | Status | Outcome |
|---|---|---|---|
| 00 | Repository foundation | Complete | Next.js foundation, tooling, MongoDB connection boundary, authentication skeleton, design tokens, and green baseline checks |
| 01 | Vocabulary data foundation | Complete | Mongoose models, indexes, validation, repositories, services, and seed data |
| 01.5 | Frontend/backend workspace split | Complete | Separate web and API applications in one monorepo while preserving Phase 00/01 behavior |
| 02 | Vocabulary library | Complete | Searchable/filterable word library, add/edit/archive, sets, and bounded import preview/commit |
| 03 | SRS vertical slice | Complete | Due queue, review sessions, deterministic scheduling, idempotent rating, and recovery |
| 04 | Today and A1 learning path | Complete | Data-backed dashboard, minimal A1 path, sample lesson, and save-word flow |
| 05 | Grammar library | Complete | Structured A1 grammar topics, lesson links, and replay of completed lessons without losing progress |
| 06 | Exercise engine | Complete | Server-graded multiple choice, fill-in-the-blank, word ordering, results, retry, and bounded attempt history |
| 07 | Integration, QA, and preview | Not started | End-to-end learning loop, aggregate A1 progress, responsive/accessibility/security hardening, and separately authorized preview deployment |

## Phase gates

- Complete phases in order unless a documented dependency justifies a change.
- A phase is complete only when its acceptance criteria and verification evidence are recorded.
- New product capabilities require an explicit PRD decision before entering a build phase.
- Preview or production deployment is not implied by completing Phase 07 and requires separate user authorization.

## Current phase

Phase 06 is complete. Phase 07, integration, QA, and preview preparation, is the next planned phase and has not started. Deployment still requires separate user authorization.
