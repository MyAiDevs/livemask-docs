# Admin Control Plane Operations Dashboard Contract

> Task: `TASK-DOC-ADMIN-DASHBOARD-REALTIME-001`
> Owner: Backend / Admin / Docs
> Status: Draft
> Scope: Defines the cross-repo contract for upgrading the mock dashboard to a real Control Plane Operations Dashboard covering 3D/traffic flows, Job Service, GeoIP, Content, Protocol Endpoint rollout, NodeAgent release, Client reconnect hint, billing/session/device, and incident modules.

## Related Mandatory Contracts

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Job Queue Usage Matrix](../jobs/JOB_QUEUE_USAGE_MATRIX.md)
- [Admin Job Center / Scheduler Contract](../jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [GeoIP Database Sync Contract](../geoip/GEOIP_DATABASE_SYNC_CONTRACT.md)
- [Content System Contract](../content/CONTENT_SYSTEM_CONTRACT.md)
- [Protocol & Endpoint Template Contract](../protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md)
- [Client Reconnect Hint Contract](../realtime/CLIENT_RECONNECT_HINT_CONTRACT.md)
- [NodeAgent Release Config Rollback Contract](../nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md)

---

## 1. Why This Exists

LiveMask's Admin console currently shows mock dashboard data. As the platform
grows into a real control plane, operators must see live, accurate, and
actionable status for every operational domain:

- Global traffic flow between countries/protocols
- Job Service health and running/failed jobs
- GeoIP active database version, signature, and update status
- Protocol Endpoint templates and rollout progress
- NodeAgent binary release and rollout state
- Client reconnect hint delivery health
- Content feed scheduling and lifecycle
- Node endpoint readiness across the fleet
- App error/Sentry summary
- Billing/session/device aggregates

Without a real-first dashboard contract, operators would rely on stale mock data
in production and miss critical incidents.

---

## 2. Dashboard Surfaces

### 2.1 Route Map

| Surface | Route | Purpose | RBAC Gate |
| --- | --- | --- | --- |
| Overview | `/admin` | Global health, business status, alert strip | `user:read` |
| Traffic / 3D Map | `/admin/traffic` | Real-time traffic flows, country heatmap | `user:read` |
| Jobs | `/admin/jobs` | Job Service health, running/failed/completed jobs | `jobs:read` |
| GeoIP | `/admin/geoip` | Active database, version, signature, update status | `geoip:read` |
| Protocol Endpoints | `/admin/protocol-endpoints` | Template list, rollout assignments, wave progress | `protocol_template:read` |
| NodeAgent Releases | `/admin/nodeagent/releases` | Release versions, rollout waves, per-node state | `node:read` |
| Content | `/admin/content` | Content lifecycle: scheduled, published, expired | `content:read` |
| Incidents | embedded strip in `/admin` + detail page | Active alerts, Sentry error placeholder | `user:read` |

### 2.2 Navigation

All dashboard surfaces are accessible from the Admin left sidebar under a
"Dashboard" or "Control Plane" section. Each surface displays module-level
status badges in the sidebar (green/yellow/red).

---

## 3. Real-First Data Rule

### 3.1 Mandatory Policy

All dashboard widgets must load data from live Backend APIs. Mock data is
**forbidden** in production.

### 3.2 Local / Dev Exception

Mock fallback is allowed only when ALL of the following conditions are met:

1. The request originates from `localhost`, `127.0.0.1`, or a known dev host.
2. The backend environment variable `LIVEMASK_ENV=development` or `LIVEMASK_ENV=local`.
3. The widget explicitly renders a **visible badge**:
   - `Mock` badge (amber) when no backend is reachable
   - `Stale` badge (yellow) when backend is reachable but data is older than the configured staleness threshold

### 3.3 Production Enforcement

- Production Admin must not silently fall back to mock data.
- If a backend dashboard API returns `5xx`, the widget must show an **error state**
  with a retry button, NOT mock data.
- If a backend dashboard API returns empty data, the widget must show an **empty
  state** with appropriate messaging, NOT fake/seed data.

### 3.4 Staleness Threshold

| Data Category | Stale Threshold | Badge Color |
| --- | --- | --- |
| Traffic flows | 5 minutes | Yellow |
| Job summary | 2 minutes | Yellow |
| GeoIP summary | 1 hour | Yellow |
| NodeAgent summary | 10 minutes | Yellow |
| Protocol endpoint summary | 5 minutes | Yellow |
| Content summary | 30 minutes | Yellow |
| Reconnect summary | 5 minutes | Yellow |
| Incidents | 1 minute | Red |

---

## 4. Backend API Contract

### 4.1 API Base

```
Base: /admin/api/v1/dashboard
Auth: Admin JWT + RBAC
Content-Type: application/json
```

### 4.2 Endpoints

#### GET /admin/api/v1/dashboard/overview

Global business health overview. Returns aggregated counts and status for the
top-level dashboard view.

```json
{
  "active_users": 123456,
  "total_sessions_24h": 789012,
  "successful_connections_24h": 765000,
  "failed_connections_24h": 1234,
  "failed_connection_rate_pct": 0.16,
  "healthy_node_count": 342,
  "degraded_node_count": 12,
  "offline_node_count": 3,
  "healthy_node_ratio_pct": 95.8,
  "payment_success_rate_pct": 98.5,
  "open_feedback_count": 23,
  "latest_client_config_version": "v1.2.3",
  "latest_nodeagent_config_version": "v0.4.2",
  "active_alert_count": 2,
  "total_bw_up_gb_24h": 4567.8,
  "total_bw_down_gb_24h": 23456.7,
  "window_start": "2026-05-17T00:00:00Z",
  "window_end": "2026-05-18T00:00:00Z",
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/control-plane

Control plane health summary. Aggregates per-module health.

```json
{
  "modules": {
    "job_service": {
      "status": "healthy|degraded|unreachable",
      "last_checked": "2026-05-18T10:00:00Z",
      "message": "optional redacted message"
    },
    "geoip": {
      "status": "healthy|degraded|unreachable",
      "active_database_version": "2026-05",
      "last_checked": "2026-05-18T10:00:00Z"
    },
    "nodeagent": {
      "status": "healthy|degraded|unreachable",
      "active_release": "v0.4.2",
      "last_checked": "2026-05-18T10:00:00Z"
    },
    "protocol_endpoint": {
      "status": "healthy|degraded|unreachable",
      "active_rollouts": 3,
      "last_checked": "2026-05-18T10:00:00Z"
    },
    "content": {
      "status": "healthy|degraded|unreachable",
      "scheduled_items": 5,
      "last_checked": "2026-05-18T10:00:00Z"
    },
    "reconnect": {
      "status": "healthy|degraded|unreachable",
      "pending_hints": 12,
      "last_checked": "2026-05-18T10:00:00Z"
    }
  },
  "overall_status": "healthy|degraded|critical",
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/traffic/flows

List of traffic flows for 3D/2D map rendering.

```json
{
  "flows": [
    {
      "country_from": "US",
      "country_to": "JP",
      "bytes_up": 123456789,
      "bytes_down": 987654321,
      "session_count": 4567,
      "success_count": 4540,
      "failure_count": 27,
      "protocol_profile": "hysteria2-udp-standard",
      "node_region": "us-west",
      "geoip_database_version": "2026-05",
      "window_start": "2026-05-17T00:00:00Z",
      "window_end": "2026-05-18T00:00:00Z"
    }
  ],
  "total_flows": 1,
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/traffic/countries

Country-level traffic statistics.

```json
{
  "countries": [
    {
      "country_code": "US",
      "country_name": "United States",
      "bytes_up": 1234567890,
      "bytes_down": 9876543210,
      "session_count": 45000,
      "active_node_count": 45,
      "window_start": "2026-05-17T00:00:00Z",
      "window_end": "2026-05-18T00:00:00Z"
    }
  ],
  "total_countries": 1,
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/traffic/bandwidth-trend

Traffic bandwidth trend for the selected aggregation window.

```json
{
  "points": [
    {
      "timestamp": "2026-05-18T09:00:00Z",
      "bytes_up": 123456789,
      "bytes_down": 987654321,
      "bandwidth_mbps": 128.5,
      "active_sessions": 4520
    }
  ],
  "window_start": "2026-05-17T10:00:00Z",
  "window_end": "2026-05-18T10:00:00Z",
  "interval": "1h",
  "peak_bandwidth_mbps": 164.2,
  "avg_bandwidth_mbps": 91.7,
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/traffic/top-users

Users with the highest aggregated traffic in the selected window.

```json
{
  "users": [
    {
      "user_id": "uuid",
      "display_name": "Northwind Ops",
      "email_masked": "no***@example.com",
      "plan_name": "Team Pro",
      "bytes_up": 123456789,
      "bytes_down": 987654321,
      "session_count": 456,
      "active_device_count": 4,
      "primary_country": "US",
      "percentage": 18.4,
      "last_active_at": "2026-05-18T09:58:00Z"
    }
  ],
  "total_users": 1,
  "generated_at": "2026-05-18T10:00:00Z"
}
```

Privacy rules:

- `email_masked` is required. Do not return raw email in this dashboard API.
- The API must not expose IP addresses, destination domains, URLs, node secrets,
  device identifiers, or browsing history.
- Full user identifiers beyond `user_id` require normal user detail APIs and
  their own RBAC/audit.

#### GET /admin/api/v1/dashboard/jobs/summary

Job Service execution summary.

```json
{
  "job_service_health": "healthy|degraded|unreachable",
  "job_service_last_contact": "2026-05-18T10:00:00Z",
  "queue_depth": 5,
  "running_jobs": [
    {
      "run_id": "uuid",
      "job_type": "geoip_source_update",
      "status": "running",
      "started_at": "2026-05-18T09:55:00Z",
      "progress_pct": 45
    }
  ],
  "recently_failed_jobs": [
    {
      "run_id": "uuid",
      "job_type": "content_schedule_publish",
      "status": "failed",
      "error": "redacted error message",
      "failed_at": "2026-05-18T09:50:00Z",
      "retry_count": 3
    }
  ],
  "completed_today": 42,
  "failed_today": 3,
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/geoip/summary

GeoIP database and rollout summary.

```json
{
  "geoip_health": "healthy|degraded|unreachable",
  "active_database": {
    "source": "dbip_lite",
    "edition": "country",
    "version": "2026-05",
    "sha256": "sha256:...",
    "status": "published|paused|revoked",
    "published_at": "2026-05-15T00:00:00Z",
    "expires_at": "2026-06-30T00:00:00Z",
    "attribution": "IP Geolocation by DB-IP"
  },
  "last_update_job": {
    "run_id": "uuid",
    "status": "succeeded|failed|running",
    "triggered_at": "2026-05-15T01:00:00Z",
    "completed_at": "2026-05-15T01:05:00Z"
  },
  "app_package_versions": {
    "region_catalog": "2026-05",
    "delta_available": true
  },
  "nodeagent_adoption_pct": 97.5,
  "rollout_status": "active|paused|completed",
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/nodeagent/summary

NodeAgent binary release and config status.

```json
{
  "nodeagent_health": "healthy|degraded|unreachable",
  "active_release": {
    "version": "v0.4.2",
    "release_id": "uuid",
    "status": "rollout_in_progress|rollout_complete|paused|rolled_back",
    "rollout_progress_pct": 85,
    "total_nodes": 350,
    "updated_nodes": 298,
    "failed_nodes": 2,
    "pending_nodes": 50
  },
  "recent_rollouts": [
    {
      "release_id": "uuid",
      "version": "v0.4.2",
      "started_at": "2026-05-16T00:00:00Z",
      "status": "rollout_in_progress"
    }
  ],
  "node_endpoint_health": {
    "ready": 330,
    "not_ready": 5,
    "degraded": 12,
    "unknown": 3
  },
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/protocol-endpoint/summary

Protocol endpoint template and rollout summary.

```json
{
  "protocol_endpoint_health": "healthy|degraded|unreachable",
  "total_templates": 15,
  "active_assignments": 3,
  "active_rollouts": [
    {
      "assignment_id": "uuid",
      "template_name": "hysteria2-udp-standard",
      "template_version": 2,
      "status": "active|paused|completed|rolled_back",
      "progress_pct": 60,
      "wave": 3,
      "total_waves": 5,
      "nodes_assigned": 150,
      "nodes_ready": 90,
      "nodes_failed": 2
    }
  ],
  "rollout_stats": {
    "total_rollouts_24h": 2,
    "completed": 1,
    "paused": 0,
    "failed": 0
  },
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/content/summary

Content feed and scheduling summary.

```json
{
  "content_health": "healthy|degraded|unreachable",
  "total_items": 120,
  "scheduled_items": 5,
  "published_items": 89,
  "expired_items": 26,
  "draft_items": 15,
  "upcoming_publishes": [
    {
      "id": "uuid",
      "title": "Maintenance Notice May 20",
      "content_type": "announcement",
      "scheduled_at": "2026-05-20T00:00:00Z"
    }
  ],
  "recently_expired": [
    {
      "id": "uuid",
      "title": "Spring Campaign",
      "content_type": "campaign",
      "expired_at": "2026-05-17T23:59:59Z"
    }
  ],
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/reconnect/summary

Client reconnect hint delivery health.

```json
{
  "reconnect_health": "healthy|degraded|unreachable",
  "hints_issued_24h": 150,
  "hints_acknowledged": 140,
  "hints_completed": 135,
  "hints_failed": 5,
  "hints_pending": 10,
  "ack_rate_pct": 93.3,
  "success_rate_pct": 90.0,
  "avg_reconnect_duration_ms": 3200,
  "reasons_breakdown": {
    "protocol_rollout": 80,
    "endpoint_change": 40,
    "config_update": 20,
    "operator_maintenance": 10
  },
  "generated_at": "2026-05-18T10:00:00Z"
}
```

#### GET /admin/api/v1/dashboard/incidents

Active alerts and Sentry error summary.

```json
{
  "active_incidents": [
    {
      "incident_id": "uuid",
      "severity": "critical|warning|info",
      "title": "NodeAgent rollout stalled in region us-west",
      "module": "nodeagent",
      "started_at": "2026-05-18T09:00:00Z",
      "status": "active|acknowledged|resolved"
    }
  ],
  "sentry_summary": {
    "placeholder": true,
    "errors_24h": 0,
    "error_rate_pct": 0.0,
    "top_errors": []
  },
  "generated_at": "2026-05-18T10:00:00Z"
}
```

---

## 5. 3D / Traffic Map Contract

### 5.1 Data Source

Traffic flows must come from **Backend aggregated data only**. The data is
returned by:

- `GET /admin/api/v1/dashboard/traffic/flows` — per-flow link data for map arcs
- `GET /admin/api/v1/dashboard/traffic/countries` — per-country aggregate data for map pins
- `GET /admin/api/v1/dashboard/traffic/bandwidth-trend` — bandwidth and active session trend
- `GET /admin/api/v1/dashboard/traffic/top-users` — high-traffic users with masked identifiers

### 5.2 Traffic Flow Fields

| Field | Type | Description |
| --- | --- | --- |
| `country_from` | string | ISO 3166-1 alpha-2 source country code |
| `country_to` | string | ISO 3166-1 alpha-2 destination country code |
| `bytes_up` | bigint | Upload bytes in window |
| `bytes_down` | bigint | Download bytes in window |
| `session_count` | integer | Total session count in window |
| `success_count` | integer | Successful session count |
| `failure_count` | integer | Failed session count |
| `protocol_profile` | string | Protocol profile name (e.g. `hysteria2-udp-standard`) |
| `node_region` | string | Node region code (e.g. `us-west`) |
| `geoip_database_version` | string | GeoIP database version used for IP-to-country mapping |
| `window_start` | timestamptz | Aggregation window start |
| `window_end` | timestamptz | Aggregation window end |

### 5.2.1 Bandwidth Trend Fields

| Field | Type | Description |
| --- | --- | --- |
| `timestamp` | timestamptz | Bucket timestamp |
| `bytes_up` | bigint | Upload bytes in bucket |
| `bytes_down` | bigint | Download bytes in bucket |
| `bandwidth_mbps` | float | Average bandwidth in Mbps for the bucket |
| `active_sessions` | integer | Active sessions in bucket |

### 5.2.2 Top User Fields

| Field | Type | Description |
| --- | --- | --- |
| `user_id` | string | User ID for Admin drilldown |
| `display_name` | string | Safe display name |
| `email_masked` | string | Masked email only |
| `plan_name` | string | Subscription/plan label |
| `bytes_up` | bigint | Upload bytes in window |
| `bytes_down` | bigint | Download bytes in window |
| `session_count` | integer | Session count in window |
| `active_device_count` | integer | Active devices in window |
| `primary_country` | string | Primary country code |
| `percentage` | float | Share of total traffic in the current window |
| `last_active_at` | timestamptz | Last active time |

### 5.3 Rendering Contract

| Stage | Visualization | Notes |
| --- | --- | --- |
| MVP | SVG or 2D canvas map with country pins and flow arcs | Must use real API data. No fake arcs. |
| Post-MVP | 3D globe (Three.js or similar) | Data layer contract unchanged. Only rendering changes. |

`/admin/traffic` must also render:

- global traffic map / flow layer
- bandwidth trend chart
- country/region traffic ranking with percentage share
- high-traffic user list with masked identifiers
- upload/download split and active session summary

### 5.4 Required Widget States

| State | Visual | Behavior |
| --- | --- | --- |
| Loading | Skeleton country pins | Show placeholder globe/map silhouette |
| Data | Rendered arcs/pins | Real API flow data rendered |
| Empty | Empty map with "No traffic data in this time window" | No fake arcs or seed data |
| Error | Error banner + retry button | Backend API error, 5xx |
| Stale | Stale badge (yellow) + continue showing last data | Data older than staleness threshold |
| Mock (dev only) | Mock badge (amber) + fake visualization | Only in local/dev env |

---

## 6. Module Widget Specifications

### 6.1 Job Service Widget

**Source**: `GET /admin/api/v1/dashboard/jobs/summary`

| Display Element | Field |
| --- | --- |
| Health badge | `job_service_health` |
| Queue depth | `queue_depth` |
| Currently running | `running_jobs[]` with type, status, progress |
| Recently failed | `recently_failed_jobs[]` with error, retry count |
| Completed today | `completed_today` |
| Failed today | `failed_today` |

**Action**: "View All Jobs" links to `/admin/jobs`.

### 6.2 GeoIP Widget

**Source**: `GET /admin/api/v1/dashboard/geoip/summary`

| Display Element | Field |
| --- | --- |
| Health badge | `geoip_health` |
| Active database version | `active_database.version` |
| Source | `active_database.source` |
| Status | `active_database.status` |
| Expiration | `active_database.expires_at` with countdown |
| Last update job | `last_update_job.status` |
| NodeAgent adoption | `nodeagent_adoption_pct` |
| Rollout status | `rollout_status` |

**Action**: "Manage GeoIP" links to `/admin/geoip`.

### 6.3 NodeEndpoint Readiness Widget

**Source**: `GET /admin/api/v1/dashboard/nodeagent/summary`

| Display Element | Field |
| --- | --- |
| Ready count | `node_endpoint_health.ready` |
| Not ready count | `node_endpoint_health.not_ready` |
| Degraded count | `node_endpoint_health.degraded` |
| Unknown count | `node_endpoint_health.unknown` |

Display as a donut or bar chart with color coding:
- Ready: green
- Not ready: red
- Degraded: amber
- Unknown: gray

### 6.4 NodeAgent Release Widget

**Source**: `GET /admin/api/v1/dashboard/nodeagent/summary`

| Display Element | Field |
| --- | --- |
| Health badge | `nodeagent_health` |
| Active release version | `active_release.version` |
| Rollout progress bar | `active_release.rollout_progress_pct` |
| Updated / total nodes | `active_release.updated_nodes` / `active_release.total_nodes` |
| Failed nodes | `active_release.failed_nodes` |

**Action**: "Manage Releases" links to `/admin/nodeagent/releases`.

### 6.5 Protocol Endpoint Rollout Widget

**Source**: `GET /admin/api/v1/dashboard/protocol-endpoint/summary`

| Display Element | Field |
| --- | --- |
| Health badge | `protocol_endpoint_health` |
| Active assignments count | `active_assignments` |
| Active rollout list | Each with template_name, status, progress_pct, wave info |

**Action**: "Manage Templates" links to `/admin/protocol-endpoints`.

### 6.6 Client Reconnect Hint Widget

**Source**: `GET /admin/api/v1/dashboard/reconnect/summary`

| Display Element | Field |
| --- | --- |
| Health badge | `reconnect_health` |
| Hints issued 24h | `hints_issued_24h` |
| Ack rate | `ack_rate_pct` |
| Success rate | `success_rate_pct` |
| Pending hints | `hints_pending` |
| Reasons breakdown | `reasons_breakdown` as bar chart |

### 6.7 Content Feed Widget

**Source**: `GET /admin/api/v1/dashboard/content/summary`

| Display Element | Field |
| --- | --- |
| Health badge | `content_health` |
| Scheduled items | `scheduled_items` |
| Published items | `published_items` |
| Expired items | `expired_items` |
| Upcoming publishes | `upcoming_publishes[]` |

**Action**: "Manage Content" links to `/admin/content`.

### 6.8 App Error / Sentry Summary

**Source**: `GET /admin/api/v1/dashboard/incidents`

| Display Element | Field |
| --- | --- |
| Error count 24h | `sentry_summary.errors_24h` |
| Error rate | `sentry_summary.error_rate_pct` |
| Top errors | `sentry_summary.top_errors[]` |
| Placeholder flag | `sentry_summary.placeholder` |

### 6.9 Billing / Session / Device Summary

These sections are displayed on the `/admin` overview and sourced from
`GET /admin/api/v1/dashboard/overview`:

| Display Element | Field |
| --- | --- |
| Active users | `active_users` |
| Total sessions 24h | `total_sessions_24h` |
| Successful connections 24h | `successful_connections_24h` |
| Failed connections 24h | `failed_connections_24h` |
| Failed connection rate | `failed_connection_rate_pct` |
| Payment success rate | `payment_success_rate_pct` |

---

## 7. RBAC

### 7.1 Permission Gates

Each dashboard module is gated by the following permissions. If the Admin user
lacks the required permission, the section must be hidden entirely, not shown
as disabled or empty.

| Permission | Gated Sections |
| --- | --- |
| `jobs:read` | Job Service widget, `/admin/jobs` surface |
| `geoip:read` | GeoIP widget, `/admin/geoip` surface |
| `node:read` | NodeAgent Release widget, NodeEndpoint readiness widget, `/admin/nodeagent/releases` surface |
| `protocol_template:read` | Protocol Endpoint Rollout widget, `/admin/protocol-endpoints` surface |
| `content:read` | Content Feed widget, `/admin/content` surface |
| `payment:read` | Payment success rate in overview |
| `user:read` | Active users, sessions, connections in overview |

### 7.2 Fallback Behavior

If Backend returns `403 Forbidden` for a specific dashboard API, the widget
must show a permission-denied state (e.g. "Access restricted. Contact your
admin.") rather than a generic error or mock fallback.

---

## 8. Widget Component States

Every widget on every dashboard surface must support the following states:

| State | Visual | Trigger |
| --- | --- | --- |
| Loading | Skeleton placeholder | API request in flight |
| Data | Rendered widget content | API returns 200 with data |
| Empty | "No data" message with icon | API returns 200 with empty array/null |
| Error | Error banner + retry button | API returns 5xx or network error |
| Forbidden | Permission-denied message | API returns 403 |
| Stale | Yellow stale badge + last known data | Data is older than staleness threshold |
| Mock (dev only) | Amber mock badge + rendered mock data | Only in local/dev env |

---

## 9. Cache and Polling

### 9.1 Dashboard Polling Strategy

| Widget | Poll Interval | Notes |
| --- | --- | --- |
| Overview | 30 seconds | Auto-refresh |
| Traffic flows | 60 seconds | Auto-refresh |
| Traffic countries | 60 seconds | Auto-refresh |
| Job summary | 15 seconds | Auto-refresh |
| GeoIP summary | 5 minutes | Auto-refresh |
| NodeAgent summary | 30 seconds | Auto-refresh |
| Protocol endpoint summary | 30 seconds | Auto-refresh |
| Content summary | 5 minutes | Auto-refresh |
| Reconnect summary | 30 seconds | Auto-refresh |
| Incidents | 30 seconds | Auto-refresh |

### 9.2 Manual Refresh

Every widget must have a manual refresh button. The overview page should have
a "Refresh All" button.

---

## 10. Error Handling

### 10.1 Backend Error Response Shape

All dashboard APIs must return errors in the standard Admin API format:

```json
{
  "error": {
    "code": "DASHBOARD_UNAVAILABLE",
    "message": "Dashboard data temporarily unavailable.",
    "details": {}
  }
}
```

### 10.2 Frontend Error Handling

- Network errors: show error state with retry button, exponential backoff for
  auto-retry (max 3 retries, then stop auto-refresh).
- 401/403: redirect to login or show permission-denied state.
- 5xx: show error state, preserve manual refresh capability.
- Partial failure: if one widget fails but others succeed, show error state
  only on the failed widget. Do not collapse the entire page.

---

## 11. Security Rules

| Rule | Enforcement |
| --- | --- |
| No mock data in production | Backend must return 403 or error if mock data is requested in production env |
| Traffic flow data does not expose PII | `country_from`/`country_to` are country-level only, never individual user IP |
| Dashboard APIs respect RBAC | Backend must check permissions per endpoint |
| Incident details are operator-safe | `message` fields must be redacted; no secrets, tokens, or internal paths |
| Widget error messages are safe | Error messages must not leak backend internals |

---

## 12. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-DASHBOARD-001` | `livemask-backend` | Implement all GET /admin/api/v1/dashboard/* endpoints with aggregated data |
| `TASK-BACKEND-DASHBOARD-AGG-001` | `livemask-backend` | Implement daily traffic aggregation jobs (idempotent per date/metric) |
| `TASK-BACKEND-DASHBOARD-CACHE-001` | `livemask-backend` | Dashboard read-through cache strategy, staleness TTL, regenerate triggers |
| `TASK-ADMIN-DASHBOARD-001` | `livemask-admin` | Implement dashboard surfaces: overview, traffic map, per-module widgets, polling, error states |
| `TASK-ADMIN-TRAFFIC-MAP-001` | `livemask-admin` | Implement SVG/2D traffic map with real API data (MVP), 3D globe post-MVP |
| `TASK-CICD-DASHBOARD-001` | `livemask-ci-cd` | Dashboard smoke: mock-badge enforcement, error states, RBAC, empty/loading states |

---

## 13. Done Criteria

- All 11 dashboard backend APIs are implemented and return real aggregated data.
- All widget states (loading, data, empty, error, forbidden, stale, mock) are implemented.
- Mock data is never shown in production.
- SVG/2D traffic map renders real API flow data.
- RBAC is enforced per module: `jobs:read`, `geoip:read`, `node:read`, `protocol_template:read`, `content:read`, `payment:read`, `user:read`.
- Widgets auto-poll at configured intervals.
- Manual refresh is available on every widget.
- CI/CD smoke validates real-data enforcement, error states, and RBAC.

---

## 14. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-05-18 | Initial version | TASK-DOC-ADMIN-DASHBOARD-REALTIME-001 |
