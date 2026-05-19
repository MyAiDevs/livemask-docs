# OBSERVABILITY-LOGS-METRICS Cursor Multi-Window Handoff

> Task family: `TASK-DOC-OBSERVABILITY-LOGS-METRICS-001`
> Contract: `docs/contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md`
> Status: Ready for multi-window implementation
> Scope: system logs, NodeAgent logs, App Sentry exception summaries, payment
> order logs, notification delivery logs, audit logs, metrics, Admin pages and
> CI smoke.

## 1. Mandatory Read-First Files

Every Cursor window must read these before editing code:

```text
../livemask-docs/ai-rules/v3.7/00-Core-Principles.md
../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md
../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md
../livemask-docs/ai-rules/v3.7/16-Task-Completion-Report.md
../livemask-docs/docs/contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md
../livemask-docs/docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md
../livemask-docs/docs/architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md
```

Repo-specific windows must also read:

```text
livemask-backend: ../livemask-docs/docs/backend/README.md
livemask-job-service: ../livemask-docs/docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md
livemask-nodeagent: ../livemask-docs/docs/nodeagent/README.md
livemask-app: ../livemask-docs/docs/app/README.md
livemask-admin: ../livemask-docs/docs/admin/README.md
livemask-ci-cd: ../livemask-docs/docs/operations/README.md
```

## 2. Global Rules

1. Work on `dev`.
2. Do not edit another repo's implementation files from the wrong window.
3. Use the task ID assigned to the current repo in code comments, tests,
   completion report and commit message.
4. Do not log secrets, tokens, signed URLs, NodeAgent configs, sing-box configs,
   payment credentials, provider secrets or IM contact identifiers.
5. App raw crash/exception data uses Sentry. Do not build a custom App raw log
   ingestion API unless a later contract explicitly changes this.
6. App Sentry DSN/config comes from Backend System Settings through a safe
   App-facing config API. Only the public client DSN and non-secret sampling
   fields may be returned to App; Sentry auth tokens, webhook secrets, relay
   secrets, project/org tokens and private keys must remain server-side.
7. NodeAgent never calls Job Service directly. NodeAgent logs go to Backend
   `/internal/agent/logs` with Node HMAC.
8. Backend must not synchronously bulk-insert large log batches in request path.
   Queue ingestion through Job Service.
9. Admin reads only Backend APIs. It must not call NodeAgent, Job Service,
   Prometheus or Sentry directly from the browser.
10. Production UI must never silently show mock logs. Local/dev mock or seed data
   must show Mock/Stale/Seed badges.
11. Every write/action or reveal of sensitive data needs audit reason and audit
    trail.

## 3. Recommended Parallel Assignment

| Window | Repo | Task | Status |
| --- | --- | --- | --- |
| Backend A | `livemask-backend` | `TASK-BACKEND-OBSERVABILITY-LOGS-001` | ✅ Routes fixed / implemented |
| Backend B | `livemask-backend` | `TASK-BACKEND-SENTRY-SUMMARY-001`, `TASK-BACKEND-PAYMENT-LOGS-001`, `TASK-BACKEND-NOTIFICATION-LOGS-001` | ✅ Routes fixed / implemented |
| Job Service | `livemask-job-service` | `TASK-JOBS-OBSERVABILITY-INGEST-001` | ✅ Implemented / CI async path verification pending |
| NodeAgent | `livemask-nodeagent` | `TASK-NODEAGENT-METRICS-LOGS-001` + `TASK-NODEAGENT-OBSERVABILITY-UPLOAD-INTEGRATION-001` | ✅ Verified |
| App | `livemask-app` | `TASK-APP-SENTRY-OBSERVABILITY-001` + `TASK-APP-SENTRY-RUNTIME-CONFIG-001` | ✅ Done / platform build blockers remain |
| Admin | `livemask-admin` | `TASK-ADMIN-LOGS-METRICS-001`, then `TASK-ADMIN-OBSERVABILITY-DETAILS-001` | Unlocked |
| CI/CD | `livemask-ci-cd` | `TASK-CICD-SENTRY-CONFIG-SMOKE-001` + `TASK-CICD-OBSERVABILITY-SMOKE-001` | ✅ Passed |

Backend routes (core observability, Sentry config, payment order logs,
notification delivery logs, system logs, NodeAgent log ingestion, metrics,
and App-facing config APIs) are **fixed and implemented**. Future Cursor
windows should treat these endpoints as stable and available for Admin UI
integration and CI/CD smoke.

If only one Backend window is available, complete Backend A before Backend B.
Admin can start with mocks/types only, but must switch to real Backend APIs as
soon as Backend endpoints are ready.

## 4. Backend Cursor Prompt

> **Status**: ✅ Routes fixed. The Backend observability layer (DB schema,
> NodeAgent log ingestion, Admin log APIs, metrics) has been implemented.
> Future windows must not regenerate these routes; Admin, CI/CD and Job Service
> should build against the existing endpoints.

```text
TASK ID: TASK-BACKEND-OBSERVABILITY-LOGS-001
Repo: livemask-backend
Branch: dev

Read the observability contract and repo README first. Implement Backend's
core observability layer:

1. Schema / Store
- Add or extend observability tables with idempotent EnsureSchema:
  observability_logs, app_exception_reports, payment_order_logs,
  notification_delivery_logs if not already present.
- Keep audit_logs separate and immutable.
- Add indexes required by the contract.

2. Redaction
- Centralize redaction for log message, metadata and provider payload summaries.
- Cover secret, token, password, private_key, api_key, license_key, hmac,
  node_secret, signature, credential, authorization, cookie, signed URLs, DSN
  password, payment credential, IM contact identifier.

3. NodeAgent ingestion
- Implement POST /internal/agent/logs with Node HMAC.
- node_id must come from auth context, not request body.
- Enforce max 100 entries, 2KB message, 8KB metadata after redaction.
- Accept quickly and enqueue to Job Service or staging table.
- Return { ok, accepted, batch_id }.

4. Admin read APIs
- GET /admin/api/v1/logs
- GET /admin/api/v1/nodes/{node_id}/logs
- GET /admin/api/v1/audit-logs
- GET /admin/api/v1/logs/ingestion/health
- GET /admin/api/v1/system/logs
- Enforce logs:read / audit:read / metrics:read.
- Paginate and filter exactly as contract states.

5. Metrics
- Add /metrics with required livemask_backend_* metrics.
- Keep labels low cardinality.

Tests:
- no token -> 401, wrong role -> 403, valid role -> 200.
- node HMAC success/failure for /internal/agent/logs.
- batch size and metadata limits.
- redaction tests for every forbidden key/value.
- log search filters and pagination.
- metrics endpoint contains required names.

Validation:
- go test ./... -count=1
- go vet ./...
- go build ./...
- git diff --check

Do not implement App raw log ingestion. App exceptions come from Sentry summary
sync in TASK-BACKEND-SENTRY-SUMMARY-001.
```

## 5. Backend Domain Logs Cursor Prompt

> **Status**: ✅ Routes fixed. Sentry config, payment order logs, notification
> delivery logs, system logs, and App-facing config APIs have been implemented.
> Admin and CI/CD should build against existing endpoints, not regenerate them.

```text
TASK ID: TASK-BACKEND-SENTRY-SUMMARY-001 / TASK-BACKEND-PAYMENT-LOGS-001 / TASK-BACKEND-NOTIFICATION-LOGS-001
Repo: livemask-backend
Branch: dev

Implement domain-specific observability views after core observability is in
place:

1. Sentry summary
- Add System Settings support for App Sentry client configuration:
  public DSN, environment, release prefix, traces/profiles sample rates,
  max breadcrumbs, allowed tag list and `before_send_required`.
- Add `GET /api/v1/app/observability/config` returning only the safe client
  config. It must never return Sentry auth token, org/project token, relay
  secret, webhook secret, private key, Authorization header or cookies.
- Support missing/disabled config by returning `enabled=false`; App startup
  must not be blocked.
- Add Sentry webhook or scheduled sync abstraction.
- Store only redacted issue summaries in app_exception_reports.
- Expose GET /admin/api/v1/app/exceptions.
- Mirror a redacted observability_logs entry with family=exception.
- Never store raw stack/context/request headers/cookies/tokens.

2. Payment order logs
- Add payment_order_logs write helpers and GET
  /admin/api/v1/payments/orders/{order_id}/logs.
- Record order created, provider request/response summary, webhook received,
  duplicate, signature failed, reconciliation, refund, chargeback/manual
  adjustment.
- No raw provider payload or payment credentials.

3. Notification delivery logs
- Add notification_delivery_logs read model if missing.
- Expose GET /admin/api/v1/notifications/delivery-logs.
- Record provider verify, invite, dispatch queued/sent/failed/throttled,
  callback verified, dead-letter.
- Mask contact identifiers unless explicit sensitive permission exists.

Tests:
- Sentry summary redaction and forbidden fields.
- payment webhook signature failure log has no raw payload.
- notification logs mask contact identifiers.
- RBAC for each endpoint.
- audit for sensitive reveal or manual payment adjustment.
```

## 6. Job Service Cursor Prompt

```text
TASK ID: TASK-JOBS-OBSERVABILITY-INGEST-001
Repo: livemask-job-service
Branch: dev

Implement durable queued log ingestion:

- Ensure observability_log_ingest job definition exists.
- Ingest batches from Backend staging/enqueue path.
- Enforce idempotency by batch_id.
- Write observability_logs transactionally.
- Retry transient DB failures with backoff.
- Dead-letter failed batches with redacted events.
- Expose metrics:
  livemask_job_log_ingest_batches_total{result}
  livemask_job_dead_letter_total{job_type}
  livemask_job_queue_depth{job_type}
- Do not validate Admin JWT.
- Do not accept NodeAgent direct calls.
- Do not store raw secrets in run params/events.

Tests:
- duplicate batch skipped.
- transient DB error retries.
- permanent invalid payload blocks/dead-letters.
- secret leakage scan for run/event metadata.
- SQL store and memory store behavior.
```

## 7. NodeAgent Cursor Prompt

```text
TASK ID: TASK-NODEAGENT-METRICS-LOGS-001
Repo: livemask-nodeagent
Branch: dev

Implement or verify NodeAgent observability:

- Local bounded log queue with overflow strategy.
- Redact before enqueue.
- POST /internal/agent/logs to Backend with existing Node HMAC.
- Retry failed upload with exponential backoff and max attempts.
- Upload failures must not crash NodeAgent.
- /metrics Prometheus text endpoint with required livemask_nodeagent_* metrics.
- /agent/status observability block:
  log_queue_depth, last_log_upload_at, last_log_upload_error,
  metrics_enabled, metrics_path.
- Required event hooks:
  startup/shutdown, config fetch/apply, sing-box start/stop/error,
  endpoint_ready/not_ready, protocol apply/rollback, GeoIP sync,
  release apply/rollback, job assignment events.

Forbidden:
- Do not call Job Service.
- Do not log node_secret, raw sing-box config, signed URLs, credentials,
  endpoint + port combos.

Tests:
- redaction.
- queue cap and retry.
- HMAC upload headers.
- metrics contain required names and no high-cardinality forbidden labels.
- status includes observability.
```

### NodeAgent Verification Status

`TASK-NODEAGENT-OBSERVABILITY-UPLOAD-INTEGRATION-001` is verified.
`TASK-NODEAGENT-OBSERVABILITY-UPLOAD-202-FIX-001` is verified in dev-local.

Evidence:

- HMAC signature and header derivation: 6 tests PASS.
- `batch_id` generation and payload embedding: 4 tests PASS.
- Retry / backoff / exhaustion / overflow: 9 tests PASS.
- Redaction and message truncation: 12 tests PASS.
- Total verification set: 31 tests PASS.
- End-to-end upload path to Backend `/internal/agent/logs` verified.
- Upload client accepts Backend `202 Accepted` responses and the current
  response body shape:
  `{ "accepted": true, "accepted_count": n, "queued": false }`.
- Dev-local runtime after targeted NodeAgent restart shows
  `[observability] log upload success` instead of retrying on status 202.

Security fix:

- `RedactLogEntry` previously failed to redact camelCase `nodeSecret`
  because metadata keys are lowercased before matching. The sensitive key map
  entry is now normalized to lowercase `nodesecret`.
- `node_secret`, `nodeSecret`, and `NODE_SECRET` are all redacted.
- Signed URLs in messages and metadata are redacted.
- Upload failures retry with backoff and do not crash NodeAgent.
- Exhausted retries discard entries after max retry limit.
- Backend rejected responses such as `accepted:false` still fail and requeue
  according to the normal backoff path.

Next:

- Admin may proceed with Node Detail latest logs and metric summary UI.
- No further NodeAgent contract changes are required for this upload path.

## 8. App Cursor Prompt

```text
TASK ID: TASK-APP-SENTRY-OBSERVABILITY-001 + TASK-APP-SENTRY-RUNTIME-CONFIG-001
Repo: livemask-app
Branch: dev

App logs and exceptions use Sentry. Do not implement custom raw App log upload
to Backend.

Implement:
- Sentry initialization using Backend `GET /api/v1/app/observability/config`
  as the primary source.
- Build-time `SENTRY_DSN` may be kept only as a local/dev fallback.
- Accept only safe config fields:
  public client DSN, environment, release, traces/profiles sample rates,
  max breadcrumbs, allowed tags and `before_send_required`.
- Reject or ignore forbidden fields if they ever appear:
  Sentry auth token, project/org token, relay secret, webhook secret,
  private key, Authorization header, cookie, API key.
- release, environment, platform and app_version tags.
- beforeSend redaction for:
  token, authorization, cookie, connect credentials, node endpoint + port,
  user email unless hashed, local cache payload, full URL query,
  payment credential, IM contact identifier.
- safe breadcrumbs:
  app startup, login/logout, connect start/success/failure, reconnect hint
  received/applied/failed, GeoIP package sync, content fetch, billing entry,
  notification preference update.
- native tunnel errors should be captured with safe context only.
- user-visible failures must remain localized and not expose Sentry internals.

Tests:
- Backend config fetch success/disabled/failure fallback.
- forbidden Sentry fields are ignored and never logged.
- beforeSend removes forbidden fields.
- breadcrumbs contain no secrets.
- Sentry disabled in tests/local when DSN missing.
- platform build still passes.

Completion report must explicitly state that raw App exception data stays in
Sentry and Backend receives only summary via separate Backend task.
```

### App Sentry Runtime Config Status

`TASK-APP-SENTRY-RUNTIME-CONFIG-001` is complete at the integration layer.

Implemented behavior:

- Backend `GET /api/v1/app/observability/config` is the primary Sentry config
  source.
- Backend `enabled:false` is authoritative. It must not fall through to cached
  config or `--dart-define=SENTRY_DSN`.
- `--dart-define=SENTRY_DSN` remains only a local/dev fallback when Backend is
  unreachable.
- `APP_VERSION`, `APP_ENVIRONMENT`, and `SENTRY_DSN` can pass through
  `scripts/local-app.sh`.
- Forbidden Sentry secrets are dropped at parse time and never cached.
- Backend disabled response is not cached; only valid enabled configs are
  cached for offline startup.

Validation:

- `flutter pub get`: PASS.
- `flutter analyze`: PASS with no new warnings/errors.
- `flutter test`: 429 tests PASS.
- `flutter test test/observability_config_test.dart`: 28 tests PASS.
- `flutter build macos`: PASS for universal binary.
- `flutter build web`: PASS.
- iOS simulator build: PASS when run from the safe workdir path verified by
  `TASK-APP-IOS-CODESIGN-ENV-001`.
- Android debug APK: PASS after `TASK-APP-ANDROID-SENTRY-KOTLIN-COMPAT-001`
  (`livemask-app` dev merge `5ce5c6c`).

Next:

- App window has fixed the Android Kotlin mismatch and iOS simulator safe
  workdir path. iOS device signing remains the platform blocker before claiming
  full-platform completion.

## 9. Admin Cursor Prompt

```text
TASK ID: TASK-ADMIN-LOGS-METRICS-001 / TASK-ADMIN-OBSERVABILITY-DETAILS-001
Repo: livemask-admin
Branch: dev

Implement Admin observability UI through Backend APIs only:

Routes:
- /admin/logs
- /admin/audit-logs
- node detail latest logs and metric summary
- App/Sentry exception view inside /admin/logs or /admin/app/exceptions
- payment order logs tab/detail
- notification delivery logs view

UI requirements:
- Chinese default, English fallback through i18n layer.
- Compact operations UI, no marketing hero.
- Tabs or saved filters:
  全部日志, 系统日志, NodeAgent 日志, App/Sentry 异常,
  支付订单日志, 推送/通知日志, Job 日志, 安全日志.
- Filters: family, level, source, component, node, job, actor, payment order,
  provider, app platform, release, time range.
- Redacted metadata drawer.
- Safe copy only for IDs: log_id, request_id, job_run_id, sentry_issue_id,
  payment_order_id, provider event ID.
- Never display raw provider payload, raw stack/context, token, node_secret,
  payment credential or IM contact identifier.
- Production must not silently display mock logs.

Tests:
- route renders.
- low-permission users hidden/403.
- filters build expected query params.
- secret-looking metadata is rendered as redacted.
- empty/error/loading states.

Validation:
- npm run build or npx next build
- relevant tests
- git diff --check
```

## 10. CI/CD Cursor Prompt

```text
TASK ID: TASK-CICD-OBSERVABILITY-SMOKE-001
Repo: livemask-ci-cd
Branch: dev

Implement observability smoke:

Steps:
1. Backend health.
2. Admin login.
3. Backend /metrics contains required names.
4. Job Service /metrics contains required names.
5. NodeAgent /metrics contains required names.
6. NodeAgent uploads safe log batch with HMAC.
7. Backend accepts batch.
8. Job Service ingest succeeds or correctly SKIPs if endpoint not deployed.
9. Admin logs API returns log entry.
10. Node latest logs API returns log entry.
11. Seed/simulate Sentry summary and verify exception family API.
12. Seed/simulate payment order logs and verify timeline API.
13. Seed/simulate notification delivery logs and verify masked contact.
14. Unauthorized access -> 401.
15. User/non-privileged token -> 403.
16. Secret leak scan across every response:
    token, secret, private_key, node_secret, hmac, authorization, cookie,
    payment credential, raw contact identifier, signed URL query.

Local runtime rule:
- Do not docker compose down the user's long-lived local runtime.
- Use targeted service sync/recreate only when explicitly needed.
- Staging smoke must use isolated compose project/network/volume/ports.
```

### CI/CD Verification Status

`TASK-CICD-SENTRY-CONFIG-SMOKE-001` is passed.

- Backend health: PASS.
- Admin login: PASS.
- App-facing Sentry config: PASS with disabled response.
- Forbidden field check: PASS.
- Admin Sentry settings: PASS.
- RBAC: no token -> 401 and user token -> 403 PASS.
- App fallback evidence: expected SKIP because CI/CD does not run App runtime
  tests.
- Secret leak scan: PASS with 0 leaks.

`TASK-CICD-OBSERVABILITY-SMOKE-001` is passed.

- All 23 sections executed with 0 failures.
- Backend, Job Service, and NodeAgent health are reachable.
- Backend / Job Service / NodeAgent `/metrics` expose required names.
- NodeAgent log upload returns HTTP 202.
- Global logs, agent logs, payment logs, notification logs, audit logs, Sentry
  summary/events/performance all return HTTP 200.
- RBAC checks across 14 routes return 401 without token and 403 for user token.
- Secret leak scan reports 0 leaks.
- Expected SKIPs remain non-blocking: cosmetic Job Service health JSON response
  and payment order logs when no order data exists.

The local dev runtime remained running during verification.

## 11. Completion Report Requirements

Every window must include:

- TASK ID
- Repository / Branch / Commit
- Completed content
- Docs / contract impact
- Tests and validation
- Cross-repo impact table
- Unlocked windows
- Blocked windows
- Risks / TODOs
- Next suggested task

Do not close the overall observability Epic until Backend, Job Service,
NodeAgent, App Sentry, Admin and CI/CD all report verified or explicitly
registered blockers.
