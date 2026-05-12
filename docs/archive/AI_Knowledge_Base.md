# LiveMask AI 知识库（AI_Knowledge_Base.md）

> **目的**：为 AI 提供项目核心上下文，减少幻觉，提高输出一致性。  
> **使用方式**：每次新对话或切换大模块时，让 AI 先阅读本文件。

## 1. 项目核心目标
LiveMask 是一个**极致稳定、抗审查、合伙人共赢**的商业 VPN 服务。核心竞争力在于：
- 多协议热切换（Reality + Hysteria2）
- 质量驱动的节点激励体系
- 推广大使 + C2C + 忠诚度深度绑定
- 强安全与反审查能力

## 2. 核心架构原则（必须严格遵守）

### 后端
- 严格分层：Handler → Service → Repository
- 所有可配置项必须走 `system_configs` 表（JSONB）
- 定时任务统一使用 `gocron` 或 `robfig/cron`
- 关键业务事件必须通过消息队列（Redis Streams / RabbitMQ）解耦

### 客户端（Flutter）
- **Connection Orchestrator** 是大脑，sing-box 只负责传输
- 所有决策（健康检查、协议切换、端口选择、重连策略）必须在 Dart 层
- iOS NetworkExtension 必须保持极简
- 配置更新必须经过 Hash 校验 + 自动回滚

### 安全
- 禁止记录用户真实访问内容
- 所有敏感接口必须有签名 + Timestamp + Nonce
- 客户端本地敏感数据使用 `flutter_secure_storage`

## 3. 重要技术约束

| 领域           | 约束                                      | 原因 |
|----------------|-------------------------------------------|------|
| 配置管理       | 所有可变参数走 `system_configs`           | 支持热更新 |
| VPN 引擎       | sing-box 只做传输，决策在 Dart            | 降低平台耦合 |
| iOS 扩展       | 内存严格控制，逻辑尽量放在主 App          | 避免被系统终止 |
| Traceability   | 所有代码必须关联 TASK-XXXX                | 可追溯 + 审计 |
| C2C + 支付     | 交易成功后必须触发忠诚度更新 + 大使佣金   | 商业闭环 |

## 4. 常用模块与推荐文档

- **推广大使收益**：`LiveMask_收益模型优化建议_v3.6.md`
- **VPN 客户端架构**：`LiveMask_VPN客户端与sing-box集成架构设计_v3.6.md`
- **配置热更新**：`LiveMask_配置热更新详细设计_v3.6.md`
- **威胁狩猎**：`LiveMask_威胁狩猎引擎详细设计_v3.6.md`
- **支付 + C2C**：`LiveMask_USDT支付接入文档_v3.6.md` + API 详细规格
- **开发规范**：`LiveMask_AI辅助开发工作流与规范_v3.6.md`

## 5. 常见模式

- 配置热更新：使用 Redis Pub/Sub + 版本 Hash 校验
- 节点质量评分：EWMA + 异常检测
- 忠诚度加成：每月定时任务计算被邀请用户加权平均
- 通知推送：Redis Streams + Worker + Telegram/Email

## 6. 禁止事项

- 禁止在代码中硬编码任何可变参数
- 禁止在客户端记录用户真实流量内容
- 禁止 iOS Extension 中实现复杂业务逻辑
- 禁止跳过 DoD 直接认为任务完成

---

**本文件为活文档，重要架构变更后必须同步更新。**
