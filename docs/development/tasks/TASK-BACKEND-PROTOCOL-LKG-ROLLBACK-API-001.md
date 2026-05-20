# TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001 — Backend Protocol LKG / Rollback API

> Status: Completed
> Repository: livemask-backend
> Environment: dev-local

## 1. Background

Admin Protocol Stability UI already exposes LKG and rollback status, but those
fields must be backed by real Backend state instead of mock data. Backend must
derive LKG from protocol assignment state and rollout events. It must not forge
LKG values or leak sensitive protocol configuration.

This task implements real LKG and rollback fields for Admin protocol template
and assignment APIs.

## 2. Implemented Scope

| File | Change |
| --- | --- |
| `internal/protocol/types.go` | Added `LKGVersion`, `LKGAt`, per-node `LKGVersion`, `PreviousAssignmentID`, `AssignmentDetail`, `AssignmentLKGInfo`, and `AssignmentListResponse` types. |
| `internal/protocol/store.go` | Added LKG/assignment query helpers and `previous_assignment_id` schema migration. |
| `internal/protocol/service.go` | Populates template LKG fields, eligibility LKG fields, assignment detail, and assignment list. |
| `internal/protocol/handler.go` | Added Admin assignment list/detail handlers. |
| `internal/protocol/protocol.go` | Added `parseAssignmentPath`. |
| `main.go` | Registered `/admin/api/v1/protocol-assignments` and `/admin/api/v1/protocol-assignments/` routes. |
| `internal/protocol/lkg_rollback_test.go` | Added 24 tests for LKG, rollback availability, rolled-back assignment, serialization, and sensitive config leak prevention. |

## 3. Admin Fields Now Backed By Real Data

| Backend API | Admin Field | Source |
| --- | --- | --- |
| `GET /admin/api/v1/protocol-templates` | `lkg_version`, `lkg_at` | `GetTemplateLKGInfo` from `node_assignment_states` |
| `GET /admin/api/v1/protocol-templates/{id}` | `lkg_version`, `lkg_at` | Same |
| `GET /admin/api/v1/protocol-templates/{id}/eligibility` | `capability_eligibility[].lkg_version` | `ListNodeStatesByTemplateName` |
| `GET /admin/api/v1/protocol-assignments` | `lkg_info`, `lkg_status`, `lkg_rollback_available`, `rollback_to_version`, `rollback_to_template_version`, `previous_assignment_id` | `GetAssignmentLKGInfo`, `GetAssignmentRolledBackStates`, and `template_assignments.previous_assignment_id` |
| `GET /admin/api/v1/protocol-assignments/{id}` | Same assignment LKG/rollback fields | Same |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-admin` | Can remove mock LKG/rollback fallback for protocol template detail, assignment detail, list, and eligibility views. |
| `livemask-nodeagent` | No change needed; it already reports assignment readiness/LKG events through Backend endpoints. |
| `livemask-app` | No direct change. |
| `livemask-ci-cd` | Should add LKG/rollback API assertions to protocol stability smoke. |
| `livemask-docs` | Records Backend completion and unblocks Admin/CI follow-up tasks. |

## 5. No Forged LKG Rule

All LKG data must originate from real `node_assignment_states` fields:

- `lkg_config_hash`
- `lkg_template_version`
- `lkg_healthy_at`

These fields are written by `ConfirmNodeLKG` during `endpoint_ready` events. If
no LKG exists, Backend returns `null` `lkg_version` / `lkg_at`,
`lkg_status = "none"`, and `lkg_rollback_available = false`.

## 6. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001` |
| Task branch commit | `22c2f40` |
| Dev merge commit | `9a06111` |
| Remote dev ref | `origin/dev` (`9a06111`) |
| Rescue branch | `rescue/livemask-backend-dev-before-task-backend-protocol-lkg-rollback-api-001-20260520192136` |
| Validation | `go test ./...` PASS (20/20 packages); `go vet ./...` PASS; `go build ./...` PASS; `git diff --check` clean |
| Diff size | 7 files changed, +1224 / -40 lines |

## 7. Done Criteria

- [x] Template list/detail returns real LKG fields.
- [x] Eligibility preview returns per-node LKG version.
- [x] Assignment list/detail returns real LKG/rollback fields.
- [x] LKG is derived from `node_assignment_states`, not forged.
- [x] Missing LKG returns explicit empty/null state.
- [x] Tests cover LKG present, no LKG, rollback available, rolled-back assignment, serialization, and sensitive config leak prevention.
- [x] Build, vet, tests, and whitespace checks pass on merged `dev`.
