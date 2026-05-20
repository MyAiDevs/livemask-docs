# TASK-DOCS-LEASE-REGISTRY-001 - Active Cursor Lease Registry

- 状态：Completed
- Owner：Docs / All Repositories
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

Parallel Cursor windows can accidentally work on the same repo, TASK, or file
area. Existing lease rules are documented but not registered in a shared place.
A lightweight active lease registry would make collisions visible before edits
begin.

`TASK-CICD-ISSUE-SYNC-STRICT-001` is now completed, so lease registry work can
reuse the same idea of scanable task/Issue state and structured output.

## 2. Scope

### In Scope

- Define an active lease file or Issue-comment based registry.
- Track `task_id`, repo, branch, expected files, lease owner, started_at,
  expires_at, depends_on, and blocked_by.
- Add a check or manual command to detect overlapping active leases.
- Document lease start and lease end workflow.

### Out of Scope

- Locking files at the filesystem level.
- Blocking emergency manual fixes.
- Runtime repo code changes.

## 3. Contracts

- API：Optional GitHub Issue comments if registry is Issue-backed.
- Config：N/A
- Events：Lease start/end comments or ledger entries.
- Error Codes：N/A
- State Machines：Lease start -> active -> ended / expired / abandoned.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Defines lease registry and collision check | Yes | `bash scripts/check-docs.sh` |
| runtime repos | Must include lease start/end in task flow | Later rules sync | Completion reports |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Cursor window | Lease start fields | Missing expected files |
| 2 | Cursor window | Docs dispatcher | Lease end and completion report | Dirty worktree |
| 3 | Docs dispatcher | Next Cursor window | Lease cleared or explicit parallel-safe split | Active overlap |

## 6. Implementation Plan

- [x] Choose file-backed lease registry; Issue comments remain optional follow-up.
- [x] Define `docs/development/task-leases.json`.
- [x] Add collision detection for repo + expected file overlap.
- [x] Update Cursor brief template to include lease start/end.
- [x] Ensure lease state can be reconciled asynchronously alongside
  `task-state-ledger.json`.

## 7. Validation Plan

- [x] Sample two non-overlapping leases pass.
- [x] Sample overlapping leases fail.
- [x] `python3 scripts/check-task-leases.py`
- [x] `python3 scripts/check-task-leases.py --self-test`
- [x] `bash scripts/check-docs.sh`.

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Stale active lease blocks work | Slow dispatch | Add expiry and abandon path | Docs |
| Lease registry becomes bureaucracy | Slower small fixes | Require for multi-repo/runtime work; allow docs-only quick edits with reason | Docs |

## 9. Rollback

- 回滚触发条件：Lease registry causes false blocks.
- 回滚步骤：Disable collision check; retain lease comments as advisory.
- 回滚验证：Run docs checks.

## 10. Completion Evidence

- PR：
- Commit：this docs task branch / dev merge
- Test output：`python3 scripts/check-task-leases.py`,
  `python3 scripts/check-task-leases.py --self-test`,
  `bash scripts/check-docs.sh`, `git diff --check`
- 文档链接：`docs/development/task-leases.json`,
  `scripts/check-task-leases.py`,
  `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`,
  `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md`

## 11. Follow-up

- 后续 TASK：Sync lease rule into child repo AI rules.
- 未完成项：GitHub Issue comment mirroring is intentionally deferred.
