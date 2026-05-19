# App 文档入口

## 1. 职责范围

`livemask-app` 负责客户端交互、登录、连接流程、支付入口、用户反馈、本地缓存和错误恢复。

重要边界：Flutter 只负责跨平台 UI、状态和 API 集成。真正的系统 VPN
连接能力必须通过平台原生层实现，详见
[`VPN_NATIVE_RUNTIME_CONTRACT.md`](VPN_NATIVE_RUNTIME_CONTRACT.md)。

## 2. 修改 App 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否依赖 Backend API 字段、错误码或状态机变化
- [ ] 是否依赖 NodeAgent 状态、连接质量或降级信息
- [ ] 是否影响支付入口、订阅状态或用户权益展示
- [ ] 是否需要本地缓存迁移或兼容旧数据
- [ ] 如果涉及 VPN 连接，是否明确对应平台原生能力，而不是纯 Flutter/Dart
      实现

## 3. 必须更新文档的场景

- Onboarding、登录、连接、支付流程变化
- API 请求封装或错误处理变化
- 本地缓存字段或迁移变化
- 用户可见状态、提示文案、重试策略变化
- VPN 连接、断开、节点切换、权限申请、平台原生 tunnel 状态变化

## 4. 完成标准

- [ ] 用户反馈路径完整
- [ ] 失败、重试、取消和恢复路径完整
- [ ] Backend / NodeAgent 影响已检查
- [ ] VPN 相关任务已说明 Android/iOS/macOS/Windows/Linux 原生实现和验证状态
- [ ] 验证结果写入 PR 或任务记录

## 5. 设计输入

- `docs/app/LIVEMASK_APP_DESIGN_BRIEF_FOR_ATOMS.md`
- `docs/app/VPN_NATIVE_RUNTIME_CONTRACT.md`
- `docs/app/APP_PLATFORM_COMPATIBILITY_MATRIX.md`
- `docs/app/APP_LOCAL_BUILD_AND_TROUBLESHOOTING.md`
- `design/app/README.md`
- `design/app/atoms/v2/README.md`
- `design/app/atoms/v2/export/.wiki.md`

该文档用于生成 App 原型设计，包含 Atoms 可直接使用的 Prompt、MVP 屏幕清单、状态设计、失败恢复路径和开发交付组件要求。

当前 App UI 事实源为 `design/app/atoms/v2/`。App 开发者必须把 Atoms
设计稿翻译成 Flutter 组件和页面状态，而不是把 Atoms/React/Atoms Cloud
运行时代码直接复制到 `livemask-app`。如果任务涉及用户可见 UI，完成报告必须
包含 `Design Alignment` 小节，说明读取了哪些设计文件、对应了哪些屏幕和组件。

## 6. 平台兼容性要求

App 开发必须遵守
[`APP_PLATFORM_COMPATIBILITY_MATRIX.md`](APP_PLATFORM_COMPATIBILITY_MATRIX.md)。
每个 release candidate 都需要记录 macOS Apple Silicon、macOS Intel、iOS、
Android、Windows、Linux 和 Web 的编译/运行验证结果。不能用 Apple Silicon
的 macOS 构建结果代替 Intel，也不能在 macOS 上假设 Windows/Linux 已经通过；
这些目标必须在对应真实系统或 Parallels Desktop 客体系统内验证。

本地编译、运行、日志排查、Flutter/Xcode/Gradle/CocoaPods 注意事项详见
[`APP_LOCAL_BUILD_AND_TROUBLESHOOTING.md`](APP_LOCAL_BUILD_AND_TROUBLESHOOTING.md)。

## 7. 协议端点变更与优雅重连

- [Client Reconnect Hint Contract](../contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md) — App 通过 Backend realtime 通道接收协议/端点变更通知，优雅断线后拉取最新 connect_config，使用更新后的协议/端点重新连接。App 需处理 graceful_reconnect / reconnect_if_idle / reconnect_now 三种提示级别，并上报 ACK/result 事件。同时支持 fallback polling 模式。
- [Protocol Endpoint Stability Gate](../development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) — 明确 NodeAgent 不直接通知 App；App 只消费 Backend reconnect hint，并在拉取 fresh connect_config 后再切换。

App 必须把 reconnect hint 当作信号而不是配置载荷：按 `hint_id` 去重，校验
`expires_at` / `reconnect_after_ms`，保留旧 tunnel 直到新 connect_config 拉取并确认
profile 支持。unsupported、reserved、app_pending 协议必须进入安全 pending /
unsupported 状态，不得尝试启动黑洞连接。

相关后续任务：`TASK-APP-RECONNECT-HINT-001`、`TASK-APP-RECONNECT-STABILITY-001`

## 8. I18N / 中文本地化

- [I18N Localization Contract](../contracts/i18n/I18N_LOCALIZATION_CONTRACT.md)

App 默认必须支持 `zh-CN`，并保留 `en-US` fallback。用户可见文案不得继续散落在 Widget 中；登录、连接、节点、计费、Profile、Diagnostics、Content feed、GeoIP debug、Reconnect 状态和错误提示都必须通过 Flutter localization 渲染。Backend error 必须按 `message_key` / `code` 映射成本地化文案。

相关后续任务：`TASK-APP-I18N-001`

## 9. 控制平面闭环

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Job Queue Usage Matrix](../contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md)

App 不直接参与 Admin 任务调度，但会消费 Job Service 驱动后由 Backend 暴露的结果，例如 GeoIP 增量包、Content feed、节点 region/degraded 状态、协议 profile rollout 状态和维护公告。App 必须坚持 pull-safe、本地缓存、last-known-good、无 secret 下发和用户可解释的降级状态。

当 App 需求涉及 GeoIP package、Content feed、维护公告、节点 region、协议 rollout 状态、连接质量上报或本地缓存刷新时，应先确认这些数据是否来自 queue-driven Backend workflow。App 不得调用 Job Service，也不得接收 Job Service token、Admin token、vendor credential、node secret 或第三方 GeoIP source URL。

## 10. Sentry 日志与异常

- [Log, Audit, Metric, And Node Observability Pipeline Contract](../contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md)

App 崩溃、未捕获异常、native tunnel 错误、ANR/performance、连接失败 breadcrumbs 必须走 Sentry。App 不应把原始异常日志批量 POST 到 Backend；Backend/Admin 只消费 Sentry webhook/sync 产生的 redacted issue summary。

相关后续任务：`TASK-APP-SENTRY-OBSERVABILITY-001`

App Sentry 必须实现：

- 启动时优先从 Backend `GET /api/v1/app/observability/config` 读取
  Sentry client config；`--dart-define=SENTRY_DSN` 只作为 local/dev fallback
- 只接受 public client DSN、environment、release、采样率、breadcrumb 上限和
  low-cardinality tag allowlist；拒绝或忽略 Sentry auth token、project/org
  token、relay secret、webhook secret、private key、Authorization header
- `beforeSend` redaction：token、authorization、cookie、node endpoint + port、connect credentials、用户 email、local cache payload、full URL query
- safe tags：platform、app_version、release_channel、locale、profile_type、connect_state
- breadcrumbs：connect lifecycle、reconnect hint、GeoIP package sync、content fetch、billing entry、notification preference change
- 环境隔离：local/staging/production DSN、release、environment 必须可配置
- Backend 配置不可用时必须静默禁用或使用安全 fallback，不能阻塞 App 启动、
  登录、内容拉取或 VPN 连接
- 完成报告必须说明没有把 secret、node endpoint、payment credential、IM contact identifier 写入 Sentry context

## 11. App Runtime Governance / 多端性能治理

- [App Runtime Governance Config Contract](../contracts/app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md)

旧 `vpn_client_governance` 已升级为 `app_runtime_governance` 契约。App 必须通过 Backend `GET /api/v1/app/runtime-config` 获取多端运行时治理配置，用于内存、健康检查、重连、Circuit Breaker、缓存 TTL、平台 override 和本地队列上限。

App Runtime Governance 必须实现：

- 非阻塞拉取 runtime config，Backend 不可用时使用 last-known-good 或内置默认值。
- 校验 `config_key`、`schema_version`、`config_version`、`config_hash`。
- 支持 iOS / Android / macOS / Windows / Linux / Web 平台差异。
- iOS 使用更保守的 memory、health-check 和 reconnect 默认值。
- Web 不得宣称系统 VPN runtime 能力，只能消费 UI/cache 相关配置。
- 配置应用失败必须保留 LKG，不能阻塞启动、登录、内容、GeoIP 或 VPN 连接。
- 不接受 secret、node endpoint、connect credential、payment credential、IM contact identifier 或 signed URL。

相关后续任务：`TASK-APP-RUNTIME-GOVERNANCE-001`

## 12. App 版本发布与更新检查

- [App Release Distribution Contract](../contracts/app/APP_RELEASE_DISTRIBUTION_CONTRACT.md)

App 必须通过 Backend update-check 获取版本信息，不直接读取 S3/OSS/COS/GCS/local artifact URL，也不把下载地址硬编码在客户端。

Required App behavior:

- 启动、设置页或合适的冷却周期调用 `GET /api/v1/app/releases/check`。
- 请求携带 platform、arch、version、build_number、channel、locale。
- 中文默认，英文 fallback，release note 使用 Backend 返回的本地化内容。
- 尊重 `force_update`，但用户提示文案必须清晰、非恐吓。
- Android/macOS/Windows/Linux 等直接下载 artifact 的平台必须校验 `sha256` 和 signature。
- iOS 优先跳转 App Store/TestFlight URL，不绕过平台分发规则。
- 上报安全 update events：prompt shown、download started/succeeded/failed、install result、version active。
- 不记录 signed URL query、本地安装包路径、设备 secret 或 crash stack。App crash/exception 仍使用 Sentry。

相关后续任务：`TASK-APP-RELEASE-CHECK-001`
