# TASK-CICD-PROTOCOL-LKG-ROLLBACK-SMOKE-001 — CI/CD Protocol LKG / Rollback Smoke

> Status: Ready
> Repository: livemask-ci-cd
> Environment: dev-local

## 1. Background

Backend now exposes real LKG and rollback fields for protocol templates,
eligibility, and assignments. CI/CD must verify those fields in the runtime
smoke suite so regressions do not silently fall back to mock or empty data.

This task adds protocol LKG/rollback API assertions to the existing protocol
stability smoke flow.

## 2. Required Reading

- `../livemask-docs/ai-rules/v3.7/00-Core-Principles.md`
- `../livemask-docs/ai-rules/v3.7/04-Multi-Repo-Linkage.md`
- `../livemask-docs/ai-rules/v3.7/13-Multi-Repo-Development.md`
- `../livemask-docs/docs/development/tasks/TASK-BACKEND-PROTOCOL-LKG-ROLLBACK-API-001.md`
- `../livemask-docs/docs/development/tasks/TASK-NODEAGENT-PROTOCOL-STABILITY-001.md`
- `../livemask-docs/docs/development/tasks/TASK-CICD-PROTOCOL-STABILITY-001.md`

## 3. Implementation Scope

Enhance existing scripts rather than creating duplicate smoke entrypoints unless
there is no safe existing home. Preferred targets:

- `scripts/protocol-endpoint-smoke.sh`
- `scripts/protocol-capability-smoke.sh`
- `scripts/smoke.sh`

Coverage to add:

1. Fetch `GET /admin/api/v1/protocol-templates` and assert LKG fields are
   present in schema, even when values are null.
2. Fetch `GET /admin/api/v1/protocol-templates/{id}` and assert `lkg_version`
   / `lkg_at` behavior.
3. Fetch template eligibility and assert per-node `lkg_version` is present in
   response shape.
4. Fetch `GET /admin/api/v1/protocol-assignments`.
5. Fetch `GET /admin/api/v1/protocol-assignments/{id}` when an assignment ID is
   available.
6. Assert assignment response contains:
   - `lkg_info`
   - `lkg_status`
   - `lkg_rollback_available`
   - `rollback_to_version`
   - `rollback_to_template_version`
   - `previous_assignment_id`
7. If no assignment/LKG seed data exists, report SKIP with explicit reason.
8. If endpoints exist but omit expected fields, report FAIL.
9. Add secret leak scans for protocol config, private key, token, node secret,
   endpoint secret, and full connect config payloads.

Important:

- Final smoke evidence must run against `dev`, not task branches.
- 401/403 must be PASS only for RBAC checks, not converted to mock fallback.
- 404/501 can be SKIP only when endpoint is genuinely not deployed in the
  current environment.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-backend` | Must be on dev ref `9a06111` or newer for real LKG/rollback API fields. |
| `livemask-nodeagent` | Runtime LKG data depends on NodeAgent reporting endpoint readiness. |
| `livemask-admin` | Admin can use this smoke evidence after mock fallback is retired. |
| `livemask-ci-cd` | Primary implementation repo. |
| `livemask-docs` | Records smoke closure evidence after Cursor finishes. |

## 5. Validation

Run on merged `dev` before completion:

```bash
bash -n scripts/protocol-endpoint-smoke.sh
bash -n scripts/protocol-capability-smoke.sh
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
- validation output;
- PASS/SKIP/FAIL table for each new LKG/rollback check;
- whether smoke used Docker dev-local services;
- any remaining Backend/Admin/NodeAgent runtime blockers.
