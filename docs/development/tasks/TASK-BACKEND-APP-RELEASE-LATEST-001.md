# TASK-BACKEND-APP-RELEASE-LATEST-001 - Public Latest App Release Endpoint

> Owner: Backend / App Release / Website / CI-CD / Docs
> Repo: `livemask-backend`
> Branch: `task/TASK-BACKEND-APP-RELEASE-LATEST-001`
> Commit: `449786b`
> Status: Completed dev-local
> Created: 2026-05-19

## 1. Background

Website downloads and release-control regression depend on a public Backend
endpoint that returns the latest published App release metadata without leaking
storage keys, internal ownership fields, signed URL queries, or targeting
configuration.

## 2. Scope

Implemented endpoint:

```text
GET /api/v1/app/releases/latest
```

Supported query parameters:

| Query | Type | Purpose |
| --- | --- | --- |
| `channel` | string | Optional channel filter, such as stable, beta, internal, or hotfix. |
| `platform` | string | Optional platform filter; only releases with matching artifacts are returned. |

Implemented package files:

- `internal/apprelease/types.go`
- `internal/apprelease/store.go`
- `internal/apprelease/service.go`
- `internal/apprelease/handler.go`
- `internal/apprelease/service_test.go`
- `internal/apprelease/handler_test.go`

Public response includes:

- Version and build number.
- Title and release notes content ID.
- Minimum supported version.
- Force update metadata.
- Artifact platform, arch, type, size, sha256, and signature.

Public response excludes:

- `storage_key`
- `created_by`
- `updated_by`
- `target_regions`
- `target_locales`

## 3. Validation

Validation evidence from Backend window:

```text
go test ./internal/apprelease/... PASS (14 tests)
go vet ./internal/apprelease/... clean
go build ./internal/apprelease/... clean
git diff --check clean
```

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-website` | `/download` and release-control regression can run real integration against Backend. |
| `livemask-admin` | App Release Admin UI still depends on broader Admin APIs, separate from this latest public endpoint. |
| `livemask-app` | App update-check remains a separate endpoint/task; this task is Website/public latest metadata. |
| `livemask-ci-cd` | Release-control smoke should verify latest metadata and no secret leakage. |
| `livemask-docs` | App Release contract, handoff, and MVP plan record latest endpoint readiness. |

## 5. Remaining Risks

- Broader App Release Admin APIs and storage adapters remain separate Backend
  tasks.
- Website real integration smoke still needs to run against the deployed local
  Backend stack.

## 6. Done Criteria

- Public latest release endpoint is implemented.
- Sensitive fields are excluded from public responses.
- Changed-package tests/build/vet pass.
- Website and CI/CD follow-ups are unblocked.
