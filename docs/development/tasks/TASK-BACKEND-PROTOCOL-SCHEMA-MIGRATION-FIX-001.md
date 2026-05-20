# TASK-BACKEND-PROTOCOL-SCHEMA-MIGRATION-FIX-001

> Status: Completed
> Owner: Backend
> Repo: `livemask-backend`
> Environment: dev-local

## 1. Background

After the local Docker runtime mounted the correct source directories, Backend
still restarted because the existing dev-local Postgres volume contained older
protocol tables.

Observed errors:

```text
protocol bootstrap: ensure protocol schema: pq: column "expires_at" does not exist
heartbeat: capability processing error ... column "version" of relation "node_protocol_capabilities" does not exist
```

Root cause: `CREATE TABLE IF NOT EXISTS` does not migrate existing tables when
new columns are added.

## 2. Fix

Updated `internal/protocol/store.go` schema bootstrap to add compatibility
migrations:

- `reconnect_hints`
  - drop old `session_id` foreign key if present
  - make `session_id` nullable
  - convert `session_id` to `VARCHAR(255)`
  - add `reconnect_after_ms`
  - add `expires_at`
  - add `rollout_id`
  - add `config_hash`
- `node_protocol_capabilities`
  - add `version`

This preserves the dev-local database volume and avoids requiring destructive
volume deletion.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Backend starts against old dev-local protocol tables. |
| `livemask-nodeagent` | Capability heartbeat writes no longer fail due missing `version` column. |
| `livemask-admin` | Protocol capability views can receive real data once NodeAgent reports capabilities. |
| `livemask-ci-cd` | Local runtime and protocol smoke can proceed without database reset. |

## 5. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch commit | `5492c56` |
| Dev merge commit | `2e5fda9` |
| Remote dev ref | `2e5fda9` |
| Validation on dev | `go test ./...` PASS; `go vet ./...` PASS; `git diff --check` PASS |

Runtime verification:

- Backend container is `Up`.
- `GET http://127.0.0.1:18080/api/v1/health` returns `status=ok`.
- Recent Backend logs no longer show the protocol bootstrap failure.

