# TASK-DOCS-CHILD-REPO-AI-RULE-SYNC-001 - Sync Governance Rules Into Child Repos

- 状态：Completed
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
| runtime repos | Mirrored AI/Cursor rules | Yes | repo-local validation + dev merge guard |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Runtime repo Cursor window | Repo-specific rule sync handoff | Active lease conflict |
| 2 | Runtime repo Cursor window | Docs dispatcher | Completion report | Missing dev evidence |
| 3 | Docs dispatcher | Audit center | Updated ledger and report | Drift warning |

## 6. Implementation Plan

- [x] Batch-sync all child repo `.cursorrules` from the docs-owned governance source.
- [x] Use clean temporary worktrees/clones for dirty primary checkouts.
- [x] Include lease, completion report, remote audit, and docs boundary rules.
- [x] Merge each child repo through `dev-merge-guard.sh` and push `origin/dev`.
- [x] Update docs ledger and first-read status files.

## 7. Validation Plan

- [x] `bash scripts/check-docs.sh`.
- [x] Repo-local rule files mention lease registry and docs boundary.
- [x] `git diff --check`.

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

- PR：N/A
- Docs task branch commit：filled at docs merge time
- Docs dev merge commit：filled at docs merge time
- Test output：`bash scripts/check-docs.sh`; `python3 scripts/audit-task-center.py --no-log`; `git diff --check`
- 文档链接：`docs/development/task-state-ledger.json`, `docs/development/AI_PROJECT_STATUS_ONBOARDING.md`, `docs/development/MVP_IMPLEMENTATION_PLAN.md`

Child repo sync evidence:

| Repo | Task branch commit | Dev merge / remote dev | Validation |
| --- | --- | --- | --- |
| `livemask-backend` | `e9071cd` | `4aa7116` | `rg` rule check + `git diff --check` |
| `livemask-nodeagent` | `b5591f4` | `0c4ed4f` | `rg` rule check + `git diff --check` |
| `livemask-app` | `a384d7c` | `18ed56c` | `rg` rule check + `git diff --check` |
| `livemask-admin` | `0ab3f7d` | `668cda6` | `rg` rule check + `git diff --check` |
| `livemask-website` | `494beb0` | `1a35282` | `rg` rule check + `git diff --check` |
| `livemask-job-service` | `2ecb50e` | `4f7ae82` | `rg` rule check + `git diff --check` |
| `livemask-ci-cd` | `68c5a7f` | `350ee0c` | `rg` rule check + `git diff --check` |

## 11. Follow-up

- 后续 TASK：Return dispatch priority to product/runtime gaps:
  `TASK-APP-RECONNECT-RUNTIME-REAL-BACKEND-001` and
  `TASK-CICD-RECONNECT-HINT-RUNTIME-SMOKE-001`.
- 未完成项：Historical ledger backfill remains incremental as completion reports
  arrive; it is not a blocker for runtime dispatch.
