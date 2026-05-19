# TASK-DOC-OBSERVABILITY-LOGS-METRICS-001 — Log / Audit / Metric Pipeline

> Status: Ready
> Owner: Docs / Backend / NodeAgent / Job Service / Admin / CI-CD / Monitoring
> Repo: `livemask-docs`
> Related repos: `livemask-backend`, `livemask-nodeagent`,
> `livemask-job-service`, `livemask-admin`, `livemask-ci-cd`

## 1. Background

LiveMask needs first-class observability across Backend, NodeAgent, Job Service,
Admin and CI/CD. Current work has introduced Job Service, protocol endpoint
rollouts, GeoIP, reconnect hints, and dashboard surfaces. The platform now
needs a unified log/audit/metric contract instead of scattered log statements.

The requested scope includes:

- Backend audit/log APIs
- NodeAgent logs delivered through queued ingestion
- NodeAgent self-built Prometheus-compatible metrics
- Backend logs: login, operation, task, system, node, payment
- App exceptions through Sentry, with Backend/Admin storing only redacted
  Sentry issue summaries
- App Sentry runtime config delivered by Backend System Settings through a
  safe client config API
- Payment order logs: order lifecycle, webhook, provider response,
  reconciliation, refund, chargeback and manual adjustment
- Notification delivery logs: Telegram, WhatsApp, Lark, email and push invite,
  dispatch, callback, retry and dead-letter
- Job Service job/task logs
- Admin Node List latest node logs and metric summaries

## 2. Scope

Create:

- `docs/contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md`

Update:

- monitoring README
- contracts README
- backend README
- nodeagent README
- admin README
- task index
- MVP implementation plan

## 3. Contracts

- [Log, Audit, Metric, And Node Observability Pipeline Contract](../../contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md)

The contract defines:

- canonical log entry
- audit log model
- NodeAgent log upload API
- App Sentry exception summary model
- App Sentry runtime config API and safe field boundary
- payment order log timeline model
- notification delivery log model
- Job Service `observability_log_ingest` queue path
- Backend Admin log/audit APIs
- Node-specific latest log API
- Prometheus-compatible metrics for Backend, NodeAgent and Job Service
- Admin UI requirements
- RBAC
- redaction
- retention
- CI/CD smoke requirements

## 4. Cross-Repo Impact

| Repo | Impact | Follow-Up |
| --- | --- | --- |
| `livemask-backend` | Add log tables, audit APIs, NodeAgent log ingestion, App Sentry runtime config API, Sentry summary APIs, payment order logs, notification delivery logs, metrics endpoint, Admin log search | `TASK-BACKEND-OBSERVABILITY-LOGS-001`, `TASK-BACKEND-APP-SENTRY-CONFIG-001`, `TASK-BACKEND-SENTRY-SUMMARY-001`, `TASK-BACKEND-PAYMENT-LOGS-001`, `TASK-BACKEND-NOTIFICATION-LOGS-001` |
| `livemask-nodeagent` | Add local log queue, Backend upload, Prometheus `/metrics`, node metric summaries | `TASK-NODEAGENT-METRICS-LOGS-001` |
| `livemask-job-service` | Add queued observability ingestion job and retry/dead-letter behavior | `TASK-JOBS-OBSERVABILITY-INGEST-001` |
| `livemask-app` | Use Sentry for crash/exception logging, fetch Backend safe Sentry config, safe breadcrumbs, release/environment tags and redaction | `TASK-APP-SENTRY-OBSERVABILITY-001`, `TASK-APP-SENTRY-RUNTIME-CONFIG-001` |
| `livemask-admin` | Add global logs, audit logs, Node List latest logs, node metric panel, App exceptions, payment logs, notification delivery logs | `TASK-ADMIN-LOGS-METRICS-001`, `TASK-ADMIN-OBSERVABILITY-DETAILS-001` |
| `livemask-ci-cd` | Add observability smoke | `TASK-CICD-OBSERVABILITY-SMOKE-001` |
| `livemask-docs` | Contract and index updates | Current task |

## 5. Role Handoff Chain

| Step | From | To | Evidence |
| --- | --- | --- |
| 1 | Product / Ops | Docs | Need logs/metrics/audit/node log view |
| 2 | Docs | Backend / NodeAgent / Job Service | Contract and task mapping |
| 3 | Backend / NodeAgent / Job Service | Admin | APIs for logs, audit, node latest logs, metrics summaries |
| 4 | Admin | CI/CD | UI routes and API behavior for smoke |
| 5 | CI/CD / Monitoring | Product / Ops | Smoke and dashboard evidence |

## 6. Validation

Run:

```bash
bash scripts/check-docs.sh
```

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| Secret leakage in logs | Mandatory redaction and CI smoke secret scan |
| NodeAgent calls Job Service directly | Contract requires NodeAgent -> Backend HMAC -> Job Service queue |
| Metrics high cardinality | Label allowlist and forbidden label rules |
| Backend request path blocks on log writes | Job Service queued ingestion |
| Admin exposes forbidden logs | `logs:read`, `audit:read`, `metrics:read` RBAC |

## 8. Rollback

If the contract needs to be reverted:

1. Remove observability contract links from indexes.
2. Keep existing monitoring docs intact.
3. Re-run `bash scripts/check-docs.sh`.

## 9. Done Criteria

- Observability contract exists.
- Indexes link to it.
- Backend/NodeAgent/Admin/Monitoring docs require it.
- Follow-up implementation tasks are registered.
- Docs check passes.

## 10. Follow-Up Tasks

- `TASK-BACKEND-OBSERVABILITY-LOGS-001`
- `TASK-JOBS-OBSERVABILITY-INGEST-001`
- `TASK-NODEAGENT-METRICS-LOGS-001`
- `TASK-APP-SENTRY-OBSERVABILITY-001`
- `TASK-BACKEND-APP-SENTRY-CONFIG-001`
- `TASK-APP-SENTRY-RUNTIME-CONFIG-001`
- `TASK-ADMIN-SENTRY-SETTINGS-001`
- `TASK-BACKEND-SENTRY-SUMMARY-001`
- `TASK-BACKEND-PAYMENT-LOGS-001`
- `TASK-BACKEND-NOTIFICATION-LOGS-001`
- `TASK-ADMIN-LOGS-METRICS-001`
- `TASK-ADMIN-OBSERVABILITY-DETAILS-001`
- `TASK-CICD-OBSERVABILITY-SMOKE-001`
- `TASK-CICD-SENTRY-CONFIG-SMOKE-001`
