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

- npm workspaces with `apps/web`, `apps/api`, and `packages/shared`.
- Next.js App Router frontend with TypeScript strict mode.
- Fastify TypeScript backend for domain APIs.
- Tailwind CSS using semantic design tokens from `docs/DESIGN.md`.
- MongoDB Atlas with Mongoose.
- Zod at input boundaries.
- Auth.js or an approved compatible authentication provider.
- Vitest and React Testing Library for focused tests; Playwright for critical flows.

Do not install or replace major dependencies without checking the live repository and the active build phase first.

## Engineering rules

- Keep business logic out of React components and route handlers.
- Place deterministic SRS logic in `apps/api/src/lib/srs` or `apps/api/src/services/review` as pure functions.
- Keep MongoDB access server-side and behind a repository/service layer.
- Derive `userId` from the authenticated server session; never trust a client-provided owner ID.
- Store timestamps in UTC and convert only for display.
- Make review submissions idempotent with a unique `reviewEventId`.
- Prefer soft deletion for vocabulary records that have review history.
- Preserve authentic German characters, capitalization, articles, plural forms, and governed cases.
- Use semantic theme tokens rather than hard-coded page colors.
- Keep controls keyboard-accessible, visibly focused, and at least `44 × 44px` where interactive.

## Workspace boundaries

- `apps/web` owns the browser UI, Next.js routes, and the framework-bound Auth.js session boundary.
- `apps/api` owns domain HTTP APIs, MongoDB access, repositories, services, and seed commands.
- `packages/shared` owns framework-independent contracts, validation, and pure shared utilities.
- Do not import Mongoose or API repositories into `apps/web`.
- Do not import React, Next.js UI modules, or frontend components into `apps/api`.
- Use root scripts for finish gates; use `npm run dev:web` and `npm run dev:api` to start each application independently.

## Testing and verification

- Use red-green-refactor for business logic and behavior changes.
- Add or update tests for every SRS rule, authorization boundary, validation rule, and regression.
- Run the narrowest relevant checks first, then the broader repository checks defined by `package.json`.
- Do not claim a check passed unless its output was observed.
- Record completed phase evidence in `harness/build-log.md`; do not mark planned work complete based only on file existence.

## Git delivery workflow

The user authorizes routine branch creation, commits, pushes, pull requests, and merges for completed repository work under this workflow.

- Use one branch for each independently reviewable feature, fix, refactor, test change, or documentation change. Do not create a branch for every individual function or file when they belong to the same scoped change.
- Create the branch before implementation whenever possible. If the change is already present and uncommitted, verify that it contains no unrelated work before creating the branch; Git will carry the working-tree changes onto the new branch.
- Before creating a branch, inspect `git status --short`, preserve unrelated user changes, switch to `main`, and update it only with `git pull --ff-only origin main` when the working tree is clean.
- Use descriptive branch names: `feat/<short-name>`, `fix/<short-name>`, `refactor/<short-name>`, `test/<short-name>`, or `docs/<short-name>`.
- Complete and verify the scoped change before committing. Run the relevant focused checks first, then every applicable finish gate from the root `package.json`.
- Inspect `git diff` and stage explicit files. Never stage credentials, `.env` files, generated output, or unrelated changes.
- Use Conventional Commits such as `feat(vocabulary): add personal sets` or `fix(api): reject foreign vocabulary ownership`.
- Push the branch with `git push -u origin <branch>` and create a pull request into `main` containing the change summary, validation evidence, and known limitations.
- Merge only when required checks pass, no merge conflict remains, and the pull request contains only the intended scope. Prefer squash merge and delete the remote branch afterward.
- After merging, switch back to `main` and update it with `git pull --ff-only origin main`.
- Never force-push, bypass failing checks, rewrite shared history, or use destructive Git commands. Stop and ask the user if the remote, target branch, authentication, change ownership, or merge safety is ambiguous.

## Repository safety

- Preserve unrelated user changes.
- Never commit credentials, MongoDB URIs, session secrets, tokens, or `.env` files.
- Keep `.env.example` free of real values.
- Git branch, commit, push, pull-request, and merge actions are authorized only through the Git delivery workflow above. Deployment, infrastructure creation, and other external-service changes still require separate explicit authorization.

## Repository skills

- Use `$lingo-german-domain` for German vocabulary, grammar, examples, and learning-content correctness.
- Use `$mongodb-srs` for Mongoose data modeling, indexes, due queues, review state transitions, and review history.
- Use `$stitch-ui-implementation` when implementing or reviewing UI against `docs/DESIGN.md` and Stitch screens.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
