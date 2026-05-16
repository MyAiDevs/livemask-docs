# TASK-INFRA-001 - MVP Health API 与 CI/CD Smoke 闭环验证

- 状态：Done
- Owner：Backend Lead / DevOps
- 创建日期：2026-05-16
- 目标完成日期：2026-05-23
- 主影响仓库：`livemask-backend`, `livemask-ci-cd`, `livemask-docs`
- 受影响仓库：`livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-website`
- 关联里程碑：M0 — 基础设施就绪

## 1. Background

当前 CI/CD 基础设施（GitHub Organization Runner、Lark 通知、repository_dispatch、scaffold 仓库）已就位，**但还没有一个真实的后端 API 接入闭环**。`livemask-ci-cd` 的 staging smoke 目前是最小 nginx 占位，无法验证 App → Backend API → PostgreSQL → Redis → CI/CD → Lark 的完整链路。

本 TASK 的目标是在现有基础设施上接入第一个真实 Backend Health API，并用 staging smoke 证明全链路可运行。这是后续所有 MVP 业务 TASK（配置中心、支付、推荐等）的基础依赖。

## 2. Scope

### In Scope

- `livemask-backend` 初始化 Go 项目 scaffold
- 实现 `GET /api/v1/health` 轻量探活端点
- Health API 检测 PostgreSQL 连通状态
- Health API 检测 Redis 连通状态
- backend CI 在 `livemask-ci` runner group 上运行（build → unit test → integration test）
- backend integration test 启动 postgres + redis 容器，调用 Health API 验证
- `livemask-ci-cd` staging smoke 从 nginx 占位升级为 backend + postgres + redis
- staging smoke 调用 Health API 并校验响应
- Lark 收到 CI 成功 / 失败通知
- `livemask-docs` 契约变更通过 `repository_dispatch` 通知子仓库
- scaffold 仓库无 `go.mod` / `package.json` 时 CI 跳过并成功

### Out of Scope

- Health API 写入 `health_check_logs` 表（高频探活不写 DB）
- 完整的生产级健康检查 / 熔断 / 降级
- NodeAgent / App 业务逻辑
- 其他 MVP API（config / payment / recommendation）
- Admin 管理页面

## 3. Contracts

- API：`docs/contracts/api/health-check.md`
- API 索引：`docs/contracts/api/core-mvp.md#health-api`
- Chain：`docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md#h8`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | Go scaffold、Health API 实现、CI workflow、integration test | 是 | CI run + staging smoke |
| `livemask-ci-cd` | docker-compose 升级为 backend+postgres+redis、smoke 脚本调用 Health API | 是 | staging smoke pass |
| `livemask-docs` | 新增 health-check.md、更新 core-mvp.md、chain 文档、runner 文档 | 是 | docs check |
| `livemask-nodeagent` | 收到 dispatch 后 CI 运行确认无破坏 | 否 | CI pass |
| `livemask-app` | 收到 dispatch 后 CI 运行确认无破坏 | 否 | CI pass |
| `livemask-admin` | 收到 dispatch 后 CI 运行确认无破坏 | 否 | CI pass |
| `livemask-website` | 收到 dispatch 后 CI 运行确认无破坏 | 否 | CI pass |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Backend + DevOps | TASK scope、验收标准、out-of-scope | 验收标准不可测试 |
| 2 | Backend (Go scaffold + Health API) | CI/CD (smoke) | docker-compose + smoke 脚本可调用 Health API | Backend 未起或端口错误 |
| 3 | Backend / CI/CD | QA / Ops | CI 通过、Lark 收到通知、smoke pass | smoke 未覆盖 degradation 场景 |
| 4 | Ops | 所有子仓库 | repository_dispatch 触发子仓库 CI | dispatch 未收到或子仓库 CI 失败 |
| 5 | Ops / Product | Task Owner | staging smoke 全链路通过、Lark 项目报告可发送 | Lark webhook 未配置 |

## 6. Implementation Plan

- [ ] 1. `livemask-backend`：初始化 Go 项目（go.mod、main.go、基本目录结构）
- [ ] 2. `livemask-backend`：实现 `GET /api/v1/health` 端点
  - 检测 PostgreSQL 连接（`db.Ping()` 或 `SELECT 1`）
  - 检测 Redis 连接（`PING`）
  - 返回 `status` / `version` / `db_connected` / `redis_connected` / `uptime_seconds` / `timestamp`
  - 不写入 DB
- [ ] 3. `livemask-backend`：配置 CI workflow（`group: livemask-ci`）
  - build、unit test、integration test 三个阶段
  - integration test 启动 postgres + redis 容器 → 启动 backend → 调用 Health API → 校验响应
  - scaffold 无 `go.mod` 时跳过
  - notify-lark job 通知结果
- [ ] 4. `livemask-ci-cd`：升级 staging docker-compose
  - 替换 nginx 占位为 backend + postgres + redis
  - 新增 `.env` 示例文件（DB / Redis 连接配置）
  - 更新 smoke 脚本调用 `GET /api/v1/health` 并校验 `status == "ok"`
- [ ] 5. 验证所有 7 个仓库 CI 在 `livemask-ci` runner 上可通过（含 scaffold 跳过逻辑）
- [ ] 6. 验证 `livemask-docs` 契约变更后 repository_dispatch 触发子仓库 CI
- [ ] 7. 验证 Lark 收到 CI 成功 / 失败通知

## 7. Validation Plan

### S1 — Health API 端点

- [ ] `GET /api/v1/health` 返回 `200 + { "status": "ok", "db_connected": true, "redis_connected": true }`
- [ ] DB 断开时 `db_connected: false`，status 为 `degraded`
- [ ] Redis 断开时 `redis_connected: false`，status 为 `degraded`
- [ ] DB 和 Redis 同时断开时 status 为 `down`
- [ ] Health API 不写入 health_check_logs 表

### S2 — Backend CI

- [ ] CI 在 `group: livemask-ci` 上运行
- [ ] build → unit test → integration test 三个 job 依次通过
- [ ] integration test 启动 postgres + redis 容器并调用 Health API
- [ ] 无 `go.mod` 时 CI 跳过

### S3 — Staging Smoke

- [ ] `livemask-ci-cd` 在 `group: livemask-staging` 上运行
- [ ] docker-compose 启动 backend + postgres + redis
- [ ] smoke 脚本调用 `GET /api/v1/health` 并校验 `status == "ok"`
- [ ] smoke 失败时 Lark 收到 failure 通知

### S4 — 跨仓库联动

- [ ] `livemask-docs` 契约变更后 dispatch `docs-contract-changed` 到子仓库
- [ ] 子仓库收到 dispatch 后触发 CI

### S5 — Lark 通知

- [ ] CI 成功时 Lark 收到绿色卡片
- [ ] CI 失败时 Lark 收到红色卡片附带错误日志摘要
- [ ] `livemask-docs` 可手动发送 Lark Project Report

### S6 — 回滚验证

- [ ] Health API 代码回滚只 revert 代码 + 重启
- [ ] CI workflow 回滚 revert `.github/workflows/`
- [ ] staging compose 回滚 revert `infra/docker-compose.staging.yml`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Backend 端口与 staging 上其他服务冲突 | smoke 失败 | ci-cd 使用 `.env` 自定义端口映射 | DevOps |
| integration test 中容器端口被占用 | CI 不稳定 | 使用随机端口或固定 ci 用端口池 | Backend |
| Lark webhook secret 未配置 | 通知不发送 | notification job 跳过，不影响 CI 结果 | DevOps |
| 部分子仓库 dispatch 未收到 | 跨仓库验证不完整 | 手动触发一次全仓库 CI | Backend |
| Go 项目结构决策延迟 | Block step 1-2 | 提前确定：Go 1.22+、gin 或 net/http、项目布局 | Backend Lead |

## 9. Rollback

- 回滚触发条件：Health API CI 不稳定、staging smoke 阻塞发布、Lark 通知误报过高
- 回滚步骤：
  1. `livemask-backend`：revert `main.go`、`handler.go`、`go.mod` 到上一版本
  2. `livemask-ci-cd`：revert `docker-compose.staging.yml`、`smoke.sh` 到 nginx 占位
  3. 确认 CI 恢复全绿
- 回滚验证：原 nginx smoke 通过、Lark 通知正常

## 10. Completion Evidence

- PR：N/A（当前阶段直接提交到 `main`）
- Commit：
  - `livemask-docs`: `2c3e66d docs: add infra health smoke task`
  - `livemask-backend`: `2c53398 TASK-INFRA-001: initialize Go scaffold with Health API + CI smoke closed loop`
  - `livemask-backend`: `212a38d ci: avoid fixed service ports in backend integration tests`
  - `livemask-ci-cd`: `8c446cc ci: upgrade staging smoke from nginx placeholder to backend + postgres + redis`
- Test output：
  - `livemask-docs`: `bash scripts/check-docs.sh` passed.
  - `livemask-ci-cd`: `docker compose -f infra/docker-compose.staging.yml config` passed.
  - `livemask-ci-cd`: `bash scripts/smoke.sh` passed against backend + postgres + redis.
  - `livemask-ci-cd`: GitHub Actions `Staging Smoke` passed on `main`.
- Screenshots / logs：
  - GitHub Actions run: `https://github.com/MyAiDevs/livemask-ci-cd/actions/runs/25964707267`
  - Smoke response contained `status=ok`, `db_connected=true`, `redis_connected=true`.
  - Lark `notify-lark` job passed in the same workflow run.
- 文档链接：
  - `docs/contracts/api/health-check.md`
  - `docs/contracts/api/core-mvp.md#health-api`
  - `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md#h8health-api--ci-smoke-不可用阻塞下一阶段开发判断`
  - `docs/operations/GITHUB_ACTIONS_RUNNER_ARCHITECTURE.md`
- Dashboard / alert：
  - Lark CI/CD notification job verified through GitHub Actions run.
- Product / support note：
  - INFRA-001 establishes the infrastructure green-light gate before `TASK-P0-03-config-center`.

## 11. Follow-up

- 后续 TASK：`TASK-P0-03-config-center`（依赖 INFRA-001 CI/CD 就绪）
- 后续 TASK：`TASK-P5-03-monitoring-alerting`（依赖 Health API 指标）
- 未完成项：
  - GitHub Actions emitted a Node.js 20 deprecation annotation for `actions/checkout@v4`; track separately before GitHub's Node 24 migration deadline.
