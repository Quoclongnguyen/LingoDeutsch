# Phase 05 — Grammar library

**Status:** Complete

## Outcome

Add a small, structured A1 grammar library that is linked to the existing learning path and lets a learner revisit completed lessons without erasing completion evidence. This phase is content-and-navigation focused; generalized exercise grading belongs to Phase 06.

## Approved decisions

- Preserve the five primary destinations: Today, Learn, Vocabulary, Practice, and Progress.
- Grammar is a secondary destination within Learn, not a sixth primary navigation item.
- Do not add a `courses` collection. Continue to derive the A1 path from lesson `level`, `moduleOrder`, and `lessonOrder`.
- Store grammar as structured data and never render arbitrary HTML.
- Replaying a completed lesson must not downgrade or delete its persisted completion state.

## Dependencies

- Phase 04 learning path, lesson player, dashboard, progress persistence, BFF, and lesson seed must remain intact.
- Vocabulary and SRS contracts from Phases 02–03 must not change except for read-only links from grammar/lessons.
- Read `docs/PRD.md`, `docs/DESIGN.md`, and the repository skills before implementation.

## In scope

- Shared Zod contracts for grammar list/detail content and query validation.
- Mongoose `grammarTopics` model with required indexes.
- Repository/service boundary for published topic list and detail reads.
- Idempotent A1 grammar seed for:
  1. greetings and formal/informal address;
  2. personal pronouns;
  3. `sein` and `haben`;
  4. noun articles `der/die/das`;
  5. present-tense verb conjugation.
- Stable links from each topic to one or more existing lessons.
- Fastify list/detail routes behind the authenticated Next.js BFF.
- A1 grammar list and detail UI inside Learn.
- A replay action for completed lessons that preserves stored completion.
- Loading, empty, error, unpublished/not-found, and populated states.

## Out of scope

- Fill-in-the-blank, word-ordering, score calculation, attempt history, or a generalized exercise engine.
- A content management system, rich-text editor, AI-generated content, A2/B1 content, or a Course model.
- Changes to SRS scheduling, review history, authentication, payments, community, rankings, or deployment.

## Frontend work

- Add a stable Learn sub-navigation between the A1 path and Grammar library.
- Implement the Grammar library blueprint from `docs/DESIGN.md`: A1 filter, calm accordion/list, concise rules, contrastive examples, and at most one compact table per topic.
- Add topic detail links to related lessons and lesson links back to related grammar.
- Add a clear `Luyện lại` action for completed lessons. Replay is an ephemeral viewing mode and must not reset `lessonProgress`.
- Keep German content primary and Vietnamese explanations adjacent and concise.
- Preserve 44px targets, visible focus, keyboard order, reduced motion, light/dark parity, and no horizontal page scroll below 768px.

## Backend work

- Add grammar schemas to `packages/shared`; response contracts must strip internal fields and future answer keys.
- Add the Mongoose model, indexes, repository, service, and routes in `apps/api`.
- Return only published topics, ordered by `level` and `order`.
- Resolve related lessons by stable slug and omit missing/unpublished links from public responses.
- Extend lesson detail output with grammar summaries without changing existing required response fields.
- Add `grammar-topics` to the BFF allowlist with proxy regression tests.

## Database changes

- Create `grammarTopics` with the shape approved in `docs/PRD.md` section 11.10.
- Required indexes:
  - `{ slug: 1 }` unique;
  - `{ level: 1, order: 1, published: 1 }`.
- Seed by stable slug using idempotent upserts. Do not delete existing lessons or vocabulary.

## API endpoints

- `GET /api/v1/grammar-topics?level=A1`
- `GET /api/v1/grammar-topics/:slug`

Browser access remains `/api/domain/grammar-topics...` through the authenticated Next.js boundary.

## Acceptance criteria

1. The A1 list returns exactly the published seeded topics in deterministic order; unpublished topics never appear.
2. Topic detail returns structured Vietnamese rules, authentic German/Vietnamese examples, an optional compact table, and valid related lesson summaries without arbitrary HTML.
3. The five approved seed topics are idempotent: a second seed updates the same records and creates no duplicates.
4. Grammar list/detail routes reject unauthenticated BFF/API access consistently with existing domain routes.
5. Browser-supplied owner headers or query values cannot influence authenticated identity.
6. Learn exposes Grammar as a secondary destination while all five primary navigation destinations remain stable.
7. A completed lesson can be opened in replay mode; exiting replay leaves its completion state and previous activity evidence unchanged.
8. List and detail screens have meaningful loading, empty, error, not-found, and populated states in both themes.
9. Desktop and 375px mobile layouts have no page-level horizontal overflow and all controls are keyboard accessible with visible focus.
10. German content passes domain review for capitalization, umlauts, `ß`, articles, register, pronouns, and conjugation examples.

## Verification plan

Use red-green-refactor for contracts, service behavior, replay semantics, and BFF routing.

- Focused shared validation tests.
- Focused model-index, repository/service, route, seed, proxy, and component tests.
- Atlas integration tests against the guarded `_test` database for published filtering and idempotent seed behavior.
- Playwright: Learn → Grammar → topic → related lesson → replay completed lesson.
- `npm test`
- `npm run test:integration`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`
- Browser review at desktop and 375px in light/dark themes, including keyboard, console, and network inspection.

Do not update `PLANS.md` to mark Phase 05 complete until every acceptance criterion has observed evidence in `harness/build-log.md`.

## Risks and mitigations

- **Incorrect German instruction:** keep the seed small and perform explicit domain review before completion.
- **Content schema becomes a CMS:** accept only the approved structured blocks; do not add generic rich text.
- **Replay corrupts progress:** treat replay as a presentation mode and add regression coverage proving progress is unchanged.
- **Navigation drift:** test that the five primary destinations remain present on desktop and mobile.
