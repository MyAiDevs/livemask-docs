# TASK-CICD-ISSUE-SYNC-STRICT-001 - Strict Cross-Repo Issue Sync

- 状态：Ready
- Owner：Docs / CI-CD
- 创建日期：2026-05-21
- 目标完成日期：
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

`task-sync.py` currently updates the docs repo Issue by TASK ID. Real execution
tasks may also have child Issues in runtime repositories. If those Issues are
not found and updated, status can drift between docs and implementation repos.

## 2. Scope

### In Scope

- Extend task-sync or a new reconciler to search by TASK ID across docs and the
  reported runtime repo.
- Prefer updating existing Issues over creating new ones.
- Record the issue URL/number in `docs/development/task-state-ledger.json`.
- Report ambiguity if multiple open Issues match the same TASK ID.

### Out of Scope

- Auto-closing Epic Issues.
- Auto-closing child Issues without guard evidence.
- Changing runtime code.

## 3. Contracts

- API：GitHub Issues API / search API usage.
- Config：Requires `LIVEMASK_BOT_TOKEN` where cross-repo writes are needed.
- Events：May reuse existing `task-sync` issue comments.
- Error Codes：N/A
- State Machines：Must follow `ISSUE_TASK_SYNC_GOVERNANCE.md`.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Updates task-sync/reconciler and docs | Yes | `bash scripts/check-docs.sh`, dry-run issue lookup |
| `livemask-ci-cd` | May host scheduled reconciliation workflow | Maybe | Workflow dry run |
| runtime repos | Existing Issues may receive sync comments | No code | Issue comments checked |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Issue sync | TASK ID and repo | Missing TASK ID |
| 2 | Issue sync | Docs dispatcher | Matched issue list | Ambiguous matches |
| 3 | Docs dispatcher | Runtime repo | Updated issue comment | Missing bot token |

## 6. Implementation Plan

- [ ] Add cross-repo issue search by TASK ID.
- [ ] Add dry-run mode for local verification.
- [ ] Update ledger with matched issue reference.
- [ ] Document ambiguous match handling.

## 7. Validation Plan

- [ ] Unit test parser/search helper with sample responses.
- [ ] Dry run against known TASK ID.
- [ ] `bash scripts/check-docs.sh`.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Duplicate Issue update | Confusing comments | Fail on ambiguous matches unless user chooses | Docs |
| Missing token | Dispatch fails | Dry-run first, clear error message | CI-CD |

## 9. Rollback

- 回滚触发条件：Issue sync comments land in wrong repo.
- 回滚步骤：Disable cross-repo write path; keep docs-only comments.
- 回滚验证：Dry-run known TASK ID.

## 10. Completion Evidence

- PR：
- Commit：
- Test output：
- 文档链接：

## 11. Follow-up

- 后续 TASK：Issue close/reopen guard only after sync is reliable.
- 未完成项：
