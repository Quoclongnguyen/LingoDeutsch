# Phase 04 — Today and A1 learning path

**Status:** Complete

## Outcome

Connect the existing A1 seed, lesson progress, vocabulary, and SRS data into one authenticated loop: see the next useful action on Today, open the A1 path, complete a sample lesson, and save lesson vocabulary without creating duplicates.

## In scope

- Shared Zod contracts for learning-path queries, lesson progress, and lesson-word saves.
- User-scoped repositories and services for the A1 path, lesson player, progress, dashboard, and recent activity.
- Four seeded A1 lessons grouped into two modules, with one complete interactive sample lesson.
- An automatic per-lesson vocabulary set and idempotent save-word behavior.
- Fastify learning routes under `/api/v1`, exposed only through the authenticated Next.js BFF.
- A data-backed Today dashboard, A1 learning path, and responsive lesson player.
- Meaningful loading, empty, error, locked, in-progress, completed, saved, and no-review-due states.

## Out of scope

- A2+ lesson content, AI-authored lessons, speech scoring, audio generation, adaptive placement, exam simulation, payments, community, rankings, courses, classrooms, or deployment.

## Acceptance criteria

1. `GET /api/v1/learning-path?level=A1` returns only published lessons, grouped into two ordered modules, with user-scoped progress, practical outcomes, word counts, related due counts, and one unambiguous next lesson.
2. Later lessons remain visible but locked until the preceding lesson is complete; locked state is conveyed by text and icon, not opacity alone.
3. `GET /api/v1/lessons/:slug` returns a published lesson and the authenticated learner's progress without exposing arbitrary HTML or another learner's data.
4. The sample lesson presents one activity at a time, preserves progress after each activity, and can be completed and resumed after refresh.
5. Saving a vocabulary item from a lesson creates its initial review state, records `sourceLessonId`, and links an automatic lesson set. Saving an existing active headword links the same record instead of creating a duplicate.
6. The Today dashboard returns the next lesson, due count, at most three due-word examples, a weekly goal summary, at most five recent learning activities, and the next due time when nothing is currently due.
7. All personal-data queries derive `userId` from the trusted server boundary and are scoped by that identifier; request bodies and query strings cannot override ownership.
8. Today, Learn, and Lesson screens follow `docs/DESIGN.md`: asymmetric dashboard, vertical path, quiet lesson focus, semantic tokens, German-first content, Vietnamese support, keyboard access, visible focus, 44px targets, no horizontal page scroll, and usable light/dark themes.
9. Focused unit, route, component, Atlas integration, and Playwright coverage proves the new behavior and existing finish gates remain green.

## Verification

- Focused RED/GREEN Vitest runs for contracts, learning services, routes, and UI components.
- Atlas integration tests against the guarded `_test` database for ownership, progress recovery, and idempotent lesson-word saves.
- `npm test`
- `npm run test:integration`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`
- Browser verification at 375px and desktop in light and dark themes, including keyboard use and console/network review.

Do not mark Phase 04 complete or update `PLANS.md` until every acceptance criterion above is satisfied with observed evidence.

## Observed evidence

- Shared contract, path-builder, route, component, model-index, and integration tests cover validation, ordered locks, trusted ownership, progress recovery, idempotent save-word behavior, and preservation of an existing word's original source.
- A mutation check that inverted the prerequisite lock condition caused both focused path tests to fail; restoring the condition returned both tests to green.
- `npm test` passed 27 files and 105 tests across shared, API, web, and architecture suites.
- `npm run test:integration` passed 4 files and 19 tests against the guarded Atlas `_test` database.
- `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build` passed.
- `npm run test:e2e` passed 12 tests across desktop Chromium and Pixel 7 emulation, including the learning flow, light/dark dashboard, keyboard-accessible controls, no horizontal overflow, and zero axe violations.
- `npm run seed:a1` completed idempotently with 4 matched and 4 updated lessons in the configured development database.
