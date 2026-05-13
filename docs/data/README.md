# Database / Redis 文档入口

## 1. 职责范围

Database / Redis 角色负责 PostgreSQL schema、迁移、索引、约束、审计、Redis 缓存、Pub/Sub、Streams、限流、锁和数据一致性。

## 2. 修改数据层前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响 App、NodeAgent、Backend、Admin 或 Worker
- [ ] PostgreSQL 与 Redis 的事实源边界是否明确
- [ ] 是否需要迁移、回滚、补偿任务或缓存重建
- [ ] 是否影响支付、权益、配置、节点状态、收益或审计

## 3. 必须更新文档的场景

- 新增、删除、重命名表或字段
- 修改索引、唯一约束、外键、枚举状态
- 新增 Redis key、TTL、Pub/Sub channel、Stream 或分布式锁
- 改变 DB / Redis 写入顺序
- 新增 outbox、补偿任务、缓存重建策略

## 4. 完成标准

- [ ] `docs/contracts/data-consistency.md` 已更新或确认无需更新
- [ ] 迁移 up/down 或人工回滚方案明确
- [ ] Redis key、TTL、失效策略和重建方式明确
- [ ] 幂等键、唯一约束和重复/乱序处理已说明
- [ ] DB 成功 Redis 失败、DB 失败 Redis 成功的兜底路径已验证

## 5. 必读文档

- `docs/contracts/data-consistency.md`
- `docs/data/redis-key-registry.md`
- `docs/data/DB_MIGRATION_PLAN.md`
- `docs/data/outbox-compensation.md`
- `docs/architecture/LiveMask_数据库详细设计_v3.6.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`
- `docs/development/ROLE_READINESS_ASSESSMENT.md`
