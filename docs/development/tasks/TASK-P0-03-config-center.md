# TASK-P0-03 - 配置中心核心实现

- 状态：Ready
- Owner：Backend Lead
- 主影响仓库：`livemask-backend`, `livemask-docs`
- 受影响仓库：`livemask-nodeagent`, `livemask-app`, `livemask-admin`
- 关联里程碑：M0 / M1

## 1. Background

配置中心是 App、NodeAgent、Backend 共享策略的事实源，必须支持版本、hash、Redis 通知、回滚和兼容旧版本。

## 2. Scope

### In Scope

- `system_configs` CRUD
- `config_version`、`config_hash`
- Redis cache + Pub/Sub notify
- API 拉取配置
- Admin 修改审计

### Out of Scope

- 完整 Admin 可视化配置页面
- 高级灰度实验系统

## 3. Contracts

- API：`docs/contracts/api/core-mvp.md#config-api`
- Config：`docs/contracts/config/core-configs.md`
- Events：`docs/contracts/events/core-events.md#config-published`
- Data：`docs/contracts/data-consistency.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 配置 CRUD、版本、hash、Redis 通知 | 是 | API + DB + Redis 测试 |
| `livemask-nodeagent` | 拉取并应用配置 | 后续 P1-05 | mock config reload |
| `livemask-app` | 拉取 remote config | 后续 P1-05 | old config fallback |
| `livemask-admin` | 配置编辑和审计 | 后续 | 手工验证 |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Backend | Backend | 配置 key、默认值、影响端 | key 无默认值 |
| 2 | Backend | App / NodeAgent | schema、version、hash | 旧版本行为不明 |
| 3 | Backend | QA / Ops | Redis key、Pub/Sub、回滚方式 | 无回滚或无告警 |

## 6. Validation Plan

- [ ] Config CRUD API
- [ ] Hash/version mismatch
- [ ] Redis cache miss
- [ ] Pub/Sub lost fallback
- [ ] Rollback to previous config

## 7. Rollback

- 回滚触发条件：配置解析失败、NodeAgent/App 生效率异常、P0 告警。
- 回滚步骤：恢复上一版本 `system_configs`，发布 `config.published`，观察生效率。
- 回滚验证：`config_version_lagging_nodes` 下降，App / NodeAgent 上报版本一致。
