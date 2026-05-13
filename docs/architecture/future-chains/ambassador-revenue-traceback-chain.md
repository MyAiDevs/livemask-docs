# Ambassador Revenue Traceback Chain

> 覆盖推广大使收益、忠诚度加成、C2C 补贴、质量申诉追溯、收益重算和审计。

## 1. 正向链路

```text
Invited user pays / uses C2C / remains active
  -> Backend updates user_loyalty
  -> Revenue rule engine calculates ambassador commission
  -> PostgreSQL ambassador_revenue_records
  -> Outbox notification
  -> Admin revenue dashboard
  -> Ambassador sees estimated / settled revenue
```

## 2. 追溯链路

```text
Appeal / quality adjustment / refund / C2C dispute
  -> Backend marks affected revenue periods
  -> Recalculate task dry-run
  -> Admin reviews diff
  -> Approved recalculation writes adjustment records
  -> Ambassador dashboard and audit updated
```

## 3. 必须契约

### Config

- `promoter_revenue_config`
- `sponsor_node_revenue_config`
- `platform_protection_factor`
- `loyalty_bonus_factor`
- `c2c_commission_bonus_rate`

### DB

- `ambassadors`
- `user_loyalty`
- `ambassador_revenue_records`
- `ambassador_revenue_adjustments`
- `sponsor_revenues`
- `revenue_recalculation_jobs`

### Events

- `ambassador.revenue_calculated`
- `ambassador.revenue_adjusted`
- `revenue.recalculation_requested`
- `revenue.recalculation_completed`

## 4. 状态

| 状态 | 含义 |
| --- | --- |
| `estimated` | 预估收益 |
| `pending_settlement` | 待结算 |
| `settled` | 已结算 |
| `adjustment_pending` | 追溯调整待审核 |
| `adjusted` | 已调整 |
| `cancelled` | 因退款/争议取消 |

## 5. 假设审计

### H1：用户退款后大使收益已结算

- 不能删除原收益记录。
- 创建 adjustment record。
- 后续结算抵扣或人工处理。

### H2：质量申诉改变历史质量分

- 标记受影响 period。
- 先 dry-run 计算差异。
- Admin 审批后写 adjustment。

### H3：C2C 交易争议后佣金来源变化

- C2C completed 才可触发佣金。
- disputed / refunded 必须产生反向调整。

### H4：收益规则配置变更

- 新规则只影响未来 period，除非明确触发追溯。
- 追溯必须记录 config_version。

## 6. 验证矩阵

- [ ] 正常订阅支付产生佣金
- [ ] C2C completed 产生额外佣金
- [ ] refund 产生 adjustment
- [ ] quality appeal dry-run
- [ ] Admin approval 后重算
- [ ] 重复重算幂等
- [ ] 大使端展示 estimated / settled / adjusted

## 7. 回滚

- 停止新 revenue calculation worker。
- 保留原始记录。
- 使用反向 adjustment 修正。
- 已结算资金进入人工财务处理。
