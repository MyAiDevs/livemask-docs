# TASK-DOCS-COMPLETION-REPORT-DISPATCH-GOVERNANCE-001 - Completion Report Dispatch Governance

- 状态：Completed
- Owner：Docs / Task Dispatcher
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-website`, `livemask-job-service`, `livemask-ci-cd`
- 关联里程碑：LiveMask multi-repo governance

## 1. Background

The LiveMask workflow uses Cursor / Codex / human completion reports as status
events. The user clarified that the `livemask-docs` window must not only analyze
those reports. It must own the full dispatch loop: task ledger updates, GitHub
Issue synchronization, module status summaries, next Cursor task assignment,
and new task creation when the current ledger no longer covers remaining project
gaps.

## 2. Scope

### In Scope

- Document the required behavior for `livemask-docs` when receiving task
  completion reports.
- Require reading task management sources before deciding status.
- Require existing GitHub Issue synchronization.
- Require module completion / unfinished summary after every report.
- Require proactive next Cursor task assignment.
- Require project scanning and new `TASK-*.md` creation when the task ledger is
  exhausted but the project is not landed.

### Out of Scope

- Runtime repository code changes.
- Automatic GitHub Issue close implementation.
- Replacing `task-sync.py` automation.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：N/A
- State Machines：Issue / task state rules documented in
  `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Owns completion report intake, task ledger, Issue sync, and dispatch rules | Yes | `bash scripts/check-docs.sh` |
| `livemask-backend` | Runtime repo reports completion evidence only | No | Reads synced AI rules / task briefs |
| `livemask-nodeagent` | Runtime repo reports completion evidence only | No | Reads synced AI rules / task briefs |
| `livemask-app` | Runtime repo reports completion evidence only | No | Reads synced AI rules / task briefs |
| `livemask-admin` | Runtime repo reports completion evidence only | No | Reads synced AI rules / task briefs |
| `livemask-website` | Runtime repo reports completion evidence only | No | Reads synced AI rules / task briefs |
| `livemask-job-service` | Runtime repo reports completion evidence only | No | Reads synced AI rules / task briefs |
| `livemask-ci-cd` | Provides merge/smoke evidence consumed by docs window | No | Smoke and guard reports include required fields |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Runtime repo Cursor window | `livemask-docs` dispatcher | Completion report with dev merge, remote ref, validation, blockers, unlocked repos | Missing dev evidence |
| 2 | `livemask-docs` dispatcher | GitHub Issue / task ledger | Updated TASK, MVP snapshot, Issue comment/status | Missing Issue or ambiguous TASK ID |
| 3 | `livemask-docs` dispatcher | Next Cursor window | Prioritized task brief with docs to read, scope, validation, and report format | No clear next owner |
| 4 | `livemask-docs` dispatcher | QA / Product | Module status summary and remaining gaps | Unverified cross-repo smoke |

## 6. Implementation Plan

- [x] Update `ai-rules/v3.7/16-Task-Completion-Report.md`.
- [x] Update `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`.
- [x] Update `docs/development/tasks/README.md`.
- [x] Update `docs/DEVELOPMENT.md`.
- [x] Add this TASK record.

## 7. Validation Plan

- [x] Contract checks: N/A, docs-only governance task.
- [x] Documentation validation: `bash scripts/check-docs.sh`.
- [x] Rollback verification: revert this docs task and the four governance doc
  edits if the workflow is superseded.
- [x] Role handoff evidence checked: runtime repos remain report-only; docs owns
  ledger and Issue sync.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Docs dispatcher creates duplicate Issues | Confusing task state | Search existing Issues by TASK ID before creating new ones | Docs |
| Next tasks are assigned without reading current ledger | Wrong priority or duplicate work | Read MVP, tasks README, related TASK files, contracts, and Issue state first | Docs |
| Task ledger ends while product still has gaps | Work stalls silently | Scan project docs/contracts/handoffs/QA/runbooks and create new TASK docs | Docs |

## 9. Rollback

- 回滚触发条件：The governance rule is replaced by a stricter automation or user
  instruction.
- 回滚步骤：Revert this TASK and the related changes in `docs/DEVELOPMENT.md`,
  `docs/development/tasks/README.md`,
  `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`, and
  `ai-rules/v3.7/16-Task-Completion-Report.md`.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：pending
- Test output：`bash scripts/check-docs.sh`
- 文档链接：
  - `ai-rules/v3.7/16-Task-Completion-Report.md`
  - `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`
  - `docs/development/tasks/README.md`
  - `docs/DEVELOPMENT.md`

## 11. Follow-up

- 后续 TASK：Create repo-specific AI rule sync tasks if child repositories need
  refreshed `.cursorrules` / Copilot instructions.
- 未完成项：GitHub Issue API updates are manual/dispatcher-owned until automation
  is extended.
