# Monitoring / SRE 文档入口

## 1. 职责范围

Monitoring / SRE 负责指标、日志、Tracing、Dashboard、告警、恢复条件、发布观察和系统健康度。

## 2. 修改监控前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否覆盖 App、NodeAgent、API、PostgreSQL、Redis 中的关键失败点
- [ ] 告警是否能定位责任层和 Owner
- [ ] 是否有恢复条件和升级路径
- [ ] 是否影响 Product、Support 或 Ops 的发布观察

## 3. 必须更新文档的场景

- 新增或修改指标、日志字段、Tracing span
- 新增或修改告警阈值、告警等级、升级路径
- 新增 Dashboard 或系统健康度口径
- 改变发布观察窗口或 SLO
- 改变 Redis、DB、API、NodeAgent、App 的可观测性

## 4. 完成标准

- [ ] 指标名、标签、阈值和 Owner 明确
- [ ] 告警触发条件和恢复条件明确
- [ ] Dashboard 入口或截图已记录
- [ ] P0/P1 告警有值班和升级路径
- [ ] QA 或 Ops 已验证告警样例

## 5. 必读文档

- `docs/monitoring/LiveMask_监控日志告警规范_v3.6.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`
- `docs/contracts/data-consistency.md`
- `docs/development/RISK_REGISTER.md`
