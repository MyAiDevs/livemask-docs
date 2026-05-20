# TASK-BACKEND-OPENAPI-RUNTIME-ROUTE-FIX-001 - Backend OpenAPI Runtime Route Fix

> Status: Ready
> Repository: livemask-backend
> Environment: dev-local
> Priority: P0
> Module: swagger-api
> Created: 2026-05-21
> Unblocked by: TASK-BACKEND-SWAGGER-API-DOCS-001
> Discovered by: TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001
> Issues: livemask-docs#16, livemask-backend#2

## 1. Background

`TASK-BACKEND-SWAGGER-API-DOCS-001` reported that Backend serves:

- `GET /openapi.yaml`
- `GET /openapi.json`

`TASK-ADMIN-SWAGGER-API-DOCS-UI-001` then wired logged-in Admin Swagger UI to
fetch Backend OpenAPI through same-origin Admin rewrites:

- `/admin/openapi.json` -> Backend `/openapi.json`
- `/admin/openapi.yaml` -> Backend `/openapi.yaml`

During `TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001`, Admin proved that
`/admin/api-docs` itself is healthy, but runtime curl evidence showed:

- `GET /admin/api-docs` -> HTTP 200
- `GET /admin/api/build-info` -> HTTP 200
- `GET /admin/openapi.json` -> HTTP 404
- `GET http://localhost:8080/openapi.json` -> HTTP 404

Therefore the remaining blocker is Backend runtime route availability, not
Admin stale cache or route registration.

## 2. Scope

### In Scope

- Verify whether Backend `dev` currently registers `/openapi.json` and
  `/openapi.yaml` in the actual runtime entrypoint used by dev-local and CI.
- Fix route registration or embedded spec wiring so both endpoints return HTTP
  200 with valid OpenAPI content.
- Preserve the existing rule that Backend must not expose public Swagger UI.
- Ensure CORS/cache headers remain safe for Admin/CI consumption.
- Add regression tests proving:
  - `GET /openapi.json` returns HTTP 200 with valid JSON;
  - `GET /openapi.yaml` returns HTTP 200 with YAML content;
  - public `/swagger/`, `/swagger`, and `/docs` style human UI routes remain
    unavailable unless explicitly Admin-authenticated elsewhere;
  - OpenAPI spec content is not empty and contains paths.
- Run existing OpenAPI drift validation.

### Out of Scope

- Changing Admin Swagger UI.
- Adding new Backend business APIs.
- Editing `../livemask-docs` from the Backend runtime window.
- Exposing a public unauthenticated human Swagger UI from Backend.

## 3. Required Reading

- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- `../livemask-docs/docs/development/tasks/TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001.md`
- `../livemask-docs/docs/DEVELOPMENT.md`
- Repo-local `.cursorrules`
- Backend runtime entrypoint(s), route registration, and `internal/swagger/**`

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Primary fix: runtime must serve `/openapi.json` and `/openapi.yaml`. |
| `livemask-admin` | Unblocked once Admin proxy `/admin/openapi.json` can fetch Backend spec. |
| `livemask-ci-cd` | OpenAPI drift smoke can become stronger once runtime endpoint is stable. |
| `livemask-docs` | Records completion evidence after Backend report. |

## 5. Cursor Task Brief

```markdown
## Cursor Task Brief

TASK ID: TASK-BACKEND-OPENAPI-RUNTIME-ROUTE-FIX-001
Parent / Epic TASK: TASK-BACKEND-SWAGGER-API-DOCS-001
Target repo: livemask-backend
Branch: task/TASK-BACKEND-OPENAPI-RUNTIME-ROUTE-FIX-001
Priority: P0
Environment: dev-local

### Why
- Admin API Docs now proves `/admin/api-docs` is healthy.
- The remaining blocker is Backend runtime: `GET http://localhost:8080/openapi.json`
  returns HTTP 404, which makes Admin `/admin/openapi.json` return 404.
- Backend must serve machine-readable OpenAPI JSON/YAML for Admin and CI while
  keeping public Swagger UI unavailable.

### Must Read First
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-OPENAPI-RUNTIME-ROUTE-FIX-001.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-SWAGGER-API-DOCS-001.md`
- `../livemask-docs/docs/development/tasks/TASK-ADMIN-API-DOCS-CACHE-INVALIDATION-001.md`
- Repo-local `.cursorrules`

### In Scope
- Fix Backend route registration/spec serving for `/openapi.json` and
  `/openapi.yaml`.
- Add/repair regression tests for OpenAPI JSON/YAML endpoints and no public
  Swagger UI.
- Run route drift/spec validation.

### Out of Scope / Do Not Touch
- Do not edit `../livemask-docs` from Backend repo.
- Do not change Admin code.
- Do not expose public unauthenticated Swagger UI.
- Do not add unrelated business APIs.

### Expected Files / Areas
- Backend runtime route registration / main entrypoint
- `internal/swagger/**`
- `docs/openapi.yaml`
- `docs/openapi.json`
- Backend tests for swagger/openapi routes
- `scripts/validate-openapi.sh` only if validation misses this runtime route

### Contract / API Rules
- `/openapi.json` and `/openapi.yaml` are machine-readable Backend endpoints
  for Admin/CI consumption.
- Human Swagger UI must remain Admin-only through `livemask-admin`.
- Every Backend API add/change/delete must keep OpenAPI aligned.

### Validation Required On Task Branch
- `go test ./...`
- `go vet ./...`
- `go build ./...`
- `bash scripts/validate-openapi.sh`
- `git diff --check`
- Runtime curl evidence:
  - `curl -I http://127.0.0.1:8080/openapi.json`
  - `curl -I http://127.0.0.1:8080/openapi.yaml`
  - `curl -I http://127.0.0.1:8080/swagger/`

### Dev Merge Requirement
- Merge through `livemask-ci-cd/scripts/dev-merge-guard.sh` or equivalent guard
  evidence.
- Re-run validation on `dev`.
- Push `origin/dev`.

### Completion Report Must Include
- TASK ID
- Repository / Branch / Commit
- Task Branch / Commit
- Dev Merge Commit
- Remote dev Ref
- Tests and validation on `dev`
- Exact curl evidence for `/openapi.json`, `/openapi.yaml`, and forbidden public
  Swagger UI route(s)
- Confirmation that Admin `/admin/openapi.json` can load through proxy when
  Admin is pointed at this Backend runtime
- Docs handoff evidence
```

## 6. Acceptance Criteria

- [ ] Backend runtime returns HTTP 200 for `/openapi.json`.
- [ ] Backend runtime returns HTTP 200 for `/openapi.yaml`.
- [ ] Returned JSON/YAML is valid, non-empty, and includes OpenAPI paths.
- [ ] Public human Swagger UI routes remain unavailable from Backend.
- [ ] Backend OpenAPI validation and drift checks pass.
- [ ] Completion report includes task branch commit, dev merge commit, remote
  `origin/dev` ref, validation on `dev`, and curl evidence.

## 7. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Fix exposes public Swagger UI | Security regression | Only expose machine-readable JSON/YAML; keep UI Admin-only. |
| Route fixed in tests but not real dev-local entrypoint | Admin still sees 404 | Require runtime curl evidence from `127.0.0.1:8080`. |
| OpenAPI artifacts are stale | API docs drift | Run `scripts/validate-openapi.sh` and update artifacts only if required. |

## 8. Rollback

- Rollback trigger: Backend startup fails, OpenAPI endpoint leaks secrets, or
  public human Swagger UI becomes accessible.
- Rollback steps: revert the Backend task merge using a normal revert commit.
- Rollback verification: Backend health passes, public Swagger UI remains
  unavailable, and OpenAPI validation state is documented.

## 9. Completion Evidence

- Task branch:
- Task branch commit:
- Dev merge commit:
- Remote dev ref:
- Validation:
- Runtime curl evidence:
- Admin proxy evidence:
- Docs handoff:

## 10. Follow-up

- After Backend runtime route fix lands, CI/CD may add an authenticated Admin
  API Docs proxy smoke that verifies `/admin/openapi.json` reaches Backend.
