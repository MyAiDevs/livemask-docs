# LiveMask 技术架构文档 v3.6（最终闭环版）

## 1. 整体技术架构
- 前端/客户端：Flutter + sing-box
- 后端服务：Go + PostgreSQL + Redis
- 节点代理：Docker + sing-box
- 通知系统：Telegram Bot + Email（通过消息队列解耦）

## 2. 关键后台定时任务
- `UpdateAffiliateLoyaltyStats`（每月1号）
- `ThreatHuntingEngine`（每15分钟）
- `FreeZoneBandwidthEnforcer`（每5分钟）
- `ScheduledReportGenerator`（每日/每周生成简报并推送）

## 3. 事件驱动通知架构
```
业务事件（Threat Hunting 命中 / 配置更新失败 / Tier 变更等）
        ↓
消息队列（Redis Streams / RabbitMQ）
        ↓
Notification Service
        ↓
模板渲染 + Telegram Bot / Email 发送
        ↓
notification_logs 记录发送结果
```

## 4. 配置热更新 + 容错机制
- 版本 + Hash 校验
- 失败自动回滚

## 5. 高并发限流与部署架构
- **限流策略**：API 层使用 Token Bucket + Redis 分布式限流；通知发送使用队列 + Token Bucket（Telegram ~30条/秒）。
- **部署架构**：详见《LiveMask_部署架构与CI_CD方案_v3.6.md》
- **CI/CD**：GitHub Actions + ArgoCD（GitOps），支持 Blue-Green / Canary 部署。
- 多实例一致性保障（Pub/Sub + 拉取补偿）

## 5. 数据库主要变更
- 新增 `notification_templates`、`notification_subscriptions`、`notification_logs` 表
- `appeals` 表增加 `source` 字段支持系统狩猎
- `nodes` 表增加 `is_free_zone`、`bandwidth_limit_mbps`
- 新增 `node_quality_logs`、`node_traffic_logs` 表（节点监控大盘使用）

## 6. NodeAgent 详细设计

NodeAgent 的完整架构、模块划分、自研采集实现、配置管理、编译加密、开发规范等详细内容，请参考独立文档：

**《LiveMask_NodeAgent架构与开发规范_v3.6.md》**

该文档为 NodeAgent 的**唯一权威文档**，包含：
- 整体架构与数据流
- 自研采集模块详细设计与代码示例
- 与后端 API 的交互规范
- 编译混淆与反逆向方案
- 开发注意事项与性能优化建议

本技术架构文档仅保留高层次说明，不再重复详细实现内容。

## 7. 节点推荐引擎架构（Recommendation Engine）

### 7.1 整体架构定位
推荐引擎是 LiveMask 的核心智能组件，负责为用户推荐最优 VPN 节点。它与以下模块深度联动：
- App Client：发起推荐请求 + 上报连接结果
- Backend API：推荐服务 + 实时反馈接收
- NodeAgent：上报节点实时质量（负载、延迟、成功率）
- Database：用户偏好、推荐日志、节点质量数据
- Monitoring：推荐成功率、节点负载分布、冷启动效果

### 7.2 推荐引擎优化策略（已同步）
详细的多目标加权评分模型、实时反馈闭环、个性化推荐、探索与利用平衡、负载控制、冷启动优化等策略，请参考《LiveMask_系统设计文档_v3.6.md》 **3.3.9 节点推荐引擎优化策略**。

本技术架构文档重点说明其在整体架构中的位置与数据流。

### 7.3 核心数据流
```
App Client 
   ↓ 请求推荐（user_id + location + subscription_tier + history）
Backend Recommendation Service
   ↓ 1. 查询 user_node_preferences（个性化权重）
   ↓ 2. 查询 nodes + node_quality_logs（实时质量）
   ↓ 3. 多目标加权评分 + Epsilon-Greedy 探索
   ↓ 4. 负载均衡 + 多样性控制
   ↓ 返回 Top N 节点 + 推荐理由
App Client 
   ↓ 用户选择节点连接
NodeAgent 
   ↓ 上报连接结果（成功/失败 + 延迟 + 协议）
Backend 
   ↓ 更新 user_node_preferences（成功率权重）
   ↓ 记录 recommendation_logs
   ↓ 触发实时反馈闭环（下次推荐优化）
```

### 7.4 与 Feature Flag 联动
推荐策略权重、探索比例、个性化开关均通过 Feature Flag 动态下发，支持 A/B 测试和新策略灰度发布。

### 7.5 部署与扩展
- 推荐服务独立部署（可水平扩展）
- 热点数据（节点质量、用户偏好）使用 Redis 缓存
- 推荐日志异步写入（避免阻塞推荐请求）
- 支持多租户/多区域推荐策略隔离
