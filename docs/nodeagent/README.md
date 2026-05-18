# NodeAgent 文档入口

## 1. 职责范围

`livemask-nodeagent` 负责节点侧配置拉取、任务执行、状态上报、降级模式和与 Backend 的协同。

## 2. 修改 NodeAgent 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响 Backend 配置下发或状态接收
- [ ] 是否影响 App 可见状态、连接质量或错误反馈
- [ ] 是否影响降级模式、重试、断线恢复或本地缓存
- [ ] 是否需要新增监控、日志或审计字段

## 3. 必须更新文档的场景

- 配置字段、默认值、刷新周期变化
- 上报字段、心跳、健康检查变化
- 降级模式、重试策略、任务执行策略变化
- 与 Backend API 的兼容策略变化

## 4. 完成标准

- [ ] Backend 兼容性已确认
- [ ] 旧配置和异常配置处理已确认
- [ ] 降级模式行为已说明
- [ ] 验证结果写入 PR 或任务记录

## 5. 架构文档索引

- [NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md](NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md) — 多协议扩展架构（ProtocolProfile 接口、SecretRef、Renderer dispatch、HealthCheck hook、路线图）
- [PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md](PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md) — 协议插件开发指南（实现步骤、测试要求、安全审查清单）

## 6. 协议契约索引

- [Hysteria2 Connect Config Contract](../contracts/vpn/HYSTERIA2_CONNECT_CONFIG_CONTRACT.md) — Hysteria2 首个真实扩展协议的跨仓库契约（字段边界、安全边界、Secret Lifecycle、Repo 职责、Task Roadmap、Validation Matrix）

## 7. 版本发布与回滚契约

- [NodeAgent Release, Binary Distribution, Config Delivery and Rollback Contract](../contracts/nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md) — NodeAgent binary 版本分发、配置下发、灰度、健康门禁、last-known-good 和回滚的跨仓库契约。

## 8. GeoIP 数据库同步契约

- [GeoIP Database Update, NodeAgent Sync and App Incremental Sync Contract](../contracts/geoip/GEOIP_DATABASE_SYNC_CONTRACT.md) — Backend 定时更新 GeoIP DB、NodeAgent 同步 verified artifact、App 增量同步轻量 package、校验、last-known-good 和回滚契约。
- [GeoIP Source Hardening Contract](../contracts/geoip/GEOIP_SOURCE_HARDENING_CONTRACT.md) — GeoIP 生产化加固契约：source allowlist、manifest signature、storage abstraction、rate limit、delta/full strategy、unknown format 处理、MaxMind tar.gz、安全边界及 NodeAgent 职责。

## 9. 协议端点模板与灰度下发

- [Protocol & Endpoint Template Contract](../contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) — 协议端点模板管理、版本化、批量分发、Job Service 灰度规则、NodeAgent 应用（pull assignment / Validate / Render / HealthCheck / event 上报）和回滚策略。
- [Client Reconnect Hint Contract](../contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md) — NodeAgent 协议变更后上报 Backend，Backend 通过 realtime 通道通知 App 优雅重连。NodeAgent 不直接通知 App。

## 10. 控制平面闭环

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Job Queue Usage Matrix](../contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md)

NodeAgent 后续的 binary rollout、config publish/rollback、GeoIP sync、protocol profile rollout、endpoint probe 和 health probe 都必须按 Job Service 闭环设计：Job Service 分批和重试，Backend 暴露安全 assignment/manifest，NodeAgent pull 并验证，NodeAgent report event/status，Backend 聚合，Admin 展示进度和 rollback。

NodeAgent 自身不得接受 Job Service 直接命令，也不得隐藏 fleet 操作失败。所有 fleet 级动作必须由 Backend 暴露 pull-safe assignment、manifest 或 config，NodeAgent 本地执行 sha256/signature/compatibility 校验、last-known-good 回滚、redacted event/status 上报。涉及本地事件重试、GeoIP 同步、release rollout、config rollback、protocol rollout 或 endpoint probe 的任务必须先查 Job Queue Usage Matrix。

## 11. 日志与 Metrics

- [Log, Audit, Metric, And Node Observability Pipeline Contract](../contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md)

NodeAgent 必须提供本地日志队列、Backend HMAC 日志上传和 Prometheus-compatible `/metrics`。NodeAgent 不直接调用 Job Service；日志批次必须通过 Backend `/internal/agent/logs` 入口上传，由 Backend 验证 node 身份后投递 Job Service 队列入库。

Required follow-up:

- `TASK-NODEAGENT-METRICS-LOGS-001`

Required NodeAgent metrics include endpoint readiness、config degraded、sing-box running、GeoIP status、release version、event/log queue depth 和 active job state。Metrics labels 必须低基数，不得包含 raw endpoint、IP、token、node_secret、session_id、user email 或完整 URL。
