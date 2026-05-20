# TASK-DOC-NODEAGENT-SPEEDTEST-BANDWIDTH-001 — NodeAgent Speedtest & Bandwidth Contract

> Status: Ready
> Repository: livemask-docs
> Environment: docs

## 1. Background

LiveMask needs node-level self speedtest and dynamic bandwidth-capacity control.
NodeAgent should measure its own network speed, report safe results to Backend,
and enforce a maximum carried bandwidth that never exceeds 90% of measured safe
capacity.

## 2. Implemented Scope

| File | Change |
| --- | --- |
| `docs/contracts/nodeagent/NODEAGENT_SPEEDTEST_BANDWIDTH_CONTRACT.md` | Defines speedtest report schema, capacity model, APIs, Job types, Admin UI requirements, CI/CD smoke, and 90% cap rule. |

## 3. Contract Summary

- NodeAgent runs local speedtest using `showwin/speedtest-go` or equivalent.
- Backend owns policy, persistence, Admin APIs, and internal executor API.
- Job Service triggers scheduled/manual tests through Backend executor APIs.
- Admin displays latest capacity and current enforced bandwidth cap.
- CI/CD validates no secret leak and cap `<= 90%`.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-nodeagent` | Implement speedtest runner, report upload, LKG capacity, and bandwidth cap enforcement. |
| `livemask-backend` | Persist reports/capacity, expose Admin APIs, provide policy config, and implement executor API. |
| `livemask-job-service` | Add scheduled/manual speedtest job executors. |
| `livemask-admin` | Add Node Detail speedtest/capacity UI. |
| `livemask-ci-cd` | Add speedtest/capacity smoke. |

## 5. Validation

```bash
bash scripts/check-docs.sh
git diff --check
```

## 6. Completion Criteria

- [x] Contract exists.
- [x] Cross-repo implementation tasks are created.
- [x] 90% maximum load rule is explicit.
- [x] No payload/user traffic inspection is allowed.
