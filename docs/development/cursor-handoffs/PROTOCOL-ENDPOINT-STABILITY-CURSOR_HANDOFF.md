# Protocol Endpoint Stability Cursor Handoff

> Task family: `TASK-DOC-PROTOCOL-STABILITY-GATE-001`
> Scope: NodeAgent multi-protocol and multi-endpoint implementation readiness,
> Admin real node detail APIs, Backend-owned reconnect hints, and VPN stability
> QA.

## 1. Read First

Every Cursor window must read these files before writing code:

- `docs/contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md`
- `docs/contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md`
- `docs/development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md`
- `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
- `docs/architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md`
- `ai-rules/v3.7/00-Core-Principles.md`
- `ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `ai-rules/v3.7/13-Multi-Repo-Development.md`

## 2. Non-Negotiable Architecture Rules

1. NodeAgent never notifies App directly.
2. NodeAgent pulls assignments and reports events to Backend.
3. Backend owns App reconnect hints and connect_config eligibility.
4. Job Service owns wave rollout, retry/backoff, dead-letter, pause, rollback,
   and per-node locks.
5. Admin uses Backend APIs only. No browser call to NodeAgent, Job Service, or
   Prometheus.
6. App receives reconnect hints, then pulls fresh config. The hint never embeds
   NodeAgent secrets or full connect config.
7. Mock data in Admin must be removed or clearly marked with a tracked backend
   endpoint gap.
8. No completion report may say `completed` unless tests and validation cover
   happy path, rollback, unsupported protocol, secret leak, and at least one
   failure path.

## 3. Backend Cursor Task

Repository: `livemask-backend`
Task ID: `TASK-BACKEND-PROTOCOL-STABILITY-001`

### Goal

Implement the Backend authority layer for protocol templates, template versions,
node capabilities, node detail real APIs, endpoint eligibility, and reconnect
hint creation.

### Required Work

- Add or verify DB tables for:
  - protocol templates
  - immutable template versions
  - per-node protocol capabilities
  - per-node protocol assignments
  - protocol events
  - endpoint health snapshots
  - reconnect hints or reconnect hint outbox
- Implement Admin APIs:
  - `GET /admin/api/v1/nodes`
  - `GET /admin/api/v1/nodes/{node_id}`
  - `GET /admin/api/v1/nodes/{node_id}/heartbeats`
  - `GET /admin/api/v1/nodes/{node_id}/logs`
  - `GET /admin/api/v1/nodes/{node_id}/metrics-summary`
  - `GET /admin/api/v1/protocol/nodes/{node_id}/capabilities`
  - `GET /admin/api/v1/nodes/{node_id}/protocol-endpoints`
  - `GET /admin/api/v1/nodes/{node_id}/protocol-assignments`
  - `GET /admin/api/v1/nodes/{node_id}/protocol-events`
  - `POST /admin/api/v1/nodes/{node_id}/protocol-endpoints/{endpoint_id}/probe`
  - `GET /admin/api/v1/protocol-templates`
  - `POST /admin/api/v1/protocol-templates`
  - `GET /admin/api/v1/protocol-templates/{template_id}`
  - `PUT /admin/api/v1/protocol-templates/{template_id}`
  - `GET /admin/api/v1/protocol-templates/{template_id}/versions`
  - `POST /admin/api/v1/protocol-templates/{template_id}/versions`
  - `GET /admin/api/v1/protocol-templates/{template_id}/eligibility`
  - `POST /admin/api/v1/protocol-templates/{template_id}/publish`
  - `POST /admin/api/v1/protocol-templates/{template_id}/rollback`
  - `POST /admin/api/v1/protocol-rollouts`
  - `GET /admin/api/v1/protocol-rollouts/{run_id}`
  - `POST /admin/api/v1/protocol-rollouts/{run_id}/pause`
  - `POST /admin/api/v1/protocol-rollouts/{run_id}/resume`
  - `POST /admin/api/v1/protocol-rollouts/{run_id}/rollback`
- Implement Internal APIs:
  - `GET /internal/agent/protocol-assignment`
  - `POST /internal/agent/protocol-events`
  - `POST /internal/agent/protocol-capabilities` if heartbeat is not enough
  - `POST /internal/job-executors/protocol-endpoint/rollout-wave`
  - `POST /internal/job-executors/protocol-endpoint/rollback-wave`
- Store NodeAgent capability freshness and reject unsupported assignments.
- Do not generate App connect_config for profiles where
  `supports_client_config=false`.
- Emit reconnect hints only after endpoint eligibility changes to ready.
- Deduplicate reconnect hints by rollout/node/session/config version.
- Add audit logs for template create/update/publish/rollback and rollout
  actions.

### Validation

- `go test ./... -count=1`
- `go vet ./...`
- `go build ./...`
- `git diff --check`
- Unit tests for eligibility, secret redaction, unsupported protocol rejection,
  app_pending rejection, reconnect hint dedup, and rollback version behavior.

## 4. NodeAgent Cursor Task

Repository: `livemask-nodeagent`
Task ID: `TASK-NODEAGENT-PROTOCOL-STABILITY-001`

### Goal

Harden multi-protocol assignment apply so a node can safely switch endpoints
without silently breaking live VPN traffic.

### Required Work

- Ensure protocol capabilities are derived from the local registry only.
- Pull assignments from Backend with HMAC auth.
- Compare assignment `config_hash`; skip unchanged assignments.
- Validate safe profile fields and resolved secrets before rendering.
- Render to a candidate config and keep current config active until candidate
  is valid.
- Apply using the safest available method:
  - hot reload if protocol/runtime supports it
  - controlled restart if required
  - never leave no working config without LKG fallback
- Store local assignment state:
  - current
  - target
  - previous
  - LKG
  - last healthy timestamp
- Run protocol-specific health checks before `endpoint_ready`.
- Report `applying`, `endpoint_ready`, `endpoint_not_ready`, `degraded`,
  `failed`, and `rolled_back` events.
- Queue events locally with backoff when Backend is unavailable.
- Expose metrics for assignment state, endpoint readiness, apply failure, LKG
  rollback, and active job.
- Redact raw sing-box config, secrets, signed URLs, and private keys.

### Validation

- `go test ./... -count=1`
- `go vet ./...`
- `go build ./cmd/nodeagent/`
- `git diff --check`
- Tests for apply success, validation failure, health failure, event retry,
  rollback to LKG, stale assignment skip, and secret redaction.

## 5. Admin Cursor Task

Repository: `livemask-admin`
Task ID: `TASK-ADMIN-PROTOCOL-STABILITY-001`

### Goal

Replace NodeAgent node detail demo data with real Backend APIs and add protocol
template/version/assignment/rollback management.

### Required Work

- Audit Node list and Node detail pages and list every mocked field.
- Replace mock data with typed API clients for all Backend Admin APIs in the
  task contract.
- Node detail must show:
  - canonical status
  - heartbeat freshness
  - latest logs
  - metric summary
  - protocol capabilities with stale marker
  - endpoints and readiness
  - current/target/LKG assignment
  - protocol events timeline
  - related rollout/job run links
- Protocol template UI must support:
  - list
  - detail
  - version history
  - create custom template
  - publish selected version
  - rollback
  - eligibility preview
  - reserved/blocked/support badges
- Unsafe actions require confirmation.
- Unsupported protocol actions must be disabled with an explicit reason.
- No page may silently show mock/demo data after real API returns 404/500.

### Validation

- `npm run build`
- `npm run lint` if available
- Browser verification for:
  - `/admin/nodes`
  - node detail route
  - protocol templates route
  - assignment detail route
  - zh-CN/en-US text
  - empty/error/loading states

## 6. App Cursor Task

Repository: `livemask-app`
Task ID: `TASK-APP-RECONNECT-STABILITY-001`

### Goal

Verify the real Backend reconnect hint flow and keep graceful reconnect safe
across unsupported profiles and stale hints.

### Required Work

- Do not connect to NodeAgent directly.
- Consume Backend reconnect hint through the agreed session/current or realtime
  path.
- Deduplicate by `hint_id`.
- Respect `reconnect_after_ms`, `expires_at`, and behavior mode.
- Fetch fresh connect_config before tunnel change.
- Preserve old tunnel until new config is fetched and supported.
- Unsupported profile enters safe user-friendly pending/unsupported state.
- Report reconnect events fire-and-forget.
- Do not log endpoint secrets, signed URLs, tokens, session IDs, user email, or
  raw config.
- Follow the full-platform compile matrix in `.cursorrules`.

### Validation

- `flutter analyze`
- `flutter test`
- Required platform build matrix from `livemask-app/.cursorrules`, with blocked
  platforms explicitly reported as environment blocked rather than claimed.

## 7. Job Service Cursor Task

Repository: `livemask-job-service`
Task ID: `TASK-JOBS-PROTOCOL-STABILITY-001`

### Goal

Harden the protocol rollout/rollback executor so Backend assignments are
distributed safely by wave.

### Required Work

- Keep Job Service free of Admin JWT validation.
- Call Backend internal executor APIs with service auth.
- Enforce per-node lock `protocol_endpoint:{node_id}`.
- Support wave size, max failure percent, dry run, endpoint readiness required.
- Stop next waves when failure threshold is reached.
- Support cancel requested between waves.
- Emit redacted events for wave start/success/failure, node assignment created,
  node assignment failed, rollout paused, rollback started/succeeded/failed.
- Ensure retry/backoff does not retry permanent 4xx validation errors.
- No raw secrets in run parameters or event metadata.

### Validation

- `go test ./... -count=1`
- `go vet ./...`
- `go build ./cmd/job-service/`
- `git diff --check`

## 8. CI/CD Cursor Task

Repository: `livemask-ci-cd`
Task ID: `TASK-CICD-PROTOCOL-STABILITY-001`

### Goal

Turn protocol capability and rollout smoke coverage from SKIP to PASS as
Backend/Admin/NodeAgent endpoints land, and add stability gates.

### Required Work

- Extend protocol capability smoke:
  - seed templates
  - reserved templates blocked
  - capability report
  - node detail capability display
  - unsupported/app_pending blocked
  - secret leak scan
- Extend protocol rollout smoke:
  - create template
  - publish version
  - preview targets
  - rollout returns 202 + run_id
  - NodeAgent assignment pull with HMAC
  - NodeAgent event post with HMAC
  - endpoint version increments
  - active session receives reconnect hint
  - App ACK event
  - rollback rollout
- Add no-mock assertions for Admin node detail once endpoints are available.
- Keep local runtime alive. Do not run `docker compose down` on the shared dev
  stack.

### Validation

- `bash -n scripts/*.sh`
- `bash scripts/protocol-capability-smoke.sh`
- `bash scripts/protocol-endpoint-smoke.sh`
- `bash scripts/smoke.sh`
- `git diff --check`

## 9. Completion Report Requirements

Each repo completion report must include:

- TASK ID
- Repository / Branch / Commit
- Exact APIs or files implemented
- Tests and validation output
- Mock/demo data removed or remaining
- Cross-repo impact table
- Blocked windows and why
- Rollback strategy
- Secret redaction evidence
- Whether CI smoke moved from SKIP to PASS
