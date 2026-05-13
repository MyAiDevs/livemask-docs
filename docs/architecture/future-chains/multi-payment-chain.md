# Multi-Payment Chain

> 覆盖 USDT、Stripe、Google Play、Apple IAP、支付宝、微信支付的统一支付抽象、订阅恢复、对账和权益一致性。

## 1. 正向链路

```text
App selects product / platform
  -> Backend PaymentProvider creates order or verifies receipt
  -> Provider webhook / server notification
  -> Backend normalizes payment event
  -> Payment order / subscription state machine
  -> Entitlement granted via outbox
  -> App refreshes subscription
  -> Admin reconciliation and support tooling
```

## 2. Provider 分类

| Provider | 模式 | 关键风险 |
| --- | --- | --- |
| NOWPayments / BTCPay | Webhook + invoice | 重复/乱序 webhook、链上确认延迟 |
| Stripe | Checkout / Subscription webhook | invoice / subscription 状态复杂 |
| Google Play | Receipt / subscription verify | token 恢复、取消、退款同步 |
| Apple IAP | App Store Server API / notification | original_transaction_id、家庭共享、退款 |
| Alipay / WeChat | Provider callback | 签名、退款、对账 |

## 3. 统一状态

| 状态 | 含义 |
| --- | --- |
| `created` | 系统订单已创建 |
| `pending_provider` | 等待 provider 确认 |
| `paid` | 支付成功 |
| `active` | 订阅/权益已生效 |
| `past_due` | 续费失败宽限 |
| `cancelled` | 已取消 |
| `refunded` | 已退款 |
| `failed` | 支付失败 |

## 4. 必须契约

### API

- `POST /api/v1/payments/orders`
- `POST /api/v1/payments/receipts/verify`
- `POST /api/v1/payments/{provider}/webhook`
- `POST /api/v1/subscriptions/restore`
- `GET /api/v1/subscriptions/current`
- `POST /admin/payments/orders/{id}/manual-adjust`

### Events

- `payment.provider_event_received`
- `payment.status_changed`
- `subscription.status_changed`
- `entitlement.granted`
- `payment.reconciliation_mismatch`

### DB

- `payment_orders`
- `external_subscriptions`
- `subscription_events`
- `entitlements`
- `payment_exception_logs`

## 5. 假设审计

### H1：Provider webhook 乱序

- Provider event 入库后按状态优先级和发生时间处理。
- `paid/active` 不得被较低优先级 failed 覆盖。
- 原始 provider event 永久保留。

### H2：App receipt 重复提交

- 幂等键为 provider + purchase token / original_transaction_id。
- 重复验证只返回当前权益状态。

### H3：支付成功但权益发放失败

- `payment.status_changed` 写 outbox。
- `entitlement.granted` consumer 幂等。
- 失败进入 DLQ + P0 告警 + Admin 人工补发。

### H4：Google / Apple 退款或取消未同步

- Server notification + 定时 reconcile 双路径。
- 本地 `external_subscriptions` 与 provider 状态对账。
- 差异进入 `payment.reconciliation_mismatch`。

### H5：切换支付方式

- 旧订阅状态必须先确认取消或周期结束。
- 新 provider 订阅生效后再切换权益来源。
- App 显示当前权益来源，避免重复扣款。

## 6. 验证矩阵

- [ ] 每个 provider 正常支付 / 验证
- [ ] webhook 重复 / 乱序
- [ ] receipt 重复提交
- [ ] 退款同步
- [ ] 订阅恢复
- [ ] 对账差异告警
- [ ] 手工补单审计

## 7. 回滚

- Provider 级 FeatureFlag 下线。
- 已支付订单继续完成权益发放。
- 新订单路由到 fallback provider 或暂停。
- Admin 对账和人工处理保持可用。
