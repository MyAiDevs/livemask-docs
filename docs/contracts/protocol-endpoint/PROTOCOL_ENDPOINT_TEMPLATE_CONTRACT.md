# Protocol & Endpoint Template Contract

> Task: `TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001`  
> Owner: Backend / Job Service / NodeAgent / Admin / CI-CD / Docs  
> Status: Draft  
> Scope: Defines the cross-repo contract for protocol endpoint template management,
> batch assignment, staged rollout, NodeAgent apply, Backend connect_config
> reconciliation, and App graceful reconnect.

Related mandatory contracts:

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Job Queue Usage Matrix](../jobs/JOB_QUEUE_USAGE_MATRIX.md)
- [Admin Job Center / Scheduler Contract](../jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [NodeAgent Protocol Extension Architecture](../../nodeagent/NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md)
- [Hysteria2 Connect Config Contract](../vpn/HYSTERIA2_CONNECT_CONFIG_CONTRACT.md)
- [NodeAgent Release Config Rollback Contract](../nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md)

---

## 1. Why This Exists

LiveMask supports multiple VPN protocols. As the platform grows from MVP mixed
skeleton to real protocol stacks (Hysteria2, VLESS, Trojan, ShadowTLS,
WireGuard), Backend must be able to:

1. Define protocol endpoint templates once.
2. Assign templates to nodes by region, capability, or manual override.
3. Roll out assignments in staged waves with per-wave health gates.
4. NodeAgent applies the rendered profile, verifies endpoint readiness, and
   reports status.
5. Backend adjusts connect_config output so App can reconnect with updated
   protocol/endpoint metadata.
6. Admin can observe rollout progress, pause, retry, or roll back.

Without this contract, each new protocol would require ad-hoc configuration
screens, hardcoded rollout logic, and silent client failures.

---

## 2. Core Domain Model

### 2.1 Protocol Template

A **protocol template** defines the reusable profile configuration for a single
protocol. It is the unit of assignment and versioning.

```json
{
  "template_id": "uuid",
  "name": "hysteria2-udp-standard",
  "display_name": "Hysteria2 UDP Standard",
  "description": "Standard Hysteria2 UDP with default bandwidth allocation.",
  "protocol": "hysteria2",
  "transport": "quic",
  "system_managed": false,
  "created_by": "admin-uuid-or-system",
  "version": 1,
  "latest_config_hash": "sha256:abc123...",
  "enabled": true,
  "rollout_blocked": false,
  "seeded_at": null,
  "profile_config": {
    "up_mbps": 100,
    "down_mbps": 500,
    "hop_ports": null,
    "obfs_type": "salamander",
    "port": 443
  },
  "secret_refs": [
    {
      "key": "hysteria2.auth",
      "source": "backend",
      "required": true
    }
  ],
  "created_at": "2026-05-18T00:00:00Z",
  "updated_at": "2026-05-18T00:00:00Z"
}
```

#### Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `template_id` | uuid | yes | Stable unique identifier. |
| `name` | string | yes | URL-safe unique name, e.g. `hysteria2-udp-standard`. |
| `display_name` | string | yes | Human-readable name. |
| `description` | string | no | Optional human-readable description. |
| `protocol` | string | yes | Protocol identifier, must match `ProtocolProfile.Name()`. |
| `transport` | string | yes | Transport layer: `tcp`, `quic`, `websocket`, `grpc`, `kcp`. |
| `system_managed` | boolean | yes | `true` for seed/built-in templates, `false` for custom. |
| `created_by` | string | yes | User UUID or literal `"system"`. |
| `version` | integer | yes | Monotonically increasing per-template version. |
| `latest_config_hash` | string | yes | SHA-256 of `profile_config` + `secret_refs` at this version. |
| `enabled` | boolean | yes | If `false`, template is disabled and cannot be assigned. |
| `rollout_blocked` | boolean | yes | If `true`, rollout jobs will skip this template. |
| `seeded_at` | timestamptz | no | When the seed template was first inserted. `null` for custom. |
| `profile_config` | jsonb | no | Protocol-specific safe fields (see Secret Boundary). |
| `secret_refs` | jsonb | no | References to secrets stored in Backend secure store. |
| `created_at` | timestamptz | yes | Audit timestamp. |
| `updated_at` | timestamptz | yes | Audit timestamp. |

#### Validation Rules

- `name` must match regex `^[a-z0-9][a-zA-Z0-9_-]*[a-z0-9]$` with inner bracket expression escaped.
- `protocol` must be a known protocol in the Backend protocol registry.
- `transport` must be a known transport type.
- `profile_config` must pass the safe fields whitelist for the given protocol.
- `secret_refs` must not duplicate keys within the same template.

### 2.2 Template Version

Each update to a `protocol_template` creates a new immutable version snapshot.

```json
{
  "version_id": "uuid",
  "template_id": "uuid",
  "version": 1,
  "profile_config": { "...safe fields..." },
  "secret_refs": [
    { "key": "hysteria2.auth", "source": "backend", "required": true }
  ],
  "config_hash": "sha256:abc123...",
  "created_by": "admin-uuid-or-system",
  "created_at": "2026-05-18T00:00:00Z",
  "snapshot_notes": "Initial seed template."
}
```

#### Rules

- Versions are immutable. Once created, `profile_config`, `secret_refs`, and
  `config_hash` cannot change.
- A new version bumps `version` by 1.
- `config_hash` = `SHA-256(canonical_json(profile_config) + canonical_json(secret_refs))`.
- The active/latest version is pointed to by `protocol_template.latest_version`.
- Rollback creates a new version whose `profile_config` copies the historical
  version's data. The `version` number still increments.

### 2.3 Template Assignment

An assignment links one or more template versions to a set of nodes.

```json
{
  "assignment_id": "uuid",
  "name": "Asia Hysteria2 Rollout Wave 1",
  "template_id": "uuid",
  "template_version": 1,
  "node_selector": {
    "regions": ["asia-east", "asia-southeast"],
    "exclude_nodes": ["node-uuid-here"],
    "max_nodes": 10,
    "min_agent_version": "0.4.0",
    "capabilities": ["hysteria2"]
  },
  "status": "active",
  "rollout_policy": {
    "wave_size": 3,
    "wave_interval_seconds": 300,
    "error_threshold": 0.1,
    "max_concurrent_waves": 2
  },
  "created_by": "admin-uuid",
  "active_run_id": "uuid",
  "created_at": "2026-05-18T00:00:00Z",
  "updated_at": "2026-05-18T00:00:00Z"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `assignment_id` | uuid | yes | Stable unique identifier. |
| `name` | string | yes | Human-readable name for the assignment. |
| `template_id` | uuid | yes | Reference to the protocol template. |
| `template_version` | integer | yes | Specific template version to assign. |
| `node_selector` | jsonb | yes | Node selection rules (see Section 8). |
| `status` | string | yes | `draft`, `active`, `paused`, `completed`, `rolled_back`. |
| `rollout_policy` | jsonb | yes | Wave configuration (see Section 9). |
| `created_by` | string | yes | User UUID. |
| `active_run_id` | uuid | no | Job Service run ID when status is `active`. |
| `created_at` | timestamptz | yes | Audit timestamp. |
| `updated_at` | timestamptz | yes | Audit timestamp. |

### 2.4 Rollout Event

Each per-node application attempt generates rollout events.

```json
{
  "event_id": "uuid",
  "assignment_id": "uuid",
  "run_id": "uuid",
  "node_id": "uuid",
  "event_type": "assigned|applied|endpoint_ready|endpoint_not_ready|degraded|failed|rolled_back",
  "template_name": "hysteria2-udp-standard",
  "template_version": 1,
  "message": "Node applied template version 1, health check passed.",
  "metadata": {
    "endpoint_host": "203.0.113.42",
    "endpoint_port": 443,
    "protocol": "hysteria2",
    "duration_ms": 1500
  },
  "created_at": "2026-05-18T10:00:00Z"
}
```

#### Event Types

| Event Type | Meaning | Terminal |
| --- | --- | --- |
| `assigned` | Node is target of the assignment. | No |
| `applied` | NodeAgent accepted and applied the template. | No |
| `endpoint_ready` | NodeAgent health check confirms protocol is reachable. | Yes |
| `endpoint_not_ready` | Health check failed after apply. | No |
| `degraded` | Node reports degraded state. | No |
| `failed` | NodeAgent could not apply or health check permanently failed. | Yes |
| `rolled_back` | Template was rolled back on this node. | Yes |

#### Redaction Rules

- `metadata` must not contain raw secrets (auth passwords, private keys, etc.).
- Error messages in `message` must be operator-safe and redacted.

---

## 3. Built-in Seed Templates

Seed templates are not the same thing as currently deployable protocols.

Backend may seed templates for implemented, future, or reserved protocols, but
Admin MUST NOT display a protocol as operational only because a seed template
exists. Operational availability comes from NodeAgent capability reports and App
client support status.

### 3.1 Seed Template List

The following built-in templates are seeded idempotently on first Backend
deployment or migration.

| # | Name | Protocol | Transport | Reserved | Safe Fields Profile |
| --- | --- | --- | --- | --- | --- |
| 1 | `mixed-basic-public` | mixed | tcp | No | `{ "port": 443 }` |
| 2 | `socks-basic-public` | socks | tcp | No | `{ "port": 1080 }` |
| 3 | `tun-local-mixed` | tun | tcp | No | `{ "dns": "8.8.8.8" }` |
| 4 | `hysteria2-udp-standard` | hysteria2 | quic | No | `{ "up_mbps": 100, "down_mbps": 500, "obfs_type": "none", "port": 443 }` |
| 5 | `hysteria2-udp-obfs-salamander` | hysteria2 | quic | No | `{ "up_mbps": 100, "down_mbps": 500, "obfs_type": "salamander", "port": 443 }` |
| 6 | `hysteria2-low-bandwidth` | hysteria2 | quic | No | `{ "up_mbps": 10, "down_mbps": 50, "obfs_type": "none", "port": 443 }` |
| 7 | `hysteria2-high-throughput` | hysteria2 | quic | No | `{ "up_mbps": 500, "down_mbps": 2000, "obfs_type": "none", "port": 443 }` |
| 8 | `vless-reality-reserved` | vless_reality | tcp | Yes | `{ "port": 443 }` |
| 9 | `trojan-reserved` | trojan | tcp | Yes | `{ "port": 443 }` |
| 10 | `shadowtls-reserved` | shadowtls | tcp | Yes | `{ "port": 443 }` |
| 11 | `wireguard-reserved` | wireguard | udp | Yes | `{ "port": 51820 }` |
| 12 | `regional-asia-hysteria2` | hysteria2 | quic | No | `{ "up_mbps": 100, "down_mbps": 500, "obfs_type": "none", "port": 443 }` |
| 13 | `regional-us-hysteria2` | hysteria2 | quic | No | `{ "up_mbps": 200, "down_mbps": 1000, "obfs_type": "none", "port": 443 }` |
| 14 | `regional-eu-hysteria2` | hysteria2 | quic | No | `{ "up_mbps": 200, "down_mbps": 1000, "obfs_type": "none", "port": 443 }` |
| 15 | `emergency-direct-mixed-fallback` | mixed | tcp | No | `{ "port": 80 }` |

### 3.2 Seed Template Rules

All seed templates share these properties:

| Property | Value |
| --- | --- |
| `system_managed` | `true` |
| `created_by` | `"system"` |
| `version` | `1` |
| `config_hash` | Required, computed from `profile_config` + `secret_refs` |
| `profile_config` | Safe fields only (see Section 4 Secret Boundary) |
| `secret_refs` | No secret-like keys in `profile_config` |

Reserved templates (`vless-reality-reserved`, `trojan-reserved`,
`shadowtls-reserved`, `wireguard-reserved`) additionally have:

| Property | Value |
| --- | --- |
| `enabled` | `false` |
| `rollout_blocked` | `true` |

Non-reserved templates have:

| Property | Value |
| --- | --- |
| `enabled` | `true` |
| `rollout_blocked` | `false` |

### 3.3 Idempotent Seeding

The seeding migration must:

1. Check if a template with `name` already exists.
2. If not found, insert the seed template with `system_managed=true`.
3. If found and `system_managed=false` (custom template with same name), skip
   seeding and log a warning.
4. If found and `system_managed=true`, compare `config_hash`. If the seed
   definition has changed, create a new version with updated fields. Do not
   overwrite the existing version.

Seeding is idempotent. Running the migration multiple times produces the same
result.

### 3.4 Protocol Capability Sync

Protocol support is runtime data, not only static Backend template data.

NodeAgent MUST report the protocol profiles it actually supports. Backend MUST
aggregate this into a protocol support matrix. Admin MUST use the aggregated
matrix when showing templates, creating assignments, and explaining why an
operation is blocked.

#### Capability State Model

| State | Meaning | Rollout allowed |
| --- | --- | --- |
| `implemented` | NodeAgent supports validate, render, endpoint metadata, health checks, and event redaction for this profile. | Yes, if App/client support is also ready or assignment is server-only. |
| `partial` | NodeAgent knows the profile but lacks one or more required operations. | No by default; only dry-run / lab mode. |
| `reserved` | Backend knows the protocol and may seed templates, but rollout is intentionally blocked. | No. |
| `unsupported` | NodeAgent does not know or cannot apply the protocol. | No. |
| `app_pending` | NodeAgent and Backend support exist, but App native engine or client config support is not ready. | Server rollout may be allowed only when connect_config is blocked from clients. |
| `unknown` | Backend has not received fresh capability data from the node. | No, unless admin explicitly targets with force dry-run. |

#### NodeAgent Capability Report

NodeAgent heartbeat/status MUST include a protocol capability list derived from
the local ProtocolProfile registry, not from Backend templates.

Example:

```json
{
  "protocol_capabilities": [
    {
      "protocol": "mixed",
      "state": "implemented",
      "transports": ["tcp"],
      "supports_validate": true,
      "supports_render": true,
      "supports_endpoint": true,
      "supports_health_check": true,
      "supports_secret_refs": false,
      "supports_client_config": true,
      "profile_version": "builtin",
      "reason": null,
      "reported_at": "2026-05-18T00:00:00Z"
    },
    {
      "protocol": "hysteria2",
      "state": "implemented",
      "transports": ["udp"],
      "supports_validate": true,
      "supports_render": true,
      "supports_endpoint": true,
      "supports_health_check": true,
      "supports_secret_refs": true,
      "supports_client_config": false,
      "profile_version": "builtin",
      "reason": "app_native_engine_pending",
      "reported_at": "2026-05-18T00:00:00Z"
    },
    {
      "protocol": "vless_reality",
      "state": "reserved",
      "transports": ["tcp"],
      "supports_validate": false,
      "supports_render": false,
      "supports_endpoint": false,
      "supports_health_check": false,
      "supports_secret_refs": true,
      "supports_client_config": false,
      "profile_version": null,
      "reason": "reserved_profile_not_implemented",
      "reported_at": "2026-05-18T00:00:00Z"
    }
  ]
}
```

Required fields:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `protocol` | string | yes | Must match `ProtocolProfile.Name()` or reserved protocol name. |
| `state` | string | yes | One of `implemented`, `partial`, `reserved`, `unsupported`, `app_pending`, `unknown`. |
| `transports` | string[] | yes | Supported transports for this node/profile. |
| `supports_validate` | boolean | yes | Whether config validation is implemented. |
| `supports_render` | boolean | yes | Whether sing-box render/apply path is implemented. |
| `supports_endpoint` | boolean | yes | Whether public endpoint metadata can be reported. |
| `supports_health_check` | boolean | yes | Whether protocol-specific health checks exist. |
| `supports_secret_refs` | boolean | yes | Whether Backend-resolved secret refs are supported. |
| `supports_client_config` | boolean | yes | Whether App/client connect_config can safely use this profile. |
| `profile_version` | string | no | Profile implementation version or `"builtin"`. |
| `reason` | string | no | Redacted operator-safe reason. |
| `reported_at` | timestamptz | yes | Report timestamp. |

#### Backend Aggregation Rules

Backend MUST:

1. Store the latest protocol capability report per node.
2. Mark reports stale when older than the NodeAgent heartbeat freshness window.
3. Expose per-node and fleet-level protocol support summaries to Admin.
4. Resolve template eligibility from both template metadata and capability data.
5. Reject or skip assignment targets whose capability state is not eligible.
6. Keep reserved templates visible as roadmap/reserved, but not assignable.
7. Avoid generating App `connect_config` for protocols whose `supports_client_config=false`.

Recommended Admin APIs:

```http
GET /admin/api/v1/protocol/capabilities
GET /admin/api/v1/nodes/{node_id}/protocol-capabilities
GET /admin/api/v1/protocol-templates/{template_id}/eligibility
```

Example fleet summary:

```json
{
  "items": [
    {
      "protocol": "hysteria2",
      "fleet_state": "partial",
      "implemented_nodes": 12,
      "eligible_nodes": 0,
      "app_client_ready": false,
      "reserved": false,
      "blocking_reason": "app_native_engine_pending"
    },
    {
      "protocol": "vless_reality",
      "fleet_state": "reserved",
      "implemented_nodes": 0,
      "eligible_nodes": 0,
      "app_client_ready": false,
      "reserved": true,
      "blocking_reason": "reserved_profile_not_implemented"
    }
  ]
}
```

#### Assignment Gating Rules

Before creating a rollout run, Backend MUST evaluate:

- template `enabled=true`
- template `rollout_blocked=false`
- target node capability state is `implemented`
- target node supports the requested transport
- profile safe fields validate for the reported NodeAgent profile
- `supports_client_config=true` if the template is intended for App sessions
- endpoint readiness requirement if `require_endpoint_ready=true`

If any check fails:

- Synchronous assignment creation MUST return a clear error.
- Job Service rollout MUST record a redacted `protocol_unsupported` or
  `protocol_capability_mismatch` event and skip that node.
- Admin MUST display the reason before the operator starts rollout.

Recommended error codes:

| Error Code | Meaning |
| --- | --- |
| `PROTOCOL_UNSUPPORTED_BY_NODE` | Target node cannot apply this protocol. |
| `PROTOCOL_RESERVED` | Protocol is known but intentionally blocked. |
| `PROTOCOL_CAPABILITY_UNKNOWN` | Node has no fresh capability report. |
| `PROTOCOL_CLIENT_PENDING` | Server can apply but App/client cannot consume it safely. |
| `PROTOCOL_TRANSPORT_UNSUPPORTED` | Node supports protocol but not requested transport. |

#### Admin UI Requirements

Admin MUST show protocol support explicitly in:

- Template list.
- Template detail.
- Assignment creation wizard.
- Node list / node detail.
- Rollout events.
- Dashboard protocol endpoint widget.

Required labels:

| UI Label | Source |
| --- | --- |
| `Ready on N nodes` | `eligible_nodes > 0` |
| `NodeAgent unsupported` | no target node has `implemented` support |
| `Reserved` | template is reserved or protocol state is `reserved` |
| `App pending` | `supports_client_config=false` or fleet summary says client pending |
| `Capability stale` | report older than freshness window |

Admin MUST NOT:

- Treat seeded templates as supported.
- Show a working "Apply" action for reserved/unsupported protocols.
- Hide unsupported protocols completely when they are useful roadmap context.
- Allow force rollout without a clear warning and audit log.

#### Current Development Rule

Until every protocol is implemented end-to-end, the recommended path is:

```text
NodeAgent reports real capabilities -> Backend aggregates eligibility -> Admin displays support state and gates operations.
```

Do not require NodeAgent to implement every seeded protocol before Admin can be
correct. Admin correctness means showing real support and blocking unsafe
actions.

---

## 4. Secret Boundary

### 4.1 Profile Config Safe Whitelist

`profile_config` may only contain fields that are safe to expose in API
responses, Admin UI, and job events.

Per-protocol safe fields:

| Protocol | Safe Fields |
| --- | --- |
| `mixed` | `port` |
| `socks` | `port` |
| `tun` | `dns`, `mtu`, `route` |
| `hysteria2` | `up_mbps`, `down_mbps`, `hop_ports`, `obfs_type`, `port` |
| `vless_reality` | `port`, `server_name`, `alpn` |
| `trojan` | `port` |
| `shadowtls` | `port`, `server_name` |
| `wireguard` | `port`, `allowed_ips`, `dns`, `mtu` |

### 4.2 Forbidden in Profile Config

The following must never appear in `profile_config`:

- `auth`, `auth_payload`, `password`
- `obfs_password`
- `private_key`, `secret_key`, `node_secret`, `node_secret_hash`
- `hmac`, `token`, `api_key`, `license_key`
- Full download URLs with query tokens
- Local filesystem paths

### 4.3 Secret Store

Secrets are stored in Backend secure store and referenced via `secret_refs`:

```json
{
  "secret_refs": [
    { "key": "hysteria2.auth", "source": "backend", "required": true },
    { "key": "hysteria2.obfs_password", "source": "backend", "required": false }
  ]
}
```

When NodeAgent pulls the assignment, Backend resolves `secret_refs` and includes
the resolved secrets in the NodeAgent-scoped response. Secrets are never
included in responses to Admin, App, or job events.

---

## 5. Node Selection Rules

### 5.1 Selector Model

```json
{
  "node_selector": {
    "regions": ["asia-east", "asia-southeast"],
    "exclude_nodes": ["node-uuid-1"],
    "include_nodes": ["node-uuid-2"],
    "max_nodes": 10,
    "min_agent_version": "0.4.0",
    "max_agent_version": "0.5.x",
    "capabilities": ["hysteria2"],
    "tags": {
      "include": ["tier-1", "ssd"],
      "exclude": ["beta"]
    },
    "health_status": ["healthy"],
    "current_protocols": ["mixed"]
  }
}
```

| Field | Type | Description |
| --- | --- | --- |
| `regions` | string[] | Region codes. Nodes in any matching region qualify. |
| `exclude_nodes` | uuid[] | Explicitly exclude these nodes. |
| `include_nodes` | uuid[] | Explicitly include these nodes (overrides other filters). |
| `max_nodes` | integer | Cap on number of nodes. `null` = unlimited. |
| `min_agent_version` | string | Minimum NodeAgent version (semver check). |
| `max_agent_version` | string | Maximum NodeAgent version (semver check). |
| `capabilities` | string[] | Node must support all listed capabilities. |
| `tags` | object | Node tag filtering. Both `include` and `exclude` arrays. |
| `health_status` | string[] | Node must be in one of these health states. |
| `current_protocols` | string[] | Node must currently serve at least one of these protocols. |

### 5.2 Selection Resolver

Backend must provide an internal resolver that:

1. Applies `include_nodes` as unconditional inclusion.
2. Applies `exclude_nodes` as unconditional exclusion.
3. Filters by `regions` (OR logic).
4. Filters by `min_agent_version` / `max_agent_version`.
5. Filters by `capabilities` (AND logic, all required).
6. Filters by `tags` (include any of `include`, exclude any of `exclude`).
7. Filters by `health_status`.
8. Filters by `current_protocols`.
9. Caps at `max_nodes` (random selection if more qualify).
10. Returns the final node list for the rollout wave.

The resolver must be callable by Job Service workers to compute wave targets.

---

## 6. Job Service Rollout Rules

### 6.1 Workflow

```text
Admin creates/edits template assignment
  -> Backend validates schema, safe fields, and node selector
  -> Backend creates/updates assignment record
  -> Backend calls Job Service to start rollout run
  -> Job Service evaluates node selector, creates waves
  -> Wave 1: pick wave_size nodes, create per-node queue items
     -> Worker calls Backend endpoint to notify/generate node-specific config
     -> NodeAgent pulls /internal/agent/protocol-assignment
     -> NodeAgent applies, health checks, reports event
     -> Worker evaluates per-node result
     -> If error_threshold not exceeded after wave completes, schedule next wave
     -> If error_threshold exceeded, pause rollout, notify
  -> All waves complete: mark assignment "completed"
  -> Admin can pause/resume/rollback during any wave
```

### 6.2 Queue Classification

| Operation | Classification | Justification |
| --- | --- | --- |
| Template creation/update | `synchronous_allowed` | Single record CRUD within request. |
| Template assignment rollout | `queue_required` | Fan-out across nodes, long-running, per-wave health gates, rollback needed. |
| Template assignment rollback | `queue_required` | Same fan-out and health gate requirements as rollout. |
| Template deletion (disable only) | `synchronous_allowed` | Soft delete, no fan-out. |

### 6.3 Wave Configuration

```json
{
  "rollout_policy": {
    "wave_size": 5,
    "wave_interval_seconds": 300,
    "error_threshold": 0.1,
    "max_concurrent_waves": 1,
    "per_node_timeout_seconds": 600,
    "auto_pause_on_error": true
  }
}
```

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `wave_size` | integer | 5 | Nodes per wave. |
| `wave_interval_seconds` | integer | 300 | Wait between waves. |
| `error_threshold` | float | 0.1 | Fraction of nodes in wave that can fail before auto-pause. |
| `max_concurrent_waves` | integer | 1 | Waves executed in parallel. |
| `per_node_timeout_seconds` | integer | 600 | Max wait for node to report endpoint_ready. |
| `auto_pause_on_error` | boolean | true | Pause rollout when error threshold hit. |

### 6.4 Lock Scope

| Operation | Lock Scope |
| --- | --- |
| Template assignment rollout | `assignment_id` |
| Template assignment rollback | `assignment_id` |

---

## 7. NodeAgent Assignment API

### 7.1 Pull Endpoint

```http
GET /internal/agent/protocol-assignment
```

Auth: existing NodeAgent HMAC.

Response:
```json
{
  "assignment_id": "uuid",
  "template_name": "hysteria2-udp-standard",
  "template_version": 1,
  "protocol": "hysteria2",
  "transport": "quic",
  "profile_config": {
    "up_mbps": 100,
    "down_mbps": 500,
    "obfs_type": "salamander",
    "port": 443
  },
  "resolved_secrets": {
    "hysteria2.auth": "sess_aBcDeFgHiJkLmNoP...",
    "hysteria2.obfs_password": "obfs-secret-value"
  },
  "config_hash": "sha256:abc123...",
  "rollout_id": "rollout-uuid",
  "assigned_at": "2026-05-18T10:00:00Z"
}
```

Rules:

- Secrets are included only for NodeAgent-scoped responses.
- Backend resolves `secret_refs` from secure store before responding.
- `config_hash` matches the template version's `config_hash`.
- `assigned_at` is the time Backend determined this assignment.
- If no assignment exists, return `204 No Content`.

### 7.2 NodeAgent Apply Sequence

1. Pull `/internal/agent/protocol-assignment`.
2. Compare `config_hash` with locally cached assignment.
3. If unchanged, skip.
4. If new or changed:
   a. Validate `profile_config` fields.
   b. Resolve `resolved_secrets` into protocol config.
   c. Call `ProtocolProfile.Validate()`.
   d. Call `ProtocolProfile.Render()`.
   e. Apply rendered config to sing-box (hot reload or restart).
   f. Run `ProtocolProfile.HealthChecks()`.
   g. Report event via `/internal/agent/protocol-events`.

---

## 8. NodeAgent Event API

### 8.1 Report Endpoint

```http
POST /internal/agent/protocol-events
```

Auth: existing NodeAgent HMAC.

Request:
```json
{
  "node_id": "uuid",
  "assignment_id": "uuid",
  "rollout_id": "rollout-uuid",
  "template_name": "hysteria2-udp-standard",
  "template_version": 1,
  "config_hash": "sha256:abc123...",
  "event_type": "endpoint_ready|endpoint_not_ready|degraded|failed|rolled_back",
  "endpoint": {
    "protocol": "hysteria2",
    "host": "203.0.113.42",
    "port": 443,
    "server_name": "cdn.example.com",
    "transport": "quic"
  },
  "health": {
    "status": "healthy|degraded|unhealthy",
    "degraded_reason": null,
    "last_healthy_at": "2026-05-18T10:05:00Z"
  },
  "message": "redacted operator-safe message",
  "evented_at": "2026-05-18T10:05:00Z"
}
```

### 8.2 NodeAgent State Machine

```text
idle
  -> checking_assignment
  -> applying
  -> health_checking
  -> endpoint_ready

Failed during apply/health_check:
  -> degraded
  -> failed (terminal, requires admin intervention)

Endpoint was ready but became unhealthy:
  -> monitoring
  -> degraded (recoverable, self-heal)
  -> endpoint_not_ready (reported, no self-heal)
```

---

## 9. Backend Connect Config Reconciliation

When a NodeAgent reports `endpoint_ready` or `endpoint_not_ready`, Backend must:

1. Update `connect_node_endpoints` record with latest endpoint metadata and
   health status.
2. If `endpoint_ready`, mark the node's protocol profile as eligible for
   `connect_config` responses.
3. If `endpoint_not_ready` or `degraded`, mark the node's protocol profile as
   ineligible. Existing App sessions are not immediately disrupted but new
   connections should avoid this profile.
4. When App pulls `connect_config`, Backend selects nodes/protocols whose
   endpoints are `endpoint_ready`.

The App reconnect flow is documented in
[CLIENT_RECONNECT_HINT_CONTRACT.md](../realtime/CLIENT_RECONNECT_HINT_CONTRACT.md).

---

## 10. Admin UI Requirements

`livemask-admin` must implement:

### 10.1 Template Management

| Route | Purpose |
| --- | --- |
| `/admin/protocol-templates` | List all templates with status, version, protocol, enabled badge. |
| `/admin/protocol-templates/new` | Create custom template (system_managed=false). |
| `/admin/protocol-templates/{name}` | View template detail, version history, current assignments. |
| `/admin/protocol-templates/{name}/edit` | Edit profile_config safe fields, secret_refs, enabled/blocked. |

### 10.2 Assignment Management

| Route | Purpose |
| --- | --- |
| `/admin/protocol-assignments` | List all assignments with status, template, node count badge. |
| `/admin/protocol-assignments/new` | Create assignment: select template, configure node selector, set rollout policy. |
| `/admin/protocol-assignments/{id}` | View assignment detail, wave progress, per-node events. |
| `/admin/protocol-assignments/{id}/rollback` | Trigger rollback to previous template version or LKG. |

### 10.3 Design Requirements

- Dense operations UI, not marketing layout.
- System-managed templates show a lock icon and are not editable (except
  enabled/blocked toggles).
- Reserved templates show a "Reserved" badge and cannot be edited at all.
- Wave progress shows per-wave success/failure counts and expandable node list.
- Rollback action requires confirmation dialog.
- No secret fields appear in any Admin view.

---

## 11. CI/CD Smoke Matrix

After implementation, `livemask-ci-cd` must cover:

| Step | Expected |
| --- | --- |
| List seed templates | Returns all 15 seed templates. |
| List non-reserved templates | Returns only non-reserved templates. |
| Create custom template | 200/201 with valid safe fields. |
| Create template with secret-like field in profile_config | 400 rejected. |
| Update template with invalid protocol | 400 rejected. |
| Create assignment | 200/202 with node_selector validation. |
| List assignments | Returns created assignment. |
| Duplicate assignment lock | 409 or skipped. |
| View assignment events | No secret leakage in event metadata. |
| Rollback assignment | 200/202, creates rollback run. |
| NodeAgent pulls assignment (mock) | Returns valid config_hash and resolved_secrets. |
| NodeAgent reports endpoint_ready | Event stored correctly. |
| connect_config reconciliation | Node appears in connect_config after endpoint_ready. |
| Reserved template cannot be enabled | 400 or blocked. |
| System-managed template profile_config read-only | Admin UI shows lock. |

---

## 12. Rollback Strategy

### 12.1 Trigger Conditions

- Rollout error threshold exceeded (auto-pause).
- Admin manually triggers rollback from UI.
- Backend detects critical regression in endpoint_ready rate.

### 12.2 Rollback Flow

```text
Admin clicks Rollback
  -> Backend validates that a previous assignment/template version exists
  -> Backend creates a new "rollback" assignment referencing the LKG template version
  -> Backend calls Job Service to start rollback run
  -> Job Service creates per-node queue items
     -> Worker updates per-node assignment target
     -> NodeAgent pulls /internal/agent/protocol-assignment on next poll
     -> NodeAgent detects config_hash changed, applies previous profile
     -> NodeAgent health checks, reports endpoint_ready or failed
  -> Job Service evaluates wave gates
  -> If all nodes rolled back successfully: mark assignment "rolled_back"
  -> Admin shows completed rollback
```

### 12.3 LKG Tracking

Each node tracks:
- `current_template_name`
- `current_template_version`
- `current_config_hash`
- `lkg_template_name`
- `lkg_template_version`
- `lkg_config_hash`
- `lkg_healthy_at`

Rollback assigns the LKG template version as the target. If no LKG exists (e.g.,
first-ever assignment), rollback is blocked and Admin must manually intervene.

### 12.4 Safety Rules

- Rollback creates a new versioned assignment. It does not mutate history.
- Rollback must not bypass health gates. Each node must still report
  `endpoint_ready` after rollback.
- If rollback itself fails on too many nodes, Assignment remains in `failed`
  state requiring manual operator intervention.
- Rollback is always a full revert to LKG, not a partial revert.

---

## 13. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-PROTOCOL-TEMPLATE-001` | `livemask-backend` | Protocol template schema, CRUD API, node selector resolver, connect_config reconciliation. |
| `TASK-BACKEND-PROTOCOL-ROLLOUT-001` | `livemask-backend` | Backend internal API for Job Service worker to resolve assignment secrets and trigger node assignment. |
| `TASK-JOBS-PROTOCOL-ROLLOUT-001` | `livemask-job-service` | Protocol rollout/rollback executor: wave orchestration, per-node queue, error threshold. |
| `TASK-NODEAGENT-PROTOCOL-ASSIGNMENT-001` | `livemask-nodeagent` | Assignment pull client, apply sequence, event reporter. |
| `TASK-ADMIN-PROTOCOL-TEMPLATE-001` | `livemask-admin` | Template management UI, assignment creation, rollout progress view, rollback action. |
| `TASK-CICD-PROTOCOL-TEMPLATE-001` | `livemask-ci-cd` | Protocol template and rollout smoke tests per Section 11. |

---

## 14. Done Criteria

- Protocol template schema with versioning and config_hash is implemented.
- 15 seed templates are idempotently seeded on first deploy.
- Secret boundary enforced: safe fields whitelist, no secret-leak in any output.
- Node selector resolver supports region, tags, capabilities, health, agent version.
- Job Service protocol rollout executor supports waves, health gates, auto-pause.
- NodeAgent can pull assignment, apply, health check, and report events.
- Backend reconciles connect_node_endpoints from NodeAgent events.
- Admin can view, create, edit templates and assignments.
- Admin can trigger rollback with confirmation.
- CI/CD smoke validates seed templates, CRUD, rollout, rollback, and no secret leakage.
- App graceful reconnect flow is defined in CLIENT_RECONNECT_HINT_CONTRACT.md.

---

## 15. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-05-18 | Initial version | TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 |
