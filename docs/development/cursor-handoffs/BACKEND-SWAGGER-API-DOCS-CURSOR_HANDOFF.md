# Backend Swagger / OpenAPI Cursor Handoff

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
- expires_at: 2026-05-22T23:59:00+08:00

### Why

- Backend needs a complete Swagger/OpenAPI source of truth for future Admin,
  App, Website, NodeAgent, Job Service, CI/CD, QA, and AI-assisted development.

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

### Out of Scope / Do Not Touch

- Do not change API behavior except to fix a documentation blocker bug.
- Do not edit `../livemask-docs` directly.
- Do not expose secrets, raw provider payloads, private keys, protocol config,
  passwords, tokens, or unredacted sensitive examples.

### Expected Files / Areas

- `docs/openapi.yaml` or `docs/openapi.json`
- Swagger serving package/handler
- `main.go` route registration
- README/runbook docs
- Tests and validation script if needed

### Validation Required On Task Branch

- `go test ./...`
- `go vet ./...`
- `go build ./...`
- OpenAPI validation command
- Coverage check against route families or documented endpoint audit
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
