# Event Contract

## 1. 适用范围

本目录记录异步事件和消息契约：

- Payment webhook normalized events
- Subscription lifecycle events
- NodeAgent status / degraded events
- Appeal / quarantine events
- Points / revenue recalculation events
- Notification events

## 2. 事件模板

```markdown
## TASK-XXXX - <event.name>

- Owner：
- Producer：
- Consumer：
- Delivery：Queue / Webhook / PubSub / Cron
- Ordering：
- Idempotency key：
- Retry policy：
- Dead letter policy：

### Payload

| 字段 | 类型 | 必填 | 说明 | 兼容策略 |
| --- | --- | --- | --- | --- |

### Semantics

- 触发条件：
- 不触发条件：
- 幂等规则：
- 重放规则：

### Cross-Repo Impact

- Backend：
- NodeAgent：
- App：
- Admin：
- Monitoring：

### Validation

- [ ] Producer test
- [ ] Consumer test
- [ ] Retry test
- [ ] DLQ test
- [ ] Audit trail check
```

## 3. 事件变更规则

- 新增字段必须向后兼容。
- 删除字段必须有迁移期。
- Consumer 必须忽略未知字段。
- 事件必须能通过 `TASK-XXXX` 和业务 ID 串联审计。
