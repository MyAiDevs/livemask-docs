# C2C Trading Chain

> 覆盖积分 C2C 上架、冻结、购买、支付、成交、抽成、争议、申诉和回滚。

## 1. 正向链路

```text
Seller lists points
  -> Backend validates risk and freezes points
  -> Buyer creates trade
  -> Payment order / escrow confirmation
  -> Backend transfers points and platform fee
  -> PostgreSQL trade ledger + outbox
  -> App buyer/seller status refresh
  -> Admin risk dashboard / dispute handling
```

## 2. 角色

| 角色 | 职责 |
| --- | --- |
| Product | 定义交易规则、手续费、争议策略 |
| Backend | 冻结、撮合、状态机、账本、幂等 |
| Payment | USDT 支付、确认、退款/失败 |
| App | 买卖双方状态展示和操作 |
| Admin | 风控审核、争议处理、人工裁决 |
| Security | 洗钱/刷单/关联账号风控 |
| QA | 状态机、并发购买、支付失败、申诉测试 |

## 3. 状态机

### Listing

| 状态 | 含义 | 终态 |
| --- | --- | --- |
| `active` | 可购买，积分已冻结 | 否 |
| `locked` | 被买家锁定 | 否 |
| `sold` | 已成交 | 是 |
| `cancelled` | 卖家取消，积分解冻 | 是 |
| `frozen` | 风控冻结 | 否 |

### Trade

| 状态 | 含义 | 终态 |
| --- | --- | --- |
| `created` | 交易创建 | 否 |
| `awaiting_payment` | 等待支付 | 否 |
| `paid` | 支付确认 | 否 |
| `completed` | 积分划转完成 | 是 |
| `disputed` | 争议中 | 否 |
| `cancelled` | 取消 | 是 |
| `refunded` | 退款 | 是 |

## 4. 必须契约

### API

- `POST /api/v1/points/c2c/listings`
- `POST /api/v1/points/c2c/listings/{id}/cancel`
- `POST /api/v1/points/c2c/trades`
- `GET /api/v1/points/c2c/trades/{id}`
- `POST /api/v1/points/c2c/trades/{id}/dispute`
- `POST /admin/points/c2c/trades/{id}/resolve`

### Config

- `system_configs.points_c2c_risk`
- daily listing limit
- max trade amount
- price deviation threshold
- KYC requirement
- new user restriction days

### Events

- `c2c.listing_created`
- `c2c.trade_created`
- `c2c.payment_confirmed`
- `c2c.trade_completed`
- `c2c.trade_disputed`
- `c2c.trade_refunded`

## 5. DB / Redis

- PostgreSQL：`points_c2c_listings`, `points_c2c_trades`, `points_c2c_disputes`, `points_transactions`
- Redis lock：`c2c:listing:lock:{listing_id}` TTL 5 min
- Redis risk counter：`c2c:daily:{user_id}:{date}` TTL 48 h
- DB unique：active listing lock must be enforced by DB transaction, Redis lock only reduces contention

## 6. 假设审计

### H1：两个买家同时购买同一挂单

- Redis lock 尝试锁定。
- DB transaction 再次校验 listing 状态。
- 只有一个 trade 可以从 `created` 进入 `awaiting_payment`。

### H2：支付成功但积分划转失败

- Payment confirmed 写 outbox。
- Consumer 幂等执行积分划转。
- 失败进入 compensation：冻结状态保持，Admin 可人工完成或退款。

### H3：卖家取消时买家已支付

- listing `locked` 后禁止卖家取消。
- 若出现竞态，以 DB trade 状态为准。
- Admin 复核并按 trade 状态裁决。

### H4：价格异常或洗钱风险

- 创建 listing / trade 前执行风控。
- 异常进入 `frozen` 或 `disputed`。
- Security / Admin 人工审核。

## 7. 验证矩阵

- [ ] listing 创建冻结积分
- [ ] cancel 解冻积分
- [ ] 并发购买只有一个成功
- [ ] 支付成功后积分划转一次
- [ ] 支付失败后释放锁定
- [ ] 争议处理有审计
- [ ] 风控冻结阻断交易

## 8. 回滚

- 关闭 C2C market FeatureFlag。
- 停止新 listing / trade。
- 继续处理已支付 trade。
- 冻结 disputed trade，人工处理。
