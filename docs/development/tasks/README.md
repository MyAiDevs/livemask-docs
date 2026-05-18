# TASK Workspace

> 每个跨仓库任务都应该有独立任务单。大里程碑表负责排期，任务单负责闭环证据。

## 1. 命名规则

```text
TASK-<DOMAIN>-<NUMBER>-<short-title>.md
```

示例：

- `TASK-DOC-001-doc-closure.md`
- `TASK-NA-CONFIG-001-config-manager-contract.md`
- `TASK-BE-FLAG-001-targeting-rules.md`

## 2. 生命周期

```text
Draft -> Ready -> In Progress -> Review -> Done
                    |              |
                    v              v
                 Blocked        Follow-up TASK
```

## 3. Done 标准

任务不能只靠“代码已改”完成。必须同时满足：

- 需求范围明确
- 跨仓库影响明确
- 契约更新完成
- 实现和测试完成
- 验证证据记录
- 回滚策略明确
- 未完成项有后续 TASK

## 4. 模板

复制 [TASK-TEMPLATE.md](TASK-TEMPLATE.md) 创建新任务。

当前样例：[TASK-DOC-001-doc-closure.md](TASK-DOC-001-doc-closure.md)。

## MVP P0/P1 任务

- [TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md](TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md)
- [TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md](TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md)
- [TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md](TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md)
- [TASK-VPN-CONFIG-001-real-connect-config-contract.md](TASK-VPN-CONFIG-001-real-connect-config-contract.md)
- [TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md](TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md)
- [TASK-INFRA-002-ai-task-sync-and-auto-marking.md](TASK-INFRA-002-ai-task-sync-and-auto-marking.md)
- [TASK-P0-03-config-center.md](TASK-P0-03-config-center.md)
- [TASK-ADMIN-001-config-center-management-ui.md](TASK-ADMIN-001-config-center-management-ui.md)
- [TASK-APP-001-remote-config-cache-fallback.md](TASK-APP-001-remote-config-cache-fallback.md)
- [TASK-NA-CONFIG-001-config-sync-hot-reload.md](TASK-NA-CONFIG-001-config-sync-hot-reload.md)
- [TASK-AUTH-001-account-auth-rbac-closed-loop.md](TASK-AUTH-001-account-auth-rbac-closed-loop.md)
- [TASK-P1-01-usdt-payment.md](TASK-P1-01-usdt-payment.md)
- [TASK-P1-05-config-hot-reload.md](TASK-P1-05-config-hot-reload.md)
- [TASK-P2-05-node-recommendation.md](TASK-P2-05-node-recommendation.md)
- [TASK-P3-01-connection-quality-report.md](TASK-P3-01-connection-quality-report.md)
- [TASK-P3-02-quick-feedback.md](TASK-P3-02-quick-feedback.md)
- [TASK-P5-03-monitoring-alerting.md](TASK-P5-03-monitoring-alerting.md)
- [TASK-P5-04-deploy-runbook.md](TASK-P5-04-deploy-runbook.md)

## 下一阶段任务

- [TASK-DOC-HYSTERIA2-CONTRACT-001] — Hysteria2 连接配置跨仓库契约（当前任务）
- TASK-NODEAGENT-HYSTERIA2-001 — NodeAgent 端 hysteria2 ProtocolProfile 实现（Render / Validate / HealthCheck / Endpoint / Redact）
- TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 — Backend 端 hysteria2 connect_config 生成 + profile dispatch + skeleton fallback
- TASK-ADMIN-ENDPOINT-002 — Admin endpoint editor hysteria2 字段支持
- TASK-APP-CONNECT-PROFILE-001 — App 端 profile_type=hysteria2 解析 + skeleton 占位态展示
- TASK-CICD-PROTOCOL-SMOKE-001 — CI smoke 验证 endpoint registration → connect_config hysteria2
- TASK-APP-ANDROID-ENGINE-HYSTERIA2-001 — Android VpnService hysteria2 原生引擎集成
- TASK-APP-IOS-PACKET-TUNNEL-HYSTERIA2-001 — iOS/macOS PacketTunnelProvider hysteria2 适配

## Protocol & Endpoint Template Rollout 任务

- [TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md](TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md) — Protocol & Endpoint Template 跨仓库契约：模板数据模型、版本化、15 个 Seed Templates、Assignment 模型、Job Service 灰度规则、NodeAgent 应用、Backend connect_config 协同、App 优雅重连和回滚策略。
- TASK-BACKEND-PROTOCOL-TEMPLATE-001 — Backend 端 Protocol Template CRUD、Seed Migration、Node Selector 解析、connect_config 协同
- TASK-BACKEND-PROTOCOL-ROLLOUT-001 — Backend 端 Assignment 解析和 Secret 注入 Internal API
- TASK-JOBS-PROTOCOL-ROLLOUT-001 — Job Service 端 Protocol Rollout 灰度执行器（Wave 编排、Per-Node Queue、Error Threshold）
- TASK-NODEAGENT-PROTOCOL-ASSIGNMENT-001 — NodeAgent 端 Assignment Pull、Apply、Event Report
- TASK-ADMIN-PROTOCOL-TEMPLATE-001 — Admin 端 Template 和 Assignment 管理 UI
- TASK-BACKEND-RECONNECT-HINT-001 — Backend 端重连提示生成和 Realtime 推送
- TASK-APP-RECONNECT-HINT-001 — App 端重连提示接收、优雅断线、connect_config 刷新
- TASK-CICD-PROTOCOL-TEMPLATE-001 — CI/CD Protocol Template 和 Rollout Smoke
- TASK-CICD-RECONNECT-HINT-001 — CI/CD 重连提示 Smoke

## NodeAgent 发布、配置与回滚任务

- [TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md](TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md) — NodeAgent binary 分发、配置下发、灰度、健康门禁和回滚契约
- TASK-BACKEND-NODEAGENT-RELEASE-001 — Backend release metadata schema、version check API、upgrade event API
- TASK-NODEAGENT-RELEASE-001 — NodeAgent release manager、artifact download/verify/install/rollback
- TASK-BACKEND-NODEAGENT-CONFIG-ROLLBACK-001 — Backend per-node config assignment、schema compatibility、rollback publish flow
- TASK-ADMIN-NODEAGENT-RELEASE-001 — Admin release/rollout UI、per-node version/config 状态和 rollback 操作
- TASK-CICD-NODEAGENT-RELEASE-001 — CI smoke 验证 release 和 rollback 流程
- TASK-APP-NODE-STATUS-002 — App 安全展示 node rollout/degraded 状态（仅当 Backend 暴露安全字段）

## GeoIP 数据库更新、NodeAgent 同步与 App 增量同步任务

- [TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md](TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md) — Backend 定时更新 GeoIP DB、NodeAgent 同步 verified artifact、App 增量同步 package、校验、LKG 和回滚契约
- TASK-BACKEND-GEOIP-001 — Backend source registry、scheduled update job、artifact metadata、NodeAgent check/event APIs、App manifest/event APIs ✅
- TASK-BACKEND-GEOIP-SOURCE-002 — Backend source hardening、storage abstraction、manifest signature、rate limit、delta fallback skeleton ✅
- TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001 — Backend MaxMind tar.gz decompression + .mmdb extraction
- TASK-NODEAGENT-GEOIP-001 — NodeAgent GeoIP sync manager、verifier、local LKG、rollback ✅
- TASK-NODEAGENT-GEOIP-002 — NodeAgent event retry queue
- TASK-NODEAGENT-GEOIP-003 — NodeAgent manifest signature verify + key rotation
- TASK-NODEAGENT-GEOIP-004 — NodeAgent delta package apply
- TASK-NODEAGENT-GEOIP-005 — NodeAgent lookup engine
- TASK-NODEAGENT-GEOIP-006 — NodeAgent heartbeat contract extension
- TASK-NODEAGENT-GEOIP-007 — NodeAgent compatibility gate
- TASK-NODEAGENT-GEOIP-008 — NodeAgent runtime config integration
- TASK-APP-GEOIP-001 — App GeoIP manifest client、delta/full package sync、cache、LKG、fallback ✅
- TASK-APP-GEOIP-LOOKUP-001 — App GeoIP lookup engine
- TASK-ADMIN-GEOIP-001 — Admin GeoIP source/database/rollout UI ✅
- TASK-CICD-GEOIP-001 — GeoIP update and rollback smoke ✅
- TASK-CICD-GEOIP-HARDENING-002 — CI/CD signature/rate-limit/delta-fallback/source-hardening smoke
- TASK-APP-NODE-REGION-001 — App 使用 Backend 字段和本地 GeoIP cache 安全展示 region/degraded 状态
- [TASK-DOC-GEOIP-CONTRACT-002] — GeoIP source hardening 契约（本文档）

## Admin Job Center / Scheduler 任务

> `Trigger Update` 不应长期作为 GeoIP 页面内的孤立按钮存在。GeoIP 更新只是统一任务中心的第一类 job；后续 NodeAgent 发布、配置回滚、内容发布、Dashboard 聚合、账单对账和 CI smoke 都必须进入统一 Admin Job Center。Job 执行服务从第一版开始独立为 `livemask-job-service`，避免多 NodeAgent 后再拆造成架构债。

- TASK-DOC-CONTROL-PLANE-001 — [App / NodeAgent / Job Service / Backend / Admin 控制平面闭环架构](../../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)：定义 Admin 意图、Backend 授权、Job Service 执行、NodeAgent/App 回传、Backend 聚合、Admin 展示和 CI/CD 验证闭环
- [TASK-DOC-ADMIN-JOBS-001-admin-job-center-scheduler-contract.md](TASK-DOC-ADMIN-JOBS-001-admin-job-center-scheduler-contract.md) — Admin Job Center / Scheduler 契约：独立 Job Service、DB-backed queue、worker pool、retry/backoff、runs、events、schedules、RBAC、audit、locking、GeoIP trigger migration
- [TASK-DOC-JOB-QUEUE-MATRIX-001-job-queue-usage-matrix.md](TASK-DOC-JOB-QUEUE-MATRIX-001-job-queue-usage-matrix.md) — 全局队列使用矩阵：定义 Backend、NodeAgent、App、Content、Billing、GeoIP、CI/CD 场景何时必须使用 Job Service，明确 DB/Redis 边界和后续开发门禁
- TASK-JOBS-SERVICE-001 — 新仓库 `livemask-job-service`：job registry、queue、worker pool、scheduler、lease、retry/backoff、locks、internal API
- TASK-BACKEND-JOBS-GATEWAY-001 — Backend Admin Job Gateway、RBAC、audit attribution、service auth integration
- TASK-ADMIN-JOBS-001 — Admin `/admin/jobs`、run history、schedule management、GeoIP trigger migration
- TASK-CICD-JOBS-001 — Job Center smoke：auth/RBAC/run/schedule/events/secret leak
- TASK-JOBS-QUEUE-002 — Job Service durable queue items、leases、retry/backoff、dead-letter、restart recovery
- TASK-JOBS-SCHEDULER-001 — Job Service schedule storage、cron/hourly/daily evaluator、next_run_at 计算和 disable/enable
- TASK-JOBS-GEOIP-001 — GeoIP update/verify executor 接入 Job Service
- TASK-JOBS-NODEAGENT-001 — NodeAgent release/config rollout executor 接入 Job Service，支持 per-node queue、wave、retry/backoff
- TASK-JOBS-CONTENT-001 — Content publish/archive schedule 接入 Job Service
- TASK-CICD-JOBS-HARDENING-001 — CI/CD 覆盖 queue、lease、retry、lock、secret leak 和 local runtime sync

## Admin Control Plane Dashboard 任务

> Mock Dashboard 升级为真实 Control Plane Operations Dashboard，覆盖所有运营模块的实时数据可视化。

- [TASK-DOC-ADMIN-DASHBOARD-REALTIME-001-admin-control-plane-dashboard.md](TASK-DOC-ADMIN-DASHBOARD-REALTIME-001-admin-control-plane-dashboard.md) ✅ — Admin Control Plane Dashboard 契约：定义 7 个 Dashboard Surface、11 个 Backend Dashboard API、Real-First Data 规则、3D/traffic map 数据契约、各模块 Widget 规格、RBAC 门禁
- TASK-BACKEND-DASHBOARD-001 — Backend 实现所有 11 个 Dashboard API + traffic aggregation jobs + cache strategy
- TASK-ADMIN-DASHBOARD-001 — Admin 实现 Dashboard 前端面和 SVG/2D traffic map
- TASK-CICD-DASHBOARD-001 — CI/CD Dashboard smoke：mock-badge enforcement、RBAC、empty/error states

## Admin Navigation IA 任务

> Admin 左侧菜单不能继续作为平铺功能清单增长。所有 Admin 页面必须进入分组、可折叠、RBAC-aware 的信息架构；功能页通过 tabs / filters 收敛子页面，避免一项功能一个顶层菜单。

- [TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md](TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md) ✅ — Admin Navigation IA 契约：Dashboard / Operations / Content / Users & Growth / Finance / Observability / System 分组、RBAC 可见性、深链接兼容、移动端抽屉和 CI smoke
- TASK-ADMIN-NAV-IA-001 — Admin 实现 grouped/collapsible sidebar、typed nav model、active route auto-expand、localStorage persistence、mobile drawer parity
- TASK-BACKEND-ADMIN-PERMISSIONS-001 — Backend admin auth payload 补齐 effective permissions，支持 Admin 可靠过滤菜单
- TASK-CICD-ADMIN-NAV-IA-001 — CI/CD Admin nav smoke：分组可见性、直接链接、低权限隐藏、直达 403 验证

## Observability / Logs / Metrics 任务

> Backend、NodeAgent、Job Service、Admin 和 CI/CD 必须统一日志、审计、metrics 和 Node 最新日志查看链路。NodeAgent 不直接调用 Job Service；NodeAgent 日志通过 Backend HMAC 入口上传，Backend 验证身份后由 Job Service 队列异步入库。

- [TASK-DOC-OBSERVABILITY-LOGS-METRICS-001-log-metric-pipeline.md](TASK-DOC-OBSERVABILITY-LOGS-METRICS-001-log-metric-pipeline.md) — 日志、审计、metrics、NodeAgent 日志上传、Job Service 队列入库、Admin Node logs 契约
- TASK-BACKEND-OBSERVABILITY-LOGS-001 — Backend observability schema、NodeAgent log ingestion API、Admin logs/audit APIs、Backend `/metrics`
- TASK-JOBS-OBSERVABILITY-INGEST-001 — Job Service `observability_log_ingest` job、retry/backoff、dead-letter、batch idempotency
- TASK-NODEAGENT-METRICS-LOGS-001 — NodeAgent local log queue、Backend upload、Prometheus `/metrics`
- TASK-ADMIN-LOGS-METRICS-001 — Admin `/admin/logs`、`/admin/audit-logs`、Node latest logs、node metric summary
- TASK-CICD-OBSERVABILITY-SMOKE-001 — CI/CD observability smoke：metrics、log ingestion、RBAC、secret leak

## Content System（统一内容系统）任务

> 替代旧 `Blog / SEO 内容系统任务`。旧任务 `TASK-DOC-BLOG-SEO-001` 已合并升级为 `TASK-DOC-CONTENT-001`，旧 `TASK-BACKEND-BLOG-001` 等已重新编排。

- [TASK-DOC-CONTENT-001-content-system-contract.md](TASK-DOC-CONTENT-001-content-system-contract.md) ✅ — 统一 Content System 契约：content_items 模型、6 种内容类型、App API、Admin API、跳转规则
- TASK-BACKEND-CONTENT-001 — Backend 统一 content_items schema + Public Blog API + App Content API
- TASK-BACKEND-ADMIN-CONTENT-001 — Backend Admin Content CRUD API
- TASK-WEBSITE-BLOG-002 — Website Blog real API integration
- TASK-ADMIN-CONTENT-001 — Admin Content Management UI（管理所有 6 种 content_type）
- TASK-APP-CONTENT-FEED-001 — App 公告/活动/banner feed
- TASK-CICD-CONTENT-SEO-001 — Blog SEO + App content smoke
