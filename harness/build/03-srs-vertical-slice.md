# Phase 03 — SRS vertical slice

**Status:** Complete (2026-10-26)

## Outcome

Deliver one complete, authenticated spaced-repetition loop: query the due queue, create or recover a review session, reveal one German card, rate it exactly once, persist the next schedule and immutable history, and finish with a useful summary.

## In scope

- Shared Zod contracts for session creation, reveal, rating, identifiers, modes, and ratings.
- A deterministic pure scheduler implementing the PRD's simplified SM-2 rules and interval previews.
- User-scoped due-count and due-queue repositories with `dueAt <= server now`, oldest-due ordering, a 50-card session cap, and a 10-new-card daily cap.
- Recoverable review sessions with one active session per learner flow, current-card persistence, explicit restart, and completion.
- Idempotent rating by unique `reviewEventId`; review-state update, append-only log creation, and session progress in one MongoDB transaction.
- Fastify review routes under `/api/v1`, exposed to the browser only through the authenticated Next.js BFF.
- A responsive, keyboard-operable review experience with question/reveal states, computed interval labels, recovery choice, empty/loading/error states, and completion summary.
- A review entry point from the Practice screen and the due view of Vocabulary.

## Out of scope

- Dashboard data integration, A1 lesson player, lesson progress, speech scoring, AI translation, push reminders, FSRS, custom scheduler settings, payments, community, rankings, courses, or classroom features.

## Acceptance criteria

1. All new and existing-card `again`, `hard`, `good`, and `easy` transitions match PRD section 10, use server time, clamp ease to `1.3–3.0`, and keep mastered cards scheduled.
2. Due count and session selection include only active words owned by the authenticated learner with `dueAt <= now`; future and foreign records never appear.
3. A session contains at most 50 cards, introduces at most 10 new cards per UTC day, and preserves the due-order contract.
4. Reopening review recovers the current active session. The learner can continue it or explicitly abandon it and start from the current queue.
5. Rating the current card appends one immutable review log, updates its review state, and advances persisted session progress atomically.
6. Repeating the same `reviewEventId` returns the original outcome without a second log or second advancement; double submission is disabled in the client.
7. A learner cannot read, rate, complete, or restart another learner's session or word.
8. The review UI hides the Vietnamese answer before reveal, shows article/plural/example/notes afterward, and supports `Space` then `1–4` without page-level horizontal overflow.
9. Loading, no-due, recover, error, active, submitting, and completed states are meaningful in light and dark themes with visible focus and 44px targets.
10. Refreshing after a rated card resumes at the next card; completion reports reviewed and difficult counts plus the next due time when one exists.

## Verification

- Focused RED/GREEN Vitest runs for contracts, scheduler, services, routes, and the review component.
- Atlas integration tests against the guarded `_test` database for due ownership, session recovery, atomic rating, and idempotency.
- `npm test`
- `npm run test:integration`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`
- Browser verification at 375px and desktop in both themes, including keyboard-only completion and console/network review.

Do not mark Phase 03 complete or update `PLANS.md` until every acceptance criterion above is satisfied with observed evidence.

## Observed completion evidence

- The scheduler implements every documented new/existing-card rating branch, server-time due dates, lapse handling, ease clamping, and mastery while keeping mastered cards scheduled.
- Due selection scopes both the review state and joined vocabulary word by the authenticated learner, excludes future/archived/foreign records, preserves due order, and applies the 50-card/10-new-card limits.
- Rating updates the review state, append-only log, and persisted session index in one transaction. Replaying a matching `reviewEventId` returns the original outcome without advancing twice.
- The review screen restores an active session, offers continue/restart, hides the Vietnamese answer until reveal, labels ratings with computed intervals, and supports `Space` plus `1–4`.
- Desktop Chromium and Pixel 7 E2E runs verified the complete keyboard flow, light/dark accessibility, no page-level horizontal overflow, and zero axe violations.

| Command | Observed result |
|---|---|
| `npm test` | Passed: 23 files, 93 tests |
| `npm run test:integration` | Passed: 3 files, 15 tests against the guarded Atlas `_test` database |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; the Fastify bundle and Next.js `/practice/review` route compiled |
| `npm run test:e2e` | Passed: 10 tests across desktop Chromium and Pixel 7 emulation |
