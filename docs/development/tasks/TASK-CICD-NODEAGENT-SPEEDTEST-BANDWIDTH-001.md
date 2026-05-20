# TASK-CICD-NODEAGENT-SPEEDTEST-BANDWIDTH-001 — CI/CD NodeAgent Speedtest & Bandwidth Smoke

> Status: Ready
> Repository: livemask-ci-cd
> Environment: dev-local

## 1. Background

NodeAgent speedtest and bandwidth cap enforcement require runtime smoke
coverage because bugs can overload hosts or silently disable capacity control.

This task adds smoke coverage for report upload, 90% cap calculation, Job
Service trigger path, Admin APIs, and secret leak boundaries.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/contracts/nodeagent/NODEAGENT_SPEEDTEST_BANDWIDTH_CONTRACT.md`

## 3. Implementation Scope

Add or enhance a smoke script, preferably:

- `scripts/nodeagent-speedtest-smoke.sh`
- and wire it into `scripts/smoke.sh`

Smoke checks:

1. Backend health.
2. NodeAgent health/metrics.
3. Backend rejects unauthenticated speedtest report.
4. Backend accepts HMAC-auth redacted speedtest report.
5. Backend calculates `enforced_max_bandwidth_mbps <= safe_capacity_mbps * 0.9`.
6. Admin capacity endpoint returns latest state.
7. Job Service lists `nodeagent_speedtest_run`.
8. Job Service can create a dry-run speedtest run.
9. Secret leak scan checks:
   - `node_secret`
   - `hmac`
   - `private_key`
   - packet payload markers
   - raw domains / URLs
10. If live speedtest cannot run in CI, use dry-run or seeded report path and
    mark real external measurement as SKIP, not PASS.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must expose report and Admin capacity APIs. |
| `livemask-nodeagent` | Must expose speedtest status/metrics and upload reports. |
| `livemask-job-service` | Must expose speedtest job definitions. |
| `livemask-admin` | Can be checked by Admin API/page smoke after UI lands. |
| `livemask-ci-cd` | Primary implementation repo. |

## 5. Validation

Run on merged `dev`:

```bash
bash -n scripts/nodeagent-speedtest-smoke.sh
bash -n scripts/smoke.sh
bash scripts/local-dev-status.sh
bash scripts/nodeagent-speedtest-smoke.sh
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- PASS/SKIP/FAIL table;
- whether external speedtest was skipped;
- whether 90% cap check passed;
- remaining runtime blockers.
