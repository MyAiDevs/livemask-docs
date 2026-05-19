# Job Queue Usage Matrix

> Task: `TASK-DOC-JOB-QUEUE-MATRIX-001`
> Owner: Backend / Job Service / NodeAgent / Admin / App / CI-CD / Docs
> Status: Ready
> Scope: Defines which LiveMask workflows must use `livemask-job-service`,
> which workflows may remain synchronous, and the required DB/Redis/Backend/
> NodeAgent boundaries for future implementation.

## 1. Why This Exists

LiveMask is no longer a simple CRUD application. The platform now manages
NodeAgent fleets, GeoIP artifacts, protocol rollouts, content scheduling,
dashboard aggregation, payment reconciliation, and app-side cache updates.

If these workflows are implemented as direct Admin button handlers inside
`livemask-backend`, the system will fail when node count, retry volume, or
external vendor latency grows.

This document is a mandatory architecture gate:

- Backend developers must check this matrix before adding Admin actions,
  cron jobs, retries, fan-out loops, or external download flows.
- NodeAgent developers must check this matrix before adding fleet rollout,
  probe, sync, or status-report retry behavior.
- Admin developers must send operational actions through Backend Job Gateway
  instead of calling Job Service directly.
- CI/CD developers must add smoke coverage for any workflow marked
  `queue_required`.

## 2. Decision Rule

Use Job Service when a workflow has any of these properties:

| Signal | Meaning |
| --- | --- |
| Fan-out | The operation targets many nodes, users, regions, packages, or records. |
| Long-running | The operation may exceed normal HTTP request latency. |
| External dependency | The operation calls a vendor, storage provider, GitHub, CDN, email/SMS/push provider, or another service that may fail. |
| Retry needed | Transient failure should retry with backoff instead of failing permanently. |
| Schedule needed | The operation runs later or repeatedly. |
| Rollback needed | Runtime behavior changes and must have LKG/rollback. |
| Per-target locking | Duplicate operations on the same node/source/content/payment would be unsafe. |
| Audit-heavy | Operators need run history, actor, events, and failure reason. |
| Backpressure needed | The operation can overload Backend, NodeAgent, vendor APIs, or the database if executed all at once. |

If any signal is true, default to `queue_required` unless the task document
explicitly justifies why it can remain synchronous.

## 3. Runtime Ownership

```text
Admin
  -> Backend Admin API Gateway
     -> Job Service queue / schedule / worker / events
        -> Backend domain executor APIs
           -> NodeAgent / App / Website consume safe assignments/manifests
              -> Backend receives status/events
                 -> Admin shows truth, audit, retry, rollback
```

| Component | Owns | Must Not Own |
| --- | --- | --- |
| Admin | UI intent, filters, confirmation, status display | Long-running execution or direct Job Service auth |
| Backend | Admin JWT/RBAC, audit attribution, domain validation, stable gateway API | Batch fan-out loops inside request handlers |
| Job Service | Queue, schedules, worker pool, leases, retry/backoff, run events, per-target locks | User-facing RBAC, raw vendor/user/node secrets, domain table shortcuts |
| NodeAgent | Pull-safe local execution, artifact/config verification, LKG rollback, status report | Hidden fleet orchestration or unbounded retry storms |
| App | Pull-safe local cache, LKG, user-visible degraded state, safe event report | Admin-only APIs or third-party source downloads |
| CI/CD | Smoke verification, local runtime sync, isolated staging validation | Destructive local runtime teardown |

## 4. DB / Redis Boundary

### 4.1 PostgreSQL

PostgreSQL is the source of truth for:

- job definitions
- schedules
- job runs
- queue items
- leases
- run events
- terminal status
- idempotency keys
- lock records

Required properties:

- `CREATE TABLE IF NOT EXISTS` migrations must be idempotent.
- Queue claims must be atomic.
- Expired leases must be recoverable after service restart.
- Terminal failed/dead-letter items must remain queryable.
- Run/event rows must be safe for Admin display after redaction.

### 4.2 Redis

Redis may be used for:

- short-lived rate limits
- worker notifications
- status cache
- distributed debounce
- lightweight progress cache
- dashboard read-through cache

Redis must not be the only source of truth for:

- run status
- queue item state
- schedules
- audit-required events
- per-target lock history
- release/config/GeoIP artifact state

If Redis is unavailable, Job Service should degrade by polling PostgreSQL.

## 5. Queue Classification

| Classification | Meaning | Implementation |
| --- | --- | --- |
| `queue_required` | Must use Job Service queue before implementation is accepted | Backend gateway returns `202 + run_id` |
| `queue_recommended` | May start synchronous only for MVP if explicitly documented, but should move to queue | Task must include migration note |
| `synchronous_allowed` | Safe request/response path | Must still enforce auth, RBAC, validation, timeouts |
| `outbox_required` | Primary state change is synchronous, side effects must go through durable outbox/job | Do not retry side effects in request handler |

## 6. Global Scenario Matrix

| Domain | Scenario | Classification | Trigger | Queue / Lock Scope | Required Notes |
| --- | --- | --- | --- | --- | --- |
| GeoIP | Source update from DB-IP/MaxMind/IP2Location/Hackl0us | `queue_required` | manual / schedule | `source + edition + profile` | Download, verify, normalize, store, sign, activate. No vendor credential leakage. |
| GeoIP | Source credential verify | `queue_recommended` | manual | `source` | Can be short, but vendor latency and audit make Job Service preferred. |
| GeoIP | Manifest signing or re-sign after key rotation | `queue_required` | manual / schedule | `database_id` | Must record signature version and failures. |
| GeoIP | Delta package generation | `queue_required` | schedule / artifact event | `from_version + to_version + platform` | CPU/storage heavy; fallback to full package. |
| GeoIP | Package cleanup / retention | `queue_required` | schedule | `profile + source` | Must not remove active/LKG packages. |
| NodeAgent | Binary release rollout | `queue_required` | manual / schedule | `release_id + node_id` | Per-wave concurrency, health gate, rollback. |
| NodeAgent | Binary rollback | `queue_required` | manual | `release_id + node_id` | Must be stoppable and observable per node. |
| NodeAgent | Runtime config publish | `queue_required` | manual / schedule | `config_key + target_scope + node_id` | Backend validates config; NodeAgent pulls and reports. |
| NodeAgent | Runtime config rollback | `queue_required` | manual | `config_key + target_scope + node_id` | LKG required. |
| NodeAgent | Protocol profile rollout | `queue_required` | manual / schedule | `profile + node_id` | Pause on endpoint_not_ready threshold. |
| NodeAgent | Endpoint/public probe sweep | `queue_required` | schedule / manual | `node_id + endpoint` | Backpressure and per-region limits required. |
| NodeAgent | GeoIP sync fan-out hint / compatibility check | `queue_required` | artifact activation | `database_id + node_id` | NodeAgent still pulls; Job Service coordinates wave and observation. |
| NodeAgent | Heartbeat ingestion | `synchronous_allowed` | NodeAgent poll/report | `node_id` | Must be fast; heavy aggregation moves to queue. |
| NodeAgent | Event retry from NodeAgent local queue | `outbox_required` | NodeAgent background | `event_id` | NodeAgent local retry queue + Backend ingestion idempotency. |
| App | App GeoIP manifest check | `synchronous_allowed` | App pull | `user_id/device_id` | Rate limited; no third-party source access. |
| App | App GeoIP package rollout observation | `queue_recommended` | artifact activation / schedule | `database_id + platform` | Backend/Job Service may aggregate adoption metrics. |
| App | App release artifact verification | `queue_required` | CI upload / Admin action | `release_id + platform + arch` | Verify sha256/signature/notarization metadata before publish. |
| App | App release publish/revoke | `queue_required` | manual / CI | `release_id + channel` | Publish, pause, revoke, cache invalidation, and audit must be async-safe. |
| App | App release adoption aggregation | `queue_required` | schedule | `date + platform + channel` | Aggregate update-check/download/install/version-active events. |
| App | Content feed pull | `synchronous_allowed` | App pull | `user_id/device_id` | Reads only active public content. |
| App | Content display/click analytics aggregation | `queue_required` | schedule / event batch | `date + content_id` | Event ingestion can be sync/outbox; aggregation queued. |
| Content | Scheduled publish/archive | `queue_required` | schedule | `content_id` | Default announcement/campaign/banner window is one month. |
| Content | Blog sitemap/RSS rebuild snapshot | `queue_required` | publish/archive / schedule | `locale + content_type` | Website may render, but data refresh is queued. |
| Content | Bulk import/sanitize articles | `queue_required` | manual/import | `source + batch_id` | Sanitize HTML; no script/iframe unless allowlist. |
| Website | Static SEO rebuild / cache purge | `queue_required` | content event / manual | `route_prefix + locale` | External CDN/build APIs need retry/backoff. |
| Dashboard | Daily country traffic aggregation | `queue_required` | schedule | `date + metric_family` | Idempotent; uses versioned GeoIP database. |
| Dashboard | Protocol mix/session trend aggregation | `queue_required` | schedule | `date + metric_family` | Rebuild must not double-count. |
| Billing | Payment reconciliation | `queue_required` | schedule / manual | `provider + date` | External provider latency and audit. |
| Billing | Webhook primary state update | `outbox_required` | provider webhook | `provider_event_id` | Webhook should persist quickly; side effects queued. |
| Billing | Subscription expiration sweep | `queue_required` | schedule | `date + plan` | Must be idempotent. |
| Billing | Invoice/email receipt delivery | `queue_required` | billing event | `invoice_id` | External email/provider retry required. |
| Connect | Stale session cleanup | `queue_required` | schedule | `date/hour` | Avoid large synchronous deletes. |
| Connect | Device limit cleanup/reconciliation | `queue_required` | schedule / manual | `user_id` | Audit and idempotency required. |
| Notification | Email/SMS/push/IM broadcast | `queue_required` | manual / schedule/event | `campaign_id + recipient_id` | Per-provider rate limits, locale targeting, channel priority, and opt-out required. See `USER_CONTACT_NOTIFICATION_CONTRACT.md`. |
| Notification | Single transactional notification | `outbox_required` | domain event | `event_id + recipient_id` | Persist domain state first, then retry side effect through `notification_dispatch_single`. |
| Notification | Bot invite for Telegram/WhatsApp/Lark binding | `queue_required` | Admin action / user request | `user_id + channel + invite_id` | Invite tokens are short-lived, rate-limited, auditable, and must never expose bot secrets. |
| Notification | Provider config verification | `queue_required` | Admin action / schedule | `provider` | Verifies Telegram/WhatsApp/Lark credentials and webhook readiness without exposing secrets. |
| Notification | Scheduled report dispatch | `queue_required` | schedule / manual | `template_key + audience + schedule_window` | Sends system/operations/SRE/sponsor/ambassador/billing/security/job reports with provider rate limits. |
| Notification | Notification preference backfill/reconciliation | `queue_required` | migration / schedule | `user_id + notification_type` | Used when new notification types/channels launch; must preserve explicit user opt-out. |
| Notification | Failed delivery retry / provider failover | `queue_required` | delivery failure / schedule | `delivery_log_id + provider` | Retry with backoff, record terminal failure, and avoid duplicate user-facing messages. |
| Security | Abuse/risk scan | `queue_required` | schedule / manual | `date + account_scope` | Do not block login/payment request handlers. |
| Security | Secret rotation verification | `queue_required` | manual / schedule | `secret_scope` | Redacted events only. |
| CI/CD | Staging smoke run | `queue_required` | manual / schedule | `repo + workflow + ref` | Job Service can trigger GitHub workflow; CI remains source of logs. |
| CI/CD | Task-sync dispatch | `queue_recommended` | task completion | `task_id + repo` | Direct workflow dispatch okay MVP, but queue preferred for retry/audit. |
| CI/CD | Local dev runtime sync | `synchronous_allowed` | developer command | `service` | Must not stop long-lived runtime unless explicitly requested. |
| Data | Bulk export/report generation | `queue_required` | manual / schedule | `export_type + actor` | Generates artifact, not blocking Admin request. |
| Data | Audit log retention/archive | `queue_required` | schedule | `date_range` | Must preserve compliance constraints. |
| Support | Bulk account action/import | `queue_required` | manual | `batch_id + user_id` | Confirmation, audit, per-user result events. |

## 7. Backend Mandatory Rules

Backend must use Job Service when:

- The Admin action triggers any `queue_required` scenario.
- The operation loops over nodes, users, devices, content, files, or packages.
- The operation calls external services that may be slow or rate-limited.
- The operation needs retry/backoff, cancellation, status history, or schedule.

Backend implementation requirements:

- Expose Admin gateway routes under `/admin/api/v1/jobs`.
- Enforce Admin JWT audience and `jobs:*` permissions.
- Enforce owner-domain permission, such as `geoip:write` or `nodeagent:write`.
- Write user-facing audit entries for run/schedule mutations.
- Forward only scrubbed, validated parameters to Job Service.
- Use internal service auth to call Job Service.
- Return `202 Accepted + run_id` for run creation.
- Never keep a request open while a job executes.

Backend must not:

- Execute fleet fan-out inside HTTP handlers.
- Store raw job secrets in run parameters/events.
- Let Admin call Job Service directly.
- Treat Redis-only state as durable job state.

## 8. NodeAgent Mandatory Rules

NodeAgent must assume fleet operations are coordinated by Job Service through
Backend, but NodeAgent itself remains pull-safe.

NodeAgent implementation requirements:

- Pull assignments, manifests, configs, and artifacts from Backend.
- Verify sha256/signature/compatibility before applying runtime changes.
- Keep local last-known-good binary/config/GeoIP artifact where applicable.
- Report per-step events and summarized status to Backend.
- Maintain local retry queue for status/event report failures.
- Keep errors redacted; never report secrets or full signed URLs.
- Support degraded/stale states instead of hiding failure.

NodeAgent must not:

- Accept direct commands from Job Service.
- Trust unsigned artifacts/configs.
- Fan out to other nodes.
- Retry unboundedly without backoff.
- Turn a failed rollout into silent success.

## 9. Job Service Mandatory Rules

Job Service implementation requirements:

- Persist definitions, runs, queue items, schedules, leases, and events in DB.
- Support worker count configuration by job type.
- Support per-target locks and idempotency keys.
- Support retry/backoff and terminal dead-letter status.
- Support cancellation and restart recovery.
- Redact parameters and event metadata before storage.
- Expose health status that includes queue store readiness.
- Keep executor adapters small and domain-specific.

Job Service must not:

- Validate Admin JWTs.
- Store vendor credentials unless a specific contract assigns that secret store
  to Job Service. Current GeoIP credentials remain Backend-owned.
- Directly mutate Backend domain tables without a contract.
- Execute arbitrary shell commands submitted by Admin.

## 10. Admin Mandatory Rules

Admin implementation requirements:

- Use Backend Admin APIs, not Job Service internal APIs.
- Provide `/admin/jobs`, run history, run detail, event timeline, schedules.
- Feature pages may link to Job Center with filters.
- Mutations require confirmation and must show `run_id`.
- Read-only users can inspect jobs but cannot run/cancel/retry/write schedules.
- Event metadata must be rendered safely and should hide/redact suspicious keys.

Admin must not:

- Duplicate a generic scheduler in feature pages.
- Ask users to enter secrets inside Job Center run parameters.
- Treat mock mutation as success.

## 11. App Mandatory Rules

App does not call Job Service. App consumes Backend outputs of queued workflows.

App implementation requirements:

- Use pull-safe APIs for content, GeoIP, config, and connect data.
- Cache last-known-good content/config/GeoIP where applicable.
- Show user-friendly degraded or pending states.
- Report safe events to Backend when contract requires it.

App must not:

- Receive Admin job tokens.
- Receive vendor credentials, node secrets, or Job Service service tokens.
- Call third-party GeoIP sources directly.

## 12. CI/CD Mandatory Rules

CI/CD must cover every new queued workflow with smoke tests:

- no token -> 401
- wrong audience/role -> 403
- valid Admin -> run creation succeeds
- run creation returns quickly
- run detail/events readable
- invalid parameters rejected
- duplicate lock returns conflict or existing run
- no secret leakage in responses/events/logs

Local runtime sync must use targeted service recreate and must not stop the
long-lived local dev runtime unless explicitly requested.

## 13. Implementation Gates

Before implementing any new backend or nodeagent operation, answer:

1. Does it fan out?
2. Can it take more than a normal HTTP request?
3. Does it call an external service?
4. Does it need retry/backoff?
5. Does it need schedule?
6. Does it change runtime behavior and require rollback?
7. Does it need per-target locking?
8. Does Admin need run history or audit?
9. Could it overload Backend/DB/NodeAgent/vendor APIs if run immediately?

If any answer is yes, create or reuse a Job Service job type.

## 14. Follow-Up Tasks

| Task | Repo | Purpose |
| --- | --- | --- |
| `TASK-BACKEND-JOBS-GATEWAY-001` | `livemask-backend` | Admin Job Gateway, RBAC, audit, service auth |
| `TASK-ADMIN-JOBS-001` | `livemask-admin` | `/admin/jobs` UI, runs, schedules, events |
| `TASK-JOBS-QUEUE-002` | `livemask-job-service` | Durable queue items, leases, retry/backoff, dead-letter |
| `TASK-JOBS-SCHEDULER-001` | `livemask-job-service` | Schedule storage, cron/hourly/daily evaluator |
| `TASK-JOBS-GEOIP-001` | `livemask-job-service` / `livemask-backend` | GeoIP update/verify executor integration |
| `TASK-JOBS-NODEAGENT-001` | `livemask-job-service` / Backend / NodeAgent | NodeAgent release/config/protocol rollout executor |
| `TASK-JOBS-CONTENT-001` | `livemask-job-service` / Backend | Content publish/archive executor |
| `TASK-CICD-JOBS-HARDENING-001` | `livemask-ci-cd` | Queue, lease, retry, lock, secret leakage smoke |

## 15. Done Criteria

- Queue classification is checked before new Backend/NodeAgent work.
- All `queue_required` workflows go through Backend Job Gateway and Job Service.
- Job Service has DB-backed durable state and Redis only as optional optimizer.
- Admin has one Job Center instead of repeated feature-local schedulers.
- NodeAgent remains pull-safe and reports status/events.
- App consumes safe Backend outputs and never receives job/service secrets.
- CI/CD validates auth, RBAC, fast run creation, event visibility, retry/lock,
  and secret leakage.
