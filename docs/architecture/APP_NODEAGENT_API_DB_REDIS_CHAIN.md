# App Client -> NodeAgent -> API -> Database / Redis End-to-End Chain

> 本文用假设推理审计 App Client、NodeAgent、Backend API、PostgreSQL、Redis 之间的完整闭环。目标不是证明“正常路径能跑通”，而是证明失败、乱序、旧版本、缓存不一致时仍有可恢复路径。

## 1. 链路边界

### 正向链路

```text
App Client
  -> Backend API: 请求推荐节点 / 拉取配置 / 上报连接结果
  -> Redis: 读取实时节点状态、限流、缓存、Pub/Sub
  -> PostgreSQL: 读取用户、套餐、节点、配置、历史质量数据
  -> Backend API: 返回节点、配置版本、错误码
  -> App Client: 应用配置、连接节点、展示状态
  -> NodeAgent: 承载 sing-box 节点流量、执行节点侧配置
  -> Backend API: 心跳、质量、流量、degraded 状态上报
  -> PostgreSQL / Redis: 持久化历史、更新实时状态
```

### 反向反馈链路

```text
NodeAgent degraded / traffic / quality report
  -> Backend API validation
  -> PostgreSQL audit and history
  -> Redis realtime state and Pub/Sub
  -> WebSocket / Admin / Recommendation Engine
  -> App receives new recommendation or visible status
```

## 2. 事实源规则

| 数据类型 | Source of Truth | Redis 用途 | App / NodeAgent 本地用途 | 失效策略 |
| --- | --- | --- | --- | --- |
| 用户、套餐、权益 | PostgreSQL | 短期缓存、限流辅助 | App 本地只缓存展示，不作最终判断 | API 以 DB 为准，缓存 TTL 到期或主动失效 |
| 节点基础信息 | PostgreSQL | 热点节点列表、推荐特征 | App 本地缓存最近推荐 | 节点状态变化必须失效推荐缓存 |
| 节点实时状态 | Redis + PostgreSQL 最近上报 | 实时推荐、WebSocket、Admin 大盘 | App 仅展示最近状态 | Redis 丢失时从 DB 最近心跳降级恢复 |
| 配置版本 | PostgreSQL `system_configs` | Pub/Sub 通知、热点配置缓存 | App / NodeAgent 保留上一个可用版本 | hash/version 不一致时回滚到 last-known-good |
| 流量与质量历史 | PostgreSQL | 实时聚合窗口 | NodeAgent 本地暂存未上报批次 | 重复上报必须幂等去重 |
| 任务队列 / 通知 | Redis Streams / Queue | 队列、重试、延迟任务 | 无 | Consumer 幂等，失败进入 DLQ 或补偿任务 |

## 3. 主链路假设审计

### H1：App 请求推荐节点，但 Redis 中节点状态是旧值

**风险**：App 被推荐到已 degraded 或已下线节点。

**必须闭环**：

- Backend 推荐算法必须同时读取 Redis 实时状态和 PostgreSQL 节点状态。
- Redis 状态超过 TTL 时视为 stale，不得作为健康节点推荐。
- App 连接失败必须 fallback 到次优节点，并上报失败原因。
- Backend 收到 App 失败上报后，短期降低该节点推荐权重。

**验收证据**：

- stale Redis 状态测试
- App fallback 测试
- 推荐权重下降日志或指标

### H2：App 使用旧配置或旧错误码

**风险**：App 无法解析新字段，或错误码展示错误。

**必须闭环**：

- API response 必须带 `config_version` / `schema_version`。
- App 必须忽略未知字段，并对未知错误码使用通用可恢复提示。
- Breaking change 必须有迁移期和最低版本门槛。
- Product / Support 必须知道用户可见提示。

**验收证据**：

- 旧 App 版本兼容测试
- 未知字段解析测试
- 未知错误码展示测试

### H3：NodeAgent 上报成功，但 API 写 DB 成功、写 Redis 失败

**风险**：历史数据正确，但实时推荐和 Admin 大盘不可见。

**必须闭环**：

- PostgreSQL 是上报历史和审计事实源。
- Redis 写入失败不得回滚已成功写入的历史数据。
- API 必须记录 Redis 写失败日志和指标。
- 后台补偿任务从 PostgreSQL 最近上报重建 Redis 实时状态。
- Ops 告警必须覆盖 Redis 写失败率。

**验收证据**：

- 模拟 Redis 写失败测试
- 补偿重建 Redis 测试
- 告警样例

### H4：API 写 Redis 成功，但 DB 事务失败

**风险**：Redis 展示了不存在或未审计的状态。

**必须闭环**：

- 对需要审计的状态，必须先 DB commit，再写 Redis。
- 如果 Redis 先写不可避免，必须使用 pending 状态和短 TTL。
- DB 失败后必须删除或过期 Redis pending key。
- Admin / Recommendation 不得把 pending 当作 confirmed。

**验收证据**：

- DB 失败时 Redis key 清理测试
- pending 状态不会被推荐测试

### H5：NodeAgent 离线后批量补报，事件重复或乱序

**风险**：流量、质量、收益或告警被重复计算。

**必须闭环**：

- NodeAgent 每批上报必须带 `report_id`、`node_id`、`period_start`、`period_end`、`sequence`。
- Backend 以唯一键或幂等表防重复。
- 乱序上报只影响聚合窗口，不得覆盖较新的实时状态。
- 收益/积分计算只读取已归档且幂等聚合后的数据。

**验收证据**：

- 重复 report_id 测试
- 乱序 sequence 测试
- 聚合重跑测试

### H6：配置热更新通知丢失

**风险**：Backend 已更新配置，但 NodeAgent 或 App 仍运行旧配置。

**必须闭环**：

- Redis Pub/Sub 只作为通知，不作为唯一事实源。
- App / NodeAgent 必须定期轮询或在心跳中比对 `config_version`。
- Backend 可根据上报版本识别未同步节点。
- Admin 必须能看到配置生效率。

**验收证据**：

- Pub/Sub 丢失测试
- 心跳版本比对测试
- 配置生效率 Dashboard 或日志

### H7：Backend API 短暂不可用

**风险**：App 无法连接，NodeAgent 无法上报或拉配置。

**必须闭环**：

- App 使用本地 last-known-good 推荐和配置，但必须标记为可能过期。
- NodeAgent 继续使用 last-known-good 配置，并本地缓存上报批次。
- API 恢复后，NodeAgent 批量补报，Backend 幂等处理。
- Ops 告警 API 可用性，Product / Support 有用户说明。

**验收证据**：

- API 断开期间 App fallback 测试
- NodeAgent 本地缓存补报测试
- API 恢复后幂等入库测试

### H8：Health API / CI Smoke 不可用，阻塞下一阶段开发判断

**风险**：在 Health API 未就绪或 staging smoke 不可靠的情况下，后续业务 TASK（配置中心、支付、推荐）无法验证 App → Backend API → DB/Redis → CI/CD → Lark 的完整链路。开发者在假性闭环中实现业务逻辑，上线后发现基础设施级问题。

**必须闭环**：

- `GET /api/v1/health` 必须在第一个业务 API 之前实现并部署，作为基础设施就绪的信号。
- staging smoke 必须从占位 nginx 升级为真实 backend + postgres + redis，并调用 Health API。
- 每个 CI 运行必须包含 notify-lark job，确保失败时可观测。
- `livemask-docs` 契约变更必须通过 `repository_dispatch` 通知子仓库，子仓库 CI 自动触发。
- 在 Health API CI/smoke 未全部通过之前，不得进入 P0-03（配置中心）的实现阶段。

**验收证据**：

- Health API 返回正确状态（ok / degraded / down）
- Backend CI + staging smoke 全绿
- Lark 收到 CI 通知
- Dispatch 触发子仓库 CI
- 对应 TASK 文档标记为 blocked until INFRA-001 pass

### H9：Connect Config 泄露节点长期密钥

**风险**：connect_config 在 Backend → App 链路上包含 `node_secret` / `node_secret_hash` / HMAC key，导致节点长期身份泄露。

**必须闭环**：

- connect_config 只能包含 session-bound 临时凭据，不得包含节点长期密钥。
- App 持有的凭证必须与 `node_secret` 无关，`node_secret` 只存在于 NodeAgent 和 Backend。
- `credentials` 字段必须绑定 session_id，支持过期和吊销。
- 日志、Lark 通知、CI 输出不得打印 `credentials.*`、`tls.server_public_key`、`server.endpoint + server.port` 组合。
- 协议映射表必须在 connect-config 契约中明确说明哪些字段对应 sing-box 客户端配置。

**验收证据**：

- connect-config.md 不包含 `node_secret` / `node_secret_hash` / HMAC key
- credentials 是 session-bound UUID，非节点长期密钥
- Session 吊销测试（revoke → App 收到 `CONNECT_CONFIG_SESSION_REVOKED`）
- 日志审计无敏感字段
- Platform_hints 覆盖 iOS/macOS/Android/Windows/Linux

## 4. 必须存在的契约字段

### App -> API

| 字段 | 目的 |
| --- | --- |
| `client_version` | 判断兼容策略 |
| `schema_version` | 判断响应结构兼容 |
| `request_id` | 链路追踪与幂等 |
| `config_version` | 识别客户端配置滞后 |
| `last_known_node_id` | 辅助 fallback 与推荐反馈 |

### NodeAgent -> API

| 字段 | 目的 |
| --- | --- |
| `node_id` | 节点身份 |
| `agent_version` | 判断兼容策略 |
| `report_id` | 幂等去重 |
| `sequence` | 乱序处理 |
| `period_start` / `period_end` | 聚合窗口 |
| `config_version` / `config_hash` | 配置同步闭环 |
| `degraded` / `degraded_reason` | 降级闭环 |
| `singbox_healthy` | 节点执行层状态 |

### API -> App / NodeAgent

| 字段 | 目的 |
| --- | --- |
| `request_id` | 链路追踪 |
| `schema_version` | 响应兼容 |
| `config_version` / `config_hash` | 配置一致性 |
| `error_code` | 调用方行为 |
| `retry_after` | 防止重试风暴 |
| `fallback_action` | App / NodeAgent 下一步动作 |

## 5. DB / Redis 写入顺序原则

| 场景 | 推荐顺序 | 原因 |
| --- | --- | --- |
| 需要审计的业务状态 | DB transaction -> Redis invalidate/update -> event publish | DB 是事实源 |
| 实时心跳状态 | Redis update -> async DB append 或 DB append -> Redis update，按业务重要性选择 | 实时性优先，但必须可从 DB 恢复 |
| 配置变更 | DB commit -> Redis cache update -> Pub/Sub notify | 避免通知先于事实源 |
| 任务队列 | DB outbox -> Redis Stream / Worker | 避免 DB 成功但事件丢失 |
| 推荐缓存 | DB/Redis read -> compute -> Redis cache with TTL | 缓存可丢失，不可作为事实源 |

## 6. 最小测试矩阵

| 测试 | App | NodeAgent | API | PostgreSQL | Redis | 预期 |
| --- | --- | --- | --- | --- | --- | --- |
| 正常推荐连接 | 请求推荐并连接 | 健康上报 | 推荐并接收反馈 | 写推荐日志 | 更新实时状态 | App 成功连接并上报 |
| Redis stale | fallback | 无 | 过滤 stale 节点 | 读取最近心跳 | 返回旧状态 | 不推荐 stale 节点 |
| DB 成功 Redis 失败 | 可展示延迟状态 | 上报成功 | 记录缓存失败 | 写入成功 | 写入失败 | 补偿任务可重建 |
| DB 失败 Redis 成功 | 不展示 confirmed | 无 | 清理 pending | 写入失败 | pending 短 TTL | 不污染推荐 |
| 重复上报 | 无 | 重发同 report_id | 幂等拒重 | 唯一约束 | 状态不重复 | 聚合不重复 |
| Pub/Sub 丢失 | 轮询发现新版本 | 心跳发现新版本 | 版本比对 | 配置为准 | 无通知 | 最终一致 |
| API 不可用 | 使用 last-known-good | 本地缓存批次 | 恢复后处理 | 幂等入库 | 重建状态 | 不丢数据 |
| Health API / CI smoke | 启动时调用 Health API | 无 | 返回连通状态 | PING 检测 | PING 检测 | 状态正确反映 DB/Redis 实际连通 |
| Connect Config 泄露 | 只接收 session 凭据 | N/A | 不下发 node_secret | 无 | 无 | credentials 不含节点长期密钥 |
| Connect Config 过期 | 重新请求 | 无 | 返回 `CONNECT_CONFIG_SESSION_EXPIRED` | 无 | 吊销 session | App 重新请求连接配置 |

## 7. 当前审计结论

| 项目 | 状态 | 说明 |
| --- | --- | --- |
| 正常路径描述 | 已有 | 架构文档已有推荐、上报、监控闭环描述 |
| 失败假设与兜底 | 本文补齐 | 覆盖 Redis stale、DB/Redis 部分失败、重复乱序、通知丢失、Health 不可用、Connect Config 密钥泄露 |
| 必需契约字段 | 本文补齐 | App、NodeAgent、API 响应字段已列出，connect-config 安全规则已定义 |
| DB / Redis 事实源规则 | 本文补齐 | 明确 PostgreSQL 与 Redis 的职责 |
| 自动化检查 | 已接入 | `scripts/check-e2e-chain.py` 检查本文和数据一致性契约 |

## 8. 后续 TASK

- `TASK-INFRA-001`：实现 Health API + CI smoke 闭环，验证链路的可运行性（前置条件）。
- `TASK-VPN-CONFIG-001`：定义真实 VPN connect_config 契约与安全模型。
- `TASK-DOC-006`：把本文中的字段补入真实 API / Config / Event contract 条目。
- `TASK-BE-CHAIN-001`：实现 DB outbox + Redis Stream 事件一致性方案。
- `TASK-NA-REPORT-001`：统一 NodeAgent `report_id`、`sequence`、补报幂等规则。
- `TASK-APP-FALLBACK-001`：定义 App last-known-good 推荐与配置提示文案。
