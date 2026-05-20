# TASK-CICD-TASK-RECONCILER-001 - Task Ledger Reconciler

- 状态：Completed
- Owner：Docs / CI-CD
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

The first safe automation step is not auto-closing Issues. It is reconciliation:
detecting malformed state, missing task docs, invalid refs, duplicate task IDs,
and completed tasks without validation evidence before they can mislead the next
Cursor dispatch.

## 2. Scope

### In Scope

- Add a local task state ledger validator.
- Fail `bash scripts/check-docs.sh` when the ledger is malformed.
- Use this as the foundation for future Issue and remote ref reconciliation.

### Out of Scope

- GitHub API issue lookup.
- Remote `origin/dev` SHA verification.
- CI run log parsing.
- Automatic Issue close/reopen.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：N/A
- State Machines：Task status values must match governance docs.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Adds reconciliation check | Yes | `bash scripts/check-docs.sh` |
| `livemask-ci-cd` | Can later run this script in nightly audit | Follow-up | Future workflow |
| runtime repos | No direct changes | No | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Reconciler | Updated ledger | Invalid task doc |
| 2 | Reconciler | Docs dispatcher | Failure list | Missing validation |
| 3 | Docs dispatcher | Cursor task | Corrected ledger and next brief | Unresolved drift |

## 6. Implementation Plan

- [x] Add `scripts/check-task-state-ledger.py`.
- [x] Wire into `scripts/check-docs.sh`.
- [x] Add ledger entries for governance and protocol-stability modules.

## 7. Validation Plan

- [x] `python3 scripts/check-task-state-ledger.py`
- [x] `bash scripts/check-docs.sh`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Reconciler is too strict before backfill | Blocks docs work | Validate only ledger entries, not every historical TASK yet | Docs |
| Reconciler is too weak | Drift still slips through | Add GitHub/remote-ref checks in follow-up tasks | CI-CD |

## 9. Rollback

- 回滚触发条件：Script produces false positives that block urgent docs fixes.
- 回滚步骤：Temporarily remove it from `scripts/check-docs.sh`, then fix the script.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：this docs commit
- Test output：`bash scripts/check-docs.sh`
- 文档链接：`scripts/check-task-state-ledger.py`

## 11. Follow-up

- 后续 TASK：`TASK-CICD-ISSUE-SYNC-STRICT-001`
- 未完成项：Cross-repo Issue and remote ref validation.
