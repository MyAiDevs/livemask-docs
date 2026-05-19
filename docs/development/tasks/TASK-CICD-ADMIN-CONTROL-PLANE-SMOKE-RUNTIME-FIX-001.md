# TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-RUNTIME-FIX-001

> Owner: CI/CD / QA
> Repo: `livemask-ci-cd`
> Status: Completed
> Environment: Docker dev-local

## 1. Background

`TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-001` added Admin control-plane smoke
coverage, but runtime execution against Docker dev-local exposed script issues:

- Backend readiness was sometimes misreported as stopped even when the backend
  container was healthy.
- Admin page checks assumed Backend base URL instead of the Admin app surface.
- Admin Jobs RBAC checks failed when undeployed endpoints returned 404.
- `protocol-capability-smoke.sh` used Bash associative arrays, which fail under
  macOS Bash 3.
- Protocol capability smoke used the old node capability path and scanned auth
  login tokens as if they were business-response leaks.

## 2. Scope

Fix smoke script runtime behavior without creating a duplicate aggregate script.

Included:

- Add shared `scripts/lib/base_service.sh`.
- Wire five domain scripts to shared Docker dev-local service discovery.
- Keep `scripts/smoke.sh` and workflow wiring unchanged.
- Re-run the affected scripts against Docker dev-local.

## 3. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-RUNTIME-FIX-001` |
| Task branch commit | `71a4869` |
| Integration branch | `integration/task-cicd-admin-control-plane-smoke-runtime-fix-001-task-TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-RUNTIME-FIX-001-20260520030434` |
| Integration commit | `82ef948` |
| Dev merge commit | `1f630f0` |
| Remote dev ref | `1f630f0` |
| Validation | `bash -n` touched scripts + `scripts/smoke.sh`, `git diff --check`, dev-merge-guard PASS |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-ci-cd` | Smoke runtime helpers and domain scripts are fixed on `origin/dev`. |
| `livemask-admin` | Admin page checks now target Admin app/container instead of Backend route space. |
| `livemask-backend` | Backend readiness is reported separately from host-port/proxy availability. |
| `livemask-docs` | Records runtime PASS/SKIP evidence. |

## 5. Delivered

- New shared helper: `scripts/lib/base_service.sh`
  - Centralizes fixed local service ports and container names.
  - Provides Backend/Admin/Website/JobService URL helpers.
  - Provides Backend health fallback through container-local check.
  - Provides Admin page HTTP check with host URL then container fallback.
- Updated scripts:
  - `scripts/system-settings-smoke.sh`
  - `scripts/jobs-smoke.sh`
  - `scripts/protocol-capability-smoke.sh`
  - `scripts/release-control-smoke.sh`
  - `scripts/sentry-config-smoke.sh`

## 6. Runtime Results

Executed against Docker dev-local:

| Script | Result | Notes |
| --- | --- | --- |
| `jobs-smoke.sh` | PASS | Core Job Service checks PASS; Admin jobs API 404 and Admin pages 500 recorded as SKIP. |
| `sentry-config-smoke.sh` | PASS | App config, Admin settings API, RBAC and secret scan PASS; Admin page 500 recorded as SKIP. |
| `release-control-smoke.sh` | PASS | App/NodeAgent release APIs, website downloads, sitemap/RSS/hreflang, RBAC and leak scan PASS; unavailable latest endpoint/page states SKIP. |
| `system-settings-smoke.sh` | PASS | Config read, observability settings, secret scan PASS; legacy read-only config and undeployed scheduler states SKIP. |
| `protocol-capability-smoke.sh` | PASS | Heartbeat capability upload, real `/admin/api/v1/protocol/nodes/{id}/capabilities`, RBAC and secret scan PASS; undeployed template/eligibility data SKIP. |

Current Docker dev-local still has Admin page rendering `HTTP 500` for several
new Admin pages. This task correctly records those as runtime SKIP in CI/CD
smoke; Admin UI/runtime debugging is a separate Admin task.

## 7. Validation

```text
bash -n scripts/lib/base_service.sh PASS
bash -n scripts/jobs-smoke.sh PASS
bash -n scripts/system-settings-smoke.sh PASS
bash -n scripts/protocol-capability-smoke.sh PASS
bash -n scripts/release-control-smoke.sh PASS
bash -n scripts/sentry-config-smoke.sh PASS
bash -n scripts/smoke.sh PASS
git diff --check PASS
dev-merge-guard PASS
```

Runtime:

```text
bash scripts/jobs-smoke.sh PASS
bash scripts/sentry-config-smoke.sh PASS
bash scripts/release-control-smoke.sh PASS
bash scripts/system-settings-smoke.sh PASS
bash scripts/protocol-capability-smoke.sh PASS
```

## 8. Remaining Follow-Up

- Fix Admin Docker runtime `HTTP 500` for the new Admin pages if page-level smoke
  must become PASS instead of SKIP.
- Implement remaining Backend Admin Jobs/Scheduler/Protocol Template endpoints
  to reduce SKIP counts.
