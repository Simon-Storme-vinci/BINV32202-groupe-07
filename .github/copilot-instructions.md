# Gesta project guidelines

## Build, test, and lint

Run commands from the repository root. The project requires Node.js `>=22.14.0`
(Node 24 LTS is recommended) and uses npm workspaces.

```bash
npm ci
npm run setup                 # create backend/.env and initialize seeded SQLite data
npm run dev                   # API on http://localhost:3000, frontend on http://localhost:5173
npm run lint                  # Oxlint; warnings are errors
npm run typecheck             # TypeScript checks for both workspaces
npm test                      # all Vitest tests
npm run build                 # compile backend and build frontend
npm run check                 # lint + typecheck + tests + build
```

Run one test file with Vitest, for example:

```bash
npm exec vitest run backend/tests/offers.test.ts
npm exec vitest run frontend/tests/OffersPage.test.tsx
```

Run one test by name with `-t`:

```bash
npm exec vitest run backend/tests/offers.test.ts -t "refuse une requête sans session"
```

Workspace-specific commands can be run with `npm run <script> -w backend` or
`npm run <script> -w frontend`. Use `npm run db:init` to apply migrations and seed an
empty database. Stop the development server before `npm run db:reset`, because the
SQLite file is held open while the API is running.

## Architecture

This is an npm-workspaces TypeScript monorepo:

- `backend/` is an Express API backed by a local SQLite database through
  `better-sqlite3`.
- `frontend/` is a React 19 application built with Vite and React Router.
- Vite serves the frontend on port 5173 and proxies `/api/...` to the backend on port
  3000, stripping `/api`; backend routes themselves do not include that prefix.
- The backend is assembled in `backend/src/app.ts` using dependency-injected factories:
  controllers handle HTTP concerns, services contain business rules, repositories own
  SQL, and mappers convert database rows to API DTOs. Authentication and authorization
  are middleware plus named rules in `backend/src/services/permissions.ts`.
- Database migrations in `backend/src/db/migrations/` are applied in filename order and
  tracked in `schema_migrations`. Add a new numbered SQL migration for schema changes;
  never edit an already-applied migration.
- The frontend follows `pages -> hooks -> services/utils -> models`, with reusable UI
  in `components`. `App.tsx` is the single owner of `useAuth`; pages receive the
  session token and unauthorized callback rather than creating independent auth state.
- Backend tests assemble the full app over an in-memory SQLite database and use
  Supertest. Frontend tests use Vitest, jsdom, Testing Library, and the fetch stubs in
  `frontend/tests/helpers/fetchMock.ts`.

See [docs/architecture.md](../docs/architecture.md) for the detailed layer and request
flows, [backend/API.md](../backend/API.md) for the HTTP contract, and
[docs/seed.md](../docs/seed.md) for demo identities and stable seed IDs.

## Repository conventions

- Keep HTTP parsing/validation in controllers, business decisions in services, and SQL
  in repositories. Services must not depend on Express `Request` or `Response`.
- Build errors with `throw new HttpError(status, code, message)` so the central
  `errorHandler` returns `{ "error": { "code", "message" } }`. Preserve the documented
  status/code contract for 400, 401, 403, 404, and 500 responses.
- Enforce permissions on the backend with `authenticate`/`authorize` and service
  filtering; hiding a navigation item in React is not an access control mechanism.
  Authentication reloads the account, roles, and companies from the database on every
  request.
- The `Authorization` header contains the JWT directly, without a `Bearer` prefix.
  The API port variable is `API_PORT`, not `PORT`.
- Backend relative imports intentionally include the `.ts` extension; TypeScript
  rewrites them to `.js` in the compiled output.
- API services must check the HTTP status and validate response JSON with a hand-written
  type guard before exposing it to hooks/components. Frontend status codes of 401 should
  trigger the existing unauthorized/session reset flow.
- Database status and role values remain stable English codes (for example `PUBLISHED`
  and `DEPOSITOR`); translate them to French labels in frontend presentation utilities.
- The local demo login is intentionally passwordless and development-only. Do not treat
  it as real authentication or enable it in production.
- Use the stable IDs in `backend/src/db/seed/seedIds.ts` in backend tests rather than
  scattering unexplained numeric IDs. Do not let tests use the development database.
- When changing an endpoint, update `backend/API.md` and the matching
  `backend/http/*.http` request. When changing the schema, add a migration and update
  relevant seed/test data.
- Before substantial changes, run `npm run check`. Pull requests follow the repository
  checklist in [.github/pull_request_template.md](./pull_request_template.md), including
  backend authorization tests, API documentation, migration review, and browser testing
  where applicable.
