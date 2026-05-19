# Admin / Frontend 文档入口

## 1. 职责范围

`livemask-admin` 负责运营后台、权限管理、配置编辑、审计查看、数据大盘、人工复核和内部工具。

管理员、运营者、赞助大使、推广大使、普通用户和订阅用户可以共用同一个后台产品和设计系统，但必须使用独立 URI 边界和权限边界，不能混在同一路径空间。

推荐路径边界：

| Surface | URI Prefix | 角色 |
| --- | --- | --- |
| 系统管理后台 | `/admin/system/*` | 超级管理员 / 安全管理员 |
| 运营后台 | `/admin/ops/*` | 运营 / 客服 / 节点运维 |
| 财务收益后台 | `/admin/finance/*` | 财务 / 收益审核 |
| 赞助大使自助后台 | `/sponsor/*` | 赞助节点 / Sponsor Ambassador |
| 推广大使自助后台 | `/ambassador/*` | 推广大使 |
| 普通用户账户后台 | `/account/*` | 登录用户 |
| 订阅用户账单后台 | `/billing/*` | 订阅 / 支付用户 |

隐藏菜单不是安全边界。所有前端路径隔离必须由 Backend 鉴权和授权同步强制执行。

## 2. 修改 Admin 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否修改 Backend Admin API 契约
- [ ] 是否修改配置项、FeatureFlag、风控参数或支付参数
- [ ] 是否新增或修改 URI 前缀、角色边界或权限边界
- [ ] 是否需要审计日志、双人复核或权限控制
- [ ] 是否影响运营、客服、财务或安全团队流程

## 3. 必须更新文档的场景

- Admin API 字段、筛选条件、分页、导出格式变化
- 配置表单新增、删除或修改字段
- 权限、角色、审批流或审计日志变化
- 运营大盘指标、口径或告警阈值变化
- 人工复核、申诉、退款、封禁流程变化

## 4. 完成标准

- [ ] API contract 已更新或确认无需更新
- [ ] 配置变更有 `CONFIG_CHANGE_RECORD`
- [ ] 权限矩阵和审计字段已说明
- [ ] 运营人员操作路径和异常处理路径完整
- [ ] 验证截图、接口响应或手工验证记录写入任务单

## 5. 前端设计输入

- `docs/admin/LIVEMASK_FRONTEND_DESIGN_BRIEF_FOR_ATOMS.md`

该文档用于 Admin Console、赞助节点、推广大使、收益配置、收益计算、追溯重算与 Website 的前端设计输入，包含 Atoms 可直接使用的 Prompt、页面结构、组件要求、状态设计和验收清单。

## 6. 协议端点模板与灰度管理

- [Protocol & Endpoint Template Contract](../contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) — Admin 需要实现 Protocol 模板管理（系统模板 / 自定义模板）、Assignment 创建（节点选择、灰度策略）、灰度进度查看和回滚操作。模板字段白名单必须遵守安全边界，secret 永不展示。
- [Protocol Endpoint Stability Gate](../development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) — NodeAgent 多协议多端点实施前门禁，包含 Admin Node Detail 真接口、Backend-owned reconnect hint、LKG/rollback 和 QA 矩阵。

Admin 展示协议时必须区分 seed template、reserved roadmap protocol 和 NodeAgent 真实能力。模板列表可以展示未来协议，但 Apply / Assignment 操作必须基于 Backend 聚合的 NodeAgent `protocol_capabilities` eligibility。Unsupported、Reserved、App pending、Capability stale 都必须有明确 badge 和阻断说明。

Node List / Node Detail 不得继续隐藏使用演示数据。所有节点状态、心跳、日志、
metrics summary、protocol capabilities、protocol endpoints、assignments、events
都必须来自 Backend Admin API；local/dev mock fallback 必须显示 Mock/Stale 徽章，
production 不允许静默 fallback。

当前 Node Detail 已实现接口对齐要求：

- Latest Logs 使用 `GET /admin/api/v1/nodes/{node_id}/logs`，兼容 Backend `entries` 响应。
- Node Metrics 使用 `GET /admin/api/v1/nodes/{node_id}/metrics-summary`。
- Protocol Capabilities 使用 `GET /admin/api/v1/protocol/nodes/{node_id}/capabilities`。

相关后续任务：`TASK-ADMIN-PROTOCOL-TEMPLATE-001`、`TASK-ADMIN-PROTOCOL-CAPABILITY-001`、`TASK-ADMIN-PROTOCOL-STABILITY-001`

### 6.1 Node Detail 真实数据验证策略 (TASK-BACKEND-NODE-DETAIL-REAL-DATA-001)

节点详情页三个辅助端点的数据验证逻辑：

| 端点 | Backend 200 正常 | Backend 200 空数据 | Backend 404 | Backend 403 |
| --- | --- | --- | --- | --- |
| `GET /nodes/{node_id}/logs` | 返回 logs 数组 | `{ logs: [], total: 0 }` → "No logs found." | `NODE_NOT_FOUND` → "Node not found" | `PERMISSION_DENIED` → Access Denied |
| `GET /nodes/{node_id}/metrics-summary` | 返回 full fields | 全部布尔 false + `collected_at: null` → "Metrics unavailable." | `NODE_NOT_FOUND` → "Node not found" | `PERMISSION_DENIED` → Access Denied |
| `GET /protocol/nodes/{node_id}/capabilities` | 返回 capabilities 数组 | `{ capabilities: [] }` → "No protocol capability data reported." | `NODE_NOT_FOUND` → "Node not found" | `PERMISSION_DENIED` → Access Denied |

**Mock fallback 触发条件（only in dev/local）：**
- Backend 返回 404（非 `NODE_NOT_FOUND`）或 501 — 端点未实现
- Backend 不可达（Network error / timeout）

**永不降级 mock 的条件：**
- `NODE_NOT_FOUND`（404） — 节点不存在，必须报错
- 403 — 权限不足，必须报错
- 401 — 会话过期，必须重定向登录

**Admin Node Detail UI 对每个端点独立展示 mock 徽章：**
- `viaMock` 来自每个 API 响应的 `MockableResponse.viaMock` 字段
- 空数据不展示 mock 徽章，只有实际 fallback 才展示

## 7. Admin Navigation IA

- [Admin Navigation Information Architecture Contract](../contracts/admin/ADMIN_NAVIGATION_IA_CONTRACT.md)

Admin 左侧菜单必须从平铺列表升级为分组、可折叠、RBAC-aware 的信息架构。菜单隐藏只是可用性优化，不是安全边界；所有路由和 API 仍由 Backend RBAC 强制控制。

Required top-level groups:

| Group | Scope |
| --- | --- |
| Dashboard | `/admin` 总览、运营态势、事件摘要 |
| Operations | Nodes、Jobs、Protocol & Endpoint、GeoIP、Traffic、Release Control（NodeAgent Releases + App Releases） |
| Content | Blog、公告、活动、App banner、release note、help article |
| Users & Growth | Users、角色、设备、Sponsor Ambassador、Promotion Ambassador、referral |
| Finance | Billing、payments、subscriptions、reconciliation |
| Observability | Logs、audit logs、incidents、metrics、node latest logs |
| System | Config Center、feature flags、settings、integrations |

功能页应通过 tabs / filters 收敛子页面，避免继续增加顶层菜单。例如 GeoIP Databases / Sources / Jobs / Events 应在一个 GeoIP 入口下展示；Content 的 blog / announcement / campaign / app_banner 应在统一 Content 入口下切换。

相关后续任务：`TASK-ADMIN-NAV-IA-001`

## 8. I18N / 中文本地化

- [I18N Localization Contract](../contracts/i18n/I18N_LOCALIZATION_CONTRACT.md)

Admin 默认必须支持中文，英文作为 fallback。不要在页面里继续散落硬编码英文文案；所有导航、Dashboard、Jobs、GeoIP、Content、Users、Logs/Audit、按钮、弹窗和 toast 都应进入统一 i18n layer。API 错误优先按 Backend `message_key` / `code` 显示本地化文案。

相关后续任务：`TASK-ADMIN-I18N-001`

## 9. Admin Job Center

- `docs/contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md`
- `docs/contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md`
- `docs/architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md`

通用触发器、定时任务、重试、取消、运行历史、事件日志、审计和 RBAC 必须归入独立的 Admin Job Center。GeoIP 更新、NodeAgent 发布/回滚、内容发布、Dashboard 聚合、账单对账、CI smoke 等任务都应通过 `/admin/jobs` 统一管理。

Job 执行层必须从第一版开始独立为 `livemask-job-service`，由 Backend 作为 Admin API Gateway 做认证、授权、审计归因和 service auth 转发。Admin 不直接调用 Job Service，也不在功能页面内重复实现 scheduler。

功能页面可以展示状态并跳转到 Job Center，但不应长期拥有通用 scheduler/trigger 能力。例如 `/admin/geoip` 可以保留数据库状态和 source credential 配置入口，真正的 `Trigger Update` 应迁移到 `/admin/jobs?job_type=geoip_source_update`。

## 10. Control Plane Operations Dashboard

- [Admin Control Plane Dashboard Contract](../contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md) — 定义所有 Dashboard 路由、Real-First Data 规则、Backend API 契约、3D/traffic map 数据契约、各模块 Widget 规格和 RBAC 门禁。

Dashboard 路由矩阵：

| Surface | Route | Data Source |
| --- | --- | --- |
| 全局总览 | `/admin` | `GET /admin/api/v1/dashboard/overview` + `control-plane` |
| 流量分析 | `/admin/traffic` | `GET /admin/api/v1/dashboard/traffic/flows` + `countries` + `bandwidth-trend` + `top-users` |
| Job 中心 | `/admin/jobs` | `GET /admin/api/v1/dashboard/jobs/summary` |
| GeoIP | `/admin/geoip` | `GET /admin/api/v1/dashboard/geoip/summary` |
| 协议端点模板 | `/admin/protocol-endpoints` | `GET /admin/api/v1/dashboard/protocol-endpoint/summary` |
| NodeAgent 发布 | `/admin/nodeagent/releases` | `GET /admin/api/v1/dashboard/nodeagent/summary` |
| 内容管理 | `/admin/content` | `GET /admin/api/v1/dashboard/content/summary` |
| 事件/告警 | embedded in `/admin` | `GET /admin/api/v1/dashboard/incidents` |

所有数据必须 Real-First。Production 不得静默展示 mock 数据。Local/dev 环境允许 mock fallback 但必须展示 Mock/Stale 徽章。

相关后续任务：`TASK-ADMIN-DASHBOARD-001`

`/admin/traffic` 必须展示全球流量走向、流量带宽趋势图、国家/地区流量排名和占比，以及当前窗口内高流量用户列表。高流量用户只能展示 masked email / display name / plan / traffic share，不得展示 IP、访问域名、完整设备标识或原始浏览记录。

## 11. 日志、审计与节点监控

- [Log, Audit, Metric, And Node Observability Pipeline Contract](../contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md)

Admin 必须通过 Backend API 查看日志、审计和节点监控摘要，不得从浏览器直接访问 NodeAgent、Job Service 或 Prometheus。

Required follow-up:

- `TASK-ADMIN-LOGS-METRICS-001`

Required routes:

| Route | Purpose |
| --- | --- |
| `/admin/logs` | 全局 redacted logs 搜索：系统、NodeAgent、App/Sentry、支付订单、通知投递、Job、安全 |
| `/admin/audit-logs` | 登录/操作/任务/支付/通知 provider 等审计日志 |
| `/admin/nodes/{node_id}` | 节点详情中的 latest logs 和 metric summary |

Node List 应提供某个 node 的最新日志入口，支持按 `singbox`、`geoip`、`release`、`config`、`protocol`、`health` 过滤组件日志。所有 metadata 必须经过 redaction 后展示。

App 异常必须以 Sentry issue summary 形式展示，不直接展示原始 stack/context。支付订单日志应以 timeline 展示 provider/webhook/reconciliation/refund/manual adjustment。推送/通知日志应展示 Telegram、WhatsApp、Lark、email、push 的 invite/dispatch/callback/retry/dead-letter 状态，并始终 mask contact identifier。

Required follow-up:

- `TASK-ADMIN-OBSERVABILITY-DETAILS-001`

## 12. 用户联系方式与通知偏好

- [User Contact & Notification Preference Contract](../contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md)

Admin 用户详情页必须扩展为运营可用的用户联系中心，而不是只展示基础资料。Telegram、WhatsApp、Lark 等 IM 信息要展示为 Contact Channels，通知开关要展示为 Notification Preferences，机器人邀请和测试消息必须通过 Backend 创建 Job Service run。

Admin 还必须在 System Settings / Notification Settings 中提供 Provider 配置页：默认 Telegram Bot、WhatsApp provider、Lark Bot/App、Email Provider、Push future placeholder。用户详情页只能发起 invite 或查看绑定状态，不能直接保存 bot token/provider secret。

Required follow-up:

- `TASK-ADMIN-USER-CONTACT-001`

Required user detail sections:

| Section | Purpose |
| --- | --- |
| Profile | 基础资料、locale、timezone、account status |
| Contact Channels | Telegram / WhatsApp / Lark / email / push 联系方式、状态、来源、验证时间 |
| Notification Preferences | 活动、公告、账单、安全、连接异常、节点事件、协议变更、GeoIP、Job 结果通知偏好 |
| Bot Invites | 发送绑定邀请、查看 pending invites、取消邀请 |
| Delivery Logs | 最近通知投递记录、失败原因、Job Run 链接 |

Required settings sections:

| Section | Purpose |
| --- | --- |
| Telegram Bot | bot username、webhook URL、secret hint、verify status、enable/disable |
| WhatsApp Provider | business account、phone number id、webhook verify status、rate limit |
| Lark Bot/App | app id、tenant allowlist、callback URL、verify status |
| Report Templates | 系统报告、运营报告、运维报告、赞助大使报告、推广大使报告等默认模板 |

## 13. 系统设置与定时任务管理

- [Admin System Settings Contract](../contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md)
- [Admin Job Center / Scheduler Contract](../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)

Admin 后台必须把系统级配置收敛到 `/admin/settings`，把可运行、可重试、可定时的动作收敛到 `/admin/jobs`。不要在 GeoIP、用户详情、账单、通知、内容页面各自复制一套定时器或 secret 表单。

Required `/admin/settings` sections:

| Section | Purpose |
| --- | --- |
| GeoIP | source credential status、credential encryption key status、manifest signing status、verify/rotate/update job links |
| Notifications | Telegram、WhatsApp、Lark、Email、Push provider 配置、verify status、rate limit、secret hint |
| Reports | 系统报告、运营报告、运维报告、账单对账、赞助大使、推广大使、安全日报模板 |
| Subscriptions | plan defaults、entitlement policy、grace period、renewal reminders、reconciliation defaults |
| Payments | provider safe metadata、webhook status、verify/reconciliation job links |
| App Releases | S3/OSS/COS/GCS/local artifact storage、signing key status、CDN/download policy |
| App Runtime | 多端性能/资源治理、iOS/Android/Desktop/Web platform overrides、preview/publish/rollback |
| Observability | App Sentry public client config、sampling policy、webhook/sync secret hint |
| Scheduler | global defaults、queue safety limits、timezone defaults、misfire policy defaults |

Required `/admin/jobs/schedules` behavior:

- 支持 create、edit、clone、preview、run now、enable、disable、delete。
- Schedule editor 必须由 Backend 返回的 `parameter_schema` 驱动，不要在前端硬编码字段。
- 支持 `notification_report_dispatch`、`notification_dispatch_campaign`、`notification_retry_failed` 等推送/简报类定时任务。
- Edit schedule 必须显示版本变化、下一次执行时间、last run、target preview 和 redacted parameters。
- Delete schedule 只停止未来执行，不删除历史 run/events。
- Secret 输入只允许出现在 `/admin/settings` 对应 section，并且永远不回填；Schedule 表单不得出现 token、api_key、license_key、hmac_secret、private_key。
- 所有异步 verify/run/schedule 操作必须显示 `run_id` 或链接 `/admin/jobs/runs/{run_id}`。
- 中文为默认语言，英文 fallback；按钮、空状态、错误提示都必须走 Admin i18n layer。

Required follow-up:

- `TASK-ADMIN-SYSTEM-SETTINGS-001`
- `TASK-ADMIN-APP-RUNTIME-GOVERNANCE-001`
- `TASK-ADMIN-SENTRY-SETTINGS-001`
- `TASK-ADMIN-JOBS-SCHEDULE-CRUD-001`

## 14. App 版本发布

- [App Release Distribution Contract](../contracts/app/APP_RELEASE_DISTRIBUTION_CONTRACT.md)

Admin 必须提供 App 版本发布控制，用于管理 App 版本，而不是把 App 下载链接写死在 Website 或配置中心。信息架构上 App Release 可以和 NodeAgent Release 放在同一个 **Release Control / 发布控制** 菜单页面或菜单组中，推荐入口为 `/admin/releases`，并保留深链接 `/admin/app/releases` 和 `/admin/nodeagent/releases`。

NodeAgent release 和 App release 是两个不同功能：NodeAgent release 管节点运行时，App release 管用户客户端安装包。它们可以共用一个发布控制入口，但必须使用不同的 tab/section、权限、API、数据模型和审计事件，禁止把 App 安装包发布逻辑混入 NodeAgent binary rollout。

Required UI:

| Section | Purpose |
| --- | --- |
| Release Control overview | App release 与 NodeAgent release 的状态总览、最近发布、失败事件、待处理动作 |
| NodeAgent releases tab | 节点二进制版本、rollout、rollback、升级事件 |
| App releases tab | 用户客户端版本、artifact matrix、下载渠道、adoption |
| Release list | version、build number、channel、status、platform coverage、rollout percentage |
| Release detail | artifact matrix、release notes、publish/pause/resume/revoke/rollback、events |
| Artifact matrix | Android/iOS/macOS/Windows/Linux、arch、size、sha256、signature、signing/notarization status |
| Adoption | active versions、downloads、failed installs、force-update users |
| Storage settings link | 跳转 `/admin/settings/app-releases` 配置 S3/OSS/COS/GCS/local storage |

Rules:

- Admin 不展示 raw storage key、local path、access key、secret key、private signing key 或 signed URL query。
- Admin 直接上传如果实现，必须通过 Backend 预签名上传 URL 或 Backend proxy，并有 size/type 限制。
- 推荐 MVP 先由 CI/CD build/sign/upload/register，Admin 只负责发布、暂停、撤回、观察。
- Release notes 使用 Content System 的 `release_note` 类型。
- 发布、暂停、撤回、回滚都需要确认、审计和 redacted event timeline。
- App Release 权限使用 `app_release:*`；NodeAgent Release 继续使用 NodeAgent/Node 相关权限。Release Control overview 只展示当前用户有权限看到的 tab/card。

Required follow-up:

- `TASK-ADMIN-APP-RELEASE-001` — completed on branch
  `task/TASK-ADMIN-APP-RELEASE-001`, commit `5729c2a`.
- `TASK-ADMIN-RELEASE-CONTROL-IA-001` — completed on branch
  `task/TASK-ADMIN-RELEASE-CONTROL-IA-001`, commit `fea9f48`.
- Backend App Release APIs and CI/CD release-control smoke remain follow-ups
  before the publish flow can be treated as end-to-end verified.

User contact Admin UI requirements:

- 新功能收敛在 `/admin/users/{user_id}`，不要新增顶层菜单。
- 表格默认显示 masked identifier。
- `Send Bot Invite`、`Send Test Message` 必须显示 `run_id` 或跳转 `/admin/jobs/runs/{run_id}`。
- Contact status 必须展示 `provider_follow_required` / `callback_pending` 等状态，避免运营误以为已可推送。
- Provider secret 输入框永远为空，不回填；列表/详情只展示 `secret_hint`。
- Report Templates 的 `Run Now` 必须走 Job Service 并显示 `run_id`。
- Marketing disabled、unverified channel、quiet hours 等 skip 原因必须可见。
- 所有按钮按 `user:*` 和 `notifications:*` RBAC 控制，但 Backend 仍是安全边界。
