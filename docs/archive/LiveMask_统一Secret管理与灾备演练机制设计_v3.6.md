# LiveMask 统一 Secret 管理与灾备演练机制设计 v3.6

**创建日期**：2026-05-10  
**优先级**：P0（生产稳定性关键）

## 1. 统一 Secret 管理方案

### 推荐技术选型
- **HashiCorp Vault**（强烈推荐，生产级）
- 备选：AWS Secrets Manager / Azure Key Vault（如果已在对应云平台）

### 整体架构
- Vault 作为唯一 Secret 来源
- 所有服务（Backend、NodeAgent、Admin、定时任务）通过 Vault Agent 或 SDK 动态获取 Secret
- 支持自动密钥轮换（尤其是 node_secret、JWT signing key、数据库密码等）

### 关键 Secret 分类与轮换策略

| Secret 类型              | 轮换频率     | 影响范围          | 轮换方式                  |
|--------------------------|--------------|-------------------|---------------------------|
| node_secret              | 每 90 天     | 单个 Sponsor 节点 | 后台触发 + NodeAgent 热更新 |
| JWT Signing Key          | 每 180 天    | 所有用户          | 双 Key 滚动更新           |
| 数据库密码               | 每 90 天     | 后端服务          | 应用重启 + 连接池刷新     |
| Redis / MQ 密码          | 每 180 天    | 后端服务          | 滚动重启                  |
| 第三方支付 API Key       | 按需         | 支付模块          | 人工 + 双 Key 验证        |

### Go 集成示例（Backend）
```go
// 使用 hashicorp/vault/api
client, err := vault.NewClient(vault.DefaultConfig())
secret, err := client.Logical().Read("secret/data/live-mask/jwt-signing-key")
// 动态获取 + 缓存 + 自动续期
```

### NodeAgent 集成
- NodeAgent 启动时通过 Vault Agent Sidecar 或 Init Container 获取 node_secret
- 支持运行时 Secret 热更新（通过 ConfigManager）

---

## 2. 灾备与备份恢复演练机制（DR Plan）

### RTO / RPO 目标
- **RTO**（恢复时间目标）：核心服务 < 2 小时，全量恢复 < 8 小时
- **RPO**（恢复点目标）：数据库 < 15 分钟，日志 < 5 分钟

### 备份策略

| 数据类型           | 备份方式               | 频率     | 保留策略          | 存储位置          |
|--------------------|------------------------|----------|-------------------|-------------------|
| PostgreSQL         | pg_dump + WAL archiving| 每小时全量 + 持续 WAL | 30 天在线 + 1 年归档 | S3 + 异地副本     |
| Redis              | RDB + AOF              | 每 15 分钟 | 7 天              | S3                |
| 对象存储（图片、日志） | 跨区域复制           | 实时     | 按需              | 多区域 S3         |
| 配置与代码         | Git + Terraform        | 每次变更 | 永久              | Git + 镜像仓库    |

### 定期演练计划（必须执行）
- **每月**：数据库恢复演练（从备份恢复到测试环境）
- **每季度**：全量灾备切换演练（模拟主区域故障）
- **每年**：完整 DR 演练 + 报告输出

### 演练 Checklist（示例）
- [ ] 从 S3 恢复 PostgreSQL 到备用集群
- [ ] 验证 NodeAgent 能否正常连接新数据库
- [ ] 验证 Feature Flag、收益计算任务正常运行
- [ ] 验证实时 WebSocket 服务可用
- [ ] 记录 RTO/RPO 实际达成情况并改进

---

## 3. 与现有系统的联动

- Secret 变更后自动触发相关服务重启或热更新
- 灾备恢复后自动触发 NodeAgent 重新注册与配置同步
- 演练结果自动生成报告并通知运维群

---

**文档状态**：已完成，可直接用于开发与运维团队参考。