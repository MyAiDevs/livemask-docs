# TASK-P3-02 - 节点快速反馈闭环

- 状态：Ready
- Owner：App / Backend
- 主影响仓库：`livemask-app`, `livemask-backend`
- 受影响仓库：`livemask-admin`, `livemask-docs`
- 关联里程碑：M3

## 1. Background

用户可快速反馈节点问题，系统自动生成低优先级 appeal 并短期降低推荐权重，Admin 可复核。

## 2. Scope

- `POST /client/nodes/quick-feedback`
- feedback_type / node_id / request_id
- 创建 low-priority appeal
- Redis 短期降权
- Admin 可查询反馈记录

## 3. Contracts

- API：`docs/contracts/api/core-mvp.md#quick-feedback-api`
- Events：`docs/contracts/events/core-events.md#node-quality-events`
- State Machine：`docs/contracts/state-machines.md#appeal-state-machine`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-app` | 快速反馈入口 | 是 | UI + API test |
| `livemask-backend` | appeal 创建和短期降权 | 是 | idempotency test |
| `livemask-admin` | feedback review | 后续 | admin list check |
| `livemask-docs` | API / state machine | 是 | docs check |

## 5. Validation Plan

- [ ] feedback accepted
- [ ] duplicate feedback idempotent
- [ ] appeal created
- [ ] node recommendation weight reduced
- [ ] Admin can review

## 6. Rollback

- 关闭 quick feedback 入口。
- 停止自动降权，仅保留记录。
- 回滚短期降权 Redis key。
