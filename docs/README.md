# LiveMask 项目文档库（v3.7 完整版）

> **重要**：多仓库 + 多窗口 AI 开发请优先阅读 [DEVELOPMENT.md](./DEVELOPMENT.md)

本目录包含 LiveMask 项目所有核心详细文档，已按功能模块分类整理。

## 目录结构

- **architecture/** — 系统架构、数据库设计、技术架构
- **contracts/** — API、配置、事件、错误码、状态机契约（含 protocol-endpoint、realtime 重连提示）
- **data/** — PostgreSQL、Redis、一致性、迁移与缓存策略
- **development/** — 开发规范、任务清单、测试策略、AI开发规则
- **nodeagent/** — NodeAgent 架构、代码示例、一键安装脚本
- **app/** — 多平台客户端开发与安全规范
- **backend/** — 后端架构、FeatureFlag、C2C 积分实现
- **operations/** — 运营手册、SOP、SEO、客户支持
- **business/** — 收益模型、推广大使、营销工具
- **payment/** — 支付系统设计与接入
- **monitoring/** — 监控、可观测性、WebSocket、流量统计
- **retention/** — 留存预警与 Onboarding 系统
- **security/** — 威胁情报、Secret 管理
- **admin/** — 管理后台 Figma 描述与 React 代码示例
- **qa/** — 测试策略、验收证据、发布质量门禁
- **product/** — 需求范围、验收标准、灰度与复盘
- **support/** — 客服、人工介入、补偿、申诉和发布后反馈
- **archive/** — 历史/辅助文档

## 多仓库开发特别说明

当使用 AI 编辑器同时打开多个项目时，请务必阅读：

→ [DEVELOPMENT.md](./DEVELOPMENT.md)（多仓库 + 多窗口开发核心指南）

该文档详细说明了：
- 每个窗口如何正确加载规则
- 跨仓库变更的处理流程
- TASK-XXXX traceability 要求
- 推荐的日常开发协作方式

## 使用建议

1. 优先阅读 `architecture/` 和 `development/` 目录。
2. NodeAgent、App、Backend 开发者请重点阅读对应目录。
3. 跨仓库字段、配置、事件或错误码变化，请先更新 `contracts/`。
4. App → NodeAgent → API → DB/Redis 链路变化，请先阅读 `architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`。
   多项目 Issue、task-sync、Cursor 窗口 lease、完成报告、Issue close/reopen 规则变化，请先阅读 `development/ISSUE_TASK_SYNC_GOVERNANCE.md`。
   如果变化涉及 Admin 触发、Backend 调度、Job Service 执行、NodeAgent/App 状态回传，请先阅读 `architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md`。
   如果变化涉及长任务、批处理、fan-out、外部 vendor 调用、retry/backoff、定时任务或回滚，请先阅读 `contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`，确认是否必须进入 `livemask-job-service`。
   如果变化涉及前后端可见文案、错误提示、Content locale、Website SEO 语言、Admin/App 语言切换或中文支持，请先阅读 `contracts/i18n/I18N_LOCALIZATION_CONTRACT.md`。
   如果变化涉及日志、审计、metrics、NodeAgent 日志上传、Job Service 队列入库或 Admin Node logs，请先阅读 `contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md`。
5. 每个跨仓库任务请在 `development/tasks/` 创建独立任务单。
6. 不同角色请先阅读对应目录 README，并对照 `development/ROLE_READINESS_ASSESSMENT.md`。
7. 跨角色任务必须对照 `development/ROLE_HANDOFF_CHAINS.md` 填写交接证据。
8. 若发现 TODO、占位实现或未完成项，请先登记到 `development/LiveMask_TODO闭环登记表_v3.7.md`。
9. 所有文档已按 v3.7 最终结构整理。

## MVP 落地入口

- `development/AI_PROJECT_STATUS_ONBOARDING.md`
- `development/MVP_IMPLEMENTATION_PLAN.md`
- `development/CODEX_TASK_DISPATCHER_ROLE.md`
- `contracts/api/core-mvp.md`
- `contracts/config/core-configs.md`
- `contracts/events/core-events.md`
- `data/redis-key-registry.md`
- `data/DB_MIGRATION_PLAN.md`
- `data/outbox-compensation.md`
- `qa/P0_VALIDATION_MATRIX.md`
- `operations/RELEASE_RUNBOOK.md`
- `development/task-state-ledger.json`
- `development/CURSOR_TASK_BRIEF_TEMPLATE.md`

## 未来模块链路入口

- `architecture/future-chains/README.md`
- `architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md`

最后更新：2026年
