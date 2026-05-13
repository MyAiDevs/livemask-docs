# TASK-P1-01 - USDT 支付完整集成

- 状态：Ready
- Owner：Backend / Payment Owner
- 主影响仓库：`livemask-backend`
- 受影响仓库：`livemask-app`, `livemask-admin`, `livemask-docs`
- 关联里程碑：M1

## 1. Background

MVP 使用 NOWPayments 完成 USDT 支付，支付成功后必须更新订单、权益、通知、审计，并保证 Webhook 重复/乱序安全。

## 2. Scope

### In Scope

- 创建 USDT 支付订单
- NOWPayments Webhook 签名验证
- 支付状态机
- 幂等处理
- 用户权益发放
- 支付异常日志

### Out of Scope

- Google Play / Apple IAP 正式接入
- 多支付渠道路由

## 3. Contracts

- API：`docs/contracts/api/core-mvp.md#payment-api`
- Events：`docs/contracts/events/core-events.md#payment-events`
- State Machine：`docs/contracts/state-machines.md#payment-order-state-machine`
- Error Codes：`docs/contracts/error-codes.md#payment-errors`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 订单、Webhook、权益、审计 | 是 | webhook + idempotency tests |
| `livemask-app` | 支付状态展示和权益刷新 | 是 | payment UI state tests |
| `livemask-admin` | 对账、补单、退款入口 | 后续 | admin manual flow |
| `livemask-docs` | 支付契约和状态机 | 是 | docs check |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product | Payment / Backend | 套餐权益、价格、支付成功定义 | 权益不明确 |
| 2 | Backend | App / Admin | 状态机、错误码、权益刷新方式 | App 无用户反馈 |
| 3 | Security | Backend | webhook 签名和审计要求 | 无验签 |
| 4 | QA | Payment Owner | 重放、乱序、失败补偿结果 | 幂等失败 |

## 6. Validation Plan

- [ ] Create order success
- [ ] Invalid signature rejected
- [ ] Duplicate webhook idempotent
- [ ] Out-of-order webhook handled
- [ ] Payment success grants entitlement once
- [ ] Redis failure does not corrupt DB state

## 7. Rollback

- 回滚触发条件：支付成功不发权益、重复发权益、Webhook 验签异常。
- 回滚步骤：下线支付入口 FeatureFlag，停止处理新订单，保留 Webhook 审计，人工补单。
- 回滚验证：无新增 paid 订单进入异常状态，Admin 对账差异可追踪。
