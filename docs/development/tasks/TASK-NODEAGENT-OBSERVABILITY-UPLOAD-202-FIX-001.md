# TASK-NODEAGENT-OBSERVABILITY-UPLOAD-202-FIX-001

> Status: Done
> Owner: NodeAgent / Backend / Admin / Docs
> Environment: dev-local
> Date: 2026-05-19

## 1. Background

Fix the NodeAgent observability upload client so Backend `202 Accepted`
responses from `POST /internal/agent/logs` are treated as success instead of
upload failure.

The Backend ingestion contract returns an accepted async-style response:

```json
{
  "accepted": true,
  "batch_id": "batch-id",
  "accepted_count": 1,
  "queued": false
}
```

NodeAgent previously accepted only `200 OK` and `201 Created`, then expected the
legacy response shape `{ "ok": true, "accepted": n }`. This caused successful
Backend ingestion to be retried by NodeAgent.

## 2. Scope

In scope:

- Accept any HTTP 2xx status as successful transport-level upload.
- Parse both legacy and current Backend response shapes.
- Treat explicit rejection (`ok:false` or `accepted:false`) as failure so the
  existing backoff/retry path still works.
- Keep fallback behavior for malformed 2xx bodies: count all submitted entries
  as accepted.
- Verify in unit tests and dev-local runtime.

Out of scope:

- Changing Backend ingestion schema or route.
- Changing Job Service async ingestion.
- Changing Admin log display behavior.

## 3. Implementation Summary

Repository: `livemask-nodeagent`

Files:

- `internal/observability/upload.go`
- `internal/observability/observability_test.go`

Changes:

- `UploadClient.Upload` now treats all `2xx` statuses as success.
- Added `parseUploadAccepted` to support:
  - `{ "ok": true, "accepted": 2 }`
  - `{ "accepted": true, "accepted_count": 2 }`
  - empty or unparsable 2xx body fallback.
- Added tests for Backend `202 Accepted` response shape and
  `accepted:false` rejection.

## 4. Cross-Repo Impact

| Repo / Role | Status | Notes |
| --- | --- | --- |
| Backend | Done | Existing `POST /internal/agent/logs` response shape is now compatible. |
| NodeAgent | Done | Upload success path no longer retries successful 202 responses. |
| Admin | Unblocked | Latest Logs can continue receiving fresh NodeAgent logs. |
| Job Service | No change | Async ingest path is unaffected. |
| CI/CD | Regression needed | Keep `TASK-CICD-OBSERVABILITY-SMOKE-001` as the end-to-end gate. |
| Docs / QA | Done | MVP plan and observability handoff updated. |

## 5. Validation Evidence

NodeAgent:

```text
go test ./internal/observability
PASS

go build ./cmd/nodeagent
PASS

git diff --check -- internal/observability/upload.go internal/observability/observability_test.go
PASS
```

Dev-local runtime:

```text
bash scripts/local-dev.sh sync --services nodeagent --no-pull
PASS

docker logs --tail 160 livemask-local-nodeagent-1
[observability] log upload success: batch=..., accepted=1
```

The targeted restart recreated only `nodeagent`; no `docker compose down` or
volume deletion was used.

CI/CD smoke rerun:

```text
bash scripts/sentry-config-smoke.sh
PASS

bash scripts/observability-smoke.sh
PASS
```

Observed non-blocking skips in this local runtime:

- Job Service health endpoint unreachable on `127.0.0.1:18081`.
- Job Service metrics endpoint unreachable on `127.0.0.1:18081`.
- Payment order logs skipped because no payment order data exists.

The core upload path and Admin read paths passed:

- NodeAgent log upload: HTTP 202 accepted.
- Global logs: HTTP 200.
- Node latest logs: HTTP 200.
- Agent/payment/notification log families: HTTP 200.
- Sentry summary/events/performance: HTTP 200.
- RBAC checks: 401 without token and 403 with user token.
- Secret leak scan: 0 leaks.

## 6. Rollback

Rollback is limited to `livemask-nodeagent/internal/observability/upload.go`.
If reverted, NodeAgent will again treat Backend `202 Accepted` ingestion
responses as failures and retry already accepted batches.

## 7. Completion Report

TASK ID: `TASK-NODEAGENT-OBSERVABILITY-UPLOAD-202-FIX-001`

Result: completed.

Completed:

- Accepted Backend `202 Accepted` for log ingestion.
- Added current Backend response parsing with `accepted_count`.
- Preserved explicit rejection behavior for retry/backoff.
- Verified package tests, build, diff check, and dev-local runtime log upload.

Unlocked:

- `TASK-ADMIN-OBSERVABILITY-LOGS-001`
- `TASK-CICD-OBSERVABILITY-SMOKE-001` regression
