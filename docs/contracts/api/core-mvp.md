# Core MVP API Contracts

> 本文登记 MVP 首批真实 API 契约。字段在实现前可细化，但删除、重命名、语义变更必须走 Breaking Change 流程。

## Config API

### GET `/api/v1/config/client`

- Caller：App Client
- Auth：User JWT
- Idempotency：N/A

Request query:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `client_version` | string | 是 | App 版本 |
| `platform` | string | 是 | ios / android / desktop |
| `config_version` | int | 否 | 当前本地配置版本 |

Response:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `schema_version` | string | 是 | 响应 schema 版本 |
| `config_version` | int | 是 | 配置版本 |
| `config_hash` | string | 是 | 配置 hash |
| `payload` | object | 是 | 配置内容 |
| `fallback_action` | string | 否 | `use_cached` / `force_refresh` / `upgrade_required` |

### GET `/internal/agent/config`

- Caller：NodeAgent
- Auth：Node signature / mTLS
- Idempotency：N/A

Request query:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `node_id` | uuid | 是 | 节点 ID |
| `agent_version` | string | 是 | NodeAgent 版本 |
| `config_version` | int | 否 | 当前配置版本 |

Response 同 `/api/v1/config/client`，但 `payload` 为 NodeAgent runtime config。

## Node Recommendation API

### POST `/api/v1/client/nodes/recommend`

- Caller：App Client
- Auth：User JWT
- Idempotency：`request_id`

Request:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request_id` | string | 是 | 幂等与追踪 |
| `client_version` | string | 是 | App 版本 |
| `platform` | string | 是 | 平台 |
| `country` | string | 否 | 用户国家 |
| `last_known_node_id` | uuid | 否 | 最近成功节点 |
| `config_version` | int | 否 | 当前配置版本 |

Response:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request_id` | string | 是 | 回传请求 ID |
| `schema_version` | string | 是 | 响应版本 |
| `recommended_nodes` | array | 是 | 候选节点，按优先级排序 |
| `ttl_seconds` | int | 是 | 推荐有效期 |
| `fallback_action` | string | 否 | `retry_later` / `use_cached` |

## Connection Quality API

### POST `/api/v1/client/vpn/report-connection-quality`

- Caller：App Client
- Auth：User JWT
- Idempotency：`request_id`

Request:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request_id` | string | 是 | 幂等键 |
| `node_id` | uuid | 是 | 节点 ID |
| `success` | bool | 是 | 是否成功 |
| `latency_ms` | int | 否 | 延迟 |
| `failure_reason` | string | 否 | 失败原因 |
| `protocol` | string | 否 | reality / hysteria2 |
| `client_version` | string | 是 | App 版本 |
| `created_at` | string | 是 | 客户端事件时间 |

Response:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accepted` | bool | 是 | 是否接收 |
| `duplicate` | bool | 是 | 是否重复上报 |

## Quick Feedback API

### POST `/api/v1/client/nodes/quick-feedback`

- Caller：App Client
- Auth：User JWT
- Idempotency：`request_id`

Request:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request_id` | string | 是 | 幂等键 |
| `node_id` | uuid | 是 | 节点 ID |
| `feedback_type` | string | 是 | slow / unstable / blocked / other |
| `description` | string | 否 | 用户补充 |

Response:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `appeal_id` | uuid | 否 | 自动创建的低优先级 appeal |
| `accepted` | bool | 是 | 是否接收 |

## NodeAgent Report API

### POST `/internal/agent/report`

- Caller：NodeAgent
- Auth：Node signature / mTLS
- Idempotency：`report_id`

Request:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `report_id` | string | 是 | 上报幂等键 |
| `node_id` | uuid | 是 | 节点 ID |
| `agent_version` | string | 是 | Agent 版本 |
| `sequence` | int | 是 | 单节点递增序列 |
| `period_start` | string | 是 | 统计窗口开始 |
| `period_end` | string | 是 | 统计窗口结束 |
| `config_version` | int | 是 | 当前配置版本 |
| `config_hash` | string | 是 | 当前配置 hash |
| `degraded` | bool | 是 | 是否降级 |
| `degraded_reason` | string | 否 | 降级原因 |
| `singbox_healthy` | bool | 是 | sing-box 状态 |
| `metrics` | object | 是 | 流量、连接数、延迟等 |

Response:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `accepted` | bool | 是 | 是否接收 |
| `duplicate` | bool | 是 | 是否重复 |
| `server_config_version` | int | 是 | Backend 当前配置版本 |
| `fallback_action` | string | 否 | `refresh_config` / `continue` |

## Payment API

### POST `/api/v1/payments/usdt/orders`

- Caller：App Client
- Auth：User JWT
- Idempotency：`request_id`

Request:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `request_id` | string | 是 | 幂等键 |
| `plan_id` | uuid | 是 | 套餐 ID |
| `pay_currency` | string | 是 | usdttrc20 / usdterc20 |

Response:

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `order_id` | uuid | 是 | 系统订单 |
| `external_payment_id` | string | 是 | NOWPayments payment id |
| `pay_address` | string | 是 | 支付地址 |
| `pay_amount` | number | 是 | 支付金额 |
| `payment_status` | string | 是 | waiting / confirming / finished / failed |

### POST `/api/v1/payments/nowpayments/webhook`

- Caller：NOWPayments
- Auth：HMAC signature
- Idempotency：provider + external_payment_id + status

Webhook payload 字段以 NOWPayments 原始字段为准，Backend 必须规范化为 `payment.status_changed` 事件。
