# Log, Audit, Metric, And Node Observability Pipeline Contract

> Task: `TASK-DOC-OBSERVABILITY-LOGS-METRICS-001`
> Owner: Backend / NodeAgent / Job Service / Admin / CI-CD / Monitoring
> Status: Ready
> Scope: Defines the cross-repo contract for Backend audit/system/payment/job
> logs, NodeAgent log upload, App Sentry exception summaries, notification
> delivery logs, Job Service queued ingestion, PostgreSQL storage,
> Prometheus-compatible metrics, and Admin log/audit/node/app/payment views.

## 1. Why This Exists

LiveMask now has enough operational surfaces that plain application logs are no
longer enough. Operators need to answer:

- Who logged in and from where?
- Which Admin changed a config, template, release, credential, or job?
- Which job ran, retried, failed, or was cancelled?
- Which NodeAgent reported endpoint failures or protocol apply errors?
- Which payment webhook changed a subscription?
- Which payment order changed state, retried, reconciled, refunded, or failed?
- Which Sentry issue captured an App crash, reconnect failure, purchase
  failure, or content fetch error?
- Which Telegram/WhatsApp/Lark/email/push notification was sent, retried,
  throttled, or dead-lettered?
- Which system component is degraded?
- What are the latest logs for one node on the Node List page?
- Are NodeAgent metrics scrapeable in Prometheus format?

This contract turns logs and metrics into first-class product infrastructure.

## 2. Core Principles

1. **Audit logs and technical logs are separate.**
   Audit logs answer who did what. Technical logs answer what the system did.

2. **NodeAgent does not call Job Service directly.**
   NodeAgent uploads logs/events to Backend using Node HMAC. Backend validates
   identity and forwards scrubbed batches to Job Service queue for persistence.

3. **Job Service owns queued ingestion.**
   Heavy log batches, retries, backoff, dead-letter, and async writes are Job
   Service work. Backend must not synchronously bulk-insert large node logs in
   the request path.

4. **Prometheus metrics are pull-safe and low-cardinality.**
   Metrics endpoints must not expose secrets or high-cardinality labels such as
   user email, raw IP, session token, full endpoint, or full URL.

5. **Admin reads through Backend only.**
   Admin never calls Job Service, NodeAgent, or Prometheus directly from the
   browser. Backend enforces RBAC, filtering, redaction, and pagination.

## 3. Log Families

| Family | Producer | Primary Consumer | Storage | Purpose |
| --- | --- | --- | --- | --- |
| `auth_login` | Backend | Admin / Security | PostgreSQL | Login success/failure, session restoration, suspicious activity |
| `admin_operation` | Backend | Admin / Audit | PostgreSQL | Admin create/update/delete/run/publish/rollback actions |
| `job_run` | Job Service | Backend / Admin | PostgreSQL | Job lifecycle, retry, cancel, schedule, executor events |
| `system` | Backend / Job Service | Admin / SRE | PostgreSQL + stdout | Component startup, degraded state, dependency failures |
| `node` | NodeAgent | Backend / Admin | PostgreSQL via Job Service queue | Node runtime logs, protocol apply, endpoint health, GeoIP/release/config events |
| `app` | App / Sentry webhook or sync | Backend / Admin / Support | Sentry primary + PostgreSQL summary | Client lifecycle, connect, content, GeoIP, billing entry, local cache, user-visible degraded states |
| `exception` | Sentry / Backend / NodeAgent / Job Service | Admin / SRE | Sentry primary for App + PostgreSQL summary | Crash, panic, unhandled error, native tunnel failure, provider callback failure |
| `payment` | Backend | Admin / Finance | PostgreSQL | Payment webhook, subscription state, reconciliation |
| `payment_order` | Backend | Admin / Finance / Support | PostgreSQL | Order creation, status transition, provider response, retry, refund, chargeback, manual correction |
| `notification` | Backend / Job Service | Admin / Ops / Support | PostgreSQL | Telegram/WhatsApp/Lark/email/push invite, dispatch, delivery, retry, provider callback |
| `security` | Backend / NodeAgent | Admin / Security | PostgreSQL | Secret redaction violations, auth failures, suspicious node/app events |
| `connect` | Backend / App | Admin / SRE | PostgreSQL | Session lifecycle, reconnect hints, connect failures |
| `content` | Backend | Admin / Ops | PostgreSQL | Content publish/archive/display feed transitions |

Family rules:

- `audit_logs` remains immutable and actor-focused. Do not mix it with
  high-volume technical logs.
- `observability_logs` is the unified technical/event log table for system,
  node, app, exception, payment, notification, connect, content and job
  technical events.
- App raw crash/exception data must remain in Sentry. LiveMask stores only
  redacted Sentry issue summaries, issue IDs, fingerprints, release/platform
  dimensions, and user/session correlation IDs when allowed.
- Payment order history must remain queryable from payment/order domain tables
  and mirrored as redacted observability logs for SRE/Admin search.
- Notification delivery logs are part of the user contact/notification contract,
  but must also be visible through global log search using family
  `notification`.

## 4. Canonical Log Entry

```json
{
  "log_id": "uuid",
  "family": "node",
  "level": "warn",
  "source": "nodeagent",
  "component": "singbox",
  "event_type": "endpoint_not_ready",
  "message": "Endpoint probe failed",
  "metadata": {
    "node_id": "uuid",
    "job_run_id": "uuid",
    "assignment_id": "uuid",
    "protocol_profile": "hysteria2",
    "transport": "udp"
  },
  "trace_id": "trace-id",
  "request_id": "request-id",
  "actor_user_id": "",
  "node_id": "uuid",
  "job_run_id": "uuid",
  "session_id": "",
  "created_at": "2026-05-18T12:00:00Z"
}
```

Rules:

- `message` is human-readable but must be short.
- `metadata` is structured and redacted before storage.
- `level`: `debug`, `info`, `warn`, `error`, `critical`.
- `family` must be one of the registered families.
- Unknown metadata fields are allowed but must be redacted.
- No raw config, no full signed URL, no credential, no token.

## 5. Database Schema

Backend should own read-facing tables. Job Service may write into them through
Backend-controlled migrations or a shared schema contract.

Suggested tables:

### 5.1 `observability_logs`

| Column | Type | Notes |
| --- | --- | --- |
| `log_id` | UUID PK | Generated by Backend or Job Service |
| `family` | VARCHAR(32) | See registered families |
| `level` | VARCHAR(16) | debug/info/warn/error/critical |
| `source` | VARCHAR(32) | backend/nodeagent/job_service/app |
| `component` | VARCHAR(64) | auth, geoip, singbox, jobs, billing |
| `event_type` | VARCHAR(80) | Stable event type |
| `message` | TEXT | Redacted |
| `metadata` | JSONB | Redacted |
| `trace_id` | VARCHAR(128) | Optional |
| `request_id` | VARCHAR(128) | Optional |
| `actor_user_id` | UUID NULL | Admin/user action actor |
| `node_id` | UUID NULL | Node filter |
| `job_run_id` | UUID NULL | Job correlation |
| `session_id` | UUID NULL | App/connect correlation |
| `created_at` | TIMESTAMPTZ | Indexed desc |

Indexes:

- `(family, created_at DESC)`
- `(node_id, created_at DESC)`
- `(job_run_id, created_at DESC)`
- `(actor_user_id, created_at DESC)`
- `(session_id, created_at DESC)`
- `(level, created_at DESC)`
- GIN on `metadata` if needed

### 5.1.1 Recommended Domain-Specific Read Models

These are not replacements for `observability_logs`; they are domain read
models for pages that need richer filtering or immutable business history.

| Table | Owner | Purpose |
| --- | --- | --- |
| `app_exception_reports` | Backend / Sentry sync | Redacted Sentry issue summary mirror, grouped by `sentry_issue_id`/`fingerprint`, platform, app version, locale |
| `payment_order_logs` | Backend Billing | Payment order lifecycle, provider status, reconciliation result, refund/chargeback/manual correction |
| `notification_delivery_logs` | Backend Notification | Invite/dispatch/delivery result for Telegram, WhatsApp, Lark, email and push |
| `system_component_events` | Backend / Job Service | Startup, dependency degraded/restored, config load/reload, queue lag and scheduler state |

Each domain table must include `observability_log_id` or `trace_id` when a
matching global log was emitted, so Admin can jump between domain detail and
global log search.

### 5.2 `audit_logs`

Audit logs remain separate and immutable.

Minimum fields:

- `audit_id`
- `actor_user_id`
- `actor_role`
- `action`
- `resource_type`
- `resource_id`
- `request_id`
- `ip_hash`
- `user_agent_hash`
- `metadata` redacted
- `created_at`

Audit log actions must include:

- `auth.login.success`
- `auth.login.failed`
- `admin.job.run`
- `admin.job.cancel`
- `admin.job.retry`
- `admin.geoip.credential.update`
- `admin.protocol_template.publish`
- `admin.protocol_template.rollout`
- `admin.nodeagent.release.publish`
- `admin.nodeagent.release.rollback`
- `payment.webhook.received`
- `payment.reconciliation.completed`
- `payment.order.created`
- `payment.order.status_changed`
- `payment.order.refund_requested`
- `notification.provider.updated`
- `notification.invite.created`
- `notification.dispatch.run`
- `notification.delivery.failed`

Audit payload rules:

- Store actor/resource/action, not raw request bodies.
- IP and user agent should be hashed for read-facing logs unless a compliance
  task explicitly requires reveal.
- Payment provider payloads must be summarized and redacted, never stored in
  audit metadata as raw webhook body.

## 6. NodeAgent Log Upload Flow

```text
NodeAgent local log/event buffer
  -> POST /internal/agent/logs (Node HMAC)
     -> Backend validates node_id from auth context
     -> Backend redacts + accepts small batch quickly
     -> Backend creates Job Service run or internal enqueue call
     -> Job Service writes logs to observability_logs asynchronously
     -> Admin queries logs through Backend
```

NodeAgent must not call Job Service directly.

### 6.1 NodeAgent Upload API

`POST /internal/agent/logs`

Auth: Node HMAC headers.

Request:

```json
{
  "batch_id": "uuid",
  "agent_version": "dev",
  "logs": [
    {
      "level": "warn",
      "component": "singbox",
      "event_type": "endpoint_not_ready",
      "message": "Endpoint probe failed",
      "metadata": {
        "job_run_id": "uuid",
        "protocol_profile": "hysteria2"
      },
      "created_at": "2026-05-18T12:00:00Z"
    }
  ]
}
```

Response:

```json
{ "ok": true, "accepted": 1, "batch_id": "uuid" }
```

Rules:

- `node_id` comes from HMAC context, not request body.
- Batch size limit: 100 log entries MVP.
- Message size limit: 2 KB.
- Metadata size limit: 8 KB after redaction.
- Backend may return `429` with retry-after.
- NodeAgent must queue locally and retry with backoff.

## 7. Job Service Log Ingestion

Job Service should support a registered job type:

- `observability_log_ingest`

Parameters:

```json
{
  "batch_id": "uuid",
  "source": "nodeagent",
  "node_id": "uuid",
  "log_count": 100
}
```

MVP implementation options:

1. Backend writes accepted batch to a staging table and Job Service drains it.
2. Backend calls Job Service internal enqueue API with a scrubbed payload
   reference.
3. Job Service writes directly to `observability_logs` only if schema ownership
   is documented and migrations are idempotent.

Required mechanics:

- Retry/backoff for transient DB errors.
- Dead-letter failed batches.
- Idempotency by `batch_id`.
- Redacted technical events for ingestion failure.
- No secret values in job events.

## 8. Backend Log APIs

### 8.1 Admin Log Search

`GET /admin/api/v1/logs`

Query:

- `family`
- `level`
- `source`
- `component`
- `event_type`
- `node_id`
- `job_run_id`
- `actor_user_id`
- `session_id`
- `q`
- `from`
- `to`
- `page`
- `limit`

Permission:

- `logs:read`

### 8.2 Node Latest Logs

`GET /admin/api/v1/nodes/{node_id}/logs`

Query:

- `level`
- `component`
- `limit`
- `since`

Permission:

- `node:read` and `logs:read`

This is the API used by Admin Node List and Node Detail pages.

### 8.3 Audit Logs

`GET /admin/api/v1/audit-logs`

Query:

- `actor_user_id`
- `action`
- `resource_type`
- `resource_id`
- `from`
- `to`
- `page`
- `limit`

Permission:

- `audit:read`

### 8.4 Log Ingestion Health

`GET /admin/api/v1/logs/ingestion/health`

Returns:

- staging backlog count
- failed/dead-letter batches
- latest ingest job status
- oldest unprocessed batch age

Permission:

- `logs:read`

### 8.5 App Sentry Issue Summary

App exceptions use Sentry as the primary store. Backend exposes only redacted
issue summaries to Admin.

`GET /admin/api/v1/app/exceptions`

Query:

- `platform`
- `release`
- `environment`
- `level`
- `fingerprint`
- `sentry_issue_id`
- `user_id`
- `session_id`
- `from`
- `to`
- `page`
- `limit`

Permission:

- `logs:read`

Response items must include only:

- `sentry_issue_id`
- `fingerprint`
- `title`
- `level`
- `platform`
- `release`
- `environment`
- `event_count`
- `affected_user_count`
- `first_seen_at`
- `last_seen_at`
- `status`
- `safe_context`

Forbidden fields:

- raw stack frames with local paths when they expose secrets
- request headers
- cookies
- authorization values
- device identifiers that are not hashed
- full URL with query string
- raw App local storage/cache data

### 8.6 Payment Order Logs

`GET /admin/api/v1/payments/orders/{order_id}/logs`

Permission:

- `payment:read` and `logs:read`

Required event types:

- `payment.order.created`
- `payment.order.provider_request`
- `payment.order.provider_response`
- `payment.order.status_changed`
- `payment.order.webhook_received`
- `payment.order.webhook_duplicate`
- `payment.order.webhook_signature_failed`
- `payment.order.reconciliation_started`
- `payment.order.reconciliation_completed`
- `payment.order.refund_requested`
- `payment.order.refund_completed`
- `payment.order.manual_adjustment`

Provider payloads must be summarized. Store provider event ID, status, amount,
currency, order ID, idempotency key and redacted error message; never store raw
webhook body in Admin-facing logs.

### 8.7 Notification Delivery Logs

`GET /admin/api/v1/notifications/delivery-logs`

Query:

- `provider`
- `channel`
- `template_key`
- `user_id`
- `contact_id`
- `status`
- `job_run_id`
- `from`
- `to`
- `page`
- `limit`

Permission:

- `notifications:read` or `logs:read`

Required event types:

- `notification.provider.verify_started`
- `notification.provider.verify_failed`
- `notification.invite.created`
- `notification.invite.sent`
- `notification.invite.callback_verified`
- `notification.dispatch.queued`
- `notification.dispatch.sent`
- `notification.dispatch.throttled`
- `notification.dispatch.failed`
- `notification.dispatch.dead_lettered`

Contact identifiers must be masked unless the caller has
`user:contact:read_sensitive`, and even then reveal actions must be audited.

### 8.8 System Component Logs

`GET /admin/api/v1/system/logs`

Permission:

- `logs:read`

This is a filtered view over `observability_logs?family=system`. Admin may use
it for a dedicated System Logs tab, but global logs remain the canonical route.

## 9. Backend Log Families To Implement

Backend must produce structured logs for:

| Family | Required Events |
| --- | --- |
| Login logs | login success/failure, logout, refresh failure, audience mismatch |
| Operation logs | Admin CRUD, config publish, endpoint template rollout, GeoIP credential update |
| Job logs | run created/retry/cancel, gateway service auth failure, job service timeout |
| System logs | startup, DB/Redis unavailable, degraded mode, config load failure |
| Node logs | node register, heartbeat degraded, endpoint event, release event, log batch accepted/rejected |
| App/Sentry logs | Sentry issue synced, issue status changed, release crash spike, native tunnel exception summary |
| Payment logs | order created/status changed, webhook received/duplicate/signature failure, provider error, reconciliation result, refund/chargeback/manual adjustment |
| Notification logs | provider verify, bot invite, dispatch queued/sent/failed/throttled/dead-lettered, provider callback verified |
| Security logs | permission denied, suspicious token, HMAC mismatch, secret redaction violation |

## 9.1 App Sentry Rules

`livemask-app` must use Sentry for crash, native tunnel, unhandled exception,
ANR/performance and breadcrumb capture.

App requirements:

- Fetch Sentry client configuration from Backend System Settings when
  available; build-time `SENTRY_DSN` may exist only as a local/dev fallback.
- Treat the App-facing DSN as public client configuration. Do not ship or
  request Sentry server auth tokens, org tokens, project tokens, relay secrets,
  webhook secrets, private keys, or write API tokens in the App.
- Use `beforeSend` / equivalent hook to redact:
  - tokens
  - authorization headers
  - cookies
  - node endpoint + port combinations
  - connect credentials
  - user email unless hashed or explicitly allowed
  - local cache payloads
  - full URLs with query strings
- Add safe tags:
  - `platform`
  - `app_version`
  - `release_channel`
  - `locale`
  - `profile_type`
  - `connect_state`
- Use low-cardinality tags only. Do not tag raw node endpoint, session token,
  device ID, full URL, email, order provider raw ID, or IM contact ID.
- Add breadcrumbs for connect lifecycle, reconnect hints, GeoIP package sync,
  content fetch, billing entry and notification preference changes.
- App must not POST raw exception logs to Backend. Backend receives Sentry
  webhook/sync summaries only.

### 9.1.1 App Sentry Runtime Config

Backend owns the App-facing Sentry config endpoint. The config is derived from
Admin System Settings but exposes only safe client fields.

Recommended API:

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/v1/app/observability/config` | public app context or user JWT when available | Return safe App observability client config |

Required query parameters:

| Parameter | Purpose |
| --- | --- |
| `platform` | `ios`, `android`, `macos`, `windows`, `linux`, `web` |
| `app_version` | App semantic/build version for rollout gating |
| `release_channel` | `local`, `internal`, `beta`, `stable` |
| `locale` | Optional locale for any user-facing disabled reason |

Example response:

```json
{
  "sentry": {
    "enabled": true,
    "dsn": "https://public_key@o0.ingest.sentry.io/project_id",
    "environment": "production",
    "release": "livemask-app@1.4.0+10400",
    "traces_sample_rate": 0.05,
    "profiles_sample_rate": 0.0,
    "attach_stacktrace": true,
    "max_breadcrumbs": 50,
    "before_send_required": true,
    "allowed_tags": [
      "platform",
      "app_version",
      "release_channel",
      "locale",
      "profile_type",
      "connect_state"
    ]
  },
  "generated_at": "2026-05-19T10:00:00Z"
}
```

Rules:

- Backend may store Sentry provider secrets in System Settings, but only the
  public client DSN and non-secret sampling flags may be returned to App.
- `dsn` must be nullable. If missing or disabled, App must skip Sentry
  initialization without blocking startup, login, or VPN connection.
- Backend must support per-environment and per-release-channel overrides.
- App must cache the last safe config for offline startup, but it must not
  cache forbidden server-side Sentry secrets because those fields must never
  appear in this API.
- CI/CD smoke must verify that the App config API response does not contain:
  `auth_token`, `org_token`, `project_token`, `relay_secret`,
  `webhook_secret`, `private_key`, `api_key`, `authorization`, `cookie`.

Backend Sentry integration options:

1. Sentry webhook sends issue/event summaries to Backend.
2. Backend scheduled sync pulls issue summaries from Sentry API.
3. CI/CD seeds a fake Sentry summary for local smoke.

Backend must store only `app_exception_reports` summaries and mirrored
`observability_logs` entries with family `exception`.

## 10. Metrics Contract

### 10.1 Required Endpoints

| Component | Endpoint | Auth |
| --- | --- | --- |
| Backend | `GET /metrics` | internal network or metrics token |
| Job Service | `GET /metrics` | internal network or metrics token |
| NodeAgent | `GET /metrics` | localhost/internal only by default |

Metrics format must be Prometheus text exposition.

### 10.2 NodeAgent Metrics

Required MVP metrics:

```text
livemask_nodeagent_up
livemask_nodeagent_info{agent_version,go_version}
livemask_nodeagent_config_version
livemask_nodeagent_config_degraded
livemask_nodeagent_config_last_success_timestamp_seconds
livemask_nodeagent_singbox_running
livemask_nodeagent_endpoint_ready
livemask_nodeagent_endpoint_probe_success_total{transport,profile}
livemask_nodeagent_endpoint_probe_failure_total{transport,profile,reason}
livemask_nodeagent_geoip_ready
livemask_nodeagent_geoip_version_info{profile,format,version}
livemask_nodeagent_release_version_info{version}
livemask_nodeagent_event_queue_depth
livemask_nodeagent_log_queue_depth
livemask_nodeagent_job_active{job_type}
```

Label rules:

- Allowed: `profile`, `transport`, `reason`, `version`, `format`.
- Forbidden: raw endpoint host, IP, token, node secret, session ID, user email,
  full config hash as label.
- `node_id` should be configured by scraper relabeling or static target labels,
  not emitted by default if endpoint is exposed beyond localhost.

### 10.3 Backend Metrics

Required MVP metrics:

```text
livemask_backend_up
livemask_backend_http_requests_total{route,method,status}
livemask_backend_auth_login_total{result,audience}
livemask_backend_admin_operation_total{action,result}
livemask_backend_node_heartbeat_total{status}
livemask_backend_node_log_batches_total{result}
livemask_backend_job_gateway_requests_total{job_type,result}
livemask_backend_payment_webhook_total{provider,result}
livemask_backend_reconnect_hints_total{result}
livemask_backend_observability_ingest_backlog
```

### 10.4 Job Service Metrics

Required MVP metrics:

```text
livemask_job_service_up
livemask_job_runs_total{job_type,status}
livemask_job_queue_depth{job_type}
livemask_job_worker_active{job_type}
livemask_job_run_duration_seconds_bucket{job_type}
livemask_job_retries_total{job_type}
livemask_job_dead_letter_total{job_type}
livemask_job_log_ingest_batches_total{result}
```

## 11. Admin UI Contract

Admin must implement:

### 11.1 Global Logs

Route:

- `/admin/logs`

Features:

- tabs or saved filters for:
  - 全部日志
  - 系统日志
  - NodeAgent 日志
  - App/Sentry 异常
  - 支付订单日志
  - 推送/通知日志
  - Job 日志
  - 安全日志
- filter by family, level, source, component, node, job, actor, payment order,
  provider, app platform, release, time
- redacted metadata view
- safe copy for `log_id`, `request_id`, `job_run_id`, `sentry_issue_id`,
  `payment_order_id`, provider event ID only
- no raw secret display
- empty states must explain whether data is not configured, not ingested, or
  blocked by permission
- production must not silently show mock logs

### 11.2 Audit Logs

Route:

- `/admin/audit-logs`

Features:

- actor/action/resource filters
- immutable entries
- export later, not MVP
- link to related log entries, payment order, job run or notification delivery
  log when available

### 11.3 Node List / Node Detail Logs

Routes:

- `/admin/nodes`
- `/admin/nodes/{node_id}`

Features:

- latest log snippet column or drawer
- "View Logs" action
- node log timeline
- component filters: `singbox`, `geoip`, `release`, `config`, `protocol`, `health`
- metrics mini-panel: endpoint_ready, config_degraded, event_queue_depth,
  log_queue_depth

Admin reads Backend APIs only:

- `GET /admin/api/v1/nodes/{node_id}/logs`
- `GET /admin/api/v1/nodes/{node_id}/metrics-summary`

### 11.4 App Exceptions

Routes:

- `/admin/logs?family=exception&source=app`
- optional future route `/admin/app/exceptions`

Features:

- Sentry issue list with status, release, platform, last seen, affected users
- issue detail drawer with safe context and link/copy `sentry_issue_id`
- filters for platform, app version, release channel, locale and status
- no raw stack/context dump in the first MVP UI

### 11.5 Payment Order Logs

Routes:

- `/admin/logs?family=payment_order`
- `/admin/billing/orders/{order_id}` log tab when billing order detail exists

Features:

- timeline of order status transitions
- provider event ID, idempotency key, amount/currency, reconciliation status
- webhook duplicate/signature-failed visibility
- manual adjustment audit link
- no raw provider payload, no card/payment credentials

### 11.6 Notification / Push Logs

Routes:

- `/admin/logs?family=notification`
- user detail Delivery Logs section
- notification provider settings Delivery Health section

Features:

- provider/channel/template/status filters
- retry/dead-letter count
- Job Run link for queued dispatch
- masked contact identifier
- callback verified / provider failed reason

## 12. Security And Redaction

Redact keys containing:

- `secret`
- `token`
- `password`
- `private_key`
- `api_key`
- `license_key`
- `hmac`
- `node_secret`
- `signature`
- `credential`
- `authorization`
- `cookie`

Redact values that look like:

- signed URL with query credentials
- bearer token
- PEM block
- long random key material
- DSN with password

Never store or display:

- raw NodeAgent config
- full sing-box config
- node_secret
- payment card/payment credentials
- vendor GeoIP credentials
- Job Service bearer/HMAC secret

## 13. Retention

Suggested MVP retention:

| Log Type | Retention |
| --- | --- |
| audit logs | 365 days |
| payment logs | 365 days |
| security logs | 365 days |
| node logs | 30 days |
| system logs | 30 days |
| job technical events | 90 days |
| debug logs | 7 days |

Retention cleanup is `queue_required` and should be implemented as a Job
Service scheduled job.

## 14. RBAC

New permissions:

| Permission | Meaning |
| --- | --- |
| `logs:read` | View redacted system/node/job logs |
| `audit:read` | View audit logs |
| `metrics:read` | View metric summaries in Admin |
| `logs:write` | Internal only; not granted to browser roles |

Suggested roles:

- auditor: `logs:read`, `audit:read`, `metrics:read`
- ops_operator: `logs:read`, `metrics:read`
- admin: all read permissions
- super_admin: all read permissions

## 15. CI/CD Smoke Requirements

Add `observability-smoke.sh`:

1. Backend `/metrics` reachable in allowed environment.
2. Job Service `/metrics` reachable.
3. NodeAgent `/metrics` reachable from local runtime.
4. NodeAgent uploads a safe log batch.
5. Backend accepts batch with Node HMAC.
6. Job Service ingestion run or staging drain succeeds.
7. Admin logs API returns the entry.
8. Admin node latest logs returns the entry.
9. App Sentry summary seed/sync creates an `exception` family entry.
10. Payment order log seed/API returns payment timeline without raw provider
    payload.
11. Notification delivery log seed/API returns masked contact identifiers.
12. No token/secret/private_key/node_secret/HMAC/payment credential/contact
    raw identifier in responses.
13. Unauthorized Admin log access returns 401/403.
14. Audit log search returns login/admin operation entries.
15. Prometheus metrics contain required metric names.
16. Admin routes `/admin/logs`, `/admin/audit-logs`, node detail logs and
    App/Sentry exception route render without mock success in production mode.

## 16. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-OBSERVABILITY-LOGS-001` | `livemask-backend` | DB schema, log APIs, audit log APIs, NodeAgent log ingestion, metrics |
| `TASK-JOBS-OBSERVABILITY-INGEST-001` | `livemask-job-service` | `observability_log_ingest` job, queue drain, retry/dead-letter |
| `TASK-NODEAGENT-METRICS-LOGS-001` | `livemask-nodeagent` | `/metrics`, local log queue, Backend log upload |
| `TASK-APP-SENTRY-OBSERVABILITY-001` | `livemask-app` | Sentry setup, beforeSend redaction, breadcrumbs, safe tags, release/environment config |
| `TASK-BACKEND-SENTRY-SUMMARY-001` | `livemask-backend` | Sentry webhook/sync summary, `app_exception_reports`, Admin exception APIs |
| `TASK-BACKEND-PAYMENT-LOGS-001` | `livemask-backend` | Payment order log timeline and redacted provider/reconciliation events |
| `TASK-BACKEND-NOTIFICATION-LOGS-001` | `livemask-backend` | Notification delivery logs and provider delivery health APIs |
| `TASK-ADMIN-LOGS-METRICS-001` | `livemask-admin` | `/admin/logs`, `/admin/audit-logs`, node latest logs, node metrics panel |
| `TASK-ADMIN-OBSERVABILITY-DETAILS-001` | `livemask-admin` | App exceptions, payment order logs, notification delivery logs, system log tabs |
| `TASK-CICD-OBSERVABILITY-SMOKE-001` | `livemask-ci-cd` | Observability smoke |

## 17. Done Criteria

- Backend persists audit/system/node/payment/job logs with redaction.
- NodeAgent uploads logs through Backend HMAC, not Job Service direct.
- Job Service queues and writes log batches asynchronously.
- Backend/Admin can query global logs, audit logs, and node-specific latest logs.
- NodeAgent exposes Prometheus-compatible `/metrics`.
- Backend and Job Service expose Prometheus-compatible `/metrics`.
- Admin Node List can view latest node logs and metric summaries.
- CI/CD validates log ingestion, metrics, RBAC, and secret leakage.
