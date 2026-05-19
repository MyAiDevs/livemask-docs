# TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001 — Backend Protocol Capability Wiring Reconcile

> Owner: Backend / Protocol
> Repo: `livemask-backend`
> Status: Completed
> Task branch commit: `1a83ada`
> Dev merge commit: `68f04ac`
> Remote dev ref: `68f04ac`
> Completed: 2026-05-20

## 1. Background

NodeAgent had already implemented protocol capability reporting in heartbeat, and
Admin had protocol capability UI pages. Backend dev was the missing link:
capability payloads were accepted by the heartbeat schema but were not wired into
storage and Admin read APIs on `origin/dev`.

## 2. Scope

- Persist heartbeat `protocol_capabilities` into `node_protocol_capabilities`.
- Wire Node service to the Protocol capability processor.
- Return real DB-backed protocol capability data from Admin APIs.
- Keep Node Detail logs/metrics wiring intact.

## 3. Delivered

- `POST /internal/agent/heartbeat` now supports `protocol_capabilities` payloads.
- `GET /admin/api/v1/protocol/capabilities` reads real DB data.
- `GET /admin/api/v1/protocol/nodes/{node_id}/capabilities` reads real DB data.
- `node_protocol_capabilities` index coverage includes:

```sql
CREATE INDEX IF NOT EXISTS idx_node_protocol_capabilities_protocol
  ON node_protocol_capabilities(protocol);
```

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Capability heartbeat ingest and Admin read APIs are complete on `origin/dev`. |
| `livemask-admin` | Protocol Capability UI can switch from mock/empty fallback to real Backend data. |
| `livemask-nodeagent` | Heartbeat capability payloads are now accepted and persisted by Backend. |
| `livemask-ci-cd` | Protocol capability smoke can validate real heartbeat ingest and Admin read paths. |
| `livemask-docs` | Status moves from blocked/missing to completed, with rollout gating tracked separately. |

## 5. Validation

Backend validation on dev:

```text
go test ./internal/node/... -count=1 PASS (37 tests)
go test ./internal/protocol/... PASS
go test ./... -count=1 PASS
go vet ./... PASS
go build ./... PASS
git diff --check PASS
dev-merge-guard PASS
```

## 6. Follow-up

- Rollout eligibility/gating remains a follow-up under the broader
  `TASK-BACKEND-PROTOCOL-CAPABILITY-001` / protocol stability work.
- `TASK-BACKEND-I18N-001` remains a separate next-phase blocker and is not closed
  by this task.
- CI/CD should add protocol capability smoke for real DB-backed capabilities and
  ensure unsupported/reserved protocols cannot be treated as rollout-ready.
