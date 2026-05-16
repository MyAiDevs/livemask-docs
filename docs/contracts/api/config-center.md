# Config Center API

> Owner: Backend
> Task: `TASK-P0-03-config-center`
> Status: Ready for implementation

配置中心是 App、NodeAgent、Backend 策略配置的事实源。PostgreSQL 保存版本历史和发布状态，Redis 只作为缓存和 Pub/Sub 通知载体。

## 1. Config Keys

| Key | Caller | Security | Hot reload | MVP required |
| --- | --- | --- | --- | --- |
| `client.remote_config` | App | Public after user auth | Yes | Yes |
| `nodeagent.runtime_config` | NodeAgent | Internal | Yes | Yes |
| `recommendation.strategy.default` | Backend | Internal | Yes | Yes |
| `payment.usdt_nowpayments` | Backend / Payment | Secret references only | Partial | No, seeded disabled |

配置 payload schema 见 [`../config/core-configs.md`](../config/core-configs.md)。

## 2. Public Client Read

### GET `/api/v1/config/client`

- Caller: App Client
- Auth: User JWT
- Idempotency: N/A
- Reads config key: `client.remote_config`
- Side effects: none

Query:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `client_version` | string | yes | App semantic version or build version |
| `platform` | string | yes | `ios` / `android` / `macos` / `windows` |
| `config_version` | int | no | Local last-known-good version |

Response `200`:

```json
{
  "schema_version": "1.0",
  "config_key": "client.remote_config",
  "config_version": 3,
  "config_hash": "sha256:...",
  "payload": {},
  "fallback_action": "continue",
  "published_at": "2026-05-16T12:00:00Z"
}
```

If the caller already has the latest version, Backend still returns `200` with the current metadata and payload. MVP 不使用 `304`，避免多端缓存语义不一致。

## 3. NodeAgent Read

### GET `/internal/agent/config`

- Caller: NodeAgent
- Auth: Node signature / mTLS (MVP may use `X-Node-ID` + internal network until node identity is implemented)
- Idempotency: N/A
- Reads config key: `nodeagent.runtime_config`
- Side effects: none

Query:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `node_id` | uuid | yes | Registered node id |
| `agent_version` | string | yes | NodeAgent version |
| `config_version` | int | no | Local last-known-good version |

Response matches `/api/v1/config/client`, with `config_key=nodeagent.runtime_config`.

## 4. Admin Management

MVP 可以先用 Admin API / script 调用；完整 Admin UI 属于后续任务。

### GET `/admin/api/v1/configs`

- Caller: Admin
- Auth: Admin JWT
- Response: latest row per `config_key`

### GET `/admin/api/v1/configs/{config_key}`

- Caller: Admin
- Auth: Admin JWT
- Response: latest config metadata, payload, and recent versions.

### POST `/admin/api/v1/configs/{config_key}/draft`

- Caller: Admin
- Auth: Admin JWT
- Idempotency: `Idempotency-Key`

Request:

```json
{
  "payload": {},
  "change_reason": "Tune client recommendation TTL"
}
```

Response `201`:

```json
{
  "config_key": "client.remote_config",
  "config_version": 4,
  "config_hash": "sha256:...",
  "status": "draft"
}
```

### POST `/admin/api/v1/configs/{config_key}/publish`

- Caller: Admin
- Auth: Admin JWT
- Idempotency: `Idempotency-Key`

Request:

```json
{
  "config_version": 4,
  "expected_hash": "sha256:...",
  "change_reason": "Publish validated config"
}
```

Behavior:

1. Validate `expected_hash` against draft payload.
2. Mark previous published row as `archived`.
3. Mark target row as `published`.
4. Update Redis cache keys.
5. Publish `config.published`.

Response `200` returns published metadata.

### POST `/admin/api/v1/configs/{config_key}/rollback`

- Caller: Admin / Ops
- Auth: Admin JWT
- Idempotency: `Idempotency-Key`

Request:

```json
{
  "target_config_version": 3,
  "change_reason": "Rollback after apply failures"
}
```

Behavior: creates a new published version whose payload equals `target_config_version`. Versions remain monotonic; rollback never rewinds the version counter.

## 5. Validation Rules

- `config_key` must exist in the allowlist.
- Payload must match the key's JSON schema.
- `config_hash` is `sha256:` + SHA-256 of canonical JSON.
- Versions are monotonic per `config_key`.
- Published config per `config_key` must be unique.
- Secret values must not be stored in config payload; store secret references or env variable names.

## 6. Redis Contract

| Purpose | Redis key/channel | TTL |
| --- | --- | --- |
| Payload cache | `config:{config_key}` | 10 min |
| Version cache | `config:version:{config_key}` | 10 min |
| Publish notification | `pubsub:config.published` | N/A |

Redis failure must not fail a committed publish. Backend records the failure and later cache misses rebuild from PostgreSQL.

## 7. Error Responses

| Code | HTTP | Meaning |
| --- | --- | --- |
| `CONFIG_KEY_NOT_FOUND` | 404 | Unknown config key |
| `CONFIG_SCHEMA_INVALID` | 400 | Payload does not match schema |
| `CONFIG_VERSION_CONFLICT` | 409 | Expected version/hash mismatch |
| `CONFIG_NOT_PUBLISHED` | 404 | No published config exists |
| `CONFIG_REDIS_SYNC_FAILED` | 202/500 | Publish committed but Redis update failed; severity depends on caller |

Standard error body:

```json
{
  "error": {
    "code": "CONFIG_VERSION_CONFLICT",
    "message": "config hash does not match draft",
    "request_id": "..."
  }
}
```

## 8. Smoke Validation

Staging smoke for P0-03 must:

1. Start Backend + PostgreSQL + Redis.
2. Seed default configs.
3. Call `/api/v1/config/client` and assert `config_key`, `config_version`, `config_hash`, and payload exist.
4. Publish a test config through Admin API or seed script.
5. Assert Redis `config:{config_key}` and `config:version:{config_key}` updated.
6. Assert `config.published` can be recovered by DB version even if Pub/Sub is not observed by the test.
