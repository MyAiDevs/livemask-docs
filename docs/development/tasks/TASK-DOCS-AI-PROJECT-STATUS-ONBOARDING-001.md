# TASK-DOCS-AI-PROJECT-STATUS-ONBOARDING-001 - AI Project Status Onboarding

- 状态：Completed
- Owner：Docs / Task Dispatcher
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All AI development tools and LiveMask repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

The user clarified a critical requirement: any AI development tool must be able
to open the repository and immediately understand the current project phase,
what is complete, what is unfinished, and what future tasks are next. This must
come from repository files, not Codex memory, local memory, or chat history.

## 2. Scope

### In Scope

- Add a first-read onboarding/status document for AI tools.
- Explain which files define current state.
- Summarize current phase, completed governance capabilities, known gaps, and
  high-priority next tasks.
- Index the onboarding file from README, docs README, development guide,
  dispatcher role doc, and task README.
- Add a docs check guard so the onboarding file remains present.

### Out of Scope

- Full historical task backfill into `task-state-ledger.json`.
- Runtime repository code changes.
- Automatic generation of the onboarding file.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：N/A
- State Machines：Uses existing task status rules.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Adds AI onboarding/status source of truth | Yes | `bash scripts/check-docs.sh` |
| runtime repos | AI tools should read the onboarding doc before acting | No | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Any AI tool | `AI_PROJECT_STATUS_ONBOARDING.md` | Missing onboarding doc |
| 2 | AI tool | Runtime task | Reads state files and exact TASK | Missing TASK ID |
| 3 | Runtime task | Docs dispatcher | Completion report | Missing dev evidence |

## 6. Implementation Plan

- [x] Add `docs/development/AI_PROJECT_STATUS_ONBOARDING.md`.
- [x] Index it from repository entrypoints.
- [x] Add presence check to `scripts/check-docs.sh`.

## 7. Validation Plan

- [x] `bash scripts/check-docs.sh`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Onboarding status becomes stale | AI tools start from wrong state | Update it whenever module priorities or core state sources change | Docs |
| AI reads onboarding only and skips task details | Wrong implementation | Onboarding requires reading exact TASK, ledger, MVP, and contracts | Docs |

## 9. Rollback

- 回滚触发条件：A generated status dashboard replaces the onboarding file.
- 回滚步骤：Remove onboarding file and index links, then replace with generated
  dashboard.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：this docs commit
- Test output：`bash scripts/check-docs.sh`
- 文档链接：`docs/development/AI_PROJECT_STATUS_ONBOARDING.md`

## 11. Follow-up

- 后续 TASK：Generate this onboarding/status page from `task-state-ledger.json`
  once the ledger is broad enough.
- 未完成项：Historical task backfill remains incremental.
