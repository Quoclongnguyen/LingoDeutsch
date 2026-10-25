# Phase 02 — Vocabulary library

**Status:** Complete (2026-10-25)

## Outcome

Deliver the authenticated, data-backed vocabulary workspace without implementing review scheduling. The learner can search and filter a paginated personal library, create and edit linguistically structured words, archive words, organize personal sets, and preview/commit a bounded bulk import.

## In scope

- Shared Zod contracts for vocabulary queries, updates, set mutations, and import preview/commit.
- Fastify vocabulary and vocabulary-set routes under `/api/v1`.
- A server-to-server authentication boundary: the Next.js session supplies `userId`; the browser cannot choose an owner ID.
- User-scoped repository/service operations for list, detail, create, edit, archive, sets, and import.
- Search over German headword/plural and Vietnamese meaning; CEFR, word-class, review-state, source, and due filters.
- Server-side pagination that preserves active filters.
- Vocabulary UI with `Đến hạn`, `Kho từ`, and `Bộ từ` views; compact summary strip; responsive table/records; add/edit/archive flows; meaningful loading, empty, error, and success states.
- Bulk paste/CSV preview with row-level errors, duplicate detection, a 200-row limit, and explicit commit.
- Tests for validation, authorization, user scoping, duplicate handling, pagination/filtering, responsive UI behavior, and the critical create/search flow.

## Out of scope

- Rating words, SRS interval calculation, review-session creation/recovery, or changing review state beyond the existing initial `new` state.
- Dashboard, lesson player, learning-path progress, pronunciation, AI translation, payments, community, ranking, classroom, or public sets.

## Acceptance criteria

1. `GET /api/v1/vocabulary` never returns another user's records and supports bounded pagination plus documented filters.
2. Searching `Termin` or `cuộc hẹn` can return the same owned record; `noun + A1` excludes other word classes/levels.
3. Create, update, detail, and archive endpoints validate input and scope every operation by authenticated server-derived `userId`.
4. A noun cannot be saved without an article; German umlauts and `ß` survive normalization and display.
5. Duplicate active normalized headwords return a specific conflict response; archived records do not block a replacement.
6. Personal sets can be created, renamed, archived, and have owned words added/removed without cross-user access.
7. Import preview reports per-row validation and duplicate problems and never persists; commit is explicit and all-or-nothing for at most 200 rows.
8. Desktop uses a readable vocabulary table; below `768px` rows become labeled records with no page-level horizontal overflow.
9. Keyboard focus, accessible names, light/dark themes, and loading/empty/error/success states remain usable.

## Verification

- Focused RED/GREEN Vitest runs for shared contracts, services, routes, and components.
- Atlas integration tests against the guarded `_test` database.
- `npm test`
- `npm run test:integration`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`
- Browser verification at 375px and desktop in light and dark themes with console/network review.

Do not mark Phase 02 complete or update `PLANS.md` until every acceptance criterion above is satisfied with observed evidence.

## Observed completion evidence

- The browser calls an authenticated Next.js BFF; the BFF injects the session-derived owner ID and an internal server secret. Browser-provided identity headers are discarded.
- Fastify exposes user-scoped word, set, membership, and import routes. Foreign set IDs and foreign words are rejected.
- The responsive vocabulary workspace includes the due/library/set views, summary, search, filters, pagination, add/edit/archive, personal-set create/rename/archive, set membership, import preview/commit, and loading/empty/error/success states.
- Import parsing supports bounded line and CSV input, row errors, in-file and existing-word duplicate detection, explicit commit, transactions, and per-user rate limiting.
- Playwright verified the create/search flow at desktop and Pixel 7 sizes with no horizontal overflow and zero axe violations. The E2E server uses port 3100 and `.next-e2e`, so it does not collide with a developer's port 3000 server or `.next` cache.

| Command | Observed result |
|---|---|
| `npm test` | Passed: 18 files, 72 tests across shared, API, web, and architecture suites |
| `npm run test:integration` | Passed: 2 files, 11 tests against the guarded Atlas `_test` database |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed; all included files use Prettier style |
| `npm run build` | Passed; shared contracts, Fastify bundle, and Next.js production routes compiled |
| `npm run test:e2e` | Passed: 8 tests across desktop Chromium and Pixel 7 emulation |
