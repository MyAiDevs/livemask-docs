# Core MVP Event Contracts

## `config.published`

- Owner：Backend
- Producer：Config Service
- Consumer：NodeAgent, App polling layer, Admin, Ops
- Delivery：Redis Pub/Sub channel `pubsub:config.published` + DB version fallback
- Ordering：By `config_key` + `config_version`
- Idempotency key：`config_key` + `config_version`
- Retry policy：Consumers poll if Pub/Sub lost
- Dead letter policy：N/A

Payload:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `config_key` | string | 是 | 配置 key |
| `config_version` | int | 是 | 新版本 |
| `config_hash` | string | 是 | hash |
| `published_at` | string | 是 | 发布时间 |

## `node.status_reported`

- Owner：NodeAgent / Backend
- Producer：NodeAgent
- Consumer：Backend, Monitoring, Recommendation Engine
- Delivery：HTTP report + Redis realtime state
- Ordering：By `node_id` + `sequence`
- Idempotency key：`report_id`
- Retry policy：NodeAgent offline buffer retry
- Dead letter policy：Backend rejects invalid report and emits alert

Payload includes `node_id`, `report_id`, `sequence`, `period_start`, `period_end`, `degraded`, `singbox_healthy`, `metrics`.

## `node.quality_feedback_received`

- Owner：Backend
- Producer：App Client / Backend API
- Consumer：Recommendation Engine, Admin, Monitoring
- Delivery：DB + Redis short penalty
- Ordering：By `node_id` + `created_at`
- Idempotency key：`request_id`
- Retry policy：App retry with same request_id

## `payment.status_changed`

- Owner：Payment / Backend
- Producer：Payment Webhook Handler
- Consumer：Entitlement Service, Notification Worker, Admin, Audit
- Delivery：DB outbox -> Redis Stream / Worker
- Ordering：By `order_id` + provider status rank
- Idempotency key：provider + external_payment_id + status
- Retry policy：Outbox retry
- Dead letter policy：payment DLQ + P0 alert

Payload:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `order_id` | uuid | 是 | 系统订单 |
| `provider` | string | 是 | nowpayments |
| `external_payment_id` | string | 是 | 外部支付 ID |
| `old_status` | string | 否 | 旧状态 |
| `new_status` | string | 是 | 新状态 |
| `paid_amount` | number | 否 | 实付金额 |
| `occurred_at` | string | 是 | 发生时间 |

## `entitlement.granted`

- Owner：Backend
- Producer：Entitlement Service
- Consumer：App, Notification Worker, Admin, Audit
- Delivery：DB outbox -> Redis Stream / Worker
- Ordering：By `user_id` + `subscription_id`
- Idempotency key：`order_id` + `entitlement_type`
- Retry policy：Outbox retry
- Dead letter policy：entitlement DLQ + P0 alert
