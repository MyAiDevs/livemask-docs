# Error Codes Contract

> 统一错误码决定 App 展示、NodeAgent 重试、Backend 告警和客服排查方式。

## 1. 错误码格式

推荐格式：

```text
<DOMAIN>_<CATEGORY>_<REASON>
```

示例：

- `AUTH_TOKEN_EXPIRED`
- `CONFIG_VERSION_CONFLICT`
- `PAYMENT_WEBHOOK_SIGNATURE_INVALID`
- `NODE_DEGRADED_REPORT_REJECTED`

## 2. 错误码登记模板

| Error Code | HTTP | 用户可见 | App 行为 | NodeAgent 行为 | 是否告警 | Owner | TASK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `CONFIG_VERSION_CONFLICT` | 409 | 否 | 重新拉取配置 | 强制刷新配置 | 否 | Backend | `TASK-NA-CONFIG-003` |

## 3. 行为分类

- `retryable`：调用方可以自动重试。
- `user_action_required`：需要用户操作，例如重新登录或重新支付。
- `operator_action_required`：需要运营或客服介入。
- `fatal`：不可恢复，必须进入降级或阻断流程。

## 4. 变更规则

- 新增错误码必须说明调用方行为。
- 修改错误码含义视为 breaking change。
- 删除错误码必须说明替代错误码。
- 支付、安全、权限错误必须记录审计和告警策略。

## Payment Errors

| Error Code | HTTP | 用户可见 | App 行为 | NodeAgent 行为 | 是否告警 | Owner | TASK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `PAYMENT_PROVIDER_UNAVAILABLE` | 503 | 是 | 提示稍后重试 | N/A | P1 | Payment | `TASK-P1-01` |
| `PAYMENT_WEBHOOK_SIGNATURE_INVALID` | 400 | 否 | N/A | N/A | P0 | Payment | `TASK-P1-01` |
| `PAYMENT_STATUS_CONFLICT` | 409 | 否 | 刷新订单状态 | N/A | P1 | Backend | `TASK-P1-01` |
| `ENTITLEMENT_GRANT_FAILED` | 500 | 是 | 提示支付处理中，稍后刷新 | N/A | P0 | Backend | `TASK-P1-01` |

## Node / Config Errors

| Error Code | HTTP | 用户可见 | App 行为 | NodeAgent 行为 | 是否告警 | Owner | TASK |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `CONFIG_KEY_NOT_FOUND` | 404 | 否 | 使用缓存 / 上报异常 | 使用 last-known-good | 否 | Backend | `TASK-P0-03` |
| `CONFIG_SCHEMA_INVALID` | 400 | 否 | 拒绝应用 / 上报异常 | 拒绝应用并上报 `config_apply_failed` | P1 | Backend | `TASK-P0-03` |
| `CONFIG_VERSION_CONFLICT` | 409 | 否 | 重新拉取配置 | 强制刷新配置 | 否 | Backend | `TASK-P0-03` |
| `CONFIG_NOT_PUBLISHED` | 404 | 否 | 使用缓存 | 使用 last-known-good | P1 | Backend | `TASK-P0-03` |
| `CONFIG_REDIS_SYNC_FAILED` | 202/500 | 否 | 继续轮询 | 继续轮询 | P1 | Backend / Ops | `TASK-P0-03` |
| `CONFIG_HASH_MISMATCH` | 422 | 否 | 回滚 last-known-good | 回滚 last-known-good | P1 | Backend | `TASK-P1-05` |
| `NODE_REPORT_DUPLICATE` | 200 | 否 | N/A | 停止重试该 report_id | 否 | Backend | `TASK-P3-01` |
| `NODE_DEGRADED_REPORT_REJECTED` | 400 | 否 | N/A | 修正 payload 后重试 | P1 | NodeAgent | `TASK-P1-05` |
| `RECOMMENDATION_STALE_STATE` | 503 | 是 | 使用 last-known-good 或稍后重试 | N/A | P1 | Backend | `TASK-P2-05` |
| `CONNECT_CONFIG_SESSION_EXPIRED` | 401 | 是 | 重新请求 connect-config | N/A | 否 | Backend | `TASK-VPN-CONFIG-001` |
| `CONNECT_CONFIG_SESSION_REVOKED` | 403 | 是 | 重新请求推荐 | N/A | P1 | Backend | `TASK-VPN-CONFIG-001` |
| `CONNECT_CONFIG_NODE_UNAVAILABLE` | 503 | 是 | 请求 fallback 节点 | N/A | P1 | Backend | `TASK-VPN-CONFIG-001` |
| `CONNECT_CONFIG_INVALID_PROTOCOL` | 400 | 否 | 上报协议不兼容 | N/A | P2 | Backend | `TASK-VPN-CONFIG-001` |
