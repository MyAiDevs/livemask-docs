# Admin Job Center / Scheduler Contract

> Task: `TASK-DOC-ADMIN-JOBS-001`  
> Owner: Job Service / Backend / Admin / CI-CD / Docs  
> Status: Ready  
> Scope: Defines the shared Admin Job Center contract for manual triggers,
> scheduled tasks, job history, retry, cancel, audit, RBAC, and cross-module
> task ownership.

Related mandatory contract:

- [Job Queue Usage Matrix](JOB_QUEUE_USAGE_MATRIX.md) — defines which LiveMask
  workflows must use Job Service queue/worker/retry/backoff, which may remain
  synchronous, and the DB/Redis boundary for all future Backend and NodeAgent
  implementation.

## 1. Why This Exists

Admin actions such as **GeoIP Trigger Update** must not live as one-off buttons
inside feature pages forever. GeoIP update is only the first example of a wider
operational pattern:

- GeoIP database update and credential verify
- NodeAgent binary release rollout and rollback
- NodeAgent config publish and rollback
- Content publish/archive/scheduled display
- Blog sitemap/RSS rebuild
- Dashboard and traffic aggregation
- Billing reconciliation
- Device/session cleanup
- Task-sync and smoke validation triggers

These operations need the same product surface:

- Run now
- Schedule
- Retry
- Cancel
- View latest status
- View logs/events
- See who triggered it
- Check RBAC and audit
- Avoid leaking secrets

Therefore LiveMask needs a dedicated **Admin Job Center** and an independent
**Job Service** instead of embedding generic triggers in each feature page or
running long tasks inside Backend request handlers.

## 1.1 Deployment Decision

Job execution must be split into a dedicated service from the beginning:

```text
livemask-admin
  -> livemask-backend Admin API Gateway
     -> livemask-job-service API
        -> DB-backed queue / scheduler / worker pool
           -> Backend domain APIs / internal handlers
           -> Job events / audit / metrics
```

Rules:

- `livemask-backend` owns Admin JWT validation, RBAC decisions, audit
  attribution, and stable Admin API gateway routes.
- `livemask-job-service` owns job definitions, queue, schedules, leases,
  retries, backoff, worker pool, cancellation, run events, and job state.
- Backend must not execute long-running job work synchronously inside HTTP
  request handlers.
- Admin run APIs must return quickly with `202 Accepted + run_id`.
- The job worker may call Backend domain APIs using internal service auth, but
  must not bypass domain validation or security boundaries.
- Local dev runtime must run the Job Service as its own service with fixed
  ports, without stopping existing backend/admin/website/nodeagent services.

This avoids future migration debt when NodeAgent count grows and batch rollout
or probe workloads require concurrency control.

## 2. Product Routes

### 2.1 Admin Routes

| Route | Purpose |
| --- | --- |
| `/admin/jobs` | Job definitions, schedules, latest run status, manual run entry |
| `/admin/jobs/runs` | Global job run history with filters |
| `/admin/jobs/runs/{run_id}` | Job run detail, events, logs, result metadata |
| `/admin/jobs/schedules` | Recurring schedule list and enable/disable controls |
| `/admin/jobs/schedules/{schedule_id}` | Schedule detail and edit page |
| `/admin/jobs/new` | Optional future route for defining custom jobs |

### 2.2 Feature Page Relationship

Feature pages may link into Job Center, but must not become generic schedulers.

| Feature Page | Allowed Behavior | Forbidden Behavior |
| --- | --- | --- |
| `/admin/geoip` | Show database status, link to jobs filtered by `geoip_*` | Own generic trigger/schedule UX long-term |
| `/admin/geoip/sources` | Configure credentials and verify source-specific settings | Store raw job history |
| `/admin/nodeagent/*` | Link to rollout/config jobs | Duplicate rollout scheduler |
| `/admin/content` | Link to scheduled publish/archive jobs | Implement separate scheduler primitives |
| `/admin/config` | Link to config publish/rollback jobs | Hidden trigger without audit |

MVP exception: an existing feature page may keep a temporary action button while
`/admin/jobs` is being implemented, but the button must clearly link to the
future Job Center contract and be removed after `TASK-ADMIN-JOBS-001`.

## 3. Job Types

`job_type` is a stable API enum. New job types require a docs contract update.

| Job Type | Domain Owner | Executor | Trigger Source | Notes |
| --- | --- | --- | --- | --- |
| `geoip_source_update` | Backend GeoIP | Job Service worker | manual / schedule | Update one source+edition or all sources |
| `geoip_source_verify` | Backend GeoIP | Job Service worker | manual | Verify credential connectivity |
| `geoip_manifest_sign` | Backend GeoIP | Job Service worker | manual / schedule | Regenerate signatures if signing keys rotate |
| `nodeagent_release_rollout` | Backend NodeAgent | Job Service worker | manual / schedule | Roll out binary versions |
| `nodeagent_release_rollback` | Backend NodeAgent | Job Service worker | manual | Roll back binary version |
| `nodeagent_config_publish` | Backend ConfigCenter | Job Service worker | manual / schedule | Publish runtime config assignment |
| `nodeagent_config_rollback` | Backend ConfigCenter | Job Service worker | manual | Roll back runtime config |
| `content_publish` | Backend Content | Job Service worker | schedule / manual | Publish scheduled content |
| `content_archive` | Backend Content | Job Service worker | schedule / manual | Archive expired content |
| `website_seo_rebuild` | Website / Backend | Job Service worker | manual / schedule | Rebuild sitemap/RSS source snapshots |
| `dashboard_daily_aggregation` | Backend Analytics | Job Service worker | schedule | Daily country/region/protocol metrics |
| `billing_reconciliation` | Backend Billing | Job Service worker | schedule / manual | Payment/subscription reconciliation |
| `session_cleanup` | Backend Connect | Job Service worker | schedule | Expire stale sessions/devices |
| `ci_smoke_run` | CI/CD | Job Service worker | manual | Trigger selected smoke workflow |
| `task_sync` | Docs / CI-CD | Job Service worker | manual / schedule | Cross-repo task-sync workflow |

## 4. Core Domain Model

### 4.1 Job Definition

```json
{
  "job_type": "geoip_source_update",
  "display_name": "GeoIP Source Update",
  "description": "Download, verify, normalize, store, and activate GeoIP artifacts.",
  "owner_domain": "geoip",
  "enabled": true,
  "manual_run_enabled": true,
  "schedule_enabled": true,
  "requires_confirmation": true,
  "permission_run": "jobs:execute",
  "permission_write": "jobs:write",
  "parameter_schema": {
    "source": { "type": "string", "enum": ["dbip_lite", "maxmind_geolite2"] },
    "edition": { "type": "string", "enum": ["country", "city", "asn"] },
    "force": { "type": "boolean" }
  }
}
```

Rules:

- `parameter_schema` must only expose non-secret fields.
- Secrets must be configured in the owning module, such as
  `/admin/geoip/sources`.
- Job Center may show credential status summaries, never raw secret values.

### 4.2 Job Schedule

```json
{
  "schedule_id": "uuid",
  "job_type": "geoip_source_update",
  "name": "Daily GeoIP Update",
  "enabled": true,
  "timezone": "UTC",
  "cron": "0 3 * * *",
  "parameters": {
    "source": "maxmind_geolite2",
    "edition": "city",
    "force": false
  },
  "next_run_at": "2026-05-19T03:00:00Z",
  "last_run_id": "uuid",
  "created_by": "uuid",
  "updated_by": "uuid",
  "created_at": "2026-05-18T00:00:00Z",
  "updated_at": "2026-05-18T00:00:00Z"
}
```

MVP may support only daily/hourly schedules. Cron expressions must be validated
server-side before saving.

### 4.3 Job Run

```json
{
  "run_id": "uuid",
  "job_type": "geoip_source_update",
  "trigger_type": "manual",
  "triggered_by": "uuid",
  "schedule_id": null,
  "status": "running",
  "parameters": {
    "source": "maxmind_geolite2",
    "edition": "city",
    "force": false
  },
  "result_summary": null,
  "started_at": "2026-05-18T10:00:00Z",
  "finished_at": null,
  "duration_ms": null,
  "retry_of_run_id": null,
  "cancel_requested_at": null,
  "cancel_requested_by": null
}
```

### 4.4 Job Event

```json
{
  "event_id": "uuid",
  "run_id": "uuid",
  "level": "info",
  "event_type": "download_started",
  "message": "Download started for source=maxmind_geolite2 edition=city",
  "metadata": {
    "source": "maxmind_geolite2",
    "edition": "city"
  },
  "created_at": "2026-05-18T10:00:01Z"
}
```

Rules:

- `metadata` must be scrubbed before storage.
- Download URLs with query params must be redacted.
- License keys, API keys, tokens, HMAC signatures, private keys, and local
  filesystem paths must never appear in `message` or `metadata`.

## 5. Status Model

| Status | Meaning | Terminal |
| --- | --- | --- |
| `queued` | Accepted but not started | No |
| `running` | Worker has started | No |
| `succeeded` | Completed successfully | Yes |
| `failed` | Completed with error | Yes |
| `cancel_requested` | User requested cancel | No |
| `cancelled` | Worker stopped safely | Yes |
| `skipped` | Schedule decided no work needed | Yes |
| `blocked` | Preconditions missing, such as credential not configured | Yes |

## 6. Queue, Worker, Retry, And Backoff

Job Service must be asynchronous from the first implementation.

### 6.1 Queue Item

```json
{
  "queue_id": "uuid",
  "run_id": "uuid",
  "job_type": "nodeagent_release_rollout",
  "target_key": "node_id:node-123",
  "status": "queued",
  "priority": 50,
  "attempt": 0,
  "max_attempts": 5,
  "next_attempt_at": "2026-05-18T10:00:00Z",
  "lease_owner": null,
  "lease_expires_at": null,
  "idempotency_key": "nodeagent_release_rollout:release-1:node-123"
}
```

### 6.2 Required Mechanics

| Mechanic | Requirement |
| --- | --- |
| Queue | DB-backed queue required for MVP; Redis may be used only as optimization |
| Worker pool | Configurable worker count per job type |
| Lease | Workers must claim jobs with lease expiration to recover from crashes |
| Retry | Failed queue items retry until `max_attempts` |
| Backoff | Exponential backoff with jitter |
| Dead letter | Terminal failed queue items remain queryable |
| Idempotency | Duplicate run requests use `idempotency_key` where possible |
| Rate limit | Per job type and per target rate limits |
| Cancellation | Cancel requested state stops queued work and asks running work to stop safely |
| Resume | Service restart resumes queued/running-expired lease items |

### 6.3 Multi-NodeAgent Safety

NodeAgent tasks must never fan out as one synchronous HTTP request.

For rollout/probe/config jobs:

- Split work into per-node or per-wave queue items.
- Enforce per-node lock: `node_id`.
- Enforce rollout wave concurrency, e.g. 5 nodes or 5% of fleet at a time.
- Record per-node success/failure events.
- Retry transient failures with backoff.
- Stop or pause next waves if error threshold is exceeded.
- Support rollback job generation from failed rollout runs.

## 7. Backend Gateway API Contract

All Admin endpoints require Admin JWT audience.
Backend exposes Admin-facing routes and delegates execution to Job Service.
Backend must not keep the HTTP request open while a job runs.

### 7.1 Read APIs

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/api/v1/jobs` | `jobs:read` | List job definitions |
| GET | `/admin/api/v1/jobs/{job_type}` | `jobs:read` | Get definition and parameter schema |
| GET | `/admin/api/v1/jobs/runs` | `jobs:read` | List runs with filters |
| GET | `/admin/api/v1/jobs/runs/{run_id}` | `jobs:read` | Run detail |
| GET | `/admin/api/v1/jobs/runs/{run_id}/events` | `jobs:read` | Run events/logs |
| GET | `/admin/api/v1/jobs/schedules` | `jobs:read` | List schedules |
| GET | `/admin/api/v1/jobs/schedules/{schedule_id}` | `jobs:read` | Schedule detail |

### 7.2 Write / Action APIs

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| POST | `/admin/api/v1/jobs/{job_type}/run` | `jobs:execute` | Enqueue run and return `202 + run_id` |
| POST | `/admin/api/v1/jobs/runs/{run_id}/retry` | `jobs:execute` | Retry a failed/skipped run |
| POST | `/admin/api/v1/jobs/runs/{run_id}/cancel` | `jobs:execute` | Request cancellation |
| POST | `/admin/api/v1/jobs/schedules` | `jobs:write` | Create schedule |
| PUT | `/admin/api/v1/jobs/schedules/{schedule_id}` | `jobs:write` | Update schedule |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/enable` | `jobs:write` | Enable schedule |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/disable` | `jobs:write` | Disable schedule |
| DELETE | `/admin/api/v1/jobs/schedules/{schedule_id}` | `jobs:write` | Delete schedule |

### 7.3 Filters

`GET /admin/api/v1/jobs/runs` must support:

- `job_type`
- `status`
- `trigger_type`
- `triggered_by`
- `schedule_id`
- `started_after`
- `started_before`
- `page`
- `limit`

### 7.4 Internal Service API

Backend and Job Service communicate through internal service auth.

| Method | Path | Caller | Purpose |
| --- | --- | --- | --- |
| POST | `/internal/jobs/runs` | Backend | Create run after RBAC/audit attribution |
| GET | `/internal/jobs/runs/{run_id}` | Backend | Read run detail |
| GET | `/internal/jobs/runs/{run_id}/events` | Backend | Read events |
| POST | `/internal/jobs/runs/{run_id}/cancel` | Backend | Request cancel |
| POST | `/internal/jobs/schedules` | Backend | Create schedule |
| PUT | `/internal/jobs/schedules/{schedule_id}` | Backend | Update schedule |

Internal requests must be authenticated with service token, mTLS, or signed
HMAC headers. User JWTs must not be forwarded as worker credentials.

## 8. RBAC

| Permission | Meaning | Suggested Roles |
| --- | --- | --- |
| `jobs:read` | View definitions, schedules, runs, events | auditor, ops_operator, admin, super_admin |
| `jobs:execute` | Run now, retry, cancel | ops_operator, admin, super_admin |
| `jobs:write` | Create/update/disable schedules | admin, super_admin |

Owning module permissions still apply. Example:

- Running `geoip_source_update` requires `jobs:execute` **and** `geoip:write`.
- Running `nodeagent_release_rollout` requires `jobs:execute` **and**
  `nodeagent:write`.
- Running `content_publish` requires `jobs:execute` **and** `content:write`.

## 9. Audit Rules

Backend writes user-facing audit entries for Admin actions. Job Service writes
technical run events. Both must share `run_id` for traceability.

Every write/action must write an audit entry:

| Action | Required Audit Fields |
| --- | --- |
| Run now | actor, job_type, run_id, scrubbed parameters |
| Retry | actor, original_run_id, new_run_id |
| Cancel | actor, run_id, cancel_reason |
| Create schedule | actor, schedule_id, job_type, cron, scrubbed parameters |
| Update schedule | actor, schedule_id, changed fields |
| Disable schedule | actor, schedule_id |

Audit logs must not include secrets or raw download URLs with query params.

## 10. Concurrency And Locking

Job Service must prevent unsafe duplicate runs:

| Job Type | Lock Scope |
| --- | --- |
| `geoip_source_update` | `source + edition` |
| `geoip_source_verify` | `source` |
| `nodeagent_release_rollout` | `release_id` |
| `nodeagent_config_publish` | `config_key + target_scope` |
| `content_publish` | `content_id` |
| `dashboard_daily_aggregation` | `date + metric_family` |

If a lock exists, API should return `409 JOB_ALREADY_RUNNING` with the active
`run_id`.

## 11. GeoIP Migration Rule

GeoIP currently has feature-local update controls. The target state is:

| Current UI | Target UI |
| --- | --- |
| `/admin/geoip` Trigger Update button | `/admin/jobs?job_type=geoip_source_update` |
| `/admin/geoip/sources/{source}` Verify button | `/admin/jobs?job_type=geoip_source_verify&source=...` or source-local shortcut that creates a Job Run |
| GeoIP update job list inside GeoIP detail | Link to `/admin/jobs/runs?job_type=geoip_source_update&source=...` |

GeoIP credential configuration remains under `/admin/geoip/sources`; Job Center
must not collect or display credential values.

## 12. Admin UI Requirements

`livemask-admin` must implement:

- Sidebar menu item: `Jobs`
- `/admin/jobs` compact operational table
- Job type filter
- Status filter
- Owner domain filter
- Schedule enabled badge
- Latest run status badge
- `Run Now` button gated by `jobs:execute`
- `Schedule` button gated by `jobs:write`
- Run detail drawer or page
- Event timeline with safe metadata rendering
- Empty/loading/error states
- Mock fallback only for reads
- Mutations must not silently succeed in mock mode

Design requirements:

- Dense operations UI, not marketing layout
- No nested cards inside cards
- Use icon buttons for retry/cancel/view where appropriate
- All destructive or risky actions require confirmation
- Text must fit in table cells and dialogs on mobile/desktop

## 13. CI/CD Smoke Requirements

`livemask-ci-cd` should add `jobs-smoke.sh` after Job Service/Backend/Admin
implementation:

| Step | Expected |
| --- | --- |
| Admin login | 200 |
| User token on jobs API | 403 |
| No token on jobs API | 401 |
| List job definitions | Contains `geoip_source_update` |
| Run GeoIP update with valid parameters | 200/202 + run_id |
| Run API latency | Returns quickly; no long-running HTTP request |
| Duplicate lock test | 409 or skipped with existing run_id |
| Get run detail | 200 |
| Get run events | 200 and no secret leakage |
| Create schedule | 200/201 |
| Disable schedule | 200 |
| Worker retry/backoff | Failed test job creates retry event |
| Lease recovery | Expired lease can be picked up by a worker |
| Invalid job_type | 404/400 |
| Invalid parameters | 400 `JOB_INVALID_PARAMETERS` |

Smoke must check no response contains:

- `license_key`
- `api_key`
- `token`
- `hmac`
- `private_key`
- `node_secret`
- `storage_path`
- full signed download URL query strings

## 14. Error Codes

| Code | Meaning |
| --- | --- |
| `JOB_NOT_FOUND` | Unknown job type or run ID |
| `JOB_DISABLED` | Job definition disabled |
| `JOB_INVALID_PARAMETERS` | Parameters do not match schema |
| `JOB_PERMISSION_DENIED` | Missing job or owning-module permission |
| `JOB_ALREADY_RUNNING` | Lock conflict |
| `JOB_RUN_FAILED` | Worker failed |
| `JOB_CANCEL_NOT_SUPPORTED` | Job cannot be cancelled |
| `JOB_SCHEDULE_INVALID` | Invalid cron/timezone/parameter combo |
| `JOB_SCHEDULER_UNAVAILABLE` | Scheduler worker unavailable |
| `JOB_QUEUE_UNAVAILABLE` | Queue store unavailable |
| `JOB_LEASE_CONFLICT` | Queue item already leased |
| `JOB_RETRY_EXHAUSTED` | Max attempts reached |

## 15. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-JOBS-SERVICE-001` | `livemask-job-service` | Independent Job Service repo, DB-backed queue, worker pool, scheduler, retry/backoff, locks, service API |
| `TASK-BACKEND-JOBS-GATEWAY-001` | `livemask-backend` | Admin API gateway, RBAC, audit attribution, service auth integration |
| `TASK-ADMIN-JOBS-001` | `livemask-admin` | Job Center UI, GeoIP trigger migration, schedule/run pages |
| `TASK-CICD-JOBS-001` | `livemask-ci-cd` | Job Center smoke tests |
| `TASK-DOC-ADMIN-JOBS-001` | `livemask-docs` | This contract and task wiring |

Follow-up domain integrations:

- `TASK-JOBS-GEOIP-001` — wire GeoIP update/verify executor into Job Service
- `TASK-JOBS-NODEAGENT-001` — wire release/config rollout executor into Job Service
- `TASK-JOBS-CONTENT-001` — wire publish/archive schedules into Job Service
- `TASK-JOBS-DASHBOARD-001` — wire daily analytics aggregation into Job Service

## 16. Done Criteria

- `livemask-job-service` exists as an independent service in local dev and CI.
- Job Service exposes internal run/schedule APIs and owns queue/worker/scheduler state.
- Backend exposes Admin gateway routes for job definitions, runs, schedules, and actions.
- Admin run requests return `202 + run_id` without running long work in request handlers.
- Admin has a first-class `/admin/jobs` menu.
- GeoIP update can be triggered from Job Center.
- GeoIP page links to Job Center instead of owning generic scheduler UI.
- RBAC covers `jobs:read`, `jobs:execute`, `jobs:write` plus owner permissions.
- Audit logs exist for every run/schedule mutation.
- Worker retry/backoff, lease recovery, per-target locks, and concurrency limits are tested.
- Job events do not leak secrets or local storage paths.
- CI smoke covers auth, RBAC, run now, schedule, invalid parameters, and secret leakage.
- Local dev runtime sync keeps services running after implementation.
