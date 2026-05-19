# TASK-ADMIN-TEST-EXPANSION-001

> Owner: Admin / QA
> Repo: `livemask-admin`
> Status: Completed
> Environment: dev-local

## 1. Background

Admin control-plane pages were merged to `dev`, but test coverage lagged behind
the new route surface. The project needed repeatable checks for route existence,
RBAC, API client fallback rules, mock indicators, and no-mock-success mutation
behavior.

## 2. Scope

Expand system test coverage for Admin control-plane pages that had been merged
to `dev`: System Settings, Job Center, Protocol, NodeAgent Release, App Release,
Sentry Settings, RBAC, route existence, and mock fallback rules.

## 3. Completion Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-ADMIN-TEST-EXPANSION-001` |
| Task branch commit | `a037974` |
| Dev merge commit | `0698238` |
| Remote dev ref | `0698238` |
| Validation | `npx vitest run` PASS, `npx next build` PASS, `git diff --check` PASS |

## 4. Cross-Repo Impact

| Repo | Status |
| --- | --- |
| `livemask-admin` | Completed |
| `livemask-backend` | Can implement missing real APIs without breaking Admin tests |
| `livemask-ci-cd` | Can extend smoke now that Admin unit/integration tests exist |
| `livemask-docs` | This task records completion evidence |

## 5. Delivered Tests

Added 7 test files plus 1 setup file, covering 168 tests:

| File | Coverage |
| --- | --- |
| `src/__tests__/admin-http-client.test.ts` | AdminApiError classification, rawAdminFetch, publicFetch |
| `src/__tests__/api-client-patterns.test.ts` | Domain API client fallback/propagation rules |
| `src/__tests__/mock-badge.test.tsx` | MockBadge render and styling |
| `src/__tests__/permission-block.test.tsx` | PermissionBlock render and icon |
| `src/__tests__/rbac-permissions.test.ts` | Admin/super_admin bypass and domain read/write permissions |
| `src/__tests__/route-existence.test.ts` | Settings, jobs, protocol, NodeAgent route files |
| `src/__tests__/mock-fallback-api.test.ts` | 404/501 mock fallback, 401/403 propagation, mutation failure |
| `src/__tests__/setup.ts` | jest-dom matchers |

## 6. Verified Rules

- 404/501 read APIs may use mock fallback with visible mock marker.
- 401/403 must propagate and must not fall back to mock.
- Network error read APIs may fall back to mock.
- Mutation APIs must not create mock success.
- Business API clients use `adminFetch`; raw fetch remains limited to auth/http
  client infrastructure.
- Admin/super_admin bypass and per-domain permissions are tested.

## 7. Remaining Backend Dependencies

The following Admin domains still depend on Backend APIs for full real-data
operation. Current Admin tests verify safe fallback behavior until those APIs are
implemented:

- `/admin/api/v1/system-settings/*`
- `/admin/api/v1/jobs/*`
- `/admin/api/v1/protocol-templates/*`
- `/admin/api/v1/protocol-rollouts/*`
- `/admin/api/v1/nodeagent/releases/*`
- `/admin/api/v1/system-settings/observability*`

## 8. Validation

```text
npx vitest run   PASS (168/168)
npx next build   PASS (57 pages)
git diff --check PASS
```
