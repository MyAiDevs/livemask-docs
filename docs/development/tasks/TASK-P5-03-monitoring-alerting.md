# TASK-P5-03 - 监控告警完善

- 状态：Ready
- Owner：Ops / SRE
- 主影响仓库：`livemask-backend`, `livemask-nodeagent`
- 受影响仓库：`livemask-app`, `livemask-docs`
- 关联里程碑：M5

## 1. Background

MVP 上线前必须能观测 API、PostgreSQL、Redis、NodeAgent、支付、配置和 App 连接成功率。

## 2. Scope

- MVP 指标
- P0/P1 告警
- Dashboard 索引
- 发布观察窗口
- 告警恢复条件

## 3. Contracts

- Monitoring：`docs/monitoring/ALERT_DASHBOARD_INDEX.md`
- Runbook：`docs/operations/RELEASE_RUNBOOK.md`
- Chain：`docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 指标和日志 | 是 | alert sample |
| `livemask-nodeagent` | degraded / report metrics | 是 | mock degraded alert |
| `livemask-app` | 连接成功率指标 | 是 | app metric sample |
| `livemask-docs` | 告警索引 | 是 | docs check |

## 5. Validation Plan

- [ ] API error alert fires
- [ ] Redis write failure alert fires
- [ ] payment webhook failure alert fires
- [ ] config lag alert fires
- [ ] node degraded alert fires

## 6. Rollback

- 回滚告警规则到上一版本。
- 保留 Dashboard，只关闭误报规则。
- 发布复盘记录误报原因。
