# TASK-JOBS-OBSERVABILITY-INGEST-001 — Observability Log Ingest Executor

> Owner: Job Service / Observability / Docs
> Repo: `livemask-job-service`
> Status: Completed (reconciled)
> Created: 2026-05-19
> Reconciled: 2026-05-20

## 1. Background

Observability log ingestion requires a durable queued job that accepts log
batches from Backend staging/enqueue paths, enforces idempotency by `batch_id`,
writes `observability_logs` transactionally through Backend executor APIs, and
handles retry/backoff/dead-letter for transient DB failures.

This task was originally documented as ✅ Done in the MVP plan but had zero
implementation on `origin/dev`. The reconcile fixed this gap.

## 2. Scope

Implemented in reconcile:

- `internal/jobs/observability.go` — `ObservabilityLogIngestExecutor`
  - Parameter validation: `batch_id` required, `source` optional
  - Backend path: `/internal/job-executors/observability/log-ingest`
  - Retry/backoff: max 3 attempts, 500ms initial / 30s max exponential backoff
  - 4xx errors become permanent blocked failures
  - 5xx/network errors remain retryable
  - Forbidden parameter keys rejected (13 key patterns)
  - Events are redacted
- `internal/jobs/observability_test.go` — 16 tests
  - Success, source optional, missing batch_id
  - Backend non-ok response
  - 4xx permanently blocks
  - 5xx retry succeeds / exhausted
  - Forbidden parameters rejected
  - Secret leak scan
  - Backend path verification
  - Definition registration, domain, serialization
- `internal/jobs/service.go` — `DefaultDefinitions()` entry
  - `owner_domain: observability`, `concurrency_limit: 5`
- `cmd/job-service/main.go` — executor registry registration

## 3. Dev Merge Evidence

| Item | Value |
|---|---|
| Task Branch | `task/TASK-JOBS-OBSERVABILITY-INGEST-001-reconcile` |
| Task Branch Commit | `1f999c3` |
| Dev Merge Commit | `fad4982` |
| Remote dev Ref | `origin/dev` |
| Rescue Branch | `rescue/livemask-job-service-dev-before-task-jobs-observability-ingest-001-20260520004706` |
| Guard Script | `dev-merge-guard.sh` — integration branch, dev merge, dev validation, push all PASS |

## 4. Cross-Repo Impact

| Repo | Impact |
|---|---|
| `livemask-backend` | Must implement `/internal/job-executors/observability/log-ingest` executor API |
| `livemask-ci-cd` | Observability smoke should verify Job Service -> Backend executor path |

## 5. Validation

```text
go test ./... -count=1  →  PASS  (4 packages, all passed)
go vet ./...            →  PASS
go build ./cmd/job-service  →  PASS
git diff --check        →  PASS
dev-merge-guard.sh      →  PASS (integration + dev + push)
```

## 6. Remaining Blockers

Backend must implement `POST /internal/job-executors/observability/log-ingest`
before end-to-end observability log ingestion can run.

## 7. Done Criteria

- [x] `observability_log_ingest` executor implemented
- [x] Job definition registered in `DefaultDefinitions()`
- [x] Executor wired in `main.go`
- [x] 16 tests covering success, failure, retry, blocked, secret leak
- [x] Secret-like parameters are rejected
- [x] Validation evidence recorded on `dev`
- [x] Dev merge via `dev-merge-guard.sh` pushed to `origin/dev`
- [x] Backend follow-up APIs are explicit
