# TASK-DOC-ADMIN-JOBS-001 - Admin Job Center / Scheduler Contract

- 状态：Ready
- Owner：Docs / Job Service / Backend / Admin / CI-CD
- 创建日期：2026-05-18
- 目标完成日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-job-service`, `livemask-backend`, `livemask-admin`, `livemask-ci-cd`
- 关联里程碑：MVP Operational Control Plane

## 1. Background

`/admin/geoip` 当前把 `Trigger Update` 作为 GeoIP 页面内的动作暴露。这个形态只能作为临时 MVP shortcut，不能作为长期架构。

LiveMask 后续会持续增加运营任务：

- GeoIP source update / verify
- NodeAgent binary rollout / rollback
- NodeAgent config publish / rollback
- Content publish / archive schedules
- Website sitemap / RSS rebuild
- Dashboard daily aggregation
- Billing reconciliation
- Session / device cleanup
- CI smoke and task-sync triggers

这些任务需要统一的 `Run Now`、定时、重试、取消、运行历史、事件日志、审计和 RBAC。考虑到多 NodeAgent rollout/probe/config 任务会产生批量 fan-out、限速、失败重试和回滚需求，Job 执行能力必须从第一版开始拆成独立 `livemask-job-service`，Backend 只作为 Admin API Gateway 和 domain boundary。

## 2. Scope

### In Scope

- 定义 Admin Job Center / Scheduler contract。
- 定义 job definitions、job runs、job events、job schedules。
- 定义 `/admin/jobs` 产品路由。
- 定义独立 `livemask-job-service` 部署边界。
- 定义 Backend Admin Gateway API。
- 定义 DB-backed queue、worker pool、retry/backoff、lease、locking。
- 定义 RBAC：`jobs:read`, `jobs:execute`, `jobs:write`。
- 定义 GeoIP trigger migration 边界。
- 登记 Job Service/Backend/Admin/CI 后续任务。

### Out of Scope

- 不实现 Job Service。
- 不实现 Admin `/admin/jobs` 页面。
- 不移除现有 GeoIP trigger shortcut。
- 不提供任意 shell command runner。
- 不存储或展示任何 credential 明文。

## 3. Contracts

- API：[Admin Job Center / Scheduler Contract](../../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- Config：后续 Job Service 实现应增加 worker count、lease TTL、retry/backoff、queue polling interval、service auth config。
- Events：Job run events 见契约第 4.4 节。
- Error Codes：`JOB_NOT_FOUND`, `JOB_DISABLED`, `JOB_INVALID_PARAMETERS`, `JOB_ALREADY_RUNNING`, `JOB_SCHEDULER_UNAVAILABLE`, `JOB_QUEUE_UNAVAILABLE`, `JOB_RETRY_EXHAUSTED` 等见契约第 14 节。
- State Machines：`queued -> running -> succeeded/failed/cancelled/skipped/blocked`。

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-job-service` | 新独立服务；queue、worker、scheduler、retry/backoff、locks、internal API | 后续 `TASK-JOBS-SERVICE-001` | service unit/integration tests, worker smoke |
| `livemask-backend` | 新增 Admin Job Gateway、RBAC、audit attribution、service auth integration | 后续 `TASK-BACKEND-JOBS-GATEWAY-001` | `go test ./...`, Admin API smoke |
| `livemask-admin` | 新增 `/admin/jobs`、run history、schedule UI；GeoIP trigger 迁移 | 后续 `TASK-ADMIN-JOBS-001` | `npm run build`, UI smoke |
| `livemask-ci-cd` | 新增 Job Center smoke | 后续 `TASK-CICD-JOBS-001` | `bash scripts/jobs-smoke.sh` |
| `livemask-docs` | 新增 contract 和任务索引 | 当前任务 | `bash scripts/check-docs.sh` |
| `livemask-nodeagent` | 无直接改动；NodeAgent rollout/probe/config job 后续由 Job Service fan-out | 后续 `TASK-JOBS-NODEAGENT-001` | N/A |
| `livemask-app` | 无直接改动 | 无 | N/A |
| `livemask-website` | 无直接改动；SEO rebuild job 后续可接入 | 后续可选 | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Docs | Trigger Update must be first-class Job Center | Scope too broad |
| 2 | Docs | Job Service / Backend | Contract + service boundary + API/RBAC/error model | Missing queue/worker/backoff rules |
| 3 | Job Service / Backend | Admin | Gateway API contract + mock/real response examples | API drift |
| 4 | Job Service / Backend / Admin | CI-CD | Smoke scenarios and credentials redaction rules | Unstable local runtime |
| 5 | CI-CD / QA | Product | Smoke output + residual risks | Secret leakage or missing audit |

## 6. Implementation Plan

- [x] Add `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`.
- [x] Link contract from `docs/contracts/README.md`.
- [x] Link Admin job-center rules from `docs/admin/README.md`.
- [x] Register task and follow-up tasks in `docs/development/tasks/README.md`.
- [x] Reference Job Center from GeoIP hardening and credential contracts.
- [ ] Job Service implements `TASK-JOBS-SERVICE-001`.
- [ ] Backend implements `TASK-BACKEND-JOBS-GATEWAY-001`.
- [ ] Admin implements `TASK-ADMIN-JOBS-001`.
- [ ] CI/CD implements `TASK-CICD-JOBS-001`.

## 7. Validation Plan

- [x] Contract checks with `bash scripts/check-docs.sh`.
- [ ] Job Service unit/integration tests in follow-up task.
- [ ] Backend gateway unit/integration tests in follow-up task.
- [ ] Admin build/UI tests in follow-up task.
- [ ] CI smoke in follow-up task.
- [ ] Manual verification that GeoIP trigger links to Job Center after Admin implementation.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Job Center becomes arbitrary command runner | High security risk | Only registered job types with schemas; no shell input | Job Service / Backend |
| Secret leakage in job events | Credential compromise | Redaction and smoke secret scans | Job Service / Backend / CI |
| Duplicate jobs corrupt state | Artifact or rollout conflict | Lock scope per job type | Job Service |
| Job Service adds local runtime complexity | Dev friction | Fixed port, local-dev sync support, no docker down | CI-CD |
| Feature pages keep separate schedulers | UX and audit fragmentation | Contract requires migration to `/admin/jobs` | Admin |

## 9. Rollback

- 回滚触发条件：契约方向被产品否定或独立 Job Service 方案发现不可行。
- 回滚步骤：删除 Job Center contract links and task entries；保留 GeoIP feature-local trigger as MVP shortcut。
- 回滚验证：`bash scripts/check-docs.sh`。

## 10. Completion Evidence

- PR：TBD
- Commit：TBD
- Test output：`bash scripts/check-docs.sh`
- Screenshots / logs：N/A
- 文档链接：[Admin Job Center / Scheduler Contract](../../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- Dashboard / alert：N/A
- Product / support note：GeoIP trigger is the first migration target.

## 11. Follow-up

- `TASK-JOBS-SERVICE-001`
- `TASK-BACKEND-JOBS-GATEWAY-001`
- `TASK-ADMIN-JOBS-001`
- `TASK-CICD-JOBS-001`
- `TASK-JOBS-GEOIP-001`
- `TASK-JOBS-NODEAGENT-001`
- `TASK-JOBS-CONTENT-001`
- `TASK-JOBS-DASHBOARD-001`
