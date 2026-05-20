# TASK-DOCS-CHILD-REPO-AI-RULE-SYNC-001 - Sync Governance Rules Into Child Repos

- 状态：Ready
- Owner：Docs / All Repositories
- 创建日期：2026-05-21
- 目标完成日期：
- 主影响仓库：`livemask-docs`
- 受影响仓库：All runtime repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

Docs now has repo-native task state, automatic audit, trace logs, active leases,
guarded Issue close/reopen, and optional remote audit. Child repositories still
need their AI rules and Cursor handoff expectations mirrored so any AI editor
opened directly in a runtime repo knows how to start/end leases and report
completion evidence.

## 2. Scope

### In Scope

- Define the child repo AI-rule sync checklist.
- Ensure runtime repos know not to edit `../livemask-docs` directly.
- Mirror lease start/end requirements.
- Mirror completion report evidence requirements.
- Mirror remote audit / close guard boundaries.
- Produce Cursor handoffs for repo-specific sync tasks if direct runtime edits
  should be delegated.

### Out of Scope

- Runtime feature implementation.
- Auto-editing every child repo without explicit lease and task branch.
- Closing or reopening Issues.

## 3. Contracts

- API：N/A
- Config：Repo-local AI rules / `.cursorrules` or equivalent.
- Events：Completion report from each repo rule sync task.
- Error Codes：N/A
- State Machines：Must preserve lease start -> active -> ended/expired/abandoned.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Owns rule source and handoffs | Yes | `bash scripts/check-docs.sh` |
| runtime repos | Need mirrored AI/Cursor rules | Later delegated tasks | repo-local validation |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Runtime repo Cursor window | Repo-specific rule sync handoff | Active lease conflict |
| 2 | Runtime repo Cursor window | Docs dispatcher | Completion report | Missing dev evidence |
| 3 | Docs dispatcher | Audit center | Updated ledger and report | Drift warning |

## 6. Implementation Plan

- [ ] Decide whether to batch all child repo rule syncs or split per repo.
- [ ] Create repo-specific Cursor handoffs.
- [ ] Include lease, completion report, remote audit, and docs boundary rules.
- [ ] Update ledger with child repo sync tasks.

## 7. Validation Plan

- [ ] `bash scripts/check-docs.sh`.
- [ ] Repo-local rule files mention lease registry and docs boundary.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Runtime repo rules drift from docs | AI tools bypass governance | Generate from docs-owned source | Docs |
| Batch sync causes conflicts | Slower rollout | Split per repo when leases overlap | Docs |

## 9. Rollback

- 回滚触发条件：Child repo rules block valid work.
- 回滚步骤：Revert affected repo rule sync commits.
- 回滚验证：Repo-local validation plus docs audit.

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- 文档链接：

## 11. Follow-up

- 后续 TASK：
- 未完成项：
