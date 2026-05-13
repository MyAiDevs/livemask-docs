# TASK-P5-04 - 部署与 CI/CD Runbook

- 状态：Ready
- Owner：DevOps
- 主影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-app`
- 受影响仓库：`livemask-docs`
- 关联里程碑：M5

## 1. Background

MVP 发布必须有可执行部署、迁移、回滚、观察和事故升级流程。

## 2. Scope

- 环境变量和 Secret 检查
- DB migration up/down
- Redis / queue health check
- API / worker deploy
- NodeAgent rollout
- App release gate
- rollback and incident escalation

## 3. Contracts

- Runbook：`docs/operations/RELEASE_RUNBOOK.md`
- Data：`docs/data/DB_MIGRATION_PLAN.md`
- Alerts：`docs/monitoring/ALERT_DASHBOARD_INDEX.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | deploy / migration / worker | 是 | staging deploy |
| `livemask-nodeagent` | rollout and config compatibility | 是 | canary agent |
| `livemask-app` | release gate and remote config | 是 | smoke test |
| `livemask-docs` | runbook and migration plan | 是 | docs check |

## 5. Validation Plan

- [ ] staging deploy
- [ ] migration dry run
- [ ] rollback dry run
- [ ] Redis restore / rebuild drill
- [ ] smoke tests pass

## 6. Rollback

- 按 `docs/operations/RELEASE_RUNBOOK.md` 执行。
- 回滚后必须补充事故或发布复盘。
