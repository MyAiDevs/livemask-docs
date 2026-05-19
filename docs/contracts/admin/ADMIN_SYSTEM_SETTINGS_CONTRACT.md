# Admin System Settings Contract

> Task: `TASK-DOC-ADMIN-SYSTEM-SETTINGS-001`  
> Owner: Backend / Admin / Job Service / CI-CD / Docs  
> Status: Ready  
> Scope: Defines the shared Admin system settings surface for GeoIP
> credentials, IM provider credentials, report templates, subscription
> configuration, App Sentry client configuration, provider verification,
> audit, redaction, and scheduled jobs.

Related mandatory contracts:

- [Admin Job Center / Scheduler Contract](../jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [User Contact & Notification Preference Contract](../users/USER_CONTACT_NOTIFICATION_CONTRACT.md)
- [GeoIP Credential Management Contract](../geoip/GEOIP_CREDENTIAL_MANAGEMENT_CONTRACT.md)
- [Log / Audit / Metric Pipeline Contract](../observability/LOG_METRIC_PIPELINE_CONTRACT.md)
- [Admin Navigation Information Architecture Contract](ADMIN_NAVIGATION_IA_CONTRACT.md)

## 1. Why This Exists

`/admin/settings` must become the operator-facing configuration center for
cross-module settings. Today several settings are scattered across feature
pages or missing from Admin:

- GeoIP source credentials, credential encryption key status, and verify/rotate actions
- Telegram / WhatsApp / Lark / email / push provider credentials and callback verification
- Default report and briefing templates
- Subscription plans, entitlement rules, grace periods, and notification policy
- App Sentry client configuration and Sentry server-side integration secrets
- App runtime governance configuration for multi-platform performance/resource tuning
- Scheduler defaults for recurring jobs and notification/report dispatch

The target state is one coherent settings surface in Admin, while Backend still
keeps domain ownership and Job Service owns asynchronous verification,
rotation, dispatch, and scheduled execution.

## 2. Ownership Model

| Area | UI Home | Backend Owner | Execution Owner | Notes |
| --- | --- | --- | --- | --- |
| GeoIP source credentials | `/admin/settings/geoip` and `/admin/geoip/sources` | GeoIP module | Job Service for verify/update/rotate jobs | Raw keys never returned to Admin |
| IM provider credentials | `/admin/settings/notifications` | Notification/User module | Job Service for verify/invite/dispatch jobs | Telegram/WhatsApp/Lark require callback/follow verification |
| Report templates | `/admin/settings/reports` | Notification/Report module | Job Service for scheduled dispatch | Templates are editable, versioned, and auditable |
| Subscription configuration | `/admin/settings/subscriptions` | Billing module | Job Service for reconciliation/sweep jobs | Plan changes must be auditable and versioned |
| Scheduler defaults | `/admin/jobs/schedules` and `/admin/settings/scheduler` | Job Gateway | Job Service scheduler | Defaults only; individual schedules remain in Job Center |
| Payment provider settings | `/admin/settings/payments` | Billing/Payment module | Job Service for verify/reconciliation jobs | Provider secrets are write-only |
| App release storage | `/admin/settings/app-releases` | App Release module | Job Service for storage verify and artifact jobs | S3/OSS/COS/GCS/local credentials are write-only |
| App observability / Sentry | `/admin/settings/observability` | Observability module | Backend for App config, Job Service for sync/verification jobs | Public DSN may be exposed to App; server tokens stay write-only |
| App runtime governance | `/admin/settings/app-runtime` | App Config module | Backend config publish/rollback; CI/CD smoke later | No secrets; controls App memory, reconnect, health-check and cache behavior |

`livemask-admin` must not call Job Service directly. All settings reads and
mutations go through `livemask-backend` Admin APIs. Backend validates Admin JWT,
RBAC, domain permission, redacts secrets, writes audit logs, and calls Job
Service only for asynchronous tasks.

## 3. Admin Routes

| Route | Purpose |
| --- | --- |
| `/admin/settings` | System settings overview with health summary and missing setup warnings |
| `/admin/settings/geoip` | GeoIP source credential status, signing/encryption status, verify/rotate actions |
| `/admin/settings/notifications` | Telegram, WhatsApp, Lark, email, and push provider setup |
| `/admin/settings/reports` | Report/briefing template list, edit, preview, run now, schedule |
| `/admin/settings/subscriptions` | Subscription plans, entitlement defaults, grace periods, renewal reminders |
| `/admin/settings/payments` | Payment provider safe metadata, webhook status, verification actions |
| `/admin/settings/app-releases` | App release artifact storage, signing key status, CDN/download policy |
| `/admin/settings/observability` | App Sentry client config, sampling policy, webhook/sync credential status |
| `/admin/settings/app-runtime` | App performance/resource governance, platform overrides, preview/publish/rollback |
| `/admin/settings/scheduler` | Global scheduler defaults and queue safety limits |

Feature pages may deep-link into these sections but must not duplicate the
generic settings editor. Example: `/admin/users/{user_id}` may launch a
Telegram invite job, but Telegram provider credentials belong under
`/admin/settings/notifications`.

## 4. Settings Data Model

### 4.1 System Setting Summary

```json
{
  "section": "notifications.telegram",
  "display_name": "Telegram Bot",
  "enabled": true,
  "configured": true,
  "status": "verified",
  "secret_hint": "bot_token: ****abcd",
  "last_verified_at": "2026-05-19T08:00:00Z",
  "last_verified_run_id": "uuid",
  "updated_by": "uuid",
  "updated_at": "2026-05-19T07:58:00Z"
}
```

Rules:

- `secret_hint` is the only secret-related value Admin may receive.
- Raw `bot_token`, `api_key`, `license_key`, `hmac_secret`, private key, webhook
  secret, database password, and signed URL query strings must never be returned.
- Empty secret inputs in Admin mean "keep existing secret"; they must not clear
  existing secrets unless the user explicitly selects `Clear secret`.
- Settings writes must include `audit_reason` when changing a credential,
  verification callback, subscription entitlement, or report recipient scope.

### 4.2 Domain-Specific Storage

Backend uses a `system_settings` table as the generic store. This is the
**canonical table name** — not `system_configs`. Historical designs and
archive docs may refer to `system_configs`, but all new implementation and
future Cursor agents must use `system_settings`. A DB migration or
`EnsureSchema` call should create or verify `system_settings`; any old
`system_configs` table in the codebase or migration history should be treated
as superseded.

The API contract must remain stable regardless of storage table.

Recommended durable fields:

| Field | Purpose |
| --- | --- |
| `section` | Stable setting section, e.g. `geoip.maxmind`, `notifications.telegram` |
| `config_version` | Monotonic version for rollback/audit |
| `public_config` | Non-secret JSON visible to Admin |
| `secret_refs` | Secret reference names or encrypted secret metadata, not raw values |
| `status` | `missing`, `configured`, `verify_pending`, `verified`, `failed`, `disabled` |
| `last_verified_at` | Last successful provider verification |
| `last_error_code` | Redacted error code |
| `created_by` / `updated_by` | Admin actor IDs |
| `created_at` / `updated_at` | Audit timestamps |

GeoIP credentials may remain in `geoip_credentials`; notification providers may
use provider-specific tables. The System Settings API aggregates safe summaries.

## 5. Settings Sections

### 5.1 GeoIP Settings

Required settings:

| Setting | Purpose |
| --- | --- |
| Source credential status | DB-IP, MaxMind, IP2Location, Hackl0us source credential configured/verified status |
| Credential encryption key status | Whether `GEOIP_CREDENTIAL_ENCRYPTION_KEY` or equivalent secret reference is configured |
| Manifest signing status | Active signing key reference, key version, last signature verification |
| Update defaults | Default source, editions, schedule template, rate-limit defaults |

Required actions:

- Verify one source credential through `geoip_source_verify`.
- Rotate one source credential through a credential-specific write API plus
  optional `geoip_credential_rotate` job.
- Run or schedule `geoip_source_update`.
- Re-sign manifests through `geoip_manifest_sign`.

### 5.2 Notification Provider Settings

Required providers:

| Provider | Required Safe Fields |
| --- | --- |
| Telegram | bot username, webhook URL, callback status, secret hint, rate limit, enabled |
| WhatsApp | business account ID, phone number ID, webhook status, secret hint, rate limit, enabled |
| Lark | app ID, tenant allowlist, callback URL, secret hint, rate limit, enabled |
| Email | sender identity, provider name, domain verification status, secret hint, enabled |
| Push | placeholder provider, environment, credential hint, enabled |

Provider verification must run through Job Service. A provider is usable for
formal delivery only after callback/follow/OTP verification succeeds. User
contact channels remain `provider_follow_required`, `callback_pending`, or
`verification_failed` until the provider confirms user consent.

### 5.3 Report Templates

Default templates:

| Template Key | Default Audience | Purpose |
| --- | --- | --- |
| `system_daily_report` | admins / ops | System health, errors, queue depth, degraded services |
| `operations_daily_report` | ops / support | User growth, notification delivery, content, campaigns |
| `sre_daily_report` | ops | Node health, Backend health, Job failures, SLO signals |
| `sponsor_ambassador_report` | sponsor managers | Sponsor node contribution and settlement summary |
| `promotion_ambassador_report` | growth managers | Referral, conversion, reward, and churn summary |
| `billing_reconciliation_report` | finance | Payment orders, failed webhooks, refunds, reconciliation |
| `security_daily_report` | security / admin | Login anomalies, permission changes, secret verify failures |

Template fields:

```json
{
  "template_key": "system_daily_report",
  "locale": "zh-CN",
  "enabled": true,
  "channel_defaults": ["telegram", "lark", "email"],
  "subject_template": "LiveMask 系统日报 {{date}}",
  "body_template": "markdown or provider-safe rich text",
  "variables": ["date", "job_failed_count", "node_degraded_count"],
  "version": 3,
  "updated_by": "uuid",
  "updated_at": "2026-05-19T08:00:00Z"
}
```

Rules:

- Templates must support `zh-CN` and `en-US`.
- Admin may preview templates with synthetic safe data.
- Run now and schedule actions must create `notification_report_dispatch` jobs.
- Template rendering must reject raw HTML/script and unknown unsafe variables.

### 5.4 Subscription Settings

Required settings:

| Setting | Purpose |
| --- | --- |
| Plan defaults | Plan name, billing interval, quotas, device limits, traffic limits |
| Entitlement policy | Grace period, renewal window, downgrade behavior, expired-account access |
| Reminder policy | Renewal reminder schedule, failed payment reminders, quiet hours |
| Ambassador policy | Sponsor/promotion report inclusion and settlement reminder defaults |
| Reconciliation policy | Payment provider reconciliation schedule and retry defaults |

Subscription settings must be versioned and auditable. Changes that affect
active users should support preview/dry-run and must link to a Job run if a
backfill or reconciliation is required.

### 5.5 App Observability / Sentry Settings

The App gets Sentry runtime configuration from Backend, but only the
client-safe subset may leave Backend. Admin System Settings may store both
public client fields and write-only server-side Sentry integration secrets.

Required safe fields:

| Setting | Purpose |
| --- | --- |
| `app_sentry_enabled` | Enable/disable App Sentry initialization |
| `public_dsn` | Sentry client DSN returned to App; considered public client config |
| `environment` | `local`, `staging`, `production`, or configured environment name |
| `release_prefix` | Release naming prefix, e.g. `livemask-app` |
| `traces_sample_rate` | Client trace sampling rate, bounded by Backend validation |
| `profiles_sample_rate` | Client profile sampling rate, default `0` unless explicitly enabled |
| `max_breadcrumbs` | Upper bound for App breadcrumbs |
| `allowed_tags` | Low-cardinality tag allowlist |
| `before_send_required` | Must remain true in production |

Write-only / secret fields:

| Secret | Usage | Exposure Rule |
| --- | --- | --- |
| Sentry auth token | Backend scheduled issue sync | Store as secret ref or encrypted value; never return to Admin or App |
| Webhook signing secret | Verify Sentry webhook callbacks | Return only `secret_hint` |
| Relay secret / DSN tunnel secret | Optional future relay/tunnel | Never return to App unless explicitly redesigned as public relay config |
| Project/org token | Server-to-server management API | Never return to App |

App-facing API:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/v1/app/observability/config` | Return only safe App Sentry client config |

Rules:

- Admin may see `public_dsn` because Sentry client DSNs are not treated as
  write-capable secrets, but Admin UI should still mask it by default and offer
  copy only to users with `settings:read`.
- Backend must never include Sentry auth tokens, webhook secrets, relay
  secrets, project tokens, org tokens, private keys, cookies, or Authorization
  headers in the App config response.
- If Sentry is disabled, not configured, or unavailable, the App config API
  returns `"enabled": false` and no DSN. App must continue normal startup.
- Changes to sampling or DSN require audit logs and should be reflected in
  `system`/`security` logs without writing raw secret values.

### 5.6 App Runtime Governance Settings

App runtime governance is the formal replacement for the old
`vpn_client_governance` design. It controls safe App-side resource and
connection behavior, not observability credentials.

Required settings:

| Setting | Purpose |
| --- | --- |
| `enabled` | Enable/disable runtime governance |
| `resource_limits.max_memory_mb` | Platform memory guardrail |
| `resource_limits.max_concurrent_connections` | Native tunnel/session concurrency guardrail |
| `resource_limits.buffer_size_kb` | Buffer sizing hint |
| `resource_limits.enable_memory_pressure_mode` | Enable defensive behavior when native runtime is under memory pressure |
| `behavior.health_check_interval_ms` | Health-check interval |
| `behavior.reconnect_initial_backoff_ms` | Reconnect initial backoff |
| `behavior.reconnect_max_backoff_ms` | Reconnect max backoff |
| `behavior.circuit_breaker_failure_threshold` | Circuit breaker threshold |
| `behavior.protocol_fallback_enabled` | Whether App may fallback to compatible protocol/profile |
| `behavior.aggressive_reconnect_on_poor_network` | Conservative default should be false |
| `performance.startup_config_timeout_ms` | Non-blocking startup config timeout |
| `performance.api_timeout_ms` | App API request timeout hint |
| `performance.content_cache_ttl_seconds` | Content cache TTL |
| `performance.geoip_cache_ttl_seconds` | GeoIP cache TTL |
| `performance.max_local_event_queue_size` | Local queue guardrail |
| `platform_overrides` | Platform-specific overrides for iOS/Android/macOS/Windows/Linux/Web |

Rules:

- This section must contain no secrets.
- Admin must support preview by platform/version/channel before publish.
- Publish creates a monotonic `config_version` and `config_hash`.
- Rollback publishes a new version from a previous version; it must not rewind
  the version counter.
- iOS defaults must be conservative because NetworkExtension memory pressure can
  terminate the tunnel.
- Web must never claim system VPN runtime support.
- Backend App API is `GET /api/v1/app/runtime-config`; App must use LKG when
  the API is unavailable.

## 6. Backend Admin API Contract

All endpoints require Admin JWT audience.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| GET | `/admin/api/v1/system-settings` | `settings:read` | List setting sections and safe summaries |
| GET | `/admin/api/v1/system-settings/{section}` | `settings:read` | Read one section safe config |
| PUT | `/admin/api/v1/system-settings/{section}` | `settings:write` + owner permission | Update non-secret fields and optional write-only secrets |
| POST | `/admin/api/v1/system-settings/{section}/verify` | `settings:verify` + owner permission | Create provider/source verify Job run |
| POST | `/admin/api/v1/system-settings/{section}/rotate` | `settings:write` + owner permission | Rotate or replace one credential/secret reference |
| GET | `/admin/api/v1/report-templates` | `settings:read` | List report templates |
| GET | `/admin/api/v1/report-templates/{template_key}` | `settings:read` | Read one report template |
| PUT | `/admin/api/v1/report-templates/{template_key}` | `settings:write` | Update a report template |
| POST | `/admin/api/v1/report-templates/{template_key}/preview` | `settings:read` | Render safe preview data |
| POST | `/admin/api/v1/report-templates/{template_key}/run` | `jobs:execute` + `settings:read` | Create `notification_report_dispatch` run |
| GET | `/admin/api/v1/subscription-settings` | `settings:read` or `payment:read` | Read subscription config |
| PUT | `/admin/api/v1/subscription-settings` | `settings:write` + `payment:write` | Update subscription config |
| GET | `/api/v1/app/observability/config` | app public context | Return safe App Sentry client config |
| GET | `/api/v1/app/runtime-config` | app public context | Return safe App runtime governance config |
| POST | `/admin/api/v1/system-settings/app-runtime/preview` | `settings:read` | Resolve effective runtime governance config |
| POST | `/admin/api/v1/system-settings/app-runtime/publish` | `settings:write` | Publish new runtime governance config version |
| POST | `/admin/api/v1/system-settings/app-runtime/rollback` | `settings:write` | Publish rollback runtime governance version |

Owner-domain permission examples:

- GeoIP settings write requires `settings:write` and `geoip:write`.
- Notification provider write requires `settings:write` and
  `notifications:write`.
- Subscription settings write requires `settings:write` and `payment:write`.
- App observability settings write requires `settings:write` and
  `metrics:write` or the Observability owner permission if introduced.
- App runtime governance write requires `settings:write` and the App Config
  owner permission if introduced.
- Report dispatch run requires `jobs:execute` and `notifications:write` or the
  report-owner permission.

## 7. RBAC

| Permission | Meaning | Suggested Roles |
| --- | --- | --- |
| `settings:read` | View safe system setting summaries | auditor, ops_operator, admin, super_admin |
| `settings:write` | Update settings and write-only secrets | admin, super_admin |
| `settings:verify` | Trigger setting/provider verification jobs | ops_operator, admin, super_admin |
| `notifications:read` | View notification providers, templates, delivery logs | support_agent, ops_operator, auditor, admin |
| `notifications:write` | Update providers/templates and send test/invite jobs | ops_operator, admin, super_admin |
| `notifications:execute` | Run notification dispatch/report jobs | ops_operator, admin, super_admin |
| `metrics:read` | View observability and App/Sentry safe summaries | auditor, ops_operator, admin, super_admin |
| `metrics:write` | Update App observability sampling/client config | admin, super_admin |

Backend is the security boundary. Admin-side permission hiding improves UX but
must never replace Backend checks.

## 8. Audit And Logs

Every mutation must write audit logs:

| Action | Required Audit Fields |
| --- | --- |
| Update setting | actor, section, changed non-secret fields, secret_changed boolean, audit_reason |
| Verify setting | actor, section, run_id, provider/source, scrubbed parameters |
| Rotate credential | actor, section, old secret hint, new secret hint, run_id if async |
| Update report template | actor, template_key, locale, version, changed fields |
| Run report now | actor, template_key, run_id, target scope summary |
| Update subscription config | actor, version, changed fields, dry_run/backfill run_id if any |
| Update App Sentry config | actor, environment, release_channel, changed safe fields, secret_changed boolean |
| Publish App runtime governance | actor, config_version, config_hash, changed fields, preview target summary |
| Rollback App runtime governance | actor, source_version, new_config_version, reason |

Logs/events must follow the Log / Audit / Metric Pipeline Contract. They must
not contain raw secrets, raw contact identifiers, signed URL queries, local
filesystem paths, provider raw response bodies, or full Sentry context.

## 9. Admin UI Requirements

`livemask-admin` must implement:

- `/admin/settings` as one System group entry.
- Section tabs or subroutes for GeoIP, Notifications, Reports, Subscriptions,
  Payments, App Releases, Observability, App Runtime, and Scheduler.
- Chinese default UI with English fallback.
- Secret inputs are always blank; use placeholder text such as "保持现有密钥".
- `secret_hint`, verify status, last verified time, and last run link are shown.
- `Verify`, `Rotate`, `Run now`, `Schedule`, `Disable`, and `Delete` actions
  require confirmations when they affect production behavior.
- Report templates support edit, preview, run now, and create schedule.
- Subscription settings support preview/dry-run before applying broad changes.
- App Runtime settings support platform preview, publish, and rollback with
  clear warnings for iOS memory/reconnect changes.
- Every async action shows `run_id` and links to `/admin/jobs/runs/{run_id}`.
- Mock mode may provide read-only demo summaries; mutations must fail loudly or
  clearly show mock-only behavior.

## 10. Job Service Integration

Settings actions that are slow, external-provider dependent, fan-out, scheduled,
or retryable must create Job Service runs.

Required job types:

| Job Type | Purpose |
| --- | --- |
| `geoip_source_verify` | Verify GeoIP source credential connectivity |
| `geoip_credential_rotate` | Validate and activate a new GeoIP credential reference |
| `notification_provider_verify` | Verify Telegram/WhatsApp/Lark/email provider callback/auth |
| `notification_bot_invite` | Send user IM binding invite |
| `notification_dispatch_single` | Send one transactional notification |
| `notification_dispatch_campaign` | Send campaign/broadcast with rate limits |
| `notification_report_dispatch` | Render and send scheduled reports/briefings |
| `subscription_expiration_sweep` | Expire subscriptions and emit notifications |
| `subscription_entitlement_reconcile` | Rebuild entitlement state after config changes |
| `billing_reconciliation` | Reconcile payment provider state |
| `system_secret_verify` | Verify secret references without exposing raw secret values |

## 11. CI/CD Smoke Requirements

`livemask-ci-cd` must cover:

| Step | Expected |
| --- | --- |
| Admin login | 200 |
| Low-permission user reads settings | 403 or safe read-only according to role |
| List system settings | 200 and no raw secrets |
| Update notification provider with write-only secret | 200/202 and response contains only `secret_hint` |
| Verify notification provider | 202 + run_id |
| Update report template | 200 and version increments |
| Preview report template | 200 with rendered safe sample |
| Schedule report dispatch | 201 schedule_id |
| Edit report schedule | 200 and `updated_at` changes |
| Delete report schedule | 200/204 and no future run |
| Update subscription settings dry-run | 200 preview |
| Apply subscription settings | 200/202 and audit exists |
| Secret leak scan | No `bot_token`, `api_key`, `license_key`, `hmac`, `private_key`, `node_secret`, raw contact ID, or signed URL query |

## 12. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-DOC-ADMIN-SYSTEM-SETTINGS-001` | `livemask-docs` | This contract and Cursor handoff |
| `TASK-BACKEND-SYSTEM-SETTINGS-001` | `livemask-backend` | Admin settings APIs, RBAC, audit, safe aggregation of domain settings |
| `TASK-BACKEND-NOTIFICATION-SETTINGS-001` | `livemask-backend` | Telegram/WhatsApp/Lark/email provider settings and verify actions |
| `TASK-BACKEND-SUBSCRIPTION-SETTINGS-001` | `livemask-backend` | Subscription config API, versioning, dry-run/backfill hooks |
| `TASK-JOBS-SCHEDULER-CRUD-001` | `livemask-job-service` | Durable schedule CRUD, evaluator, misfire policy, edit/delete semantics |
| `TASK-JOBS-NOTIFICATION-SCHEDULES-001` | `livemask-job-service` | Notification provider verify, report dispatch, retry/dead-letter jobs |
| `TASK-ADMIN-SYSTEM-SETTINGS-001` | `livemask-admin` | `/admin/settings` sections and safe secret UX |
| `TASK-ADMIN-JOBS-SCHEDULE-CRUD-001` | `livemask-admin` | `/admin/jobs/schedules` create/edit/delete UI |
| `TASK-CICD-SYSTEM-SETTINGS-SCHEDULER-001` | `livemask-ci-cd` | Settings + schedule CRUD smoke and secret leak scan |

## 13. Done Criteria

- `/admin/settings` exists and routes are grouped under System navigation.
- GeoIP credentials, IM providers, report templates, and subscription config
  have safe read/write APIs.
- Admin never receives raw secrets and never pre-fills secret inputs.
- Provider/source verification creates Job runs and links to run detail.
- Report templates can be edited, previewed, run immediately, and scheduled.
- Schedule CRUD supports create, edit, enable, disable, delete, preview, and
  run-now without direct Admin-to-Job-Service calls.
- Backend writes audit logs for every settings/schedule mutation.
- Job Service owns durable schedules and never stores raw provider secrets.
- CI smoke proves RBAC, schedule CRUD, settings redaction, and secret leak checks.
