# LiveMask Contracts

> 本目录是跨仓库协作的契约层。任何 API、配置、事件、错误码、状态机变化，都必须先在这里记录，再进入各仓库实现。

## 1. 契约类型

- [API Contract](api/README.md)：Backend 对 App、NodeAgent、Admin 暴露的 HTTP/gRPC/WebSocket 契约
- [Config Contract](config/README.md)：配置热更新、FeatureFlag、NodeAgent 配置和客户端配置契约
- [Event Contract](events/README.md)：异步事件、队列消息、Webhook、领域事件契约
- [Error Codes](error-codes.md)：统一错误码、用户可见错误和重试策略
- [State Machines](state-machines.md)：支付、订阅、节点、申诉等状态机
- [Data Consistency](data-consistency.md)：PostgreSQL、Redis、App/NodeAgent 本地缓存一致性规则
- [Admin Job Center / Scheduler Contract](jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)：Admin 统一任务中心契约 — 手动触发、定时任务、重试、取消、运行历史、事件日志、RBAC、审计和跨模块 Job 类型
- [Job Queue Usage Matrix](jobs/JOB_QUEUE_USAGE_MATRIX.md)：全局队列使用矩阵 — 定义哪些 Backend、NodeAgent、App、Content、Billing、GeoIP、CI/CD 场景必须进入 Job Service 队列，哪些可同步执行，DB/Redis 边界和后续开发门禁
- [Control Plane Closed Loop Architecture](../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)：App / NodeAgent / Job Service / Backend / Admin 闭环架构 — Admin 意图、Backend 授权、Job Service 队列执行、NodeAgent/App 回传、Admin 展示和回滚
- [NodeAgent Release Contract](nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md) ✅ Ready：NodeAgent binary 分发、配置下发、灰度、健康门禁和回滚契约
- [GeoIP Database Sync Contract](geoip/GEOIP_DATABASE_SYNC_CONTRACT.md) ✅ Ready：Backend 定时更新 GeoIP DB、NodeAgent 同步、App 增量同步、校验、LKG 和回滚契约
- [GeoIP Source Hardening Contract](geoip/GEOIP_SOURCE_HARDENING_CONTRACT.md) ✅ Ready：GeoIP 生产化加固契约 — source allowlist、artifact storage、manifest signature、rate limit、delta/full strategy、unknown format、MaxMind tar.gz、安全边界 + 各仓库实现状态
- [Content System Contract](content/CONTENT_SYSTEM_CONTRACT.md) ✅ Ready：统一内容系统跨仓库契约 — content_items 模型、6 种内容类型、Public Blog API、App Content API、Admin API 预留、跳转规则和安全规则
- [Blog / SEO Content Sub-Contract](content/BLOG_SEO_CONTENT_CONTRACT.md)：blog_article 专属 SEO 子契约 — SEO 采集规则、Website SEO 要求、JSON-LD、sitemap/RSS

## 真实 MVP 契约

- [Core MVP API Contracts](api/core-mvp.md)
- [Core MVP Config Contracts](config/core-configs.md)
- [Core MVP Event Contracts](events/core-events.md)

## 协议契约

- [Hysteria2 Connect Config Contract](vpn/HYSTERIA2_CONNECT_CONFIG_CONTRACT.md) — Hysteria2 首个真实扩展协议的跨仓库字段边界、安全边界和后续任务
- [Protocol & Endpoint Template Contract](protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) — 多协议端点模板管理、版本化、批量分发、Job Service 灰度、NodeAgent 应用、Backend connect_config 协同和回滚契约

## 实时通知契约

- [Client Reconnect Hint Contract](realtime/CLIENT_RECONNECT_HINT_CONTRACT.md) — App 断线重连提示跨仓库契约。NodeAgent 不直接通知 App，NodeAgent → Backend event → Backend → App realtime hint → App 拉取 connect_config → 优雅重连 → ACK/event 报告 + fallback polling 模式和安全边界

## 实时 Dashboard 契约

- [Admin Control Plane Dashboard Contract](admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md) — Admin Control Plane Operations Dashboard 契约：定义 7 个 Dashboard Surface、11 个 Backend API、Real-First Data 规则、3D/traffic map 数据契约、各模块 Widget 规格、RBAC 门禁和安全规则。

## 2. 变更规则

任何契约变更必须包含：

- `TASK-XXXX`
- Owner
- 变更动机
- 兼容策略
- 影响仓库
- 验证方式
- 回滚策略

## 3. 契约优先级

当代码实现与本目录不一致时，必须先判断：

1. 代码是否误实现，应该修正代码。
2. 契约是否过期，应该先更新契约并说明原因。
3. 是否存在跨仓库未同步，应该登记到任务清单。

禁止在没有契约更新的情况下修改跨仓库字段、状态、错误码或事件结构。
