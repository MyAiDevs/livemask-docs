# Redis Key Registry

> Redis key 必须有 Owner、TTL、事实源和重建策略。禁止无 TTL 的临时状态 key。

| Key Pattern | 类型 | Owner | TTL | Source of Truth | 重建策略 |
| --- | --- | --- | --- | --- | --- |
| `config:{config_key}` | string/json | Backend | 10 min | PostgreSQL `system_configs` | cache miss 从 DB 读取 |
| `config:version:{config_key}` | string | Backend | 10 min | PostgreSQL `system_configs` | cache miss 从 DB 读取 |
| `node:realtime:{node_id}` | hash/json | NodeAgent / Backend | 180 sec | NodeAgent latest report + DB history | 从最近 DB 心跳重建 |
| `node:degraded:{node_id}` | string/json | NodeAgent / Backend | 180 sec | DB latest node status | 从 DB status 和 quality logs 重建 |
| `recommendation:user:{user_id}` | json | Backend | 60 sec | Computed from DB + Redis realtime | 重新计算 |
| `node:penalty:{node_id}` | numeric | Backend | 30 min | App feedback / Admin action | 过期或 Admin 清除 |
| `rate_limit:{scope}:{id}` | counter | Backend | 1-60 min | Redis only | 可丢失 |
| `idempotency:{scope}:{key}` | string | Backend | 24 h | DB unique key when critical | DB 查重或重新计算 |
| `outbox:stream:{domain}` | stream | Backend | retention 7 days | PostgreSQL outbox | 从 outbox 重放 |
| `ws:pubsub:node_status` | pubsub | Backend | N/A | PostgreSQL / Redis realtime | 丢失后客户端刷新 |

## 失效规则

- 节点状态变化：删除 `recommendation:user:*` 相关短缓存，更新 `node:realtime:{node_id}`。
- 配置变化：更新 `config:*`，发布 `config.published`。
- 支付成功：删除用户权益缓存，发布 `entitlement.granted`。
- 快速反馈：写入 `node:penalty:{node_id}`，短期影响推荐。

## 禁止事项

- 支付、权益、订阅状态不得只存在 Redis。
- 无 TTL 的业务缓存必须有书面例外说明。
- Redis Stream 消费者必须幂等。
