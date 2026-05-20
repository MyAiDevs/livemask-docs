# TASK-JOBS-NODEAGENT-SPEEDTEST-SCHEDULE-001 — Job Service NodeAgent Speedtest Schedule

> Status: Ready
> Repository: livemask-job-service
> Environment: dev-local

## 1. Background

Backend owns speedtest policy and node selection, while Job Service owns
scheduled/manual job execution. Job Service must call Backend internal executor
APIs to trigger bounded NodeAgent speedtests and capacity aggregation.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/contracts/nodeagent/NODEAGENT_SPEEDTEST_BANDWIDTH_CONTRACT.md`
- `../livemask-docs/docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`

## 3. Implementation Scope

Add job types:

| Job Type | Backend Path | Trigger |
| --- | --- | --- |
| `nodeagent_speedtest_run` | `/internal/job-executors/nodeagent-speedtest/run` | manual/scheduled |
| `nodeagent_bandwidth_capacity_aggregate` | `/internal/job-executors/nodeagent-speedtest/capacity-aggregate` | scheduled |

Parameters:

```json
{
  "node_id": "optional",
  "target_filter": ["region:sg", "status:active"],
  "force": false,
  "dry_run": false
}
```

Rules:

- Job Service must not call NodeAgent directly.
- Job Service must not perform speedtest itself.
- Job Service must not calculate billing or reward amounts.
- Reject secret-looking params.
- Use retry/backoff for transient Backend errors.
- 4xx should be treated as blocked/permanent failure.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must implement internal executor endpoints. |
| `livemask-nodeagent` | Receives Backend-triggered measurement intent. |
| `livemask-admin` | Can expose manual run through Job Center or Node Detail action. |
| `livemask-ci-cd` | Smoke validates job definition and trigger path. |
| `livemask-docs` | Records completion evidence. |

## 5. Validation

Run on merged `dev`:

```bash
go test ./...
go vet ./...
go build ./cmd/job-service/
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- validation output;
- job definitions added;
- Backend executor paths;
- retry/backoff and forbidden-key tests.
