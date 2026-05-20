# TASK-ADMIN-SWAGGER-API-DOCS-UI-001 - Admin-Authenticated Swagger UI

> Status: Completed
> Repository: livemask-admin
> Environment: dev-local
> Unblocked by: TASK-BACKEND-SWAGGER-API-DOCS-001 (`livemask-backend` dev `9de2f14`)
> Module: swagger-api
> Issues: livemask-docs#13, livemask-admin#2

## 1. Background

Backend OpenAPI/Swagger is the mandatory API contract source of truth after
`TASK-BACKEND-SWAGGER-API-DOCS-001`. The human Swagger UI must not be exposed as
a public Backend route. It must be visible only inside `livemask-admin` after a
successful Admin login.

Backend is now ready at `origin/dev` `9de2f14`:

- `GET /openapi.yaml`
- `GET /openapi.json`
- `internal/swagger/swagger-ui.html` embeddable template
- no public `/swagger/` route
- `scripts/validate-openapi.sh` PASS 22/22 checks

## 2. Scope

### In Scope

- Add an Admin-only API docs route, for example `/admin/api-docs`.
- Require existing Admin authentication/session before rendering Swagger UI.
- Fetch OpenAPI JSON from Backend with Admin credentials or through an Admin
  proxy route.
- Show loading, error, unauthorized, and unavailable states.
- Ensure the UI does not expose bearer tokens, cookies, private keys, provider
  secrets, raw protocol config, payment payloads, or other sensitive examples.
- Add tests proving unauthenticated users cannot view the Swagger UI and
  authenticated Admin users can.

### Out of Scope

- Editing Backend Go code.
- Changing Backend API behavior.
- Editing `../livemask-docs` directly from the Admin runtime window.

## 3. Required Reading

- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- `../livemask-docs/docs/backend/README.md`
- `../livemask-docs/docs/DEVELOPMENT.md`
- Repo-local `.cursorrules`

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Provides validated OpenAPI JSON and route/API drift gate. |
| `livemask-admin` | Owns logged-in Swagger UI surface. |
| `livemask-docs` | Records Admin completion evidence after report. |

## 5. Validation Plan

- Admin unit/component tests for logged-out denial and logged-in rendering.
- Admin build/test command used by the repo.
- Browser or Playwright evidence for:
  - logged-out user cannot view Swagger UI;
  - logged-in Admin can view Swagger UI;
  - UI fetches current OpenAPI JSON.
- `git diff --check`.
- Dev merge through `livemask-ci-cd/scripts/dev-merge-guard.sh`, validation
  rerun on Admin `dev`, and push `origin/dev`.

## 6. Acceptance Criteria

- [x] Swagger UI is reachable only from `livemask-admin` after Admin login.
- [x] Backend does not expose public unauthenticated Swagger UI.
- [x] Admin route handles unavailable OpenAPI JSON safely.
- [x] Tests cover logged-out denial and logged-in success.
- [x] Completion report includes task branch commit, dev merge commit, remote
  `origin/dev`, and validation evidence from merged `dev`.

## 7. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-ADMIN-SWAGGER-API-DOCS-UI-001` |
| Task branch commit | `df1af3a` |
| Dev merge commit | `656d4d9` |
| Remote dev ref | `origin/dev` (`656d4d9`) |
| Validation | `npx vitest run` PASS 217/217; `npx next build` PASS with 56/56 pages generated; `git diff --check` PASS; dev merge validation reran vitest and build on `dev` |
| Issues | `livemask-docs#13`, `livemask-admin#2` |

Implemented Admin behavior:

- Added `/admin/api-docs` route using `swagger-ui-react` with dynamic client-side
  loading.
- Route is protected by the existing Admin `AuthGuard`; unauthenticated users
  are redirected to `/login`.
- Added `lib/swagger-api.ts` with `fetchOpenApiSpec()` through same-origin
  `/admin/openapi.json` proxy and bearer token injection.
- Added Swagger UI `requestInterceptor` to inject bearer token and rewrite
  "Try it out" calls through the same-origin Next.js proxy.
- Added `next.config.ts` rewrites for `/admin/openapi.json` and
  `/admin/openapi.yaml` to Backend.
- Added API Docs sidebar navigation with `BookOpen` icon.
- Added loading, success, error, and unavailable states.
- `tryItOutEnabled={false}` by default; token handling stays inside the
  interceptor and is not displayed in UI.

Remaining linked work:

- `TASK-CICD-OPENAPI-DRIFT-CHECK-001`
