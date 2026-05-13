# Role Handoff Chains

> 闭环不是每个角色各自完成清单，而是上游输出能被下游验证，下游发现问题能回流到上游。本文定义跨角色逻辑链、交接物、阻断条件和回流路径。

## 1. 通用交接原则

任何跨角色任务都必须满足：

- 上游角色交付明确证据，而不是口头说明。
- 下游角色有权阻断任务进入下一阶段。
- 阻断原因必须写回任务单。
- 所有回流都必须保留同一个 `TASK-XXXX`。
- 如果无法在当前任务内修复，必须创建后续 TASK，并写入风险台账。

## 2. RACI 总表

| 场景 | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| API Contract Change | Backend | Backend Lead | App, NodeAgent, QA | Product, Ops |
| Config Hot Reload | Backend / NodeAgent | Backend Lead | App, Admin, Security, QA | Ops |
| Payment Flow Change | Backend / Payment | Payment Owner | App, Admin, Ops, Security, QA | Product, Support |
| NodeAgent Degraded Mode | NodeAgent | NodeAgent Lead | Backend, Ops, QA | App, Product |
| App User Flow Change | App | Client Lead | Backend, Product, QA | Support, Ops |
| Admin High-Risk Operation | Admin | Admin Lead | Backend, Security, Ops, QA | Product |
| Incident / Rollback | Ops | Incident Commander | Backend, NodeAgent, App, Security | Product, Support |
| Release Acceptance | QA | QA Lead | All impacted owners | Product, Ops |

## 3. API 变更链路

```text
Product/Backend 提出变更
  -> Backend 更新 API contract、error codes、state machine
  -> App / NodeAgent / Admin 确认调用方影响
  -> QA 生成 contract + integration 验收项
  -> Ops 确认监控、告警、回滚影响
  -> PR 合并
  -> 发布后 Product / Support 观察用户反馈
```

### 交接物

| From | To | 必须交付 | 阻断条件 |
| --- | --- | --- | --- |
| Backend | App / NodeAgent / Admin | API contract diff、错误码、兼容策略 | 删除/重命名字段无迁移期 |
| App / NodeAgent / Admin | QA | 调用方改动点、旧版本兼容说明 | 未说明失败行为 |
| QA | Backend | contract test 结果、失败路径结果 | 错误码行为不一致 |
| Ops | Backend | 告警、日志字段、回滚检查 | 无法监控关键失败 |

### 回流路径

- App / NodeAgent 不兼容：回流 Backend contract，更新兼容策略。
- QA 失败：回流责任仓库，任务状态改为 Blocked。
- Ops 无法监控：回流 Backend 或 Monitoring 文档，补日志字段和告警。

## 4. 配置热更新链路

```text
Product / Backend / Admin 提出配置需求
  -> Backend 更新 config contract
  -> Security 标注安全级别
  -> NodeAgent / App 确认解析、默认值、非法值、旧版本行为
  -> Admin 确认编辑、权限、审计、回滚按钮
  -> QA 验证热更新、旧配置、非法配置、回滚
  -> Ops 监控配置生效率和异常率
```

### 交接物

| From | To | 必须交付 | 阻断条件 |
| --- | --- | --- | --- |
| Backend | NodeAgent / App | schema、默认值、版本策略 | 无默认值或非法值行为 |
| Security | Admin / Backend | 安全级别、Secret 边界 | Secret 会下发到客户端 |
| Admin | Ops / QA | 审计字段、权限、回滚操作路径 | 高风险配置无复核 |
| QA | Ops | 验证结果和可观测指标 | 无法确认配置是否生效 |

## 5. 支付链路

```text
Product 定义权益和价格
  -> Payment / Backend 定义订单状态机、Webhook、错误码
  -> App 确认支付入口、状态展示、失败提示、权益刷新
  -> Admin 确认对账、退款、补单、风控审核
  -> Ops 确认告警、对账任务、事故升级
  -> Security 确认签名、审计、风控
  -> QA 验证成功、失败、重放、乱序、退款、回滚
```

### 阻断条件

- Webhook 无签名或签名不可验证。
- 订单状态机不能处理重复、乱序或失败补偿。
- App 无法向用户解释支付中、失败、退款或权益未到账。
- Admin 没有人工补单、退款或冻结路径。
- Ops 没有 P0 支付告警和升级路径。

## 6. NodeAgent 降级链路

```text
NodeAgent 定义降级触发和恢复条件
  -> Backend 定义上报 API 和状态存储
  -> Monitoring / Ops 定义指标、告警和恢复视图
  -> App 定义用户可见状态和重试反馈
  -> Product / Support 定义用户解释和补偿策略
  -> QA 验证触发、恢复、重复上报和离线场景
```

### 阻断条件

- 降级状态只存在节点本地，Backend 不可见。
- App 用户只看到失败，没有重试或解释。
- Ops 无法区分单节点问题和区域性问题。
- 恢复事件没有审计或告警解除。

## 7. Admin 高风险操作链路

```text
Product / Ops 定义操作需求
  -> Admin 定义页面、权限、确认、审计
  -> Backend 定义 API、状态机和幂等
  -> Security 定义复核和权限边界
  -> QA 验证误操作、重复提交、权限绕过
  -> Ops / Support 定义人工处理和回滚
```

### 高风险操作

- 手动补单、退款、冻结账户
- 修改支付、风控、节点收益、积分经济配置
- 强制重算收益或积分
- 下线节点、解除 quarantine
- 修改用户权益或订阅状态

## 8. Release / QA 闭环链路

```text
各角色完成自检
  -> QA 汇总 contract、E2E、回滚、兼容性证据
  -> Product 确认验收标准和灰度范围
  -> Ops 确认发布、监控、回滚准备
  -> Release
  -> QA / Product / Ops 观察发布后指标
  -> 关闭 TASK 或创建 follow-up
```

### 发布阻断条件

- 任一受影响角色未给出明确验证结论。
- 风险台账中存在 Open P0/P1 风险且无缓解措施。
- 回滚步骤不可执行。
- Product 验收标准不可测试。
- Ops 缺少关键告警。

## 9. 任务单必须记录的角色链

每个跨仓库任务必须在任务单中记录：

- 角色链路：涉及哪些角色，顺序是什么
- 交接物：每个角色交给下一个角色什么
- 阻断条件：谁可以阻断，什么条件阻断
- 回流路径：发现问题回到哪个角色
- 证据链接：PR、测试、截图、日志、Dashboard、告警样例
