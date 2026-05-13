# Admin Approval And Audit Chain

> 覆盖 Admin 高风险操作、审批、审计、回滚、双人复核和客服/运营可追踪性。

## 1. 高风险操作范围

- 手动补单、退款、权益调整
- 积分人工调整
- C2C 争议裁决
- 解封 / 封禁用户
- 下线节点 / 解除 quarantine
- 修改支付、风控、积分、收益配置
- 强制收益重算
- 远程诊断指令下发

## 2. 正向链路

```text
Admin operator submits action
  -> Backend validates RBAC + risk level
  -> Optional approval request created
  -> Second approver approves
  -> Backend executes action in DB transaction
  -> Audit log + outbox event
  -> Admin shows result
  -> Support / Ops notified when needed
```

## 3. 状态机

| 状态 | 含义 | 终态 |
| --- | --- | --- |
| `draft` | 操作已填写但未提交 | 否 |
| `pending_approval` | 等待复核 | 否 |
| `approved` | 已批准待执行 | 否 |
| `executed` | 已执行 | 是 |
| `rejected` | 已拒绝 | 是 |
| `rolled_back` | 已反向回滚 | 是 |

## 4. 必须契约

### API

- `POST /admin/actions`
- `POST /admin/actions/{id}/approve`
- `POST /admin/actions/{id}/reject`
- `POST /admin/actions/{id}/execute`
- `POST /admin/actions/{id}/rollback`
- `GET /admin/audit-logs`

### DB

- `admin_actions`
- `admin_approvals`
- `admin_audit_logs`
- `admin_action_rollbacks`

### Events

- `admin.action_requested`
- `admin.action_approved`
- `admin.action_executed`
- `admin.action_rolled_back`

## 5. 假设审计

### H1：操作者和审批者是同一人

- 高风险操作禁止 self-approval。
- Backend 强制校验，不只依赖前端隐藏按钮。

### H2：操作执行成功但审计写失败

- 审计日志必须和业务变更同事务写入。
- 审计失败则业务操作失败。

### H3：重复点击执行

- `admin_action_id` 是幂等键。
- 已 executed 的 action 再执行返回当前结果。

### H4：回滚不是严格反向

- 回滚必须创建新 action，不得删除原审计。
- 原 action 与 rollback action 互相关联。

## 6. 验证矩阵

- [ ] RBAC 拦截
- [ ] self-approval 拦截
- [ ] 审计同事务
- [ ] 重复执行幂等
- [ ] rollback action 留痕
- [ ] Support 可查用户相关操作

## 7. 回滚

- 高风险操作通过反向 action 修复。
- 不删除历史审计。
- 涉及支付/权益的回滚必须通知 Payment 和 Support。
