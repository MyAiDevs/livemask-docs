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
