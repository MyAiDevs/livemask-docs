# TASK-DOC-CONTROL-PLANE-001 - App / NodeAgent / Job Service / Backend / Admin Closed Loop

- 状态：Ready
- Owner：Docs / Product / Backend / Job Service / NodeAgent / App / Admin / CI-CD
- 创建日期：2026-05-18
- 目标完成日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-app`, `livemask-nodeagent`, `livemask-job-service`, `livemask-backend`, `livemask-admin`, `livemask-ci-cd`
- 关联里程碑：MVP Operational Control Plane

## 1. Background

LiveMask 正在从简单 MVP API 进入网络运营控制平面阶段。未来的关键能力包括 NodeAgent 发布/回滚、配置发布/回滚、GeoIP 更新和分发、协议 profile rollout、App 内容投放、Dashboard 聚合、计费对账和 CI smoke。

这些能力不能只按单仓库、单按钮、单 API 推进。必须提前规划 App / NodeAgent / Job Service / Backend / Admin 的完整闭环，避免后续出现：

- Admin 触发任务但无队列/重试/回滚。
- Backend 同步执行长任务导致 API 被拖垮。
- NodeAgent 多节点 rollout 无 wave/lock/backoff。
- App 看不到维护、降级、region、content 的安全状态。
- CI/CD 只测单接口，不测闭环。

## 2. Scope

### In Scope

- 定义控制平面总架构。
- 明确 App / NodeAgent / Job Service / Backend / Admin 职责边界。
- 明确 6 条闭环链路：NodeAgent release、NodeAgent config、GeoIP、Protocol profile、App content、Dashboard aggregation。
- 明确 API/auth/data/event/observability/security/local runtime 边界。
- 更新各仓库文档入口。
- 登记后续任务路线图。

### Out of Scope

- 不实现任何代码。
- 不创建 `livemask-job-service` 仓库。
- 不修改 Backend/Admin/App/NodeAgent 运行时代码。
- 不替代各单项契约，例如 GeoIP、NodeAgent release、Content、Hysteria2。

## 3. Contracts

- Architecture：[App / NodeAgent / Job Service / Backend / Admin Closed Loop](../../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- Job Contract：[Admin Job Center / Scheduler Contract](../../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- Config：后续各域任务按本架构补具体 config。
- Events：所有 job-driven 事件必须带 `run_id` 并 redacted metadata。
- Error Codes：后续 Job Service 和 domain gateway 按 `JOB_*` 和 domain error code 扩展。
- State Machines：Job Run、NodeAgent Runtime、App Runtime、Artifact、Content 五类状态族。

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增控制平面闭环架构和索引 | 当前任务 | `bash scripts/check-docs.sh` |
| `livemask-job-service` | 未来新增独立服务 | 后续 `TASK-JOBS-SERVICE-001` | service tests + smoke |
| `livemask-backend` | 未来作为 Admin Gateway/domain authority | 后续 `TASK-BACKEND-JOBS-GATEWAY-001` | Go tests + gateway smoke |
| `livemask-admin` | 未来展示 Job Center 和闭环状态 | 后续 `TASK-ADMIN-JOBS-001` | build + UI smoke |
| `livemask-nodeagent` | 未来按 job-driven assignment/report loop 扩展 | 后续 NodeAgent release/config/GeoIP/probe tasks | Go tests + local runtime |
| `livemask-app` | 未来安全消费 job-driven downstream state | 后续 App GeoIP/content/node-status tasks | Flutter tests/builds |
| `livemask-ci-cd` | 未来闭环 smoke 和 local runtime 支持 Job Service | 后续 `TASK-CICD-JOBS-001` | smoke scripts |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Docs | Closed-loop requirement and future direction | Scope only covers current button |
| 2 | Docs | Job Service / Backend | Architecture + Job contract + state/event boundaries | No async queue/worker |
| 3 | Backend / Job Service | Admin | Gateway API + run/event/schedule examples | API drift or missing RBAC |
| 4 | Backend / Job Service | NodeAgent / App | Assignment/manifest/status contracts | Secrets or unsafe states exposed |
| 5 | All engineering | CI/CD / QA | Smoke matrix and local runtime requirements | No E2E loop validation |

## 6. Implementation Plan

- [x] Add control-plane architecture document.
- [x] Link from root docs README.
- [x] Link from contracts README.
- [x] Link from App / NodeAgent / Backend / Admin README files.
- [x] Link from MVP implementation plan.
- [x] Link from task index.
- [ ] Create `livemask-job-service` implementation task.
- [ ] Create Backend gateway implementation task.
- [ ] Create Admin Job Center implementation task.
- [ ] Create CI/CD job closed-loop smoke task.

## 7. Validation Plan

- [x] `bash scripts/check-docs.sh`
- [ ] Future service tests
- [ ] Future backend gateway tests
- [ ] Future admin UI tests
- [ ] Future CI smoke:
  `Admin -> Backend -> Job Service -> Backend domain -> NodeAgent/App -> Backend status -> Admin`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| 各仓库继续按单点功能开发 | 后续闭环断裂 | 所有相关 README 指向本文 | Docs |
| Job Service 边界过晚确立 | 多 NodeAgent 后难拆 | 第一版即独立服务 | Product / Backend |
| App/NodeAgent 收到不安全字段 | Secret 或状态泄漏 | Contract 明确 pull-safe 和 no-secret | Backend / Security |
| CI 不测闭环 | 发布后才发现断链 | 增加闭环 smoke | CI-CD |

## 9. Rollback

- 回滚触发条件：Product 决定不采用独立控制平面/Job Service。
- 回滚步骤：删除本文索引，恢复 Job Center 为 Backend 内部实现方向。
- 回滚验证：`bash scripts/check-docs.sh`。

## 10. Completion Evidence

- PR：TBD
- Commit：TBD
- Test output：`bash scripts/check-docs.sh`
- Screenshots / logs：N/A
- 文档链接：[Control Plane Closed Loop](../../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- Dashboard / alert：N/A
- Product / support note：Future operational tasks must map into this loop before implementation.

## 11. Follow-up

- `TASK-JOBS-SERVICE-001`
- `TASK-BACKEND-JOBS-GATEWAY-001`
- `TASK-ADMIN-JOBS-001`
- `TASK-CICD-JOBS-001`
- `TASK-JOBS-GEOIP-001`
- `TASK-JOBS-NODEAGENT-001`
- `TASK-JOBS-CONTENT-001`
- `TASK-JOBS-DASHBOARD-001`
- `TASK-NODEAGENT-JOB-EVENTS-001`
- `TASK-APP-JOB-AWARE-STATUS-001`
