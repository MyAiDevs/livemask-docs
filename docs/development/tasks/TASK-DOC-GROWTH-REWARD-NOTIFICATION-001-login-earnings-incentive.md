# TASK-DOC-GROWTH-REWARD-NOTIFICATION-001 - Login Earnings Incentive Notification

> Owner: Product / Backend / Admin / App / Website / Job Service / CI-CD / Docs
> Contract: `docs/contracts/users/USER_GROWTH_REVENUE_CONTRACT.md`
> Status: Ready
> Created: 2026-05-19

## 1. Background

The first User Growth Revenue contract covered payout methods, referral links,
reports, settlements, and revenue feedback. Product review identified a missing
growth loop:

```text
reward event -> ledger -> safe reward notification -> user login/foreground
prompt -> user continues sharing/sponsoring -> ack/audit/frequency control
```

Example product copy:

- `推广用户 A7K2 成功转化，你获得 12.50 USDT 奖励`
- `赞助节点 SG-03 贡献达标，你获得 8.00 USDT 奖励`

This is not frontend decoration. It must be Backend-derived from reward facts,
privacy-safe, localized, frequency-capped, and connected to notification
preferences.

## 2. Scope

This task updates the existing growth revenue contract and Cursor handoff to
include login-time earnings incentive notifications.

In scope:

- `growth_reward_notifications` data model.
- User login/foreground prompt APIs.
- ACK/dismiss API.
- Admin list and template preview API.
- App banner/toast behavior.
- Job Service digest and optional push/IM dispatch.
- CI smoke for seed -> fetch -> ack -> Admin view -> secret scan.
- Cross-reference to notification preference types.

Out of scope:

- Real payout execution.
- Enabling Alipay, WeChat Pay, or bank card payouts.
- Bulk marketing campaign tooling.
- Exposing referred user PII or sponsor node endpoints.

## 3. Cross-Repo Task Split

| Task | Repo | Scope | Status |
| --- | --- | --- | --- |
| `TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001` | `livemask-backend` | Schema, service, login prompt APIs, ack, Admin list/preview, redaction | Done: branch `task/TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001`, commit `06d0c8d` |
| `TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001` | `livemask-backend` | Internal executor APIs for reward digest and notification dispatch jobs | Done: branch `task/TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001`; changed packages pass, full-suite has unrelated pre-existing auth permission failures |
| `TASK-APP-GROWTH-REWARD-PUSH-001` | `livemask-app` | Fetch after login/foreground, localized banner/toast, ack, Sentry-safe breadcrumbs | Done; Android build blocked by pre-existing Sentry Kotlin compatibility issue |
| `TASK-ADMIN-GROWTH-NOTIFICATION-TEMPLATES-001` | `livemask-admin` | `/admin/growth/notifications`, template preview, status filters, masked display | Done; old trailing whitespace in `src/lib/logs-api.ts` remains separate cleanup |
| `TASK-JOBS-GROWTH-REWARD-DIGEST-001` | `livemask-job-service` | Digest generation, optional IM/push dispatch via Notification contract, retry/dead-letter | Done: branch `task/TASK-JOBS-GROWTH-REWARD-DIGEST-001`; Backend executor APIs now implemented and ready for CI/CD smoke |
| `TASK-CICD-GROWTH-REWARD-NOTIFICATION-001` | `livemask-ci-cd` | Smoke seed/fetch/ack/Admin/RBAC/secret leak scan | Unlocked |
| `TASK-DOCS-GROWTH-REWARD-NOTIFICATION-SYNC-001` | `livemask-docs` | Keep contract index, MVP plan, task README, handoff status synchronized | Ready |

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Add reward notification schema, user prompt APIs, ack API, Admin list/preview APIs, preference and frequency checks. |
| `livemask-app` | Fetch prompts after login/foreground, render localized growth banner/toast, ack user interaction, keep Sentry breadcrumbs safe. |
| `livemask-admin` | Add Growth Notifications page and template preview with masked source data. |
| `livemask-website` | May fetch prompt summary after website login and must preserve referral attribution without exposing ambassador identity. |
| `livemask-job-service` | Add digest generation and optional IM/push dispatch jobs with retry/backoff/dead-letter. |
| `livemask-ci-cd` | Add smoke coverage for seed, fetch, ack, Admin list, RBAC, preference suppression, and secret leak scan. |
| `livemask-docs` | Keep contract, MVP plan, task README, and handoff synchronized. |

## 5. Product Rules

1. Backend owns the event facts and safe display params.
2. App and Website only render `title_key`, `body_key`, and safe params.
3. Use `USDT` in copy. Do not ship `UDST`.
4. Referred user identity must be masked, for example `A7K2` or `8***21`.
5. Sponsor node identity must be masked, for example `SG-03`; no endpoint, IP,
   node secret, public host, or raw config.
6. Login/foreground fetch returns at most 3 prompts.
7. Realtime toast is capped to 1 prompt per 15 minutes.
8. Excess reward events should roll into digest prompts.
9. User notification preferences and quiet hours must be respected when exposed.
10. ACK must be idempotent.

## 6. Validation

Docs validation:

```text
bash scripts/check-docs.sh
git diff --check
```

Backend validation:

```text
go test ./internal/growth ./internal/auth
go test ./...
go build ./...
```

App validation:

```text
flutter analyze
flutter test
```

Admin validation:

```text
npx vitest run
npx next build
```

CI/CD smoke must verify:

- user login succeeds
- reward notification seed exists
- user fetch receives safe prompt
- prompt text/params contain no email, phone, wallet, token, node endpoint, or
  full UUID
- ACK changes status
- Admin list shows masked source
- no-token returns 401
- user token on Admin route returns 403
- secret leak scan passes

## 7. Done Criteria

- Growth revenue contract includes reward notification model and APIs.
- Notification contract includes growth preference types.
- Cursor handoff includes Backend, App, Admin, Job Service, and CI/CD work.
- MVP plan and task README link this task.
- Runtime implementation tasks are unlocked with clear repo boundaries.
