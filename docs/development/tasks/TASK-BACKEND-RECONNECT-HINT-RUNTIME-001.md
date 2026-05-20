# TASK-BACKEND-RECONNECT-HINT-RUNTIME-001 — Backend Reconnect Hint Runtime API

> Status: Completed
> Repository: livemask-backend
> Environment: dev-local

## 1. Background

App reconnect stability depends on two Backend-owned runtime APIs:

- `GET /api/v1/connect/config`
- `GET /api/v1/reconnect-hints`

The App must treat reconnect hints as signals only, then fetch fresh
`connect_config` from Backend before attempting a reconnect. Backend must return
safe fields only and must not leak node secrets, config tokens, internal rollout
metadata, or full connect config through reconnect hints.

This task implements and verifies those Backend runtime APIs.

## 2. Implemented Scope

| File | Change |
| --- | --- |
| `internal/connect/store.go` | Added `GetNodeSelectionByID` to retrieve a node runtime endpoint for config re-fetch. |
| `internal/connect/service.go` | Added `GetConnectConfig` with session ownership validation. |
| `internal/handler/connect.go` | Added `ServeConnectConfig`. |
| `internal/handler/connect_test.go` | Added handler tests for no auth, method not allowed, missing `session_id`, and nil service. |
| `internal/protocol/types.go` | Added `ReconnectHintsResponse` envelope. |
| `internal/protocol/service.go` | Added public `GetActiveReconnectHints`. |
| `internal/protocol/handler.go` | Added `ServeAppReconnectHints`. |
| `main.go` | Registered both routes under `appAuth` middleware. |
| `internal/connect/reconnect_runtime_test.go` | Added service tests for `GetConnectConfig` nil safety, missing session, and no secret leak. |
| `internal/protocol/reconnect_runtime_test.go` | Added 12 protocol reconnect hint runtime tests. |

## 3. Runtime APIs

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/v1/connect/config?session_id=<sessionID>` | App JWT, app audience | Returns real `ConnectConfigView` for an active session; returns skeleton config when the node has no real endpoint. |
| `GET` | `/api/v1/reconnect-hints[?session_id=...&node_id=...]` | App JWT, app audience | Returns non-expired reconnect hints scoped by session/node using safe App-facing fields only. |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-app` | Can un-mock reconnect runtime and use real `GET /api/v1/connect/config` plus `GET /api/v1/reconnect-hints`. |
| `livemask-nodeagent` | Existing `endpoint_ready` and `rolled_back` events already trigger reconnect hints through Backend. |
| `livemask-ci-cd` | Can add reconnect hint runtime smoke checks. |
| `livemask-docs` | Records Backend completion and creates App/CI follow-up tasks. |

## 5. Security Notes

- `ReconnectHint` internal fields such as `ConfigHash` and `RolloutID` are not
  returned to App.
- App-facing reconnect hints include only:
  - `hint_id`
  - `reason`
  - `reconnect_after_ms`
  - `expires_at`
- `GetConnectConfig` builds through the existing safe `newConnectConfig()`
  whitelist.
- Responses must not leak `node_secret`, HMAC secrets, tokens, private keys, or
  `obfs_password`.
- Both runtime APIs are protected by `appAuth`.

## 6. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch commit | `4249450` |
| Dev merge commit | `1442e64` |
| Remote dev ref | `origin/dev` (`1442e64`) |
| Rescue branch | `rescue/livemask-backend-dev-before-task-backend-reconnect-hint-runtime-001-20260520193327` |
| Validation | `go test ./internal/connect/...` PASS; `go test ./internal/handler/...` PASS; `go test ./internal/protocol/...` PASS; `go test ./...` PASS (18 packages); `go vet ./...` PASS; `go build ./...` PASS; `git diff --check` PASS |

## 7. Done Criteria

- [x] `GET /api/v1/connect/config` is registered under App auth.
- [x] `GET /api/v1/reconnect-hints` is registered under App auth.
- [x] Reconnect hints return safe App-facing fields only.
- [x] `connect/config` response does not leak secrets.
- [x] Nil service/store/DB paths are tested.
- [x] Auth, method, and missing-parameter handler behavior is tested.
- [x] NodeAgent `endpoint_ready` / `rolled_back` event path already triggers
      reconnect hint creation.
- [x] Build, vet, tests, and whitespace checks pass on merged `dev`.
