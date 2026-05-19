# TASK-DOC-APP-RUNTIME-GOVERNANCE-001 — App Runtime Governance Config

> Status: Ready
> Owner: Docs / Backend / Admin / App / CI-CD
> Repo: `livemask-docs`
> Related repos: `livemask-backend`, `livemask-admin`, `livemask-app`,
> `livemask-ci-cd`

## 1. Background

The old v3.6 docs already described `vpn_client_governance` as a dynamic App
resource and connection governance config. It controls memory, health checks,
reconnect backoff, circuit breaker behavior and platform overrides. The config
now needs to be upgraded into the current docs-first, multi-repo contract
system.

This task defines `app_runtime_governance` as a first-class contract alongside
Sentry runtime config, but separate from it:

- Sentry config controls crash/exception observability.
- App runtime governance controls performance, resources, reconnect and cache
  behavior.

## 2. Scope

Create:

- `docs/contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md`
- `docs/development/cursor-handoffs/APP-RUNTIME-GOVERNANCE-CURSOR_HANDOFF.md`

Update:

- contracts index
- config contract index/core config notes
- app/backend/admin READMEs
- system settings contract
- task index
- MVP implementation plan

## 3. Contract

- [App Runtime Governance Config Contract](../../contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md)

The contract defines:

- `GET /api/v1/app/runtime-config`
- `app.runtime_governance` System Settings section
- resource limits, behavior, performance and platform override schema
- validation ranges
- App last-known-good behavior
- Admin preview/publish/rollback
- privacy and secret boundaries
- CI/CD smoke requirements

## 4. Cross-Repo Impact

| Repo | Impact | Follow-Up |
| --- | --- | --- |
| `livemask-backend` | Versioned config storage, validation, Admin APIs, App runtime-config API | `TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001` |
| `livemask-admin` | `/admin/settings/app-runtime` UI, preview/publish/rollback | `TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001` |
| `livemask-app` | Fetch/cache/validate/apply runtime governance config | `TASK-APP-RUNTIME-GOVERNANCE-001` |
| `livemask-ci-cd` | Smoke after Backend/Admin/App finish | `TASK-CICD-APP-RUNTIME-GOVERNANCE-SMOKE-001` |
| `livemask-docs` | Contract and handoff docs | Current task |

## 5. Validation

Run:

```bash
bash scripts/check-docs.sh
git diff --check
```

## 6. Done Criteria

- Contract exists and is linked from relevant indexes.
- Cursor handoff gives concrete prompts per repo.
- Backend/Admin/App/CI-CD task IDs are registered.
- Docs checks pass.
