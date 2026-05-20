# NodeAgent Speedtest & Bandwidth Capacity Contract

> Status: Ready
> Owner: NodeAgent / Backend / Job Service / Admin / CI-CD

## 1. Purpose

LiveMask nodes need self-measured network capacity so Backend can make safer
placement decisions and NodeAgent can self-limit traffic before the host is
overloaded. NodeAgent will run controlled speed tests, report safe aggregate
results to Backend, and adjust its own maximum carried bandwidth so the node
never intentionally exceeds 90% of measured safe capacity.

The first implementation may use
[`github.com/showwin/speedtest-go`](https://github.com/showwin/speedtest-go)
inside NodeAgent for speedtest discovery and measurement.

## 2. Principles

1. NodeAgent performs the measurement locally.
2. Backend owns policy, storage, scheduling intent, and Admin APIs.
3. Job Service triggers scheduled/manual measurement through Backend executor
   APIs; it must not connect directly to NodeAgent.
4. NodeAgent must not run continuous speedtests. Measurements are bounded,
   rate-limited, and cancellable.
5. Maximum carried bandwidth cap must be `<= 90%` of measured safe capacity.
6. Backend and Admin must display measured capacity and current enforced cap as
   operational data, not as billing or guaranteed performance.
7. Speedtest results must not include packet payloads, browsing data, domains,
   or user traffic details.

## 3. Data Model

### 3.1 Node Speedtest Report

```json
{
  "report_id": "uuid",
  "node_id": "node_uuid",
  "trigger_type": "scheduled|manual|startup|retest_after_degrade",
  "provider": "showwin_speedtest_go",
  "server_id": "optional_provider_server_id",
  "server_name": "optional_provider_server_name",
  "server_country": "SG",
  "latency_ms": 18.4,
  "jitter_ms": 2.1,
  "download_mbps": 820.5,
  "upload_mbps": 510.2,
  "packet_loss_percent": 0.1,
  "measured_at": "2026-05-20T12:00:00Z",
  "duration_ms": 42000,
  "result": "succeeded|failed|cancelled|blocked",
  "error_code": null,
  "error_message": null,
  "redacted": true
}
```

### 3.2 Node Bandwidth Capacity

```json
{
  "node_id": "node_uuid",
  "last_report_id": "uuid",
  "measured_download_mbps": 820.5,
  "measured_upload_mbps": 510.2,
  "safe_capacity_mbps": 510.2,
  "max_load_ratio": 0.9,
  "enforced_max_bandwidth_mbps": 459.18,
  "current_observed_bandwidth_mbps": 120.5,
  "current_load_ratio": 0.262,
  "state": "healthy|degraded|overloaded|unknown",
  "updated_at": "2026-05-20T12:01:00Z"
}
```

Rule:

```text
safe_capacity_mbps = min(measured_download_mbps, measured_upload_mbps)
enforced_max_bandwidth_mbps = floor_or_decimal(safe_capacity_mbps * max_load_ratio)
max_load_ratio <= 0.90
```

If download/upload are both unavailable or invalid, NodeAgent must keep the
previous LKG capacity cap. If no LKG exists, NodeAgent must fall back to a
conservative default configured by Backend.

## 4. APIs

### 4.1 NodeAgent -> Backend

```http
POST /internal/agent/speedtest-reports
Auth: Node HMAC
```

Payload:

```json
{
  "report": {
    "report_id": "uuid",
    "trigger_type": "scheduled",
    "provider": "showwin_speedtest_go",
    "latency_ms": 18.4,
    "download_mbps": 820.5,
    "upload_mbps": 510.2,
    "measured_at": "2026-05-20T12:00:00Z",
    "duration_ms": 42000,
    "result": "succeeded"
  },
  "capacity": {
    "safe_capacity_mbps": 510.2,
    "max_load_ratio": 0.9,
    "enforced_max_bandwidth_mbps": 459.18
  }
}
```

### 4.2 Backend -> NodeAgent Runtime Config

NodeAgent config should include:

```json
{
  "speedtest": {
    "enabled": true,
    "provider": "showwin_speedtest_go",
    "schedule_enabled": true,
    "min_interval_minutes": 360,
    "timeout_seconds": 90,
    "max_parallel_tests": 1,
    "server_selection": "auto",
    "max_load_ratio": 0.9,
    "fallback_capacity_mbps": 50,
    "allow_manual_run": true
  }
}
```

### 4.3 Admin APIs

```http
GET /admin/api/v1/nodes/{node_id}/speedtest-reports
GET /admin/api/v1/nodes/{node_id}/bandwidth-capacity
POST /admin/api/v1/nodes/{node_id}/speedtest/run
```

### 4.4 Backend Internal Job Executor API

```http
POST /internal/job-executors/nodeagent-speedtest/run
```

Parameters:

```json
{
  "node_id": "optional_node_uuid",
  "target_filter": ["region:sg", "status:active"],
  "force": false,
  "dry_run": false
}
```

## 5. Job Types

| Job Type | Owner | Trigger | Purpose |
| --- | --- | --- | --- |
| `nodeagent_speedtest_run` | nodeagent | manual/scheduled | Ask Backend to trigger bounded speedtests for selected nodes. |
| `nodeagent_bandwidth_capacity_aggregate` | nodeagent | scheduled | Aggregate latest reports into capacity state and overload summaries. |

## 6. Safety Rules

- Default `max_load_ratio` must be `0.90` or lower.
- Admin must not allow `max_load_ratio > 0.90`.
- NodeAgent must clamp any received `max_load_ratio` to `<= 0.90`.
- NodeAgent must not run speedtest while already overloaded unless forced by
  Backend policy.
- Speedtest must be serialized per node.
- Failed speedtests must not erase LKG capacity.
- Reports must redact provider internals and raw errors before upload.
- Logs, Sentry, Lark, and CI output must not contain node secrets, HMAC keys,
  full provider URLs with query params, or packet payloads.

## 7. Admin UI Requirements

Admin Node Detail should display:

- latest download/upload Mbps;
- safe capacity Mbps;
- enforced max bandwidth Mbps;
- current observed bandwidth and load ratio;
- state badge: healthy/degraded/overloaded/unknown;
- last measurement time and trigger type;
- manual retest action gated by permission.

Admin settings may later expose policy defaults:

- enabled/disabled;
- min interval;
- timeout;
- fallback capacity;
- max load ratio, capped at 90%.

## 8. CI/CD Smoke

Smoke must verify:

1. NodeAgent speedtest status endpoint exists.
2. Backend accepts a redacted speedtest report.
3. Backend rejects unauthenticated report upload.
4. Backend calculates enforced bandwidth at `<= 90%`.
5. Job Service exposes `nodeagent_speedtest_run`.
6. Admin bandwidth capacity endpoint returns latest capacity.
7. Secret leak scan passes.

## 9. Non-Goals

- No user traffic payload inspection.
- No raw destination/domain history.
- No billing-grade bandwidth guarantee.
- No continuous stress testing.
- No bypass around Backend policy or Job Service scheduling.
