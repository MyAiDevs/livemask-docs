# TASK-CICD-RECONNECT-HINT-RUNTIME-SMOKE-001 — CI/CD Reconnect Hint Runtime Smoke

> Status: Ready
> Repository: livemask-ci-cd
> Environment: dev-local

## 1. Background

Backend now exposes App reconnect runtime APIs and App has reconnect polling
logic. CI/CD must validate the runtime chain:

NodeAgent event -> Backend reconnect hint -> App-facing hint API -> App-facing
connect config API.

This task adds reconnect hint runtime checks to the smoke suite.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-RECONNECT-HINT-RUNTIME-001.md`
- `../livemask-docs/docs/development/tasks/TASK-APP-RECONNECT-STABILITY-001.md`
- `../livemask-docs/docs/development/tasks/TASK-NODEAGENT-PROTOCOL-STABILITY-001.md`
- `../livemask-docs/docs/development/tasks/TASK-CICD-PROTOCOL-STABILITY-001.md`

## 3. Implementation Scope

Enhance existing domain scripts rather than creating duplicate entrypoints when
possible. Preferred targets:

- `scripts/protocol-endpoint-smoke.sh`
- `scripts/smoke.sh`

Required checks:

1. Confirm Backend health.
2. Login as App user and obtain App JWT.
3. Create or discover an active connect session.
4. Call `GET /api/v1/connect/config?session_id=<sessionID>`.
5. Assert response is JSON and does not leak:
   - `node_secret`
   - `hmac`
   - `token`
   - `private_key`
   - `obfs_password`
6. Trigger or simulate NodeAgent `endpoint_ready` event when runtime supports it.
7. Trigger or simulate NodeAgent `rolled_back` event when runtime supports it.
8. Call `GET /api/v1/reconnect-hints?session_id=<sessionID>`.
9. Assert response shape is `{"hints":[...]}`.
10. Assert each hint exposes only safe fields:
    - `hint_id`
    - `reason`
    - `reconnect_after_ms`
    - `expires_at`
11. Assert internal fields are absent:
    - `node_id`
    - `session_id`
    - `config_hash`
    - `rollout_id`
    - `created_at`
12. Classify results:
    - PASS when real runtime works;
    - SKIP when seed data or active session is unavailable;
    - FAIL when endpoint exists but leaks secrets or has invalid shape.

Important:

- Final evidence must run against `dev`, not task branches.
- 401/403 should be explicit RBAC PASS/FAIL, never mock fallback.
- Do not delete Docker volumes or reset local runtime state.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must run dev ref `1442e64` or newer for reconnect runtime endpoints. |
| `livemask-nodeagent` | Event path is used to generate hints when runtime supports it. |
| `livemask-app` | App uses the same response shapes in real client code. |
| `livemask-ci-cd` | Primary implementation repo. |
| `livemask-docs` | Records smoke result and remaining blockers after completion. |

## 5. Validation

Run on merged `dev` before completion:

```bash
bash -n scripts/protocol-endpoint-smoke.sh
bash -n scripts/smoke.sh
bash scripts/local-dev-status.sh
bash scripts/protocol-endpoint-smoke.sh
git diff --check
```

## 6. Completion Report Requirements

Cursor must report:

- task branch commit;
- dev merge commit;
- remote `origin/dev` ref;
- PASS/SKIP/FAIL table for reconnect runtime checks;
- whether Docker dev-local runtime was used;
- exact remaining blockers if any checks remain SKIP.
