# USER-GROWTH-REVENUE Cursor Multi-Window Handoff

> Task family: `TASK-DOC-USER-GROWTH-REVENUE-001`
> Backend MVP: `TASK-BACKEND-USER-GROWTH-REVENUE-001`
> Contract: `docs/contracts/users/USER_GROWTH_REVENUE_CONTRACT.md`

## 1. Mandatory Context

Every Cursor window must read:

```text
../livemask-docs/ai-rules/v3.7/00-Core-Principles.md
../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md
../livemask-docs/docs/contracts/users/USER_GROWTH_REVENUE_CONTRACT.md
../livemask-docs/docs/development/tasks/TASK-BACKEND-USER-GROWTH-REVENUE-001.md
```

Rules:

- Do not edit another repo's code from the wrong window.
- Do not add real payout execution yet.
- Do not enable Alipay, WeChat Pay, or bank card until compliance/provider
  contracts exist.
- Do not generate earnings prompts in frontend code. Login-time reward prompts
  must come from Backend notification rows created from ledger/reward events.
- Never expose wallet private keys, seed phrases, provider secrets, full bank
  account details, or raw payment provider payloads.
- Never expose full referred user email, phone, UUID, wallet, IM ID, sponsor
  node endpoint, node IP, or node secret in reward prompt copy.

## 2. Backend Status

`TASK-BACKEND-USER-GROWTH-REVENUE-001` is implemented in dev-local.
`TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001` is implemented on branch
`task/TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001` at commit `06d0c8d`.

Available APIs:

```text
GET  /api/v1/me/payout-methods
POST /api/v1/me/payout-methods
GET  /api/v1/me/referral-link
GET  /api/v1/me/referral-report
GET  /api/v1/me/sponsor-report
GET  /api/v1/me/settlement-reports
GET  /api/v1/me/revenue-feedback
POST /api/v1/me/revenue-feedback
GET  /api/v1/me/growth/notifications
POST /api/v1/me/growth/notifications/{id}/ack
GET  /api/v1/me/growth/notification-summary

GET /admin/api/v1/growth/referral-rules
GET /admin/api/v1/growth/ambassador-rules
GET /admin/api/v1/growth/reports/referrals
GET /admin/api/v1/growth/reports/sponsors
GET /admin/api/v1/growth/settlements
GET /admin/api/v1/growth/revenue-feedback
GET /admin/api/v1/growth/notifications
POST /admin/api/v1/growth/notifications/preview
```

Backend evidence:

- `go test ./internal/growth ./internal/auth` PASS.
- `go test ./...` PASS.
- `go build ./...` PASS.
- Runtime HTTP checks PASS.
- Growth reward notification evidence:
  - `growth_reward_notifications` schema with indexes.
  - `GET /api/v1/me/growth/notifications` returns login fetch max 3.
  - `POST /api/v1/me/growth/notifications/{id}/ack` is idempotent.
  - `GET /api/v1/me/growth/notification-summary` returns unread and pending amount.
  - Admin list and preview APIs are available.
  - Toast frequency cap is 1 per 15 minutes per user.
  - 26 tests cover redaction, frequency cap, concurrent safety, ack idempotency,
    and template preview.
  - `go test ./internal/growth`, `go test ./internal/auth`,
    `go vet ./internal/growth`, `go build ./internal/growth`, and
    `git diff --check` PASS.

## 3. Admin Window

### 3.1 Growth Reward Notifications

```text
TASK ID: TASK-ADMIN-GROWTH-NOTIFICATION-TEMPLATES-001
Repo: livemask-admin
Branch: task/TASK-ADMIN-GROWTH-NOTIFICATION-TEMPLATES-001
```

Status: implemented for growth reward notifications.

Regression completed:

```text
TASK ID: TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001
Branch: task/TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001
Commit: 74fdb6a
```

Implemented:

- `src/types/growth-notification.ts`
- `src/lib/growth-notification-mock.ts`
- `src/lib/growth-notification-api.ts`
- `src/app/admin/growth/notifications/page.tsx`
- `src/app/admin/growth/notifications/_components/notification-preview-dialog.tsx`
- `src/__tests__/growth-notification.test.ts`
- Navigation item in `src/lib/navigation.ts`
- Sidebar label mapping in `src/components/admin-sidebar.tsx`
- zh/en translations for Growth Notifications.

Implemented behavior:

- `/admin/growth/notifications` page.
- Status filters: pending, shown, dismissed, expired.
- Role filters: promotion ambassador, sponsor ambassador.
- Type filters: login banner, in-app toast, push, IM digest, settlement digest.
- Table columns for masked user, role, type, status, amount in USDT,
  created/shown/dismissed timestamps.
- Template preview dialog with safe rendered title/body and params.
- API client uses existing `adminFetch`; read path may fall back to mock on
  404/501 only.

Validation:

```text
npx vitest run
npx next build
```

Regression evidence:

- `growth:read` controls page visibility.
- Mock production guard is independent for growth notification APIs.
- Mock data uses masked user identifiers and USDT amounts.
- Preview dialog renders safe masked parameters.
- No `UDST` copy is present.

### 3.2 User Growth Revenue Pages

```text
TASK ID: TASK-ADMIN-USER-GROWTH-REVENUE-001
Repo: livemask-admin
Branch: task/TASK-ADMIN-USER-GROWTH-REVENUE-001
Commit: e675a64
Status: completed dev-local
```

Implemented pages:

- `/admin/growth`
- `/admin/growth/referrals`
- `/admin/growth/sponsors`
- `/admin/growth/settlements`
- `/admin/growth/feedback`

Implemented behavior:

- Growth overview hub with card navigation.
- Referral report table.
- Sponsor report table.
- Settlement management list with masked payout address.
- Revenue feedback card list.
- API client covers referral rules, ambassador rules, referral/sponsor reports,
  settlements, and revenue feedback.
- `growth:read` controls Growth pages.
- `settlement:read` controls settlement page.

Must keep:

- Do not calculate reward amounts in frontend.
- Do not expose full payout address, email, phone, UUID, wallet, IM ID, node
  endpoint, IP, or node secret.
- Keep USDT spelling; never use `UDST`.

Validation result:

- `npx vitest run` PASS, 13 files / 499 tests.
- `npx next build` PASS, 46 pages compiled.
- New growth notification files are whitespace-clean.
- Existing trailing whitespace in `src/lib/logs-api.ts` is from a previous
  Admin logs task and should be handled separately.

Still required under broader user growth task:

- Navigation under Users & Growth:
  - `/admin/growth`
  - `/admin/growth/referrals`
  - `/admin/growth/sponsors`
  - `/admin/growth/settlements`
  - `/admin/growth/feedback`
- API client using existing `adminFetch`.
- Referral rules table from `/growth/referral-rules`.
- Ambassador rules table from `/growth/ambassador-rules`.
- Referral report page with empty state.
- Sponsor report page with empty state.
- Settlement report page with status filters.
- Revenue feedback review page.

Must:

- Use Chinese as default UI text and existing i18n pattern.
- Show reserved payout methods as disabled/future support.
- Mask payout destinations in Admin views.
- Display Backend empty states, not fake success data.
- Gate pages by `growth:read`, `growth:write`, `settlement:read`.

Tests:

```text
npx vitest run
npx next build
```

Do not:

- Implement Backend endpoints in Admin repo.
- Show raw full payout address in Admin tables.
- Mark feedback resolved without Backend resolve API.
- Add mock reward notification success data without a visible mock marker.
- Show raw referred user identity or raw sponsor node endpoint.

## 4. App Window

```text
TASK ID: TASK-APP-GROWTH-REWARD-PUSH-001
Repo: livemask-app
Branch: task/TASK-APP-GROWTH-REWARD-PUSH-001
```

Status: implemented for growth reward notifications.

Implemented:

- `lib/api/growth_notification_api_client.dart`
- `lib/models/growth_notification_models.dart`
- `lib/storage/growth_notification_cache_storage.dart`
- `lib/providers/growth_notification_providers.dart`
- `lib/widgets/growth_notification_widgets.dart`
- zh/en ARB keys for promotion reward, sponsor reward, settlement ready, and
  status labels.
- `lib/main.dart` auth/session listener and foreground resume refresh.
- `lib/screens/home_screen.dart` banner/toast integration.
- `lib/screens/profile_screen.dart` notification entry.

Implemented behavior:

- Fetch `/api/v1/me/growth/notifications` after auth/session readiness.
- Refresh on foreground resume with cooldown.
- ACK shown/dismissed/tapped through
  `/api/v1/me/growth/notifications/{id}/ack`.
- Backend disabled or 404/501 degrades silently.
- Session prompt count limits prevent repeated display.
- Uses Backend `title_key` / `body_key` and masked params only.

Validation:

```text
flutter analyze
flutter test
local-app.sh build --targets macos-arm64
local-app.sh build --targets ios
local-app.sh build --targets web
```

Build matrix:

| Target | Status | Notes |
| --- | --- | --- |
| macOS arm64/x64 | PASS | Universal binary verified with `lipo -archs`. |
| iOS simulator | PASS | `build/ios/iphonesimulator/Runner.app` built; safe workdir path verified by `TASK-APP-IOS-CODESIGN-ENV-001`. |
| Web | PASS | `build/web` built. |
| Android debug/release | PASS | Kotlin language-version blocker resolved by `TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001`; Android release signing key still needs production configuration. |
| iOS device | BLOCKED | Requires Apple signing identity, Team ID, provisioning, and physical device. |
| Windows/Linux | BLOCKED | Requires Parallels hosts. |

Still required under broader user growth task:

- Profile payout method section:
  - USDT chain selector default `trc20`.
  - USDT address input.
  - Alipay/WeChat/bank card disabled as reserved.
- Referral link screen:
  - Fetch `/api/v1/me/referral-link`.
  - Share/copy link.
- Referral report screen.
- Sponsor report screen for sponsor role.
- Settlement reports list.
- Revenue feedback form.

Must:

- Use existing App localization.
- Never log full payout address to Sentry breadcrumbs.
- Redact feedback text before breadcrumbs if captured.
- Never send full reward prompt params, referral code, payout address, or masked
  user fallback data to Sentry breadcrumbs.
- Cache only non-sensitive report summaries; do not cache payout address unless
  encrypted storage is explicitly used.

Full platform builds remain required by app rules, but blocked platforms must be
reported as environment blockers, not claimed.

## 5. Website Window

```text
TASK ID: TASK-WEBSITE-REFERRAL-LANDING-001
Repo: livemask-website
Branch: task/TASK-WEBSITE-REFERRAL-LANDING-001
Commit: c778c5d
Status: completed dev-local
```

Implemented:

- Preserve `/register?ref=CODE`.
- Store referral attribution through registration flow.
- Send `referral_code` during registration where Backend supports it.
- Public landing copy for referral program.
- RegisterPage reads `?ref=CODE`, sanitizes it to uppercase alphanumeric, and
  auto-fills the invitation code input.
- Shows a lightweight zh-CN / en-US prompt that the user is registering through
  an invitation link.

Must:

- Do not expose ambassador user identity from the referral code.
- Do not place Admin-only pages under website public routes.
- Do not treat the referral code as a redirect URL; open redirect behavior must
  remain impossible.

## 6. Job Service Window

### 6.1 Settlement Jobs

```text
TASK ID: TASK-JOBS-GROWTH-SETTLEMENT-001
Repo: livemask-job-service
Branch: task/TASK-JOBS-GROWTH-SETTLEMENT-001
Commit: 46f67ad
```

Status: implemented.

Implemented:

- `growth_ledger_aggregate` -> `POST /internal/job-executors/growth/ledger-aggregate`
- `growth_settlement_generate` -> `POST /internal/job-executors/growth/settlement-generate`
- `growth_settlement_reconcile` -> `POST /internal/job-executors/growth/settlement-reconcile`
- Parameter validation for period/reference dates/user/report IDs.
- Retry/backoff/dead-letter behavior.
- 4xx Backend responses are permanent blocked failures.
- Payout/wallet/signing secrets are rejected before dispatch.
- No real payout execution.

Validation:

```text
go test ./... -count=1
go vet ./...
go build ./cmd/job-service
git diff --check
```

Backend follow-up required:

```text
POST /internal/job-executors/growth/ledger-aggregate
POST /internal/job-executors/growth/settlement-generate
POST /internal/job-executors/growth/settlement-reconcile
```

### 6.2 Reward Notification Jobs

```text
TASK ID: TASK-JOBS-GROWTH-REWARD-DIGEST-001
Repo: livemask-job-service
Branch: task/TASK-JOBS-GROWTH-REWARD-DIGEST-001
Regression branch: task/TASK-JOBS-GROWTH-REWARD-DIGEST-REGRESSION-001
Commits: 8a38f26, 66aa194
```

Status: implemented.

Implemented:

- `growth_reward_digest` executor.
- `growth_reward_notification_dispatch` executor.
- Default job definitions for both job types.
- Main registration for both growth executors.
- Retry/backoff with max 3 attempts.
- 4xx Backend responses become permanent blocked failures.
- 5xx/network errors remain retryable.
- Parameter parsing rejects `payout_secret`, `provider_token`, `im_token`,
  `webhook_secret`, `private_key`, `api_key`, and `node_secret`.
- Event metadata is redacted.
- 20 original tests plus 10 regression tests cover parameters, redaction,
  success, blocked, retryable, registration paths, 4xx blocked, 5xx retry /
  exhaustion, secret leak scan, and Backend path verification.

Validation:

```text
go test ./...
go vet ./...
go build ./cmd/job-service/...
git diff --check
```

Backend executor API status:

```text
POST /internal/job-executors/growth/reward-digest
POST /internal/job-executors/growth/reward-notification-dispatch
```

Implemented by `TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001` on branch
`task/TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001`.

Validation:

```text
go test ./internal/growth/... PASS
go test ./internal/auth/... PASS
go vet ./internal/growth/... clean
go build ./internal/growth/... clean
git diff --check clean
```

Known unrelated full-suite issue:

- `go test ./...` still fails on pre-existing `auth.HasPermission` behavior in
  geoip and nodeagent packages; this is not introduced by the executor API task.

Do not:

- Execute payouts.
- Store payout secrets.
- Bypass Backend domain APIs without a contract.

## 7. CI/CD Window

```text
TASK ID: TASK-CICD-USER-GROWTH-REVENUE-001
Repo: livemask-ci-cd
Branch: task/TASK-CICD-USER-GROWTH-REVENUE-001
```

Add smoke:

1. Backend health.
2. User login.
3. Admin login.
4. Create USDT payout: expect 200.
5. Try Alipay payout: expect 400 `PAYOUT_METHOD_RESERVED`.
6. Get payout methods: expect one default USDT.
7. Get referral link: expect stable code and URL.
8. Get referral report: expect 200.
9. Get sponsor report: expect 200.
10. Get settlement reports: expect 200.
11. Create revenue feedback with email/token in description.
12. Confirm feedback response is redacted.
13. Admin rules endpoints return seeded rules.
14. Admin feedback endpoint returns created feedback.
15. Seed reward notification for promotion ambassador.
16. User login/foreground fetch returns safe growth reward notification.
17. ACK reward notification changes status.
18. Admin growth notifications endpoint returns masked recipient/source.
19. Preference/off-switch suppresses realtime prompt where implemented.
20. RBAC no token -> 401.
21. RBAC user token on Admin growth -> 403.
22. Secret leak scan.

Integrate into:

```text
scripts/smoke.sh
.github/workflows/staging-smoke.yml
```

## 8. Completion Report Requirements

Every window must report:

- TASK ID.
- Repo / branch / commit.
- Files changed.
- Tests and build validation.
- Runtime/API validation.
- Cross-repo unlocked/blocked state.
- Any secret/redaction findings.
- Follow-up tasks.
