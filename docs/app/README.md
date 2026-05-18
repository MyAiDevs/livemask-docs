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

## 7. 控制平面闭环

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Job Queue Usage Matrix](../contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md)

App 不直接参与 Admin 任务调度，但会消费 Job Service 驱动后由 Backend 暴露的结果，例如 GeoIP 增量包、Content feed、节点 region/degraded 状态、协议 profile rollout 状态和维护公告。App 必须坚持 pull-safe、本地缓存、last-known-good、无 secret 下发和用户可解释的降级状态。

当 App 需求涉及 GeoIP package、Content feed、维护公告、节点 region、协议 rollout 状态、连接质量上报或本地缓存刷新时，应先确认这些数据是否来自 queue-driven Backend workflow。App 不得调用 Job Service，也不得接收 Job Service token、Admin token、vendor credential、node secret 或第三方 GeoIP source URL。
