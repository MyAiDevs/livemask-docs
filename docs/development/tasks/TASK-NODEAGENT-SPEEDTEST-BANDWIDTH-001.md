# TASK-NODEAGENT-SPEEDTEST-BANDWIDTH-001 — NodeAgent Speedtest & Bandwidth Cap

> Status: Ready
> Repository: livemask-nodeagent
> Environment: dev-local

## 1. Background

NodeAgent must measure node network capacity and self-limit maximum carried
bandwidth so it does not intentionally exceed 90% of safe measured capacity.
The first implementation should use `github.com/showwin/speedtest-go` unless
local compatibility or licensing concerns require an equivalent adapter.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/contracts/nodeagent/NODEAGENT_SPEEDTEST_BANDWIDTH_CONTRACT.md`

## 3. Implementation Scope

1. Add a speedtest runner abstraction under NodeAgent.
2. Add a `showwin/speedtest-go` backed implementation.
3. Add config fields:
   - `enabled`
   - `min_interval_minutes`
   - `timeout_seconds`
   - `max_parallel_tests`
   - `server_selection`
   - `max_load_ratio`
   - `fallback_capacity_mbps`
4. Clamp `max_load_ratio` to `<= 0.90` even if Backend sends a higher value.
5. Calculate:
   - `safe_capacity_mbps = min(download_mbps, upload_mbps)`
   - `enforced_max_bandwidth_mbps = safe_capacity_mbps * max_load_ratio`
6. Persist last-known-good capacity locally.
7. On failed speedtest, keep LKG capacity.
8. Upload redacted report to Backend:
   - `POST /internal/agent/speedtest-reports`
9. Add local status endpoint, for example:
   - `GET /speedtest/status`
   - `POST /speedtest/run`
10. Expose metrics:
   - `livemask_nodeagent_speedtest_last_download_mbps`
   - `livemask_nodeagent_speedtest_last_upload_mbps`
   - `livemask_nodeagent_bandwidth_capacity_mbps`
   - `livemask_nodeagent_bandwidth_enforced_max_mbps`
   - `livemask_nodeagent_bandwidth_load_ratio`
11. Do not inspect user traffic payload, domains, URLs, DNS queries, or browsing
    history.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must accept reports and return policy config. |
| `livemask-job-service` | Can trigger scheduled checks through Backend. |
| `livemask-admin` | Displays speedtest and capacity results. |
| `livemask-ci-cd` | Validates report upload and 90% cap. |
| `livemask-docs` | Tracks completion evidence. |

## 5. Validation

Run on merged `dev`:

```bash
go test ./...
go vet ./...
go build ./cmd/nodeagent/
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- validation output;
- whether `showwin/speedtest-go` was used directly or through an adapter;
- 90% cap tests;
- LKG behavior tests;
- secret/privacy scan evidence.
