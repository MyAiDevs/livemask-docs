# TASK-ADMIN-SWAGGER-API-DOCS-UI-001 - Admin-Authenticated Swagger UI

> Status: blocked
> Repository: livemask-admin
> Environment: dev-local
> Blocked by: TASK-BACKEND-SWAGGER-API-DOCS-001
> Module: swagger-api
> Issues: livemask-docs#13, livemask-admin#2

## 1. Background

Backend OpenAPI/Swagger is the mandatory API contract source of truth after
`TASK-BACKEND-SWAGGER-API-DOCS-001`. The human Swagger UI must not be exposed as
a public Backend route. It must be visible only inside `livemask-admin` after a
successful Admin login.

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

- [ ] Swagger UI is reachable only from `livemask-admin` after Admin login.
- [ ] Backend does not expose public unauthenticated Swagger UI.
- [ ] Admin route handles unavailable OpenAPI JSON safely.
- [ ] Tests cover logged-out denial and logged-in success.
- [ ] Completion report includes task branch commit, dev merge commit, remote
  `origin/dev`, and validation evidence from merged `dev`.
