# Data Consistency Contract

> 本契约定义 PostgreSQL、Redis、App 本地缓存、NodeAgent 本地缓存之间的一致性规则。

## 1. 基本原则

- PostgreSQL 是业务事实源和审计事实源。
- Redis 是实时状态、缓存、队列和 Pub/Sub 载体，不作为最终事实源。
- App / NodeAgent 本地缓存只能作为 last-known-good，不得覆盖服务端事实。
- 所有跨层写入必须有幂等键、版本号或可重建策略。

## 2. 一致性级别

| 数据 | 一致性级别 | 允许延迟 | 恢复方式 |
| --- | --- | --- | --- |
| 用户权益、支付、订阅 | Strong via DB transaction | 不允许业务意义上的脏读 | DB 校验 + 补偿任务 |
| 节点实时状态 | Eventual | 秒级到分钟级 | NodeAgent 心跳 + DB 最近上报重建 Redis |
| 配置版本 | Eventual with version guard | 秒级到分钟级 | App / NodeAgent 轮询或心跳比对 |
| 推荐结果 | Cache-assisted eventual | TTL 内可变化 | App fallback + 失败反馈 |
| 流量统计 | Batch eventual | 分钟级到日级 | 幂等聚合重跑 |
| 通知事件 | At-least-once | 取决于队列重试 | Consumer 幂等 + DLQ |

## 3. 写入模式

### 3.1 DB First

用于支付、权益、订阅、配置、审计。

```text
Validate -> DB transaction commit -> Redis invalidate/update -> publish event
```

失败处理：

- DB 失败：不得写 confirmed Redis 状态。
- Redis 失败：保留 DB 事实，记录告警，补偿重建 Redis。
- Event publish 失败：通过 outbox 或补偿任务重发。

### 3.2 Redis First with TTL

仅用于实时心跳、临时锁、限流、短期推荐状态。

```text
Validate -> Redis write with TTL -> async DB append or periodic aggregate
```

限制：

- 不得用于支付、权益、订阅等强一致业务状态。
- Redis key 必须有 TTL。
- 必须能从 NodeAgent 心跳或 DB 历史重建。

### 3.3 Outbox Pattern

用于 DB 事务后必须触发的事件。

```text
DB transaction:
  - write business state
  - write outbox event
Worker:
  - read outbox
  - publish Redis Stream / queue
  - mark delivered
```

## 4. 幂等键规则

| 来源 | 幂等键 | 适用场景 |
| --- | --- | --- |
| App request | `request_id` + `user_id` + action | 连接质量上报、快速反馈、支付创建 |
| NodeAgent report | `report_id` + `node_id` | 心跳、质量、流量、诊断结果 |
| Time window report | `node_id` + `period_start` + `period_end` | 流量聚合、质量聚合 |
| Payment webhook | provider + external_payment_id + status | 支付状态更新 |
| Config change | `config_key` + `config_version` | 配置发布和回滚 |

## 5. 版本规则

- 所有配置响应必须包含 `config_version` 和 `config_hash`。
- 所有跨端 schema 响应必须包含 `schema_version`。
- App / NodeAgent 上报必须带自身版本和当前配置版本。
- Backend 发现版本滞后时返回 `fallback_action` 或强制刷新指令。

## 6. 缓存失效规则

| 变更 | 必须失效或更新的 Redis key |
| --- | --- |
| 节点状态变化 | 推荐缓存、节点实时状态、Admin 大盘状态 |
| 配置变化 | 配置缓存、配置版本 key、Pub/Sub 通知 |
| 用户权益变化 | 用户权益缓存、订阅状态缓存 |
| 支付状态变化 | 订单缓存、用户权益缓存、通知事件 |
| 降级状态变化 | 节点实时状态、推荐缓存、告警状态 |

## 7. 可观测性要求

必须记录以下指标：

- `api_db_write_errors_total`
- `api_redis_write_errors_total`
- `redis_stale_state_filtered_total`
- `nodeagent_report_duplicate_total`
- `config_version_lagging_nodes`
- `app_fallback_to_last_known_good_total`
- `outbox_publish_retry_total`

## 8. 验收标准

- [ ] DB 成功 Redis 失败时，系统可补偿重建 Redis。
- [ ] DB 失败 Redis 不产生 confirmed 状态。
- [ ] 重复上报不会重复聚合或重复收益。
- [ ] Pub/Sub 丢失后，App / NodeAgent 最终能通过轮询或心跳获得新版本。
- [ ] App / NodeAgent 使用 last-known-good 时有明确可见状态或上报标记。
