# MVP Implementation Plan

> 本计划把“可落地开发”的第一批任务收敛到最小闭环：配置中心、节点上报、App 推荐/反馈、USDT 支付、部署监控。

## 1. MVP 范围

### In Scope

- P0-03 配置中心核心实现
- P1-01 USDT 支付完整集成
- AUTH-001 账号、登录、Session、RBAC 基础闭环
- VPN-CONFIG-001 真实 VPN connect_config 契约与安全模型
- DOC-PROTOCOL-001 NodeAgent 多协议扩展架构文档
- DOC-NODEAGENT-RELEASE-001 NodeAgent binary 分发、配置发布与回滚契约
- DOC-GEOIP-SYNC-001 GeoIP 数据库更新、NodeAgent 同步与 App 增量同步契约
- DOC-CONTENT-001 统一 Content System 契约（覆盖 blog_article / announcement / campaign / app_banner）
- DOC-CONTROL-PLANE-001 App / NodeAgent / Job Service / Backend / Admin 控制平面闭环架构
- DOC-JOB-QUEUE-MATRIX-001 全局队列使用矩阵（Backend/NodeAgent/Job Service/DB/Redis 开发门禁）
- DOC-OBSERVABILITY-LOGS-METRICS-001 日志、审计、metrics、NodeAgent 日志上传和 Admin Node logs 契约
- DOC-ADMIN-NAV-IA-001 Admin 左侧菜单分组、折叠、RBAC 可见性和深链接兼容契约
- P1-05 配置热更新完整闭环
- P2-05 节点推荐与过滤
- P3-01 App 上报连接质量
- P3-02 节点快速反馈闭环
- P5-03 监控告警完善
- P5-04 部署与 CI/CD 完善

### Out of Scope

- 多支付方式正式上线
- 完整积分经济体系
- 高级推荐模型训练
- iOS 深度优化
- 全量 Admin 运营页面

## 2. 独立 TASK 文件

| TASK | 目标 | 主角色 | 依赖 |
| --- | --- | --- | --- |
| [TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md](tasks/TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md) | Health API + CI/CD Smoke 闭环验证 | Backend / DevOps | 无（基础设施已就位） |
| [TASK-INFRA-002-ai-task-sync-and-auto-marking.md](tasks/TASK-INFRA-002-ai-task-sync-and-auto-marking.md) | AI 多窗口任务同步、Issue 评论、解锁 dispatch、Lark 报告 | DevOps / Docs | INFRA-001 |
| [TASK-VPN-CONFIG-001-real-connect-config-contract.md](tasks/TASK-VPN-CONFIG-001-real-connect-config-contract.md) | Connect Config 契约与安全模型 | Backend / Security | INFRA-001 |
| [TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md](tasks/TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md) | NodeAgent 多协议扩展架构文档 | NodeAgent / Docs | INFRA-001 |
| [TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md](tasks/TASK-DOC-NODEAGENT-RELEASE-001-nodeagent-release-config-rollback-contract.md) | NodeAgent binary 分发、配置发布与回滚契约 | Backend / NodeAgent / Admin / DevOps | TASK-NA-CONFIG-001 |
| [TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md](tasks/TASK-DOC-GEOIP-SYNC-001-geoip-database-update-nodeagent-sync-contract.md) | GeoIP 数据库更新、NodeAgent 同步与 App 增量同步契约 | Backend / NodeAgent / App / Admin / DevOps | TASK-NA-CONFIG-001 |
| [TASK-P0-03-config-center.md](tasks/TASK-P0-03-config-center.md) | 配置中心、版本、hash、Redis 通知 | Backend | INFRA-001 |
| [TASK-ADMIN-001-config-center-management-ui.md](tasks/TASK-ADMIN-001-config-center-management-ui.md) | 配置中心管理页、草稿、发布、回滚 | Admin | P0-03 |
| [TASK-APP-001-remote-config-cache-fallback.md](tasks/TASK-APP-001-remote-config-cache-fallback.md) | App 远程配置读取、缓存、降级 | App | P0-03 |
| [TASK-NA-CONFIG-001-config-sync-hot-reload.md](tasks/TASK-NA-CONFIG-001-config-sync-hot-reload.md) | NodeAgent 配置同步、轮询、降级、热更新 | NodeAgent | P0-03 |
| [TASK-AUTH-001-account-auth-rbac-closed-loop.md](tasks/TASK-AUTH-001-account-auth-rbac-closed-loop.md) | 账号、登录、Session、RBAC、路由隔离 | Backend / Security | P0-03 |
| [TASK-P1-01-usdt-payment.md](tasks/TASK-P1-01-usdt-payment.md) | NOWPayments + Webhook + 幂等 | Backend / Payment | Config center + AUTH-001 |
| [TASK-P1-05-config-hot-reload.md](tasks/TASK-P1-05-config-hot-reload.md) | App / NodeAgent 配置热更新闭环 | Backend / NodeAgent / App | P0-03 |
| [TASK-P2-05-node-recommendation.md](tasks/TASK-P2-05-node-recommendation.md) | 节点推荐、过滤、fallback | App / Backend | NodeAgent status |
| [TASK-P3-01-connection-quality-report.md](tasks/TASK-P3-01-connection-quality-report.md) | App 连接质量上报 | App / Backend | P2-05 |
| [TASK-P3-02-quick-feedback.md](tasks/TASK-P3-02-quick-feedback.md) | 快速反馈和低优先级 appeal | App / Backend | P3-01 |
| [TASK-P5-03-monitoring-alerting.md](tasks/TASK-P5-03-monitoring-alerting.md) | MVP 指标、告警、Dashboard | Ops / SRE | P0-P3 |
 | [TASK-P5-04-deploy-runbook.md](tasks/TASK-P5-04-deploy-runbook.md) | 部署、迁移、回滚 Runbook | DevOps | P0-P3 |
| [TASK-DOC-CONTENT-001-content-system-contract.md](tasks/TASK-DOC-CONTENT-001-content-system-contract.md) | 统一 Content System 契约：content_items 模型、Blog/App/Admin API | Docs | 无 |
| [TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md](tasks/TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md) | Protocol & Endpoint Template 契约 + 重连提示契约 + 15 seed templates + Job Service 灰度 + NodeAgent 应用 + App 优雅重连 | Docs / All | DOC-CONTROL-PLANE-001 |
| [TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001-nodeagent-protocol-capability-sync.md](tasks/TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001-nodeagent-protocol-capability-sync.md) | NodeAgent 真实协议能力上报、Backend eligibility 聚合、Admin 支持状态展示和 unsafe rollout gating | Docs / Backend / NodeAgent / Admin / CI-CD | TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 |
| [TASK-DOC-OBSERVABILITY-LOGS-METRICS-001-log-metric-pipeline.md](tasks/TASK-DOC-OBSERVABILITY-LOGS-METRICS-001-log-metric-pipeline.md) | 日志、审计、metrics、NodeAgent 日志上传、Job Service 队列入库和 Admin Node logs 契约 | Docs / Backend / NodeAgent / Job Service / Admin / CI-CD | DOC-CONTROL-PLANE-001 |
| [TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md](tasks/TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md) | Admin Navigation IA 契约：分组侧边栏、RBAC 可见性、路由收敛和移动端抽屉 | Docs / Admin / Backend / CI-CD | Admin Dashboard / Job Center / Observability docs |
| TASK-DOC-CONTROL-PLANE-001 | App / NodeAgent / Job Service / Backend / Admin 控制平面闭环架构 | Docs / All | Job Center / GeoIP / NodeAgent release docs |
| [TASK-DOC-JOB-QUEUE-MATRIX-001-job-queue-usage-matrix.md](tasks/TASK-DOC-JOB-QUEUE-MATRIX-001-job-queue-usage-matrix.md) | 全局队列使用矩阵：定义哪些场景必须走 Job Service 队列，哪些可同步执行，DB/Redis 边界和 Backend/NodeAgent 开发门禁 | Docs / Backend / NodeAgent / Job Service | TASK-DOC-CONTROL-PLANE-001 |

## 3. 当前 Roadmap 状态

### 已完成 / 稳定

#### Docs 契约层

- ProtocolProfile 接口定义 + Renderer dispatcher + SecretRef 框架（TASK-DOC-PROTOCOL-001 / TASK-NODEAGENT-PROTOCOL-001）
- Connect Config 安全契约（TASK-VPN-CONFIG-001）
- Backend protocol_profile 命名对齐（TASK-BACKEND-PROTOCOL-001）
- NodeAgent binary 分发、配置发布与回滚契约（TASK-DOC-NODEAGENT-RELEASE-001）— 已升级为 Ready
- GeoIP 数据库更新、NodeAgent 同步与 App 增量同步契约（TASK-DOC-GEOIP-SYNC-001）— 已升级为 Ready
- GeoIP Source Hardening 契约（TASK-DOC-GEOIP-CONTRACT-002）— Source allowlist、storage abstraction、manifest signature、rate limit、delta/full strategy、unknown format、MaxMind tar.gz、安全边界 + 各仓库实现状态
- Content System 统一契约（TASK-DOC-CONTENT-001）— content_items 模型、6 种内容类型、Blog/App/Admin API、跳转规则
- Protocol Capability Sync（TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001）— NodeAgent 上报真实协议支持，Backend 聚合 eligibility，Admin 显示支持状态并阻断 unsafe rollout
- Control Plane Closed Loop 架构（TASK-DOC-CONTROL-PLANE-001）— Admin 意图、Backend 授权、Job Service 队列执行、NodeAgent/App 回传、Admin 展示和回滚
- Job Queue Usage Matrix（TASK-DOC-JOB-QUEUE-MATRIX-001）— 全局长任务、fan-out、retry/backoff、定时任务、DB/Redis 队列边界和 Backend/NodeAgent 必读门禁
- Observability Log/Metric Pipeline（TASK-DOC-OBSERVABILITY-LOGS-METRICS-001）— Backend audit/log APIs、NodeAgent log upload、Job Service queued ingestion、Prometheus metrics、Admin Node logs
- Admin Navigation IA（TASK-DOC-ADMIN-NAV-IA-001）— Admin 左侧菜单分组、折叠、RBAC 可见性、路由收敛和深链接兼容契约

#### GeoIP 实现层（已交付）

| TASK | 仓库 | 目标 | 状态 |
| --- | --- | --- | --- |
| TASK-BACKEND-GEOIP-001 | livemask-backend | Source registry、scheduled update job、artifact metadata、NodeAgent check/event APIs、App manifest/event APIs | ✅ |
| TASK-BACKEND-GEOIP-SOURCE-002 | livemask-backend | Source hardening、storage abstraction、manifest signature、rate limit、delta fallback skeleton | ✅ |
| TASK-NODEAGENT-GEOIP-001 | livemask-nodeagent | GeoIP sync manager、verifier、local LKG、rollback | ✅ |
| TASK-APP-GEOIP-001 | livemask-app | App GeoIP manifest client、delta/full package sync、cache、LKG、fallback | ✅ |
| TASK-ADMIN-GEOIP-001 | livemask-admin | GeoIP source/database/rollout UI（API client + hooks + RBAC 就绪，UI 页面待 TASK-ADMIN-GEOIP-001 后续迭代） | ✅ |
| TASK-CICD-GEOIP-001 | livemask-ci-cd | GeoIP update and rollback smoke（8 域 27 节） | ✅ |
| TASK-CICD-GEOIP-CREDENTIALS-001 | livemask-ci-cd | GeoIP credentials smoke（15 域） | ✅ |

### 进行中

- DOC-HYSTERIA2-CONTRACT-001 — Hysteria2 连接配置跨仓库契约（本文档）

### 下一步 — Admin Control Plane Dashboard（实时运营数据大盘）

> Mock Dashboard 需升级为真实 Control Plane Operations Dashboard，覆盖所有运营模块的实时数据可视化。

| TASK | 目标 | Owner | 依赖 |
| --- | --- | --- | --- |
| [TASK-DOC-ADMIN-DASHBOARD-REALTIME-001-admin-control-plane-dashboard.md](tasks/TASK-DOC-ADMIN-DASHBOARD-REALTIME-001-admin-control-plane-dashboard.md) | 定义 Admin Control Plane Dashboard 跨仓库契约 | Docs | DOC-CONTROL-PLANE-001, JOB-QUEUE-MATRIX-001 |
| TASK-BACKEND-DASHBOARD-001 | Backend 11 个 Dashboard API + traffic aggregation jobs + cache | Backend | TASK-DOC-ADMIN-DASHBOARD-REALTIME-001 |
| TASK-ADMIN-DASHBOARD-001 | Admin Dashboard surfaces + SVG/2D traffic map + widget states | Admin | TASK-BACKEND-DASHBOARD-001 |
| TASK-CICD-DASHBOARD-001 | CI/CD dashboard smoke: mock-badge, RBAC, empty/error states | DevOps | TASK-BACKEND-DASHBOARD-001 + TASK-ADMIN-DASHBOARD-001 |

### 下一步 — Admin Navigation IA（菜单收敛）

> Admin 菜单必须从平铺功能列表升级为分组、可折叠、RBAC-aware 的控制台导航。新增功能优先进入既有分组和页面 tabs，不应继续增加顶层菜单噪音。

| TASK | 目标 | Owner | 依赖 |
| --- | --- | --- | --- |
| [TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md](tasks/TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md) | 定义 Admin Navigation IA 跨仓库契约 | Docs | Admin Dashboard / Job Center / Observability docs |
| TASK-ADMIN-NAV-IA-001 | grouped/collapsible sidebar、typed nav model、active route auto-expand、RBAC filtering、mobile drawer | Admin | TASK-DOC-ADMIN-NAV-IA-001 |
| TASK-BACKEND-ADMIN-PERMISSIONS-001 | admin auth payload 补齐 effective permissions，保障菜单过滤和页面 RBAC 一致 | Backend | AUTH-001 |
| TASK-CICD-ADMIN-NAV-IA-001 | Admin nav smoke：分组、深链接、低权限隐藏、直达 403 | DevOps | TASK-ADMIN-NAV-IA-001 |

### 下一步 — Protocol Capability Sync（协议支持状态对齐）

> Seed template 是模板库存，不代表当前 NodeAgent 已支持。Admin 必须显示 NodeAgent 真实协议能力，Backend 必须在 rollout 前做 eligibility gating。

| TASK | 目标 | Owner | 依赖 |
| --- | --- | --- | --- |
| [TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001-nodeagent-protocol-capability-sync.md](tasks/TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001-nodeagent-protocol-capability-sync.md) | 定义 NodeAgent protocol capability sync 契约 | Docs | TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 |
| TASK-NODEAGENT-PROTOCOL-CAPABILITY-001 | 从 ProtocolProfile registry 上报 implemented/partial/reserved/unsupported/app_pending 状态 | NodeAgent | TASK-NODEAGENT-PROTOCOL-ASSIGNMENT-001 |
| TASK-BACKEND-PROTOCOL-CAPABILITY-001 | 存储 capability reports、聚合 fleet eligibility、assignment gating、Admin APIs | Backend | TASK-NODEAGENT-PROTOCOL-CAPABILITY-001 |
| TASK-ADMIN-PROTOCOL-CAPABILITY-001 | 模板/节点/assignment wizard/rollout events/dashboard 显示协议支持状态 | Admin | TASK-BACKEND-PROTOCOL-CAPABILITY-001 |
| TASK-CICD-PROTOCOL-CAPABILITY-001 | Smoke 验证 unsupported/reserved/app_pending 不可误下发 | DevOps | Backend + Admin capability tasks |

### 下一阶段（Hysteria2 首条真实协议链路）

| TASK | 目标 | Owner | 依赖 |
| --- | --- | --- | --- |
| TASK-NODEAGENT-HYSTERIA2-001 | NodeAgent hysteria2 ProtocolProfile 实现 | NodeAgent | TASK-NODEAGENT-PROTOCOL-001 |
| TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 | Backend hysteria2 connect_config + skeleton | Backend | TASK-NODEAGENT-HYSTERIA2-001 + VPN-CONFIG-001 |
| TASK-ADMIN-ENDPOINT-002 | Admin 端点编辑 hysteria2 安全字段 | Admin | TASK-NODEAGENT-HYSTERIA2-001 |
| TASK-APP-CONNECT-PROFILE-001 | App 解析 hysteria2 profile + skeleton | App | TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 |
| TASK-CICD-PROTOCOL-SMOKE-001 | CI smoke hysteria2 API 验证 | DevOps | TASK-BACKEND-CONNECT-CONFIG-HYSTERIA2-001 |
| TASK-APP-ANDROID-ENGINE-HYSTERIA2-001 | Android VpnService hysteria2 引擎 | App | TASK-APP-CONNECT-PROFILE-001 |
| TASK-APP-IOS-PACKET-TUNNEL-HYSTERIA2-001 | iOS PacketTunnelProvider hysteria2 | App | TASK-APP-CONNECT-PROFILE-001 |

### 下一阶段（NodeAgent binary 发布、配置下发与回滚）

| TASK | 目标 | Owner | 依赖 |
| --- | --- | --- | --- |
| TASK-BACKEND-NODEAGENT-RELEASE-001 | Release metadata schema、version check API、upgrade event API | Backend | TASK-DOC-NODEAGENT-RELEASE-001 |
| TASK-NODEAGENT-RELEASE-001 | Release manager、artifact download/verify/install/rollback | NodeAgent | TASK-BACKEND-NODEAGENT-RELEASE-001 |
| TASK-BACKEND-NODEAGENT-CONFIG-ROLLBACK-001 | Per-node config assignment、schema compatibility、rollback publish flow | Backend | TASK-P0-03-config-center |
| TASK-ADMIN-NODEAGENT-RELEASE-001 | Release/rollout UI、per-node version/config 状态和 rollback 操作 | Admin | TASK-BACKEND-NODEAGENT-RELEASE-001 |
| TASK-CICD-NODEAGENT-RELEASE-001 | Release and rollback smoke | DevOps | Backend + NodeAgent release tasks |
| TASK-APP-NODE-STATUS-002 | Safe node rollout/degraded status display | App | Backend exposes safe fields |

### 下一阶段（GeoIP 数据库更新、NodeAgent 同步与 App 增量同步）

| TASK | 目标 | Owner | 依赖 | 状态 |
| --- | --- | --- | --- | --- |
| TASK-BACKEND-GEOIP-001 | Source registry、scheduled update job、artifact metadata、NodeAgent check/event APIs、App manifest/event APIs | Backend | TASK-DOC-GEOIP-SYNC-001 | ✅ |
| TASK-BACKEND-GEOIP-SOURCE-002 | Source hardening、storage abstraction、manifest signature、rate limit、delta fallback skeleton | Backend | TASK-BACKEND-GEOIP-001 | ✅ |
| TASK-BACKEND-GEOIP-MAXMIND-EXTRACT-001 | MaxMind tar.gz decompression + .mmdb extraction | Backend | TASK-BACKEND-GEOIP-SOURCE-002 | |
| TASK-NODEAGENT-GEOIP-001 | GeoIP sync manager、verifier、local LKG、rollback | NodeAgent | TASK-BACKEND-GEOIP-001 | ✅ |
| TASK-NODEAGENT-GEOIP-002 | Event retry queue | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-NODEAGENT-GEOIP-003 | Manifest signature verify + key rotation | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-NODEAGENT-GEOIP-004 | Delta package apply | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-NODEAGENT-GEOIP-005 | Lookup engine | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-NODEAGENT-GEOIP-006 | Heartbeat contract extension | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-NODEAGENT-GEOIP-007 | Compatibility gate | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-NODEAGENT-GEOIP-008 | Runtime config integration | NodeAgent | TASK-NODEAGENT-GEOIP-001 | |
| TASK-APP-GEOIP-001 | App GeoIP manifest client、delta/full package sync、cache、LKG、fallback | App | TASK-BACKEND-GEOIP-001 | ✅ |
| TASK-APP-GEOIP-LOOKUP-001 | App GeoIP lookup engine | App | TASK-APP-GEOIP-001 | |
| TASK-ADMIN-GEOIP-001 | GeoIP source/database/rollout UI | Admin | TASK-BACKEND-GEOIP-001 | ✅ |
| TASK-CICD-GEOIP-001 | GeoIP update and rollback smoke for NodeAgent and App packages | DevOps | Backend + NodeAgent + App GeoIP tasks | ✅ |
| TASK-CICD-GEOIP-CREDENTIALS-001 | GeoIP credentials smoke | DevOps | TASK-CICD-GEOIP-001 | ✅ |
| TASK-CICD-GEOIP-HARDENING-002 | Signature/rate-limit/delta-fallback/source-hardening smoke | DevOps | TASK-CICD-GEOIP-001 | |
| TASK-APP-NODE-REGION-001 | Safe region/degraded display using Backend fields and local GeoIP cache | App | TASK-APP-GEOIP-001 | |

## 4. MVP 完成标准

- [ ] 核心 API 契约已在 `docs/contracts/api/core-mvp.md` 登记。
- [ ] 核心配置已在 `docs/contracts/config/core-configs.md` 登记。
- [ ] 核心事件已在 `docs/contracts/events/core-events.md` 登记。
- [ ] Redis key 和数据一致性策略已在 `docs/data/redis-key-registry.md` 登记。
- [ ] Outbox / 补偿任务已在 `docs/data/outbox-compensation.md` 登记。
- [ ] P0 测试矩阵已在 `docs/qa/P0_VALIDATION_MATRIX.md` 登记。
- [ ] 上线 Runbook 已在 `docs/operations/RELEASE_RUNBOOK.md` 登记。
