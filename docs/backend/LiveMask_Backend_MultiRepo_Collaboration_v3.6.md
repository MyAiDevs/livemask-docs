# LiveMask Backend 多仓库协作规范 (Multi-Repository Collaboration)

> 本文档主要说明 Backend 开发者在多仓库环境中（特别是使用 AI 编辑器同时打开多个项目窗口时）应该如何与 NodeAgent、App 等其他端进行协作。

## 1. 核心原则

1. **所有变更必须关联 `TASK-XXXX`**
   - 代码注释、Commit Message、PR 描述中都必须包含 `TASK-XXXX`

2. **修改 Backend 时必须主动分析对 NodeAgent 和 App 的影响**
   - 不能只改一端就提交

3. **配置变更必须先在 `livemask-docs` 中记录影响范围**
   - 特别是 FeatureFlag、配置热更新、支付风控规则等

4. **代码注释必须清晰且包含 TASK-XXXX**
   - 关键函数、重要逻辑、接口变更处都要写

## 2. 多窗口开发时的协作流程

### 开发前必做
- 确认当前正在处理的 `TASK-XXXX`
- 检查本次变更可能影响到哪些仓库（NodeAgent / App / Payment）
- 如果涉及配置或 FeatureFlag，先在 `livemask-docs` 中记录影响范围

### 开发中必做
- 修改接口或核心逻辑时，在代码注释中明确说明对其他端的影响
- 重要变更后，同步更新 `livemask-docs` 中相关文档

### 提交前必做
- Commit Message 必须包含 `TASK-XXXX`
- PR 描述中说明本次变更对 NodeAgent 和 App 的影响

## 3. 常见变更类型及处理方式

### 接口变更
- 必须评估对 NodeAgent 调用方式的影响
- 必须评估对 App 端调用的影响
- 在代码注释中写明影响范围 + TASK-XXXX

### 配置热更新 / FeatureFlag 变更
- 必须先在 `livemask-docs` 中记录本次配置变更的影响范围
- NodeAgent 端是否需要重启或重新加载配置
- 是否影响 Degraded Mode 行为

### 支付相关变更
- 必须评估对支付回调、风控规则的影响
- 是否需要同步更新 NodeAgent 端的支付相关逻辑

## 4. 多窗口开发时的注意事项

- 修改 Backend 时，建议同时打开 `livemask-nodeagent` 和 `livemask-app` 窗口进行对比
- 重要变更后，建议让 AI 在其他端窗口中检查是否需要同步调整
- 配置类变更建议先在 `livemask-docs` 中记录，再通知其他端开发者

## 5. 可追溯性要求

- 关键函数、接口、重要逻辑块上方必须写清楚用途 + `TASK-XXXX`
- Commit Message 建议格式：`feat(backend): xxx (TASK-BE-023)`
- PR 描述中必须说明本次变更对其他端的影响

---

**Related Rules**:
- [13-Multi-Repo-Development.md](../../ai-rules/v3.7/13-Multi-Repo-Development.md)
- [14-Code-Comment-Traceability.md](../../ai-rules/v3.7/14-Code-Comment-Traceability.md)
- [15-MultiWindow-Consistency-Checklist.md](../../ai-rules/v3.7/15-MultiWindow-Consistency-Checklist.md)