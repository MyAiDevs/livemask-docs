# LiveMask Backend API 变更影响分析规范

> 本文档说明 Backend 接口变更时，如何进行跨仓库影响分析以及多窗口开发时的协作流程。

## 1. 核心原则

- 所有接口变更必须关联 `TASK-XXXX`
- 修改 Backend 接口时，必须主动分析对 NodeAgent 和 App 的影响
- 重要变更必须在 `livemask-docs` 中记录影响范围

## 2. 接口变更影响分析流程

### 变更前必做事项

- [ ] 确认当前 `TASK-XXXX`
- [ ] 列出受影响的仓库（Backend / NodeAgent / App / Payment）
- [ ] 是否需要同步更新 `livemask-docs` 中的接口文档
- [ ] 是否影响 NodeAgent 的配置同步或 Degraded Mode
- [ ] 是否影响 App 端的调用方式

### 变更后必做事项

- [ ] 在代码注释中明确写入 `TASK-XXXX` 和影响范围
- [ ] 更新 `livemask-docs` 中相关文档
- [ ] 通知相关开发者并说明影响
- [ ] 更新测试用例和文档

## 3. 多窗口开发时的特别要求

当同时打开 `livemask-backend` 和 `livemask-nodeagent` 等仓库时：

- 修改接口后，必须检查 NodeAgent 是否需要同步调整
- 重要变更建议先在 `livemask-docs` 中记录影响范围
- Commit Message 必须包含 `TASK-XXXX`

## 4. 示例

```go
// UpdatePaymentStatus updates the payment status
// TASK-BE-045: 支付状态更新接口，影响 NodeAgent 配置同步和 App 端回调
func (s *PaymentService) UpdatePaymentStatus(...) error {
    // ...
}
```