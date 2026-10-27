# Phase 07 — Integration, QA, and preview

**Status:** In progress

## Outcome

Connect the existing dashboard, A1 path, grammar, exercises, vocabulary, and SRS into one reliable learning loop; replace remaining core placeholders with evidence-backed progress; harden the application for an optional preview deployment.

## Dependencies

- Phases 00–06 must be complete with observed evidence.
- Preview infrastructure and deployment require separate user authorization even when all code acceptance criteria pass.
- Production credentials, DNS, hosting plans, and Atlas network changes are not authorized by this build plan alone.

## In scope

- Dashboard aggregate A1 progress and next useful action.
- Integrated navigation and cross-links across lesson, grammar, exercise, vocabulary, review, and progress.
- Evidence-backed Progress screen using lesson progress, exercise attempt summaries, and SRS review history.
- Responsive, accessibility, security, error-state, and performance QA for the expanded MVP.
- Regression coverage for existing vocabulary/SRS/authentication boundaries.
- Preview configuration documentation and a deployment readiness checklist.
- Preview deployment only after explicit authorization during this phase.

## Out of scope

- New learning capabilities, A2/B1 expansion, AI, speech scoring, payments, community, rankings, CMS, microservices, or production launch.
- Infrastructure creation or external-service mutation without explicit approval.
- Replacing MongoDB, Fastify, Next.js, Auth.js, or the tested SRS algorithm.

## Frontend work

- Update Today to show whole-A1 progress rather than only the first-module milestone.
- Ensure the primary flow has no dead ends: Today → Lesson → Grammar → Exercise → Vocabulary save → SRS review → Progress.
- Replace the Progress placeholder with restrained, exact evidence: completed lessons, reviewed vocabulary, recent exercise results, and study activity. Avoid unsupported readiness or mastery claims.
- Audit all expanded screens at desktop, tablet, and 375px mobile in both themes.
- Verify loading skeletons, useful empty states, recoverable errors, keyboard navigation, reduced motion, and stable five-item navigation.

## Backend work

- Extend the existing dashboard aggregation rather than adding multiple client waterfalls.
- Add only the progress aggregation needed by the approved UI; reuse existing repositories and bounded queries.
- Review all new routes for Zod validation, authenticated identity, user-scoped filters, error mapping, request limits, and sanitized logs.
- Review indexes and query shapes with realistic A1 data volume; do not add speculative caches or services.

## Database and API changes

- No new collection is expected. Any proposed collection or broad schema expansion requires a new PRD decision.
- Prefer extending `GET /api/v1/dashboard` and adding one bounded `GET /api/v1/progress` endpoint if the UI cannot be served cleanly by existing aggregate responses.
- Keep browser access behind the authenticated BFF and add allowlist/proxy tests for any new root.

## Acceptance criteria

1. Today reports exact whole-A1 lesson completion and a single valid next action from real data.
2. The complete learning loop works without dead links, client-visible API secrets, user-controlled ownership, or duplicate vocabulary.
3. Progress shows only evidence derived from lesson progress, review logs/states, and exercise attempts; no fabricated precision or certification claim appears.
4. Vocabulary and SRS behavior, idempotency, due counts, and recovery remain unchanged and all regressions stay green.
5. Core pages work at 375px without page-level horizontal scroll and retain the five primary destinations.
6. Keyboard-only completion is possible for review and all three exercise types; focus is always visible.
7. Automated accessibility checks report no serious or critical violations on core screens, with manual review for labels, announcements, reading order, and contrast.
8. Loading, empty, validation, unauthorized, not-found, upstream failure, and retry states are meaningful and recoverable.
9. A clean production build completes and live web/API smoke checks return expected status codes with no browser console errors in the primary flows.
10. No secret, `.env.local`, generated cache, test database data, or unrelated user change is committed.
11. A preview checklist documents environment variables, health checks, seed policy, rollback, and MongoDB database isolation.
12. No deployment occurs until the user separately approves the target and external mutations.

## Verification plan

- Focused dashboard/progress aggregation tests and route/component regressions.
- Full unit and architecture suites.
- Atlas integration suite against the guarded `_test` database.
- Playwright across dashboard, learning, grammar, exercises, vocabulary, review, progress, theme persistence, mobile, and accessibility.
- Live local web/API/BFF smoke checks from clean processes.
- `npm test`
- `npm run test:integration`
- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run test:e2e`
- `npm audit --audit-level=high`
- Manual security review for secrets, ownership, validation, logs, and BFF allowlists.

If preview deployment is separately authorized, record the exact target, commands, URL, health checks, and rollback evidence in `harness/build-log.md`. Do not mark Phase 07 complete based only on a successful build or deployed URL.

## Risks and mitigations

- **Integration scope creep:** Phase 07 adds no new learning capability; defer feature requests to a later PRD decision.
- **Dashboard query growth:** keep a single bounded aggregation and verify indexes/query plans before caching.
- **False progress claims:** display source-backed counts and describe CEFR readiness as an estimate only if later approved.
- **Preview uses the wrong database:** require explicit environment/database review and a read-only verification before any seed command.
- **Deployment mistaken for authorization:** keep code readiness and external deployment as separate gates.
