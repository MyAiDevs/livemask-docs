# TASK-P1-05 - 配置热更新完整闭环

- 状态：Ready
- Owner：Backend / NodeAgent Lead
- 主影响仓库：`livemask-backend`, `livemask-nodeagent`
- 受影响仓库：`livemask-app`, `livemask-admin`, `livemask-docs`
- 关联里程碑：M1

## 1. Background

配置热更新必须能在 Pub/Sub 丢失、旧版本客户端、非法配置、NodeAgent 离线情况下最终一致并可回滚。

## 2. Scope

- NodeAgent / App 拉取配置
- 心跳携带配置版本
- 热更新校验
- last-known-good 回滚
- 配置生效率监控

## 3. Contracts

- API：`docs/contracts/api/core-mvp.md#config-api`
- Config：`docs/contracts/config/core-configs.md`
- Events：`docs/contracts/events/core-events.md#config-published`
- Data：`docs/contracts/data-consistency.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` | 配置发布、版本比对、通知 | 是 | API + Redis test |
| `livemask-nodeagent` | 热更新、回滚、心跳版本 | 是 | reload + fallback test |
| `livemask-app` | remote config、last-known-good | 是 | old config test |
| `livemask-admin` | 配置编辑和审计 | 后续 | manual check |

## 5. Validation Plan

- [ ] Pub/Sub 丢失后轮询补偿
- [ ] 旧配置兼容
- [ ] 非法配置拒绝应用
- [ ] NodeAgent 离线后恢复同步
- [ ] App 使用 last-known-good 并提示可能过期

## 6. Rollback

- 恢复上一版本配置。
- 标记失败版本为 disabled。
- Admin 审计记录 rollback operator。
- Ops 观察配置生效率和错误率。
