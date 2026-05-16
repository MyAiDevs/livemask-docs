# API Contract

- [Core MVP API Contracts](core-mvp.md)
- [Health Check API](health-check.md)
- [Config Center API](config-center.md)
- [Auth / Account / RBAC API](auth-rbac.md)

## 1. 适用范围

本目录记录 Backend 对外部调用方暴露的契约，包括：

- App Client API
- NodeAgent API
- Admin API
- WebSocket / Realtime API
- Payment Webhook 接入点

## 2. API 变更模板

```markdown
## TASK-XXXX - <接口名称或变更标题>

- Owner：
- 调用方：App / NodeAgent / Admin / Payment Provider
- 服务方：Backend
- 状态：Draft / Active / Deprecated / Removed
- 兼容级别：Backward compatible / Breaking change

### Endpoint

- Method：
- Path：
- Auth：
- Idempotency：

### Request

| 字段 | 类型 | 必填 | 默认值 | 说明 | 兼容策略 |
| --- | --- | --- | --- | --- | --- |

### Response

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |

### Error Codes

| 错误码 | HTTP 状态 | 用户可见 | App 行为 | NodeAgent 行为 |
| --- | --- | --- | --- | --- |

### Cross-Repo Impact

- App：
- NodeAgent：
- Admin：
- Database：
- Monitoring：

### Validation

- [ ] Contract test
- [ ] App integration check
- [ ] NodeAgent integration check
- [ ] Backward compatibility check
- [ ] Rollback verified
```

## 3. Breaking Change 规则

Breaking change 必须满足：

- 提前登记迁移窗口
- 明确旧字段废弃周期
- App / NodeAgent 至少一端具备兼容逻辑
- PR 中贴出契约 diff 和验证结果
