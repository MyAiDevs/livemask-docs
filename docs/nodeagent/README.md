# NodeAgent 文档入口

## 1. 职责范围

`livemask-nodeagent` 负责节点侧配置拉取、任务执行、状态上报、降级模式和与 Backend 的协同。

## 2. 修改 NodeAgent 前必须确认

- [ ] 当前变更关联 `TASK-XXXX`
- [ ] 是否影响 Backend 配置下发或状态接收
- [ ] 是否影响 App 可见状态、连接质量或错误反馈
- [ ] 是否影响降级模式、重试、断线恢复或本地缓存
- [ ] 是否需要新增监控、日志或审计字段

## 3. 必须更新文档的场景

- 配置字段、默认值、刷新周期变化
- 上报字段、心跳、健康检查变化
- 降级模式、重试策略、任务执行策略变化
- 与 Backend API 的兼容策略变化

## 4. 完成标准

- [ ] Backend 兼容性已确认
- [ ] 旧配置和异常配置处理已确认
- [ ] 降级模式行为已说明
- [ ] 验证结果写入 PR 或任务记录

## 5. 架构文档索引

- [NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md](NODEAGENT_PROTOCOL_EXTENSION_ARCHITECTURE.md) — 多协议扩展架构（ProtocolProfile 接口、SecretRef、Renderer dispatch、HealthCheck hook、路线图）
- [PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md](PROTOCOL_PROFILE_DEVELOPMENT_GUIDE.md) — 协议插件开发指南（实现步骤、测试要求、安全审查清单）
