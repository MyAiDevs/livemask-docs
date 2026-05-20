# Backend 文档入口

## 1. 职责范围

`livemask-backend` 负责 API、认证授权、业务状态机、配置下发、支付回调、审计和后台任务。

## 2. 修改 Backend 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响 App 请求、错误处理、本地缓存或 UI 反馈
- [ ] 是否影响 NodeAgent 配置拉取、任务执行、状态上报或降级模式
- [ ] 是否影响数据库字段、索引、约束、迁移或审计
- [ ] 是否影响支付、风控、权限或运营配置

## 3. 必须更新文档的场景

- API 字段、错误码、状态机变化
- Swagger/OpenAPI 文档必须同步所有 Backend API 的新增、修改和删除
- 配置结构、默认值、热更新策略变化
- 支付回调、订单状态、退款、风控变化
- 数据库迁移或审计字段变化
- 后台任务、补偿任务、重试策略变化

## 4. 完成标准

- [ ] 接口契约有说明
- [ ] Backend API 和 Swagger/OpenAPI 完全对齐；新增、修改、删除 API 已同步 OpenAPI
- [ ] route/API drift 校验通过；未同步 OpenAPI 的 Backend API 变更不得完成
- [ ] Swagger UI 只能在登录后的 `livemask-admin` 中查看；Backend 不暴露公开未登录 UI
- [ ] 兼容策略有说明
- [ ] 回滚策略有说明
- [ ] App / NodeAgent 影响已检查
- [ ] 验证结果写入 PR 或任务记录

## 5. 实现输入

- `docs/backend/LIVEMASK_BACKEND_IMPLEMENTATION_BRIEF.md`

## 5.1 Swagger / OpenAPI 强制对齐

- `TASK-BACKEND-SWAGGER-API-DOCS-001` 建立 Backend OpenAPI 3 / Swagger 契约。
- Backend 的所有 API 路由、request/response schema、错误码、auth/RBAC、分页/查询参数、
  状态机字段和敏感字段 redaction 规则都必须和 OpenAPI 文档一致。
- 后续任何 Backend API 新增、修改、删除，必须在同一个 TASK 中同步 OpenAPI；否则任务
  状态只能是 `partial` / `evidence_missing`，不能标记为 `completed`。
- Backend 应提供机器可读 OpenAPI JSON 给 Admin/CI 使用，但不得公开未登录 Swagger UI。
- Swagger UI 的 human-facing 入口必须在 `livemask-admin` 内，且必须要求 Admin 登录。
- 完成报告必须包含：
  - OpenAPI validation 结果；
  - route/API drift check 结果；
  - 证明 Backend 没有公开未登录 Swagger UI；
  - 证明 `livemask-admin` 登录后可以查看 Swagger UI。

该文档用于后端 AI 辅助开发，包含 MVP 模块边界、API / DB / Redis / 状态机 / 幂等 / 错误模型 / 测试矩阵和可直接使用的 AI 实现 Prompt。

## 6. 控制平面与 Job Gateway

- [App / NodeAgent / Job Service / Backend / Admin Closed Loop Architecture](../architecture/control-plane/APP_NODEAGENT_JOB_BACKEND_ADMIN_CLOSED_LOOP.md)
- [Admin Job Center / Scheduler Contract](../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)
- [Job Queue Usage Matrix](../contracts/jobs/JOB_QUEUE_USAGE_MATRIX.md)

Backend 在未来控制平面中是 Admin API Gateway 和 domain authority，不是长任务执行器。涉及 Admin 触发的发布、回滚、GeoIP、内容、Dashboard、计费、NodeAgent 操作时，Backend 必须负责 Admin JWT/RBAC、owner-domain permission、audit attribution、domain validation 和 service auth 转发；长任务执行、queue、worker、retry/backoff、lease 和 per-target lock 由独立 `livemask-job-service` 负责。

任何 Backend 新增 Admin action、cron、批处理、外部 vendor 调用、NodeAgent fan-out、Dashboard 聚合、账单对账、内容定时发布、GeoIP 下载、CI smoke 触发或需要 retry/backoff 的工作前，必须先对照 Job Queue Usage Matrix。命中 `queue_required` 的场景不得在 HTTP handler 内同步执行，必须通过 Backend Job Gateway 创建 Job Service run，并返回 `202 + run_id`。

## 7. 协议端点模板与重连提示

- [Protocol & Endpoint Template Contract](../contracts/protocol-endpoint/PROTOCOL_ENDPOINT_TEMPLATE_CONTRACT.md) — Protocol 模板版本化、节点选择策略、Job Service 灰度规则、NodeAgent assignment API、Backend connect_config 协同和回滚策略。
- [Client Reconnect Hint Contract](../contracts/realtime/CLIENT_RECONNECT_HINT_CONTRACT.md) — Backend 在协议端点变更时生成重连提示，通过 realtime 通道推送给 App，App 优雅重连并拉取最新 connect_config。
- [Protocol Endpoint Stability Gate](../development/tasks/TASK-DOC-PROTOCOL-STABILITY-GATE-001-protocol-endpoint-stability-gate.md) — Backend 必须作为协议端点状态、Admin Node Detail 真数据、App reconnect hint 和 connect_config eligibility 的唯一权威。

Backend 必须拒绝 NodeAgent 直接通知 App 的设计。NodeAgent 只上报
`endpoint_ready` / `endpoint_not_ready` / `failed` 等事件；Backend 接收事件后更新
`connect_node_endpoints`，基于 template version、NodeAgent capability、App client
support 和 session 状态生成幂等 reconnect hint。Backend 同时必须提供 Node Detail
所需的真 API：heartbeats、logs、metrics summary、protocol capabilities、protocol
endpoints、assignments、events，供 Admin 替换所有 demo data。

相关后续任务：`TASK-BACKEND-PROTOCOL-STABILITY-001`

## 8. I18N / 中文本地化

- [I18N Localization Contract](../contracts/i18n/I18N_LOCALIZATION_CONTRACT.md)

Backend 不应让 Admin/Website/App 依赖 raw English `message`。新增或修改 API 错误时必须提供稳定 `code` 和 `message_key`，并保证 `params` 不包含 secret。Content、Blog、公告、活动和 App banner 必须支持 `locale` 查询和 fallback。

Required follow-up:

- `TASK-BACKEND-I18N-001`

## 9. Control Plane Dashboard

- [Admin Control Plane Dashboard Contract](../contracts/admin/ADMIN_CONTROL_PLANE_DASHBOARD_CONTRACT.md) — Backend 必须实现 11 个 Dashboard API，提供真实聚合数据进行可视化。

Required Dashboard API endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/api/v1/dashboard/overview` | Global health and business status |
| GET | `/admin/api/v1/dashboard/control-plane` | Per-module control plane health |
| GET | `/admin/api/v1/dashboard/traffic/flows` | Traffic flow arcs for map rendering |
| GET | `/admin/api/v1/dashboard/traffic/countries` | Per-country traffic aggregates |
| GET | `/admin/api/v1/dashboard/jobs/summary` | Job Service health and job status |
| GET | `/admin/api/v1/dashboard/geoip/summary` | GeoIP database version and rollout |
| GET | `/admin/api/v1/dashboard/nodeagent/summary` | NodeAgent release and endpoint readiness |
| GET | `/admin/api/v1/dashboard/protocol-endpoint/summary` | Protocol template rollout status |
| GET | `/admin/api/v1/dashboard/content/summary` | Content feed lifecycle |
| GET | `/admin/api/v1/dashboard/reconnect/summary` | Client reconnect hint delivery health |
| GET | `/admin/api/v1/dashboard/incidents` | Active alerts and Sentry summary |

Data must be real-first. Production must never silently serve mock data.
Local/dev env mock fallback must show visible Mock/Stale badge.

相关后续任务：`TASK-BACKEND-DASHBOARD-001`

## 10. 日志、审计与指标

- [Log, Audit, Metric, And Node Observability Pipeline Contract](../contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md)

Backend 必须提供统一日志和审计入口，覆盖登录日志、操作日志、任务日志、系统日志、Node 日志、App Sentry 异常摘要、支付订单日志、通知投递日志和安全日志。NodeAgent 日志通过 Backend HMAC API 接收，Backend 验证 node 身份并投递到 Job Service 队列异步入库，不得在 HTTP request path 中同步写入大批量日志。App 原始异常不进入 Backend；Backend 只接收 Sentry webhook/sync 后的 redacted issue summary。

Backend 还必须提供 App Sentry 运行时配置 API。Sentry 配置来源于
System Settings，但 App-facing response 只能包含 public client DSN、环境、
release、采样率和低基数 tag allowlist。Sentry auth token、project/org
token、relay secret、webhook secret、private key、Authorization header 等
服务端密钥只允许存储为 write-only secret 或 secret reference，绝不能返回
给 App 或 Admin 明文。

Required follow-up:

- `TASK-BACKEND-OBSERVABILITY-LOGS-001`
- `TASK-BACKEND-SENTRY-SUMMARY-001`
- `TASK-BACKEND-PAYMENT-LOGS-001`
- `TASK-BACKEND-NOTIFICATION-LOGS-001`

Required APIs:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/internal/agent/logs` | NodeAgent HMAC log batch ingestion |
| GET | `/admin/api/v1/logs` | Redacted global log search |
| GET | `/admin/api/v1/nodes/{node_id}/logs` | Latest logs for one node |
| GET | `/admin/api/v1/audit-logs` | Audit log search |
| GET | `/admin/api/v1/logs/ingestion/health` | Log ingestion backlog/dead-letter health |
| GET | `/admin/api/v1/app/exceptions` | Redacted Sentry issue summaries |
| GET | `/api/v1/app/observability/config` | Safe App Sentry client config |
| GET | `/admin/api/v1/payments/orders/{order_id}/logs` | Payment order timeline |
| GET | `/admin/api/v1/notifications/delivery-logs` | Notification delivery logs |
| GET | `/admin/api/v1/system/logs` | System component logs |
| GET | `/metrics` | Prometheus-compatible Backend metrics |

## 11. 用户联系方式与通知偏好

- [User Contact & Notification Preference Contract](../contracts/users/USER_CONTACT_NOTIFICATION_CONTRACT.md)
- [User Growth, Payout, Ambassador Revenue Contract](../contracts/users/USER_GROWTH_REVENUE_CONTRACT.md)

Backend 必须把用户 IM 联系方式和通知偏好作为独立能力实现，不得在 `users` 表上继续追加随机字段。Telegram、WhatsApp、Lark 等渠道必须进入 `user_contact_channels`，通知订阅必须进入 `user_notification_preferences`，机器人邀请必须创建 `im_binding_invites` 并通过 Job Service 异步投递。

Telegram、WhatsApp、Lark 不能只保存用户 ID 后直接推送。Backend 还必须提供 Notification Provider System Settings：默认 Telegram Bot、WhatsApp provider、Lark app/bot、Email provider、Push provider future placeholder。用户必须先关注/启动/安装官方 Bot 或完成 provider callback/OTP 验证，contact channel 才能进入 `verified` 并允许正式投递。

Required follow-up:

- `TASK-BACKEND-USER-CONTACT-001`

Required Admin APIs:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/admin/api/v1/users/{user_id}/contacts` | User contact summary |
| POST | `/admin/api/v1/users/{user_id}/contacts` | Add contact channel |
| PATCH | `/admin/api/v1/users/{user_id}/contacts/{contact_id}` | Update contact |
| POST | `/admin/api/v1/users/{user_id}/contacts/{contact_id}/verify` | Verify contact |
| POST | `/admin/api/v1/users/{user_id}/contacts/{contact_id}/disable` | Disable contact |
| DELETE | `/admin/api/v1/users/{user_id}/contacts/{contact_id}` | Soft-delete contact |
| GET | `/admin/api/v1/users/{user_id}/notification-preferences` | Read notification preferences |
| PUT | `/admin/api/v1/users/{user_id}/notification-preferences` | Save notification preferences |
| POST | `/admin/api/v1/users/{user_id}/im-invites` | Create bot invite and queue notification job |
| GET | `/admin/api/v1/users/{user_id}/im-invites` | List invites |
| POST | `/admin/api/v1/users/{user_id}/im-invites/{invite_id}/cancel` | Cancel invite |
| GET | `/admin/api/v1/notification-providers` | List provider bot/app configs with masked secret hints |
| GET | `/admin/api/v1/notification-providers/{provider}` | Provider config detail |
| PUT | `/admin/api/v1/notification-providers/{provider}` | Update provider config |
| POST | `/admin/api/v1/notification-providers/{provider}/verify` | Queue provider verification job |
| POST | `/admin/api/v1/notification-providers/{provider}/enable` | Enable provider |
| POST | `/admin/api/v1/notification-providers/{provider}/disable` | Disable provider |
| POST | `/api/v1/webhooks/notifications/{provider}` | Provider callback ingress with signature verification |
| GET | `/admin/api/v1/notification-report-templates` | List default report templates |
| POST | `/admin/api/v1/notification-report-templates/{template_key}/run` | Queue scheduled/ad hoc report dispatch |

Security requirements:

- Contact identifiers are PII and must be masked in list responses.
- Full identifiers require explicit `user:contact:read_sensitive`.
- All mutations require audit reason.
- Bot invite and notification dispatch must return `202 + run_id` and must not send synchronously from request handlers.
- Provider secrets and callback secrets must never be returned; only `secret_hint` is allowed.
- Invalid provider callbacks must not mutate contacts.

Required default report templates:

- `system_daily_report`
- `operations_daily_report`
- `sre_daily_report`
- `sponsor_daily_report`
- `ambassador_daily_report`
- `billing_daily_report`
- `security_daily_report`
- `job_daily_report`

## 12. 系统设置与 Scheduler CRUD

- [Admin System Settings Contract](../contracts/admin/ADMIN_SYSTEM_SETTINGS_CONTRACT.md)
- [Admin Job Center / Scheduler Contract](../contracts/jobs/ADMIN_JOB_SCHEDULER_CONTRACT.md)

Backend 必须作为 Admin System Settings 和 Job Scheduler 的唯一 Admin API Gateway。Admin 不直接访问 Job Service，不直接保存 raw secret，不直接写领域表。

Required Backend APIs:

| API Area | Required Routes |
| --- | --- |
| System settings | `GET /admin/api/v1/system-settings`, `GET/PUT /admin/api/v1/system-settings/{section}`, `POST /verify`, `POST /rotate` |
| Report templates | `GET /admin/api/v1/report-templates`, `GET/PUT /{template_key}`, `POST /preview`, `POST /run` |
| Subscription settings | `GET/PUT /admin/api/v1/subscription-settings`, dry-run/apply/backfill hooks |
| App runtime governance | `GET /api/v1/app/runtime-config`, `POST /admin/api/v1/system-settings/app-runtime/preview`, `publish`, `rollback` |
| Schedule CRUD gateway | `GET/POST /admin/api/v1/jobs/schedules`, `GET/PUT/DELETE /admin/api/v1/jobs/schedules/{schedule_id}`, `preview`, `run`, `clone`, `enable`, `disable` |

Required Backend rules:

- Enforce Admin JWT audience and `settings:*`, `jobs:*`, owner-domain permissions.
- Add `settings:read`, `settings:write`, `settings:verify`, `notifications:read`, `notifications:write`, `notifications:execute` to RBAC.
- Aggregate safe setting summaries from domain modules; never return raw `bot_token`, `api_key`, `license_key`, `hmac_secret`, private key, node secret, webhook secret, or signed URL query strings.
- Treat empty secret input as "keep existing secret" unless `clear_secret=true`.
- Write audit logs for every settings mutation, provider verification, credential rotate, template edit, subscription config change, and schedule CRUD action.
- Create Job Service runs for verify/rotate/report dispatch/subscription backfill; return `202 + run_id` for async work.
- App runtime governance must be versioned, hash-validated, rollbackable and
  secret-free. It controls performance/resource/reconnect behavior only; it
  must not contain node secrets, connect credentials, Sentry server tokens,
  payment credentials or IM contact identifiers.
- Schedule CRUD must be delegated to Job Service through internal service auth, with Backend preserving actor/audit context.

Required follow-up:

- `TASK-BACKEND-SYSTEM-SETTINGS-001`
- `TASK-BACKEND-APP-RUNTIME-GOVERNANCE-001`
- `TASK-BACKEND-JOBS-SCHEDULE-CRUD-001`
- `TASK-BACKEND-SUBSCRIPTION-SETTINGS-001`

## 13. App 版本发布与 Artifact Storage

- [App Release Distribution Contract](../contracts/app/APP_RELEASE_DISTRIBUTION_CONTRACT.md)

Backend 必须提供 App release metadata、artifact storage abstraction、Admin publish APIs、public update-check/download APIs。S3/OSS/COS/GCS/local server storage 都通过 Backend adapter 管理，App 和 Website 不直接接触存储凭证。

Required Backend APIs:

| API Area | Required Routes |
| --- | --- |
| Admin releases | `GET/POST /admin/api/v1/app/releases`, `GET/PUT/DELETE /admin/api/v1/app/releases/{release_id}` |
| Admin actions | `POST /publish`, `pause`, `resume`, `revoke`, `rollback`, `artifacts` |
| Admin observability | `GET /events`, `GET /adoption` |
| Storage settings | `GET/PUT /admin/api/v1/app-release-storage`, `POST /verify` |
| Public/App | `GET /api/v1/app/releases/check`, `GET /api/v1/app/releases/artifacts/{artifact_id}/download`, `POST /api/v1/app/releases/events` |

Required Backend rules:

- Add `app_release:read`, `app_release:write`, `app_release:upload` permissions.
- Store release metadata and artifact metadata in PostgreSQL.
- Support storage adapters: S3-compatible, Alibaba OSS, Tencent COS, Google Cloud Storage, local server storage.
- Generate deterministic object keys server-side; reject arbitrary external URLs and path traversal.
- Require sha256, size, platform, arch, artifact type, and signature/notarization metadata before publish.
- Public update-check returns compatible release metadata only and never exposes raw storage keys or signed query strings in logs/audit.
- Publish/pause/revoke/rollback writes audit logs and may create Job Service runs.

Required follow-up:

- `TASK-BACKEND-APP-RELEASE-001`
- `TASK-BACKEND-APP-RELEASE-STORAGE-001`
