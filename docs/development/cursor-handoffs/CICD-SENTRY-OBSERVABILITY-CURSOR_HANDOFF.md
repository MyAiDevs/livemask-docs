# CI/CD Sentry Config And Observability Smoke Cursor Handoff

> Task group: `TASK-CICD-SENTRY-CONFIG-SMOKE-001` and
> `TASK-CICD-OBSERVABILITY-SMOKE-001`
> Repo: `livemask-ci-cd`
> Scope: End-to-end smoke coverage for App Sentry runtime config, Sentry
> summary ingestion, NodeAgent log ingestion, metrics, Admin observability APIs,
> RBAC and secret-leak scans.

## 0. Mandatory Reading

Read before editing code:

1. `docs/contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md`
2. `docs/contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md`
3. `docs/development/cursor-handoffs/OBSERVABILITY-LOGS-METRICS-CURSOR_HANDOFF.md`
4. `docs/development/cursor-handoffs/ADMIN-SYSTEM-SETTINGS-SCHEDULER-CURSOR_HANDOFF.md`
5. `ai-rules/v3.7/00-Core-Principles.md`
6. `ai-rules/v3.7/04-Multi-Repo-Linkage.md`
7. `ai-rules/v3.7/13-Multi-Repo-Development.md`
8. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- Work only in `livemask-ci-cd`.
- Do not edit Backend, Admin, App, NodeAgent or Job Service implementation
  files from this window.
- Do not run `docker compose down` against the long-lived local dev runtime.
- Local smoke may use existing local runtime and must degrade missing endpoints
  with explicit `SKIP`, not false `PASS`.
- Staging smoke must use isolated compose project, network, volumes and ports.
- Every response used by the smoke must be checked for secret leakage.
- App raw exception data is never uploaded to Backend. Smoke only seeds or
  verifies redacted Sentry summaries.

## 1. Required Scripts

Implement or update these scripts in `livemask-ci-cd`:

```text
scripts/sentry-config-smoke.sh
scripts/observability-smoke.sh
scripts/smoke.sh
.github/workflows/staging-smoke.yml
```

If similar scripts already exist, extend them instead of creating duplicates.

## 2. TASK-CICD-SENTRY-CONFIG-SMOKE-001

```text
TASK ID: TASK-CICD-SENTRY-CONFIG-SMOKE-001
Repo: livemask-ci-cd
Branch: task/TASK-CICD-SENTRY-CONFIG-SMOKE-001
```

Goal:

Verify that Backend, Admin and App Sentry runtime config are wired correctly and
secret-safe.

Required smoke steps:

1. Backend health.
2. Admin login.
3. Read App Sentry config:
   `GET /api/v1/app/observability/config`.
4. Verify enabled or disabled response shape:
   - enabled path has `sentry.enabled=true` and public `dsn`.
   - disabled/missing path has `sentry.enabled=false`.
5. Assert response never contains forbidden fields:
   `auth_token`, `org_token`, `project_token`, `relay_secret`,
   `webhook_secret`, `private_key`, `api_key`, `authorization`, `cookie`,
   `secret_ref`.
6. Admin settings read:
   `GET /admin/api/v1/system-settings/observability` or equivalent section.
7. Low-permission token cannot write Sentry settings: expect `403`.
8. No token on Admin settings API: expect `401`.
9. If Backend supports test update in dev/staging, update public DSN/sample
   rates with safe values and verify audit-safe response.
10. If update endpoint is not deployed, mark as `SKIP`, not `PASS`.
11. Verify App fallback evidence:
   - run App unit test if available, or
   - call a lightweight App test command/script if repo is available, or
   - mark `SKIP` with reason `app_runtime_test_not_available`.
12. Verify no smoke output prints raw DSN query, server token, webhook secret,
   relay secret or Authorization header.

Expected behavior:

- Missing Sentry config is acceptable only as explicit disabled/SKIP state.
- Secret leak is always `FAIL`.
- Auth/RBAC mismatch is `FAIL`, not `SKIP`, once endpoint exists.

## 3. TASK-CICD-OBSERVABILITY-SMOKE-001

```text
TASK ID: TASK-CICD-OBSERVABILITY-SMOKE-001
Repo: livemask-ci-cd
Branch: task/TASK-CICD-OBSERVABILITY-SMOKE-001
```

Goal:

Verify the broader observability pipeline after Sentry config smoke is in place.

Required smoke steps:

1. Backend health.
2. Job Service health.
3. NodeAgent health when available.
4. Admin login.
5. Backend `/metrics` is readable and contains required metric names.
6. Job Service `/metrics` is readable and contains required metric names.
7. NodeAgent `/metrics` is readable and contains required metric names.
8. NodeAgent log upload:
   - register/ensure NodeAgent identity if the local/staging flow supports it.
   - POST safe log batch through Backend `/internal/agent/logs` with Node HMAC.
   - verify `202`/accepted response.
9. Job Service ingest:
   - verify `observability_log_ingest` run or ingestion health.
   - if endpoint is not deployed, explicit `SKIP`.
10. Admin global logs:
    `GET /admin/api/v1/logs`.
11. Admin audit logs:
    `GET /admin/api/v1/audit-logs`.
12. Node latest logs:
    `GET /admin/api/v1/nodes/{node_id}/logs`.
13. Sentry summary:
    - seed/simulate redacted Sentry issue summary if seed API exists, or
    - verify pre-seeded summary endpoint,
    - `GET /admin/api/v1/app/exceptions`.
14. Payment order logs:
    seed/simulate payment timeline if supported and verify redacted API.
15. Notification delivery logs:
    seed/simulate delivery log if supported and verify masked contact.
16. Unauthorized access:
    no token -> `401`.
17. Low-permission access:
    user/non-privileged token -> `403`.
18. Secret leak scan across every collected response.

Forbidden response/output patterns:

```text
token
secret
private_key
node_secret
hmac
authorization
cookie
payment credential
raw contact identifier
signed URL query
sentry_auth_token
webhook_secret
relay_secret
project_token
org_token
```

Required metrics to check when endpoints exist:

```text
livemask_backend_observability_ingest_backlog
livemask_jobservice_observability_ingest_total
livemask_jobservice_observability_dead_letter_total
livemask_nodeagent_up
livemask_nodeagent_log_queue_depth
livemask_nodeagent_event_queue_depth
```

If a metric name is not yet deployed but the endpoint exists, the smoke should
return `FAIL` unless the contract marks that metric as optional. Do not silently
skip deployed endpoints.

## 4. Script Behavior Rules

Use the existing smoke style in `livemask-ci-cd`:

- `PASS` means verified.
- `FAIL` means endpoint exists or should exist but behavior is wrong.
- `SKIP` means dependency/endpoint is not deployed yet and the script records
  the exact reason.
- Summary must count every step.
- Use clear section names.
- Use temp files under safe local temp paths.
- Clean up only temp files created by the script.
- Do not stop the shared local dev runtime.

Recommended script options:

```text
BACKEND_BASE_URL
ADMIN_BASE_URL
JOB_SERVICE_BASE_URL
NODEAGENT_BASE_URL
ADMIN_EMAIL
ADMIN_PASSWORD
SMOKE_ALLOW_SKIP
SMOKE_ENV=local|staging
```

## 5. Integration Points

Update:

```text
scripts/smoke.sh
.github/workflows/staging-smoke.yml
```

Order:

1. health / base smoke
2. jobs smoke
3. sentry-config smoke
4. observability smoke
5. remaining domain smoke

Staging workflow rules:

- Use isolated `infra/docker-compose.staging.yml`.
- Use an isolated compose project name.
- Use separate ports/networks/volumes from local dev.
- Tear down only the staging project created by the workflow.

## 6. Validation

Run in `livemask-ci-cd`:

```bash
bash -n scripts/sentry-config-smoke.sh
bash -n scripts/observability-smoke.sh
bash -n scripts/smoke.sh
bash scripts/sentry-config-smoke.sh
bash scripts/observability-smoke.sh
git diff --check
```

If local runtime is incomplete, the script may finish with SKIPs, but every
step must be accounted for and secret leak scan must still run on collected
responses.

## 7. Completion Report Requirements

Completion report must include:

- TASK ID.
- Repo / branch / commit.
- Scripts changed.
- Workflow changed.
- Exact step table with PASS / SKIP / FAIL.
- Secret leak scan result.
- Local runtime status: explicitly state it was not stopped.
- Staging isolation status.
- Which repos are now unblocked or still blocked.
- Whether CI/CD is ready to turn SKIP into PASS after endpoint deployment.
