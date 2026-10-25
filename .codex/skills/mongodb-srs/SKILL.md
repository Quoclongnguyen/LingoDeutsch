---
name: mongodb-srs
description: Implement or review Lingo Deutsch MongoDB/Mongoose persistence and spaced-repetition behavior. Use for schemas, indexes, repositories, due queues, review sessions, rating transitions, idempotency, or review history; do not use for UI-only changes.
---

# MongoDB and SRS

Before changing persistence or scheduling, read sections 10–12 and the related acceptance criteria in `docs/PRD.md`.

## Data invariants

- Scope every personal-data query by the authenticated server-side `userId`.
- Keep MongoDB access server-side behind repository/service functions.
- Validate external input with Zod and enforce durable constraints with Mongoose schemas and indexes.
- Store timestamps in UTC.
- Keep `reviewLogs` append-only and separate from vocabulary documents.
- Enforce unique `(userId, wordId)` review state and unique `reviewEventId` review logs.
- Use transactions for rating-state and review-log updates when the configured MongoDB environment supports them.
- Never accept arbitrary MongoDB filter objects from requests.

## SRS workflow

1. Express scheduling as a pure function from previous state, rating, and server time to next state.
2. Write failing tests for the relevant transition before implementation.
3. Implement the PRD intervals and clamp `easeFactor` to `1.3–3.0`.
4. Make rating endpoints idempotent and safe against double clicks or retried requests.
5. Test due-boundary timestamps, new cards, lapses, mastered cards, and session recovery.
6. Keep user-visible intervals calculated from the same function used for persistence.

Do not silently replace the MVP algorithm with FSRS or another scheduler without an approved PRD change.
