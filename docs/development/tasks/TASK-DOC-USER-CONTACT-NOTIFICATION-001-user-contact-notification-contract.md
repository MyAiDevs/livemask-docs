# TASK-DOC-USER-CONTACT-NOTIFICATION-001 — User Contact & Notification Contract

> Status: Ready
> Repo: `livemask-docs`
> Branch: `dev`
> Owner: Product / Docs
> Related Contract: `docs/contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md`

## 1. Background

User contact information must support Telegram,
WhatsApp, Lark, and future channels without scattering random fields across
the `users` model or implementing provider dispatch synchronously in Backend
HTTP handlers.

The product needs this data for bot-assisted IM binding, activities,
announcements, security notices, billing notices, node/protocol events, and
special operational events. The contract must define the shared model before
Backend, Admin, Job Service, App, or Website implement divergent fields.

## 2. Goal

Define the cross-repository contract for user IM contact channels, notification
preferences, bot invite flows, queued notification dispatch, delivery logs,
Admin user-detail UX, RBAC, privacy, and CI/CD smoke validation.

## 3. Scope

In scope:

- `user_contact_channels` model
- `user_notification_preferences` model
- `im_binding_invites` model
- `notification_delivery_logs` model
- `notification_provider_configs` model
- `notification_report_templates` model
- Backend Admin API contract
- provider callback API contract
- future App/Website user preference API contract
- Job Service notification job types
- default report template definitions
- Admin user detail page requirements
- Admin System Settings / Notification Provider requirements
- RBAC permissions
- privacy/redaction rules
- CI/CD smoke matrix

Out of scope:

- Actual provider integration implementation
- App push-token implementation
- Website account settings implementation
- Marketing campaign builder UI

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Owns schema, Admin APIs, provider settings, callbacks, preference APIs, RBAC, audit, redaction, delivery logs |
| `livemask-job-service` | Owns async notification jobs, provider verify, report dispatch, provider retry/backoff, dead-letter, rate limits |
| `livemask-admin` | Extends user detail and System Settings with Contact Channels, Notification Preferences, Provider Settings, Bot Invites, Report Templates, Delivery Logs |
| `livemask-app` | Future self-service preferences, push token/channel registration |
| `livemask-website` | Future account settings for notification preferences |
| `livemask-ci-cd` | Smoke coverage for RBAC, invites, delivery logs, job runs, secret leakage |
| `livemask-docs` | Contract source of truth and task chain |

## 5. Required Contract File

- `docs/contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md`

## 6. Cross-Repo Follow-Up Tasks

| Task | Repo | Status | Purpose |
| --- | --- | --- | --- |
| `TASK-BACKEND-USER-CONTACT-001` | `livemask-backend` | Ready after docs | DB schema, Admin APIs, provider settings, callbacks, preference APIs, bot invite API, report templates, audit, delivery logs |
| `TASK-JOBS-NOTIFICATION-001` | `livemask-job-service` | Ready after Backend contract | `notification_bot_invite`, `notification_dispatch_single`, provider verify, report dispatch, campaign dispatch, retry/dead-letter |
| `TASK-ADMIN-USER-CONTACT-001` | `livemask-admin` | Ready after Backend API | User detail Contact Channels, Notification Preferences, Provider Settings, Report Templates, Bot Invites, Delivery Logs |
| `TASK-CICD-NOTIFICATION-001` | `livemask-ci-cd` | Ready after Backend/Admin/Jobs | Smoke for RBAC, invite, job run, delivery logs, secret leak |
| `TASK-APP-NOTIFICATION-PREFERENCES-001` | `livemask-app` | Future | User-facing preferences and push channel |
| `TASK-WEBSITE-ACCOUNT-NOTIFICATION-001` | `livemask-website` | Future | Website account settings for preferences |

## 7. Acceptance Criteria

- Contract covers all required data models and statuses.
- Contract distinguishes contact channels from notification preferences.
- Contract requires Telegram/WhatsApp/Lark follow/callback verification before
  dispatch.
- Contract defines provider bot/app system settings and callback boundary.
- Contract defines default scheduled report templates.
- Bot invite flow is queued through Job Service.
- Admin UI requirements are explicit for `/admin/users/{user_id}`.
- RBAC includes `user:contact:*` and `notifications:*` permissions.
- Security rules require masking, encryption/protection, redaction, audit, and
  invite rate limiting.
- CI/CD smoke checklist exists.
- Docs indexes link to the contract and follow-up tasks.

## 8. Validation

Run:

```bash
bash scripts/check-docs.sh
```

## 9. Completion Report Requirements

Completion report must include:

- new/updated docs
- contract summary
- follow-up tasks
- docs check result
- local dev runtime status
- whether temporary smoke environment was created
