# Config Contract

## 1. 适用范围

本目录记录所有跨端配置契约：

- Backend system configs
- FeatureFlag
- NodeAgent runtime config
- App remote config
- App runtime governance config for performance/resource/reconnect tuning
- Payment / Risk Control rules

Primary App runtime governance contract:

- [App Runtime Governance Config Contract](../app/APP_RUNTIME_GOVERNANCE_CONFIG_CONTRACT.md)

## 2. 配置项模板

```markdown
## TASK-XXXX - <config.key>

- Owner：
- 状态：Draft / Active / Deprecated / Removed
- 生效端：Backend / NodeAgent / App / Admin
- 数据类型：
- 默认值：
- 是否可热更新：
- 是否需要重启：
- 安全级别：Public / Internal / Secret

### Schema

```json
{
  "key": "example.key",
  "value": {}
}
```

### Compatibility

- 旧版本行为：
- 缺省值行为：
- 非法值行为：
- 降级模式行为：

### Rollback

- 回滚方式：
- 回滚后预期状态：
- 需要人工介入：

### Monitoring

- 指标：
- 告警：
- 日志字段：

### Validation

- [ ] Backend config validation
- [ ] NodeAgent reload validation
- [ ] App parsing validation
- [ ] Rollback validation
```

## 3. 配置变更铁律

- 禁止新增没有默认值的跨端配置。
- 禁止没有回滚策略的配置热更新。
- Secret 不得出现在客户端可见配置中。
- NodeAgent 和 App 必须能处理未知字段。
