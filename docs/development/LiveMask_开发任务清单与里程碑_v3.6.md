# LiveMask 开发任务清单与里程碑 v3.6（最终细化版）

**版本**：v3.6 最终细化版 + AI 工作流增强版  
**更新日期**：2026-05-10  
**状态**：已与所有 v3.6 核心文档完全对齐，并引入 AI 辅助开发闭环规范

> **重要说明**：本任务清单已与《LiveMask_AI辅助开发工作流与规范_v3.6.md》深度绑定。
> 所有开发必须严格遵守 Task ID traceability 规则。

---

## 1. 角色定义

- **Backend Lead**：后端技术负责人，负责架构、核心业务闭环、定时任务
- **Backend Dev**：后端开发工程师
- **Client Lead**：Flutter 客户端技术负责人，负责整体客户端架构与 iOS/Android 协调
- **Flutter Dev (Android)**：负责 Android + Desktop 客户端开发
- **Flutter Dev (iOS)**：负责 iOS NetworkExtension + sing-box 集成
- **Frontend Dev**：Admin 后台前端开发
- **DevOps**：部署、CI/CD、监控、基础设施
- **QA**：测试与质量保障
- **Product**：产品经理，负责需求确认与交互细节

---

## 2. 开发阶段与详细任务拆解

### Phase 0：基础设施与核心框架（第 1~2 周）

**目标**：搭建稳定可扩展的基础环境

| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 当前分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 | 备注/风险 |
|---------|----------|----------------|--------|----------|--------|------|------|
| P0-01 | 数据库 Schema 落地 | 1. 执行完整 DDL（含 C2C、notification、vpn_client_governance 表）<br>2. 创建所有索引与约束<br>3. 编写 Seed 数据与迁移脚本 | Backend Dev | 2天 | P0 | - | 已完成 | `dev/P0-01-db-schema` | `a1b2c3d`, `e4f5g6h` | 已通过 | Backend Lead | 2026-05-12 | 示例数据（已完成，可作为模板参考） |
| P0-02 | 后端项目骨架搭建 | 1. Go 项目结构 + Gin + GORM + PostgreSQL + Redis<br>2. 统一 Response + ErrorCode 体系<br>3. JWT + 请求签名中间件 | Backend Lead | 3天 | P0 | P0-01 | 进行中 | `dev/P0-02-backend-skeleton` | `f7g8h9i` | 单元测试通过 | - | - | 正在进行中（示例） |
| P0-03 | 配置中心核心实现 | 1. system_configs 表 CRUD + JSONB 管理<br>2. 配置版本 + Hash 生成与校验<br>3. Redis Pub/Sub + 客户端拉取接口 | Backend Lead | 4天 | P0 | P0-01 | 待开始 |
| P0-04 | Docker Compose 基础编排 | 1. API + Worker 服务编排<br>2. PostgreSQL + Redis + Sentry 自托管<br>3. 环境变量与健康检查配置 | DevOps | 3天 | P0 | - | 待开始 |
| P0-05 | Flutter 项目初始化 | 1. 多平台项目结构 + Riverpod 架构<br>2. 依赖注入 + 路由管理<br>3. 基础安全模块（Certificate Pinning、Secure Storage） | Client Lead | 4天 | P0 | - | 待开始 |
| P0-06 | sing-box 集成准备 | 1. Android VPNService 基础封装<br>2. iOS NetworkExtension Target 创建<br>3. Desktop TUN 基础实现 | Client Lead | 5天 | P0 | P0-05 | 待开始 |

**里程碑 M0**：基础设施就绪，后端可启动，Flutter 项目可运行（第 2 周末）

---

### Phase 1：后端核心业务闭环（第 3~6 周）—— 最关键阶段

**目标**：完成支付、C2C、推广大使、威胁狩猎核心闭环

| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 当前分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 | 备注/风险 |
|---------|----------|----------------|--------|----------|--------|------|------|
| P1-01 | USDT 支付完整集成 | 1. NOWPayments 创建订单 + Webhook 签名验证<br>2. 支付订单状态机 + 幂等性处理<br>3. 支付成功后触发忠诚度更新 | Backend Dev | 6天 | P0 | P0-03 | 待开始 | - | - | - | - | - | 推荐从此任务开始实践 Traceability 流程 |
| P1-02 | C2C 积分市场完整实现 | 1. c2c_listings / c2c_trades / c2c_disputes 表与接口<br>2. 创建挂单、执行交易、争议流程<br>3. 交易成功后触发平台补贴 + 大使佣金 | Backend Dev | 7天 | P0 | P1-01 | 待开始 |
| P1-03 | 推广大使收益引擎 | 1. Tier 匹配 + 忠诚度加成计算（UpdateAffiliateLoyaltyStats）<br>2. 平台保护系数 + C2C 来源佣金计算<br>3. 边界情况处理（取消订阅、免费区流量） | Backend Lead | 5天 | P0 | P1-02 | 待开始 |
| P1-04 | 威胁狩猎 + Quarantine 闭环 | 1. 规则引擎 JSON 定义与执行<br>2. 命中后自动创建 appeal（source=system_hunting）<br>3. 7天观察期 + 状态流转 + 节点联动 | Backend Lead | 6天 | P0 | P0-03 | 待开始 |
| P1-05 | 配置热更新完整闭环 | 1. 版本控制 + Hash 校验 + 失败回滚<br>2. 多实例一致性保障<br>3. vpn_client_governance 动态下发 | Backend Dev | 4天 | P0 | P0-03 | 待开始 |
| P1-06 | 通知推送系统 | 1. Telegram Bot + Email 发送服务<br>2. 消息队列 + 模板渲染 + 限流<br>3. 关键事件（支付、C2C、Quarantine）触发通知 | Backend Dev | 5天 | P1 | P0-03 | 待开始 |

**里程碑 M1**：支付 + C2C + 推广大使 + 威胁狩猎核心闭环跑通（第 6 周末）

---

### Phase 2：客户端安全 + VPN 基础能力（第 3~7 周，与 Phase 1 并行）

**目标**：完成客户端安全框架 + Android/Desktop 基础连接能力

| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 当前分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 | 备注/风险 |
|---------|----------|----------------|--------|----------|--------|------|------|
| P2-01 | 客户端安全体系落地 | 1. Certificate Pinning + 请求签名 + 防重放<br>2. Flutter 混淆 + 本地敏感数据加密<br>3. 配置热更新 + Hash 校验 + 自动回滚 | Client Lead | 6天 | P0 | P0-05 | 待开始 |
| P2-02 | Connection Orchestrator 核心 | 1. 健康检查 + 多协议热切换<br>2. 多高位端口轮询 + 加权选择<br>3. 自动重连 + Circuit Breaker + vpn_client_governance 应用 | Client Lead | 7天 | P0 | P2-01 | 待开始 |
| P2-03 | Android + Desktop VPN 实现 | 1. Android VPNService 完整封装<br>2. Desktop TUN 实现<br>3. sing-box 配置动态生成 | Flutter Dev (Android) | 8天 | P0 | P2-02 | 待开始 |
| P2-04 | iOS NetworkExtension 基础 | 1. PacketTunnelProvider 生命周期管理<br>2. App Group + Darwin Notification 通信<br>3. sing-box iOS 集成准备 | Flutter Dev (iOS) | 6天 | P0 | P0-06 | 待开始 |
| P2-05 | 节点推荐与过滤 | 1. GEOIP + 质量评分 + Quarantine/FreeZone 过滤<br>2. 动态资源治理配置应用 | Flutter Dev | 4天 | P0 | P2-02 | 待开始 |
| P2-06 | Sentry 日志上报集成 | 1. Sentry Flutter SDK 集成<br>2. 崩溃、连接异常、ANR 上报 + Breadcrumbs 埋点<br>3. 隐私过滤（beforeSend） | Flutter Dev | 3天 | P1 | P2-01 | 待开始 |

**里程碑 M2**：Android + Desktop 客户端可稳定连接节点（第 7 周末）

---

### Phase 3：业务闭环打通 + iOS 攻坚（第 7~10 周）

**目标**：完成连接质量上报、快速反馈、完整业务闭环 + iOS 可用

| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 当前分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 | 备注/风险 |
|---------|----------|----------------|--------|----------|--------|------|------|
| P3-01 | App 上报连接质量 | 1. `POST /client/vpn/report-connection-quality` 接口<br>2. 后台聚合 + 影响节点质量评分（低权重） | Flutter Dev + Backend Dev | 4天 | P0 | P2-05 | 待开始 |
| P3-02 | 节点快速反馈闭环 | 1. `POST /client/nodes/quick-feedback` 接口<br>2. 自动创建低优先级 appeal + 短期降分逻辑 | Flutter Dev + Backend Dev | 3天 | P0 | P3-01 | 待开始 |
| P3-03 | iOS sing-box 深度集成 | 1. PacketTunnelProvider 稳定实现 + 资源治理<br>2. 与 Flutter 主 App 通信 + 配置热更新<br>3. 系统版本兼容性处理 | Flutter Dev (iOS) | 9天 | P0 | P2-04 | 待开始 |
| P3-04 | 完整业务闭环打通 | 1. C2C 交易成功 → 佣金发放 + 忠诚度更新<br>2. 支付成功 → 通知 + 忠诚度更新<br>3. Quarantine 变更 → 配置热更新 | Backend Lead | 5天 | P0 | M1, P3-02 | 待开始 |
| P3-05 | Admin 后台核心页面 | 1. 推广大使管理、C2C 争议处理、Quarantine 复核<br>2. RBAC 权限矩阵落地 | Frontend Dev | 7天 | P0 | P1-03 | 待开始 |

**里程碑 M3**：核心业务闭环（支付 + C2C + 推广 + 反馈）全部跑通（第 10 周末）

---

### Phase 3.5：积分经济体系（第 8~11 周，与 Phase 3 并行）

### Phase 3.6：用户全生命周期运营闭环（新增 - P0）

**目标**：补齐新用户激活和留存两大核心闭环。

**关键任务**：
- TASK-OP-016：实现新用户 Onboarding 引导流程（App端4步引导 + 任务系统）
- TASK-OP-017：实现智能节点推荐 + 首次连接成功检测闭环
- TASK-OP-018：实现 Churn 风险评分 + 自动干预策略引擎
- TASK-OP-019：实现 Win-back 活动配置与转化追踪
- TASK-OP-020：建设「系统健康度大盘」（激活率、Churn、degraded节点等核心指标）

### Phase 3.7：生产稳定性保障（新增 - P0）

**目标**：补齐 Secret 管理和灾备两大生产稳定性短板。

**关键任务**：
- TASK-OP-021：引入 HashiCorp Vault（或 AWS Secrets Manager）统一管理所有 Secret
- TASK-OP-022：实现关键密钥自动轮换机制（JWT、NodeAgent通信Key等）
- TASK-OP-023：制定 DR Plan（RTO=4h，RPO=1h）并完成首次灾备演练
- TASK-OP-024：建立每月定期灾备演练机制 + 复盘流程
- TASK-OP-025：实现 Secret 到期自动告警 + 轮换前置通知

### Phase 3.8：高级可观测性与 SLO（新增 - P1）

**目标**：从基础监控升级到业务可观测性。

**关键任务**：
- TASK-OP-026：定义核心业务 SLO（连接成功率、支付成功率、配置下发成功率等）
- TASK-OP-027：引入 OpenTelemetry 实现分布式链路追踪
- TASK-OP-028：建立 Error Budget 管理机制
- TASK-OP-029：建设「系统健康度大盘」（见 Phase 3.6）

**Admin 节点详情可观测性闭环（TASK-ADMIN-NODE-DETAIL-OBSERVABILITY-FIX-001）已完成**
| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 关联分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 |
|---------|----------|----------------|--------|----------|--------|------|------|----------|-------------|----------|--------|----------|
| ADMIN-OBS-003 | 节点详情可观测性三数据管线 | 1. Latest Logs 区块（useNodeLogs → `GET /admin/api/v1/nodes/{id}/logs`）<br>2. Node Metrics 区块（useNodeMetricSummary → `GET /admin/api/v1/nodes/{id}/metrics-summary`）<br>3. Protocol Capabilities 区块（useNodeProtocolCapabilities → `GET /admin/api/v1/protocol/nodes/{id}/capabilities`）<br>4. RBAC 守卫（node:read + logs:read/metrics:read，admin/super_admin 提升）<br>5. Mock fallback 降级模式 | Frontend Dev | 2天 | P0 | ADMIN-LOGS-001 | ✅ 已完成 | `task/TASK-ADMIN-OBSERVABILITY-LOGS-001` | `132ce09` | 45+52 tests passed | — | 2026-05-19 |

**Backend 待实现**：
- `GET /admin/api/v1/nodes/{node_id}/logs`
- `GET /admin/api/v1/nodes/{node_id}/metrics-summary`
- `GET /admin/api/v1/protocol/nodes/{node_id}/capabilities`
- NodeAgent heartbeat 需上报 Protocol Capabilities 到 `node_protocol_capabilities` 表

**目标**：完成积分 earning、消费、C2C 交易、后台配置、定时任务、风控的完整闭环

| 任务 ID     | 任务名称                              | 具体子任务拆解                                                                 | 负责人          | 预计工期 | 优先级 | 依赖          | 状态     | 备注 |
|-------------|---------------------------------------|--------------------------------------------------------------------------------|-----------------|----------|--------|---------------|----------|------|
| P3.5-01    | 积分数据库表落地                      | 1. 创建 points_balances / points_transactions / points_c2c_listings / points_c2c_trades 表<br>2. 编写迁移脚本 + 索引优化<br>3. 与 user_subscriptions 表关联 | Backend Dev    | 2天     | P0     | P0-01        | 待开始   | - |
| P3.5-02    | 积分 earning 核心服务                 | 1. Node 贡献积分计算（按流量 + 质量）<br>2. 购买套餐赠送积分逻辑<br>3. 推广大使从被邀请用户消费中获得积分 | Backend Dev    | 4天     | P0     | P3.5-01      | 待开始   | 需支持配置读取 |
| P3.5-03    | 积分消费（购买套餐）实现              | 1. 支持积分全额 / 部分支付订阅<br>2. 积分扣减 + 余额校验 + 幂等处理<br>3. 与订阅状态机联动 | Backend Dev    | 3天     | P0     | P3.5-02      | 待开始   | - |
| P3.5-04    | C2C 积分交易完整流程                  | 1. 创建挂单、购买、取消、平台抽成逻辑<br>2. 风控规则（每日限额、价格偏离检测、KYC）<br>3. 交易成功后积分划转 + USDT 结算 | Backend Lead   | 6天     | P0     | P3.5-03      | 待开始   | 含异常处理与熔断 |
| P3.5-05    | Admin 积分经济配置页面                | 1. React + shadcn/ui 配置表单实现<br>2. 实时影响模拟 + 保存到 system_configs<br>3. 配置变更审计日志 | Frontend Dev   | 4天     | P0     | P3.5-01      | 待开始   | - |
| P3.5-06    | 积分相关定时任务                      | 1. 每日积分统计任务<br>2. 积分过期处理任务<br>3. 每日风控数据重置任务 | Backend Dev    | 3天     | P0     | P3.5-04      | 待开始   | 使用 Asynq |
| P3.5-07    | 积分单元测试与集成测试                | 1. earning / spend / C2C 核心逻辑单元测试（表驱动）<br>2. 风控规则测试用例<br>3. 与申诉系统集成测试 | QA + Backend Dev | 4天   | P0     | P3.5-06      | 待开始   | 覆盖率要求 ≥ 85% |
| P3.5-08    | 积分与现有系统集成                    | 1. 与质量申诉追溯调整联动<br>2. 与订阅生命周期（取消订阅后积分处理）联动<br>3. 与通知系统集成 | Backend Lead   | 3天     | P0     | P3.5-07      | 待开始   | - |

**里程碑 M3.5**：积分经济体系（earning + 消费 + C2C + 配置 + 定时任务）完整跑通（第 11 周末）

---

### Phase 4：前端 Admin + 运营能力（第 9~11 周）

**目标**：完成运营后台核心功能

| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 当前分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 | 备注/风险 |
|---------|----------|----------------|--------|----------|--------|------|------|
| P4-01 | Admin 技术架构与权限 | 1. Next.js + shadcn/ui + Zustand + TanStack Query<br>2. RBAC 权限控制 + 配置热更新实时刷新 | Frontend Dev | 5天 | P0 | P3-05 | 待开始 |
| P4-02 | 核心运营页面开发 | 1. 推广大使收益与忠诚度管理<br>2. C2C 市场监控与争议处理<br>3. 节点质量与 Free Zone 配置 | Frontend Dev | 6天 | P0 | P4-01 | 待开始 |
| P4-03 | 通知与定期汇报 | 1. Telegram Bot 管理后台<br>2. 每日/每周简报生成与模板管理 | Backend Dev | 4天 | P1 | P1-06 | 待开始 |
| P4-04 | 官网基础建设 | 1. 官网框架搭建 + SEO<br>2. 下载页 + 节点地图基础版 | Frontend Dev | 5天 | P1 | - | 待开始 |

**里程碑 M4**：运营后台核心可用（第 11 周末）

---

### Phase 5：测试、部署、上线准备（第 10~12 周）

**目标**：完成测试、监控、部署，准备正式上线

| 任务 ID | 任务名称 | 具体子任务拆解 | 负责人 | 预计工期 | 优先级 | 依赖 | 状态 | 当前分支 | 关联 Commit | 测试状态 | 验证人 | 落地日期 | 备注/风险 |
|---------|----------|----------------|--------|----------|--------|------|------|
| P5-01 | 集成测试与 E2E 测试 | 1. 支付 + C2C + 推广大使完整流程测试<br>2. VPN 连接 + 协议切换 + Quarantine 场景测试 | QA + All Dev | 6天 | P0 | M3 | 待开始 |
| P5-02 | 性能压测与调优 | 1. 配置热更新、佣金计算、C2C 交易压测<br>2. 根据压测结果调整 vpn_client_governance 默认值 | Backend Lead + DevOps | 5天 | P0 | P5-01 | 待开始 |
| P5-03 | 监控告警完善 | 1. 关键业务指标告警规则<br>2. Sentry + 日志聚合 + 链路追踪 | DevOps | 4天 | P0 | P2-06 | 待开始 |
| P5-04 | 部署与 CI/CD 完善 | 1. Docker Compose / K8s 生产配置<br>2. 蓝绿部署 + 回滚策略<br>3. 密钥管理与备份 | DevOps | 5天 | P0 | P0-04 | 待开始 |
| P5-05 | 上线准备 | 1. 隐私政策、用户协议、审核材料<br>2. 灰度发布计划 | Product + All Lead | 4天 | P0 | P5-04 | 待开始 |

**里程碑 M5**：系统可正式上线（第 12 周末）

---

## 3. 关键里程碑总结

| 里程碑 | 时间点 | 核心目标 | 验收标准 | 主要负责人 |
|--------|--------|----------|----------|------------|
| **M0** | 第 2 周末 | 基础设施就绪 | 后端可启动、Flutter 项目可运行、数据库结构完整 | Backend Lead + Client Lead |
| **M1** | 第 6 周末 | 支付 + C2C + 推广闭环跑通 | USDT 支付成功、C2C 交易完成、大使可获得佣金 | Backend Lead |
| **M2** | 第 7 周末 | Android + Desktop 客户端可用 | 可稳定连接节点、协议热切换正常、安全框架完整 | Client Lead |
| **M3** | 第 10 周末 | 核心业务闭环全部打通 | 连接质量上报、快速反馈、Quarantine 联动完成 | Backend Lead + Client Lead |
| **M4** | 第 11 周末 | 运营后台核心可用 | Admin 可管理推广大使、C2C 争议、节点质量 | Frontend Dev |
| **M5** | 第 12 周末 | 系统可正式上线 | 通过集成测试、监控告警完善、部署就绪 | All Lead |

---

## 4. 风险与缓解措施

| 风险 | 影响程度 | 缓解措施 | 负责人 |
|------|----------|----------|--------|
| iOS NetworkExtension + sing-box 集成不稳定 | 高 | 优先完成 Android + Desktop；iOS 作为第二阶段攻坚，预留 Fallback 方案 | Client Lead |
| C2C + 支付业务边界情况复杂 | 中 | Phase 1 重点打通主流程，边界情况在 Phase 3 补充完善 | Backend Lead |
| 前端 Admin 交互细节不足 | 中 | 先搭建架构 + 核心页面，产品同步补充高保真交互稿 | Frontend Dev + Product |
| 配置热更新在高并发场景下的稳定性 | 中 | 做好版本控制 + 失败回滚 + 灰度发布机制 | Backend Lead + DevOps |

---

**本任务清单已与以下 v3.6 核心文档完全对齐**：
- LiveMask_系统设计文档_v3.6.md
- LiveMask_技术架构文档_v3.6.md
- LiveMask_API详细规格_v3.6.md
- LiveMask_数据库详细设计_v3.6.md
- LiveMask_App客户端开发与加密安全规范_v3.6.md
- LiveMask_VPN客户端与sing-box集成架构设计_v3.6.md
- LiveMask_收益模型优化建议_v3.6.md
- LiveMask_通知推送与汇报系统设计_v3.6.md
- LiveMask_部署架构与CI_CD方案_v3.6.md

---

**文档状态**：最终细化版，可直接用于项目 Kickoff 和任务分配。
---

## Phase 3.8 & Phase 5.2 最终细化（2026-05 补充）

**本次补充目标**：针对全局审核中剩余的三大弱闭环进行代码级闭环补齐。

### Phase 3.8：用户长期留存预警智能化模块（完整代码包已交付）

| 任务编号 | 任务名称 | 子任务 | 预计工期 | 建议负责人 | 依赖 | 验收标准 | 状态 |
|----------|----------|--------|----------|------------|------|----------|------|
| TASK-LR-01 | 用户行为特征提取 + 风险评分引擎 | 实现时序特征提取 + 动态规则引擎 | 5天 | Backend | - | 风险分计算准确，支持规则热更新 | 已规划 |
| TASK-LR-02 | 自动挽回动作执行器 + 效果追踪 | 实现分级Win-back策略 + 7天回流追踪 | 4天 | Backend | LR-01 | 高风险用户自动触发挽留动作并记录效果 | 已规划 |
| TASK-LR-03 | 每日定时任务 + 预警效果看板 | 实现scheduler + 回流率统计API | 3天 | Backend + Frontend | LR-02 | 每日自动运行 + 可视化看板 | 已规划 |

**里程碑 M3.8**：留存预警智能化模块上线，预警干预后回流率可追踪。

### Phase 5.2：生产自动化建设（完整代码包已交付）

| 任务编号 | 任务名称 | 子任务 | 预计工期 | 建议负责人 | 依赖 | 验收标准 | 状态 |
|----------|----------|--------|----------|------------|------|----------|------|
| TASK-PR-05 | Secret 管理 + 密钥轮换 | Vault集成 + NodeAgent优雅轮换 | 5天 | Backend | - | 密钥30天自动轮换且不影响连接 | 已规划 |
| TASK-PR-06 | 灾备演练自动化框架 | drill.go 支持dry-run + 自动报告 | 4天 | DevOps | - | 可定期执行并生成Markdown报告 | 已规划 |
| TASK-PR-07 | SLO Error Budget 自动行动闭环 | 消耗超阈值时自动降权 + 创建工单 | 4天 | Backend | - | Error Budget消耗>80%自动触发安全动作 | 已规划 |
| TASK-PR-08 | 配置变更自动验证 + 回滚 | 健康检查 + 失败一键回滚 | 3天 | Backend | - | 配置失败可自动回滚 | 已规划 |

**里程碑 M5.2**：生产自动化核心能力上线，通过一次完整灾备演练验证。

**完整代码包下载路径**：`/home/workdir/artifacts/code_modules/live-mask-closedloop-modules-v3.6.tar.gz`

**Go Module 集成方式**：详见包内 README.md 和系统设计文档对应章节。

