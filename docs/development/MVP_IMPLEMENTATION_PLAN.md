# MVP Implementation Plan

> 本计划把“可落地开发”的第一批任务收敛到最小闭环：配置中心、节点上报、App 推荐/反馈、USDT 支付、部署监控。
> 它也是当前项目的总任务视图和跨仓库实现状态快照。

## 0. 状态规则定义

本文档中使用以下状态规则。所有任务在标记为 `Completed` 前必须满足对应证据要求。

| 状态 | 含义 | 证据要求 |
|------|------|---------|
| **Completed** | 全部实现完成，任务分支已验证通过 dev merge guard 合并到 `dev`，并已推送 `origin/dev` | 必须有 `dev merge commit` + `remote dev ref` + `validation on dev` |
| **Ready** | 契约/任务设计已完成，可以开始实现 | 文档就绪、无设计阻塞 |
| **Draft** | 设计或任务仍未闭环 | 文档/计划不完整 |
| **Partial** | 部分实现存在，但缺页面/API/测试/merge evidence | 明确列出缺失项 |
| **Evidence missing** | 文档声称完成，但缺 dev merge evidence，需重新核验 | 需对应 repo Cursor 补证据后升级状态 |

### 0.1 同步规则

`MVP_IMPLEMENTATION_PLAN.md` 是 LiveMask 当前阶段的总任务视图，但不是唯一任务记录。
所有 Cursor 窗口、Codex 窗口和人工开发者完成任务时，必须同步以下四层记录：

| 层级 | 文件 / 位置 | 责任 |
| --- | --- | --- |
| 总览 | `docs/development/MVP_IMPLEMENTATION_PLAN.md` | 记录跨仓库当前状态、实现快照、下一步优先级和阻塞项。 |
| 任务索引 | `docs/development/tasks/README.md` | 登记 TASK 是否存在、属于哪个阶段、是否有后续任务。 |
| 独立任务单 | `docs/development/tasks/TASK-*.md` | 保存任务范围、验收标准、跨仓库影响、回滚、完成证据。 |
| Cursor 分发 | `docs/development/cursor-handoffs/*.md` | 给各仓库窗口提供可复制执行规则、禁止行为和验证要求。 |

规则：

1. 任何窗口完成 `TASK-XXXX` 后，完成报告必须包含 repo、branch、commit、
   验证结果、解锁窗口、仍阻塞窗口和后续 TASK。
2. 影响多个仓库的任务必须更新 `livemask-docs`；代码仓库不能只提交代码而不
   同步任务状态。
3. `MVP_IMPLEMENTATION_PLAN.md` 只记录总览和快照，不承载完整实现细节；完整
   细节必须进入独立任务单、契约或 handoff。
4. 如果某个窗口已完成第二、第三个任务，但总览仍停留在旧状态，必须先补本文档
   和对应 TASK 记录，再继续分发新任务。
5. GitHub `dev` 页面显示为准，但本地未提交内容不会出现在 GitHub；文档窗口必须
   定期提交并推送同步批次。

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
- DOC-I18N-001 中文本地化契约（Backend message_key、Content locale、Admin/Website/App 中文默认）
- DOC-CONTROL-PLANE-001 App / NodeAgent / Job Service / Backend / Admin 控制平面闭环架构
- DOC-JOB-QUEUE-MATRIX-001 全局队列使用矩阵（Backend/NodeAgent/Job Service/DB/Redis 开发门禁）
- DOC-OBSERVABILITY-LOGS-METRICS-001 日志、审计、metrics、NodeAgent 日志上传、App Sentry 异常摘要、支付订单日志、通知投递日志和 Admin Observability 页面契约
- DOC-ADMIN-NAV-IA-001 Admin 左侧菜单分组、折叠、RBAC 可见性和深链接兼容契约
- DOC-ISSUE-TASK-SYNC-GOVERNANCE-001 多项目 Issue/TASK/task-sync 状态治理契约
- DOC-USER-CONTACT-NOTIFICATION-001 用户 IM 联系方式、通知偏好、机器人邀请和 Job Service 通知投递契约
- DOC-USER-GROWTH-REVENUE-001 用户收款资料、推广链接、推广/赞助收益规则、收益报表、结算报表和异常反馈契约
- DOC-PROTOCOL-STABILITY-GATE-001 NodeAgent 多协议多端点、Backend-owned reconnect hint、Admin Node Detail 真接口和 VPN 稳定性 QA 门禁
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
| [TASK-DOC-I18N-001-i18n-localization-contract.md](tasks/TASK-DOC-I18N-001-i18n-localization-contract.md) | I18N 契约：中文默认、英文 fallback、Backend message_key、Content locale、Website SEO、Admin/App 本地化 | Docs / Backend / Admin / Website / App / CI-CD | Content System / Website SEO / App UX |
| [TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md](tasks/TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001-protocol-endpoint-template-rollout.md) | Protocol & Endpoint Template 契约 + 重连提示契约 + 15 seed templates + Job Service 灰度 + NodeAgent 应用 + App 优雅重连 | Docs / All | DOC-CONTROL-PLANE-001 |
| [TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001-nodeagent-protocol-capability-sync.md](tasks/TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001-nodeagent-protocol-capability-sync.md) | NodeAgent 真实协议能力上报、Backend eligibility 聚合、Admin 支持状态展示和 unsafe rollout gating | Docs / Backend / NodeAgent / Admin / CI-CD | TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 |
| [TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md](tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) | NodeAgent 多协议多端点实施前门禁：模板版本、应用/回滚、Backend-owned reconnect hint、Admin Node Detail 真接口、QA 稳定性矩阵 | Docs / Backend / NodeAgent / Admin / App / Job Service / CI-CD | TASK-DOC-PROTOCOL-ENDPOINT-ROLLOUT-001 + TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001 |
| [TASK-DOC-OBSERVABILITY-LOGS-METRICS-001-log-metric-pipeline.md](tasks/TASK-DOC-OBSERVABILITY-LOGS-METRICS-001-log-metric-pipeline.md) | 日志、审计、metrics、NodeAgent 日志上传、App Sentry 异常摘要、支付订单日志、通知投递日志、Job Service 队列入库和 Admin Observability 页面契约 | Docs / Backend / NodeAgent / App / Job Service / Admin / CI-CD | DOC-CONTROL-PLANE-001 |
| [TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md](tasks/TASK-DOC-ADMIN-NAV-IA-001-admin-navigation-information-architecture.md) | Admin Navigation IA 契约：分组侧边栏、RBAC 可见性、路由收敛和移动端抽屉 | Docs / Admin / Backend / CI-CD | Admin Dashboard / Job Center / Observability docs |
| [TASK-DOC-ADMIN-SYSTEM-SETTINGS-001-admin-system-settings-contract.md](tasks/TASK-DOC-ADMIN-SYSTEM-SETTINGS-001-admin-system-settings-contract.md) | Admin System Settings + Scheduler CRUD 契约：GeoIP 凭证、IM Provider、简报模板、订阅配置、计划任务新增/修改/删除 | Docs / Backend / Admin / Job Service / CI-CD | Job Center / User Contact / GeoIP Credentials |
| [TASK-DOC-APP-RELEASE-DISTRIBUTION-001-app-release-distribution-contract.md](tasks/TASK-DOC-APP-RELEASE-DISTRIBUTION-001-app-release-distribution-contract.md) | App 版本发布契约：Admin 发布台、Backend metadata、S3/OSS/COS/GCS/local storage、App update-check、Website downloads、CI/CD build/sign/upload/register | Docs / Backend / Admin / App / Website / Job Service / CI-CD | Admin System Settings / Content release_note |
| [TASK-DOC-APP-RUNTIME-GOVERNANCE-001-app-runtime-governance-config.md](tasks/TASK-DOC-APP-RUNTIME-GOVERNANCE-001-app-runtime-governance-config.md) | App Runtime Governance 契约：多端性能/资源/重连治理、LKG、平台覆盖、Admin preview/publish/rollback | Docs / Backend / Admin / App / CI-CD | Config Center / Admin System Settings |
| [TASK-DOC-ISSUE-TASK-SYNC-GOVERNANCE-001-issue-task-sync-governance.md](tasks/TASK-DOC-ISSUE-TASK-SYNC-GOVERNANCE-001-issue-task-sync-governance.md) | Issue / Task Sync Governance：Epic/Child/Verification Issue、multi-window lease、structured result states、close/reopen rules | Docs / CI-CD / All repos | TASK-INFRA-002 |
| [TASK-DOC-USER-CONTACT-NOTIFICATION-001-user-contact-notification-contract.md](tasks/TASK-DOC-USER-CONTACT-NOTIFICATION-001-user-contact-notification-contract.md) | 用户 IM 联系方式、通知偏好、机器人邀请、delivery logs 和 Job Service 通知投递契约 | Docs / Backend / Admin / Job Service / Support / CI-CD | AUTH-001 / Job Center / Observability |
| [TASK-DOC-USER-GROWTH-REVENUE-001-user-growth-revenue-contract.md](tasks/TASK-DOC-USER-GROWTH-REVENUE-001-user-growth-revenue-contract.md) | 用户收款资料、推广链接、推广/赞助收益规则、收益报表、结算报表、异常反馈和登录收益引流推送契约 | Docs / Backend / Admin / App / Website / Job Service / CI-CD | AUTH-001 / Billing / User Contact |
| [TASK-DOC-GROWTH-REWARD-NOTIFICATION-001-login-earnings-incentive.md](tasks/TASK-DOC-GROWTH-REWARD-NOTIFICATION-001-login-earnings-incentive.md) | 登录/前台收益激励通知：Backend 事实来源、App 横幅/Toast、Admin 模板预览、Job digest、CI smoke | Docs / Backend / Admin / App / Website / Job Service / CI-CD | TASK-DOC-USER-GROWTH-REVENUE-001 / User Contact |
| TASK-DOCS-GOVERNANCE-SYNC-BATCH-001 | Contract index、Cursor handoffs、tasks/MVP plan、auth-rbac permission index 同步 | Docs / All repos | TASK-CICD-CLOSED-LOOP-BATCH-001 |
| TASK-CICD-CLOSED-LOOP-BATCH-001 | Dashboard、System Settings/Scheduler、App Release、Observability、I18N、Jobs Hardening smoke 集成 | CI-CD / QA | Backend/Admin/App/Job Service contracts |
| TASK-DOC-CONTROL-PLANE-001 | App / NodeAgent / Job Service / Backend / Admin 控制平面闭环架构 | Docs / All | Job Center / GeoIP / NodeAgent release docs |
| [TASK-DOC-JOB-QUEUE-MATRIX-001-job-queue-usage-matrix.md](tasks/TASK-DOC-JOB-QUEUE-MATRIX-001-job-queue-usage-matrix.md) | 全局队列使用矩阵：定义哪些场景必须走 Job Service 队列，哪些可同步执行，DB/Redis 边界和 Backend/NodeAgent 开发门禁 | Docs / Backend / NodeAgent / Job Service | TASK-DOC-CONTROL-PLANE-001 |

## 3. 当前 Roadmap 状态

### 已完成 / 稳定

#### Docs 契约层

- ProtocolProfile 接口定义 + Renderer dispatcher + SecretRef 框架（TASK-DOC-PROTOCOL-001 / TASK-NODEAGENT-PROTOCOL-001）— Draft：契约文档已存在，TASK 待实现/验收
- Connect Config 安全契约（TASK-VPN-CONFIG-001）— Draft：契约文档已存在，TASK 待实现/验收
- Backend protocol_profile 命名对齐（TASK-BACKEND-PROTOCOL-001）
- NodeAgent binary 分发、配置发布与回滚契约（TASK-DOC-NODEAGENT-RELEASE-001）— 已升级为 Ready
- GeoIP 数据库更新、NodeAgent 同步与 App 增量同步契约（TASK-DOC-GEOIP-SYNC-001）— 已升级为 Ready
- GeoIP Source Hardening 契约（TASK-DOC-GEOIP-CONTRACT-002）— Source allowlist、storage abstraction、manifest signature、rate limit、delta/full strategy、unknown format、MaxMind tar.gz、安全边界 + 各仓库实现状态
- Content System 统一契约（TASK-DOC-CONTENT-001）— content_items 模型、6 种内容类型、Blog/App/Admin API、跳转规则
- I18N Localization（TASK-DOC-I18N-001）— `zh-CN` 默认、`en-US` fallback、Backend `message_key`、Content locale、Website SEO、Admin/App 本地化
- Protocol Capability Sync（TASK-DOC-PROTOCOL-CAPABILITY-SYNC-001）— NodeAgent 上报真实协议支持，Backend 聚合 eligibility，Admin 显示支持状态并阻断 unsafe rollout
- Protocol Endpoint Stability Gate（TASK-DOC-PROTOCOL-STABILITY-GATE-001）— NodeAgent 多协议多端点、Backend-owned App reconnect hint、Admin Node Detail 真接口、LKG/rollback 和 QA/CI 稳定性门禁
- Control Plane Closed Loop 架构（TASK-DOC-CONTROL-PLANE-001）— Admin 意图、Backend 授权、Job Service 队列执行、NodeAgent/App 回传、Admin 展示和回滚
- Job Queue Usage Matrix（TASK-DOC-JOB-QUEUE-MATRIX-001）— 全局长任务、fan-out、retry/backoff、定时任务、DB/Redis 队列边界和 Backend/NodeAgent 必读门禁
- Observability Log/Metric Pipeline（TASK-DOC-OBSERVABILITY-LOGS-METRICS-001）— Backend audit/log APIs、NodeAgent log upload、App Sentry runtime config + summary、payment order logs、notification delivery logs、Job Service queued ingestion、Prometheus metrics、Admin Observability pages
- Admin Navigation IA（TASK-DOC-ADMIN-NAV-IA-001）— Admin 左侧菜单分组、折叠、RBAC 可见性、路由收敛和深链接兼容契约
- Admin System Settings + Scheduler CRUD（TASK-DOC-ADMIN-SYSTEM-SETTINGS-001）— `/admin/settings` GeoIP 凭证、IM Provider、简报模板、订阅配置、支付/调度设置；`/admin/jobs/schedules` 新增/修改/删除/预览/立即运行
- App Release Distribution（TASK-DOC-APP-RELEASE-DISTRIBUTION-001）— `/admin/app/releases`、App release metadata、S3/OSS/COS/GCS/local artifact storage、App update-check、Website downloads、CI/CD build/sign/upload/register
- App Runtime Governance（TASK-DOC-APP-RUNTIME-GOVERNANCE-001）— 旧 `vpn_client_governance` 升级为 `/api/v1/app/runtime-config`，覆盖内存、健康检查、重连、Circuit Breaker、缓存和平台 override
- CI/CD Closed-Loop Smoke Batch（TASK-CICD-CLOSED-LOOP-BATCH-001）— Dashboard、System Settings/Scheduler、App Release、Observability、I18N、Jobs Hardening 六域 smoke 已统一接入 `scripts/smoke.sh` 和 staging workflow
- Docs Governance Sync Batch（TASK-DOCS-GOVERNANCE-SYNC-BATCH-001）— contract index、Cursor handoff、tasks/MVP plan、auth-rbac 权限索引闭环
- Issue / Task Sync Governance（TASK-DOC-ISSUE-TASK-SYNC-GOVERNANCE-001）— Epic/Child/Verification Issue、multi-window lease、structured statuses、Issue close/reopen rules
- User Contact & Notification（TASK-DOC-USER-CONTACT-NOTIFICATION-001）— Telegram/WhatsApp/Lark 联系方式、通知偏好、机器人邀请、delivery logs、Job Service 通知投递和隐私 redaction
- User Growth & Revenue（TASK-DOC-USER-GROWTH-REVENUE-001）— USDT 收款资料、预留支付宝/微信/银行卡、推广链接、推广/赞助收益规则、邀请/赞助/结算报表、收益异常反馈和登录收益激励通知
- Growth Reward Notification（TASK-DOC-GROWTH-REWARD-NOTIFICATION-001）— 推广/赞助收益入账后的登录横幅、App Toast、Admin 模板预览、Job digest 和通知偏好闭环

#### 2026-05-20 — Job Service 完整性核验 + 补救

> 本节用于防止 MVP 计划只停留在契约层。每次 Backend / Admin /
> App / NodeAgent / Job Service / CI-CD 完成跨仓库闭环任务后，必须在这里同步
> 当前实现状态、剩余阻塞和下一步窗口。

| Domain | TASK | Repo | Status | Evidence / Notes | Next Window |
| --- | --- | --- | --- | --- | --- |
| Backend Observability | TASK-BACKEND-APP-SENTRY-CONFIG-001 | `livemask-backend` | ✅ Done | `GET /api/v1/app/observability/config`、Admin Sentry settings、secret-safe response、tests/build/vet pass. | App consumes runtime Sentry config. |
| Backend Observability | TASK-BACKEND-OBSERVABILITY-LOGS-001 | `livemask-backend` | ✅ Done | `POST /internal/agent/logs`、Admin logs/audit/metrics APIs、Node logs/metrics summary、redaction、Backend `/metrics`. | NodeAgent upload + Admin logs UI. |
| Backend Observability | TASK-BACKEND-SENTRY-SUMMARY-001 | `livemask-backend` | ✅ Done | Sentry webhook summary + `GET /admin/api/v1/app/exceptions`, redacted issue summaries only. | Admin exception views. |
| Backend Observability | TASK-BACKEND-PAYMENT-LOGS-001 | `livemask-backend` | ✅ Done | Payment order log schema/API with provider payload summary and redaction. | Admin payment log timeline. |
| Backend Observability | TASK-BACKEND-NOTIFICATION-LOGS-001 | `livemask-backend` | ✅ Done | Notification delivery log schema/API with masked recipients and provider callback events. | Admin notification log UI. |
| Backend Smoke Fix | TASK-BACKEND-OBSERVABILITY-SMOKE-FIX-001 | `livemask-backend` | ✅ Done | Logs family routes fixed, `/admin/api/v1/observability/sentry*` aliases registered, `system_settings` table split from configcenter. | CI/CD rerun smoke to full PASS. |
| CI/CD Observability | TASK-CICD-SENTRY-CONFIG-SMOKE-001 | `livemask-ci-cd` | ✅ Passed | Backend health, Admin login, App-facing Sentry config disabled response, forbidden-field check, Admin Sentry settings, RBAC, and secret leak scan all pass. App fallback evidence is an expected SKIP because CI/CD does not run App runtime tests. | Admin and App may rely on Sentry config contract. |
| CI/CD Observability | TASK-CICD-OBSERVABILITY-SMOKE-001 | `livemask-ci-cd` | ✅ Passed | All 23 sections executed with 0 failures. Backend/Job Service/NodeAgent reachable; all `/metrics` endpoints expose required metrics; NodeAgent log upload returns 202; global/agent/payment/notification/audit logs return 200; Sentry summary/events/performance return 200; RBAC 401/403 checks pass; secret leak scan has 0 leaks. Expected SKIPs: cosmetic Job Service health JSON response and payment order logs when no order data exists. | Unlock Admin Observability UI and keep CI regression in `scripts/smoke.sh`. |
| Job Service Observability | TASK-JOBS-OBSERVABILITY-INGEST-001 | `livemask-job-service` | ✅ Done / Reconciled | `observability_log_ingest` executor, 16 tests, Backend executor path, forbidden key rejection, secret leak scan. Reconciled on `task/TASK-JOBS-OBSERVABILITY-INGEST-001-reconcile` (`1f999c3`), merged `fad4982`, validation on dev PASS. Was missing on origin/dev despite docs claiming Done. | Verify Backend async queue path in CI/CD. |
| NodeAgent Observability | TASK-NODEAGENT-METRICS-LOGS-001 + TASK-NODEAGENT-OBSERVABILITY-UPLOAD-INTEGRATION-001 + TASK-NODEAGENT-OBSERVABILITY-UPLOAD-202-FIX-001 | `livemask-nodeagent` | ✅ Verified dev-local | Local log queue, HMAC upload client, `/metrics`, `/agent/status` observability block implemented. HMAC headers/signature, `batch_id`, retry/backoff/exhaustion/overflow, redaction/truncation all verified. Fixed `nodeSecret` redaction by normalizing sensitive key map entry to lowercase `nodesecret`. Upload client now accepts Backend `202 Accepted` and current response shape `{accepted:true, accepted_count}`; dev-local NodeAgent log shows `log upload success` after targeted restart. | CI/CD observability smoke regression + Admin logs UI. |
| App Sentry | TASK-APP-SENTRY-OBSERVABILITY-001 + TASK-APP-SENTRY-RUNTIME-CONFIG-001 | `livemask-app` | ✅ Done / ⚠️ Platform build blockers | Backend runtime config client/model/cache/service/providers and initialization flow integrated. Backend `enabled:false` is authoritative and no longer falls through to cache or dart-define; dart-define remains only Backend-unreachable fallback. Forbidden Sentry secrets dropped at parse time. `flutter analyze` PASS, `flutter test` 429 PASS, observability config tests 28 PASS, macOS ARM64 and web builds PASS. iOS simulator blocked by pre-existing Sequoia xattr/codesign issue; Android debug blocked by pre-existing sentry_flutter Kotlin mismatch. | CI/CD Sentry config smoke regression + fix Android/iOS environment/dependency blockers. |
| App Ops Batch | TASK-APP-CLIENT-OPS-BATCH-001 | `livemask-app` | ✅ Done | Release check, i18n, Sentry base, content feed, GeoIP lookup, node region badge; analyze/test pass. | Full-platform build matrix + Backend integration follow-ups. |
| Protocol Capability | TASK-NODEAGENT-PROTOCOL-CAPABILITY-001 | `livemask-nodeagent` | ✅ Done | Capabilities derived from local protocol registry and included in heartbeat/status. | Backend capability storage and Admin display. |
| Protocol Capability Heartbeat | TASK-BACKEND-PROTOCOL-CAPABILITY-WIRING-001 | `livemask-backend` | ✅ Verified dev-local | `nodeService.SetCapabilityProcessor(protocolService)` now forwards NodeAgent heartbeat `protocol_capabilities` into `node_protocol_capabilities`; `connectService.SetCapabilityProvider(protocolService)` now enables connect_config gating from stored capability state. After targeted Backend/NodeAgent restart, node `4877168a-8c89-436e-9209-e265faf41bd6` has 8 capability rows: mixed/socks/tun implemented, hysteria2 app_pending, vless_reality/trojan/shadowtls/wireguard reserved. | Admin Node Detail can display real protocol capabilities. |
| Admin Node Detail Observability | TASK-ADMIN-NODE-DETAIL-OBSERVABILITY-FIX-001 + TASK-BACKEND-NODE-DETAIL-REAL-DATA-001 | `livemask-admin` / `livemask-backend` | ✅ Verified dev-local | Node Detail logs now accept Backend `entries`, metrics uses `/nodes/{node_id}/metrics-summary`, and protocol capabilities uses `/protocol/nodes/{node_id}/capabilities` instead of stale mock-only route. Backend real-data endpoints return 200 for the local node and 404 `NODE_NOT_FOUND` for missing nodes across logs, metrics summary, and protocol capabilities. MetaMask extension noise is silenced before Next dev overlay. | Refresh Admin page and keep CI/UI smoke as regression. |
| Protocol Rollout | TASK-JOBS-PROTOCOL-ENDPOINT-001 | `livemask-job-service` | ✅ Done | Protocol rollout/rollback executor with waves, locks, retry/backoff, redacted events. | Backend executor endpoints and Admin rollout UI. |
| Protocol Stability Gate | TASK-DOC-PROTOCOL-STABILITY-GATE-001 | `livemask-docs` | ✅ Ready | Implementation gate, Admin real API list, Backend-owned reconnect hint rule, Cursor handoff. | Backend/Admin/NodeAgent/App/CI-CD stability tasks. |
| App Release | TASK-DOC-APP-RELEASE-DISTRIBUTION-001 | `livemask-docs` | ✅ Ready | App release contract covers S3/OSS/COS/GCS/local storage, Backend metadata, App update-check, Website downloads, and Admin Release Control IA where App Release and NodeAgent Release share one Operations menu/page while keeping separate tabs, permissions, APIs, data models, and audit events. | Backend/Admin/App/Website/CI-CD implementation; Admin should use `/admin/releases` overview with `/admin/app/releases` and `/admin/nodeagent/releases` deep links. |
| App Release | TASK-BACKEND-APP-RELEASE-LATEST-001 | `livemask-backend` | ✅ Done | Branch `task/TASK-BACKEND-APP-RELEASE-LATEST-001`, commit `449786b`. Added `GET /api/v1/app/releases/latest` with optional `channel` and `platform` filters, public-safe response types, latest published release lookup, artifact listing, input validation, and 14 apprelease tests. Response excludes sensitive fields such as `storage_key`, `created_by`, `updated_by`, `target_regions`, and `target_locales`. `go test ./internal/apprelease/...`, `go vet ./internal/apprelease/...`, `go build ./internal/apprelease/...`, and `git diff --check` pass. | Website downloads/release-control regression can move from Backend-blocked to real integration smoke. |
| App Release | TASK-ADMIN-APP-RELEASE-001 | `livemask-admin` | ✅ Done | Branch `task/TASK-ADMIN-APP-RELEASE-001`, commit `5729c2a`. Added App Release types/meta helpers, real-first API client, safe mock seed, React Query hooks, `/admin/app/releases` list page, and `/admin/app/releases/{releaseId}` detail page with metadata cards, artifact list, timeline, status filters, expand/collapse, confirmations, zh-CN default UI, `MockBadge`, and `app_release:read/write` RBAC. | Backend App Release APIs and CI/CD release-control smoke remain required for real end-to-end publish flow. |
| App Release | TASK-ADMIN-RELEASE-CONTROL-IA-001 | `livemask-admin` | ✅ Done | Branch `task/TASK-ADMIN-RELEASE-CONTROL-IA-001`, commit `fea9f48`. Added shared Operations `Releases` sidebar entry, `/admin/releases` overview with App/NodeAgent tabs, separate App `app_release:*` and NodeAgent `node:read` permissions, preserved deep links `/admin/app/releases` and `/admin/nodeagent/releases`, and added tabs UI component. | Release Control IA is ready for Backend real data and CI/CD smoke. |
| App Release | TASK-JOBS-APP-RELEASE-001 | `livemask-job-service` | ✅ Done | Branch `task/TASK-JOBS-APP-RELEASE-001`, commit `5f87d6d`. Added executors for `app_release_artifact_verify`, `app_release_publish`, `app_release_revoke`, `app_release_storage_verify`, `app_release_adoption_aggregate`, and `website_downloads_refresh`. Jobs call Backend internal executor APIs, use owner domain `app_release`, reject storage credential/private-key params, and pass `go test ./...`, `go vet ./...`, `go build ./cmd/job-service`, and `git diff --check`. | Backend must implement `/internal/job-executors/app-release/*` executor APIs; CI/CD release-control smoke can verify once Backend APIs exist. |
| App Release | TASK-APP-RELEASE-CHECK-REGRESSION-001 | `livemask-app` | ✅ Done / ⚠️ platform blockers | App release-check regression aligned with `APP_RELEASE_DISTRIBUTION_CONTRACT.md` section 7.1. Security checks pass: `download_url` is not sent to Sentry breadcrumbs, signed query strings are only passed to `launchUrl`, forced update uses non-dismissible `PopScope(canPop:false)`, optional update can be dismissed, sha256/signature stay local, and release notes use locale from `localeProvider`. `flutter analyze` PASS, `flutter test` 401 PASS, macOS universal build PASS with arm64/x86_64 slices, iOS simulator build PASS, and web build PASS. iOS device is blocked by signing/physical-device requirements. Android debug/release remain blocked by pre-existing `sentry_flutter` Kotlin language version issue; Windows/Linux require Parallels VMs. `PlatformInfo._hostArchitecture()` uses compile-time `APP_ARCH` on iOS/Android, so release pipelines must inject it correctly. | Keep Backend `GET /api/v1/app/releases/check` available or mock-compatible; next App tasks are User Growth Revenue entry and Growth Reward Push regression. |
| Website Referral Landing | TASK-WEBSITE-REFERRAL-LANDING-001 | `livemask-website` | ✅ Done | Branch `task/TASK-WEBSITE-REFERRAL-LANDING-001`, commit `c778c5d`. RegisterPage reads `?ref=CODE`, sanitizes to uppercase alphanumeric, auto-fills the invitation code input, shows a lightweight zh-CN/en-US referral prompt, hides inviter identity, and prevents open redirect behavior. | CI/CD growth revenue smoke should verify `/register?ref=CODE` attribution preservation. |
| Website Public Growth | TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001 | `livemask-website` | ✅ Done | Original branch `task/TASK-WEBSITE-PUBLIC-GROWTH-BATCH-001`, commit `9d8c144`. Downloads page consumes `GET /api/v1/app/releases/latest` with safe mock fallback, zh-CN default route and hreflang are implemented, Blog pages use Content APIs, `help_article` and `release_note` are supported, and build-time sitemap/RSS generation avoids per-request CPU spikes. `tsc -b`, `npm run build`, sitemap/RSS generation, mock mode, and `git diff --check` pass. | Backend latest endpoint is now implemented by `TASK-BACKEND-APP-RELEASE-LATEST-001`; CI/CD should run Website downloads/sitemap/RSS real integration smoke. |
| Website Release Control | TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001 | `livemask-website` | ✅ Verified / ready for real integration smoke | Regression branch `task/TASK-WEBSITE-RELEASE-CONTROL-REGRESSION-001`, commit `5edaada`. Verified `/download`, `GET /api/v1/app/releases/latest` client integration, latest stable per platform, release notes URL typing, zh-CN default / en-US fallback, hreflang, build-time sitemap/RSS, production `VITE_API_MOCK_MODE=false`, no hardcoded artifact URL, no signed URL query exposure, and no per-request sitemap/RSS generation. `tsc -b`, `npm run build`, and `git diff --check` pass. | Backend latest endpoint is now implemented by `TASK-BACKEND-APP-RELEASE-LATEST-001`; run real integration smoke against deployed Backend. |
| System Settings / Scheduler | TASK-DOC-ADMIN-SYSTEM-SETTINGS-001 | `livemask-docs` | ✅ Ready | GeoIP credentials, IM provider settings, report templates, subscription config, scheduler CRUD. | Backend/Admin/Job Service implementation and smoke. |
| User Growth Revenue | TASK-DOC-USER-GROWTH-REVENUE-001 | `livemask-docs` | ✅ Ready | Contract defines payout methods, referral links, promotion/sponsor reward rules, earnings ledger, settlement reports, and revenue feedback. | Backend implementation starts with `TASK-BACKEND-USER-GROWTH-REVENUE-001`. |
| User Growth Revenue | TASK-BACKEND-USER-GROWTH-REVENUE-001 | `livemask-backend` | ✅ Done dev-local | Added `internal/growth` schema/service/API for USDT payout methods, reserved payout method rejection, referral link generation, referral/sponsor reports, settlement reports, revenue feedback, default reward rules, and growth/settlement RBAC permissions. Runtime HTTP checks pass for user and Admin APIs. | Admin/App/Website/Job Service/CI-CD implementation tasks are unlocked. |
| User Growth Revenue | TASK-ADMIN-USER-GROWTH-REVENUE-001 | `livemask-admin` | ✅ Done | Branch `task/TASK-ADMIN-USER-GROWTH-REVENUE-001`, commit `e675a64`. Added `/admin/growth` hub, referral reports, sponsor reports, settlement management, and revenue feedback pages. API client covers referral rules, ambassador rules, referral/sponsor reports, settlements, and revenue feedback. `growth:read` controls Growth pages, `settlement:read` controls settlement page, and payout addresses remain masked. | CI/CD growth revenue smoke should verify Admin pages/API/RBAC and secret leakage. |
| User Growth Revenue | TASK-JOBS-GROWTH-SETTLEMENT-001 | `livemask-job-service` | ✅ Done | Branch `task/TASK-JOBS-GROWTH-SETTLEMENT-001`, commit `46f67ad`. Added `growth_ledger_aggregate`, `growth_settlement_generate`, and `growth_settlement_reconcile` executors with Backend paths `/internal/job-executors/growth/ledger-aggregate`, `/internal/job-executors/growth/settlement-generate`, and `/internal/job-executors/growth/settlement-reconcile`. No real payout; payout/wallet/signing secrets are rejected; retry/backoff/dead-letter behavior is covered. `go test ./... -count=1`, `go vet ./...`, `go build ./cmd/job-service`, and `git diff --check` pass. | Backend must implement the three growth settlement executor APIs before end-to-end settlement jobs can run. |
| Growth Reward Notification | TASK-DOC-GROWTH-REWARD-NOTIFICATION-001 | `livemask-docs` | ✅ Ready | Reassessed growth revenue loop to include Backend-derived login/foreground earnings prompts such as promotion/sponsor reward earned banners, masked referred user/node params, frequency caps, notification preferences, Admin preview, Job digest, and CI smoke. | Start `TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001`, then App/Admin/Job/CI follow-ups. |
| Growth Reward Notification | TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001 | `livemask-backend` | ✅ Done | Branch `task/TASK-BACKEND-GROWTH-REWARD-NOTIFICATIONS-001`, commit `06d0c8d`. Added `growth_reward_notifications` schema, login fetch max 3, idempotent ack, summary, Admin list/preview, 15-minute toast frequency cap, redacted params, and 26 tests. `go test ./internal/growth`, `go test ./internal/auth`, `go vet ./internal/growth`, `go build ./internal/growth`, and `git diff --check` pass. | Unlock App prompt UI, Admin notification page, CI smoke, and Job digest after pulling Backend branch. |
| Growth Reward Notification | TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001 | `livemask-backend` | ✅ Done / ⚠️ full-suite unrelated failure | Branch `task/TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001`. Added Backend internal executor APIs for `POST /internal/job-executors/growth/reward-digest` and `POST /internal/job-executors/growth/reward-notification-dispatch`. `go test ./internal/growth/...`, `go test ./internal/auth/...`, `go vet ./internal/growth/...`, `go build ./internal/growth/...`, and `git diff --check` pass. `go test ./...` still has pre-existing unrelated `auth.HasPermission` failures in geoip/nodeagent. | Job Service growth reward digest can now be smoke-tested against Backend executor APIs. |
| Growth Reward Notification | TASK-JOBS-GROWTH-REWARD-DIGEST-001 + TASK-JOBS-GROWTH-REWARD-DIGEST-REGRESSION-001 | `livemask-job-service` | ✅ Done | Original branch `task/TASK-JOBS-GROWTH-REWARD-DIGEST-001`; regression branch `task/TASK-JOBS-GROWTH-REWARD-DIGEST-REGRESSION-001`, commits `8a38f26` and `66aa194`. Added `growth_reward_digest` and `growth_reward_notification_dispatch` executors, registered job definitions and main wiring, plus 10 regression tests for 4xx blocked behavior, 5xx retry/exhaustion, secret leak scan, and Backend path verification. 27 tests pass. | Backend executor APIs are now implemented by `TASK-BACKEND-GROWTH-REWARD-JOB-EXECUTOR-API-001`; CI smoke can verify JobService -> Backend executor calls. |
| Growth Reward Notification | TASK-APP-GROWTH-REWARD-PUSH-001 | `livemask-app` | ✅ Done / ⚠️ Android environment blocker | Added GrowthNotification API client, models, SharedPreferences cache, Riverpod notifier, login/foreground refresh, ack handling, earnings banner, toast handler, profile notification entry, zh/en i18n keys, and Home/Profile integration. `flutter analyze` PASS, `flutter test` 401 PASS, macOS universal build PASS, iOS simulator build PASS, web build PASS. Android debug/release remain blocked by pre-existing `sentry_flutter` Kotlin language version mismatch; Windows/Linux require Parallels hosts. | Admin UI and CI smoke can proceed; create separate Android Kotlin compatibility task. |
| Growth Reward Notification | TASK-ADMIN-GROWTH-NOTIFICATION-TEMPLATES-001 + TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001 | `livemask-admin` | ✅ Done | Template task added Growth Notifications navigation and `/admin/growth/notifications`; regression branch `task/TASK-ADMIN-GROWTH-NOTIFICATION-REGRESSION-001`, commit `74fdb6a`, confirms zh/en labels, masked user fields, USDT amounts, independent mock production guard, preview dialog, `growth:read` RBAC, and no trailing-whitespace cleanup needed because `logs-api.ts` is absent on dev. | CI smoke can verify Admin route/API/RBAC and no sensitive growth notification leakage. |

Current priority order:

1. Unlock `TASK-ADMIN-OBSERVABILITY-LOGS-001` for `/admin/logs`,
   `/admin/audit-logs`, App exceptions, payment logs, notification logs, and
   Node Detail latest logs / metrics summary.
2. Fix App platform build blockers: iOS simulator Sequoia xattr/codesign issue
   and Android sentry_flutter Kotlin mismatch; then run the full-platform build
   matrix required by `livemask-app/.cursorrules`.
3. Keep `TASK-CICD-SENTRY-CONFIG-SMOKE-001` and
   `TASK-CICD-OBSERVABILITY-SMOKE-001` in `scripts/smoke.sh` as regression gates.
4. Start `TASK-BACKEND-PROTOCOL-STABILITY-001` only after the protocol stability
   gate is accepted by Backend / NodeAgent / Admin windows.

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

### 下一步 — I18N / 中文本地化

> 中文必须成为默认用户体验。Backend 输出稳定 `message_key`，Admin/Website/App 使用各自 i18n layer 渲染中文，Website 必须输出 SEO 可采集的中文 HTML。

| TASK | 目标 | Owner | 依赖 |
| --- | --- | --- | --- |
| [TASK-DOC-I18N-001-i18n-localization-contract.md](tasks/TASK-DOC-I18N-001-i18n-localization-contract.md) | 定义跨仓库 i18n 契约 | Docs | Content System / Website SEO / App UX |
| TASK-BACKEND-I18N-001 | locale parser、error `message_key`、Content locale/fallback、user `preferred_locale` | Backend | TASK-DOC-I18N-001 |
| TASK-ADMIN-I18N-001 | Admin i18n layer、中文默认、语言切换、localized errors/toasts | Admin | TASK-BACKEND-I18N-001 |
| TASK-WEBSITE-I18N-001 | Website 中文 SEO、locale routes/hreflang、Blog/Content locale、中文默认导航 | Website | TASK-BACKEND-I18N-001 |
| TASK-APP-I18N-001 | Flutter localization、Profile language setting、localized errors、Content feed locale | App | TASK-BACKEND-I18N-001 |
| TASK-CICD-I18N-001 | i18n smoke：Backend message_key、Admin/Website 中文、App localization tests、hreflang/sitemap | DevOps | Backend/Admin/Website/App i18n tasks |

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

### CI/CD Closed-Loop Smoke Batch (TASK-CICD-CLOSED-LOOP-BATCH-001)

完整的 CI/CD 验收闭环。Backend/Admin 实现对应 API 端点后，这些 smoke 会自动从 SKIP 切换为 PASS。

| 子任务 | 脚本 | 验证范围 | 关键依赖 |
|--------|------|----------|----------|
| TASK-CICD-DASHBOARD-001 | `dashboard-smoke.sh` | 仪表盘 traffic/countries/bandwidth/top-users/mock/empty-error | Backend dashboard APIs |
| TASK-CICD-SYSTEM-SETTINGS-SCHEDULER-001 | `system-settings-smoke.sh` | 系统设置 CRUD、Schedule CRUD、secret leak scan | Backend + Job Service APIs |
| TASK-CICD-APP-RELEASE-001 | `app-release-smoke.sh` | 应用发布 lifecycle、Website 下载、storage secret scan | Backend + Admin APIs |
| TASK-CICD-OBSERVABILITY-SMOKE-001 | `observability-smoke.sh` | NodeAgent logs、Sentry/Payment/Notification logs、metrics | Backend + Job Service APIs |
| TASK-CICD-I18N-001 | `i18n-smoke.sh` | Backend message_key、Admin zh-CN、Website hreflang/sitemap、App locale | Backend + Website APIs |
| TASK-CICD-JOBS-HARDENING-001 | `jobs-hardening-smoke.sh` | Queue lease/retry/backoff/dead-letter/duplicate lock/run events | Backend + Job Service APIs |

集成入口: `scripts/smoke.sh` + `.github/workflows/staging-smoke.yml` (部署在 TASK-CICD-CLOSED-LOOP-BATCH-001)。

## 4. MVP 完成标准

- [ ] 核心 API 契约已在 `docs/contracts/api/core-mvp.md` 登记。
- [ ] 核心配置已在 `docs/contracts/config/core-configs.md` 登记。
- [ ] 核心事件已在 `docs/contracts/events/core-events.md` 登记。
- [ ] Redis key 和数据一致性策略已在 `docs/data/redis-key-registry.md` 登记。
- [ ] Outbox / 补偿任务已在 `docs/data/outbox-compensation.md` 登记。
- [ ] P0 测试矩阵已在 `docs/qa/P0_VALIDATION_MATRIX.md` 登记。
- [ ] 上线 Runbook 已在 `docs/operations/RELEASE_RUNBOOK.md` 登记。
