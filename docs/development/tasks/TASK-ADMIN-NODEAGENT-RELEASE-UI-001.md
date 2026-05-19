# TASK-ADMIN-NODEAGENT-RELEASE-UI-001 — Admin NodeAgent Release UI

> Owner: Admin / NodeAgent
> Repo: `livemask-admin`
> Status: Completed
> Task branch commit: `bd03ba4`
> Integration branch: `integration/...-20260520020001` (`4c78223`)
> Dev merge commit: `e67c4c7`
> Remote dev ref after final Admin batch: `e541485`
> Completed: 2026-05-20

## 1. Background

The shared Release Control IA requires App Release and NodeAgent Release to share a navigation surface while keeping separate routes, permissions, APIs, and data models.

## 2. Scope

Implement the NodeAgent Release deep-link pages required by the shared release control IA.

## 3. Delivered

- `/admin/nodeagent/releases` exists in the build output.
- `/admin/nodeagent/releases/[id]` exists in the build output.
- App Release and NodeAgent Release remain separated by route, API, permissions, and data model while sharing the release control navigation surface.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-admin` | Adds NodeAgent release list/detail deep links. |
| `livemask-backend` | Must provide real NodeAgent release APIs for production data. |
| `livemask-ci-cd` | Should cover release pages in smoke. |

## 5. Validation

Final Admin dev validation on `e541485`:

```text
npx vitest run PASS (72 passed, 2 files)
npx next build PASS (53 pages compiled)
git diff --check PASS
```

## 6. Follow-up

- Backend NodeAgent release APIs and CI/CD smoke should verify real data.
