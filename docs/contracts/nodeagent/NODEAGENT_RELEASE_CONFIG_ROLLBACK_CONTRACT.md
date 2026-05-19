# NodeAgent Release, Binary Distribution, Config Delivery and Rollback Contract

> Task: `TASK-DOC-NODEAGENT-RELEASE-001`
> Owner: Backend / NodeAgent / Admin / DevOps
> Status: Ready
> Scope: NodeAgent binary version distribution, runtime config delivery, staged rollout, and rollback control.

## 1. Problem Statement

NodeAgent is a long-running production daemon. It cannot be treated as a static
binary that is manually copied once and forgotten. Production operations require
four closed loops:

1. Backend knows which NodeAgent versions are available and allowed.
2. NodeAgent can discover, download, verify, install, and rollback binary
   releases safely.
3. Backend can publish node-level runtime config with version/hash validation and
   rollback semantics.
4. Admin can operate rollout and rollback without seeing secrets or SSH-ing into
   nodes.

This contract extends the existing config-center work. `TASK-NA-CONFIG-001`
covers runtime config polling and last-known-good behavior. This document adds
binary release distribution, per-node rollout policy, upgrade state reporting,
and compatibility rules between binary versions and config schemas.

## 2. Terminology

| Term | Meaning |
| --- | --- |
| Agent release | A versioned NodeAgent binary artifact, for example `nodeagent_0.4.0_linux_amd64.tar.gz`. |
| Runtime config | `nodeagent.runtime_config` payload consumed by the running agent. |
| Release channel | `stable`, `canary`, `dev`, or `pinned`. |
| Rollout policy | Backend-side decision that maps node cohorts to target versions and config versions. |
| LKG | Last-known-good binary or config that previously passed validation and health checks. |
| Upgrade transaction | A single NodeAgent attempt to move from one binary/config version to another. |

## 3. Required Backend Capabilities

Backend must become the source of truth for both NodeAgent runtime config and
NodeAgent release metadata.

### 3.1 Schema

Backend must add idempotent schema for:

| Table | Purpose |
| --- | --- |
| `nodeagent_releases` | Available binary releases and artifact metadata. |
| `nodeagent_rollout_policies` | Channel/cohort target version, config version, rollout percent, pause flag. |
| `nodeagent_upgrade_events` | Agent-reported upgrade attempts, success/failure, rollback events. |
| `node_config_assignments` | Optional per-node config override or pinned config version. |

Suggested `nodeagent_releases` fields:

| Field | Type | Notes |
| --- | --- | --- |
| `version` | string | SemVer, unique. |
| `platform` | string | `linux`, `darwin`, future `windows`. |
| `arch` | string | `amd64`, `arm64`. |
| `artifact_url` | string | HTTPS object storage URL or signed URL issuer reference. |
| `sha256` | string | Required, `sha256:<hex>`. |
| `signature` | string | Optional initially, required before production. |
| `min_config_schema` | string | Lowest compatible runtime config schema. |
| `max_config_schema` | string | Highest compatible runtime config schema. |
| `status` | string | `draft`, `published`, `paused`, `revoked`. |
| `release_notes` | text | Operator-readable notes. |
| `created_at` / `published_at` | timestamptz | Audit metadata. |

### 3.2 NodeAgent Version Check API

Backend must provide a NodeAgent-authenticated endpoint:

```http
GET /internal/agent/release/check?agent_version=0.3.0&platform=linux&arch=amd64&config_version=12
```

Auth: existing NodeAgent HMAC or future mTLS.

Response:

```json
{
  "current_version": "0.3.0",
  "target_version": "0.4.0",
  "channel": "stable",
  "upgrade_required": false,
  "upgrade_recommended": true,
  "rollout_id": "rollout-2026-05-18-hy2",
  "artifact": {
    "url": "https://objects.example/nodeagent_0.4.0_linux_amd64.tar.gz",
    "sha256": "sha256:...",
    "signature": "base64..."
  },
  "config": {
    "target_config_version": 14,
    "config_hash": "sha256:...",
    "schema_version": "1.2"
  },
  "constraints": {
    "min_current_version": "0.3.0",
    "max_skip_versions": 2,
    "requires_manual_approval": false
  }
}
```

Backend must not return secret values in this response. Artifact URLs may be
short-lived signed URLs, but credentials for object storage must never be sent to
NodeAgent.

### 3.3 Upgrade Event API

Backend must provide:

```http
POST /internal/agent/release/events
```

Request:

```json
{
  "rollout_id": "rollout-2026-05-18-hy2",
  "from_version": "0.3.0",
  "to_version": "0.4.0",
  "status": "downloaded|verified|installed|healthy|failed|rolled_back",
  "reason": "health_check_failed",
  "current_config_version": 14,
  "last_known_good_version": "0.3.0",
  "last_known_good_config_version": 12,
  "error_code": "NODEAGENT_UPGRADE_HEALTH_FAILED",
  "message": "redacted operator-safe message"
}
```

Events must be append-only. They are the audit trail for rollout progress.

## 4. Required NodeAgent Capabilities

NodeAgent must implement the release manager as a separate module. It must not
be tangled with sing-box protocol rendering.

### 4.1 Modules

Suggested packages in `livemask-nodeagent`:

| Module | Responsibility |
| --- | --- |
| `internal/release/client.go` | Calls Backend release check and event APIs with NodeAuth. |
| `internal/release/downloader.go` | Downloads artifacts with size limit, timeout, and checksum stream validation. |
| `internal/release/verifier.go` | Verifies SHA-256 and future signature. |
| `internal/release/installer.go` | Atomically installs candidate binary beside current binary. |
| `internal/release/rollback.go` | Switches back to last-known-good binary. |
| `internal/release/manager.go` | Orchestrates state machine and health gates. |
| `internal/config/compat.go` | Checks binary version and config schema compatibility. |

### 4.2 Local Layout

NodeAgent must keep immutable versioned artifacts and symlinks/pointers:

```text
/var/lib/nodeagent/
  identity.json
  config-cache.json
  releases/
    0.3.0/nodeagent
    0.4.0/nodeagent
  current -> releases/0.4.0/nodeagent
  previous -> releases/0.3.0/nodeagent
  lkg.json
```

`lkg.json` must include:

```json
{
  "agent_version": "0.3.0",
  "binary_sha256": "sha256:...",
  "config_version": 12,
  "config_hash": "sha256:...",
  "healthy_at": "2026-05-18T12:00:00Z"
}
```

### 4.3 Upgrade State Machine

```text
idle
  -> checking
  -> downloading
  -> verifying
  -> staged
  -> installing
  -> restarting
  -> health_checking
  -> healthy

failed during download/verify/install/health_check
  -> rollback_pending
  -> rollback_installing
  -> rollback_health_checking
  -> rolled_back
```

NodeAgent must only mark a new binary as last-known-good after all gates pass:

- process starts
- runtime config validates
- sing-box/protocol config renders
- local health endpoint works
- Backend heartbeat succeeds
- optional public endpoint health passes for node profiles that require it

### 4.4 Rollback Rules

NodeAgent must rollback automatically when:

- binary checksum/signature verification fails
- new binary cannot start
- config schema is incompatible
- config apply fails and no compatible config can be fetched
- heartbeat fails continuously past threshold
- sing-box runtime enters `failed` or persistent `unhealthy`

#### Rollback Failure Handling

NodeAgent must handle rollback failures gracefully:

| Scenario | Behavior |
| --- | --- |
| Rollback binary checksum/signature mismatch | Keep current binary, do NOT mark any version as healthy. Report `rolled_back_failed` event. |
| Rollback binary cannot start | Keep current binary in place. Report `rolled_back_failed` with `reason: "rollback_binary_corrupt"`. Enter `recovery_pending` state — operator must SSH or use Admin force-pin. |
| Rollback LKG metadata corrupted | Attempt previous-known-good on-disk artifact; if none, mark node as `recovery_required`. |
| Both current and rollback binaries fail | NodeAgent must NOT auto-restart-loop. Exit with code 75 and wait for operator. Report event `recovery_required`. |
| identity.json missing during rollback | Block rollback. Report `rolled_back_failed`. Node enters `recovery_required`. |
| Rollback health check fails | Retry up to 3 times with exponential backoff (2s, 4s, 8s). If all retries fail, mark node `degraded` with reason `rollback_unhealthy`. |

After a failed rollback, the node is in `recovery_required` state. The operator
must manually intervene via Admin UI: either approve another retry or force-pin
to a specific version.

Rollback must not downgrade identity. `identity.json` remains stable across
binary rollbacks.

### 4.5 Config Compatibility

Every runtime config must carry:

```json
{
  "schema_version": "1.2",
  "min_agent_version": "0.4.0",
  "max_agent_version": "0.5.x",
  "config_version": 14,
  "config_hash": "sha256:..."
}
```

NodeAgent must reject configs that do not match its supported schema/version
range and continue with last-known-good config.

### 4.6 NodeAgent Local Endpoints

NodeAgent must expose the following local endpoints for diagnostics and manual
operator intervention:

| Endpoint | Method | Purpose | Auth |
| --- | --- | --- | --- |
| `/release/status` | GET | Full release manager status: current version, target, config version, LKG, state, last error | None (localhost only) |
| `/release/sync` | POST | Trigger immediate release check (bypass poll interval) | None (localhost only) |
| `/release/rollback` | POST | Force rollback to LKG | None (localhost only) |
| `/release/history` | GET | Last N upgrade events with timestamps and outcomes | None (localhost only) |
| `/agent/status` | GET | Full agent status including `release` sub-object | NodeAuth for external, none for localhost |
| `/healthz` | GET | Health endpoint: returns `503` if release manager is in `recovery_required` | None |

**Security note**: These local endpoints must bind to `127.0.0.1` only and must
not be exposed on the public interface. Reverse proxies or sidecar processes
must not proxy these paths.

## 5. Required Admin Capabilities

`livemask-admin` must provide operator views and actions. It must not expose
artifact signing keys or object storage credentials.

### 5.1 Release Management Pages

Admin REST API routes:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/admin/api/v1/nodeagent/releases` | List releases by version/platform/arch/status. |
| POST | `/admin/api/v1/nodeagent/releases` | Register release metadata and artifact checksum. |
| GET | `/admin/api/v1/nodeagent/releases/{id}` | Release detail with artifact metadata. |
| PATCH | `/admin/api/v1/nodeagent/releases/{id}/status` | Change release status (publish/pause/revoke). |
| GET | `/admin/api/v1/nodeagent/rollouts` | List rollout policies. |
| POST | `/admin/api/v1/nodeagent/rollouts` | Create rollout policy. |
| GET | `/admin/api/v1/nodeagent/rollouts/{id}` | Rollout progress with success/failure/in-flight counts. |
| POST | `/admin/api/v1/nodeagent/rollouts/{id}/pause` | Pause rollout. |
| POST | `/admin/api/v1/nodeagent/rollouts/{id}/resume` | Resume rollout. |
| POST | `/admin/api/v1/nodeagent/rollouts/{id}/rollback` | Rollback to previous LKG target. |
| GET | `/admin/api/v1/nodes/{id}` | Node detail with current/target agent version, config version, LKG, last upgrade event. |

#### Admin API Response Examples

**List releases** `GET /admin/api/v1/nodeagent/releases`:

```json
{
  "items": [
    {
      "id": "release-uuid-1",
      "version": "0.4.0",
      "platform": "linux",
      "arch": "amd64",
      "sha256": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "status": "published",
      "min_config_schema": "1.0",
      "max_config_schema": "1.5",
      "release_notes": "Add hysteria2 protocol support",
      "created_at": "2026-05-18T10:00:00Z",
      "published_at": "2026-05-18T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**Rollout detail** `GET /admin/api/v1/nodeagent/rollouts/{id}`:

```json
{
  "id": "rollout-uuid-1",
  "target_version": "0.4.0",
  "channel": "stable",
  "rollout_percent": 25,
  "status": "active",
  "stats": {
    "total_nodes": 200,
    "targeted": 50,
    "upgraded": 48,
    "failed": 1,
    "rolled_back": 1,
    "in_progress": 0
  },
  "created_at": "2026-05-18T12:00:00Z",
  "paused_at": null
}
```

**Node detail** `GET /admin/api/v1/nodes/{id}`:

```json
{
  "id": "node-uuid-1",
  "node_id": "na-abc123",
  "agent_version": "0.3.0",
  "target_version": "0.4.0",
  "config_version": 12,
  "target_config_version": 14,
  "rollout_id": "rollout-uuid-1",
  "lkg": {
    "agent_version": "0.3.0",
    "config_version": 12,
    "healthy_at": "2026-05-17T08:00:00Z"
  },
  "last_upgrade_event": {
    "status": "healthy",
    "from_version": "0.3.0",
    "to_version": "0.4.0",
    "reported_at": "2026-05-18T13:00:00Z"
  },
  "degraded_reason": null
}
```

### 5.2 Required Actions

| Action | Permission | Notes |
| --- | --- | --- |
| publish release | `node:manage` or future `nodeagent:release` | Requires checksum and release notes. |
| pause rollout | `node:manage` | Stops new upgrades, does not kill nodes. |
| resume rollout | `node:manage` | Continues rollout. |
| rollback rollout | `node:manage` | Assigns previous LKG target. |
| pin node version | `node:manage` | For emergency isolation. |
| force config refresh | `node:manage` | Requests pull; does not SSH. |

Dangerous actions must use confirmation dialogs, reason required, and audit log.

### 5.3 Admin Visible vs. Hidden Fields

| Visible to Admin | Never Visible to Admin |
| --- | --- |
| version, platform, arch, sha256 | artifact signing private key |
| status, release_notes | object storage access/secret key |
| min/max_config_schema | `storage_path` on server filesystem |
| rollout stats (total/success/fail) | node identity secret (identity.json) |
| node current/target version | HMAC key derived from node_secret |
| upgrade event history (redacted message) | artifact download token query string |
| LKG metadata | vendor license keys (if any) |

## 6. App Impact

`livemask-app` is not responsible for NodeAgent binary updates. It only consumes
the resulting node health and connect config.

App-visible impact:

- If Backend marks a node `degraded` during rollout, App recommendation must
  avoid it.
- If all nodes are rolling or degraded, App must show recoverable empty state.
- App diagnostics may display `node_agent_version`, `config_version`, and
  `degraded_reason` when provided by Backend.
- App must never receive NodeAgent binary URLs, artifact signatures, node
  secrets, or release credentials.

## 7. CI/CD Impact

`livemask-ci-cd` must provide smoke coverage after implementation. The following
acceptance matrix defines what must pass before a release-related PR merges.

### 7.1 CI Smoke Acceptance Matrix

| # | Test Case | Expected Result | Failure Impact |
| --- | --- | --- | --- |
| 1 | Register fake release metadata via Admin API | 201 Created, metadata stored | Blocked: no release management |
| 2 | NodeAgent version check returns upgrade available | 200, `upgrade_recommended=true` for outdated agent | Blocked: no upgrade path |
| 3 | NodeAgent download with valid checksum | Artifact saved, `status=downloaded` event reported | Blocked: cannot distribute |
| 4 | NodeAgent download with wrong checksum | Download rejected, artifact deleted, `status=failed` reported | Blocked: corrupted artifact not caught |
| 5 | NodeAgent installs and reports healthy | `status=healthy` event reported within timeout | Blocked: upgrade broken |
| 6 | Forced bad config triggers config rollback | NodeAgent continues with LKG config, event `config_rolled_back` reported | Blocked: no config safety |
| 7 | Admin rollback rollout | NodeAgent receives target = previous LKG version | Blocked: no operator recovery |
| 8 | NodeAgent auto-rollback on bad binary | `status=rolled_back` event reported, current version stays at LKG | Blocked: no safety net |
| 9 | Admin pauses then resumes rollout | Paused nodes do NOT upgrade; after resume they check | Blocked: no progressive delivery |
| 10 | NodeAgent `/release/status` returns valid state | 200, JSON with version/config/LKG fields | Warning: diagnostic gap |
| 11 | Admin API returns rollout stats with counts | total/upgraded/failed/rolled_back counts add up | Warning: operator visibility gap |
| 12 | Admin never sees `storage_path` or credentials | Admin API response does not contain `storage_path`, `secret`, `key`, `token` | Blocked: secret leak |
| 13 | Local dev runtime is not stopped by smoke | `livemask-local` containers continue running | Blocked: dev environment pollution |

### 7.2 Smoke Isolation

Staging smoke may use isolated compose projects only; it must not touch
`livemask-local`. The smoke project name must be unique per run (e.g.
`livemask-smoke-<run-id>`) to avoid container name conflicts.

### 7.3 Credential Smoke

CI must include a credential leak scan step that checks Admin API responses,
NodeAgent event payloads, and smoke script output against a deny list of
patterns: `storage_path`, `secret_key`, `access_key`, `private_key`,
`token`, `credential`, `license_key`.

## 8. Backend Error Codes

Backend must return structured error responses for release-related failures.

### 8.1 Release API Error Codes

| HTTP Status | Error Code | Meaning | Retryable |
| --- | --- | --- | --- |
| 400 | `RELEASE_VERSION_EXISTS` | Release version already registered | No |
| 400 | `RELEASE_CHECKSUM_INVALID` | SHA-256 hex length != 64 or unknown format | No |
| 400 | `RELEASE_CONFIG_SCHEMA_INVALID` | min/max schema version out of range | No |
| 400 | `RELEASE_PLATFORM_UNSUPPORTED` | platform not in allowlist | No |
| 404 | `RELEASE_NOT_FOUND` | Release ID or version does not exist | No |
| 409 | `RELEASE_ALREADY_PUBLISHED` | Cannot re-publish an already published release | No |
| 409 | `RELEASE_IN_USE` | Rollout policy currently targets this release | No |

### 8.2 Rollout API Error Codes

| HTTP Status | Error Code | Meaning | Retryable |
| --- | --- | --- | --- |
| 400 | `ROLLOUT_VERSION_INCOMPATIBLE` | Target version not compatible with node cohort config | No |
| 404 | `ROLLOUT_NOT_FOUND` | Rollout ID does not exist | No |
| 409 | `ROLLOUT_ALREADY_PAUSED` | Rollout is already paused | No |
| 409 | `ROLLOUT_ALREADY_ACTIVE` | Rollout is already active (can't resume) | No |
| 422 | `ROLLOUT_REQUIRES_APPROVAL` | Rollout requires manual approval before proceeding | Yes (after approval) |

### 8.3 NodeAgent Event Error Codes

| HTTP Status | Error Code | Meaning | Retryable |
| --- | --- | --- | --- |
| 400 | `NODEAGENT_EVENT_INVALID` | Event payload validation failed | No |
| 400 | `NODEAGENT_VERSION_UNKNOWN` | `from_version` or `to_version` not in Backend registry | No |
| 409 | `NODEAGENT_EVENT_OUT_OF_ORDER` | State machine violation (e.g. `healthy` without `downloaded`) | No |

## 9. Object Storage Credential Boundaries

Artifact storage credentials must be strictly isolated:

| Principle | Rule |
| --- | --- |
| Credential storage | Object storage credentials (`access_key`, `secret_key`, `endpoint`, `region`) exist only in Backend environment variables or secret manager. |
| Never to NodeAgent | NodeAgent must never receive storage credentials — it downloads artifacts via Backend-issued signed URLs or Backend-proxied download paths. |
| Never to Admin UI | Admin API responses must not include `storage_path`, `artifact_storage_path`, or any local filesystem path. Admin only sees `sha256`, `version`, and `status`. |
| Never to logs | Backend must redact signed URL query parameters, storage credentials, and any `storage_path` from log output. |
| URL expiration | Signed URLs must have a short TTL (default 15 minutes, max 1 hour). Backend must expose a re-sign endpoint if NodeAgent needs a fresh URL. |
| Object key format | Storage keys must follow `nodeagent/releases/{version}/{platform}/{arch}/nodeagent-{version}-{platform}-{arch}.tar.gz`. No user-controlled path segments. |

Backend storage abstraction:

```go
type ReleaseStorage interface {
    PutRelease(ctx context.Context, version, platform, arch string, r io.Reader, size int64) error
    GetReleaseURL(ctx context.Context, version, platform, arch string, ttl time.Duration) (string, error)
    ReleaseExists(ctx context.Context, version, platform, arch string) (bool, error)
    DeleteRelease(ctx context.Context, version, platform, arch string) error
}
```

This interface must not be exposed to Admin, NodeAgent, or App. Only Backend
internal code invokes it.

## 10. Security Requirements

- Artifact checksum required for every release.
- Signature verification is optional in MVP but required before production.
- Artifact URLs must be HTTPS and may be short-lived signed URLs.
- NodeAgent must enforce download size limits and timeouts.
- NodeAgent must never execute a binary before checksum verification.
- Release events and errors must redact secrets.
- Admin must never display signing private keys, object storage credentials, or
  node identity secrets.
- Rollback must preserve `identity.json` and local audit state.

## 11. Follow-up TASKs

| TASK | Repo | Goal |
| --- | --- | --- |
| `TASK-BACKEND-NODEAGENT-RELEASE-001` | `livemask-backend` | Release metadata schema, version check API, upgrade event API. |
| `TASK-NODEAGENT-RELEASE-001` | `livemask-nodeagent` | Release manager, artifact download/verify/install/rollback. |
| `TASK-BACKEND-NODEAGENT-CONFIG-ROLLBACK-001` | `livemask-backend` | Per-node config assignment, schema compatibility, rollback publish flow. |
| `TASK-ADMIN-NODEAGENT-RELEASE-001` | `livemask-admin` | Release/rollout UI, per-node version/config visibility. |
| `TASK-CICD-NODEAGENT-RELEASE-001` | `livemask-ci-cd` | Smoke tests for release and rollback flows. |
| `TASK-APP-NODE-STATUS-002` | `livemask-app` | Display node rollout/degraded reason when Backend exposes safe fields. |
| `TASK-DOC-NODEAGENT-RELEASE-SIGNING-001` | `livemask-docs` | Artifact signing and verification contract — signing key lifecycle, distribution, rotation, revocation. |

## 12. Definition of Done

- Backend exposes release metadata and upgrade event APIs.
- NodeAgent can install a verified new binary and rollback to LKG.
- NodeAgent can reject incompatible config and continue LKG.
- NodeAgent local diagnostic endpoints (`/release/status`, `/release/sync`, `/release/rollback`, `/release/history`) return valid state.
- Admin can publish, pause, resume, and rollback rollout policies.
- Admin API response examples conform to the schema in this contract.
- Backend error codes are structured and documented for each release/rollout/event API.
- CI smoke validates success, rollback, and rollback-failure paths.
- CI smoke includes credential leak detection.
- Object storage credentials are never exposed to NodeAgent, Admin, or logs.
- App continues to hide rolling/degraded nodes from recommendation.
- No secret material appears in connect config, admin UI, logs, or task reports.

## 13. Companion Contracts

This contract is part of a series:

- [Config Center Contract](../api/config-center.md) — Base config center schema, version, hash, Redis notification.
- [TASK-NA-CONFIG-001-config-sync-hot-reload.md](../../development/tasks/TASK-NA-CONFIG-001-config-sync-hot-reload.md) — NodeAgent config sync polling, LKG, hot reload.
- [Admin Job Center / Scheduler Contract](../jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md) — Release rollouts as job service executors.
