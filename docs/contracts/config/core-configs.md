# Core MVP Config Contracts

## `client.remote_config`

- Owner：Backend / App
- 状态：Active
- 生效端：App
- 数据类型：JSON object
- 默认值：`{}`
- 是否可热更新：Yes
- 是否需要重启：No
- 安全级别：Public

Schema:

```json
{
  "schema_version": "1.0",
  "connection": {
    "recommendation_ttl_seconds": 60,
    "fallback_max_attempts": 3
  },
  "feature_flags": {
    "quick_feedback_enabled": true,
    "connection_quality_report_enabled": true
  }
}
```

Compatibility:

- 旧版本行为：未知字段忽略。
- 缺省值行为：使用 App 内置默认值。
- 非法值行为：拒绝应用并回滚到 last-known-good。
- 降级模式行为：使用本地缓存配置并提示可能过期。

## `nodeagent.runtime_config`

- Owner：Backend / NodeAgent
- 状态：Active
- 生效端：NodeAgent
- 数据类型：JSON object
- 默认值：见 schema
- 是否可热更新：Yes
- 是否需要重启：Only when transport ports changed
- 安全级别：Internal

Schema:

```json
{
  "schema_version": "1.0",
  "reporting": {
    "heartbeat_interval_seconds": 60,
    "batch_upload_interval_seconds": 300,
    "max_offline_buffer_items": 10000
  },
  "degraded_mode": {
    "enabled": true,
    "auto_recover": false
  },
  "singbox": {
    "health_check_timeout_seconds": 5
  }
}
```

Compatibility:

- 旧版本行为：NodeAgent 忽略未知字段。
- 缺省值行为：使用内置安全默认值。
- 非法值行为：拒绝应用，上报 `config_apply_failed`。
- 降级模式行为：继续使用 last-known-good。

### sing-box server 配置关系

NodeAgent 的 `nodeagent.runtime_config` 下发后，NodeAgent 将其转换为 sing-box server 运行时配置。

与 connect_config 的关系：

| 角色 | 持有配置 | 包含 node_secret |
| --- | --- | --- |
| Backend | 完整节点配置 + node_secret hash | 是 |
| NodeAgent | `/internal/agent/config` 下发完整 sing-box server 配置含 `node_secret` | 是 |
| App | `connect-config` API 返回的 session-bound 临时凭据 | **否** |

sing-box server 配置中与 connect_config 对应的字段：

```text
sing-box server inbounds[].type          ← connect_config.server.protocol
sing-box server inbounds[].listen        ← 服务端监听地址（不由 App 决定）
sing-box server inbounds[].listen_port   ← connect_config.server.port
sing-box server inbounds[].tls.server_name     ← connect_config.tls.server_name
sing-box server inbounds[].tls.reality.public_key  ← connect_config.tls.server_public_key
sing-box server inbounds[].users[].uuid   ← connect_config.credentials.uuid（仅匹配）
```

NodeAgent 不向 connect_config 写入任何字段。App 的 connect_config 是 Backend 根据用户 session 生成的下行数据。

## `payment.usdt_nowpayments`

- Owner：Payment / Backend
- 状态：Active
- 生效端：Backend
- 数据类型：JSON object
- 默认值：disabled
- 是否可热更新：Partial
- 是否需要重启：Secret rotation may require restart
- 安全级别：Secret

Schema:

```json
{
  "enabled": false,
  "api_base_url": "https://api.nowpayments.io",
  "ipn_callback_url": "",
  "supported_currencies": ["usdttrc20"],
  "min_paid_ratio": 0.99
}
```

Secret fields must come from Secret Manager or environment:

- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`

## `recommendation.strategy.default`

- Owner：Backend / Product
- 状态：Active
- 生效端：Backend
- 数据类型：JSON object
- 默认值：见 schema
- 是否可热更新：Yes
- 是否需要重启：No
- 安全级别：Internal

Schema:

```json
{
  "geo_distance": 0.25,
  "node_quality": 0.3,
  "load_balance": 0.15,
  "user_success_rate": 0.2,
  "freshness": 0.1,
  "degraded_penalty": 0.8,
  "stale_state_ttl_seconds": 120
}
```

Validation:

- 权重总和应为 1.0。
- `degraded_penalty` 必须大于 0 小于等于 1。
- stale Redis state 超过 TTL 不得参与健康推荐。
