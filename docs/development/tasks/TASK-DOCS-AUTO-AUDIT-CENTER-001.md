# TASK-DOCS-AUTO-AUDIT-CENTER-001 - Docs Auto Audit Center

- 状态：Completed
- Owner：Docs / Task Dispatcher
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

The task center needs automatic audit, but it must be designed carefully. A
naive automation that blocks on noisy checks or silently changes state would
make the workflow less intelligent. The first version must be deterministic,
repo-native, reproducible, and clear about the difference between gate findings,
warnings, and suggestions.

## 2. Scope

### In Scope

- Define the automatic audit design in
  `docs/development/AUTO_AUDIT_CENTER.md`.
- Add `scripts/audit-task-center.py`.
- Emit both text and JSON reports.
- Separate findings into gate, warning, and suggestion layers.
- Wire the audit into `bash scripts/check-docs.sh`.
- Add this task to `docs/development/task-state-ledger.json`.

### Out of Scope

- Calling GitHub Issues or Actions APIs.
- Editing task docs or ledger automatically.
- Creating, closing, or reopening GitHub Issues.
- Dispatching Cursor tasks automatically.
- Replacing the existing ledger validator.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：`scripts/audit-task-center.py` exits `1` only when gate findings
  exist.
- State Machines：Uses existing task status values from
  `docs/development/task-state-ledger.json`.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Adds the offline audit center and docs check wiring | Yes | `bash scripts/check-docs.sh` |
| `livemask-backend` | Audited through ledger evidence only | No | N/A |
| `livemask-nodeagent` | Audited through ledger evidence only | No | N/A |
| `livemask-app` | Audited through ledger evidence only | No | N/A |
| `livemask-admin` | Audited through ledger evidence only | No | N/A |
| `livemask-website` | Audited through ledger evidence only | No | N/A |
| `livemask-job-service` | Audited through ledger evidence only | No | N/A |
| `livemask-ci-cd` | Audited through ledger evidence only | No | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Audit script | `task-state-ledger.json` and task docs | Invalid ledger |
| 2 | Audit script | AI/Cursor/docs window | Text or JSON audit report | Gate findings |
| 3 | AI/Cursor/docs window | Runtime task owner | Next task queue and suggestions | Missing task brief |

## 6. Implementation Plan

- [x] Add audit design document.
- [x] Add audit script.
- [x] Add JSON output.
- [x] Add text output.
- [x] Keep default text output concise; expose full findings through
  `--verbose` and JSON.
- [x] Wire audit script into `check-docs.sh`.
- [x] Update ledger and task README.

## 7. Validation Plan

- [x] `python3 scripts/audit-task-center.py`
- [x] `python3 scripts/audit-task-center.py --format json`
- [x] `bash scripts/check-docs.sh`
- [x] `git diff --check`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Audit becomes noisy | Developers ignore it | Warnings do not block; gates are deterministic only | Docs |
| Audit blocks on network or credentials | CI becomes flaky | Default audit is offline only | Docs |
| Audit mutates state incorrectly | Task center becomes untrustworthy | Script is read-only and emits reports only | Docs |
| Suggestions are treated as commands | Wrong task dispatch | Suggestions require human/AI dispatcher review | Docs |

## 9. Rollback

- 回滚触发条件：Audit script blocks valid docs work or report format must be
  replaced.
- 回滚步骤：Remove `scripts/audit-task-center.py`, remove the `check-docs.sh`
  hook, and revert `AUTO_AUDIT_CENTER.md` plus ledger entries.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：this docs commit
- Validation：`python3 scripts/audit-task-center.py`, JSON output, `bash
  scripts/check-docs.sh`, `git diff --check`
- 文档链接：`docs/development/AUTO_AUDIT_CENTER.md`

## 11. Follow-up

- 后续 TASK：`TASK-DOCS-LEASE-REGISTRY-001`,
  `TASK-CICD-ISSUE-CLOSE-GUARD-001`
- 未完成项：Optional GitHub Issue / Actions / remote ref audit remains future
  opt-in work.
