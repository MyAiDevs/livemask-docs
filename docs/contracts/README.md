# LiveMask Contracts

> 本目录是跨仓库协作的契约层。任何 API、配置、事件、错误码、状态机变化，都必须先在这里记录，再进入各仓库实现。

## 1. 契约索引

快速索引：

- [统一 Contract Index](contract-index.md) — Cursor 多窗口、PR review 和 CI/CD smoke ownership 使用的单页索引。

| 域 | 契约文件 | 状态 | 所属任务 |
|---| --- | --- | --- |
| **API** | [Core MVP API](api/core-mvp.md) | ✅ 稳定 | TASK-P0-03 |
| | [Auth / RBAC](api/auth-rbac.md) | ✅ 稳定 | TASK-AUTH-001 |
| **Config** | [Core MVP Config](config/core-configs.md) | ✅ 稳定 | TASK-P0-03 |
| **Events** | [Core MVP Events](events/core-events.md) | ✅ 稳定 | TASK-P0-03 |
| **Dashboard** | [Admin Control Plane Dashboard](admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md) | 📝 Draft | TASK-DOC-ADMIN-DASHBOARD-REALTIME-001 |
| **System Settings** | [Admin System Settings](admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md) | ✅ Ready | TASK-DOC-ADMIN-SYSTEM-SETTINGS-001 |
| **Scheduler / Jobs** | [Admin Job Scheduler](jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md) | ✅ Ready | TASK-DOC-JOB-SCHEDULER-001 |
| | [Job Queue Usage Matrix](jobs/JOB_QUEUE_USAGE_MATRIX.md) | ✅ Ready | TASK-DOC-JOB-QUEUE-MATRIX-001 |
| **App Release** | [App Release Distribution](app/APP_RELEASE_DISTRIBUTION_CONTRACT.md) | ✅ Ready | TASK-DOC-APP-RELEASE-001 |
| **App Runtime** | [App Runtime Governance Config](app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md) | ✅ Ready | TASK-DOC-APP-RUNTIME-001 |
| **Observability** | [Log / Metric / Audit Pipeline](observability/LOG_METRIC_PIPELINE_CONTRACT.md) | ✅ Ready | TASK-DOC-OBSERVABILITY-LOGS-METRICS-001 |
| **I18N** | [I18N / Localization](i18n/I18N_LOCALIZATION_CONTRACT.md) | ✅ Ready | TASK-DOC-I18N-001 |
| **GeoIP** | [Database Sync](geoip/GEOIP_DATABASE_SYNC_CONTRACT.md) | ✅ 稳定 | TASK-DOC-GEOIP-SYNC-001 |
| | [Source Hardening](geoip/GEOIP_SOURCE_HARDENING_CONTRACT.md) | ✅ 稳定 | TASK-DOC-GEOIP-CONTRACT-002 |
| | [Credential Management](geoip/GEOIP_CREDENTIAL_MANAGEMENT_CONTRACT.md) | ✅ Ready | TASK-DOC-GEOIP-CREDENTIALS-001 |
| **Content** | [Content System](content/CONTENT_SYSTEM_CONTRACT.md) | ✅ 稳定 | TASK-DOC-CONTENT-001 |
| | [Blog / SEO Sub-Contract](content/BLOG_SEO_CONTENT_CONTRACT.md) | ✅ 稳定 | TASK-DOC-CONTENT-001 |
| **NodeAgent** | [Release / Config / Rollback](nodeagent/NODEAGENT_RELEASE_CONFIG_ROLLBACK_CONTRACT.md) | ✅ 稳定 | TASK-DOC-NODEAGENT-RELEASE-001 |
| **Protocol Endpoint** | [Template & Rollout](protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) | ✅ Ready | TASK-DOC-PROTOCOL-ENDPOINT-001 |
| | [Capability & Negotiation](protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md#34-protocol-capability-sync) | ✅ Ready | TASK-DOC-PROTOCOL-CAPABILITY-001 |
| | [Stability Gate](../development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) | ✅ Ready | TASK-DOC-PROTOCOL-STABILITY-GATE-001 |
| **VPN** | [Hysteria2 Connect Config](vpn/HYSTERIA2_CONNECT_CONFIG_CONTRACT.md) | ✅ Ready | TASK-VPN-CONFIG-001 |
| | [NAT Sharing / Device-as-Router Abuse Guard](vpn/NAT_SHARING_GUARD_CONTRACT.md) | ✅ Ready | TASK-DOC-NAT-SHARING-GUARD-001 |
| **Users** | [Contact / Notification](users/USER_CONTACT_NOTIFICATION_CONTRACT.md) | ✅ Ready | TASK-DOC-USER-CONTACT-001 |
| | [Growth / Revenue](users/USER_GROWTH_REVENUE_CONTRACT.md) | ✅ Ready | TASK-DOC-USER-GROWTH-REVENUE-001 |
| **Realtime** | [Client Reconnect Hint](realtime/CLIENT_RECONNECT_HINT_CONTRACT.md) | ✅ Ready | TASK-DOC-RECONNECT-001 |
| **Navigation** | [Admin IA / Navigation](admin/ADMIN_NAVIGATION_IA_CONTRACT.md) | ✅ Ready | TASK-DOC-ADMIN-NAV-001 |
| **Error Codes** | [统一错误码](error-codes.md) | ✅ 稳定 | TASK-P0-03 |
| **State Machines** | [状态机](state-machines.md) | ✅ 稳定 | TASK-P0-03 |
| **Data Consistency** | [一致性规则](data-consistency.md) | ✅ 稳定 | TASK-P0-03 |

## 2. 契约类型

- [API Contract](api/README.md)：Backend 对 App、NodeAgent、Admin 暴露的 HTTP/gRPC/WebSocket 契约
- [Config Contract](config/README.md)：配置热更新、FeatureFlag、NodeAgent 配置和客户端配置契约
- [Event Contract](events/README.md)：异步事件、队列消息、Webhook、领域事件契约
- [Error Codes](error-codes.md)：统一错误码、用户可见错误和重试策略
- [State Machines](state-machines.md)：支付、订阅、节点、申诉等状态机
- [Data Consistency](data-consistency.md)：PostgreSQL、Redis、App/NodeAgent 本地缓存一致性规则

## 3. 变更规则

任何契约变更必须包含：

- `TASK-XXXX`
- Owner
- 变更动机
- 兼容策略
- 影响仓库
- 验证方式
- 回滚策略

## 4. 契约优先级

当代码实现与本目录不一致时，必须先判断：

1. 代码是否误实现，应该修正代码。
2. 契约是否过期，应该先更新契约并说明原因。
3. 是否存在跨仓库未同步，应该登记到任务清单。

禁止在没有契约更新的情况下修改跨仓库字段、状态、错误码或事件结构。
