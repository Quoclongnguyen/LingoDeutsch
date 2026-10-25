# Phase 00 — Repository foundation

Status: Complete

## Source inputs

- `AGENTS.md`
- `PLANS.md`
- `docs/PRD.md`
- `docs/DESIGN.md`

## Objective

Create a clean, verifiable foundation for the Lingo Deutsch MVP without implementing product features from later phases.

## In scope

- Next.js App Router with TypeScript strict mode.
- Tailwind CSS and semantic light/dark tokens derived from `docs/DESIGN.md`.
- Linting, formatting, Vitest, React Testing Library, and Playwright configuration.
- MongoDB/Mongoose connection boundary with environment validation.
- Authentication skeleton and protected application shell.
- `.env.example` with names only and no secrets.
- Minimal health or smoke checks proving the foundation starts and builds.

## Explicit non-goals

- Vocabulary CRUD, import, sets, due queues, SRS rating, lessons, dashboard data, or progress analytics.
- Production infrastructure or deployment.
- Real credentials or automatic creation of external accounts/services.
- Marketplace, payments, classrooms, community, ranking, or gamification.

## Dependencies and decisions

- A Node.js package manager must be selected from the environment already used by the repository; do not create mixed lockfiles.
- MongoDB Atlas credentials and Auth secret are user-managed and require separate setup.
- Dependency versions should be selected from the current stable ecosystem at implementation time and recorded in the lockfile.

## Expected areas affected

- Application manifest and lockfile.
- `src/app`, `src/components`, `src/lib`, `src/styles`, and test configuration.
- Environment example and repository ignore rules.
- This phase file and `harness/build-log.md` after verification.

## Red-green-refactor and verification

1. Add a failing environment/configuration or smoke test where meaningful.
2. Implement the smallest foundation that satisfies the test.
3. Refactor configuration and boundaries without adding feature behavior.
4. Run the package scripts for typecheck, lint, unit tests, production build, and a Playwright smoke test.
5. Record exact commands and observed outcomes in `harness/build-log.md`.

## Acceptance criteria

- A clean checkout can install dependencies using the committed lockfile.
- The app starts locally and the protected shell renders.
- Missing required server environment values fail with a clear message and no secret output.
- Light/dark semantic tokens exist and theme selection can initialize without a flash of the wrong theme.
- Typecheck, lint, unit tests, production build, and the smoke test pass.
- No Phase 01+ feature behavior is implemented.

## Handoff condition

Phase 00 may be marked complete only after its verification evidence is appended to `harness/build-log.md`. Then Phase 01 may begin.

## Completion

Completed on 2026-10-25. Verification evidence is recorded in `harness/build-log.md`.
