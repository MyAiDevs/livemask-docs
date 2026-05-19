# Admin System Settings / Scheduler CRUD Cursor Handoff

> Task group: `TASK-DOC-ADMIN-SYSTEM-SETTINGS-001`
> Scope: Multi-repo implementation handoff for System Settings, Schedule CRUD,
> notification/report schedules, subscription settings, App Sentry client
> config, App Runtime Governance, and secret-safe Admin UX.

## 0. Mandatory Reading For Every Cursor Window

Read before editing code:

1. `docs/contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md`
2. `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`
3. `docs/contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md`
4. `docs/contracts/geoip/GEOIP_CREDENTIAL_MANAGEMENT_CONTRACT.md`
5. `docs/contracts/admin/ADMIN_NAVIGATION_IA_CONTRACT.md`
6. `docs/contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md`
7. `docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md`
8. `ai-rules/v3.7/00-Core-Principles.md`
9. `ai-rules/v3.7/04-Multi-Repo-Linkage.md`
10. `ai-rules/v3.7/13-Multi-Repo-Development.md`
11. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- Current branch must be `dev` or a task branch from `dev`.
- Every code change must reference the current `TASK-XXXX`.
- Do not implement another repo's code in the current window.
- Admin never calls Job Service directly.
- Backend never returns raw secrets.
- App-facing Sentry config may return only public client DSN and non-secret
  sampling/config fields. Sentry auth token, webhook secret, relay secret,
  project/org token and private keys never leave Backend.
- App Runtime Governance must contain no secrets and must not be mixed with
  Sentry config. It controls memory/reconnect/cache/platform behavior only.
- Job Service never validates Admin JWT and never stores raw provider secrets.
- App raw logs/exceptions stay in Sentry; this task does not add raw App log upload.
- Do not stop the long-lived local dev runtime. Use targeted service recreate only when needed.

## 1. Backend Window

Repository: `livemask-backend`
Primary tasks:

- `TASK-BACKEND-SYSTEM-SETTINGS-001`
- `TASK-BACKEND-JOBS-SCHEDULE-CRUD-001`
- `TASK-BACKEND-NOTIFICATION-SETTINGS-001`
- `TASK-BACKEND-SUBSCRIPTION-SETTINGS-001`
- `TASK-BACKEND-APP-SENTRY-CONFIG-001`
- `TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001`

### 1.1 Implement System Settings Gateway

Add Admin APIs:

| Method | Path |
| --- | --- |
| GET | `/admin/api/v1/system-settings` |
| GET | `/admin/api/v1/system-settings/{section}` |
| PUT | `/admin/api/v1/system-settings/{section}` |
| POST | `/admin/api/v1/system-settings/{section}/verify` |
| POST | `/admin/api/v1/system-settings/{section}/rotate` |

Required sections:

- `geoip`
- `notifications.telegram`
- `notifications.whatsapp`
- `notifications.lark`
- `notifications.email`
- `notifications.push`
- `reports`
- `subscriptions`
- `payments`
- `observability`
- `app-runtime`
- `scheduler`

Implementation rules:

- Use existing `net/http` handler patterns and auth/RBAC helpers.
- Add RBAC permissions: `settings:read`, `settings:write`,
  `settings:verify`, `notifications:read`, `notifications:write`,
  `notifications:execute`.
- Keep domain ownership. GeoIP secrets stay in GeoIP credential store; notification
  secrets stay in notification provider store; subscription config stays in
  billing/subscription domain.
- Aggregate safe summaries for Admin:
  `configured`, `status`, `secret_hint`, `last_verified_at`,
  `last_verified_run_id`, `updated_by`, `updated_at`.
- Empty secret input means "keep existing secret"; require explicit
  `clear_secret=true` to clear.
- All secret values are write-only. Never return raw token/key/secret values.
- Write audit logs for every mutation and every verify/rotate job creation.

### 1.1.1 App Sentry Client Config

Implement:

- System setting section: `observability.sentry_app`.
- Admin-safe fields:
  `enabled`, `public_dsn`, `environment`, `release_prefix`,
  `traces_sample_rate`, `profiles_sample_rate`, `max_breadcrumbs`,
  `allowed_tags`, `before_send_required`, `status`, `secret_hint`.
- Write-only server-side fields:
  Sentry auth token, webhook signing secret, relay secret, project/org token.
- App API: `GET /api/v1/app/observability/config`.

Rules:

- App API returns only safe client config. It must not include any write-only
  server-side Sentry secret.
- Missing or disabled config returns `enabled=false`, not an error that blocks
  App startup.
- Validate sampling rates and allowed tags server-side.
- Add tests for secret leakage, disabled config, per-environment config and
  redaction in audit/log entries.

### 1.1.2 App Runtime Governance

Implement:

- System setting section: `app.runtime_governance`.
- Admin APIs for read/update/preview/publish/rollback.
- App API: `GET /api/v1/app/runtime-config`.
- Version/hash response and platform-specific effective config resolution.
- Validation ranges from the App Runtime Governance contract.

Rules:

- No secret fields.
- iOS defaults must remain conservative.
- Web must not enable system VPN runtime behavior.
- Invalid config must be rejected before publish.
- Rollback creates a new config version, never rewinds the counter.

### 1.2 Implement Schedule CRUD Gateway

Backend must expose full Admin schedule CRUD and proxy to Job Service through
internal service auth:

| Method | Path |
| --- | --- |
| GET | `/admin/api/v1/jobs/schedules` |
| POST | `/admin/api/v1/jobs/schedules` |
| GET | `/admin/api/v1/jobs/schedules/{schedule_id}` |
| PUT | `/admin/api/v1/jobs/schedules/{schedule_id}` |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/preview` |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/run` |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/clone` |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/enable` |
| POST | `/admin/api/v1/jobs/schedules/{schedule_id}/disable` |
| DELETE | `/admin/api/v1/jobs/schedules/{schedule_id}` |

Backend validation:

- Require `jobs:read` for read/preview.
- Require `jobs:write` for create/update/clone/enable/disable/delete.
- Require `jobs:execute` for run-now.
- Enforce owner-domain permission based on `job_type`.
- Reject secret-looking parameter keys before forwarding.
- Preserve actor/audit context when calling Job Service.
- Return fast with `202 + run_id` for async run-now actions.

### 1.3 Notification Provider Settings

Implement safe provider config APIs or wire them behind System Settings:

- Telegram Bot
- WhatsApp Provider
- Lark Bot/App
- Email Provider
- Push placeholder

Verification must create `notification_provider_verify` Job runs. Provider
callback endpoints must verify signatures and must not mutate a contact channel
unless callback verification succeeds.

### 1.4 Subscription Settings

Implement subscription config read/update:

- Plan defaults
- Entitlement policy
- Grace period
- Renewal reminders
- Reconciliation defaults

Plan/entitlement changes that affect active users require dry-run preview and
must create `subscription_entitlement_reconcile` or
`subscription_expiration_sweep` jobs when backfill is needed.

### 1.5 Backend Validation

Run:

```bash
go test ./... -count=1
go vet ./...
go build ./...
git diff --check
```

Completion report must include changed files, API list, RBAC list, audit list,
and unlocked Admin/Job Service/CI tasks.

## 2. Job Service Window

Repository: `livemask-job-service`
Primary tasks:

- `TASK-JOBS-SCHEDULER-CRUD-001`
- `TASK-JOBS-NOTIFICATION-SCHEDULES-001`
- `TASK-JOBS-SUBSCRIPTION-001`

### 2.1 Durable Schedule CRUD

Implement DB-backed schedules:

- Create schedule
- Update schedule
- Clone schedule
- Enable/disable schedule
- Delete future schedule execution
- Preview next fire times and target summary
- Run schedule now
- Version history or audit-safe version increments

Required schedule fields:

- `schedule_id`
- `job_type`
- `name`
- `description`
- `enabled`
- `schedule_type`
- `timezone`
- `cron`
- `interval_seconds`
- `starts_at`
- `ends_at`
- `misfire_policy`
- `priority`
- `max_attempts`
- `concurrency_limit`
- `target_filter`
- `parameters`
- `quiet_hours`
- `next_run_at`
- `last_run_id`
- `last_run_status`
- `version`
- `created_by`
- `updated_by`
- timestamps

Scheduler behavior:

- `cron`, `interval`, and `once` are supported at storage level.
- If MVP UI only exposes hourly/daily presets, storage must still preserve the
  richer fields.
- Misfire policies: `skip`, `run_once`, `catch_up_limited`.
- Delete does not delete historical runs/events.
- Schedule evaluator must recover after restart and must not duplicate runs
  when multiple workers are active.

### 2.2 Notification And Report Jobs

Register and implement job definitions:

- `notification_provider_verify`
- `notification_bot_invite`
- `notification_dispatch_single`
- `notification_dispatch_campaign`
- `notification_retry_failed`
- `notification_preference_backfill`
- `notification_report_dispatch`

Rules:

- Use Backend domain executor APIs; do not call provider APIs with secrets stored
  in Job Service.
- Job parameters can reference `provider`, `template_key`, `campaign_id`,
  `recipient_scope`, or `user_id`; they must not contain raw provider secrets.
- Enforce provider rate limits and quiet hours.
- Record redacted events and dead-letter exhausted deliveries.

### 2.3 Subscription Jobs

Register and implement job definitions:

- `subscription_expiration_sweep`
- `subscription_entitlement_reconcile`
- `billing_reconciliation`

Rules:

- Jobs call Backend internal executor APIs.
- Use idempotency keys per date/plan/user scope.
- Record per-scope result summary and redacted failure events.

### 2.4 Job Service Validation

Run:

```bash
go test ./... -count=1
go vet ./...
go build ./cmd/job-service/
git diff --check
```

If sqlstore build tags exist, also run:

```bash
go build -tags sqlstore ./cmd/job-service/
```

## 3. Admin Window

Repository: `livemask-admin`
Primary tasks:

- `TASK-ADMIN-SYSTEM-SETTINGS-001`
- `TASK-ADMIN-JOBS-SCHEDULE-CRUD-001`
- `TASK-ADMIN-SENTRY-SETTINGS-001`
- `TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001`

### 3.1 System Settings UI

Implement `/admin/settings` under the System nav group.

Required sections:

- GeoIP
- Notifications
- Reports
- Subscriptions
- Payments
- Observability / Sentry
- App Runtime
- Scheduler

UI rules:

- Chinese default, English fallback.
- Dense operations UI, no marketing-style hero.
- Secret inputs are always blank and use copy such as "保持现有密钥".
- Never prefill token/key/secret values.
- Show `secret_hint`, `configured`, verify status, last verified time, last run link.
- `Verify`, `Rotate`, `Run now`, `Schedule`, `Disable`, `Delete` require
  confirmation where production behavior changes.
- Every async action displays `run_id` and links to `/admin/jobs/runs/{run_id}`.
- Mock mode can show read-only samples; mutations must not silently succeed.

Observability / Sentry section requirements:

- Show App Sentry enabled state, environment, release prefix, sample rates,
  `before_send_required`, and allowed tag list.
- Mask `public_dsn` by default even though it is client-public; allow copy for
  users with `settings:read`.
- Show only `secret_hint` for Sentry auth token and webhook secret.
- Never display raw auth token, webhook secret, relay secret, project/org token
  or private key.
- Provide verify/sync action only through Backend Job Gateway and show `run_id`.

App Runtime section requirements:

- Show defaults plus iOS, Android, macOS, Windows, Linux and Web overrides.
- Edit memory, connection, reconnect, circuit breaker, cache and queue limits.
- Preview effective config by platform/app version/release channel.
- Publish and rollback require confirmation and audit reason.
- No secret inputs or secret hints are needed because this config is secret-free.
- Warn on iOS memory/reconnect changes and Web VPN runtime limitations.

### 3.2 Report Templates UI

Implement:

- Template list
- Template edit
- Preview with safe sample data
- Run now through `notification_report_dispatch`
- Create schedule through Job Scheduler

Default template keys:

- `system_daily_report`
- `operations_daily_report`
- `sre_daily_report`
- `sponsor_ambassador_report`
- `promotion_ambassador_report`
- `billing_reconciliation_report`
- `security_daily_report`

### 3.3 Schedule CRUD UI

Implement `/admin/jobs/schedules`:

- Table filters: job type, owner domain, status, enabled, next run
- Create schedule drawer/page
- Edit schedule drawer/page
- Clone schedule
- Preview next fire times and target summary
- Run now
- Enable/disable
- Delete with confirmation
- Link to last run and run history

Schedule editor:

- Driven by Backend `parameter_schema`.
- Supports hourly, daily, weekly, monthly presets and custom cron/interval when
  Backend says allowed.
- Shows redacted parameters only.
- No secret fields in schedule forms.
- Supports notification/report jobs:
  `notification_report_dispatch`, `notification_dispatch_campaign`,
  `notification_retry_failed`.

### 3.4 Admin Validation

Run:

```bash
npm run build
git diff --check
```

Use browser/manual verification for:

- `/admin/settings`
- `/admin/jobs/schedules`
- Schedule create/edit/delete flows
- Secret fields not prefilled
- Chinese labels

## 4. CI/CD Window

Repository: `livemask-ci-cd`
Primary task:

- `TASK-CICD-SYSTEM-SETTINGS-SCHEDULER-001`

Add smoke coverage:

1. Admin login.
2. No token on settings API -> 401.
3. Low-permission token -> 403 for write.
4. List settings -> 200 and no raw secret leakage.
5. Update notification provider with write-only secret -> response has only
   `secret_hint`.
6. Verify notification provider -> `202 + run_id`.
7. Update report template -> version increments.
8. Preview report template -> rendered safe sample.
9. Create `notification_report_dispatch` schedule -> `schedule_id`.
10. Edit schedule -> version increments.
11. Preview schedule -> next fire times.
12. Run schedule now -> `202 + run_id`.
13. Disable schedule.
14. Delete schedule.
15. Invalid cron -> `JOB_SCHEDULE_INVALID`.
16. Secret leak scan across responses/events/logs.

Do not tear down the shared local dev runtime. Staging smoke must use isolated
compose project/network/volumes.

## 5. Multi-Window Sequencing

Recommended order:

1. Backend implements RBAC, safe settings gateway, and schedule CRUD gateway.
2. Job Service implements durable schedule CRUD and notification/report jobs.
3. Admin implements UI against Backend APIs.
4. CI/CD turns schedule/settings smoke from SKIP into PASS.

Parallelization:

- Backend system settings and Job Service schedule storage can start in parallel
  after reading the contracts.
- Admin can start read-only UI scaffolding once Backend response shapes are
  stable; mutations should wait for Backend gateway routes.
- CI/CD can write SKIP-safe smoke early, then harden to PASS after endpoints land.

## 6. Completion Report Requirements

Every window must report:

- `TASK ID`
- `Repository / Branch / Commit`
- Completed files and behavior
- Docs/contract impact
- Tests and validation commands
- Cross-repo impact and unlocked windows
- Blocked windows and exact blockers
- Risks / TODOs
- Next task recommendation

Do not mark another repo complete from the current repo's window.
