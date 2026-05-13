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
