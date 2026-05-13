# Role Readiness Assessment

> 本文档评估不同开发角色是否已经具备“可独立开工、可交接、可验证、可回滚”的文档条件。结论必须同时看角色自身文档和与其他角色的逻辑链。

## 1. 就绪判定标准

一个角色达到 Ready，必须同时满足：

- 有角色入口 README。
- 有该角色必须阅读的文档包。
- 有输入条件：谁交给他什么。
- 有输出证据：他交给下游什么。
- 有阻断条件：什么情况下不能继续。
- 有回流路径：发现问题回到哪个角色。
- 有 DoD：完成标准可测试。
- 有契约或数据一致性规则支撑。

## 2. 总体结论

| 角色 | 就绪状态 | 主要入口 | 结论 |
| --- | --- | --- | --- |
| Product | Ready | `docs/product/README.md` | 范围、验收、灰度、复盘条件已具备 |
| App Client | Ready | `docs/app/README.md` | API、错误码、本地缓存、fallback 条件已具备 |
| NodeAgent | Ready | `docs/nodeagent/README.md` | 配置同步、上报、degraded、补报条件已具备 |
| Backend / API | Ready | `docs/backend/README.md` | API、状态机、幂等、数据一致性入口已具备 |
| Database / Redis | Ready | `docs/data/README.md` | 事实源、缓存、队列、幂等、补偿规则已具备 |
| Admin / Frontend | Ready | `docs/admin/README.md` | 配置编辑、高风险操作、审计与权限条件已具备 |
| Payment | Ready | `docs/payment/README.md` | 状态机、Webhook、对账、人工补单条件已具备 |
| Security | Ready | `docs/security/README.md` | Secret、权限、审计、失败阻断条件已具备 |
| Operations / DevOps | Ready | `docs/operations/README.md` | 部署、回滚、告警、灾备条件已具备 |
| Monitoring / SRE | Ready | `docs/monitoring/README.md` | 指标、告警、Dashboard、恢复验证条件已具备 |
| QA | Ready | `docs/qa/README.md` | 验收、E2E、失败路径、质量门禁条件已具备 |
| Support / Business Ops | Ready | `docs/support/README.md` | 客服、运营解释、人工介入和复盘条件已具备 |

## 3. 角色文档包

### Product

必须阅读：

- `docs/product/README.md`
- `docs/development/tasks/TASK-TEMPLATE.md`
- `docs/development/ROLE_HANDOFF_CHAINS.md`
- `docs/development/DEFINITION_OF_DONE.md`

必须产出：

- In Scope / Out of Scope
- 可测试验收标准
- 灰度范围和观察窗口
- 客服/运营说明
- 范围外后续 TASK

阻断条件：

- 验收标准不可测试。
- 没有明确业务指标或观察窗口。
- 涉及价格、权益、支付、隐私但没有通知相关角色。

### App Client

必须阅读：

- `docs/app/README.md`
- `docs/contracts/api/README.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/data-consistency.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

必须产出：

- 成功、失败、取消、重试、fallback 用户路径
- 本地缓存和 last-known-good 行为
- 未知字段、未知错误码兜底行为
- 截图或 E2E 验证证据

阻断条件：

- API 错误码未定义 App 行为。
- 旧版本或本地缓存迁移未说明。
- 用户无法理解失败、支付中、节点降级或权益未到账状态。

### NodeAgent

必须阅读：

- `docs/nodeagent/README.md`
- `docs/contracts/config/README.md`
- `docs/contracts/events/README.md`
- `docs/contracts/data-consistency.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

必须产出：

- `report_id`、`sequence`、时间窗口、配置版本字段说明
- 离线缓存和补报策略
- degraded 触发、恢复、上报和告警行为
- 配置旧版本、非法值、缺省值处理结果

阻断条件：

- 上报无法幂等去重。
- degraded 只存在本地，Backend / Ops 不可见。
- 配置失败时没有 last-known-good 或回滚行为。

### Backend / API

必须阅读：

- `docs/backend/README.md`
- `docs/contracts/api/README.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/state-machines.md`
- `docs/contracts/data-consistency.md`

必须产出：

- API contract diff
- 错误码与调用方行为
- DB / Redis 写入顺序
- 幂等键、审计字段、状态流转
- 回滚和补偿任务说明

阻断条件：

- 修改 API 但没有调用方兼容策略。
- 写 DB / Redis 的局部失败没有兜底。
- 状态机不能处理重复、乱序或补偿。

### Database / Redis

必须阅读：

- `docs/data/README.md`
- `docs/contracts/data-consistency.md`
- `docs/architecture/LiveMask_数据库详细设计_v3.6.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

必须产出：

- 迁移 up/down 或回滚策略
- 索引、约束、唯一键和幂等键说明
- Redis key、TTL、失效策略
- 缓存重建和 outbox / queue 补偿方案

阻断条件：

- 支付、权益、订阅等强一致状态以 Redis 为事实源。
- Redis key 无 TTL 且无重建策略。
- 迁移不可回滚且没有人工修复方案。

### Admin / Frontend

必须阅读：

- `docs/admin/README.md`
- `templates/CONFIG_CHANGE_RECORD.md`
- `docs/contracts/api/README.md`
- `docs/development/ROLE_HANDOFF_CHAINS.md`

必须产出：

- 表单字段、校验、默认值
- 权限矩阵、审计字段、高风险确认
- 回滚按钮或人工回滚路径
- 操作截图和接口验证

阻断条件：

- 高风险操作无权限边界或审计。
- 配置编辑无默认值、回滚、复核或影响模拟。
- Admin 展示指标无口径或 Owner。

### Payment

必须阅读：

- `docs/payment/README.md`
- `docs/contracts/state-machines.md`
- `docs/contracts/events/README.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/data-consistency.md`

必须产出：

- 支付状态机和终态定义
- Webhook 签名、幂等、重放、乱序处理
- 对账、退款、人工补单路径
- App 用户状态和 Admin 处理路径

阻断条件：

- Webhook 无法验签或无幂等。
- 回滚会造成资金与权益状态不一致。
- 支付异常没有 P0 告警和人工升级路径。

### Security

必须阅读：

- `docs/security/README.md`
- `docs/contracts/config/README.md`
- `docs/development/RISK_REGISTER.md`
- `docs/development/DEFINITION_OF_DONE.md`

必须产出：

- Secret 边界和安全级别
- 权限、审计、告警要求
- 威胁模型或风险说明
- 失败阻断或降级策略

阻断条件：

- Secret 进入客户端配置、日志、截图或示例代码。
- 高风险操作无审计。
- 安全失败没有阻断或降级策略。

### Operations / DevOps

必须阅读：

- `docs/operations/README.md`
- `docs/monitoring/README.md`
- `docs/security/README.md`
- `docs/contracts/data-consistency.md`

必须产出：

- 部署和回滚步骤
- 环境变量、Secret、迁移影响
- 告警、Dashboard、值班和升级路径
- 灾备或回滚验证结果

阻断条件：

- 回滚步骤不可执行。
- 关键失败无告警。
- 灾备或 Redis / DB 故障无恢复路径。

### Monitoring / SRE

必须阅读：

- `docs/monitoring/README.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`
- `docs/contracts/data-consistency.md`
- `docs/development/RISK_REGISTER.md`

必须产出：

- 指标名、阈值、告警等级
- Dashboard 入口和 Owner
- 告警恢复条件
- 发布观察窗口

阻断条件：

- 关键链路失败没有指标。
- 告警无法定位到 App、NodeAgent、API、DB 或 Redis 哪一层。
- 告警没有恢复条件或升级路径。

### QA

必须阅读：

- `docs/qa/README.md`
- `docs/development/DEFINITION_OF_DONE.md`
- `docs/development/ROLE_HANDOFF_CHAINS.md`
- `docs/architecture/APP_NODEAGENT_API_DB_REDIS_CHAIN.md`

必须产出：

- Contract 测试结果
- E2E、失败路径、回滚路径证据
- 残余风险
- 发布质量门禁结论

阻断条件：

- 只验证正向路径。
- 缺少回滚、失败、乱序、重复、旧版本兼容测试。
- 任一角色没有交接证据。

### Support / Business Ops

必须阅读：

- `docs/support/README.md`
- `docs/operations/README.md`
- `docs/product/README.md`
- `docs/payment/README.md`

必须产出：

- 用户解释话术
- 人工介入和升级路径
- 补偿、退款、补单、申诉处理记录
- 发布后问题反馈

阻断条件：

- 用户可见异常没有解释或处理路径。
- 支付、权益、封禁、节点故障没有升级 Owner。
- Product 没有复盘入口。

## 4. 仍需后续真实化的事项

当前文档条件已经支持闭环开发，但有三类内容仍需要在真实业务任务中填充：

- 真实 API contract 条目，而不仅是模板。
- 真实配置 key、Redis key、事件名和状态机条目。
- 真实 Dashboard URL、告警规则和发布观察指标。

这些不阻塞文档体系闭环，但必须通过后续 TASK 落地：

- `TASK-DOC-004`：把核心 API、支付状态机和 NodeAgent 配置契约从模板推进到真实条目。
- `TASK-DOC-005`：在真实业务任务中试运行角色交接链，补充样例证据。
- `TASK-DOC-006`：把 App/NodeAgent/API/DB/Redis 链路字段补入真实 API / Config / Event contract 条目。
- `TASK-DOC-007`：补齐真实 Dashboard / Alert / Runbook 索引。
