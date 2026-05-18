# TASK-DOC-JOB-QUEUE-MATRIX-001 — Job Queue Usage Matrix

> Status: Ready  
> Owner: Docs / Backend / Job Service / NodeAgent / Admin / App / CI-CD  
> Repo: `livemask-docs`  
> Related repos: `livemask-job-service`, `livemask-backend`,
> `livemask-nodeagent`, `livemask-admin`, `livemask-app`,
> `livemask-website`, `livemask-ci-cd`

## 1. Background

LiveMask now has a dedicated `livemask-job-service`. The next risk is that new
Backend and NodeAgent work may still implement long-running operations as direct
HTTP handlers or one-off feature buttons.

The project needs a global rulebook that answers:

- Which scenarios must use queue/worker/retry/backoff?
- Which scenarios may remain synchronous?
- Where do Backend, Job Service, NodeAgent, App, Admin, CI/CD boundaries sit?
- How should DB and Redis be used?
- What must future Backend and NodeAgent tasks read before implementation?

## 2. Scope

Create a cross-repo contract:

- `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`

Update indexes and project README documents so the matrix becomes mandatory
reference material for Backend and NodeAgent development.

## 3. Requirements

The matrix must cover at minimum:

- GeoIP update/verify/sign/delta/cleanup
- NodeAgent binary rollout/rollback
- NodeAgent config publish/rollback
- NodeAgent protocol rollout and endpoint probe
- App GeoIP and content feed consequences
- Content publish/archive and Website SEO rebuild
- Dashboard traffic aggregation
- Billing reconciliation, webhooks, subscription sweeps
- Session/device cleanup
- Notifications
- Security scans and secret rotation verification
- CI/CD smoke and task-sync
- Data export and audit retention
- Support bulk actions

For each scenario, define:

- classification: `queue_required`, `queue_recommended`,
  `synchronous_allowed`, or `outbox_required`
- trigger type
- lock scope
- required notes and safety boundaries

## 4. Cross-Repo Impact

| Repo | Impact | Follow-Up | Validation |
| --- | --- | --- | --- |
| `livemask-docs` | Adds queue matrix contract and indexes it as mandatory reference | Current task | `bash scripts/check-docs.sh` |
| `livemask-job-service` | Must implement queue/lease/retry/schedule mechanics according to matrix | `TASK-JOBS-QUEUE-002`, `TASK-JOBS-SCHEDULER-001` | Go tests + jobs smoke |
| `livemask-backend` | Must use Backend Job Gateway for queue-required Admin/cron/fan-out workflows | `TASK-BACKEND-JOBS-GATEWAY-001` | Go tests + Admin API smoke |
| `livemask-nodeagent` | Must remain pull-safe and use Backend assignments/manifests for fleet operations | `TASK-JOBS-NODEAGENT-001` | NodeAgent tests + rollout smoke |
| `livemask-admin` | Must route generic triggers/schedules/history through `/admin/jobs` | `TASK-ADMIN-JOBS-001` | Build + UI smoke |
| `livemask-app` | Must consume safe Backend outputs and never call Job Service directly | App feature tasks | Flutter tests/builds |
| `livemask-website` | Must treat SEO rebuild/cache purge as queue-driven when long-running | Website SEO follow-up | Website build + SEO smoke |
| `livemask-ci-cd` | Must smoke queue-required workflows and local runtime sync | `TASK-CICD-JOBS-HARDENING-001` | `bash scripts/jobs-smoke.sh` |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Architecture | Docs | Requirement to avoid direct long-running Backend handlers | Missing scenario inventory |
| 2 | Docs | Backend / NodeAgent | Queue matrix and mandatory gates | API/domain drift |
| 3 | Backend | Job Service | Validated run creation and service-auth parameters | Missing service auth |
| 4 | Job Service | Backend / Admin | Run status, events, retry/lock behavior | Missing event redaction |
| 5 | CI/CD / QA | Product | Smoke evidence for queue, auth, RBAC, secret leak | Local runtime instability |

## 6. Mandatory Architecture Rules

- Backend must not execute queue-required work synchronously in request
  handlers.
- NodeAgent fleet workflows must be pull-safe and coordinated through Backend
  and Job Service.
- PostgreSQL is the source of truth for job state.
- Redis is allowed only as cache/notification/rate-limit optimization.
- Admin calls Backend, never Job Service directly.
- App never calls Job Service or receives service/vendor secrets.

## 7. Validation

Run:

```bash
bash scripts/check-docs.sh
```

## 8. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Backend keeps adding one-off long handlers | Future outages and migration debt | Matrix is mandatory Backend README reference |
| NodeAgent rollout fan-out bypasses Job Service | Fleet overload or unsafe rollback | NodeAgent README requires matrix check |
| Redis treated as durable queue | Lost jobs on Redis restart | Matrix defines PostgreSQL as source of truth |
| Job events leak secrets | Credential compromise | Redaction rules and CI smoke secret scans |
| Admin feature pages duplicate schedulers | Fragmented audit and UX | Job Center contract requires migration |

## 9. Rollback

If this contract is found too broad or incorrect:

1. Revert links to `JOB_QUEUE_USAGE_MATRIX.md`.
2. Keep `ADMIN_JOB_SCHEDULER_CONTRACT.md` as the narrower Job Center contract.
3. Open a follow-up task to split the matrix by domain.
4. Re-run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Contract: `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
- Indexes: contracts, backend, nodeagent, admin, app, website, operations, root docs, MVP plan, task README
- Validation: `bash scripts/check-docs.sh`

## 11. Done Criteria

- Queue matrix document exists.
- `docs/contracts/README.md` links the matrix.
- `docs/backend/README.md` requires Backend developers to read it.
- `docs/nodeagent/README.md` requires NodeAgent developers to read it.
- `docs/admin/README.md` references the Admin Job Center and queue matrix.
- `docs/app/README.md` references App behavior after queued workflows.
- `docs/README.md` and MVP plan index the matrix.
- Task index includes this TASK.

## 12. Follow-Up Implementation Tasks

- `TASK-BACKEND-JOBS-GATEWAY-001`
- `TASK-ADMIN-JOBS-001`
- `TASK-JOBS-QUEUE-002`
- `TASK-JOBS-SCHEDULER-001`
- `TASK-JOBS-GEOIP-001`
- `TASK-JOBS-NODEAGENT-001`
- `TASK-JOBS-CONTENT-001`
- `TASK-CICD-JOBS-HARDENING-001`
