# Future Module Chain Index

> 本目录把非 MVP 但已在项目文档中规划的关键模块，补齐到与 MVP 主链路相同的闭环粒度。进入对应模块开发前，必须先读取对应链路文档，并把其中的 API / Config / Event / State Machine 条目细化到 `docs/contracts/`。

## 链路文档

- [积分经济链路](points-economy-chain.md)
- [C2C 交易链路](c2c-trading-chain.md)
- [多支付方式链路](multi-payment-chain.md)
- [Admin 审批 / 审计链路](admin-approval-audit-chain.md)
- [iOS NetworkExtension 链路](ios-networkextension-chain.md)
- [推广大使收益追溯链路](ambassador-revenue-traceback-chain.md)

## 通用要求

每条未来模块链路都必须在实现前补齐：

- 真实 API contract
- Config contract
- Event contract
- Error codes
- State machine
- DB migration
- Redis key / queue / outbox
- QA validation matrix
- Ops / Support runbook

## 进入开发的门禁

- [ ] 本链路文档已更新到当前需求。
- [ ] 相关 TASK 已从模板拆出独立任务单。
- [ ] 真实契约已从本文迁移到 `docs/contracts/`。
- [ ] P0/P1 风险已进入 `docs/development/RISK_REGISTER.md`。
- [ ] `bash scripts/check-docs.sh` 通过。
