# LiveMask NodeAgent 与 Backend 配置同步机制

> 本文档说明 NodeAgent 与 Backend 之间的配置同步机制，以及在多窗口开发时的协作规范。

## 1. 核心原则

- NodeAgent 的配置以 Backend 下发为主
- 所有配置变更必须关联 `TASK-XXXX`
- 配置热更新必须先在 `livemask-docs` 中记录影响范围
- 多窗口开发时，修改配置相关代码必须同时检查 Backend 和 NodeAgent 两端

## 2. 配置同步机制

### 2.1 启动时同步
- NodeAgent 启动后主动向 Backend 请求最新配置
- Backend 返回当前版本号 + 配置内容
- NodeAgent 校验版本号后应用配置

### 2.2 热更新流程
1. Backend 修改配置后，通过配置中心或消息队列通知 NodeAgent
2. NodeAgent 收到通知后拉取最新配置
3. 应用新配置前进行校验
4. 应用成功后上报状态给 Backend

### 2.3 配置版本管理
- 每次配置变更必须生成新版本号
- NodeAgent 必须记录当前使用的配置版本
- 降级时可回退到上一个可用版本

## 3. 多窗口开发注意事项

- 在 `livemask-backend` 修改配置相关代码时，必须同步检查 `livemask-nodeagent` 是否需要调整
- 配置结构变更时，必须更新 `livemask-docs` 中的对应文档
- 所有配置变更的代码注释必须包含 `TASK-XXXX`

## 4. 常见问题处理

- 配置下发失败：NodeAgent 应保留上一次可用配置，并上报告警
- 版本不一致：以 Backend 返回的最新版本为准
- 热更新失败：NodeAgent 应回退到上一个稳定版本

## 5. TASK 可追溯性要求

所有与配置同步相关的代码变更，必须满足：
- 关键函数上方添加注释，包含用途和 `TASK-XXXX`
- Commit Message 必须包含 `TASK-XXXX`
- 如涉及多端联动，PR 描述中需说明影响范围
