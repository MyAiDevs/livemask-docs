# TASK-JOBS-PROTOCOL-STABILITY-001 — Job Service Protocol Stability

> Status: Completed
> Repository: livemask-job-service
> Environment: dev-local

## 1. Background

Protocol and endpoint rollout is a VPN stability-sensitive workflow. Job Service
must execute rollout and rollback work in bounded waves with pause/resume,
per-node locks, retry/backoff, failure thresholds, and redacted events. It must
not directly mutate NodeAgent state or bypass Backend domain APIs.

This task implements the Job Service portion of the protocol stability gate.

## 2. Implemented Scope

| Area | Result |
| --- | --- |
| Run lifecycle | Added `paused` status and `Service.PauseRun()` / `Service.ResumeRun()`. |
| HTTP API | Added `POST /internal/jobs/runs/{run_id}/pause` and `POST /internal/jobs/runs/{run_id}/resume`. |
| Protocol endpoint executors | `protocol_endpoint_rollout` and `protocol_endpoint_rollback` check latest run state between waves and stop safely when paused. |
| NodeAgent release rollout | Implemented `nodeagent_release_rollout` executor with `release_id`, `target_filter`, `wave_size`, `max_failure_percent`, and `dry_run`. |
| NodeAgent release rollback | Implemented `nodeagent_release_rollback` executor with `release_id`, `target_filter`, `rollback_to_version`, and `wave_size`. |
| Safety | Wave splitting, per-node locking, failure-threshold stop, cancel/pause awareness, retry/backoff, and no secret leakage checks. |
| Retry | `RetryRun` now allows retry from `paused`. |

## 3. Backend Dependencies

Job Service calls Backend executor APIs and does not directly modify NodeAgent.
The following Backend endpoints must exist for end-to-end rollout execution:

| Backend endpoint | Purpose |
| --- | --- |
| `POST /internal/job-executors/nodeagent-release/rollout-wave` | Apply a NodeAgent release rollout wave. |
| `POST /internal/job-executors/nodeagent-release/rollback-wave` | Apply a NodeAgent release rollback wave. |
| `POST /internal/job-executors/protocol-endpoint/rollout-wave` | Create protocol endpoint target assignments for a wave. |
| `POST /internal/job-executors/protocol-endpoint/rollback-wave` | Create rollback assignments for a wave. |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must implement the Backend executor APIs listed above before end-to-end rollout succeeds. |
| `livemask-admin` | Can build rollout progress, pause/resume, and rollback UI against Job Service/Backend once Backend APIs exist. |
| `livemask-nodeagent` | No direct change; NodeAgent still pulls assignments from Backend and reports events. |
| `livemask-app` | No direct change; App reconnect remains Backend-owned. |
| `livemask-ci-cd` | Should add protocol stability smoke for rollout, rollback, pause/resume, and failure-threshold behavior. |
| `livemask-docs` | Records Job Service protocol stability completion and remaining Backend/API dependencies. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-JOBS-PROTOCOL-STABILITY-001` |
| Task branch commit | `694b824` |
| Dev merge commit | `16d9ba0` |
| Remote dev ref | `origin/dev` (`16d9ba0`) |
| Validation | `go test ./... -count=1` PASS, `go vet ./...` PASS, `go build ./cmd/job-service/` PASS |

## 6. Tests Added

- `TestPauseResumeLifecycle`
- `TestPauseInvalidState`
- `TestRetryFromPaused`
- `TestNodeAgentReleaseJobDefinitionsRegistered`
- `TestNodeAgentReleaseDefinitionsHaveCorrectWaveParams`
- `TestNodeAgentReleaseRolloutSuccess`
- `TestNodeAgentReleaseRollbackSuccess`
- `TestNodeAgentReleaseRolloutWavesSplitCorrectly`
- `TestNodeAgentReleaseFailureThresholdStopsNextWave`
- `TestNodeAgentReleaseCancelStopsWork`
- `TestNodeAgentReleaseRolloutPauseBetweenWaves`
- `TestNodeAgentReleaseRolloutParamValidation`
- `TestNodeAgentReleaseRollbackParamValidation`
- `TestNodeAgentReleaseNoSecretLeakage`
- `TestServiceDispatchesToNodeAgentReleaseExecutor`
- `TestNodeAgentReleaseRolloutDryRun`
- `TestNodeAgentReleaseTransientRetries`

## 7. Done Criteria

- [x] Rollout wave execution is bounded and pause/cancel aware.
- [x] Rollback execution is available and parameter validated.
- [x] Per-node locking is covered by tests.
- [x] Failure threshold stops subsequent waves.
- [x] Backend calls use executor APIs instead of direct NodeAgent mutation.
- [x] Sensitive parameter leakage is tested.
- [x] Validation passed on merged `dev`.
