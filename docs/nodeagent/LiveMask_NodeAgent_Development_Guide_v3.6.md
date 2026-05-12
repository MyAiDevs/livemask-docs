# LiveMask NodeAgent 开发指南 v3.6

## 1. 核心职责
- 作为 VPN 节点的核心代理进程
- 负责 sing-box 的生命周期管理（启动、热更新、降级、优雅退出）
- 实时上报节点质量、流量、告警
- 执行远程诊断指令
- 支持配置热更新和密钥轮换

## 2. 与其他仓库的联动关系

### 与 Backend 的联动
- 通过 HTTP API 接收配置下发和远程指令
- 上报心跳、质量评分、流量统计
- 支持 degraded mode 状态同步

### 与 App 的联动
- App 通过 Backend 获取最新节点列表和配置
- NodeAgent 的质量评分直接影响 App 的节点推荐结果

## 3. 开发注意事项（多窗口开发时特别重要）

当同时在 backend 和 nodeagent 窗口开发时：
- 修改 Backend 的配置下发逻辑 → 必须同步检查 NodeAgent 的 ConfigManager 是否兼容
- 修改 NodeAgent 的上报字段 → 必须同步更新 Backend 的接收和存储逻辑
- 所有变更必须关联同一个 TASK-XXXX

## 4. 关键模块
- ConfigManager（配置热更新 + 回滚）
- SingboxController（sing-box 生命周期控制）
- Reporter（质量与流量上报）
- DiagnosticsService（远程诊断执行）

## 5. 安全要求
- 二进制必须使用 garble 混淆 + UPX 压缩
- 所有与 Backend 的通信必须使用 mTLS + HMAC 签名
- 禁止在生产环境暴露调试端口