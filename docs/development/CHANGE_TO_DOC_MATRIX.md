# Change To Documentation Matrix

> 开发者改了什么，就必须知道该更新哪些文档。此矩阵是提交前检查依据。

| 变更类型 | 必须更新 | 必须检查 | 验证证据 |
| --- | --- | --- | --- |
| API 字段新增/删除/重命名 | `docs/contracts/api/` | App、NodeAgent、Admin 调用方、QA、Ops | Contract test、调用方兼容检查、角色交接证据 |
| 错误码变化 | `docs/contracts/error-codes.md` | App 展示、NodeAgent 重试、客服排查、QA | 错误路径测试、用户可见行为 |
| 配置结构变化 | `docs/contracts/config/` | Backend、NodeAgent、App、Admin、Security、Ops | 热更新、旧配置、回滚验证、审计记录 |
| FeatureFlag 规则变化 | `docs/contracts/config/`、Backend 文档 | Admin、App、风控、Product、QA | 灰度、回滚、实验口径和复盘记录 |
| 异步事件变化 | `docs/contracts/events/` | Producer、Consumer、DLQ、Ops、QA | 重试、幂等、审计、告警测试 |
| 状态机变化 | `docs/contracts/state-machines.md` | App 展示、Backend 状态流转、DB、Admin、QA | 正向、重复、乱序、补偿测试 |
| 数据库迁移 | `docs/architecture/` | Backend、报表、审计、Ops、QA | Migration up/down、索引检查、回滚演练 |
| 支付流程变化 | `docs/payment/`、contracts | App、Backend、Webhook、Admin、Ops、Security、QA、Support | 幂等、签名、失败补偿、对账和人工补单测试 |
| NodeAgent 降级模式变化 | `docs/nodeagent/`、contracts | Backend、Monitoring、Ops、App、Product、QA | 降级、恢复、上报、用户反馈和告警测试 |
| App 用户流程变化 | `docs/app/` | Backend API、埋点、客服话术、Product、QA | 截图、E2E、错误路径、发布观察指标 |
| Admin 高风险操作变化 | `docs/admin/`、contracts | Backend、Security、Ops、QA、Product | 权限、审计、双人复核、误操作恢复测试 |
| Secret / 权限变化 | `docs/security/` | Backend、App、NodeAgent、Ops、Admin、QA | 权限、审计、轮换、泄露边界验证 |
| 监控/告警变化 | `docs/monitoring/` | Backend、NodeAgent、Ops、QA、Product | 告警样例、恢复记录、发布观察指标 |
| 任务新增或范围变化 | `docs/development/tasks/` | 里程碑表、风险台账、角色交接链 | TASK 单、PR 链接、交接证据 |

提交前如果无法定位对应文档，必须在 PR 中说明原因，并创建后续 `TASK-XXXX`。
