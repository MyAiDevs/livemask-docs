# State Machines Contract

> 状态机是跨仓库闭环最容易失真之处。所有状态、迁移和副作用必须在这里登记。

## 1. 状态机清单

| Domain | 文档状态 | Owner | 影响仓库 |
| --- | --- | --- | --- |
| Payment Order | Draft | Backend | Backend / App / Payment / Monitoring |
| Subscription | Draft | Backend | Backend / App / Admin |
| Node Health | Draft | NodeAgent | NodeAgent / Backend / Monitoring |
| Appeal / Quarantine | Draft | Backend | Backend / NodeAgent / Admin / Revenue |
| Points Trade | Draft | Backend | Backend / App / Admin / Payment |

## 2. 状态机模板

```markdown
## TASK-XXXX - <Domain State Machine>

### States

| 状态 | 含义 | 用户可见 | 可回滚 | 终态 |
| --- | --- | --- | --- | --- |

### Transitions

| From | Event | To | Guard | Side Effects | Failure Handling |
| --- | --- | --- | --- | --- | --- |

### Cross-Repo Impact

- App：
- Backend：
- NodeAgent：
- Database：
- Monitoring：

### Validation

- [ ] 正向路径
- [ ] 重复事件
- [ ] 乱序事件
- [ ] 失败补偿
- [ ] 回滚或人工修复
```

## Payment Order State Machine

### States

| 状态 | 含义 | 用户可见 | 可回滚 | 终态 |
| --- | --- | --- | --- | --- |
| `created` | 系统订单已创建 | 是 | 是 | 否 |
| `waiting` | 等待用户链上支付 | 是 | 是 | 否 |
| `confirming` | 链上确认中 | 是 | 否 | 否 |
| `finished` | 支付完成，权益应发放 | 是 | 否 | 是 |
| `failed` | 支付失败 | 是 | 否 | 是 |
| `expired` | 超时未支付 | 是 | 否 | 是 |
| `refunded` | 已退款 | 是 | 否 | 是 |

### Transitions

| From | Event | To | Guard | Side Effects | Failure Handling |
| --- | --- | --- | --- | --- | --- |
| `created` | invoice_created | `waiting` | provider accepted | return pay address | mark failed if provider error |
| `waiting` | webhook_confirming | `confirming` | signature valid | audit event | ignore duplicate |
| `waiting/confirming` | webhook_finished | `finished` | amount >= min ratio | outbox `entitlement.granted` | retry entitlement |
| `waiting/confirming` | webhook_failed | `failed` | signature valid | notify user | manual review if conflict |
| `waiting` | timeout | `expired` | no payment | release pending order | user can create new order |
| `finished` | refund_confirmed | `refunded` | admin/payment approval | revoke or adjust entitlement | manual review |

## Appeal State Machine

| 状态 | 含义 | 终态 |
| --- | --- | --- |
| `open` | 已创建，待处理 | 否 |
| `under_review` | 人工或系统复核中 | 否 |
| `accepted` | 申诉成立 | 是 |
| `rejected` | 申诉不成立 | 是 |
| `cancelled` | 用户或系统取消 | 是 |

快速反馈创建的 appeal 默认 `open`，priority 为 low，可由 Admin 升级。
