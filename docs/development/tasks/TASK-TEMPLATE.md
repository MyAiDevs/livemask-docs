# TASK-XXXX - <Title>

- 状态：Draft
- Owner：
- 创建日期：
- 目标完成日期：
- 主影响仓库：
- 受影响仓库：
- 关联里程碑：

## 1. Background

说明为什么需要这个任务。

## 2. Scope

### In Scope

- 

### Out of Scope

- 

## 3. Contracts

- API：
- Config：
- Events：
- Error Codes：
- State Machines：

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-backend` |  |  |  |
| `livemask-nodeagent` |  |  |  |
| `livemask-app` |  |  |  |
| `livemask-admin` |  |  |  |
| `livemask-docs` |  |  |  |

## 5. Role Handoff Chain

> 参考 `docs/development/ROLE_HANDOFF_CHAINS.md`。跨角色任务必须写清楚谁交给谁、交什么、谁可以阻断。

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Product / Owner | Engineering | Scope, acceptance, out-of-scope | 验收标准不可测试 |
| 2 | Backend / Contract Owner | App / NodeAgent / Admin | Contract diff, compatibility, error behavior | 契约不兼容或无迁移期 |
| 3 | Engineering | QA | Test scope, failure paths, rollback steps | 缺少失败路径或回滚证据 |
| 4 | QA | Ops / Product | Test result, residual risk | P0/P1 风险无缓解 |
| 5 | Ops / Product | Task Owner | Release observation, support notes | 监控或客服路径缺失 |

## 6. Implementation Plan

- [ ] 

## 7. Validation Plan

- [ ] Unit tests
- [ ] Integration tests
- [ ] Contract checks
- [ ] Manual verification
- [ ] Rollback verification
- [ ] Role handoff evidence checked

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |

## 9. Rollback

- 回滚触发条件：
- 回滚步骤：
- 回滚验证：

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- Screenshots / logs：
- 文档链接：
- Dashboard / alert：
- Product / support note：

## 11. Follow-up

- 后续 TASK：
- 未完成项：
