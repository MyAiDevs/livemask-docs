# TASK-BACKEND-NODE-SPEEDTEST-BANDWIDTH-001 — Backend Node Speedtest & Capacity APIs

> Status: Ready
> Repository: livemask-backend
> Environment: dev-local

## 1. Background

NodeAgent will report local speedtest results and enforced bandwidth caps.
Backend must persist reports, calculate authoritative capacity state, expose
Admin APIs, and provide internal executor endpoints for Job Service.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/contracts/nodeagent/NODEAGENT_SPEEDTEST_BANDWIDTH_CONTRACT.md`

## 3. Implementation Scope

1. Add schema for:
   - `node_speedtest_reports`
   - `node_bandwidth_capacity`
2. Add Node HMAC endpoint:
   - `POST /internal/agent/speedtest-reports`
3. Add Admin APIs:
   - `GET /admin/api/v1/nodes/{node_id}/speedtest-reports`
   - `GET /admin/api/v1/nodes/{node_id}/bandwidth-capacity`
   - `POST /admin/api/v1/nodes/{node_id}/speedtest/run`
4. Add internal executor API:
   - `POST /internal/job-executors/nodeagent-speedtest/run`
5. Enforce `max_load_ratio <= 0.90` server-side.
6. Reject reports with invalid negative/NaN/absurd Mbps values.
7. Store only safe aggregate measurements.
8. Do not store packet payload, raw domains, URLs, DNS queries, or user traffic
   details.
9. Emit audit/events for manual speedtest trigger and capacity state changes.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-nodeagent` | Uploads reports and receives policy config. |
| `livemask-job-service` | Calls internal executor API. |
| `livemask-admin` | Consumes Admin speedtest/capacity APIs. |
| `livemask-ci-cd` | Smoke validates endpoints and cap calculation. |
| `livemask-docs` | Records completion evidence. |

## 5. Validation

Run on merged `dev`:

```bash
go test ./internal/node/... ./internal/nodeagent/... -count=1
go test ./... -count=1
go vet ./...
go build ./...
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- validation output;
- DB schema summary;
- API list;
- 90% cap validation;
- no-secret/no-payload evidence.
