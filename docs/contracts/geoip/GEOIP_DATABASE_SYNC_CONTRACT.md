# GeoIP Database Update, NodeAgent Sync and App Incremental Sync Contract

> Task: `TASK-DOC-GEOIP-SYNC-001`
> Owner: Backend / NodeAgent / App / Admin / DevOps
> Status: Draft
> Scope: Backend scheduled GeoIP database updates, artifact verification, NodeAgent sync, App incremental sync, and rollback.

## 1. Problem Statement

LiveMask uses GeoIP data for node region display, recommendation, traffic
analytics, country aggregation, quality scoring, and future routing policy. The
current docs mention MaxMind GeoLite2 in analytics flows, but do not define how
GeoIP database files are updated, verified, versioned, distributed to NodeAgent
and App, or rolled back.

GeoIP databases are operational artifacts. They must be handled like signed
runtime data, not as ad hoc files copied onto servers.

There are two different consumers:

| Consumer | Data shape | Reason |
| --- | --- | --- |
| NodeAgent | Full verified runtime artifact, usually MMDB | Node-side classification, analytics, and future routing policy. |
| App | Lightweight region catalog and/or compact incremental GeoIP package | Local region selection, diagnostics, weak-network fallback, and UI cache. |

App must not be forced to download a full server-side MMDB if a compact package
is enough. Backend should generate App-specific delta packages from the verified
source artifact.

## 2. Recommended Data Sources

Backend should support a source registry rather than hard-coding one vendor.
The following free/open-friendly sources are acceptable candidates for MVP. Legal
and attribution requirements must be reviewed before production.

| Source | URL | Formats | Update cadence / constraints | Notes |
| --- | --- | --- | --- | --- |
| DB-IP Lite | `https://db-ip.com/db/lite.php` | CSV, MMDB | Monthly; Creative Commons Attribution 4.0 | Good MVP default for Country/City/ASN Lite. Attribution is required. |
| MaxMind GeoLite2 | `https://dev.maxmind.com/geoip/geolite2-free-geolocation-data` | MMDB, CSV | Free account + license key; 30 downloads/day; data must be kept current under EULA | Mature ecosystem and `geoip2` tooling. Requires license key handling and attribution/compliance review. |
| IP2Location LITE | `https://www.ip2location.com/database/lite` | CSV, BIN, CIDR; selected editions also provide MMDB | Free signup; monthly/semi-monthly style updates depending on edition | Useful fallback source. Confirm exact license/edition before redistribution. |

Do not let NodeAgent or App download directly from vendors. Backend owns vendor
credentials, license keys, attribution metadata, artifact verification,
transformation, and rollout policy. NodeAgent and App only sync verified
artifacts from Backend or object storage URLs issued by Backend.

## 3. Backend Responsibilities

### 3.1 Scheduled Update Job

Backend must implement a scheduled task, for example
`geoip.database.refresh`, that:

1. Reads enabled GeoIP source definitions.
2. Downloads the upstream database into a temp location.
3. Verifies expected file type and minimum size.
4. Computes SHA-256 hash.
5. Optionally validates vendor checksum/signature when available.
6. Opens the database with the expected reader library.
7. Runs lookup sanity checks with known public test IPs.
8. Stores artifact metadata in PostgreSQL.
9. Uploads the verified artifact to object storage or internal artifact store.
10. Marks the previous artifact as last-known-good until rollout health passes.

### 3.2 Schema

Suggested tables:

| Table | Purpose |
| --- | --- |
| `geoip_sources` | Vendor/source config, enabled flag, attribution text, update cadence. |
| `geoip_databases` | Versioned verified artifacts. |
| `geoip_app_packages` | App-specific compact/full/delta packages derived from verified artifacts. |
| `geoip_rollout_events` | Rollout, sync, failure, rollback events by node. |
| `node_geoip_assignments` | Optional per-node pinned database version. |

Suggested `geoip_databases` fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `source` | string | `dbip_lite`, `maxmind_geolite2`, `ip2location_lite`. |
| `edition` | string | `country`, `city`, `asn`, etc. |
| `format` | string | `mmdb`, `csv`, `bin`, `cidr`. |
| `version` | string | Vendor release date or normalized version. |
| `artifact_url` | string | Internal object storage URL or signed URL issuer ref. |
| `sha256` | string | Required. |
| `license_name` | string | Example: `CC-BY-4.0`, `GeoLite2-EULA`. |
| `attribution` | text | Required when source requires attribution. |
| `status` | string | `draft`, `published`, `paused`, `revoked`, `rolled_back`. |
| `published_at` | timestamptz | Published time. |
| `expires_at` | timestamptz | Required for sources with freshness obligations. |

Suggested `geoip_app_packages` fields:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key. |
| `database_id` | uuid | Source `geoip_databases.id`. |
| `package_type` | string | `region_catalog`, `country_prefix_delta`, `asn_delta`, `full_compact`. |
| `platform` | string | `all`, `ios`, `android`, `macos`, future `windows`. |
| `from_version` | string | Empty for full package, required for delta. |
| `to_version` | string | Target GeoIP version. |
| `artifact_url` | string | Internal URL or signed URL issuer ref. |
| `sha256` | string | Required. |
| `size_bytes` | bigint | Required for App download guard. |
| `status` | string | `draft`, `published`, `revoked`. |

Backend scheduled refresh must generate both:

- NodeAgent artifact metadata for full verified runtime DB.
- App package metadata for lightweight and delta sync.

### 3.3 NodeAgent GeoIP Check API

Backend must provide a NodeAgent-authenticated endpoint:

```http
GET /internal/agent/geoip/check?current_version=2026-05&format=mmdb&edition=country
```

Auth: existing NodeAgent HMAC or future mTLS.

Response when update is available:

```json
{
  "update_available": true,
  "database": {
    "source": "dbip_lite",
    "edition": "country",
    "format": "mmdb",
    "version": "2026-05",
    "artifact_url": "https://objects.example/geoip/dbip-country-2026-05.mmdb",
    "sha256": "sha256:...",
    "size_bytes": 12345678,
    "license_name": "CC-BY-4.0",
    "attribution": "IP Geolocation by DB-IP",
    "expires_at": "2026-06-30T00:00:00Z"
  },
  "rollout_id": "geoip-2026-05-country"
}
```

Response when current:

```json
{
  "update_available": false,
  "database": {
    "source": "dbip_lite",
    "edition": "country",
    "format": "mmdb",
    "version": "2026-05",
    "sha256": "sha256:..."
  }
}
```

### 3.4 NodeAgent GeoIP Event API

```http
POST /internal/agent/geoip/events
```

Request:

```json
{
  "rollout_id": "geoip-2026-05-country",
  "from_version": "2026-04",
  "to_version": "2026-05",
  "status": "downloaded|verified|installed|healthy|failed|rolled_back",
  "reason": "checksum_mismatch",
  "current_sha256": "sha256:...",
  "last_known_good_version": "2026-04",
  "message": "operator-safe redacted message"
}
```

Events must be append-only and auditable.

### 3.5 App GeoIP Manifest API

Backend must provide a user-authenticated App endpoint:

```http
GET /api/v1/geoip/manifest?platform=ios&app_version=1.2.0&current_version=2026-04&package_type=region_catalog
```

Auth: User JWT. Public unauthenticated access is not recommended until rate
limit, caching, and abuse controls are implemented.

Response when an update is available:

```json
{
  "update_available": true,
  "current_version": "2026-04",
  "target_version": "2026-05",
  "package_type": "region_catalog",
  "strategy": "delta",
  "artifact": {
    "url": "https://objects.example/geoip/app/region-catalog-2026-04-to-2026-05.json.br",
    "sha256": "sha256:...",
    "size_bytes": 45678,
    "compression": "br",
    "content_type": "application/json"
  },
  "fallback_full": {
    "url": "https://objects.example/geoip/app/region-catalog-2026-05.json.br",
    "sha256": "sha256:...",
    "size_bytes": 234567,
    "compression": "br",
    "content_type": "application/json"
  },
  "license": {
    "name": "CC-BY-4.0",
    "attribution": "IP Geolocation by DB-IP"
  },
  "expires_at": "2026-06-30T00:00:00Z"
}
```

Response when current:

```json
{
  "update_available": false,
  "current_version": "2026-05",
  "package_type": "region_catalog"
}
```

### 3.6 App GeoIP Event API

Backend should provide a lightweight event endpoint:

```http
POST /api/v1/geoip/events
```

Request:

```json
{
  "from_version": "2026-04",
  "to_version": "2026-05",
  "package_type": "region_catalog",
  "status": "downloaded|verified|installed|failed|rolled_back",
  "reason": "checksum_mismatch",
  "platform": "ios",
  "app_version": "1.2.0",
  "message": "operator-safe redacted message"
}
```

This event endpoint is for sync quality and diagnostics only. It must not block
App startup.

## 4. NodeAgent Responsibilities

NodeAgent must add a GeoIP sync module separate from protocol rendering and
binary release management.

Suggested packages:

| Module | Responsibility |
| --- | --- |
| `internal/geoip/client.go` | Calls Backend GeoIP check/event APIs with NodeAuth. |
| `internal/geoip/downloader.go` | Downloads artifacts with timeout and size limits. |
| `internal/geoip/verifier.go` | Validates SHA-256 and opens the database. |
| `internal/geoip/store.go` | Manages versioned local database files and LKG pointer. |
| `internal/geoip/manager.go` | Polling, install, rollback, and status reporting. |

Local layout:

```text
/var/lib/nodeagent/
  geoip/
    country/
      2026-04/GeoIP-Country.mmdb
      2026-05/GeoIP-Country.mmdb
      current -> 2026-05/GeoIP-Country.mmdb
      previous -> 2026-04/GeoIP-Country.mmdb
      lkg.json
```

`lkg.json`:

```json
{
  "source": "dbip_lite",
  "edition": "country",
  "format": "mmdb",
  "version": "2026-05",
  "sha256": "sha256:...",
  "healthy_at": "2026-05-18T12:00:00Z"
}
```

## 5. NodeAgent Sync State Machine

```text
idle
  -> checking
  -> downloading
  -> verifying
  -> installing
  -> health_checking
  -> healthy

failure
  -> rollback_pending
  -> rollback_installing
  -> rolled_back
```

NodeAgent must mark a GeoIP database as LKG only after:

- checksum matches Backend metadata
- database opens successfully
- sample lookup succeeds
- current symlink/pointer switch succeeds
- event report to Backend succeeds or is queued for retry

## 6. Rollback Rules

Rollback to previous LKG when:

- download fails repeatedly past retry policy
- checksum mismatch
- database cannot be opened
- sample lookup fails
- current pointer switch fails
- new DB causes runtime lookup panic or repeated errors

Rollback must not delete older LKG immediately. Keep at least two versions.

## 7. Runtime Config Integration

`nodeagent.runtime_config` should include:

```json
{
  "geoip": {
    "enabled": true,
    "edition": "country",
    "format": "mmdb",
    "poll_interval_sec": 86400,
    "max_download_bytes": 104857600,
    "allow_sources": ["dbip_lite", "maxmind_geolite2"],
    "required_for_recommendation": false
  }
}
```

If GeoIP sync fails, NodeAgent must continue using last-known-good DB. It may
enter degraded mode only when the configured feature requires GeoIP to operate.

## 8. App Responsibilities

App must implement a lightweight GeoIP/region sync module separate from VPN
native runtime.

Suggested Flutter modules:

| Module | Responsibility |
| --- | --- |
| `lib/models/geoip_models.dart` | Manifest, package metadata, region catalog, local state. |
| `lib/api/geoip_api_client.dart` | Calls manifest/event APIs with user auth. |
| `lib/storage/geoip_cache_storage.dart` | Stores current package, version, hash, and LKG. |
| `lib/providers/geoip_providers.dart` | Startup load, background refresh, state exposure. |

App local layout is platform-specific but must keep:

```text
geoip/
  region_catalog/
    current.json
    previous.json
    lkg.json
```

App must verify:

- artifact size <= `max_download_bytes`
- SHA-256 matches manifest
- JSON schema is valid
- package version moves from current to target
- delta can apply cleanly; otherwise fallback to full package

App sync state machine:

```text
idle
  -> checking
  -> downloading_delta
  -> verifying
  -> applying_delta
  -> installed

delta failure
  -> downloading_full
  -> verifying
  -> installed

full failure
  -> keep_lkg
```

App usage:

- region filter and node list cache
- diagnostics metadata
- weak-network fallback when Backend region endpoints are temporarily unavailable
- local display of country/region names already returned by Backend

App must not use local GeoIP data to bypass Backend recommendation policy.
Backend remains the source of truth for recommended nodes.

App must not receive:

- vendor license keys
- object storage credentials
- raw vendor account URLs with credentials
- NodeAgent artifact URLs if those differ from App package URLs
- full server MMDB unless explicitly allowed by config and size limits

## 9. App Runtime Config Integration

Backend should expose App sync policy via `client.remote_config`:

```json
{
  "geoip": {
    "enabled": true,
    "package_type": "region_catalog",
    "poll_interval_sec": 86400,
    "max_download_bytes": 5242880,
    "allow_delta": true,
    "fallback_to_full": true,
    "required_for_startup": false
  }
}
```

If App GeoIP sync fails, App must continue with last-known-good package or show
region data from Backend responses. It must not block login, billing, or VPN
session preparation.

## 10. Admin Responsibilities

`livemask-admin` should expose:

| Route | Purpose |
| --- | --- |
| `/admin/geoip/databases` | List GeoIP database versions, source, status, sha256, freshness. |
| `/admin/geoip/app-packages` | List App compact/full/delta packages, size, platform, version. |
| `/admin/geoip/sources` | Configure source priority, cadence, attribution, and license metadata. |
| `/admin/geoip/rollouts` | View rollout progress and failed nodes. |
| `/admin/nodes/[id]` | Show node current GeoIP version, LKG, last sync status. |

Actions:

- trigger refresh
- publish verified DB
- pause rollout
- rollback to previous database
- pin node to a GeoIP DB version
- revoke a bad App package
- publish a corrected App package

All actions require reason and audit log. Admin must not show vendor license
keys, object storage credentials, or signed URL secrets.

## 11. CI/CD Requirements

`livemask-ci-cd` should later add GeoIP smoke:

1. Backend seeds a tiny test MMDB/fixture artifact.
2. NodeAgent checks for update.
3. Download succeeds.
4. Checksum mismatch test fails safely.
5. Valid DB installs and reports healthy.
6. Bad DB triggers rollback.
7. App manifest returns delta package.
8. App delta checksum mismatch falls back to full package.
9. App full package installs and reports event.
10. Local dev runtime is not stopped.

## 12. Security and Compliance

- Backend stores vendor credentials in secret manager or environment, not config
  payloads.
- NodeAgent and App never receive vendor account credentials.
- Artifact URLs should be short-lived when they are signed.
- All downloads use timeouts, size limits, and checksum verification.
- Logs and events redact URLs if they contain credentials or signed query
  strings.
- Attribution requirements must be retained in metadata and surfaced where
  product/legal requires it.
- App package URLs must be scoped to App packages and must not expose NodeAgent
  full runtime artifacts unless explicitly allowed.

## 15. Follow-up TASKs

| TASK | Repo | Goal |
| --- | --- | --- |
| `TASK-BACKEND-GEOIP-001` | `livemask-backend` | Source registry, scheduled update job, artifact metadata, NodeAgent check/event APIs, App manifest/event APIs. |
| `TASK-BACKEND-GEOIP-SOURCE-002` | `livemask-backend` | Source hardening, storage abstraction, manifest signature, rate limit, delta fallback skeleton. |
| `TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001` | `livemask-backend` | MaxMind tar.gz decompression and .mmdb extraction. |
| `TASK-NODEAGENT-GEOIP-001` | `livemask-nodeagent` | GeoIP sync manager, verifier, local LKG, rollback. |
| `TASK-NODEAGENT-GEOIP-002` | `livemask-nodeagent` | Event retry queue. |
| `TASK-NODEAGENT-GEOIP-003` | `livemask-nodeagent` | Manifest signature verify + key rotation. |
| `TASK-NODEAGENT-GEOIP-004` | `livemask-nodeagent` | Delta package apply. |
| `TASK-NODEAGENT-GEOIP-005` | `livemask-nodeagent` | Lookup engine. |
| `TASK-NODEAGENT-GEOIP-006` | `livemask-nodeagent` | Heartbeat contract extension. |
| `TASK-NODEAGENT-GEOIP-007` | `livemask-nodeagent` | Compatibility gate. |
| `TASK-NODEAGENT-GEOIP-008` | `livemask-nodeagent` | Runtime config integration. |
| `TASK-APP-GEOIP-001` | `livemask-app` | App GeoIP manifest client, delta/full package sync, cache, LKG, fallback. |
| `TASK-APP-GEOIP-LOOKUP-001` | `livemask-app` | App GeoIP lookup engine. |
| `TASK-ADMIN-GEOIP-001` | `livemask-admin` | GeoIP source/database/rollout UI. |
| `TASK-CICD-GEOIP-001` | `livemask-ci-cd` | GeoIP update and rollback smoke. |
| `TASK-CICD-GEOIP-HARDENING-002` | `livemask-ci-cd` | Signature/rate-limit/delta-fallback/source-hardening smoke. |
| `TASK-APP-NODE-REGION-001` | `livemask-app` | Safe region/degraded display using Backend fields and local GeoIP cache. |
| `TASK-DOC-GEOIP-CONTRACT-002` | `livemask-docs` | GeoIP source hardening contract. |

## 14. Production Hardening Supplement

This contract defines the basic GeoIP database sync flow. For production
hardening capabilities — source allowlist, artifact storage abstraction,
manifest signature, full/delta strategy, App API rate limit, unknown
format/profile handling, MaxMind tar.gz extraction, and security
boundaries — see the companion contract:

- [GEOIP_SOURCE_HARDENING_CONTRACT.md](GEOIP_SOURCE_HARDENING_CONTRACT.md) —
  GeoIP production hardening: source allowlist, storage abstraction, manifest
  signature, rate limit, delta strategy, unknown format handling, MaxMind tar.gz
  extraction, security boundaries, and current implementation status per repo.

## 16. Definition of Done

- Backend scheduled GeoIP update job exists and stores verified artifact metadata.
- NodeAgent syncs verified GeoIP DB from Backend-controlled artifact metadata.
- App syncs compact/delta GeoIP package from Backend-controlled artifact metadata.
- NodeAgent preserves LKG and rolls back on bad DB.
- App preserves LKG and falls back from delta to full package on bad delta.
- Admin can inspect current DB versions and trigger rollback.
- CI smoke validates success and failure paths.
- Vendor credentials and signed URLs are never leaked to App/Admin/logs.
