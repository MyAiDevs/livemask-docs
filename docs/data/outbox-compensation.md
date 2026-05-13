# Outbox And Compensation Plan

## 1. Outbox 表

推荐字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | uuid | outbox event id |
| `event_name` | string | 事件名 |
| `aggregate_type` | string | order / node / config |
| `aggregate_id` | string | 聚合根 ID |
| `idempotency_key` | string | 幂等键 |
| `payload` | jsonb | 事件内容 |
| `status` | string | pending / delivered / failed |
| `retry_count` | int | 重试次数 |
| `next_retry_at` | timestamptz | 下次重试 |
| `created_at` | timestamptz | 创建时间 |
| `delivered_at` | timestamptz | 发送时间 |

## 2. MVP Outbox 事件

- `payment.status_changed`
- `entitlement.granted`
- `config.published`
- `node.quality_feedback_received`

## 3. 补偿任务

| Task | 触发条件 | 动作 | 幂等键 |
| --- | --- | --- | --- |
| `rebuild_node_realtime_cache` | Redis 丢失或写失败 | 从 DB 最近心跳重建 Redis | `node_id` |
| `republish_config_event` | 配置 Pub/Sub 丢失 | 重发当前 config version | `config_key:version` |
| `retry_payment_entitlement` | 支付成功但权益未发 | 根据 order_id 补发权益 | `order_id:entitlement` |
| `recalculate_node_quality` | 重复/乱序上报修正 | 按时间窗口重算质量 | `node_id:date` |

## 4. 验收标准

- [ ] DB commit 后 outbox event 同事务写入。
- [ ] Worker 可重试且 Consumer 幂等。
- [ ] DLQ 有告警。
- [ ] 补偿任务可 dry-run。
