# 14 - Code Comment Traceability (v3.7)

> 目标：让每一次关键代码变更都能从代码、提交、PR 和文档追溯回同一个 `TASK-XXXX`。

## 1. 适用范围

以下变更必须写入可追溯注释：

- API 契约、请求/响应字段、错误码或状态机变化
- 支付、风控、权限、配置热更新、降级模式相关逻辑
- 跨 App Client、Backend API、NodeAgent、Database 的数据流变化
- 兼容旧版本、迁移数据、补偿任务、幂等保护等非显而易见逻辑

## 2. 注释格式

推荐格式：

```text
TASK-XXXX: <为什么需要这段逻辑>；影响范围：<App/Backend/NodeAgent/Database/Payment>；闭环验证：<验证方式>
```

## 3. 必填信息

每条关键注释至少包含：

- `TASK-XXXX`
- 业务原因或兼容原因
- 影响范围
- 验证方式或关联文档路径

## 4. 禁止行为

- 只写 `fix bug`、`temporary`、`TODO`，但没有 `TASK-XXXX`
- 在不同仓库使用不同 TASK 描述同一项跨仓库变更
- 用注释替代文档更新

## 5. 完成标准

- [ ] 关键逻辑注释包含 `TASK-XXXX`
- [ ] commit message 与代码注释中的 TASK 一致
- [ ] PR 描述说明跨仓库影响
- [ ] 文档中的影响范围与实际代码一致
- [ ] 没有遗留未归属的 TODO/兼容逻辑
