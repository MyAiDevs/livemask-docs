# Risk Register

> 本台账记录跨仓库、高风险或容易失去闭环的事项。风险关闭前，不能只靠口头约定。

| Risk ID | 风险 | 影响 | 触发条件 | 缓解措施 | Owner | 状态 | 关联 TASK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-DOC-001 | 业务仓库未同步最新 AI 规则 | 多窗口 AI 使用旧规则，导致跨仓库漏检 | 修改 docs 规则后未更新业务仓库规则入口 | 创建同步 TASK，检查 `.cursorrules` / Copilot instructions | Docs Maintainer | Open | `TASK-DOC-002` |
| RISK-CONTRACT-001 | API 字段变化未同步 App / NodeAgent | 客户端崩溃、节点上报失败或错误重试 | Backend 修改请求/响应字段 | 任何 API 变更必须更新 `docs/contracts/api/` | Backend Lead | Open | 待创建 |
| RISK-CONFIG-001 | 配置热更新缺少回滚策略 | 大面积节点异常或客户端解析失败 | 配置 schema 或默认值变化 | 使用 config contract 和配置变更模板 | Backend / NodeAgent Lead | Open | 待创建 |
| RISK-PAY-001 | 支付状态机与权益发放不一致 | 资金或用户权益异常 | Webhook 重放、乱序、失败补偿 | 状态机契约 + 幂等测试 + 审计 | Backend Lead | Open | 待创建 |
| RISK-SEC-001 | Secret 或内部配置泄露到客户端 | 安全事故 | 配置下发或日志输出包含 Secret | Security 文档审查 + 配置安全级别 | Security Owner | Open | 待创建 |
| RISK-HANDOFF-001 | 角色交接缺少证据 | 下游无法验收，上线后才暴露断点 | 任务单没有交接物、阻断条件或回流路径 | 使用 `ROLE_HANDOFF_CHAINS.md` 和 PR Role Handoff 表 | Task Owner | Open | `TASK-DOC-005` |
| RISK-QA-001 | QA 只验证正向路径 | 失败、回滚、乱序、兼容问题漏测 | 验收标准不可测试或缺少失败路径 | QA 必须对照角色链和 DoD 出具证据 | QA Lead | Open | 待创建 |
| RISK-E2E-CHAIN-001 | App/NodeAgent/API/DB/Redis 局部成功导致链路不一致 | App 推荐错误、节点状态错误、Admin 大盘延迟或收益重复 | DB 写入与 Redis 写入、Pub/Sub、NodeAgent 补报任一环节失败 | 使用端到端链路假设审计和数据一致性契约 | Backend / NodeAgent Lead | Open | `TASK-DOC-006` |

## 风险关闭标准

- [ ] 有明确 Owner
- [ ] 有关联 TASK
- [ ] 有验证证据
- [ ] 有回滚或缓解方案
- [ ] 相关文档已更新
- [ ] 受影响角色已完成交接确认
