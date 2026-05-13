# LiveMask TODO 闭环登记表 v3.7

> 目标：把文档和示例代码中尚未落地的 TODO 收束到可追踪 TASK，避免“知道有坑但没有归属”。

## 1. 处理规则

- 新增 TODO 必须关联 `TASK-XXXX`。
- 示例代码里的 TODO 如果只是教学占位，必须标记为 `Example placeholder`。
- 生产路径相关 TODO 必须登记影响范围、Owner、验收标准和后续 TASK。
- 关闭 TODO 时必须更新对应文档或删除占位说明。

## 2. 当前发现项

| 来源 | 原始 TODO | 归属 TASK | 影响范围 | 闭环动作 |
| --- | --- | --- | --- | --- |
| `docs/nodeagent/LiveMask_NodeAgent代码示例集合_v3.6.md` | sing-box HTTP API 健康检查 | `TASK-NA-HEALTH-001` | NodeAgent / Backend monitoring | 明确健康检查接口、超时、失败上报和降级策略 |
| `docs/nodeagent/LiveMask_NodeAgent代码示例集合_v3.6.md` | ConfigManager HTTP 客户端、节点 ID、版本号 | `TASK-NA-CONFIG-001` | NodeAgent / Backend config | 补齐配置拉取结构、认证、版本协商和错误处理 |
| `docs/nodeagent/LiveMask_NodeAgent代码示例集合_v3.6.md` | 从后端拉取初始配置 | `TASK-NA-CONFIG-001` | NodeAgent / Backend config | 与 ConfigManager 任务合并验收 |
| `docs/nodeagent/LiveMask_NodeAgent代码示例集合_v3.6.md` | 版本校验、签名校验、内容校验 | `TASK-NA-CONFIG-002` | NodeAgent / Security | 增加配置签名、hash 校验、回滚策略 |
| `docs/nodeagent/LiveMask_NodeAgent代码示例集合_v3.6.md` | DegradedMode 上报 Backend + Reporter | `TASK-NA-DEGRADED-001` | NodeAgent / Backend / Monitoring | 定义上报接口、节流、恢复事件和告警 |
| `docs/nodeagent/LiveMask_NodeAgent代码示例集合_v3.6.md` | 与后端比对版本号 | `TASK-NA-CONFIG-003` | NodeAgent / Backend config | 明确版本比对、强制刷新和兼容策略 |
| `docs/nodeagent/LiveMask_一键安装脚本_install.sh_v3.6.md` | 上传安装日志接口 | `TASK-NA-INSTALL-001` | NodeAgent / Backend ops | 定义日志上传 API、脱敏、重试和失败提示 |
| `docs/backend/LiveMask_FeatureFlag系统_Go实现与Admin前端_v3.6.md` | 更复杂 targeting rules | `TASK-BE-FLAG-001` | Backend / Admin / App | 定义规则 DSL、灰度对象、审计和回滚 |
| `docs/nodeagent/LiveMask_NodeAgent架构与开发规范_v3.6.md` | fatal error channel 上报 | `TASK-NA-RUNTIME-001` | NodeAgent / Monitoring | 定义致命错误分类、退出码、上报和自动恢复策略 |
| `docs/archive/LiveMask_节点申诉接口Go实现_v3.6.md` | 发布消息到队列或调用收益重算 | `TASK-BE-APPEAL-001` | Backend / Payment / Revenue | 明确申诉通过后的收益重算链路和幂等策略 |

## 3. 完成标准

- [ ] 每个 TODO 都有 TASK 归属
- [ ] 每个 TASK 有 Owner、影响范围和验收标准
- [ ] 涉及生产路径的 TODO 不再只停留在示例代码注释中
- [ ] PR 中说明本次关闭或新增的 TODO 项
