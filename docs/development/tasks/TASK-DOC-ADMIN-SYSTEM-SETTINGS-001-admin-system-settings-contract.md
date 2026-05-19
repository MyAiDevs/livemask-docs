# TASK-DOC-ADMIN-SYSTEM-SETTINGS-001 - Admin System Settings And Scheduler CRUD Contract

## 1. Background

| Field | Value |
| --- | --- |
| Task ID | `TASK-DOC-ADMIN-SYSTEM-SETTINGS-001` |
| Owner | Docs / Product / Backend / Admin / Job Service / CI-CD |
| Primary Repo | `livemask-docs` |
| Status | Ready |
| Environment | dev-local |

Admin currently needs editable schedules and a unified system settings surface.
GeoIP credentials, IM provider credentials, report templates, subscription
rules, App Sentry runtime config, App Runtime Governance config, and scheduled
push/report jobs cannot remain scattered across feature pages. This task
defines the docs-first contract and multi-window handoff before Backend, Job
Service, Admin, and CI/CD implementation begins.

## 2. Scope

Define the cross-repo contract for:

- `/admin/settings` system settings center
- GeoIP credential and key status
- IM provider credentials for Telegram, WhatsApp, Lark, email, and push
- Report/briefing templates
- Subscription configuration
- App Sentry public client DSN/config and write-only server integration secrets
- App Runtime Governance performance/resource/reconnect config
- Job schedule create/edit/delete/preview/run-now
- RBAC, audit, secret redaction, CI smoke, and Cursor multi-window handoff

## 3. Contract Outputs

- [Admin System Settings Contract](../../contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md)
- [Admin Job Center / Scheduler Contract](../../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [Admin / System Settings / Scheduler Cursor Handoff](../cursor-handoffs/ADMIN-SYSTEM-SETTINGS-SCHEDULER-CURSOR_HANDOFF.md)

## 4. Cross-Repo Impact

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-SYSTEM-SETTINGS-001` | `livemask-backend` | System settings APIs, RBAC, audit, secret redaction |
| `TASK-BACKEND-JOBS-SCHEDULE-CRUD-001` | `livemask-backend` | Schedule CRUD gateway to Job Service |
| `TASK-BACKEND-NOTIFICATION-SETTINGS-001` | `livemask-backend` | Telegram/WhatsApp/Lark/email provider settings |
| `TASK-BACKEND-SUBSCRIPTION-SETTINGS-001` | `livemask-backend` | Subscription config, versioning, dry-run/backfill |
| `TASK-BACKEND-APP-SENTRY-CONFIG-001` | `livemask-backend` | App Sentry settings storage and safe `/api/v1/app/observability/config` response |
| `TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001` | `livemask-backend` | App runtime governance config storage, validation, App API |
| `TASK-JOBS-SCHEDULER-CRUD-001` | `livemask-job-service` | Durable schedule CRUD, evaluator, misfire policy |
| `TASK-JOBS-NOTIFICATION-SCHEDULES-001` | `livemask-job-service` | Provider verify, invite, campaign, report dispatch jobs |
| `TASK-ADMIN-SYSTEM-SETTINGS-001` | `livemask-admin` | `/admin/settings` UI |
| `TASK-ADMIN-SENTRY-SETTINGS-001` | `livemask-admin` | `/admin/settings/observability` App Sentry client config and secret hint UI |
| `TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001` | `livemask-admin` | `/admin/settings/app-runtime` runtime governance preview/publish/rollback UI |
| `TASK-ADMIN-JOBS-SCHEDULE-CRUD-001` | `livemask-admin` | `/admin/jobs/schedules` editor and actions |
| `TASK-CICD-SYSTEM-SETTINGS-SCHEDULER-001` | `livemask-ci-cd` | Settings and scheduler smoke |
| `TASK-CICD-SENTRY-CONFIG-SMOKE-001` | `livemask-ci-cd` | App Sentry config API enabled/disabled and secret-leak smoke |

## 5. Validation

Docs validation:

- `bash scripts/check-docs.sh`
- `git diff --check`

Implementation validation will be added by the repo-specific tasks above.
