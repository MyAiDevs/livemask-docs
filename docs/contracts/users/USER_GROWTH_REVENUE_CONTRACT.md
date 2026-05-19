# User Growth, Payout, Ambassador Revenue Contract

> Task: `TASK-DOC-USER-GROWTH-REVENUE-001`
> Owner: Product / Backend / Admin / App / Website / Job Service / CI-CD / Docs
> Status: Ready
> Scope: Defines user payout methods, referral links, promotion ambassador
> rewards, sponsor ambassador rewards, revenue reports, settlement reports,
> revenue anomaly feedback, and login-time earnings incentive notifications.

## 1. Background

LiveMask already has user, sponsor ambassador, and promotion ambassador roles,
but the product loop is incomplete:

- Users need payout information before revenue can be settled.
- Promotion ambassadors need stable referral links and attribution rules.
- Sponsor ambassadors need sponsor revenue rules and traffic/reward reports.
- Finance needs settlement reports and exception handling.
- Users need a safe feedback channel when revenue or settlement looks wrong.
- Ambassadors need timely but privacy-safe earnings prompts after login or App
  foreground so they can see "you earned X USDT" and continue sharing.

This contract keeps identity data in `users`, while payment destinations,
reward rules, revenue ledgers, reports, settlements, and anomaly feedback live
in dedicated tables.

## 2. Principles

1. Do not overload the `users` table with finance state.
2. Default payout support is USDT only.
3. Alipay, WeChat Pay, and bank transfer are schema-reserved but disabled until
   compliance and provider flows are implemented.
4. Payout details are sensitive. Admin list views show masked values by
   default; full values are returned only to the owning user or audited finance
   operators when explicitly required by a later task.
5. Reward rules are versioned and auditable.
6. Reports read from immutable ledger/settlement data, not from frontend
   calculations.
7. Feedback is not a settlement mutation. It creates a review item that Finance
   or Support can resolve.
8. User-facing earnings prompts must be derived from Backend ledger or reward
   notification rows. App, Website, and Admin must not invent earnings copy from
   local calculations.
9. Earnings prompts are notifications. They must respect user notification
   preferences, quiet hours, frequency caps, and redaction rules.
10. Referred user identity and sponsor node identity must be masked in all
    growth notification copy.

## 3. Data Model

### 3.1 `user_payout_methods`

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | uuid | yes | Primary key |
| `user_id` | uuid | yes | References `users(id)` |
| `method_type` | enum | yes | `usdt`, `alipay`, `wechat_pay`, `bank_card` |
| `currency` | string | yes | Default `USDT` |
| `chain` | string | no | For USDT: `trc20`, `erc20`, `bep20`, etc. MVP accepts `trc20` and stores others as reserved after validation rules are added. |
| `address` | string | no | USDT wallet address. Owner-only full display. |
| `account_masked` | string | no | Masked display for Admin list/report views |
| `holder_name` | string | no | Reserved for bank/Alipay/WeChat |
| `bank_name` | string | no | Reserved for bank card |
| `bank_branch` | string | no | Reserved |
| `is_default` | boolean | yes | One default per user |
| `status` | enum | yes | `pending`, `verified`, `rejected`, `disabled` |
| `metadata` | jsonb | no | Non-secret provider-safe metadata |
| `created_at` / `updated_at` | timestamptz | yes | Audit timestamps |

MVP validation:

- `method_type=usdt` is accepted.
- `currency` must be `USDT`.
- `chain` defaults to `trc20`.
- `address` must be present and between 20 and 128 characters.
- `alipay`, `wechat_pay`, and `bank_card` return `PAYOUT_METHOD_RESERVED`
  until a later compliance task enables them.

### 3.2 `referral_codes`

| Field | Type | Notes |
| --- | --- | --- |
| `user_id` | uuid | One active code per user for MVP |
| `code` | string unique | Uppercase alphanumeric, stable unless Admin rotates |
| `landing_path` | string | Default `/register` |
| `utm_source` | string | Default `ambassador` |
| `status` | enum | `active`, `disabled` |
| `created_at` / `updated_at` | timestamptz | Audit timestamps |

Referral link format:

```text
https://<website-host>/register?ref=<code>
```

Rules:

- Codes are case-insensitive for attribution.
- The link must not contain user email, wallet address, phone, or IM ID.
- A user can generate their own referral code after login.
- Promotion ambassadors can view referral performance in `/ambassador/*`.
- Admin can rotate or disable codes in a later moderation task.

### 3.3 `growth_reward_rules`

Rules are versioned policy rows:

| Field | Type | Notes |
| --- | --- | --- |
| `rule_key` | string | Stable key, e.g. `promotion_first_paid_order` |
| `actor_type` | enum | `promotion_ambassador`, `sponsor_ambassador` |
| `trigger_event` | string | `signup`, `first_paid_order`, `renewal`, `sponsor_node_traffic`, etc. |
| `reward_type` | enum | `percentage`, `fixed_amount`, `hybrid` |
| `rate_bps` | int | Basis points, e.g. `1000` = 10% |
| `fixed_amount_cents` | int | Minor unit amount |
| `currency` | string | `USDT` for MVP settlement |
| `status` | enum | `draft`, `active`, `archived` |
| `version` | int | Monotonic per `rule_key` |
| `payload` | jsonb | Rule constraints and non-secret metadata |

Default MVP rules:

| Rule | Actor | Trigger | Default |
| --- | --- | --- | --- |
| `promotion_signup_attribution` | promotion ambassador | signup | attribution only, no payout |
| `promotion_first_paid_order` | promotion ambassador | first paid order | percentage rule, default inactive until Finance enables |
| `promotion_renewal_order` | promotion ambassador | renewal | percentage rule, default inactive |
| `sponsor_node_traffic_reward` | sponsor ambassador | node traffic contribution | percentage or traffic-unit reward, default inactive |
| `sponsor_quality_bonus` | sponsor ambassador | SLA/quality threshold | bonus rule, default inactive |

### 3.4 `growth_earnings_ledger`

Immutable revenue ledger row:

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `user_id` | uuid | Ambassador/sponsor receiving revenue |
| `role_type` | enum | `promotion_ambassador`, `sponsor_ambassador` |
| `source_user_id` | uuid | Optional referred user |
| `source_event_id` | string | Payment/order/node traffic event ID |
| `earning_type` | string | `referral_signup`, `first_paid_order`, `renewal`, `sponsor_traffic`, `quality_bonus` |
| `gross_amount_cents` | bigint | Source amount |
| `rate_bps` | int | Rule rate at time of ledger creation |
| `net_amount_cents` | bigint | Earned amount |
| `currency` | string | Default `USDT` |
| `status` | enum | `pending`, `approved`, `settled`, `reversed`, `disputed` |
| `period_start` / `period_end` | timestamptz | Reporting period |
| `metadata` | jsonb | Redacted, non-secret |
| `created_at` | timestamptz | Ledger timestamp |

### 3.5 `growth_settlement_reports`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `user_id` | uuid | Recipient |
| `role_type` | enum | promotion/sponsor |
| `period_start` / `period_end` | timestamptz | Settlement period |
| `gross_amount_cents` | bigint | Sum before adjustments |
| `adjustment_cents` | bigint | Manual/reversal adjustments |
| `net_amount_cents` | bigint | Payable amount |
| `currency` | string | Default `USDT` |
| `payout_method_id` | uuid | Selected payout method |
| `status` | enum | `draft`, `pending_review`, `approved`, `paid`, `rejected` |
| `created_at` / `updated_at` | timestamptz | Audit timestamps |

Settlement reports are finance-owned. User-facing views are read-only.

### 3.6 `growth_revenue_feedback`

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `user_id` | uuid | Submitter |
| `role_type` | enum | `promotion_ambassador`, `sponsor_ambassador`, `user` |
| `feedback_type` | enum | `missing_referral`, `wrong_amount`, `settlement_delayed`, `payout_failed`, `sponsor_traffic_mismatch`, `other` |
| `related_id` | string | Optional ledger/settlement/order/node ID |
| `title` | string | Short user-visible title |
| `description` | text | Redacted on storage/display |
| `status` | enum | `open`, `reviewing`, `resolved`, `rejected` |
| `resolution` | text | Admin/Finance response |
| `created_at` / `updated_at` | timestamptz | Audit timestamps |

### 3.7 `growth_reward_notifications`

User-facing growth notification rows are created when a promotion or sponsor
earning becomes eligible for display. They are not the source of financial
truth; they reference `growth_earnings_ledger` or a safe source event.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid | Primary key |
| `recipient_user_id` | uuid | Ambassador/sponsor/user receiving the prompt |
| `role_type` | enum | `promotion_ambassador`, `sponsor_ambassador`, `user` |
| `source_event_id` | string | Payment/order/node traffic/settlement event ID |
| `earning_ledger_id` | uuid | Optional reference to immutable ledger row |
| `notification_type` | enum | `login_banner`, `in_app_toast`, `push`, `im_digest`, `settlement_digest` |
| `title_key` | string | I18N key, not raw hardcoded UI copy |
| `body_key` | string | I18N key |
| `params` | jsonb | Safe params such as `amount`, `currency`, `masked_user`, `masked_node` |
| `amount_cents` | bigint | Reward amount shown to user |
| `currency` | string | Default `USDT` |
| `referred_user_masked` | string | Example: `用户 A7K2` or `8***21`; never email/phone/user_id |
| `sponsor_node_masked` | string | Example: `节点 SG-03`; never endpoint/IP/node secret |
| `status` | enum | `pending`, `shown`, `dismissed`, `expired` |
| `priority` | int | Higher priority shown first |
| `available_at` / `expires_at` | timestamptz | Display window |
| `shown_at` / `dismissed_at` | timestamptz | User interaction timestamps |
| `created_at` / `updated_at` | timestamptz | Audit timestamps |

Default templates:

| Template key | zh-CN copy | en-US copy |
| --- | --- | --- |
| `growth.promotion.reward_earned` | `推广用户 {masked_user} 成功转化，你获得 {amount} USDT 奖励` | `Referral {masked_user} converted. You earned {amount} USDT.` |
| `growth.sponsor.reward_earned` | `赞助节点 {masked_node} 贡献达标，你获得 {amount} USDT 奖励` | `Sponsored node {masked_node} reached reward criteria. You earned {amount} USDT.` |
| `growth.settlement.report_ready` | `本期结算报告已生成，待审核金额 {amount} USDT` | `Your settlement report is ready with {amount} USDT pending review.` |

Display/frequency rules:

- Login/foreground fetch returns at most 3 unread growth prompts.
- In-app realtime toast is capped to 1 prompt per 15 minutes per user.
- If more than 3 reward events are pending, Backend should return a digest
  summary instead of many individual prompts.
- If user disables growth reward notifications, only mandatory settlement or
  payout failure prompts may be returned.
- Expired prompts remain queryable by Admin but are not returned to App login
  fetches.

## 4. API Contract

### 4.1 User / App / Website APIs

All require user JWT (`app` or `website` audience).

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/v1/me/payout-methods` | List current user's payout methods |
| `POST` | `/api/v1/me/payout-methods` | Create/update payout method; MVP supports USDT only |
| `GET` | `/api/v1/me/referral-link` | Get or lazily create referral code/link |
| `POST` | `/api/v1/me/referral-link/rotate` | Future: rotate referral code with abuse guard |
| `GET` | `/api/v1/me/referral-report` | Promotion ambassador invite/revenue report |
| `GET` | `/api/v1/me/sponsor-report` | Sponsor ambassador revenue report |
| `GET` | `/api/v1/me/settlement-reports` | User settlement report list |
| `POST` | `/api/v1/me/revenue-feedback` | Submit revenue/settlement anomaly feedback |
| `GET` | `/api/v1/me/growth/notifications` | Login/foreground earnings prompts, frequency-capped |
| `POST` | `/api/v1/me/growth/notifications/{id}/ack` | Mark a prompt shown/dismissed |
| `GET` | `/api/v1/me/growth/notification-summary` | Unread count and latest safe earnings summary |

### 4.2 Admin APIs

All require Admin JWT.

| Method | Path | Permission | Purpose |
| --- | --- | --- | --- |
| `GET` | `/admin/api/v1/growth/referral-rules` | `growth:read` | List referral/reward rules |
| `PUT` | `/admin/api/v1/growth/referral-rules/{rule_key}` | `growth:write` | Update versioned promotion rule |
| `GET` | `/admin/api/v1/growth/ambassador-rules` | `growth:read` | List sponsor/promotion rules |
| `GET` | `/admin/api/v1/growth/reports/referrals` | `growth:read` | Invite/revenue report |
| `GET` | `/admin/api/v1/growth/reports/sponsors` | `growth:read` | Sponsor revenue report |
| `GET` | `/admin/api/v1/growth/settlements` | `settlement:read` | Settlement reports |
| `POST` | `/admin/api/v1/growth/settlements/{id}/approve` | `settlement:write` | Future approve action |
| `GET` | `/admin/api/v1/growth/revenue-feedback` | `growth:read` | Feedback list |
| `POST` | `/admin/api/v1/growth/revenue-feedback/{id}/resolve` | `growth:write` | Resolve feedback |
| `GET` | `/admin/api/v1/growth/notifications` | `growth:read` | Reward notification list and delivery/read state |
| `POST` | `/admin/api/v1/growth/notifications/preview` | `growth:read` | Preview safe template rendering with masked params |

## 5. Report Semantics

### 5.1 Referral Report

Must include:

- `referral_code`
- `referral_link`
- `signups`
- `paid_conversions`
- `pending_earnings`
- `approved_earnings`
- `settled_earnings`
- period filters

### 5.2 Sponsor Report

Must include:

- sponsor nodes or contribution scope
- traffic/contribution summary
- quality/SLA summary
- pending/approved/settled sponsor earnings
- feedback count and disputed amount

### 5.3 Settlement Report

Must include:

- settlement period
- gross amount
- adjustments
- net amount
- payout method masked summary
- status
- audit timestamps

### 5.4 Login-Time Earnings Prompt

The App and Website may request growth prompts immediately after successful
login, token refresh, or foreground resume. The response must be safe for direct
display:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "role_type": "promotion_ambassador",
      "notification_type": "login_banner",
      "title_key": "growth.promotion.reward_earned",
      "body_key": "growth.promotion.reward_earned",
      "params": {
        "masked_user": "A7K2",
        "amount": "12.50",
        "currency": "USDT"
      },
      "amount_cents": 1250,
      "currency": "USDT",
      "status": "pending",
      "expires_at": "2026-05-26T00:00:00Z"
    }
  ],
  "summary": {
    "unread_count": 1,
    "pending_amount_cents": 1250,
    "currency": "USDT"
  }
}
```

Rules:

- Backend owns the copy keys and safe parameters.
- App/Website localize from `title_key` / `body_key`.
- App/Website must call `ack` after the user sees, dismisses, or taps the
  prompt.
- Push/IM delivery is optional and must go through the Notification contract and
  Job Service. Login fetch remains the MVP source of user-visible prompts.

## 6. Security

- Never log full payout address in observability logs.
- Admin list responses should use `account_masked`.
- Full payout destination is owner-visible only in MVP.
- Reward notification copy must not expose full referred user email, phone,
  UUID, wallet address, IM ID, or sponsor node endpoint/IP.
- `params` must be generated server-side and redacted before storage.
- User-facing copy must use `USDT`; do not ship the typo `UDST` in product UI.
- Feedback description must redact token, wallet private key, seed phrase,
  password, phone/email patterns, signed URLs, and provider secrets.
- Rule payloads must not store provider secrets.
- Settlement approval and payout execution must be audited.

## 7. Cross-Repo Tasks

| Task | Repo | Scope |
| --- | --- | --- |
| `TASK-BACKEND-USER-GROWTH-REVENUE-001` | `livemask-backend` | Schema, service, user APIs, Admin read APIs, validation, seed default rules |
| `TASK-ADMIN-USER-GROWTH-REVENUE-001` | `livemask-admin` | User Growth menu, payout method view, referral/sponsor reports, settlement and feedback review |
| `TASK-APP-USER-GROWTH-REVENUE-001` | `livemask-app` | Profile payout method, referral link sharing, referral/sponsor report views, feedback form |
| `TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001` | `livemask-backend` | Reward notification table, login prompt APIs, ack API, Admin list/preview APIs |
| `TASK-APP-GROWTH-REWARD-PUSH-001` | `livemask-app` | Login/foreground prompt fetch, banner/toast display, ack, localization, Sentry-safe breadcrumbs |
| `TASK-ADMIN-GROWTH-NOTIFICATION-TEMPLATES-001` | `livemask-admin` | Growth notification list, template preview, delivery/read state, frequency-cap explanation |
| `TASK-WEBSITE-REFERRAL-LANDING-001` | `livemask-website` | `/register?ref=` attribution, referral landing copy, SEO-safe campaign pages |
| `TASK-JOBS-GROWTH-SETTLEMENT-001` | `livemask-job-service` | Periodic ledger aggregation, settlement report generation, retry/dead-letter |
| `TASK-JOBS-GROWTH-REWARD-DIGEST-001` | `livemask-job-service` | Daily/weekly digest generation for excess reward events and IM/push dispatch jobs |
| `TASK-CICD-USER-GROWTH-REVENUE-001` | `livemask-ci-cd` | Smoke: payout USDT, reserved methods blocked, referral link, reports, feedback, RBAC, secret leak scan |
| `TASK-CICD-GROWTH-REWARD-NOTIFICATION-001` | `livemask-ci-cd` | Smoke: seed reward notification, login fetch, ack, Admin list, preference/off switch, secret leak scan |

## 8. Done Criteria

- User can create a USDT payout method.
- Reserved payout methods return explicit reserved errors.
- User can get a stable referral link.
- Backend exposes referral, sponsor, and settlement report APIs.
- User can submit revenue anomaly feedback.
- User sees safe login-time reward prompts derived from Backend notification
  rows, and can acknowledge/dismiss them.
- Admin can list rules, reports, settlements, and feedback.
- Admin can inspect reward notification state without seeing raw referred user
  identity or node endpoint data.
- Reward rules are stored as versioned rows.
- No raw secrets, private keys, or provider credentials leak in responses/logs.
- CI/CD smoke covers auth, RBAC, reserved method rejection, report reads,
  feedback creation, and secret leak scan.
