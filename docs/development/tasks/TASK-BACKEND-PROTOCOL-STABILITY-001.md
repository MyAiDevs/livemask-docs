# TASK-BACKEND-PROTOCOL-STABILITY-001 — Backend Protocol Stability

> Status: Completed
> Repository: livemask-backend
> Environment: dev-local

## 1. Background

Backend is the authority for protocol endpoint eligibility, Job Service executor
APIs, App reconnect hints, and NodeAgent protocol assignment/event ingestion.
Job Service and CI/CD protocol stability work were completed first, but their
end-to-end paths depended on Backend exposing the runtime endpoints and gating
logic.

This task completes the Backend portion of the protocol stability gate.

## 2. Implemented Scope

### New Files

| File | Purpose |
| --- | --- |
| `internal/protocol/executor.go` | Job executor handlers for protocol endpoint rollout/rollback waves, including `ServeRolloutWave`, `ServeRollbackWave`, `ProcessRolloutWave`, `ProcessRollbackWave`, `GetActiveReconnectHints`, and `ConfirmNodeLKG`. |
| `internal/protocol/executor_test.go` | 22 tests for handler validation, nil-safety, default rollout policy, capability maps, eligibility gating, and LKG confirmation. |
| `internal/nodeagent/executor.go` | Job executor handlers for NodeAgent release rollout/rollback waves and wave intent recording. |
| `internal/nodeagent/executor_test.go` | 10 tests for handler validation, release not found, rollout, and rollback processing. |

### Modified Areas

| File | Change |
| --- | --- |
| `internal/protocol/service.go` | Added `IsConnectAllowed()` implementing connect capability gating for unsupported, app_pending, reserved, implemented, and partial states. |
| `internal/protocol/store.go` | Added `ListNodeStatesByAssignment` and `ListActiveReconnectHints`. |
| `internal/protocol/handler.go` | Added `ServeAppReconnectHints` for App reconnect hint retrieval. |
| `internal/connect/service.go` | Added `CapabilityChecker` and `SetCapabilityChecker()`; session creation rejects nodes with unsupported or app_pending protocol capability. |
| `main.go` | Registered protocol executor, NodeAgent executor, reconnect hint, assignment, and event routes with the appropriate auth middleware. |

## 3. Endpoints Added / Confirmed

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/internal/job-executors/protocol-endpoint/rollout-wave` | Internal | Advance a protocol template rollout wave. |
| POST | `/internal/job-executors/protocol-endpoint/rollback-wave` | Internal | Roll back a protocol template wave. |
| POST | `/internal/job-executors/nodeagent-release/rollout-wave` | Internal | Advance a NodeAgent release rollout wave. |
| POST | `/internal/job-executors/nodeagent-release/rollback-wave` | Internal | Roll back a NodeAgent release wave. |
| GET | `/api/v1/reconnect-hints` | App auth | Retrieve active reconnect hints scoped by session/node. |
| GET | `/internal/agent/protocol-assignment` | Node auth | NodeAgent protocol assignment pull path. |
| POST | `/internal/agent/protocol-events` | Node auth | NodeAgent protocol event reporting path. |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-job-service` | Previously completed rollout/rollback executors now have Backend executor APIs to call. |
| `livemask-ci-cd` | Protocol stability smoke can move new sections from SKIP toward PASS as runtime data exists. |
| `livemask-nodeagent` | Can pull protocol assignments and report endpoint/rollback events against Backend-owned APIs. |
| `livemask-app` | Can fetch active reconnect hints from Backend and keep reconnect authority centralized. |
| `livemask-admin` | Can build protocol stability views against Backend-owned assignment/event/eligibility data. |
| `livemask-docs` | Records Backend completion and updates the protocol stability ledger. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task ID | `TASK-BACKEND-PROTOCOL-STABILITY-001` |
| Repository | `livemask-backend` |
| Validation | `go build ./...` PASS, `go test ./...` PASS |
| Test packages | 23 packages |
| New tests | 22 protocol tests, 10 nodeagent tests |

## 6. Remaining Follow-Ups

- NodeAgent must complete `TASK-NODEAGENT-PROTOCOL-STABILITY-001` so
  assignment apply, LKG rollback, readiness checks, event retry, metrics, and
  redaction are real runtime behavior.
- App must complete `TASK-APP-RECONNECT-STABILITY-001` so reconnect hints are
  consumed safely.
- Admin must complete `TASK-ADMIN-PROTOCOL-STABILITY-001` for operator UI over
  assignments, events, template versioning, and rollback state.
- CI/CD should rerun protocol stability smoke against the new Backend endpoints
  and track SKIP-to-PASS closure.

## 7. Done Criteria

- [x] Backend exposes protocol rollout/rollback executor APIs.
- [x] Backend exposes NodeAgent release rollout/rollback executor APIs.
- [x] Backend gates connect selection by protocol capability.
- [x] Backend exposes App reconnect hint API.
- [x] Backend keeps NodeAgent protocol assignment/event routes registered.
- [x] Unit tests cover eligibility and executor handlers.
- [x] Backend builds and full tests pass.
