# TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001 - Growth Reward Job Executor APIs

> Owner: Backend / Job Service / Growth / CI-CD / Docs
> Repo: `livemask-backend`
> Branch: `task/TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001`
> Status: Completed dev-local with unrelated full-suite failure recorded — partial / evidence_missing
> Created: 2026-05-19

## 1. Background

`livemask-job-service` implements `growth_reward_digest` and
`growth_reward_notification_dispatch` jobs. Backend must expose scoped internal
executor APIs so Job Service can call domain-owned growth logic without directly
mutating Backend tables or calculating payouts.

## 2. Scope

Implemented internal executor APIs:

- `POST /internal/job-executors/growth/reward-digest`
- `POST /internal/job-executors/growth/reward-notification-dispatch`

Already completed and not repeated in this task:

- `growth_reward_notifications` table.
- `GET /api/v1/me/growth/notifications`.
- `POST /api/v1/me/growth/notifications/{id}/ack`.
- `GET /api/v1/me/growth/notification-summary`.
- `GET /admin/api/v1/growth/notifications`.
- `POST /admin/api/v1/growth/notifications/preview`.

## 3. Validation

Validation evidence from Backend window:

```text
go test ./internal/growth/... PASS
go test ./internal/auth/... PASS
go vet ./internal/growth/... clean
go build ./internal/growth/... clean
git diff --check clean
```

Known unrelated validation issue:

- `go test ./...` still fails because of a pre-existing `auth.HasPermission`
  issue in geoip and nodeagent tests. This is not introduced by this task.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-job-service` | Growth reward digest and dispatch executors can now call Backend internal executor APIs. |
| `livemask-ci-cd` | Growth reward notification smoke can verify Job Service -> Backend executor calls. |
| `livemask-admin` | No new UI change; Admin notification list/preview remains already implemented. |
| `livemask-app` | No new App change; prompt fetch/ack remains already implemented. |
| `livemask-docs` | MVP plan and User Growth handoff record Backend executor readiness. |

## 5. Remaining Risks

- CI/CD has not yet verified the Job Service -> Backend executor path against a
  running local stack.
- The unrelated full-suite `auth.HasPermission` failures should be tracked by a
  separate Backend cleanup task.

## 6. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-backend` |
| **Task branch** | `task/TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001` |
| **Task branch commit** | Not specified |
| **Dev merge commit** | **Evidence missing** — task branch not merged to `livemask-backend` dev |
| **Remote dev ref** | **Evidence missing** |
| **Validation** | `go test ./internal/growth/...` PASS, `go test ./internal/auth/...` PASS, `go vet` clean, `go build` clean |
| **Evidence status** | **missing** — pending Backend window dev merge; pre-existing unrelated full-suite failure is a known non-blocker |
| **Last verified at** | 2026-05-19 (dev-local on task branch only) |
| **Runtime repo evidence** | pending external repo audit — requires `livemask-backend` window to verify dev merge |

## 7. Done Criteria

- Internal executor APIs are implemented.
- Changed-package tests/build/vet pass.
- Full-suite unrelated failure is explicitly recorded.
- Job Service and CI/CD follow-ups are unblocked.
