# Health Check API

> Lightweight probe endpoint for CI smoke, staging monitoring, and load balancer health checks.
> 不写入 PostgreSQL，仅检测 DB / Redis 连接状态并返回。

## GET `/api/v1/health`

- Caller：CI smoke / staging monitoring / load balancer / App startup
- Auth：
  - staging / monitoring: no auth（内网或受控来源）
  - production: 可限制内网、网关或监控来源
- Idempotency：N/A（无副作用）

### Request

无参数。

### Response 200 — ok

```json
{
  "status": "ok",
  "version": "1.0.0",
  "db_connected": true,
  "redis_connected": true,
  "uptime_seconds": 12345,
  "timestamp": "2026-05-16T12:00:00Z"
}
```

### Response 200 — degraded

DB 或 Redis 之一不可达。

```json
{
  "status": "degraded",
  "version": "1.0.0",
  "db_connected": false,
  "redis_connected": true,
  "uptime_seconds": 12345,
  "timestamp": "2026-05-16T12:00:00Z"
}
```

### Response 200 — down

DB 和 Redis 均不可达。

```json
{
  "status": "down",
  "version": "1.0.0",
  "db_connected": false,
  "redis_connected": false,
  "uptime_seconds": 12345,
  "timestamp": "2026-05-16T12:00:00Z"
}
```

### 设计约束

| 约束 | 说明 |
| --- | --- |
| 无 DB 写入 | Health 端点为高频探活（CI / 监控 / LB），不写入 `health_check_logs` 表 |
| 连接池隔离 | DB / Redis 连接检测应使用独立短连接或 `PING` 命令，不污染业务连接池 |
| 超时控制 | 检测超时应控制在 3s 内，超时视为对应连接不可达 |
| 版本来源 | `version` 从构建时注入或环境变量读取，不得硬编码 |
| 响应缓存 | 不应在 API 层缓存响应，每次请求应反映实时连接状态 |

### 使用场景

| 场景 | Caller | 期望行为 |
| --- | --- | --- |
| CI integration test | `livemask-backend` CI | 启动 postgres + redis → 调用 Health API → 校验 `"status": "ok"` |
| Staging smoke | `livemask-ci-cd` smoke | 启动 docker-compose → 调用 Health API → 校验 DB / Redis 连通 |
| App 启动诊断 | `livemask-app` | 启动时调用 Health API → 展示连接状态或提示网络问题 |
| Backend 健康检查 | 网关 / LB | 返回 `"status": "ok"` 时视为健康节点 |
