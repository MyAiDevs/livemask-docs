# LiveMask NodeAgent 多窗口开发指南

> 本文档主要说明 NodeAgent 在使用 AI 编辑器同时开发多个仓库时的注意事项和协作规范。

## 1. 核心原则

- NodeAgent 的任何重要配置变更都必须在 `livemask-docs` 中记录影响范围
- 与 Backend 的配置同步机制必须清晰
- Degraded Mode 触发时必须向 Backend 发送通知
- 所有代码变更必须包含 `TASK-XXXX`

## 2. 与 Backend 的协作流程

### 配置同步
- NodeAgent 启动时必须从 Backend 获取最新配置
- 配置热更时，NodeAgent 必须支持无重启加载
- 重要配置变更后必须更新 `livemask-docs` 中的对应文档

## 3. Degraded Mode 处理

- Degraded Mode 触发时必须向 Backend 发送通知
- Backend 推荐引擎必须根据 NodeAgent 状态调整策略
- 多窗口开发时，修改 Degraded Mode 逻辑必须同时检查 Backend 侧影响

## 4. TASK-XXXX 可追溯性要求

- 所有重要函数和配置加载逻辑必须添加 `TASK-XXXX` 注释
- Commit Message 必须包含 `TASK-XXXX`
- PR 描述中必须说明对 Backend 的影响

## 5. 多窗口开发注意事项

- 同时打开 `livemask-docs` + `livemask-backend` + `livemask-nodeagent`
- 修改配置相关代码前，必须先检查 Backend 侧是否有相应变更
- Degraded Mode 相关修改后，必须同时更新 Backend 推荐策略文档

## 6. 与其他仓库的联动关系

- Backend 推荐引擎配置
- App 端连接质量上报逻辑
- 支付相关配置与 Backend 保持一致

---

**注意**：本文档主要面向使用 AI 编辑器进行多窗口开发的场景。