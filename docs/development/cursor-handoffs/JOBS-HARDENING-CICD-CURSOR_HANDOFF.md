# Jobs Hardening CI/CD Smoke Cursor Handoff

> Task: `TASK-CICD-JOBS-HARDENING-001`
> Repo: `livemask-ci-cd`
> Scope: End-to-end smoke coverage for job queue hardening — lease mechanism, retry/backoff, dead-letter queues, duplicate lock prevention, job run events, and secret leakage prevention.

## 0. Mandatory Reading

Read before editing code:

1. `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
2. `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`
3. `ai-rules/v3.7/00-Core-Principles.md`
4. `ai-rules/v3.7/13-Multi-Repo-Development.md`
5. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- Work only in `livemask-ci-cd`.
- Do not edit Backend, Job Service, or other repo implementation from this window.
- Do not run `docker compose down` against the long-lived local dev runtime.
- Staging smoke must use isolated compose project, network, volumes and ports.
- Every response must be checked for secret leakage.
- No secret values in job payloads, run params, or events.

## 1. Script

`scripts/jobs-hardening-smoke.sh`

## 2. Required Smoke Steps

1. Wait for Backend health (max 60s).
2. Wait for Job Service health (max 30s).
3. Admin login with `admin@livemask.dev`.
4. **Queue lease**: submit a job and verify worker claims it with lease expiration.
5. **Retry mechanism**: submit a job that fails and verify retry count increments.
6. **Backoff**: verify exponential backoff with jitter between retries.
7. **Dead-letter**: verify terminal-failed jobs land in dead-letter queue.
8. **Duplicate lock**: submit same job with same `unique_key` and verify second is rejected or deduplicated.
9. **Run events**: verify job run lifecycle events (created, running, succeeded/failed, cancelled).
10. **No secret leakage**: verify job payloads, run params, and events contain no secrets (`password_hash`, `node_secret`, `hmac`, `private_key`, `api_key`, `license_key`, etc.).
11. RBAC: no token → 401, user token → 403 on admin job endpoints.
12. Comprehensive secret leak scan across all responses and events.

## 3. API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/admin/api/v1/jobs/stats` | Admin JWT | Job queue statistics |
| GET | `/admin/api/v1/jobs/queues` | Admin JWT | Queue listing |
| GET | `/admin/api/v1/jobs/runs` | Admin JWT | Job run history |
| GET | `/admin/api/v1/jobs/queues/{queue_id}/dead-letter` | Admin JWT | Dead-letter queue |
| GET | `/admin/api/v1/jobs/queues/{queue_id}/leases` | Admin JWT | Active leases |

## 4. Validation

```bash
bash -n scripts/jobs-hardening-smoke.sh
bash scripts/jobs-hardening-smoke.sh
git diff --check
```

## 5. Completion Report Requirements

- TASK ID
- Repo / branch / commit
- Scripts changed
- Exact step table with PASS / SKIP / FAIL
- Secret leak scan result
- Local runtime status
- Staging isolation status
- Which repos are now unblocked or still blocked
