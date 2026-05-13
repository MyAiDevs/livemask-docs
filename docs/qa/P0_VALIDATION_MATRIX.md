# P0 Validation Matrix

> P0 任务必须覆盖正向、失败、重复、乱序、旧版本、回滚和可观测性。

## 1. 配置中心 / 热更新

| Case | 角色 | 步骤 | 预期 |
| --- | --- | --- | --- |
| Config publish success | Backend / NodeAgent / App | 发布新配置并拉取 | version/hash 一致 |
| Pub/Sub lost | Backend / NodeAgent | 不发送通知，仅轮询 | 最终获取新版本 |
| Invalid config | Backend / NodeAgent / App | 发布非法值 | 拒绝应用，回滚 last-known-good |
| Redis write failure | Backend / Ops | 模拟 Redis 写失败 | DB 保留事实，触发告警和补偿 |

## 2. Node 推荐与 App 反馈

| Case | 角色 | 步骤 | 预期 |
| --- | --- | --- | --- |
| Healthy recommendation | App / Backend | 请求推荐 | 返回 active 且非 stale 节点 |
| Stale Redis node | Backend | Redis 状态超过 TTL | 不推荐该节点 |
| App fallback | App | 首选节点失败 | 自动尝试次优节点并上报 |
| Duplicate quality report | App / Backend | 同 request_id 重发 | accepted true, duplicate true |

## 3. NodeAgent 上报

| Case | 角色 | 步骤 | 预期 |
| --- | --- | --- | --- |
| Normal report | NodeAgent / Backend | 上报 report_id | DB 写入，Redis 实时状态更新 |
| Duplicate report | NodeAgent / Backend | 重复 report_id | 不重复聚合 |
| Out-of-order report | NodeAgent / Backend | sequence 倒序 | 不覆盖较新实时状态 |
| Offline batch retry | NodeAgent / Backend | 离线缓存后补报 | 幂等入库 |

## 4. USDT 支付

| Case | 角色 | 步骤 | 预期 |
| --- | --- | --- | --- |
| Create order | App / Backend | 创建支付订单 | 返回支付地址 |
| Invalid signature | Payment / Backend | 伪造 webhook | 400 + P0/P1 告警 |
| Duplicate webhook | Payment / Backend | 重复 finished | 权益只发一次 |
| Out-of-order webhook | Payment / Backend | finished 后 failed | 不回退 finished |
| Entitlement failure | Backend / Ops | 模拟权益发放失败 | outbox retry + P0 告警 |

## 5. Release / Ops

| Case | 角色 | 步骤 | 预期 |
| --- | --- | --- | --- |
| Migration dry run | DevOps / DB | staging 执行迁移 | 成功或有回滚方案 |
| Smoke test | QA / Ops | 部署后跑 smoke | API、Redis、DB、Worker 正常 |
| Rollback dry run | DevOps | 回滚 API 和 migration | 服务恢复 |
| Alert sample | SRE | 触发样例告警 | 告警有 Owner 和恢复条件 |

## 6. 发布门禁

- [ ] 所有 P0 case 有证据。
- [ ] P0/P1 Open 风险有缓解方案。
- [ ] 回滚步骤演练通过。
- [ ] Product 验收标准可测试。
- [ ] Support 话术和升级路径已准备。
