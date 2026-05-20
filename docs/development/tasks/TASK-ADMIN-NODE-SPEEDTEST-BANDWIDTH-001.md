# TASK-ADMIN-NODE-SPEEDTEST-BANDWIDTH-001 — Admin Node Speedtest & Capacity UI

> Status: Ready
> Repository: livemask-admin
> Environment: dev-local

## 1. Background

Backend will expose node speedtest reports and bandwidth capacity state. Admin
must surface this data in Node Detail and allow permitted operators to trigger a
manual speedtest without exposing secrets or raw provider internals.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/contracts/nodeagent/NODEAGENT_SPEEDTEST_BANDWIDTH_CONTRACT.md`

## 3. Implementation Scope

Add Node Detail UI sections:

1. Speedtest summary:
   - latest download Mbps;
   - latest upload Mbps;
   - latency/jitter;
   - measured time;
   - result status.
2. Bandwidth capacity:
   - safe capacity Mbps;
   - enforced max bandwidth Mbps;
   - current observed bandwidth Mbps;
   - current load ratio;
   - state badge: healthy/degraded/overloaded/unknown.
3. Manual action:
   - `Run Speedtest`
   - permission-gated;
   - confirmation dialog;
   - disabled when node is offline or another test is running.
4. History table:
   - recent reports;
   - trigger type;
   - result;
   - duration.

API client must use `adminFetch`, real-first with mock fallback only for 404/501.
401/403 must not fallback to mock.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Provides Admin speedtest/capacity APIs. |
| `livemask-admin` | Primary implementation repo. |
| `livemask-ci-cd` | Can verify page/API smoke after UI lands. |
| `livemask-docs` | Records completion evidence. |

## 5. Validation

Run on merged `dev`:

```bash
npx vitest run
npx next build
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- validation output;
- route/page components changed;
- RBAC behavior;
- mock fallback behavior.
