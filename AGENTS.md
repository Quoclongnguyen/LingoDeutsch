# Lingo Deutsch repository instructions

## Purpose

Build a private, personal German-learning application for a Vietnamese learner. The MVP centers on one complete loop: learn a word, save it, schedule it, review it, and record the next due date.

## Sources of truth

Read only what is relevant to the current task:

1. `docs/PRD.md` owns product scope, data contracts, SRS rules, acceptance criteria, and phase boundaries.
2. `docs/DESIGN.md` owns visual tokens, responsive behavior, accessibility, and screen rules.
3. `PLANS.md` owns phase order and current planned work.
4. `harness/build/<phase>.md` owns the approved scope and verification plan for one phase.
5. `harness/build-log.md` records observed results only after implementation and verification.

Do not duplicate large sections of these documents into code comments or other planning files.

## Product boundaries

- Implement only the MVP or an explicitly approved later phase.
- Do not add payments, Pro plans, marketplace, classrooms, community, leaderboards, coins, XP stores, or public vocabulary sharing.
- Keep changeable visa, study, and employment requirements separate from language-learning guidance.
- Do not make medical, legal, admission, employment, or visa guarantees.

## Intended stack

- Next.js App Router with TypeScript strict mode.
- Tailwind CSS using semantic design tokens from `docs/DESIGN.md`.
- MongoDB Atlas with Mongoose.
- Zod at input boundaries.
- Auth.js or an approved compatible authentication provider.
- Vitest and React Testing Library for focused tests; Playwright for critical flows.

Do not install or replace major dependencies without checking the live repository and the active build phase first.

## Engineering rules

- Keep business logic out of React components and route handlers.
- Place deterministic SRS logic in `src/lib/srs` or `src/services/review` as pure functions.
- Keep MongoDB access server-side and behind a repository/service layer.
- Derive `userId` from the authenticated server session; never trust a client-provided owner ID.
- Store timestamps in UTC and convert only for display.
- Make review submissions idempotent with a unique `reviewEventId`.
- Prefer soft deletion for vocabulary records that have review history.
- Preserve authentic German characters, capitalization, articles, plural forms, and governed cases.
- Use semantic theme tokens rather than hard-coded page colors.
- Keep controls keyboard-accessible, visibly focused, and at least `44 × 44px` where interactive.

## Testing and verification

- Use red-green-refactor for business logic and behavior changes.
- Add or update tests for every SRS rule, authorization boundary, validation rule, and regression.
- Run the narrowest relevant checks first, then the broader repository checks defined by `package.json`.
- Do not claim a check passed unless its output was observed.
- Record completed phase evidence in `harness/build-log.md`; do not mark planned work complete based only on file existence.

## Repository safety

- Preserve unrelated user changes.
- Never commit credentials, MongoDB URIs, session secrets, tokens, or `.env` files.
- Keep `.env.example` free of real values.
- Do not commit, push, deploy, create infrastructure, or change external services unless the user explicitly authorizes that action.

## Repository skills

- Use `$lingo-german-domain` for German vocabulary, grammar, examples, and learning-content correctness.
- Use `$mongodb-srs` for Mongoose data modeling, indexes, due queues, review state transitions, and review history.
- Use `$stitch-ui-implementation` when implementing or reviewing UI against `docs/DESIGN.md` and Stitch screens.
