# TASK-DOC-ADMIN-DASHBOARD-REALTIME-001 - Admin Control Plane Operations Dashboard Contract

- 状态：Draft
- Owner：Docs / Backend / Admin
- 创建日期：2026-05-18
- 目标完成日期：2026-05-18
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-admin`, `livemask-ci-cd`
- 关联里程碑：MVP Operational Control Plane

## 1. Background

Admin Dashboard 目前是 mock 数据大盘。平台发展到控制平面阶段后，运营人员必须在 Dashboard 上看到真实、准确、可操作的各模块状态：

- 真实 3D/地图流量
- Job Service 健康度和运行/失败任务
- GeoIP 活跃数据库版本和更新状态
- Protocol Endpoint 模板和灰度状态
- NodeAgent 发布灰度状态
- Client reconnect hint 投递健康度
- Content 排期/已发布/已过期
- Node endpoint readiness
- App error/Sentry summary
- Billing/session/device 摘要

本契约定义从 mock 升级为真实 Control Plane Operations Dashboard 的完整要求。

## 2. Scope

### In Scope

- 新增 `docs/contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md`。
- 定义 Dashboard 路由：`/admin`, `/admin/traffic`, `/admin/jobs`, `/admin/geoip`, `/admin/protocol-endpoints`, `/admin/nodeagent/releases`, `/admin/content`。
- 定义 Real-First Data 规则：production 不得静默展示 mock 数据。
- 定义 11 个 Backend Dashboard API 契约。
- 定义 3D/traffic map 数据契约（country_from, country_to, bytes_up, bytes_down, session_count, success_count, failure_count, protocol_profile, node_region, geoip_database_version, window_start, window_end）。
- 定义各模块 Widget 规格。
- 定义 RBAC 门禁：`jobs:read`, `geoip:read`, `node:read`, `protocol_template:read`, `content:read`, `payment:read`, `user:read`。
- 更新索引文件。
- 登记后续实现任务。

### Out of Scope

- 不实现 Backend Dashboard API。
- 不实现 Admin Dashboard UI。
- 不实现 CI/CD Dashboard smoke。
- 不实现 3D globe（仅定义数据契约，MVP 使用 SVG/2D）。

## 3. Contracts

- API：[Admin Control Plane Dashboard Contract](../../contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md)（本文）
- Config：Dashboard polling intervals, staleness thresholds。
- Events：Dashboard aggregation 通过 Job Service 定时任务触发。
- Error Codes：`DASHBOARD_UNAVAILABLE`, `DASHBOARD_NOT_READY`, `DASHBOARD_STALE_DATA`。
- State Machines：Widget states — loading, data, empty, error, forbidden, stale, mock。

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 新增 11 个 dashboard API + aggregation job + cache | 后续 `TASK-BACKEND-DASHBOARD-001` | `go test ./...`, integration tests |
| `livemask-admin` | 新增 dashboard surfaces + traffic map + widget states + polling | 后续 `TASK-ADMIN-DASHBOARD-001` | `npm run build`, UI smoke |
| `livemask-ci-cd` | 新增 dashboard smoke: mock-badge enforcement, RBAC, empty/error | 后续 `TASK-CICD-DASHBOARD-001` | `bash scripts/dashboard-smoke.sh` |
| `livemask-docs` | 新增 contract 和任务索引 | 当前任务 | `bash scripts/check-docs.sh` |
| `livemask-nodeagent` | 无直接改动；dashboard 消费现有 event/status API | 无 | N/A |
| `livemask-app` | 无直接改动 | 无 | N/A |
| `livemask-website` | 无直接改动 | 无 | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Docs | Mock dashboard must become real control plane dashboard | Scope too broad |
| 2 | Docs | Backend / Admin | Contract + API spec + RBAC + widget states | Missing widget state definitions |
| 3 | Backend | Admin | API contract + mock/real response examples | API drift |
| 4 | Backend / Admin | CI-CD | Smoke scenarios and mock-data enforcement rules | Missing mock-detection mechanic |
| 5 | CI-CD / QA | Product | Smoke output + residual risks | Mock data visible in production |

## 6. Implementation Plan

- [x] Add `docs/contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md`.
- [x] Link contract from `docs/contracts/README.md`.
- [x] Link contract from `docs/admin/README.md`.
- [x] Link contract from `docs/backend/README.md`.
- [x] Register task and follow-up tasks in `docs/development/tasks/README.md`.
- [x] Register in `docs/development/MVP_IMPLEMENTATION_PLAN.md`.
- [ ] Backend implements `TASK-BACKEND-DASHBOARD-001`.
- [ ] Admin implements `TASK-ADMIN-DASHBOARD-001`.
- [ ] CI/CD implements `TASK-CICD-DASHBOARD-001`.

## 7. Validation Plan

- [x] Contract checks with `bash scripts/check-docs.sh`.
- [ ] Backend unit/integration tests for dashboard APIs in follow-up task.
- [ ] Admin build/UI tests for dashboard widgets in follow-up task.
- [ ] CI smoke verifies:
  - Real dashboard APIs return correct data shape
  - Mock data is enforced only in local/dev env
  - Stale badge appears when data is stale
  - Error state appears on 5xx
  - Empty state appears on empty data
  - RBAC 403 hides the section
- [ ] Manual verification that all widget states render correctly.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Dashboard aggregation queries overload DB | Production DB strain | Use materialized views, scheduled aggregation, read replicas | Backend |
| Stale data shown without badge | Operators miss incidents | Hard staleness threshold enforcement + CI smoke | Backend / CI |
| Mock data leaks to production | Misleading operators | Backend env check + CI smoke fails if mock data served in non-dev | Backend / CI |
| Dashboard widget explosion causes slow load | Poor UX | Lazy-load widgets, independent data fetching per widget | Admin |

## 9. Rollback

- 回滚触发条件：Dashboard contract 方向被产品否定或无法实现。
- 回滚步骤：删除 contract links and task entries；恢复为 mock dashboard。
- 回滚验证：`bash scripts/check-docs.sh`。

## 10. Completion Evidence

- PR: TBD
- Commit: TBD
- Test output: `bash scripts/check-docs.sh`
- Screenshots / logs: N/A
- 文档链接: [Admin Control Plane Dashboard Contract](../../contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md)
- Dashboard / alert: N/A
- Product / support note: N/A

## 11. Follow-up

- `TASK-BACKEND-DASHBOARD-001` — Backend implement dashboard APIs
- `TASK-BACKEND-DASHBOARD-AGG-001` — Backend traffic aggregation jobs
- `TASK-BACKEND-DASHBOARD-CACHE-001` — Backend dashboard cache strategy
- `TASK-ADMIN-DASHBOARD-001` — Admin implement dashboard surfaces
- `TASK-ADMIN-TRAFFIC-MAP-001` — Admin traffic map SVG/2D rendering
- `TASK-CICD-DASHBOARD-001` — CI/CD dashboard smoke tests
