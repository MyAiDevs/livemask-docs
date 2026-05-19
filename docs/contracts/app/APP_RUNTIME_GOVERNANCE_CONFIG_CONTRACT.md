# App Runtime Governance Config Contract

> Task: `TASK-DOC-APP-RUNTIME-GOVERNANCE-001`
> Owner: Backend / Admin / App / CI-CD / Docs
> Status: Ready
> Scope: Defines the runtime governance config formerly described as
> `vpn_client_governance`, including multi-platform App performance, resource,
> reconnect, health-check, cache, and VPN behavior controls.

Related contracts:

- [Core MVP Config Contracts](../config/core-configs.md)
- [Admin System Settings Contract](../admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md)
- [Log / Audit / Metric Pipeline Contract](../observability/LOG_METRIC_PIPELINE_CONTRACT.md)
- [App Release Distribution Contract](APP_RELEASE_DISTRIBUTION_CONTRACT.md)
- [NAT Sharing / Device-as-Router Abuse Guard](../vpn/NAT_SHARING_GUARD_CONTRACT.md)

## 1. Why This Exists

The old v3.6 docs already defined `vpn_client_governance` for dynamic resource
control, especially to protect iOS NetworkExtension memory and improve weak
network behavior. That design must now become a first-class cross-repo contract
instead of remaining as an archived sample.

This config controls:

- App startup and config refresh behavior.
- VPN health check frequency and reconnect backoff.
- Circuit breaker thresholds and protocol fallback.
- Memory and buffer limits for platform-native tunnel runtimes.
- Platform-specific overrides for iOS, Android, macOS, Windows, Linux, and Web.
- Safe performance sampling that complements, but does not replace, Sentry.
- Optional `nat_sharing_guard` policy for best-effort prevention of device-as-
  router abuse. The policy must use aggregate counters only and must not store
  browsing history, raw destination lists, domains, URLs, or packet payloads.

It is separate from App Sentry config:

| Config | Purpose | Safe For App |
| --- | --- | --- |
| `observability.sentry_app` | Crash/exception/performance observability | Public DSN and sampling only |
| `app_runtime_governance` | Runtime resource and connection behavior | Yes, no secrets |

## 2. API Contract

Backend exposes the runtime config to App through a safe public/user-context API.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/app/runtime-config` | public app context or user JWT when available | Return App runtime governance config |

Recommended query parameters:

| Parameter | Required | Purpose |
| --- | --- | --- |
| `platform` | yes | `ios`, `android`, `macos`, `windows`, `linux`, `web` |
| `app_version` | yes | Semantic/build version for compatibility gating |
| `build_number` | no | Native build number |
| `release_channel` | yes | `local`, `internal`, `beta`, `stable` |
| `config_version` | no | Last local config version for no-op decisions |
| `locale` | no | User-visible disabled/degraded reason localization |

Response:

```json
{
  "config_key": "app_runtime_governance",
  "schema_version": "1.0",
  "config_version": 12,
  "config_hash": "sha256:...",
  "effective_platform": "ios",
  "generated_at": "2026-05-19T10:00:00Z",
  "runtime_governance": {
    "enabled": true,
    "resource_limits": {
      "max_memory_mb": 120,
      "max_concurrent_connections": 6,
      "buffer_size_kb": 192,
      "enable_memory_pressure_mode": true
    },
    "behavior": {
      "health_check_interval_ms": 12000,
      "reconnect_initial_backoff_ms": 1500,
      "reconnect_max_backoff_ms": 30000,
      "circuit_breaker_failure_threshold": 5,
      "protocol_fallback_enabled": true,
      "aggressive_reconnect_on_poor_network": false
    },
    "performance": {
      "startup_config_timeout_ms": 1200,
      "api_timeout_ms": 8000,
      "content_cache_ttl_seconds": 1800,
      "geoip_cache_ttl_seconds": 86400,
      "enable_lightweight_diagnostics": true,
      "max_local_event_queue_size": 1000
    },
    "platform_overrides": {}
  }
}
```

Rules:

- The response must contain no secrets. It must never include node secrets,
  connect credentials, service tokens, Sentry server tokens, payment provider
  credentials, IM contact identifiers, full URLs with signed query strings, or
  local filesystem paths.
- `config_hash` must be computed from canonical JSON for the effective config.
- Backend may return `304` only if the App implementation explicitly supports
  it. MVP should prefer `200` with current metadata to avoid cache ambiguity.
- If no config is published, Backend returns safe defaults with `enabled=true`
  and a generated config version, or `enabled=false` with a localized reason.
- App must keep last-known-good and must not block startup, login, content feed,
  or VPN connection when this API is unavailable.

## 3. Schema

### 3.1 Base Config

```json
{
  "enabled": true,
  "resource_limits": {
    "max_memory_mb": 180,
    "max_concurrent_connections": 8,
    "buffer_size_kb": 256,
    "enable_memory_pressure_mode": true
  },
  "behavior": {
    "health_check_interval_ms": 8000,
    "reconnect_initial_backoff_ms": 1500,
    "reconnect_max_backoff_ms": 30000,
    "circuit_breaker_failure_threshold": 5,
    "protocol_fallback_enabled": true,
    "aggressive_reconnect_on_poor_network": false
  },
  "performance": {
    "startup_config_timeout_ms": 1200,
    "api_timeout_ms": 8000,
    "content_cache_ttl_seconds": 1800,
    "geoip_cache_ttl_seconds": 86400,
    "enable_lightweight_diagnostics": true,
    "max_local_event_queue_size": 1000
  },
  "platform_overrides": {
    "ios": {
      "resource_limits": {
        "max_memory_mb": 120,
        "max_concurrent_connections": 6,
        "buffer_size_kb": 192
      },
      "behavior": {
        "health_check_interval_ms": 12000
      }
    },
    "android": {
      "resource_limits": {
        "max_memory_mb": 200
      }
    },
    "macos": {
      "resource_limits": {
        "max_memory_mb": 256
      }
    },
    "windows": {
      "resource_limits": {
        "max_memory_mb": 256
      }
    },
    "linux": {
      "resource_limits": {
        "max_memory_mb": 256
      }
    },
    "web": {
      "enabled": false,
      "behavior": {
        "protocol_fallback_enabled": false
      }
    }
  }
}
```

### 3.2 Validation Ranges

| Field | Range / Rule |
| --- | --- |
| `resource_limits.max_memory_mb` | `64..512`; iOS production should be `<= 160`, recommended `<= 120` |
| `resource_limits.max_concurrent_connections` | `1..32`; iOS recommended `<= 6` |
| `resource_limits.buffer_size_kb` | `64..1024` |
| `behavior.health_check_interval_ms` | `3000..60000` |
| `behavior.reconnect_initial_backoff_ms` | `500..10000` |
| `behavior.reconnect_max_backoff_ms` | `5000..120000` and must be `>= reconnect_initial_backoff_ms` |
| `behavior.circuit_breaker_failure_threshold` | `1..20` |
| `performance.startup_config_timeout_ms` | `300..5000` |
| `performance.api_timeout_ms` | `1000..30000` |
| `performance.content_cache_ttl_seconds` | `60..86400` |
| `performance.geoip_cache_ttl_seconds` | `3600..604800` |
| `performance.max_local_event_queue_size` | `100..10000` |

Backend must reject invalid Admin writes and must not silently coerce values
except when applying documented default values for missing optional fields.

## 4. Platform Rules

| Platform | Required Behavior |
| --- | --- |
| iOS | Prefer conservative memory, longer health-check interval, memory pressure mode on, no aggressive reconnect by default |
| Android | Permit moderate memory and reconnect behavior, but respect battery/network constraints |
| macOS | Desktop limits may be higher; still avoid unbounded queue or health-check loops |
| Windows | Same as desktop, but native service/daemon must enforce local queue and reconnect limits |
| Linux | Same as desktop; local service must handle missing TUN permissions gracefully |
| Web | No system VPN runtime; config may control UI/cache behavior only |

App completion reports must not claim Windows/Linux/native VPN validation from
macOS-only builds.

## 5. Admin System Settings

Admin manages the config under:

| Route | Purpose |
| --- | --- |
| `/admin/settings/app-runtime` | App runtime governance editor |

System setting section:

```text
app.runtime_governance
```

Admin UI requirements:

- Show global defaults and platform overrides in separate tabs.
- Provide range validation before submit.
- Show config version, hash, last publisher, last published time, and rollback
  target.
- Require confirmation when changing memory limits, reconnect policy, circuit
  breaker threshold, or platform-specific overrides.
- Support preview by platform/version/channel before publishing.
- Show no secret inputs because this config must contain no secrets.
- Chinese default, English fallback.

## 6. Backend Requirements

Backend must:

- Store `app_runtime_governance` as a versioned config or domain setting.
- Validate schema/ranges before publishing.
- Provide `/api/v1/app/runtime-config`.
- Preserve last-known-good published version for rollback.
- Write audit logs for create/update/publish/rollback.
- Expose Admin preview and publish APIs through System Settings or Config
  Center.
- Never include secrets in the App-facing response.

Recommended Admin APIs:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/api/v1/system-settings/app-runtime` | Read safe summary and current config |
| PUT | `/admin/api/v1/system-settings/app-runtime` | Save draft or update config |
| POST | `/admin/api/v1/system-settings/app-runtime/preview` | Resolve effective config for platform/version/channel |
| POST | `/admin/api/v1/system-settings/app-runtime/publish` | Publish new version |
| POST | `/admin/api/v1/system-settings/app-runtime/rollback` | Publish rollback version |

## 7. App Requirements

App must:

- Fetch runtime config asynchronously at startup and on manual refresh.
- Validate `config_key`, `schema_version`, `config_version`, and `config_hash`.
- Store last-known-good locally.
- Apply safe changes without interrupting an active tunnel when possible.
- Defer disruptive changes until reconnect or next session if needed.
- Expose local debug/status fields: `current`, `stale`, `fallback`,
  `invalid`, `last_success_at`, `config_version`, `config_hash`.
- Ignore unknown fields.
- Reject invalid config and keep last-known-good.

The config may tune behavior but must not:

- Replace platform-native VPN runtime.
- Inject secrets.
- Change user subscription entitlements.
- Disable required security checks such as certificate pinning.
- Hide failures from the user when connection quality degrades.
- Enable VPN sharing, LAN proxy mode, or router mode.

## 8. Observability

Backend/Admin/App should track:

| Signal | Purpose |
| --- | --- |
| `app_runtime_config_fetch_success_total` | Config fetch success |
| `app_runtime_config_fetch_failure_total{reason}` | Fetch/parse/hash failures |
| `app_runtime_config_apply_success_total` | Applied config count |
| `app_runtime_config_apply_failure_total{reason}` | Invalid or incompatible config |
| `app_runtime_config_lkg_used_total{reason}` | Last-known-good fallback |
| `app_runtime_memory_pressure_total{platform}` | Memory pressure mode activation |
| `app_runtime_circuit_breaker_open_total{platform,profile_type}` | Circuit breaker opens |

Labels must remain low-cardinality. Do not label with user email, device ID,
node endpoint, IP address, session ID, or raw URL.

## 9. Security And Privacy

- This config is Public/Internal-safe and must contain no secrets.
- No browsing history, visited domains, destination IP history, packet content,
  IM contact identifier, payment credential, node secret, or Sentry server
  secret may appear in config, logs, metrics, or Admin preview.
- Admin mutation audit must include actor, changed fields, version, and reason,
  but not full device/user identifiers.

## 10. CI/CD Smoke

CI/CD should later add `app-runtime-governance-smoke.sh` after Backend/Admin/App
implementation:

1. Admin login.
2. Low-permission user cannot write runtime config.
3. Read current runtime config.
4. Preview iOS effective config.
5. Reject invalid memory and interval values.
6. Publish valid config and receive new version/hash.
7. App API returns safe effective config.
8. App API response contains no forbidden secrets.
9. Rollback creates a new version.
10. App tests verify LKG fallback and invalid-config rejection.

## 11. Follow-Up Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001` | `livemask-backend` | Versioned config storage, validation, Admin APIs, App runtime-config API |
| `TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001` | `livemask-admin` | `/admin/settings/app-runtime` UI, preview/publish/rollback |
| `TASK-APP-RUNTIME-GOVERNANCE-001` | `livemask-app` | Fetch/cache/validate/apply runtime governance config |
| `TASK-CICD-APP-RUNTIME-GOVERNANCE-SMOKE-001` | `livemask-ci-cd` | Smoke after Backend/Admin/App finish |

## 12. Done Criteria

- Contract is linked from config, app, backend, admin, and task indexes.
- Backend validates and publishes versioned config.
- App uses last-known-good and does not block startup.
- Admin can preview/publish/rollback without secret fields.
- CI/CD verifies auth, validation, App API, rollback, and secret leakage.
