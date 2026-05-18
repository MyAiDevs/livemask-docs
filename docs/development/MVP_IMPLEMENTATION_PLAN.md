# MVP Implementation Plan

> 本计划把“可落地开发”的第一批任务收敛到最小闭环：配置中心、节点上报、App 推荐/反馈、USDT 支付、部署监控。

## 1. MVP 范围

### In Scope

- P0-03 配置中心核心实现
- P1-01 USDT 支付完整集成
- AUTH-001 账号、登录、Session、RBAC 基础闭环
- VPN-CONFIG-001 真实 VPN connect_config 契约与安全模型
- DOC-PROTOCOL-001 NodeAgent 多协议扩展架构文档
- P1-05 配置热更新完整闭环
- P2-05 节点推荐与过滤
- P3-01 App 上报连接质量
- P3-02 节点快速反馈闭环
- P5-03 监控告警完善
- P5-04 部署与 CI/CD 完善

### Out of Scope

- 多支付方式正式上线
- 完整积分经济体系
- 高级推荐模型训练
- iOS 深度优化
- 全量 Admin 运营页面

## 2. 独立 TASK 文件

| TASK | 目标 | 主角色 | 依赖 |
| --- | --- | --- | --- |
| [TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md](tasks/TASK-INFRA-001-mvp-health-ci-smoke-closed-loop.md) | Health API + CI/CD Smoke 闭环验证 | Backend / DevOps | 无（基础设施已就位） |
| [TASK-INFRA-002-ai-task-sync-and-auto-marking.md](tasks/TASK-INFRA-002-ai-task-sync-and-auto-marking.md) | AI 多窗口任务同步、Issue 评论、解锁 dispatch、Lark 报告 | DevOps / Docs | INFRA-001 |
| [TASK-VPN-CONFIG-001-real-connect-config-contract.md](tasks/TASK-VPN-CONFIG-001-real-connect-config-contract.md) | Connect Config 契约与安全模型 | Backend / Security | INFRA-001 |
| [TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md](tasks/TASK-DOC-PROTOCOL-001-nodeagent-multi-protocol-extension-arch.md) | NodeAgent 多协议扩展架构文档 | NodeAgent / Docs | INFRA-001 |
| [TASK-P0-03-config-center.md](tasks/TASK-P0-03-config-center.md) | 配置中心、版本、hash、Redis 通知 | Backend | INFRA-001 |
| [TASK-ADMIN-001-config-center-management-ui.md](tasks/TASK-ADMIN-001-config-center-management-ui.md) | 配置中心管理页、草稿、发布、回滚 | Admin | P0-03 |
| [TASK-APP-001-remote-config-cache-fallback.md](tasks/TASK-APP-001-remote-config-cache-fallback.md) | App 远程配置读取、缓存、降级 | App | P0-03 |
| [TASK-NA-CONFIG-001-config-sync-hot-reload.md](tasks/TASK-NA-CONFIG-001-config-sync-hot-reload.md) | NodeAgent 配置同步、轮询、降级、热更新 | NodeAgent | P0-03 |
| [TASK-AUTH-001-account-auth-rbac-closed-loop.md](tasks/TASK-AUTH-001-account-auth-rbac-closed-loop.md) | 账号、登录、Session、RBAC、路由隔离 | Backend / Security | P0-03 |
| [TASK-P1-01-usdt-payment.md](tasks/TASK-P1-01-usdt-payment.md) | NOWPayments + Webhook + 幂等 | Backend / Payment | Config center + AUTH-001 |
| [TASK-P1-05-config-hot-reload.md](tasks/TASK-P1-05-config-hot-reload.md) | App / NodeAgent 配置热更新闭环 | Backend / NodeAgent / App | P0-03 |
| [TASK-P2-05-node-recommendation.md](tasks/TASK-P2-05-node-recommendation.md) | 节点推荐、过滤、fallback | App / Backend | NodeAgent status |
| [TASK-P3-01-connection-quality-report.md](tasks/TASK-P3-01-connection-quality-report.md) | App 连接质量上报 | App / Backend | P2-05 |
| [TASK-P3-02-quick-feedback.md](tasks/TASK-P3-02-quick-feedback.md) | 快速反馈和低优先级 appeal | App / Backend | P3-01 |
| [TASK-P5-03-monitoring-alerting.md](tasks/TASK-P5-03-monitoring-alerting.md) | MVP 指标、告警、Dashboard | Ops / SRE | P0-P3 |
| [TASK-P5-04-deploy-runbook.md](tasks/TASK-P5-04-deploy-runbook.md) | 部署、迁移、回滚 Runbook | DevOps | P0-P3 |

## 3. MVP 完成标准

- [ ] 核心 API 契约已在 `docs/contracts/api/core-mvp.md` 登记。
- [ ] 核心配置已在 `docs/contracts/config/core-configs.md` 登记。
- [ ] 核心事件已在 `docs/contracts/events/core-events.md` 登记。
- [ ] Redis key 和数据一致性策略已在 `docs/data/redis-key-registry.md` 登记。
- [ ] Outbox / 补偿任务已在 `docs/data/outbox-compensation.md` 登记。
- [ ] P0 测试矩阵已在 `docs/qa/P0_VALIDATION_MATRIX.md` 登记。
- [ ] 上线 Runbook 已在 `docs/operations/RELEASE_RUNBOOK.md` 登记。
