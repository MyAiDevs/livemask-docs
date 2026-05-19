# Payment 文档入口

## 1. 职责范围

Payment 负责支付渠道接入、订单状态机、Webhook、订阅权益、退款、对账、风控和审计。

## 2. 修改 Payment 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响 App 支付入口、用户权益展示或失败提示
- [ ] 是否影响 Backend 订单状态机、幂等键、Webhook 或补偿任务
- [ ] 是否影响 Admin 对账、退款、人工补单或风控审核
- [ ] 是否影响财务、客服、法务或运营流程

## 3. 必须更新文档的场景

- 新增或下线支付渠道
- 订单状态、订阅状态、退款状态变化
- Webhook payload、签名、重试或验签规则变化
- 对账口径、异常处理、人工补单流程变化
- 支付风控阈值或黑名单联动变化

## 4. 完成标准

- [ ] `docs/contracts/state-machines.md` 已登记或更新支付状态机
- [ ] `docs/contracts/events/` 已登记 Webhook 或领域事件
- [ ] `docs/contracts/error-codes.md` 已登记支付错误码
- [ ] Webhook 签名、幂等、乱序、重放、失败补偿已验证
- [ ] App、Admin、运营、财务影响已检查
- [ ] 回滚不会造成资金或权益状态不一致

## 5. 支付订单日志

- [Log, Audit, Metric, And Node Observability Pipeline Contract](../contracts/observability/LOG_METRIC_PIPELINE_CONTRACT.md)

支付相关实现必须同时维护业务状态机和 redacted order log timeline。Admin/Finance/Support 需要看到订单创建、provider request/response、webhook、重复 webhook、签名失败、对账、退款、拒付、人工调整等事件，但不得展示 raw provider payload、支付凭据、card data、wallet secret 或 provider secret。

相关后续任务：

- `TASK-BACKEND-PAYMENT-LOGS-001`
- `TASK-ADMIN-OBSERVABILITY-DETAILS-001`
- `TASK-CICD-OBSERVABILITY-SMOKE-001`
