# Phase 06 — Exercise engine

**Status:** Not started

## Outcome

Provide one small, server-graded exercise engine for multiple choice, fill in the blank, and word ordering. Learners receive specific feedback, a final result, and a retry path while only bounded, user-owned attempt summaries are persisted.

## Dependencies

- Phase 05 must be complete so grammar topics can provide structured practice sources.
- Reuse the Phase 04 lesson activity flow and Phase 05 grammar content; do not create a parallel course runtime.
- Vocabulary and SRS behavior remains unchanged.

## In scope

- Shared discriminated unions for exactly three exercise types.
- Public exercise DTOs that omit answer keys and internal grading data.
- Pure deterministic grading functions with focused unit tests.
- Server-side submission validation and grading.
- User-scoped, idempotent exercise attempt summaries.
- Per-question correct/incorrect feedback and optional concise explanation.
- Final score/total, incorrect count, and retry.
- Keyboard-accessible word ordering without requiring drag-and-drop.
- Minimal interactive activities for the three existing lessons whose `activities` arrays are empty.

## Out of scope

- Timed exams, question banks, random adaptive testing, certificates, proctoring, AI grading, free-form essays, speech grading, or full Goethe/telc simulation.
- Changes to SRS scheduling based on exercise scores.
- Full answer-history analytics, keystroke logging, or a generic workflow engine.

## Frontend work

- Build reusable views for `multiple_choice`, `fill_blank`, and `word_ordering` while preserving one decision per screen.
- Show feedback only after submission and pair color with icon/text.
- Display one final result with exact score and a retry action; do not use confetti or fabricated mastery percentages.
- Provide click/touch controls and keyboard controls for token ordering, including clear move/reset actions and live instructions.
- Integrate practice entry points from grammar details and lesson activities.
- Keep answer state local until submission; never infer correctness from an answer key delivered by a read API.

## Backend work

- Add pure graders for the three approved exercise types.
- Normalize fill-in answers only by explicit rules such as surrounding whitespace and approved case behavior; never strip umlauts or replace `ß` silently.
- Load the trusted exercise source by `sourceType` and `sourceId`, then grade submitted answers server-side.
- Persist an attempt summary in the same logical operation, guarded by a unique `attemptEventId`.
- Return score, total, per-question result, and approved feedback after grading.
- Scope all attempt reads by authenticated `userId`; ignore or reject client-provided owner identity.
- Add `exercise-attempts` to the BFF allowlist with positive and negative proxy tests.

## Database changes

- Create `exerciseAttempts` with the approved PRD shape.
- Required indexes:
  - `{ attemptEventId: 1 }` unique;
  - `{ userId: 1, sourceType: 1, sourceId: 1, completedAt: -1 }`.
- Persist only source, score, total, incorrect exercise IDs, timestamps, and authenticated owner. Do not store raw free-form answers in the MVP.
- Exercise definitions remain embedded in the owning grammar topic or lesson content and are validated at the service boundary; do not add an `exerciseSets` collection without a new PRD decision.

## API endpoints

- `POST /api/v1/exercise-attempts`
- `GET /api/v1/exercise-attempts?sourceType=...&sourceId=...&limit=...`

The GET route is paginated/bounded and returns summary only. The POST request contains `attemptEventId`, source reference, and answers but never `userId`.

## Acceptance criteria

1. Read APIs for lessons and grammar topics do not expose correct answers or grading keys before submission.
2. Multiple choice, fill in the blank, and word ordering are graded deterministically on the server.
3. Fill-in normalization preserves meaningful German spelling differences, including umlauts and `ß`.
4. Word ordering is fully operable without drag-and-drop and announces the current token order accessibly.
5. Each submitted question receives correct/incorrect status and concise feedback; the final view shows exact score/total.
6. Retry creates a new attempt and leaves the earlier attempt intact.
7. Repeating the same `attemptEventId` returns the existing result or a safe idempotent response and creates no duplicate record.
8. An authenticated learner cannot read another learner's attempts or choose `userId` through the request.
9. Completing an exercise does not mutate `reviewStates`, `reviewLogs`, or SRS scheduling.
10. The three previously empty A1 lessons contain enough validated activity content to complete and resume their normal lesson flow.
11. All exercise screens include loading, submitting, validation, feedback, result, retry, error, and recovery states.
12. Desktop and 375px mobile flows pass keyboard, visible-focus, light/dark, no-overflow, and automated accessibility checks.

## Verification plan

Use red-green-refactor and mutation checks for answer comparison, score totals, idempotency, and ownership filters.

- Focused contract and pure-grader tests for every exercise type and invalid payload branch.
- Route/service tests proving answer-key stripping, server grading, and no SRS mutation.
- Atlas integration tests for idempotency, ownership isolation, bounded history, and attempt indexes.
- Component tests for keyboard ordering, feedback, results, and retry.
- Playwright for each exercise type on desktop and mobile.
- `npm test`
- `npm run test:integration`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`

Do not update `PLANS.md` to mark Phase 06 complete until every acceptance criterion has observed evidence in `harness/build-log.md`.

## Risks and mitigations

- **Answer leakage:** define separate stored/internal and public DTOs and test serialized responses.
- **Over-normalized German answers:** approve normalization rules explicitly and preserve authentic orthography.
- **Duplicate attempts:** require unique event IDs and integration-test retries.
- **Exercise engine becomes generic infrastructure:** support only the three approved types and current two source types.
