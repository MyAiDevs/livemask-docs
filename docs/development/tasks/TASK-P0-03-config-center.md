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

- API：`docs/contracts/api/config-center.md`
- Config：`docs/contracts/config/core-configs.md`
- Events：`docs/contracts/events/core-events.md#config-published`
- Data：`docs/contracts/data-consistency.md`
- Redis：`docs/data/redis-key-registry.md`
- DB：`docs/architecture/LiveMask_数据库详细设计_v3.6.md#26-system_configs-表配置中心`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 配置 CRUD、版本、hash、Redis 通知 | 是 | API + DB + Redis 测试 |
| `livemask-nodeagent` | 拉取并应用配置 | 后续 P1-05 | mock config reload |
| `livemask-app` | 拉取 remote config | 后续 P1-05 | old config fallback |
| `livemask-admin` | 配置编辑和审计 | 后续 | 手工验证 |
| `livemask-ci-cd` | 配置中心 staging smoke | 是 | docker compose + config read/publish smoke |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Backend | Backend | 配置 key、默认值、影响端 | key 无默认值 |
| 2 | Backend | App / NodeAgent | schema、version、hash | 旧版本行为不明 |
| 3 | Backend | QA / Ops | Redis key、Pub/Sub、回滚方式 | 无回滚或无告警 |

## 6. Validation Plan

- [ ] `GET /api/v1/config/client` returns published `client.remote_config`.
- [ ] `GET /internal/agent/config` returns published `nodeagent.runtime_config`.
- [ ] Admin draft / publish / rollback APIs preserve monotonic versions.
- [ ] `config_hash` is stable for canonical JSON and rejects mismatched publish.
- [ ] Redis cache miss rebuilds from PostgreSQL.
- [ ] Redis publish uses `pubsub:config.published`.
- [ ] Pub/Sub lost fallback works through polling / version comparison.
- [ ] Rollback creates a new published version from the selected old payload.
- [ ] Staging smoke validates Backend + PostgreSQL + Redis + config read path.

## 7. Implementation Notes

- MVP may seed default config rows at backend startup or migration time, but production should use migrations/seed scripts.
- Published config is unique per `config_key`; draft history may contain multiple versions.
- `payment.usdt_nowpayments` must store only non-secret config and secret references. Real secrets remain in env / secret manager.
- If Redis update fails after DB commit, API must report a warning and metrics; committed DB state remains the source of truth.

## 8. Rollback

- 回滚触发条件：配置解析失败、NodeAgent/App 生效率异常、P0 告警。
- 回滚步骤：基于目标历史 payload 创建新版本并发布，发布 `config.published`，观察生效率。
- 回滚验证：`config_version_lagging_nodes` 下降，App / NodeAgent 上报版本一致。
