# DB Migration Plan

## 1. 迁移原则

- 所有迁移必须可重跑或可检测已执行状态。
- P0 表必须有主键、必要唯一约束、审计字段和索引。
- 删除字段必须先进入 deprecate 阶段，不得直接删除。
- 强一致业务状态必须由 PostgreSQL 约束兜底。

## 2. MVP 必需迁移

| Migration | 目标 | 验证 |
| --- | --- | --- |
| `001_system_configs` | 配置中心 | CRUD、version/hash unique |
| `002_node_reports` | NodeAgent 上报历史 | `report_id` unique |
| `003_connection_quality_reports` | App 连接质量反馈 | `request_id` unique per user |
| `004_payment_orders` | USDT 支付订单 | provider external id unique |
| `005_outbox_events` | DB outbox | pending/delivered retry |
| `006_quick_feedback_appeals` | 快速反馈 appeal | request_id unique |

## 3. 回滚规则

- Additive migration：可保留字段，回滚代码即可。
- Destructive migration：必须拆成至少两个版本，先停止写入，再删除。
- Data backfill：必须记录批次 ID 和进度。
- Failed migration：停止发布，恢复备份或执行 down migration。

## 4. 验收标准

- [ ] staging dry run 通过。
- [ ] down migration 或人工回滚方案存在。
- [ ] 索引 explain 检查通过。
- [ ] DB / Redis 一致性测试通过。
