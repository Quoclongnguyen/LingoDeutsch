# LingoDeutsch

LingoDeutsch is organized as one repository with separate frontend and backend applications.

## Repository map

```text
apps/
  web/       Next.js frontend and Auth.js boundary
  api/       Fastify API, MongoDB, repositories, services, and seed tooling
packages/
  shared/    Shared Zod contracts, types, and pure vocabulary utilities
docs/        Product and design specifications
harness/     Build phases and observed verification evidence
tests/       Repository architecture checks
```

## Local commands

The vocabulary workspace needs both applications. Open two terminals from the
repository root.

Terminal 1 — backend at `http://localhost:4000`:

```bash
npm run dev:api
```

Terminal 2 — frontend at `http://localhost:3000`:

```bash
npm run dev:web
```

Backend health check:

```text
GET http://localhost:4000/api/v1/health
```

The frontend and backend read local secrets from the root `.env.local`. Only empty variable names belong in `.env.example`.

In development, an empty `NEXT_PUBLIC_API_URL` defaults to
`http://127.0.0.1:4000/api/v1`. The browser talks only to the authenticated
Next.js `/api/domain/*` boundary; it never receives the internal API secret or
chooses a database owner ID.

## Verification

```bash
npm test
npm run test:integration
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run test:e2e
```

Run the idempotent A1 lesson seed from the repository root:

```bash
npm run seed:a1
```
