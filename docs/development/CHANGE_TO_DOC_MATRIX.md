# Change To Documentation Matrix

> 开发者改了什么，就必须知道该更新哪些文档。此矩阵是提交前检查依据。

| 变更类型 | 必须更新 | 必须检查 | 验证证据 |
| --- | --- | --- | --- |
| API 字段新增/删除/重命名 | `docs/contracts/api/` | App、NodeAgent、Admin 调用方 | Contract test、调用方兼容检查 |
| 错误码变化 | `docs/contracts/error-codes.md` | App 展示、NodeAgent 重试、客服排查 | 错误路径测试 |
| 配置结构变化 | `docs/contracts/config/` | Backend、NodeAgent、App、Admin | 热更新、旧配置、回滚验证 |
| FeatureFlag 规则变化 | `docs/contracts/config/`、Backend 文档 | Admin、App、风控 | 灰度和回滚记录 |
| 异步事件变化 | `docs/contracts/events/` | Producer、Consumer、DLQ | 重试、幂等、审计测试 |
| 状态机变化 | `docs/contracts/state-machines.md` | App 展示、Backend 状态流转、DB | 正向、重复、乱序、补偿测试 |
| 数据库迁移 | `docs/architecture/` | Backend、报表、审计、回滚 | Migration up/down、索引检查 |
| 支付流程变化 | `docs/payment/`、contracts | App、Backend、Webhook、风控 | 幂等、签名、失败补偿测试 |
| NodeAgent 降级模式变化 | `docs/nodeagent/`、contracts | Backend、Monitoring、App 可见状态 | 降级、恢复、上报测试 |
| App 用户流程变化 | `docs/app/` | Backend API、埋点、客服话术 | 截图、E2E、错误路径验证 |
| Secret / 权限变化 | `docs/security/` | Backend、App、NodeAgent、Ops | 权限、审计、轮换验证 |
| 监控/告警变化 | `docs/monitoring/` | Backend、NodeAgent、Ops | 告警样例和恢复记录 |
| 任务新增或范围变化 | `docs/development/tasks/` | 里程碑表、风险台账 | TASK 单和 PR 链接 |

提交前如果无法定位对应文档，必须在 PR 中说明原因，并创建后续 `TASK-XXXX`。
