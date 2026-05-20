# TASK-CICD-ISSUE-CLOSE-GUARD-001 - Guarded Issue Close / Reopen Automation

- 状态：Ready
- Owner：Docs / CI-CD
- 创建日期：2026-05-21
- 目标完成日期：
- 主影响仓库：`livemask-ci-cd`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

`TASK-CICD-ISSUE-SYNC-STRICT-001` adds strict cross-repo Issue presence and
ambiguity checks. The next automation step is guarded close/reopen behavior, but
only after the system can prove final verification state. Closing Issues is
more dangerous than syncing comments, so it must remain separate and guarded.

## 2. Scope

### In Scope

- Define a safe close/reopen guard for child Issues.
- Require `completed` status, dev merge evidence, remote `origin/dev` ref, and
  validation evidence before any close action.
- Keep Epic Issues open unless all child tasks and final smoke are complete.
- Reopen Issues when downstream contract mismatch, CI/CD FAIL, production mock
  path, security/redaction failure, or missing implementation is discovered.
- Provide dry-run output before write mode.

### Out of Scope

- Auto-closing Epic Issues from a single child task.
- Closing Issues with `completed_with_skip`.
- Closing Issues when the task is only implemented or verified locally.
- Runtime code changes.

## 3. Contracts

- API：GitHub Issues API.
- Config：Requires token with Issue write permissions for write mode.
- Events：May consume task-sync comments and ledger entries.
- Error Codes：N/A
- State Machines：Must follow `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-ci-cd` | Adds close/reopen guard script or workflow | Yes | shell syntax, dry-run, sample issue mapping |
| `livemask-docs` | Updates governance docs and ledger | Yes | `bash scripts/check-docs.sh` |
| runtime repos | Issues may be closed/reopened only after guard passes | No code | Issue comments/state |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Close guard | TASK ID, issue match, status, dev evidence | Missing evidence |
| 2 | Close guard | GitHub Issue | Dry-run decision | Ambiguous issue |
| 3 | GitHub Issue | Docs dispatcher | Closed/reopened state and comment | Failed write permission |

## 6. Implementation Plan

- [ ] Define dry-run decision table.
- [ ] Implement child Issue close guard.
- [ ] Implement reopen guard triggers.
- [ ] Refuse Epic close unless all child tasks and final smoke are complete.
- [ ] Update `task-state-ledger.json` issue fields where possible.

## 7. Validation Plan

- [ ] Dry-run against completed child task.
- [ ] Dry-run against `completed_with_skip` task and confirm no close.
- [ ] Dry-run against ambiguous Issue result and confirm failure.
- [ ] `bash scripts/check-docs.sh`.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Issue closes too early | Hidden unfinished work | Keep close guard separate from issue sync and require final evidence | CI-CD |
| Epic closes from child task | Cross-repo state lies | Explicitly refuse Epic close in automation | Docs / CI-CD |

## 9. Rollback

- 回滚触发条件：Guard closes or reopens wrong Issue.
- 回滚步骤：Disable write mode and restore manual issue state.
- 回滚验证：Dry-run only.

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- 文档链接：

## 11. Follow-up

- 后续 TASK：Optional generated status dashboard after Issue close guard is
  stable.
- 未完成项：
