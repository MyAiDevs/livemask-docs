# Points Economy Chain

> 覆盖积分 earning、消费、过期、调整、审计和与订阅 / 节点 / 推广大使 / C2C 的联动。

## 1. 正向链路

```text
NodeAgent traffic / App purchase / invited user spend
  -> Backend earning rule engine
  -> PostgreSQL points_transactions + points_balances
  -> Redis user balance cache invalidation
  -> App balance refresh
  -> Admin points dashboard
  -> Monitoring inflation / anomaly alerts
```

## 2. 角色

| 角色 | 职责 |
| --- | --- |
| Product | 定义积分来源、消费场景、过期规则 |
| Backend | 规则引擎、账本、幂等、审计 |
| App | 展示余额、消费确认、失败反馈 |
| Admin | 配置 earning 规则、人工调整、异常审核 |
| Data / Redis | 账本表、余额唯一性、缓存失效 |
| QA | earning / spend / rollback / idempotency 测试 |
| Ops / SRE | 积分通胀、异常 earning、任务失败告警 |

## 3. 必须契约

### API

- `GET /api/v1/points/balance`
- `GET /api/v1/points/transactions`
- `POST /api/v1/points/spend`
- `POST /admin/points/adjust`
- `POST /admin/points/config`

### Config

- `system_configs.points_economy`
- `node_points_rate`
- `plan_purchase_bonus_rate`
- `promoter_points_rate`
- `points_expiration_days`
- `points_daily_earning_cap`

### Events

- `points.earned`
- `points.spent`
- `points.adjusted`
- `points.expired`
- `points.anomaly_detected`

### DB / Redis

- PostgreSQL：`points_balances`, `points_transactions`, `points_adjustment_logs`
- Redis：`points:balance:{user_id}` TTL 5 min，DB 为事实源
- Outbox：所有账本变化必须写事件

## 4. 状态与幂等

| 操作 | 幂等键 |
| --- | --- |
| 节点 earning | `node_id:period_start:period_end:points_rule_version` |
| 购买赠送 | `order_id:points_bonus` |
| 推广大使 earning | `user_id:source_order_id:promoter_points` |
| 积分消费 | `request_id:user_id:points_spend` |
| 人工调整 | `adjustment_id` |

## 5. 假设审计

### H1：积分余额缓存旧值

- App 必须以交易提交结果为准，而不是本地余额。
- Backend 消费积分必须在 DB transaction 内校验余额。
- Redis 余额缓存失效失败时，下一次余额接口必须可绕过缓存或强制刷新。

### H2：earning 任务重复执行

- `points_transactions` 必须有业务幂等键。
- 聚合任务可重跑但不得重复发放。
- 任务重跑必须记录 batch_id。

### H3：积分消费成功但订阅创建失败

- 积分扣减和订阅创建必须同事务或通过 saga 补偿。
- 若订阅失败，必须自动返还积分并生成 `points.adjusted`。

### H4：人工调整误操作

- Admin 高风险调整需要权限、原因、二次确认。
- 所有调整写 `points_adjustment_logs`。
- 可通过反向调整修复，不直接删除账本。

## 6. 验证矩阵

- [ ] earning 正常入账
- [ ] 重复 earning 不重复入账
- [ ] 积分消费余额不足失败
- [ ] 积分消费成功后订阅生效
- [ ] 订阅失败后积分返还
- [ ] 人工调整有审计
- [ ] Redis 余额缓存失效后可恢复

## 7. 回滚

- 关闭 `points_economy.enabled`。
- 停止 earning worker。
- 保留账本，只做反向调整。
- App 隐藏积分消费入口但保留余额展示。
