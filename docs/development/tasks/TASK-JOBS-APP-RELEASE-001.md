# TASK-JOBS-APP-RELEASE-001 - App Release Job Executors

> Owner: Job Service / Backend / App Release / Website / CI-CD / Docs
> Repo: `livemask-job-service`
> Branch: `task/TASK-JOBS-APP-RELEASE-001`
> Commit: `5f87d6d`
> Status: partial / evidence_missing (task branch not merged to dev)
> Created: 2026-05-19

## 1. Background

App release workflows need asynchronous artifact verification, publish/revoke
actions, storage verification, adoption aggregation, and Website downloads
refresh. These jobs must remain separate from NodeAgent release jobs even though
both live under Admin Release Control.

## 2. Scope

Implemented Job Service executors:

| Job Type | Backend Path | Required Params |
| --- | --- | --- |
| `app_release_artifact_verify` | `/internal/job-executors/app-release/artifact-verify` | `release_id`, `artifact_id` |
| `app_release_publish` | `/internal/job-executors/app-release/publish` | `release_id`, `channel` |
| `app_release_revoke` | `/internal/job-executors/app-release/revoke` | `release_id`, `reason` |
| `app_release_storage_verify` | `/internal/job-executors/app-release/storage-verify` | `provider` |
| `app_release_adoption_aggregate` | `/internal/job-executors/app-release/adoption-aggregate` | `release_id`, `period` |
| `website_downloads_refresh` | `/internal/job-executors/app-release/website-downloads-refresh` | `force` |

Implemented behavior:

- Job definitions and main executor registration.
- Backend internal executor API delegation.
- Retry/backoff behavior.
- Owner domain `app_release`.
- Forbidden storage credential/private-key parameters are rejected.
- Event metadata is redacted.
- No App Release / NodeAgent Release API, permission, or table mixing.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must implement the six `/internal/job-executors/app-release/*` executor APIs. |
| `livemask-admin` | Can trigger App release jobs through Backend/Admin Job Gateway once Backend executor APIs exist. |
| `livemask-ci-cd` | Release-control smoke should verify Job Service -> Backend executor paths after Backend implementation. |
| `livemask-website` | `website_downloads_refresh` supports downloads page refresh workflows. |
| `livemask-docs` | App Release handoff and MVP plan must mark Job Service as complete. |

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
POST /internal/job-executors/app-release/artifact-verify
POST /internal/job-executors/app-release/publish
POST /internal/job-executors/app-release/revoke
POST /internal/job-executors/app-release/storage-verify
POST /internal/job-executors/app-release/adoption-aggregate
POST /internal/job-executors/app-release/website-downloads-refresh
```

## 7. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-job-service` |
| **Task branch** | `task/TASK-JOBS-APP-RELEASE-001` |
| **Task branch commit** | `5f87d6d` |
| **Dev merge commit** | **Evidence missing** — task branch not merged to `livemask-job-service` dev |
| **Remote dev ref** | **Evidence missing** |
| **Validation** | `go test ./... -count=1` PASS, `go vet ./...` PASS, `go build ./cmd/job-service` PASS |
| **Evidence status** | **missing** — pending Job Service window dev merge |
| **Last verified at** | 2026-05-19 (dev-local on task branch only) |
| **Runtime repo evidence** | pending external repo audit — requires `livemask-job-service` window to verify dev merge |

## 8. Done Criteria

- All six App Release job executors are implemented and registered.
- Storage credentials and signing/private-key parameters are rejected.
- Jobs remain separate from NodeAgent release jobs.
- Validation evidence is recorded.
- Backend follow-up APIs are explicit.
