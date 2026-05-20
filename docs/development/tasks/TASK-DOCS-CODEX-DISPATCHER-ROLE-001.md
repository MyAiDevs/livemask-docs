# TASK-DOCS-CODEX-DISPATCHER-ROLE-001 - Codex Dispatcher Role Source Of Truth

- 状态：Completed
- Owner：Docs / Task Dispatcher
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

The user wants Codex to operate as a precise, intelligent task dispatch center:
able to process Cursor reports whenever they arrive, update docs and Issues,
summarize project/module state, and dispatch new work synchronously or
asynchronously without confusing task logic.

That role needs to be documented in the repository so other AI editors can
understand what Codex is responsible for.

## 2. Scope

### In Scope

- Add `docs/development/CODEX_TASK_DISPATCHER_ROLE.md`.
- Define Codex's mission, synchronous workflow, asynchronous workflow, primary
  artifacts, and prohibited behavior.
- Index the role document from README, development guide, issue governance, AI
  report rules, and task README.
- Tighten ledger validation so a module cannot be marked `completed` while it
  contains open tasks.

### Out of Scope

- Runtime repository code changes.
- Implementing strict cross-repo Issue sync.
- Implementing active lease collision checks.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：N/A
- State Machines：Task/module status rules in
  `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md` and
  `docs/development/task-state-ledger.json`.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Documents Codex dispatcher role and improves ledger guardrails | Yes | `bash scripts/check-docs.sh` |
| runtime repos | Read the role doc when coordinating with docs dispatcher | No | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | User | Codex dispatcher | Completion report or project request | Missing TASK ID |
| 2 | Codex dispatcher | Docs ledger / Issue state | Normalized evidence and module summary | Missing dev evidence |
| 3 | Codex dispatcher | Cursor window | Standard Cursor task brief | Missing scope or validation |
| 4 | Async audit | Codex dispatcher | Drift report | Stale ledger |

## 6. Implementation Plan

- [x] Add Codex dispatcher role document.
- [x] Index role document in main docs.
- [x] Add a task record for this role definition.
- [x] Strengthen ledger validation against false module completion.

## 7. Validation Plan

- [x] `python3 scripts/check-task-state-ledger.py`
- [x] `bash scripts/check-docs.sh`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Role doc becomes stale | Future AI editors follow old behavior | Keep it indexed and update whenever workflow changes | Docs |
| Dispatcher over-automates issue closure | Wrong status is amplified | Role doc explicitly forbids Epic closure from child evidence | Docs |

## 9. Rollback

- 回滚触发条件：Role is replaced by another task-control model.
- 回滚步骤：Remove role doc and index links; revert ledger validation change if
  needed.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：this docs commit
- Test output：`bash scripts/check-docs.sh`
- 文档链接：`docs/development/CODEX_TASK_DISPATCHER_ROLE.md`

## 11. Follow-up

- 后续 TASK：`TASK-CICD-ISSUE-SYNC-STRICT-001`,
  `TASK-DOCS-LEASE-REGISTRY-001`
- 未完成项：Strict Issue sync and lease registry remain ready follow-ups.
