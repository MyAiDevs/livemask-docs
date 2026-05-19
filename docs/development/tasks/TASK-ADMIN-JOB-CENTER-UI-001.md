# TASK-ADMIN-JOB-CENTER-UI-001 — Admin Job Center UI

> Owner: Admin / Job Service
> Repo: `livemask-admin`
> Status: Completed with Backend/API smoke follow-up retained
> Task branch commit: `d927169`
> Integration branch: `integration/...-20260520020306` (`415da4a`)
> Dev merge commit: `99d7360`
> Remote dev ref after final Admin batch: `e541485`
> Completed: 2026-05-20

## 1. Background

Long-running scheduler and job operations must live in a standalone Job Center instead of being embedded inside single feature pages.

## 2. Scope

Implement Admin Job Center pages for job definitions, runs, schedules, and run details.

## 3. Delivered

- `/admin/jobs` exists in the build output.
- `/admin/jobs/runs` exists in the build output.
- `/admin/jobs/runs/[id]` exists in the build output.
- `/admin/jobs/schedules` exists in the build output.
- `/admin/jobs/schedules/[id]` exists in the build output.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-admin` | Adds Job Center list, run, schedule, and detail pages. |
| `livemask-job-service` | Provides the backing job definitions/runs/schedules APIs. |
| `livemask-ci-cd` | Should verify scheduler CRUD and run status in smoke. |

## 5. Validation

Final Admin dev validation on `e541485`:

```text
npx vitest run PASS (72 passed, 2 files)
npx next build PASS (53 pages compiled)
git diff --check PASS
```

## 6. Follow-up

- CI/CD should verify real Job Service scheduler/run APIs.
- `TASK-ADMIN-TEST-EXPANSION-001` completed at Admin dev ref `0698238`, adding route existence, RBAC, mock fallback, permission block, and API client pattern tests.
