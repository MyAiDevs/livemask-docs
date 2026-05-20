# TASK-DOCS-TASK-STATE-LEDGER-001 - Machine-Readable Task State Ledger

- 状态：Completed
- Owner：Docs / Task Dispatcher
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

The docs, GitHub Issues, completion reports, and MVP table can drift when many
Cursor windows work in parallel. A machine-readable state ledger gives the docs
dispatcher and future automation a single lightweight snapshot to reconcile
against.

## 2. Scope

### In Scope

- Add `docs/development/task-state-ledger.json`.
- Define module/task fields for status, repo, task doc, dev evidence, Issue,
  validation, blockers, unlocks, and notes.
- Add a local validator script.
- Wire the validator into `bash scripts/check-docs.sh`.

### Out of Scope

- Fully backfilling every historical TASK.
- Querying GitHub Issues or remote refs automatically.
- Closing or reopening Issues.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：N/A
- State Machines：Uses existing task status values from
  `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Adds machine-readable task state and validation | Yes | `bash scripts/check-docs.sh` |
| `livemask-backend` | Referenced as task status source | No | N/A |
| `livemask-nodeagent` | Referenced as task status source | No | N/A |
| `livemask-app` | Referenced as task status source | No | N/A |
| `livemask-admin` | Referenced as task status source | No | N/A |
| `livemask-website` | Referenced as task status source | No | N/A |
| `livemask-job-service` | Referenced as task status source | No | N/A |
| `livemask-ci-cd` | Referenced as task status source | No | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Future reconciler | `task-state-ledger.json` | Missing task doc |
| 2 | Runtime completion report | Docs dispatcher | Dev evidence and validation | Missing remote dev ref |
| 3 | Docs dispatcher | Next Cursor task | Ledger status and blockers | Stale ledger |

## 6. Implementation Plan

- [x] Add `docs/development/task-state-ledger.json`.
- [x] Add `scripts/check-task-state-ledger.py`.
- [x] Add the check to `scripts/check-docs.sh`.

## 7. Validation Plan

- [x] `python3 scripts/check-task-state-ledger.py`
- [x] `bash scripts/check-docs.sh`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Ledger becomes stale | Bad task dispatch | Update ledger whenever docs accepts completion reports | Docs |
| Ledger is treated as complete historical truth | Missing old task context | Mark it as current snapshot and grow incrementally | Docs |

## 9. Rollback

- 回滚触发条件：Ledger format is replaced by a different task database.
- 回滚步骤：Remove ledger file, validator, and `check-docs.sh` hook.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：this docs commit
- Test output：`bash scripts/check-docs.sh`
- 文档链接：`docs/development/task-state-ledger.json`

## 11. Follow-up

- 后续 TASK：`TASK-CICD-ISSUE-SYNC-STRICT-001`, `TASK-DOCS-LEASE-REGISTRY-001`
- 未完成项：GitHub Issue and remote ref reconciliation remain follow-up work.
