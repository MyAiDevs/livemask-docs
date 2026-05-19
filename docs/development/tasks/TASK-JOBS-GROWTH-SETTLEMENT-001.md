# TASK-JOBS-GROWTH-SETTLEMENT-001 - Growth Settlement Job Executors

> Owner: Job Service / Backend / Finance / Growth / Docs
> Repo: `livemask-job-service`
> Branch: `task/TASK-JOBS-GROWTH-SETTLEMENT-001`
> Commit: `46f67ad`
> Status: Completed dev-local
> Created: 2026-05-19

## 1. Background

User growth revenue needs asynchronous settlement and reconciliation jobs. These
jobs must coordinate through Backend domain executor APIs and must never perform
real payout execution or store payout secrets.

## 2. Scope

Implemented Job Service executors:

| Job Type | Backend Path | Purpose |
| --- | --- | --- |
| `growth_ledger_aggregate` | `/internal/job-executors/growth/ledger-aggregate` | Aggregate pending growth ledger entries |
| `growth_settlement_generate` | `/internal/job-executors/growth/settlement-generate` | Generate settlement reports |
| `growth_settlement_reconcile` | `/internal/job-executors/growth/settlement-reconcile` | Reconcile settlement reports |

Implemented behavior:

- Parameter validation.
- Retry/backoff/dead-letter behavior.
- 4xx responses become permanent blocked failures.
- 5xx/network errors remain retryable.
- Forbidden parameter keys reject payout/wallet/signing secrets.
- Events are redacted.
- No real payout execution.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must implement the three `/internal/job-executors/growth/*` settlement executor APIs. |
| `livemask-ci-cd` | Should include settlement job smoke once Backend executor APIs exist. |
| `livemask-docs` | MVP plan and growth handoff must mark Job Service as complete and Backend as the blocker. |

## 5. Validation

```text
go test ./... -count=1 PASS
go vet ./... PASS
go build ./cmd/job-service PASS
git diff --check PASS
```

## 6. Remaining Blockers

Backend executor APIs required:

```text
POST /internal/job-executors/growth/ledger-aggregate
POST /internal/job-executors/growth/settlement-generate
POST /internal/job-executors/growth/settlement-reconcile
```

## 7. Done Criteria

- All three Job Service executors are implemented and registered.
- Secret-like parameters are rejected.
- Jobs do not perform payout execution.
- Validation evidence is recorded.
- Backend follow-up APIs are explicit.
