# TASK-CICD-LOCAL-RUNTIME-WORKSPACE-MOUNT-FIX-001

> Status: Completed
> Owner: CI/CD
> Repo: `livemask-ci-cd`
> Environment: dev-local

## 1. Background

After moving LiveMask repositories to `/Users/sammytan/Developer/LiveMask`, the
Docker dev-local runtime recreated containers but mounted empty source
directories. Containers then failed with missing `package.json` or `go.mod`.

Root cause:

```text
infra/docker-compose.local.yml used ../../livemask-*
```

From `livemask-ci-cd/infra`, that path resolves outside the new workspace.

## 2. Fix

- Updated `infra/docker-compose.local.yml` source mounts to use
  `${LIVEMASK_WORKSPACE_ROOT:-/Users/sammytan/Developer/LiveMask}/livemask-*`.
- Updated `scripts/runtime.sh` to export `LIVEMASK_WORKSPACE_ROOT` with fallback
  to the parent of the `livemask-ci-cd` repository.
- Recreated local containers with `bash scripts/local-dev.sh start --services all`.
- Preserved Postgres/Redis volumes; no `docker compose down -v` was used.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-ci-cd` | Compose bind mounts now follow the canonical workspace root. |
| `livemask-backend` / `livemask-admin` / `livemask-website` / `livemask-nodeagent` / `livemask-job-service` | Source directories mount correctly into `/workspace/livemask-*` containers. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch commit | `cfedd44` |
| Dev merge commit | `ea69ee9` |
| Remote dev ref | `ea69ee9` |
| Validation on dev | `bash -n scripts/runtime.sh` PASS; `bash -n scripts/local-dev.sh` PASS; `docker compose ... config` PASS; `git diff --check` PASS |

Runtime verification:

- `bash scripts/local-dev-status.sh` shows all expected repos and containers.
- Backend health: `GET http://127.0.0.1:18080/api/v1/health` returns `status=ok`.
- Admin `/login`: HTTP 200.
- Website `/`: HTTP 200.
- Job Service `/healthz`: `status=ok`.

