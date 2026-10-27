# Preview readiness checklist

This checklist prepares Lingo Deutsch for a separately authorized preview. It does not authorize creating infrastructure, changing Atlas, seeding a remote database, or deploying either application.

## 1. Target and ownership

- [ ] Record the approved preview web host, API host, region, and owner.
- [ ] Confirm that preview is isolated from production and local development.
- [ ] Confirm that the preview URL is permitted in the GitHub OAuth application.
- [ ] Confirm who may trigger a deployment and who may roll it back.

## 2. Environment variables

Set values in the hosting provider's secret store. Never paste values into source files, logs, screenshots, issues, or pull requests.

### API

- `MONGODB_URI`
- `API_PORT`
- `WEB_ORIGIN`
- `INTERNAL_API_SECRET`

### Web

- `NEXT_PUBLIC_API_URL`
- `INTERNAL_API_SECRET`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`

`INTERNAL_API_SECRET` must match between web and API. `NEXT_PUBLIC_API_URL` may contain only the public API base URL; no credential may use the `NEXT_PUBLIC_` prefix.

## 3. MongoDB isolation

- [ ] Use a dedicated preview database whose name is visibly different from production and does not end in `_test`.
- [ ] Use a dedicated least-privilege Atlas database user for preview.
- [ ] Restrict the Atlas IP access list to the approved preview egress addresses. Do not use `0.0.0.0/0` for an open preview.
- [ ] Verify the database name from a read-only connection before any seed command.
- [ ] Confirm backups or snapshot policy for the selected Atlas plan.
- [ ] Never point integration tests at preview; integration tests remain guarded to a database ending in `_test`.

## 4. Seed policy

- [ ] Run `npm run seed:a1` only after the target database has been reviewed and explicitly approved.
- [ ] Record the pre-seed counts for `lessons` and `grammarTopics`.
- [ ] Run the idempotent seed once, review inserted/updated/matched counts, then run it a second time to confirm no duplicate inserts.
- [ ] Do not seed personal vocabulary, review history, lesson progress, or exercise attempts.

## 5. Build and security gates

Run from a clean checkout of the approved commit:

```bash
npm ci
npm test
npm run test:integration
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:e2e
npm audit --audit-level=high
```

- [ ] Verify `.env.local`, generated caches, API `dist`, Playwright results, and test database data are absent from the commit.
- [ ] Review BFF allowlisted roots and confirm browser requests cannot supply `userId`.
- [ ] Confirm API logs contain no tokens, cookies, connection strings, or submitted personal content.

## 6. Health and smoke checks

After an authorized deployment:

- [ ] API `GET /api/v1/health` returns HTTP 200 and `{ "status": "ok" }`.
- [ ] Web `GET /api/health` returns HTTP 200.
- [ ] Unauthenticated access to a protected page redirects to sign-in.
- [ ] Authenticated BFF requests for dashboard, learning path, vocabulary, review, grammar, exercises, and progress return expected status codes.
- [ ] Complete the primary loop: Today → Lesson → Grammar → Exercise → save vocabulary → SRS review → Progress.
- [ ] Check desktop and 375px mobile in light and dark themes with no page-level horizontal overflow or console errors.

## 7. Rollback

- [ ] Record the previously healthy web and API release identifiers before deployment.
- [ ] Keep database migrations out of this preview; current Phase 07 changes add only indexes that can coexist with the previous application release.
- [ ] If health or primary-loop checks fail, restore both web and API to their recorded prior releases.
- [ ] Do not delete user data during rollback. If a seed error is suspected, stop writes and inspect counts before any corrective action.
- [ ] Re-run both health checks and the Today/Progress smoke checks after rollback.

## 8. Evidence to record

Record the approved target, commit SHA, commands, results, URLs, database name (not the connection string), seed counts, smoke results, and rollback release identifiers in `harness/build-log.md`. Never record secret values.
