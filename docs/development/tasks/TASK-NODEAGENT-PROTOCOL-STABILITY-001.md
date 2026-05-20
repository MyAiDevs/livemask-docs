# TASK-NODEAGENT-PROTOCOL-STABILITY-001 — NodeAgent Protocol Stability

> Status: Completed
> Repository: livemask-nodeagent
> Environment: dev-local

## 1. Background

Protocol stability requires NodeAgent to consume Backend-owned protocol
assignments, apply candidate configs safely, report readiness events, and keep
a local Last Known Good (LKG) fallback. The agent must not rely on the legacy
`ProtocolEndpointManager` path for protocol assignment operations.

This task implements the NodeAgent-side protocol stability subsystem.

## 2. Implemented Scope

| File | Change |
| --- | --- |
| `internal/assign/stability_model.go` | Added Backend-matching assignment, event, capability, stability state, validation, redaction, and helper models. |
| `internal/assign/stability_client.go` | Added HMAC-auth HTTP client for assignment pull, event reporting, and capability reporting. |
| `internal/assign/stability_event_queue.go` | Added bounded FIFO event queue with exponential backoff retry. |
| `internal/assign/stability_manager.go` | Added core poll, compare, validate, render, apply, health-check, LKG commit, and event report orchestration. |
| `internal/assign/stability_adapter.go` | Bridges stability status into `agent.ProtocolEndpointStatusProvider` for heartbeat integration. |
| `cmd/nodeagent/main.go` | Replaced legacy protocol endpoint client/manager with stability client/manager/adapter, added `/protocol/*` endpoints, and exposed protocol stability metrics. |

## 3. Runtime Behavior

- Pulls protocol assignments from `GET /internal/agent/protocol-assignment`.
- Reports protocol events to `POST /internal/agent/protocol-events`.
- Reports capabilities to `POST /internal/agent/protocol-capabilities`.
- Renders candidate `SingboxConfig` from Backend `profile_config`.
- Validates candidate config via the sing-box renderer before applying.
- Runs endpoint readiness checks after apply.
- Persists LKG state on success and loads LKG on startup.
- Rolls back to LKG when apply or health check fails.
- Flushes queued events every 30 seconds with retry and exponential backoff.
- Reports capabilities every 5 minutes.
- Exposes `/protocol/status`, `/protocol/check`, `/protocol/apply`, and
  `/protocol/rollback` local endpoints.
- Exposes `livemask_nodeagent_protocol_event_queue_depth` in `/metrics`.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Backend protocol stability endpoints must be deployed for real assignment pull and event/capability reporting. |
| `livemask-admin` | Admin protocol stability UI can observe assignment/LKG/rollback state once Backend stores NodeAgent events. |
| `livemask-app` | App reconnect stability can consume Backend reconnect hints generated after NodeAgent assignment readiness changes. |
| `livemask-ci-cd` | Protocol stability smoke can move NodeAgent event paths from SKIP to PASS when runtime is fully deployed. |
| `livemask-docs` | Records NodeAgent protocol stability completion and remaining runtime integration dependency. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/NODEAGENT-PROTOCOL-STABILITY-001` |
| Task branch commit | `76e0849` |
| Integration validation | `c99fd5e` |
| Dev merge commit | `0fa3e9c` |
| Remote dev ref | `origin/dev` (`0fa3e9c`) |
| Rescue branch | `rescue/livemask-nodeagent-dev-before-task-nodeagent-protocol-stability-001-20260520184445` |
| Validation | `go build ./cmd/nodeagent/` PASS; `go vet ./cmd/nodeagent/ ./internal/assign/` PASS; `go test ./...` PASS (10/10 packages) |

## 6. Remaining Dependencies

- Backend protocol stability endpoints from `TASK-BACKEND-PROTOCOL-STABILITY-001`
  must be deployed in the active dev-local/runtime environment.
- CI/CD protocol stability smoke should be rerun with Backend and NodeAgent
  both on `dev` so assignment pull, event report, rollback, and capability
  report paths become PASS rather than SKIP.

## 7. Done Criteria

- [x] Legacy protocol endpoint manager path is replaced for assignment flow.
- [x] NodeAgent consumes real Backend protocol assignment endpoint.
- [x] Candidate config rendering and validation are implemented.
- [x] LKG persistence and startup restore are implemented.
- [x] Rollback to LKG is implemented.
- [x] Event retry queue with exponential backoff is implemented.
- [x] Capability reporting is implemented.
- [x] Protocol stability metrics are exposed.
- [x] Build, vet, and tests pass on merged `dev`.
