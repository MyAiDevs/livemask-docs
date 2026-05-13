# TASK-P2-05 - 节点推荐与过滤

- 状态：Ready
- Owner：Client Lead / Backend Lead
- 主影响仓库：`livemask-app`, `livemask-backend`
- 受影响仓库：`livemask-nodeagent`, `livemask-docs`
- 关联里程碑：M2

## 1. Background

App 需要获得可连接、未 degraded、符合用户套餐和地理策略的节点，并在失败时 fallback。

## 2. Scope

- 推荐节点 API
- GEOIP / quality / status / package filtering
- Redis stale 过滤
- App fallback 到次优节点
- 推荐日志和失败反馈

## 3. Contracts

- API：`docs/contracts/api/core-mvp.md#node-recommendation-api`
- Data：`docs/contracts/data-consistency.md`
- Chain：`docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-app` | 请求推荐、fallback | 是 | E2E connection test |
| `livemask-backend` | 推荐算法和日志 | 是 | API + Redis stale test |
| `livemask-nodeagent` | 实时状态来源 | 间接 | report freshness test |
| `livemask-docs` | 契约和测试矩阵 | 是 | docs check |

## 5. Validation Plan

- [ ] healthy node recommended
- [ ] degraded node filtered
- [ ] stale Redis status filtered
- [ ] App fallback on connection failure
- [ ] recommendation_logs written

## 6. Rollback

- 回滚到静态节点列表或 last-known-good 推荐。
- 降低推荐算法 FeatureFlag 权重。
- Ops 观察连接成功率。
