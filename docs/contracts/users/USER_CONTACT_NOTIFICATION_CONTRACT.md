# User Contact & Notification Preference Contract

> Task: `TASK-DOC-USER-CONTACT-NOTIFICATION-001`
> Owner: Product / Backend / Admin / Job Service / Support / Security / CI-CD
> Status: Ready
> Scope: Defines user profile extensions, IM contact channels, notification
> preferences, bot invite flows, delivery logs, and queued notification
> dispatch across LiveMask.

## 1. Why This Exists

LiveMask needs a durable way to contact users outside the App:

- invite a user to bind Telegram / WhatsApp / Lark
- let support/admin add an IM contact when the user provides it
- send product announcements, campaigns, release notes, billing alerts,
  security alerts, node incidents, protocol changes, GeoIP update notices,
  and special-event notifications
- record who initiated contact, which channel was used, whether delivery
  succeeded, and whether the user opted out

This must not be modeled as random columns on `users` such as
`telegram_id`, `whatsapp_id`, or `notify_marketing`. IM contact data and
delivery preferences are independent product capabilities and must be
auditable, extensible, and safe for queued dispatch.

## 2. Product Principles

1. **Contact channel is not just a string.**
   Every IM contact has type, identifier, display label, verification status,
   source, timestamps, and metadata.

2. **Verified contact is required for production dispatch.**
   Admin may store pending contacts, but marketing/security/billing/system
   notifications must not be sent to unverified contacts unless a task
   explicitly documents a support override.

3. **Preferences are separate from contact channels.**
   A user can have Telegram and Lark bound but choose only Lark for security
   alerts and disable marketing campaigns.

4. **Marketing must be opt-out capable.**
   Product announcements and campaigns must respect user preferences and
   regional compliance rules.

5. **Operational and security notifications are higher priority.**
   Security, billing, account, and connection incident notifications may
   default enabled, but must still be transparent in Admin and user-facing
   account settings when exposed.

6. **Bulk or external-provider delivery must use Job Service.**
   Backend creates intent and validates authority. Job Service handles queue,
   retry, backoff, rate limits, dead-letter, and delivery events.

7. **No secret or private IM identifier leakage.**
   Admin list views display masked identifiers. Full identifiers are visible
   only in narrowly authorized detail views and never in logs/job events.

## 3. Supported Channels

MVP supported channel types:

| Channel Type | Identifier | Verification | Notes |
| --- | --- | --- | --- |
| `telegram` | Telegram user id or username-bound id | Bot binding code or admin verified | Prefer numeric user id for dispatch. Username is display only when possible. |
| `whatsapp` | E.164 phone number | OTP, provider verification, or admin verified | Store masked display; avoid exposing full phone in list pages. |
| `lark` | Lark open_id / user_id + tenant key | Bot binding or admin verified | Tenant/app context must be in metadata, not in the identifier string. |
| `email` | Email address | existing email verification | Existing auth email may be represented as system channel. |
| `push` | App device push token group | App-managed | Future App task; not part of Admin manual contact MVP. |

Future channel types may include `discord`, `line`, `wechat`, `slack`, and
`sms`, but they must be added through this contract first.

## 4. Provider Bot / System Settings

IM channels require platform-side bot/app credentials before any user can be
verified or messaged. Backend must expose this as System Settings /
Notification Provider Settings, not as hardcoded constants and not as Admin
frontend secrets.

### 4.1 `notification_provider_configs`

```json
{
  "id": "uuid",
  "provider": "telegram",
  "display_name": "LiveMask Telegram Bot",
  "status": "enabled",
  "credential_type": "bot_token",
  "secret_hint": "****1234",
  "webhook_url": "https://api.livemask.example/api/v1/webhooks/notifications/telegram",
  "callback_secret_hint": "****abcd",
  "default_locale": "zh-CN",
  "rate_limit_per_minute": 25,
  "metadata": {
    "bot_username": "@LiveMaskBot",
    "lark_app_id": "cli_***",
    "whatsapp_business_account_id": "masked"
  },
  "last_verified_at": "2026-05-19T00:00:00Z",
  "last_verify_status": "ok",
  "created_at": "2026-05-19T00:00:00Z",
  "updated_at": "2026-05-19T00:00:00Z"
}
```

Required providers:

| Provider | Required Config | User Binding Requirement |
| --- | --- | --- |
| `telegram` | bot token, bot username, webhook secret | User must start/follow bot and submit invite code or deep-link payload. |
| `whatsapp` | business account/provider token, phone number id, webhook verify token | User must opt in or pass provider-recognized conversation/OTP verification. |
| `lark` | app id, app secret, verification token/encrypt key, tenant allowlist | User must install/follow bot or confirm binding through callback event. |
| `email` | provider key/domain/sender config | Existing verified email or double opt-in. |
| `push` | platform credentials | App token registration and user session binding. |

Rules:

- Secrets are stored encrypted or in a secret manager; Admin responses only
  expose `secret_hint`.
- Webhook/callback secrets are never returned to Admin, App, Website, logs,
  job params, or job events.
- Provider config mutation requires `notifications:write` and audit reason.
- Provider verify/test must run as a Job Service job when it touches external
  APIs or provider webhooks.
- A disabled provider makes all related contact channels non-dispatchable but
  must not delete user contact rows.

### 4.2 Provider Admin API

```http
GET /admin/api/v1/notification-providers
GET /admin/api/v1/notification-providers/{provider}
PUT /admin/api/v1/notification-providers/{provider}
POST /admin/api/v1/notification-providers/{provider}/verify
POST /admin/api/v1/notification-providers/{provider}/enable
POST /admin/api/v1/notification-providers/{provider}/disable
```

Permissions:

- GET: `notifications:read`
- PUT / verify / enable / disable: `notifications:write`

### 4.3 Provider Callback API

Provider callbacks are public ingress endpoints, but must authenticate using
provider-native signatures, verification tokens, callback secrets, or replay
protection.

```http
POST /api/v1/webhooks/notifications/telegram
POST /api/v1/webhooks/notifications/whatsapp
POST /api/v1/webhooks/notifications/lark
```

Callback behavior:

- Validate provider signature/secret before parsing user content.
- Match invite code, deep-link payload, provider user id, or OTP challenge.
- Create or update `user_contact_channels`.
- Move contact from `pending` to `verified` only after provider proof.
- Record `contact_channel_verified` or `im_invite_failed` event.
- Never log raw webhook payloads.

## 5. Data Model

### 5.1 `user_contact_channels`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "channel_type": "telegram",
  "channel_identifier": "encrypted-or-protected-value",
  "display_label": "@masked_or_human_label",
  "status": "invite_pending",
  "source": "bot_invited",
  "verified_at": null,
  "last_used_at": null,
  "last_delivery_status": null,
  "added_by_admin_id": "uuid-or-null",
  "metadata": {
    "telegram_username": "masked",
    "phone_country_code": "+65",
    "lark_tenant_key": "tenant-key",
    "bot_invite_id": "uuid"
  },
  "created_at": "2026-05-19T00:00:00Z",
  "updated_at": "2026-05-19T00:00:00Z",
  "deleted_at": null
}
```

Required fields:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | UUID. |
| `user_id` | yes | FK to user. |
| `channel_type` | yes | Enum. |
| `channel_identifier` | yes | Must be protected. Encrypted at rest where feasible. |
| `display_label` | yes | Safe display string; should be masked. |
| `status` | yes | `pending`, `invite_pending`, `provider_follow_required`, `callback_pending`, `verified`, `disabled`, `failed`, `removed`. |
| `source` | yes | `user_bound`, `admin_added`, `bot_invited`, `imported`, `system`. |
| `metadata` | no | JSONB, redacted before Admin/log exposure. |
| `verified_at` | no | Required when status becomes `verified`. |
| `last_used_at` | no | Updated after dispatch attempt. |
| `added_by_admin_id` | no | Required for `admin_added`. |

Status semantics:

| Status | Meaning | Dispatch Allowed |
| --- | --- | --- |
| `pending` | Contact captured but verification has not started | no, except explicit support test |
| `invite_pending` | Bot invite was created but not sent/accepted yet | no |
| `provider_follow_required` | User must follow/start/install provider bot before interaction is possible | no |
| `callback_pending` | Provider event/OTP was received and is waiting for validation/finalization | no |
| `verified` | Safe for dispatch according to source-specific verification | yes |
| `disabled` | User/admin disabled channel | no |
| `failed` | Last verification or delivery failed repeatedly | no by default |
| `removed` | Soft-deleted channel | no |

Channel verification state machine:

```text
admin_added / bot_invite_requested
  -> invite_pending
  -> provider_follow_required
  -> callback_pending
  -> verified
```

Failure paths:

- invite expired -> `failed` or invite status `expired`
- provider disabled -> contact remains stored but dispatch is blocked
- user blocked bot / opted out -> `disabled`
- callback signature invalid -> reject, do not mutate contact

### 5.2 `user_notification_preferences`

```json
{
  "user_id": "uuid",
  "product_announcements": true,
  "marketing_campaigns": false,
  "release_notes": true,
  "billing_alerts": true,
  "security_alerts": true,
  "connection_alerts": true,
  "node_incident_alerts": true,
  "protocol_change_alerts": true,
  "geoip_update_alerts": false,
  "job_result_alerts": false,
  "bot_invite_allowed": true,
  "preferred_channels": {
    "announcements": ["push", "telegram"],
    "marketing": ["email"],
    "security": ["email", "lark"],
    "billing": ["email", "whatsapp"],
    "incidents": ["telegram", "lark"]
  },
  "quiet_hours_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "08:00",
  "timezone": "Asia/Shanghai",
  "updated_at": "2026-05-19T00:00:00Z",
  "updated_by": "user-or-admin-id"
}
```

Preference categories:

| Category | Default | User Opt-out | Notes |
| --- | --- | --- | --- |
| `product_announcements` | on | yes | Release/product education. |
| `marketing_campaigns` | off or region-dependent | yes | Campaigns, sales, promotions. |
| `release_notes` | on | yes | Product updates. |
| `billing_alerts` | on | limited | Renewal, payment, device limit. |
| `security_alerts` | on | limited | Login, risk, account status. |
| `connection_alerts` | on | yes | Connection/degraded notices. |
| `node_incident_alerts` | on for affected users | yes | Node outage or routing change. |
| `protocol_change_alerts` | on | yes | Protocol/endpoint migration notice. |
| `geoip_update_alerts` | off | yes | Normally internal, optional for power users. |
| `job_result_alerts` | off | yes | Admin/operator-facing only. |
| `bot_invite_allowed` | on | yes | Admin cannot spam invite if disabled. |

### 5.3 `im_binding_invites`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "channel_type": "telegram",
  "invite_code_hash": "sha256:...",
  "status": "pending",
  "expires_at": "2026-05-20T00:00:00Z",
  "created_by_admin_id": "uuid",
  "accepted_contact_channel_id": null,
  "accepted_at": null,
  "created_at": "2026-05-19T00:00:00Z",
  "updated_at": "2026-05-19T00:00:00Z"
}
```

Status:

- `pending`
- `sent`
- `follow_required`
- `callback_received`
- `accepted`
- `expired`
- `cancelled`
- `failed`

Invite rules:

- Invite codes must be hashed at rest.
- Default TTL: 24 hours.
- Admin can cancel pending invites.
- Accepted invite creates or verifies a `user_contact_channels` row.
- Invite links/codes must not be stored in logs, job parameters, or job events.
- Telegram/WhatsApp/Lark invites are not complete until the provider callback
  proves the user followed/started/installed the official bot/app.

### 5.4 `notification_delivery_logs`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "contact_channel_id": "uuid",
  "channel_type": "telegram",
  "notification_type": "marketing_campaign",
  "template_key": "summer_sale_2026",
  "status": "delivered",
  "provider_message_id": "masked-or-null",
  "job_run_id": "uuid-or-null",
  "idempotency_key": "notification:user:template:channel",
  "error_code": null,
  "error_message": null,
  "sent_at": "2026-05-19T00:00:00Z",
  "delivered_at": "2026-05-19T00:00:01Z",
  "created_at": "2026-05-19T00:00:00Z"
}
```

Delivery status:

- `queued`
- `sent`
- `delivered`
- `failed`
- `skipped_preference`
- `skipped_unverified`
- `skipped_quiet_hours`
- `dead_lettered`

### 5.5 `notification_report_templates`

Backend must ship default scheduled report templates so operations can send
structured periodic summaries without inventing ad hoc message formats.

```json
{
  "template_key": "system_daily_report",
  "name": "System Daily Report",
  "category": "system_report",
  "default_locale": "zh-CN",
  "default_channels": ["telegram", "lark", "email"],
  "schedule_hint": "daily 09:00",
  "audience_role": "ops_operator",
  "enabled": true,
  "variables": [
    "date",
    "backend_health",
    "job_failed_count",
    "node_degraded_count"
  ]
}
```

Required default templates:

| Template Key | Category | Audience | Default Schedule | Required Content |
| --- | --- | --- | --- | --- |
| `system_daily_report` | `system_report` | Ops/Admin | daily | health, uptime, DB/Redis, queue depth, errors, degraded services |
| `operations_daily_report` | `operations_report` | Ops/Support | daily | new users, active users, tickets, failed notifications, support escalations |
| `sre_daily_report` | `sre_report` | Ops/SRE | daily | NodeAgent health, endpoint readiness, protocol errors, GeoIP/release status, incidents |
| `sponsor_daily_report` | `sponsor_report` | Sponsor ops | daily/weekly | sponsor nodes, traffic, rewards, SLA, pending approvals |
| `ambassador_daily_report` | `ambassador_report` | Growth ops | daily/weekly | signups, conversions, commissions, churn signals, campaign performance |
| `billing_daily_report` | `billing_report` | Finance/Ops | daily | payments, renewals, failed invoices, refunds, subscription expirations |
| `security_daily_report` | `security_report` | Security/Ops | daily | login anomalies, risk events, permission changes, secret rotation warnings |
| `job_daily_report` | `job_report` | Ops/Admin | daily | job run counts, failures, dead letters, long-running jobs, retry backlog |

Template rules:

- Templates must support `zh-CN` and `en-US`.
- Templates store variable names and safe rendering metadata, not secrets.
- Scheduled report delivery is a Job Service run, not a Backend request loop.
- Reports must include links to Admin pages where possible, but no signed URLs
  or raw provider payloads.
- User-level reports must respect notification preferences; operator reports
  are governed by RBAC and provider/channel availability.

## 6. Backend Admin API Contract

All endpoints require Admin audience JWT.

### 6.1 Get User Contact Summary

```http
GET /admin/api/v1/users/{user_id}/contacts
```

Permission: `user:read`

Response:

```json
{
  "channels": [],
  "preferences": {},
  "pending_invites": [],
  "delivery_summary": {
    "last_delivery_at": null,
    "last_failed_at": null,
    "failed_count_7d": 0
  }
}
```

### 6.2 Create Contact Channel

```http
POST /admin/api/v1/users/{user_id}/contacts
```

Permission: `user:write`

Request:

```json
{
  "channel_type": "telegram",
  "channel_identifier": "123456",
  "display_label": "@user",
  "source": "admin_added",
  "mark_verified": false,
  "reason": "User provided Telegram in support chat."
}
```

Rules:

- `reason` is required.
- `mark_verified=true` requires `user:contact:verify` or elevated admin role.
- Response must not echo raw `channel_identifier` unless caller has
  `user:contact:read_sensitive`.

### 6.3 Update / Disable / Remove Contact

```http
PATCH /admin/api/v1/users/{user_id}/contacts/{contact_id}
POST /admin/api/v1/users/{user_id}/contacts/{contact_id}/verify
POST /admin/api/v1/users/{user_id}/contacts/{contact_id}/disable
DELETE /admin/api/v1/users/{user_id}/contacts/{contact_id}
```

Permission:

- read: `user:read`
- write: `user:write`
- verify: `user:contact:verify`
- delete: `user:write`

Every mutation requires audit reason and writes audit log.

### 6.4 Notification Preferences

```http
GET /admin/api/v1/users/{user_id}/notification-preferences
PUT /admin/api/v1/users/{user_id}/notification-preferences
```

Permissions:

- GET: `user:read`
- PUT: `user:write`

Request must include full preference object or patch semantics must be
explicitly documented by Backend task.

### 6.5 Bot Invite

```http
POST /admin/api/v1/users/{user_id}/im-invites
GET /admin/api/v1/users/{user_id}/im-invites
POST /admin/api/v1/users/{user_id}/im-invites/{invite_id}/cancel
```

Permission: `user:write` + `notifications:execute`

Create request:

```json
{
  "channel_type": "telegram",
  "delivery_channel_id": "uuid-or-null",
  "message_template_key": "im_binding_invite_default",
  "expires_in_minutes": 1440,
  "reason": "Invite user to bind Telegram for incident notifications."
}
```

Backend behavior:

- Validate user exists and `bot_invite_allowed=true`.
- Validate provider config exists and is enabled.
- Create `im_binding_invites`.
- Create Job Service run `notification_bot_invite`.
- Return `202 Accepted` with `invite_id` and `run_id`.

### 6.6 Report Template API

```http
GET /admin/api/v1/notification-report-templates
GET /admin/api/v1/notification-report-templates/{template_key}
POST /admin/api/v1/notification-report-templates/{template_key}/preview
POST /admin/api/v1/notification-report-templates/{template_key}/run
```

Permissions:

- GET / preview: `notifications:read`
- run: `notifications:execute`
- create/update custom templates in future: `notifications:write`

`run` returns `202 + run_id` and must create `notification_report_dispatch`.

## 7. Public / User API Contract

Future App/Website account settings may expose:

```http
GET /api/v1/me/contact-channels
POST /api/v1/me/contact-channels
DELETE /api/v1/me/contact-channels/{contact_id}
GET /api/v1/me/notification-preferences
PUT /api/v1/me/notification-preferences
POST /api/v1/im-invites/{code}/accept
```

Rules:

- User APIs use user audience JWT or signed invite token.
- User can disable marketing and preferred channel settings.
- User cannot disable mandatory account-security notifications unless Product
  and Legal define that behavior.
- Public invite accept endpoint must rate limit and avoid user enumeration.

## 8. Job Service Contract

### 8.1 Job Types

Required job types:

| Job Type | Purpose | Queue Scope |
| --- | --- | --- |
| `notification_bot_invite` | Send IM binding invite to a user/channel | `user_id + channel_type + invite_id` |
| `notification_dispatch_single` | Send one notification to one user | `notification_id + user_id` |
| `notification_dispatch_campaign` | Fan out campaign/announcement to many users | `campaign_id + recipient_id` |
| `notification_retry_failed` | Retry failed delivery logs | `delivery_log_id` |
| `notification_preference_backfill` | Initialize preferences for existing users | `batch_id + user_id` |
| `notification_provider_verify` | Verify Telegram/WhatsApp/Lark provider config | `provider` |
| `notification_report_dispatch` | Render and send scheduled report templates | `template_key + audience + schedule_window` |

### 8.2 Backend Boundary

Job Service must not read raw user/contact tables directly unless the Backend
task explicitly creates a service-owned read model. Preferred MVP:

```text
Job Service run
  -> Backend internal executor API
     -> Backend resolves user preferences and verified channel
     -> Backend calls provider adapter or returns safe dispatch payload
     -> Job Service records run/events
     -> Backend stores delivery log
```

Alternative future model:

- Backend creates sanitized notification queue items.
- Job Service owns provider dispatch.
- Raw provider credentials remain in Backend secret boundary or dedicated
  secret manager, never in job run params/events.

### 8.3 Retry / Rate Limit

Required behavior:

- Exponential backoff with jitter.
- Provider-specific rate limit.
- Per-user debounce to prevent notification spam.
- Dead-letter after max attempts.
- Idempotency key required for every delivery.
- Job events must redact identifiers and provider payloads.

## 9. Notification Types

Canonical notification types:

| Type | Queue Required | Default Preference |
| --- | --- | --- |
| `product_announcement` | yes for batch | on |
| `marketing_campaign` | yes | off or region-dependent |
| `release_note` | yes for batch | on |
| `billing_alert` | outbox/job | on |
| `security_alert` | outbox/job | on |
| `connection_alert` | outbox/job | on |
| `node_incident_alert` | yes | on |
| `protocol_change_alert` | yes | on |
| `geoip_update_alert` | yes | off |
| `job_result_alert` | outbox/job | off |
| `growth_reward_realtime` | outbox/job for push/IM; login fetch is sync read | on |
| `growth_reward_daily_digest` | yes | on |
| `growth_settlement_status` | outbox/job | on |
| `im_binding_invite` | yes | controlled by `bot_invite_allowed` |
| `system_report` | yes | operator-facing |
| `operations_report` | yes | operator-facing |
| `sre_report` | yes | operator-facing |
| `sponsor_report` | yes | operator-facing |
| `ambassador_report` | yes | operator-facing |
| `billing_report` | yes | operator-facing |
| `security_report` | yes | operator-facing |
| `job_report` | yes | operator-facing |

## 10. Admin UI Contract

### 10.1 System Settings / Notification Providers

Admin must expose provider config under System Settings or Notification
Settings, not under individual users.

Required sections:

- Telegram Bot
- WhatsApp Provider
- Lark Bot/App
- Email Provider
- Push Provider future placeholder
- Report Templates

UI rules:

- Secret inputs are blank by default and never prefilled.
- Show provider status, last verification result, callback URL, secret hints,
  and bot username/app id where safe.
- `Verify Provider` queues `notification_provider_verify`.
- `Run Report` queues `notification_report_dispatch`.
- Provider disabled state must warn that existing verified contacts cannot be
  messaged through that provider.

### 10.2 User Detail Page

`/admin/users/{user_id}` must include:

1. **Profile**
   - display name
   - email
   - locale
   - timezone
   - country
   - platform summary
   - account status

2. **Contact Channels**
   - channel type
   - masked identifier / display label
   - status badge
   - source
   - verified at
   - last used
   - actions

3. **Notification Preferences**
   - grouped by Product / Account / Service / Operations
   - toggles for preference categories
   - preferred channel selectors
   - quiet hours and timezone
   - save button with audit reason

4. **Bot Invites**
   - send invite
   - show provider follow/start/install requirement
   - pending invites
   - cancel invite
   - copy-safe metadata only, never raw code

5. **Delivery Logs**
   - latest notification delivery status
   - filter by notification type/channel/status
   - link to global logs when available

### 10.3 Required Actions

| Action | Permission | Notes |
| --- | --- | --- |
| Add contact | `user:write` | Requires reason. |
| Verify contact | `user:contact:verify` | Requires reason. |
| Disable contact | `user:write` | Requires reason. |
| Remove contact | `user:write` | Soft delete; requires reason. |
| Send bot invite | `user:write` + `notifications:execute` | Returns `run_id`. |
| Save preferences | `user:write` | Requires audit reason if changed by admin. |
| Send test message | `notifications:execute` | Must queue job, not direct send. |
| Verify provider config | `notifications:write` | Queues provider verify job. |
| Run scheduled report template | `notifications:execute` | Queues report dispatch job. |

### 10.4 UX Requirements

- Chinese default, English fallback according to I18N contract.
- Mask identifiers in table views.
- Mark unverified channels clearly.
- Show preference-disabled warnings before sending invite/test.
- Mutations show run status or link to `/admin/jobs/runs/{run_id}`.
- Do not add new top-level menu for this MVP; keep it under Users & Growth
  and user detail tabs/sections.

## 11. RBAC

Required permissions:

| Permission | Purpose | Suggested Roles |
| --- | --- | --- |
| `user:read` | View contact summary and masked identifiers | support, ops, auditor, admin |
| `user:write` | Add/disable/remove contacts, update preferences | ops, admin |
| `user:contact:verify` | Mark contact verified | admin, super_admin, trusted support |
| `user:contact:read_sensitive` | View full identifier when absolutely needed | super_admin only |
| `notifications:read` | View delivery logs | support, ops, auditor, admin |
| `notifications:execute` | Send bot invite/test/single notification | ops, admin |
| `notifications:write` | Create campaign/bulk dispatch definitions | admin, marketing operator future role |

Admin UI must hide unavailable actions but Backend remains the security
boundary.

## 12. Security And Privacy

Mandatory rules:

- Contact identifiers are PII.
- Full identifiers must be encrypted or otherwise protected at rest.
- Logs, job params, job events, audit metadata, and smoke output must never
  include full phone numbers, Telegram IDs, Lark open IDs, invite codes, provider
  tokens, bot tokens, or signed URLs.
- Use masked display labels:
  - phone: `+65******1234`
  - Telegram: `@user` if public username is safe, otherwise `telegram:****1234`
  - Lark: `lark:tenant:****abcd`
- Every Admin mutation writes audit log with actor, target user, action,
  reason, and redacted metadata.
- Invite accept endpoints must rate-limit and avoid account enumeration.
- Marketing opt-out must be respected by dispatch jobs.
- Quiet hours must be respected except for security-critical alerts when Product
  explicitly allows bypass.
- Provider webhook payloads must be stored only as redacted debug metadata when
  required for troubleshooting; raw callback bodies are forbidden in logs.

## 13. Provider Credential Boundary

Provider credentials include:

- Telegram bot token
- WhatsApp provider API token
- Lark app secret / tenant credentials
- email provider keys
- push credentials

They must not be stored in Admin frontend, App, NodeAgent, job params, or logs.

Credential owner options:

1. Backend owns provider credentials and exposes internal executor APIs.
2. Dedicated notification service owns credentials in future.
3. Job Service may call provider only if it retrieves secrets from approved
   secret manager and still redacts all run metadata.

MVP recommendation: Backend owns provider credential config; Job Service
queues and invokes Backend executor APIs.

## 14. Event And Audit

Audit action names:

- `user.contact.create`
- `user.contact.update`
- `user.contact.verify`
- `user.contact.disable`
- `user.contact.delete`
- `user.notification_preferences.update`
- `user.im_invite.create`
- `user.im_invite.cancel`
- `notification.dispatch.request`
- `notification.dispatch.retry`
- `notification.provider.update`
- `notification.provider.verify`
- `notification.provider.enable`
- `notification.provider.disable`
- `notification.report_template.run`

Domain events:

- `contact_channel_created`
- `contact_channel_verified`
- `contact_channel_disabled`
- `notification_preferences_updated`
- `im_invite_queued`
- `im_invite_sent`
- `im_invite_follow_required`
- `im_invite_callback_received`
- `im_invite_accepted`
- `notification_delivery_queued`
- `notification_delivery_succeeded`
- `notification_delivery_failed`
- `notification_delivery_skipped`
- `notification_report_queued`
- `notification_report_succeeded`
- `notification_report_failed`

All events must include stable IDs and redacted metadata.

## 15. CI/CD Smoke Contract

Required smoke checks:

1. Admin login.
2. User token cannot access Admin contact APIs.
3. `GET /admin/api/v1/users/{id}/contacts` requires `user:read`.
4. Add Telegram contact with `user:write`.
5. Response masks identifier.
6. Verify contact requires `user:contact:verify`.
7. Save notification preferences.
8. Create bot invite returns `202 + invite_id + run_id`.
9. Job run exists for `notification_bot_invite`.
10. Cancel invite changes status.
11. Delivery logs list no secrets.
12. Marketing disabled user is skipped.
13. Unverified channel is skipped.
14. Secret leak scan across responses/events/logs.
15. Locale smoke confirms Admin labels support zh-CN and en-US.
16. Provider config list returns Telegram/WhatsApp/Lark with masked secret hints.
17. Provider verify returns `202 + run_id`.
18. Telegram invite remains non-dispatchable until callback verifies follow/start.
19. Invalid provider callback signature is rejected and does not mutate contact.
20. Report template list includes system/operations/sre/sponsor/ambassador reports.
21. Running a report template returns `202 + run_id`.

## 16. Cross-Repo Follow-Up Tasks

| Task | Repo | Purpose |
| --- | --- | --- |
| `TASK-BACKEND-USER-CONTACT-001` | `livemask-backend` | Schema, Admin APIs, preferences, invite API, provider settings, callbacks, report templates, audit, delivery logs. |
| `TASK-JOBS-NOTIFICATION-001` | `livemask-job-service` | Notification job definitions, bot invite executor, provider verify, report dispatch, retry/backoff/dead-letter. |
| `TASK-ADMIN-USER-CONTACT-001` | `livemask-admin` | User detail Contact Channels, Notification Preferences, Bot Invites, Delivery Logs, provider settings, report templates. |
| `TASK-CICD-NOTIFICATION-001` | `livemask-ci-cd` | Contact/preference/invite/delivery smoke and secret leak scan. |
| `TASK-APP-NOTIFICATION-PREFERENCES-001` | `livemask-app` | Future user-facing notification preference settings and push channel. |
| `TASK-WEBSITE-ACCOUNT-NOTIFICATION-001` | `livemask-website` | Future account settings for notification preferences. |

## 17. Done Criteria

- Contract linked from global docs index.
- Backend schema/API implemented with tests and redaction.
- Admin user detail supports contacts/preferences/invites/logs.
- Job Service queues notification dispatch and bot invite jobs.
- CI/CD smoke covers RBAC, job creation, skip rules, and secret leak.
- Completion report lists local runtime status and whether temporary smoke env
  was created.
