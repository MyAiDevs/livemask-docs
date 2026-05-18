# Backend 文档入口

## 1. 职责范围

`livemask-backend` 负责 API、认证授权、业务状态机、配置下发、支付回调、审计和后台任务。

## 2. 修改 Backend 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响 App 请求、错误处理、本地缓存或 UI 反馈
- [ ] 是否影响 NodeAgent 配置拉取、任务执行、状态上报或降级模式
- [ ] 是否影响数据库字段、索引、约束、迁移或审计
- [ ] 是否影响支付、风控、权限或运营配置

## 3. 必须更新文档的场景

- API 字段、错误码、状态机变化
- 配置结构、默认值、热更新策略变化
- 支付回调、订单状态、退款、风控变化
- 数据库迁移或审计字段变化
- 后台任务、补偿任务、重试策略变化

## 4. 完成标准

- [ ] 接口契约有说明
- [ ] 兼容策略有说明
- [ ] 回滚策略有说明
- [ ] App / NodeAgent 影响已检查
- [ ] 验证结果写入 PR 或任务记录

## 5. 实现输入

- `docs/backend/LIVEMASK_BACKEND_IMPLEMENTATION_BRIEF.md`

该文档用于后端 AI 辅助开发，包含 MVP 模块边界、API / DB / Redis / 状态机 / 幂等 / 错误模型 / 测试矩阵和可直接使用的 AI 实现 Prompt。

## 6. 控制平面与 Job Gateway

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Admin Job Center / Scheduler Contract](../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [Job Queue Usage Matrix](../contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md)

Backend 在未来控制平面中是 Admin API Gateway 和 domain authority，不是长任务执行器。涉及 Admin 触发的发布、回滚、GeoIP、内容、Dashboard、计费、NodeAgent 操作时，Backend 必须负责 Admin JWT/RBAC、owner-domain permission、audit attribution、domain validation 和 service auth 转发；长任务执行、queue、worker、retry/backoff、lease 和 per-target lock 由独立 `livemask-job-service` 负责。

任何 Backend 新增 Admin action、cron、批处理、外部 vendor 调用、NodeAgent fan-out、Dashboard 聚合、账单对账、内容定时发布、GeoIP 下载、CI smoke 触发或需要 retry/backoff 的工作前，必须先对照 Job Queue Usage Matrix。命中 `queue_required` 的场景不得在 HTTP handler 内同步执行，必须通过 Backend Job Gateway 创建 Job Service run，并返回 `202 + run_id`。
