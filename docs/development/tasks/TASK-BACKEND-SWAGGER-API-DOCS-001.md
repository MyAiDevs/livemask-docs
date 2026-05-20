# TASK-BACKEND-SWAGGER-API-DOCS-001 - Backend Swagger / OpenAPI Documentation

> Status: Ready
> Repository: livemask-backend
> Environment: dev-local
> Module: swagger-api
> Issues: livemask-docs#10, livemask-backend#1

## 1. Background

LiveMask backend APIs are already broad enough that future iteration cannot rely
on scattered handler code, smoke scripts, or chat memory to understand request
and response contracts. Backend needs a maintained OpenAPI 3 source of truth so
Admin, App, Website, NodeAgent, Job Service, CI/CD, QA, and future AI tools can
inspect current API behavior quickly.

The OpenAPI/Swagger contract is mandatory: every Backend API route, request
shape, response shape, auth/RBAC requirement, error code, and sensitive-field
redaction rule must match the Swagger/OpenAPI document. Every later API add,
change, or delete must update the OpenAPI document and pass the drift check in
the same task.

Swagger UI visibility is Admin-owned. Backend may serve machine-readable
OpenAPI JSON for Admin/CI consumption, but the human Swagger UI must only be
visible inside `livemask-admin` after a successful Admin login.

This task adds complete, maintainable API documentation for `livemask-backend`.

## 2. Scope

### In Scope

- Add an OpenAPI 3 documentation source for backend APIs.
- Expose a machine-readable OpenAPI JSON endpoint for Admin/CI consumption.
- Add or support a Swagger UI surface that is visible only inside logged-in
  `livemask-admin`.
- Cover the current public, admin, internal agent, internal job, webhook, and
  metrics-facing API families.
- Document authentication schemes, RBAC/security requirements, common error
  shape, pagination/query parameters, and sensitive-field redaction rules.
- Add validation so the OpenAPI document is syntactically valid and does not
  drift silently.
- Add a route/API drift gate: backend implementation, OpenAPI source, and
  Admin Swagger UI source must remain aligned.
- Add README/runbook notes explaining how to view and validate the docs.

### Out of Scope

- Changing API behavior unless an existing endpoint cannot be documented without
  fixing a real bug.
- Adding new product APIs.
- Moving docs ownership from `livemask-docs` into runtime repos.
- Exposing unauthenticated public Swagger UI directly from Backend.
- Exposing secrets, private keys, raw protocol config, payment provider payloads,
  or user credentials in examples.

## 3. Required API Families

The OpenAPI document must include at least these route families from
`livemask-backend/main.go` and their handler packages:

| Family | Examples |
| --- | --- |
| Health / metrics | `/api/v1/health`, `/metrics` |
| Auth / user identity | `/api/v1/auth/*`, `/api/v1/me`, `/admin/api/v1/auth/*` |
| Config center | `/api/v1/config/client`, `/admin/api/v1/configs*` |
| Nodes / NodeAgent | `/api/v1/nodes*`, `/internal/agent/*` |
| Billing / devices | `/api/v1/billing/*`, `/api/v1/devices*`, `/admin/api/v1/billing/*` |
| Growth / referrals / settlements | `/api/v1/me/*`, `/admin/api/v1/growth/*`, internal growth job executors |
| Connect / reconnect | `/api/v1/connect/*`, `/api/v1/reconnect-hints` |
| Content | `/api/v1/content/*`, `/admin/api/v1/content*` |
| GeoIP | `/api/v1/geoip/*`, `/admin/api/v1/geoip/*`, internal GeoIP agent endpoints |
| Releases | `/api/v1/app/releases/latest`, `/admin/api/v1/app/releases*`, NodeAgent release APIs |
| Observability | logs, audit logs, metrics summary, Sentry webhook, exceptions, payment/notification logs |
| System settings / notification settings | `/admin/api/v1/system-settings*`, `/api/v1/app/observability/config`, notification settings/callbacks |
| Dashboard | `/admin/api/v1/dashboard*` |
| Protocol stability | protocol templates, rollouts, assignments, capabilities, agent protocol endpoints |
| Jobs | `/admin/api/v1/jobs*` |

If an endpoint is intentionally omitted, the completion report must list the
reason and create a follow-up TASK.

## 4. Cross-Repo Impact

| Repo | Impact | Next Step |
| --- | --- | --- |
| `livemask-backend` | Owns implementation and OpenAPI artifact | Execute this task |
| `livemask-admin` | Must provide the logged-in Swagger UI surface | Add Admin work in this task or create a linked follow-up if backend scope cannot complete it |
| `livemask-app` | Can use generated docs for App API integration | No code change in this task |
| `livemask-nodeagent` | Can use generated docs for internal agent API integration | No code change in this task |
| `livemask-job-service` | Can use generated docs for internal job executor APIs | No code change in this task |
| `livemask-ci-cd` | May later validate OpenAPI in smoke/CI | Follow-up only if backend task does not add CI coverage |
| `livemask-docs` | Tracks task state and completion evidence | Update after completion report |

## 5. Implementation Requirements

- Prefer a generated or build-validated OpenAPI artifact over hand-maintained
  markdown-only docs.
- Treat OpenAPI as the API contract source of truth after this task lands. Any
  later Backend route add/change/delete must update OpenAPI in the same task.
- The final artifact should be available in the backend repo, for example:
  - `docs/openapi.yaml` or `docs/openapi.json`
  - `internal/swagger` or equivalent embedded/static serving package
  - `/openapi.json` or equivalent JSON route for Admin/CI consumption
- Backend must not expose a public unauthenticated Swagger UI. If Backend serves
  helper assets or JSON, Admin auth/RBAC must still control the human UI.
- `livemask-admin` must show Swagger UI only after Admin login. Recommended
  behavior:
  - route: `/admin/api-docs` or equivalent Admin-only route;
  - requires Admin session/JWT;
  - uses existing Admin auth/RBAC and navigation;
  - fetches OpenAPI JSON through Backend with Admin credentials or via an Admin
    proxy route;
  - unauthenticated users are redirected to login or receive 401/403.
- The Admin Swagger UI must not expose bearer tokens, cookies, secrets, raw
  provider payloads, protocol config, or private keys in the UI or examples.
- Add a validation command such as:
  - OpenAPI schema validation
  - route list coverage check against `main.go`
  - failure when a Backend route changes without OpenAPI update
  - `go test ./...`, `go vet ./...`, `go build ./...`, `git diff --check`
- Add tests for:
  - OpenAPI JSON endpoint returns valid JSON and correct content type.
  - Unauthenticated Swagger UI access is not available directly from Backend.
  - Admin Swagger UI requires login and returns HTTP 200 only after auth.
  - Sensitive examples do not contain forbidden keys such as `private_key`,
    `secret`, `token`, `password`, raw provider payloads, or protocol config.

## 6. Validation Plan

- `go test ./...`
- `go vet ./...`
- `go build ./...`
- OpenAPI validation command chosen by the implementation.
- OpenAPI route coverage check or documented endpoint coverage audit.
- Admin-auth Swagger UI access check.
- Backend unauthenticated Swagger UI denial check.
- `git diff --check`
- Dev merge through `livemask-ci-cd/scripts/dev-merge-guard.sh`, validation
  rerun on backend `dev`, and push to `origin/dev`.

## 7. Acceptance Criteria

- [ ] OpenAPI 3 document exists and validates.
- [ ] Machine-readable OpenAPI JSON is reachable for Admin/CI consumption.
- [ ] Swagger UI is visible only inside logged-in `livemask-admin`.
- [ ] Backend does not expose public unauthenticated Swagger UI.
- [ ] Major backend route families are documented or explicitly deferred with
  follow-up TASKs.
- [ ] Backend route add/change/delete drift check fails if OpenAPI is not
  updated.
- [ ] Auth/RBAC/security requirements are visible per endpoint family.
- [ ] Request/response schemas use real backend types where practical.
- [ ] Sensitive examples are redacted and validated.
- [ ] Backend README/runbook explains how to view and validate API docs.
- [ ] Completion report includes task branch commit, dev merge commit, remote
  `origin/dev`, and validation evidence from merged `dev`.

## 8. Rollback

- Revert Swagger/OpenAPI serving and artifact commits from backend `dev`.
- Confirm core API routes still build and tests pass.
- If OpenAPI serving is exposed by config, disable JSON serving without
  affecting core API behavior; Admin Swagger UI should fail closed when the JSON
  source is unavailable.

## 9. Cursor Task Brief

```markdown
## Cursor Task Brief

TASK ID: TASK-BACKEND-SWAGGER-API-DOCS-001
Parent / Epic TASK: Backend API Documentation / swagger-api
Target repo: livemask-backend
Branch: task/TASK-BACKEND-SWAGGER-API-DOCS-001
Priority: High
Environment: dev-local
Lease:
- registry: `../livemask-docs/docs/development/task-leases.json`
- lease_owner: backend Cursor window
- expected_files:
  - `docs/openapi.*`
  - `internal/swagger/**` or equivalent
  - `main.go`
  - backend README/runbook docs
  - OpenAPI validation scripts/tests
  - Admin Swagger UI integration files if implemented in this task
- expires_at: 2026-05-22T23:59:00+08:00

### Why
- Backend needs a complete Swagger/OpenAPI source of truth for future Admin,
  App, Website, NodeAgent, Job Service, CI/CD, QA, and AI-assisted development.
- All Backend APIs must stay aligned with OpenAPI. Every later API
  add/change/delete must update OpenAPI in the same task.
- Swagger UI must only be visible inside logged-in `livemask-admin`.

### Must Read First
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- `../livemask-docs/docs/development/AI_PROJECT_STATUS_ONBOARDING.md`
- Repo-local `.cursorrules`
- `main.go`
- Existing handler/type packages under `internal/**`

### In Scope
- Add OpenAPI 3 docs and Swagger UI / JSON serving.
- Cover all major route families listed in the task doc.
- Document auth, RBAC, errors, pagination/query params, and redaction rules.
- Add validation and tests.
- Add a drift check that fails when Backend routes and OpenAPI diverge.
- Ensure human Swagger UI is Admin-authenticated, not publicly exposed by Backend.

### Out of Scope / Do Not Touch
- Do not change API behavior except to fix a documentation blocker bug.
- Do not edit `../livemask-docs` directly.
- Do not expose public unauthenticated Swagger UI from Backend.
- Do not expose secrets, raw provider payloads, private keys, protocol config,
  passwords, tokens, or unredacted sensitive examples.

### Expected Files / Areas
- `docs/openapi.yaml` or `docs/openapi.json`
- Swagger serving package/handler
- `main.go` route registration
- README/runbook docs
- Tests and validation script if needed
- Admin Swagger UI integration if included

### Validation Required On Task Branch
- `go test ./...`
- `go vet ./...`
- `go build ./...`
- OpenAPI validation command
- Coverage check against route families or documented endpoint audit
- Drift check for route/OpenAPI alignment
- Auth check proving Swagger UI is visible only inside logged-in Admin
- `git diff --check`

### Dev Merge Requirement
- Merge through `livemask-ci-cd/scripts/dev-merge-guard.sh` or equivalent guard evidence.
- Re-run validation on `dev`.
- Push `origin/dev`.

### Completion Report Must Include
- TASK ID
- Repository / Branch / Commit
- Task Branch / Commit
- Dev Merge Commit
- Remote dev Ref
- Tests and validation on `dev`
- Swagger/OpenAPI routes and how to view them
- Proof that Swagger UI is only visible inside logged-in `livemask-admin`
- Proof that Backend does not expose public unauthenticated Swagger UI
- Endpoint families covered and any explicit deferrals
- Docs handoff evidence
- Risks / skips / follow-up TASK

### Docs Handoff
- Docs update owner: `livemask-docs`
- Runtime repo must not edit `../livemask-docs`
- Task ledger update needed: yes
- GitHub Issue sync needed: yes

### Next Unlock Conditions
- Admin/App/NodeAgent/Job Service can use OpenAPI docs for API integration.
- CI/CD can add a later OpenAPI drift/smoke check if backend validation does
  not already cover it.
```
