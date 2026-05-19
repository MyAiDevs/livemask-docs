# TASK-ADMIN-SENTRY-SETTINGS-RECONCILE-001 — Admin Sentry Settings Reconcile

> Owner: Admin / Observability
> Repo: `livemask-admin`
> Status: Completed
> Task branch commit: `d36f667`
> Integration branch: `integration/...-20260520015901` (`58d296e`)
> Dev merge commit: `d355242`
> Remote dev ref after final Admin batch: `e541485`
> Completed: 2026-05-20

## 1. Background

`origin/task/TASK-ADMIN-SENTRY-SETTINGS-001` was created before the dev merge guard rules. The settings route had to be rebuilt from current `dev` and merged through `dev-merge-guard.sh`.

## 2. Scope

Restore the Admin Sentry settings route/UI from the pre-guard branch into the current `dev` branch without directly merging the stale branch.

## 3. Delivered

- `/admin/settings/observability` exists in the build output.
- Sentry settings API/types/mock dependencies restored.
- Guard merge completed before later Admin tasks.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-admin` | Restores `/admin/settings/observability` UI. |
| `livemask-backend` | Must keep Admin Sentry settings API available. |
| `livemask-ci-cd` | Keeps Sentry config smoke as regression coverage. |

## 5. Validation

Final Admin dev validation on `e541485`:

```text
npx vitest run PASS (72 passed, 2 files)
npx next build PASS (53 pages compiled)
git diff --check PASS
```

## 6. Follow-up

- Backend Sentry settings API must remain available for real mode.
- CI/CD should keep Sentry config smoke as regression coverage.
