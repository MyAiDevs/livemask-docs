# Role Closure Audit

> 本文档从不同开发角色视角审计闭环状态。每次新增角色、仓库或重大流程时都应更新。

## 1. 审计结论

当前文档体系已经具备多仓库开发的主闭环：

- 统一入口：`README.md`、`docs/README.md`
- 统一规则：`ai-rules/v3.7/`
- 统一契约：`docs/contracts/`
- 统一任务单：`docs/development/tasks/`
- 统一完成标准：`docs/development/DEFINITION_OF_DONE.md`
- 统一风险台账：`docs/development/RISK_REGISTER.md`
- 统一自动检查：`scripts/check-docs.sh`
- 统一角色交接链：`docs/development/ROLE_HANDOFF_CHAINS.md`
- 统一角色就绪评估：`docs/development/ROLE_READINESS_ASSESSMENT.md`

本轮补齐的缺口：

- Admin / Frontend 缺少角色入口
- Payment 缺少角色入口
- Operations / DevOps 缺少角色入口
- QA 缺少角色入口
- Product 缺少角色入口
- Definition of Done 缺少 Admin、Ops、QA、Product 角色标准
- 跨角色链路缺少交接物、阻断条件和回流路径

## 2. Backend 视角

### 仍需关注

- API 字段变更必须先更新 API contract。
- 数据库迁移必须同步架构和回滚说明。
- 支付、配置、状态机变更不能只停留在 Backend 文档。

### 已补闭环

- `docs/backend/README.md`
- `docs/contracts/api/README.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/state-machines.md`
- `docs/development/CHANGE_TO_DOC_MATRIX.md`

## 3. NodeAgent 视角

### 仍需关注

- 配置热更新必须覆盖旧配置、非法配置、缺省配置。
- 降级、恢复、重试和上报事件必须有事件或配置契约。
- 安装脚本、运行时错误和日志上报不能只写示例 TODO。

### 已补闭环

- `docs/nodeagent/README.md`
- `docs/contracts/config/README.md`
- `docs/contracts/events/README.md`
- `docs/development/LiveMask_TODO闭环登记表_v3.7.md`

## 4. App 视角

### 仍需关注

- Backend 错误码必须映射到用户可理解的行为。
- 支付、登录、连接、订阅状态必须有失败和恢复路径。
- 本地缓存和旧版本数据迁移必须写入任务单。

### 已补闭环

- `docs/app/README.md`
- `docs/contracts/error-codes.md`
- `docs/contracts/api/README.md`
- `docs/development/DEFINITION_OF_DONE.md`

## 5. Admin / Frontend 视角

### 仍需关注

- 配置编辑页面必须有审计、权限和回滚。
- 风控、支付、申诉、退款等高风险操作必须说明双人复核或升级路径。
- Dashboard 指标必须有口径和 Owner。

### 已补闭环

- `docs/admin/README.md`
- `templates/CONFIG_CHANGE_RECORD.md`
- `templates/PR_DESCRIPTION_TEMPLATE.md`
- `docs/development/RISK_REGISTER.md`

## 6. Payment 视角

### 仍需关注

- 支付状态机、Webhook 事件、错误码、对账口径必须分别登记。
- App 权益展示、Backend 幂等、Admin 人工补单、Ops 告警必须同步。
- 任何回滚不得制造资金与权益不一致。

### 已补闭环

- `docs/payment/README.md`
- `docs/payment/LiveMask_USDT支付接入文档_v3.6.md`
- `docs/contracts/state-machines.md`
- `docs/contracts/events/README.md`
- `docs/contracts/error-codes.md`

## 7. Operations / DevOps 视角

### 仍需关注

- Secret、环境变量、迁移、部署、回滚必须有可执行步骤。
- SLO、告警、Dashboard 和值班升级路径必须同步。
- 灾备演练必须有结果记录，而不是只写计划。

### 已补闭环

- `docs/operations/README.md`
- `docs/security/README.md`
- `docs/monitoring/`
- `docs/development/RISK_REGISTER.md`

## 8. Security 视角

### 仍需关注

- Secret 不得进入客户端配置、日志、示例代码或截图。
- 支付、权限、风控、申诉必须有审计字段和告警。
- 安全失败路径必须有降级或阻断策略。

### 已补闭环

- `docs/security/README.md`
- `docs/contracts/config/README.md`
- `docs/development/DEFINITION_OF_DONE.md`
- `docs/development/RISK_REGISTER.md`

## 9. QA 视角

### 仍需关注

- 任务单必须把验收标准写成可测试项。
- Contract、E2E、失败路径、回滚路径都需要证据。
- 残余风险必须写进风险台账。

### 已补闭环

- `docs/qa/README.md`
- `docs/development/tasks/TASK-TEMPLATE.md`
- `scripts/check-docs.sh`
- `docs/development/DEFINITION_OF_DONE.md`

## 10. Product 视角

### 仍需关注

- 需求范围必须提前收敛，避免开发中扩 scope。
- 灰度、客服话术、复盘指标和观察窗口必须明确。
- 范围外事项必须进入后续 TASK，而不是散落在讨论里。

### 已补闭环

- `docs/product/README.md`
- `docs/development/tasks/TASK-TEMPLATE.md`
- `templates/PR_DESCRIPTION_TEMPLATE.md`

## 11. 剩余非阻断事项

这些不是当前闭环的阻断点，但建议后续建立独立 TASK：

- `TASK-DOC-002`：同步各业务仓库 `.cursorrules` / `.github/copilot-instructions.md`
- `TASK-DOC-003`：为 archive 文档标注 Active / Superseded / Historical
- `TASK-DOC-004`：把核心 API、支付状态机和 NodeAgent 配置契约从模板推进到真实条目
- `TASK-DOC-005`：在真实业务任务中试运行角色交接链，补充样例证据
- `TASK-DOC-007`：补齐真实 Dashboard / Alert / Runbook 索引
