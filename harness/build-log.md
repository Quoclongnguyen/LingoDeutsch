# Lingo Deutsch build log

This file records observed implementation progress and verification evidence. Planned work belongs in `PLANS.md` and `harness/build/`.

## Phase summary

| Phase | Status | Evidence |
|---|---|---|
| 00 — Repository foundation | Complete | Next.js foundation, protected shell, environment validation, MongoDB boundary, light/dark tokens, and all baseline checks verified |
| 01 — Vocabulary data foundation | Complete | Validated schemas and indexes, tenant-safe repositories, atomic word/review-state creation, isolated Atlas integration tests, and verified A1 seed |
| 01.5 — Frontend/backend workspace split | Complete | Web, API, and shared workspaces verified locally and against the isolated Atlas test database; production seed counts preserved |
| 02 — Vocabulary library | Complete | Authenticated BFF, user-scoped vocabulary API, responsive CRUD/search/sets/import UI, and all Phase 02 checks passed |
| 03 — SRS vertical slice | Complete | Deterministic scheduler, tenant-safe due queue, transactional/idempotent rating, recoverable session UI, and all finish gates verified |
| 04 — Today and A1 learning path | Complete | Data-backed dashboard and A1 path, progress/prerequisite enforcement, lesson player, save-word flow, and verified responsive UI |
| 05 — Grammar library | Complete | Five structured A1 topics, grammar/lesson links, safe replay, Atlas seed, and all finish gates verified |
| 06 — Exercise engine | Complete | Three server-graded exercise types, private answer keys, idempotent user-owned attempts, populated lessons, accessible practice UI, and all finish gates verified |
| 07 — Integration, QA, and preview | Not started | — |

## Activity

### 2026-10-25 — Repository planning foundation

- Added PRD and design-system source documents.
- Initialized root repository instructions and phase planning.
- Added three repo-local skills for German-domain correctness, MongoDB/SRS work, and Stitch UI implementation.
- This entry was superseded by the completed implementation below.

### 2026-10-25 — Phase 00 implementation complete

Implemented:

- Initialized npm with a committed lockfile and Next.js 16.4.3, React 19.3.1, strict TypeScript, Tailwind CSS 4.3.3, ESLint, Prettier, Vitest, React Testing Library, and Playwright.
- Added lazy server-environment validation that reports invalid field names without including supplied secret values.
- Added a cached, server-only Mongoose connection boundary without creating Phase 01 collections or models.
- Added an Auth.js/NextAuth GitHub-provider skeleton, server-side session guard, protected route group, and sign-in screen. Real provider credentials remain user-managed.
- Added the responsive five-destination application shell, system-aware persistent light/dark theme control, semantic design tokens, loading skeleton, empty states, error boundary, placeholder routes, and a minimal Today dashboard using realistic A1 content.
- Added a health route plus unit, component, accessibility, responsive, theme, and end-to-end smoke coverage.
- Installed the Playwright Chromium runtime locally after the first UI run reported that the browser executable was missing; no browser binary is stored in the repository.
- Did not contact MongoDB, create external infrastructure, deploy, commit, or push.

Observed final verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 3 test files, 6 tests |
| `npm run typecheck` | Passed with no TypeScript errors |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed; all included files use Prettier style |
| `npm run build` | Passed; Next.js production build completed and all application/API routes compiled |
| `npm run test:e2e` | Passed: 6 Playwright tests across desktop Chromium and Pixel 7 emulation |

The Playwright finish gate also verified the protected shell with a test-only signed session, no page-level horizontal overflow, persisted theme switching, and zero axe violations in both light and dark modes at desktop and mobile viewports.

### 2026-10-25 — Phase 01 vocabulary data foundation complete

Implemented:

- Added deterministic Unicode-aware German headword normalization and Zod validation for articles, plurals, word types, grammar metadata, examples, CEFR levels, and object identifiers.
- Added Mongoose models and PRD indexes for vocabulary words, review states, review logs, review sessions, vocabulary sets, lessons, and lesson progress.
- Added server-only, explicitly user-scoped vocabulary repositories plus a transactional service that creates a word and its initial review state together.
- Added a partial unique index that rejects duplicate active headwords per user while allowing the same word for another user or after archival.
- Added a safe integration-test URI resolver that derives `lingo_deutsch_test` and rejects any explicit integration-test database without the `_test` suffix.
- Added an idempotent A1 seed command with four lessons and forty validated, bilingual vocabulary items. It includes the required appointment, punctuality, delay, and job-application language.
- Seeded only public lesson content into production. A read-only verification confirmed four A1 lessons and forty vocabulary items in `lingo_deutsch`.
- Kept `.env.local` ignored and added only the empty `MONGODB_TEST_URI` placeholder to `.env.example`; no credential or connection URI was logged or committed.
- Did not add vocabulary APIs, UI CRUD, search, import, review scheduling, payments, community, ranking, course, or classroom behavior.

TDD and integration evidence:

- Validation, normalization, index, and seed tests were written before their implementations and initially failed because the target modules did not exist.
- Integration tests were written before the repository/service layer and initially failed for the same reason.
- The first CLI seed run exposed a native ESM/CommonJS import mismatch in the Mongoose models; the imports were corrected to use Mongoose's default runtime export while retaining erased type imports.
- The seed command inserted four records on its first test run and matched the same four stable slugs on its second run without creating duplicates.

Observed final verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 8 test files, 26 tests |
| `npm run test:integration` | Passed against `lingo_deutsch_test`: 1 test file, 5 tests |
| `npm run typecheck` | Passed with strict TypeScript and no errors |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed; all included files use Prettier style |
| `npm run build` | Passed; Next.js production build compiled and generated all routes |
| `npm run test:e2e` | Passed: 6 tests across desktop Chromium and Pixel 7 emulation; the cross-platform runner started the test-only authenticated Next.js server and stopped its process tree after the run |
| `npm audit --audit-level=high` | Passed: 0 vulnerabilities |
| `npm run seed:a1` | Passed on production: 4 A1 lesson documents inserted |
| Production seed verification | Passed: 4 A1 lessons and 40 vocabulary items; no credential values printed |

### 2026-10-25 — Phase 01.5 frontend/backend split implemented

Implemented:

- Converted the repository to npm workspaces with `apps/web`, `apps/api`, and `packages/shared`.
- Moved the complete Next.js UI, Auth.js boundary, component tests, and Playwright suite into `apps/web`.
- Added a standalone Fastify backend in `apps/api` with a versioned `GET /api/v1/health` route, configured CORS, runtime environment validation, development/start commands, and an esbuild production bundle.
- Moved all Mongoose models, database connection code, repositories, services, Atlas integration tests, and seed tooling into `apps/api`.
- Moved German vocabulary normalization and Zod contracts into the framework-independent `packages/shared` workspace.
- Added repository architecture tests that enforce the three workspace boundaries and prevent frontend/database, backend/frontend, and shared/framework coupling.
- Added a root README with the repository map, independent development commands, health route, verification commands, and seed command.
- Preserved the existing UI, authentication flow, MongoDB schemas, indexes, seed content, and Phase 02 boundary. No vocabulary CRUD endpoint or UI was added.
- Replaced the initially selected `tsup` build dependency after its transitive esbuild version produced a low-severity audit finding; direct esbuild now produces the API bundle with zero reported vulnerabilities.

Observed verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 11 test files, 34 tests across shared, API, web, and architecture workspaces |
| `npm run typecheck` | Passed for all three workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed; all included files use Prettier style |
| `npm run build` | Passed; shared contracts typechecked, Fastify bundled, and Next.js production routes compiled |
| `npm run test:e2e` | Passed: 6 Playwright tests across desktop Chromium and Pixel 7 emulation from `apps/web` |
| `npm audit --audit-level=high` | Passed: 0 vulnerabilities |
| API runtime health check | Passed: production API bundle returned `{"service":"lingo-deutsch-api","status":"ok"}` from port 4000 |
| `npm run test:integration` | Passed after the Atlas IP access list update: 1 integration test file, 5 tests against `lingo_deutsch_test` |
| Production seed verification | Passed read-only: 4 A1 lessons and 40 vocabulary items remain in `lingo_deutsch` |

Phase 01.5 acceptance criteria are fully satisfied. Phase 02 remains not started.

### 2026-10-25 - Local authentication startup fix

Implemented:

- Diagnosed the `/today` development failure as empty Auth.js GitHub OAuth values; MongoDB and the Atlas IP access list were not involved.
- Added a local learner fallback only when Next.js is running in `development` and all three OAuth values are empty.
- Kept strict validation for production and for partially configured OAuth environments so a missing or mistyped credential cannot silently enable the fallback.
- Added a development-only Credentials provider boundary for the Auth.js route and a deterministic valid ObjectId-shaped local learner identifier.
- Fixed the App Router wrapper to forward its route context to Auth.js and normalized an empty optional `NEXTAUTH_URL` placeholder as unset.
- Added focused environment and session-guard regression tests without reading, printing, or changing any secret value.

Observed verification:

| Command | Result |
|---|---|
| Focused TDD tests | Failed before implementation, then passed: 2 files, 6 tests |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm test` | Passed: 13 test files, 40 tests |
| `npm run build` | Passed after network access was allowed for the existing Google font downloads |
| Development runtime smoke check | Passed: `/today` and `/api/auth/providers` both returned HTTP 200 |

### 2026-10-25 - Development reload-loop fix

Implemented:

- Confirmed the reload loop was caused by a production `next build` writing into the same `.next` directory used by the running development server.
- Stopped the affected server and leftover headless-browser process, removed the corrupted `.next` cache, and restarted development from a clean cache.
- Configured development to use `.next` and production build/start to use `.next-build`, following the Next.js 16 isolated-build guidance.
- Added `.next-build` to Git and ESLint ignores plus an architecture regression test for the cache boundary.
- Removed generated `.next-build`, API `dist`, and TypeScript build-info output after validation; the active development `.next` cache remains in use.

Observed verification:

| Check | Result |
|---|---|
| Reload-loop reproduction | Confirmed repeated `/today` requests before cleanup |
| Clean development server | Passed: one `/today` request followed by 10 seconds with no reload |
| Concurrent production build | Passed without restarting or invalidating the development server |
| `npm test` | Passed: 13 test files, 41 tests |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed after excluding generated `.next-build` output |
| `npm run format:check` | Passed |

### 2026-10-25 — Phase 02 vocabulary library complete

Implemented:

- Added shared contracts for vocabulary queries, updates, personal sets, bounded import preview/commit, and a Unicode-aware line/CSV parser.
- Added Fastify routes and MongoDB services for user-scoped list/detail/create/edit/archive, personal-set membership, and transactional bulk import.
- Added an authenticated Next.js BFF that derives ownership from the server session, injects the internal API credential, and discards browser-controlled identity headers.
- Added ownership validation for set associations, duplicate conflict handling, import row and rate limits, and all-or-nothing writes.
- Replaced the vocabulary placeholder with a responsive Vietnamese/German workspace: summary, due/library/set tabs, search, filters, pagination, add/edit/archive, set create/rename/archive, import preview, and loading/empty/error/success states.
- Isolated Playwright on port 3100 and `.next-e2e` so it can run while the normal port 3000 development server remains active.
- Did not implement review ratings/scheduling, AI translation, lessons, payments, community, rankings, courses, or classroom features.

Observed verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 18 test files, 72 tests |
| `npm run test:integration` | Passed: 2 files, 11 tests against the guarded Atlas `_test` database |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; API bundle and Next.js production routes compiled |
| `npm run test:e2e` | Passed: 8 tests across desktop Chromium and Pixel 7 emulation; no horizontal overflow and zero axe violations in the vocabulary flow |

Phase 02 acceptance criteria are fully satisfied. Phase 03 remains not started.

### 2026-10-26 — Phase 03 SRS vertical slice complete

Implemented:

- Added validated review-session and rating contracts without accepting a client-controlled owner ID.
- Added a deterministic simplified SM-2 scheduler for all `again`, `hard`, `good`, and `easy` branches, ease clamping, lapses, mastery, and server-time interval previews.
- Added a user-scoped due queue with oldest-due ordering, a 50-card session cap, and a 10-new-card UTC-day cap.
- Added recoverable review sessions, explicit restart, immutable review logs, transactional state/session/log updates, and idempotent `reviewEventId` handling.
- Added Fastify due-count/session/rating/completion routes through the authenticated Next.js BFF.
- Added a responsive German-first review screen with answer reveal, interval-labelled recall controls, `Space` and `1–4` keyboard operation, retry-safe double-submit protection, recovery choice, loading/empty/error/completed states, and entry points from Practice and Vocabulary.
- Strengthened the repository review by verifying ownership on both the review state and joined vocabulary word. Split the review orchestration and UI state panels into focused modules.
- Mutation-checked the scheduler clamp: changing the maximum from `3.0` to `2.9` caused the focused test to fail as intended, then the production rule was restored.

Observed verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 23 files, 93 tests across shared, API, web, and architecture suites |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings after resolving React purity/effect findings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; shared contracts, Fastify bundle, and Next.js production routes including `/practice/review` compiled |
| `npm run test:e2e` | Passed: 10 tests across desktop Chromium and Pixel 7 emulation; keyboard review, no horizontal overflow, and zero axe violations verified |
| `npm run test:integration` | Passed after the Atlas IP access entry became active: 3 files, 15 tests against the guarded Atlas `_test` database |

Phase 03 acceptance criteria are fully satisfied. Phase 04 remains not started.

### 2026-10-26 — Phase 04 Today and A1 learning path complete

Implemented:

- Added shared Zod contracts, Fastify routes, user-scoped repositories, and services for the A1 learning path, lesson player, progress, dashboard, recent activity, and lesson vocabulary saves.
- Expanded the A1 seed into four published lessons across two ordered modules and added one complete interactive lesson with dialogue, vocabulary-save, and comprehension-check activities.
- Enforced sequential lesson prerequisites in both the returned path and the progress service so direct API calls cannot advance a locked lesson.
- Added an automatic per-lesson vocabulary set and transactional, idempotent save-word behavior. Existing words retain their original `sourceLessonId` while gaining the lesson-set association.
- Replaced the Today and Learn placeholders with data-backed, responsive light/dark experiences plus the focused lesson player and meaningful loading, empty, error, locked, saved, completed, and no-review-due states.
- Kept browser ownership behind the authenticated Next.js BFF and scoped all personal MongoDB queries by the trusted user identifier.
- Added route, service, component, Atlas integration, and Playwright coverage. Mutation-checking the prerequisite condition proved the lock tests fail when the rule is inverted.

Observed verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 27 files, 105 tests across shared, API, web, and architecture suites |
| `npm run test:integration` | Passed: 4 files, 19 tests against the guarded Atlas `_test` database |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; shared contracts, Fastify bundle, and Next.js routes including `/learn/[slug]` compiled |
| `npm run test:e2e` | Passed: 12 tests across desktop Chromium and Pixel 7 emulation; learning flow, light/dark themes, no horizontal overflow, and zero axe violations verified |
| `npm run seed:a1` | Passed idempotently: 0 inserted, 4 updated, 4 matched in the configured development database |

The first Playwright attempt after generating fresh route types encountered a Next.js development-cache warm-up reload on three desktop cases (9 passed, 3 timed out while still showing loading states). An immediate rerun against the stabilized isolated `.next-e2e` cache passed all 12 cases without code changes.

Phase 04 acceptance criteria are fully satisfied. Phase 05 remains not started.

### 2026-10-26 — API database startup regression fix

Implemented:

- Reproduced fresh-server failures where read-only dashboard, learning-path, vocabulary, and vocabulary-set requests timed out because no code had opened the Mongoose connection yet.
- Added a fail-fast API bootstrap boundary that completes `mongoose.connect()` before Fastify starts accepting requests.
- Added regression coverage for connection-before-listen ordering and for refusing to listen when MongoDB startup fails.
- Mutation-checked the ordering test: moving `listen()` before the database connection caused both focused tests to fail, then the correct implementation was restored.

Observed verification:

| Check | Result |
|---|---|
| Focused regression test | Passed: 1 file, 2 tests after reproducing the missing bootstrap module |
| `npm test` | Passed: 28 files, 107 tests across shared, API, web, and architecture suites |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed for shared, API, and web workspaces |
| Live API smoke check | Passed: dashboard, vocabulary, vocabulary sets, and A1 learning path returned HTTP 200 after a clean API restart |

### 2026-10-26 — Phase 04 BFF route allowlist fix

Implemented:

- Reproduced the browser-facing 404 responses for `dashboard`, `learning-path`, `lessons`, and `lesson-progress` at the authenticated Next.js domain proxy.
- Added the four Phase 04 resource roots to the existing BFF allowlist while preserving rejection of unapproved roots.
- Added parameterized regression coverage for all four Phase 04 paths.

Observed verification:

| Check | Result |
|---|---|
| Focused regression test | Failed with four HTTP 404 assertions before the fix, then passed: 1 file, 8 tests |
| `npm test` | Passed: 28 files, 111 tests across shared, API, web, and architecture suites |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed after formatting the new test cases |
| `npm run build` | Passed for shared, API, and web workspaces |
| Live BFF smoke check | Passed: `/api/domain/dashboard` and `/api/domain/learning-path?level=A1` returned HTTP 200 with seeded data |

### 2026-10-26 — Phase 05 grammar library complete

Implemented:

- Added strict shared contracts for grammar list/detail queries, structured rules, bilingual examples, and bounded rectangular tables; arbitrary HTML is rejected at the validation boundary.
- Added the indexed `grammarTopics` MongoDB model, repository/service boundary, authenticated Fastify list/detail routes, and authenticated BFF allowlist entry.
- Added an idempotent five-topic A1 grammar seed for greetings and register, personal pronouns, `sein`/`haben`, noun articles, and regular present-tense conjugation. The seed stores no Phase 06 answer keys or exercises.
- Added Learn sub-navigation, responsive grammar list/detail pages, concise German-first content, Vietnamese explanations, compact tables, related-lesson links, and loading/empty/error/not-found/populated states.
- Added read-only grammar summaries to lesson detail and links from lessons back to grammar without changing the five primary navigation destinations.
- Added an explicit replay mode for completed lessons. Replay advances only local UI state and never sends a progress mutation, so persisted completion evidence remains unchanged.
- Switched the isolated E2E development runner to webpack because Turbopack watched its custom `.next-e2e` output and repeatedly refreshed pages on Windows.
- Kept the unlocked second lesson as seeded path metadata only; complete lesson-two activities remain outside Phase 05 and are not presented as completed content.

Observed verification:

| Check | Result |
|---|---|
| Red-green TDD | New contract, model, seed, route, service, proxy, grammar UI, and replay tests failed before implementation and passed after it |
| Replay mutation check | Inverting the replay guard caused 2 focused tests to fail; restoring the guard passed 1 file, 4 tests |
| `npm test` | Passed: 33 files, 128 tests across shared, API, web, and architecture suites |
| `npm run test:integration` | Passed: 5 files, 22 tests against the guarded Atlas `_test` database, including published filtering and idempotent grammar seed coverage |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; shared contracts, Fastify bundle, and Next.js grammar routes compiled |
| Playwright | Passed: 14 tests across desktop Chromium and Pixel 7 emulation, including grammar list/detail/lesson links, replay without progress writes, no horizontal overflow, and zero axe violations |
| Development seed | Passed: 5 grammar topics inserted while the existing 4 A1 lessons were updated idempotently |
| Manual acceptance | User confirmed the first lesson completion and second-lesson unlock flow in the light theme; the second lesson's missing activities were accepted as later-phase content |
| Five-axis review | Approved after simplifying the replay action label and correcting the progress-segment off-by-one state; no unresolved correctness, architecture, security, or performance findings |

Phase 05 acceptance criteria are fully satisfied. Phase 06 remains not started.

### 2026-10-26 — Phase 06 exercise engine complete

Implemented:

- Added strict shared discriminated unions for exactly `multiple_choice`, `fill_blank`, and `word_ordering`, with separate internal and public DTOs so lesson and grammar reads never serialize answer keys.
- Added deterministic server graders. Fill-in normalization trims/collapses whitespace and applies approved German case behavior while preserving umlauts and `ß`.
- Added authenticated Fastify submit/history routes, a BFF allowlist entry, a Mongoose attempt model, the required unique/history indexes, bounded user-scoped history, and idempotent conflict-safe persistence. Raw submitted answers are not persisted.
- Added lesson and grammar exercise sources, populated all three previously empty A1 lessons, and seeded practice for all five A1 grammar topics without changing vocabulary SRS state.
- Added a responsive practice flow with one decision per screen, all three interaction types, keyboard/click word ordering, accessible live order announcements, submitting/error/recovery states, per-question icon/text feedback, exact score/total, and retry with a new event ID.
- Gated lesson progress on a successful server grading response and added standalone practice entry points from grammar details.
- Seeded the configured development Atlas database idempotently: 4 lessons and 5 grammar topics updated and matched without duplicate inserts.
- Five-axis review found and fixed stale source content during same-route navigation and a misleading `review_conflict` API code for exercise event conflicts. Both fixes have regression tests; no required correctness, architecture, security, performance, or accessibility findings remain.
- Mutation-checked multiple-choice grading: inverting the answer comparison made the focused test fail with score 2 instead of 3; restoring the comparison returned all 3 grader tests to green.

Observed final verification:

| Command | Result |
|---|---|
| `npm test` | Passed: 38 files, 146 tests across shared, API, web, and architecture suites |
| `npm run test:integration` | Passed: 6 files, 25 tests against the guarded Atlas `_test` database, including answer-key privacy, idempotency, ownership, bounded history, indexes, and no SRS mutation |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; shared contracts, Fastify bundle, and Next.js routes including `/practice/exercises/[sourceType]/[slug]` compiled |
| `npm run test:e2e` | Passed: 16 tests across desktop Chromium and mobile Chromium; the exercise flow was explicitly verified at 375px, in light/dark themes, with keyboard operation, no horizontal overflow, and zero axe violations |
| `npm run seed:a1` | Passed idempotently: lessons 0 inserted/4 updated/4 matched; grammar topics 0 inserted/5 updated/5 matched |

One intermediate E2E run completed all 16 browser tests but Windows denied the sandboxed cleanup `taskkill`; the follow-up run outside that restriction exited successfully and a read-only port check confirmed no listener remained on port 3100.

Phase 06 acceptance criteria are fully satisfied. Phase 07 is the next planned phase and remains not started. Deployment remains separately authorized.

### 2026-10-27 — Phase 07 integration, QA, and preview preparation in progress

Implemented:

- Updated the Today milestone to aggregate the complete four-lesson A1 path rather than only the first module.
- Added an authenticated, user-scoped `GET /api/v1/progress` aggregation for lesson completion, vocabulary/SRS evidence, exercise results, completed outcomes, and a seven-day activity timeline.
- Added the progress BFF allowlist entry and a responsive Progress workspace with loading, evidence-free, upstream-error, populated, light/dark, and 375px mobile states. The copy explicitly avoids claiming CEFR certification or unsupported mastery.
- Replaced the Practice placeholder with working routes to SRS review, A1 lesson practice, and grammar practice; linked a completed review session to Progress.
- Added query-supporting user/date indexes without creating a new collection or changing SRS scheduling behavior.
- Added a preview-readiness checklist covering environment variable names, MongoDB isolation, seed policy, security/build gates, health checks, rollback, and evidence capture. No deployment or external infrastructure mutation was performed.
- Completed a five-axis review of correctness, maintainability, architecture, performance, and security. Ownership remains derived from the trusted BFF boundary; every personal aggregation is filtered by `userId`; returned lists are bounded; no unresolved high-severity finding remains.

Observed verification:

| Command or check | Result |
|---|---|
| Focused TDD suites | Passed after observing expected pre-implementation failures: progress snapshot/route/UI, Practice navigation, BFF allowlist, review-to-progress link, and whole-A1 dashboard coverage |
| `npm test` | Passed: 43 files, 158 tests across shared, API, web, and architecture suites; includes the post-review saved-vocabulary-only progress case |
| `npm run test:integration` | Passed: 7 files, 26 tests against the guarded Atlas `_test` database, including progress ownership isolation |
| `npm run typecheck` | Passed for shared, API, and web workspaces |
| `npm run lint` | Passed with no ESLint errors or warnings |
| `npm run format:check` | Passed |
| `npm run build` | Passed; shared contracts, Fastify bundle, and Next.js routes including `/progress` compiled |
| `npm run test:e2e` | Passed: 18 tests across desktop Chromium and mobile Chromium, including 375px progress layout and zero serious/critical axe violations |
| `npm audit --audit-level=high` | Passed with 0 vulnerabilities |
| Live API smoke | Passed on an isolated temporary API port: health, dashboard, and progress returned HTTP 200 with a four-lesson A1 aggregate |
| Live BFF smoke | Passed: `/api/health`, `/api/domain/dashboard`, and `/api/domain/progress` returned HTTP 200 through an authenticated session |
| Secret/generated-file review | `.env.local` remains ignored and untracked; no generated cache, API bundle, Playwright artifact, or credential is included in the intended change set |

The first Playwright run passed all 18 browser cases but Windows denied its sandboxed cleanup command; the approved follow-up exited successfully. Phase 07 remains in progress until the learner completes the deferred manual primary-loop review and any separately authorized preview decision is made.
