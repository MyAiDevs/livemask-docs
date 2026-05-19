# Dashboard CI/CD Smoke Cursor Handoff

> Task: `TASK-CICD-DASHBOARD-001`
> Repo: `livemask-ci-cd`
> Scope: End-to-end smoke coverage for Admin Control Plane Dashboard — traffic flows, countries, bandwidth trend, top-users, mock badge enforcement, empty/error state handling.

## 0. Mandatory Reading

Read before editing code:

1. `docs/contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md`
2. `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
3. `ai-rules/v3.7/00-Core-Principles.md`
4. `ai-rules/v3.7/13-Multi-Repo-Development.md`
5. `ai-rules/v3.7/16-Task-Completion-Report.md`

Hard rules:

- Work only in `livemask-ci-cd`.
- Do not edit Backend, Admin, or other repo implementation from this window.
- Do not run `docker compose down` against the long-lived local dev runtime.
- Local smoke may use existing local runtime and must degrade missing endpoints with explicit `SKIP`, not false `PASS`.
- Staging smoke must use isolated compose project, network, volumes and ports.
- Every response must be checked for secret leakage.

## 1. Script

`scripts/dashboard-smoke.sh`

## 2. Required Smoke Steps

1. Wait for Backend health (max 60s).
2. Admin login with `admin@livemask.dev`.
3. `GET /admin/api/v1/dashboard/overview` — verify `generated_at` timestamp.
4. `GET /admin/api/v1/dashboard/control-plane` — verify 3D/traffic summary.
5. `GET /admin/api/v1/dashboard/traffic/flows` — verify traffic flow data.
6. `GET /admin/api/v1/dashboard/traffic/countries` — verify country breakdown.
7. `GET /admin/api/v1/dashboard/traffic/bandwidth-trend` — verify bandwidth timeline.
8. `GET /admin/api/v1/dashboard/traffic/top-users` — verify top users list.
9. `GET /admin/api/v1/dashboard/jobs/summary` — verify job status summary.
10. `GET /admin/api/v1/dashboard/geoip/summary` — verify GeoIP summary.
11. `GET /admin/api/v1/dashboard/content/summary` — verify content summary.
12. `GET /admin/api/v1/dashboard/reconnect/summary` — verify reconnect summary.
13. Mock badge enforcement — if mock data detected, record as `FAIL` not `SKIP`.
14. Empty/error state handling — verify graceful empty/error response.
15. No token on any dashboard endpoint → `401`.
16. User (low-permission) token on dashboard endpoints → `403`.
17. Secret leak scan across all collected responses.

## 3. API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/admin/api/v1/dashboard/overview` | Admin JWT | Overview metrics |
| GET | `/admin/api/v1/dashboard/control-plane` | Admin JWT | Control plane summary |
| GET | `/admin/api/v1/dashboard/traffic/flows` | Admin JWT | Traffic flow between countries |
| GET | `/admin/api/v1/dashboard/traffic/countries` | Admin JWT | Traffic by country |
| GET | `/admin/api/v1/dashboard/traffic/bandwidth-trend` | Admin JWT | Bandwidth time series |
| GET | `/admin/api/v1/dashboard/traffic/top-users` | Admin JWT | Top users by usage |
| GET | `/admin/api/v1/dashboard/jobs/summary` | Admin JWT | Job queue summary |
| GET | `/admin/api/v1/dashboard/geoip/summary` | Admin JWT | GeoIP summary |
| GET | `/admin/api/v1/dashboard/content/summary` | Admin JWT | Content summary |
| GET | `/admin/api/v1/dashboard/reconnect/summary` | Admin JWT | Reconnect hint summary |

## 4. Validation

```bash
bash -n scripts/dashboard-smoke.sh
bash scripts/dashboard-smoke.sh
git diff --check
```

If local runtime is incomplete, the script may finish with SKIPs, but every step must be accounted for.

## 5. Completion Report Requirements

- TASK ID
- Repo / branch / commit
- Scripts changed
- Exact step table with PASS / SKIP / FAIL
- Secret leak scan result
- Local runtime status (explicitly state not stopped)
- Staging isolation status
- Which repos are now unblocked or still blocked
