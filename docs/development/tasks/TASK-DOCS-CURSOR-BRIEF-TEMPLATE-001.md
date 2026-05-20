# TASK-DOCS-CURSOR-BRIEF-TEMPLATE-001 - Standard Cursor Task Brief Template

- 状态：Completed
- Owner：Docs / Task Dispatcher
- 创建日期：2026-05-21
- 目标完成日期：2026-05-21
- 主影响仓库：`livemask-docs`
- 受影响仓库：All runtime repositories
- 关联里程碑：Multi-repo intelligent development workflow

## 1. Background

Next-task dispatch can be fast but still drift if the brief is too loose. Each
Cursor task needs a standard shape so the receiving window knows what to read,
what not to touch, how to validate, and what evidence to report.

## 2. Scope

### In Scope

- Add `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md`.
- Require target repo, branch, scope, out-of-scope areas, validation, dev merge,
  docs handoff, and next unlock conditions.
- Link the template from governance docs and task ledger.

### Out of Scope

- Generating task briefs automatically from the ledger.
- Updating child repos immediately.

## 3. Contracts

- API：N/A
- Config：N/A
- Events：N/A
- Error Codes：N/A
- State Machines：N/A

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | Owns the dispatch template | Yes | `bash scripts/check-docs.sh` |
| `livemask-backend` | Receives clearer future task briefs | No | N/A |
| `livemask-nodeagent` | Receives clearer future task briefs | No | N/A |
| `livemask-app` | Receives clearer future task briefs | No | N/A |
| `livemask-admin` | Receives clearer future task briefs | No | N/A |
| `livemask-website` | Receives clearer future task briefs | No | N/A |
| `livemask-job-service` | Receives clearer future task briefs | No | N/A |
| `livemask-ci-cd` | Receives clearer future task briefs | No | N/A |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Docs dispatcher | Cursor window | Standard task brief | Missing task scope |
| 2 | Cursor window | Docs dispatcher | Completion report using required fields | Missing dev evidence |

## 6. Implementation Plan

- [x] Add the Cursor task brief template.
- [x] Reference it from governance docs.

## 7. Validation Plan

- [x] `bash scripts/check-docs.sh`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Template becomes boilerplate only | Cursor ignores constraints | Keep must-read, out-of-scope, and validation fields required | Docs |

## 9. Rollback

- 回滚触发条件：Template is replaced by repo-specific templates.
- 回滚步骤：Remove template and references.
- 回滚验证：Run `bash scripts/check-docs.sh`.

## 10. Completion Evidence

- Commit：this docs commit
- Test output：`bash scripts/check-docs.sh`
- 文档链接：`docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md`

## 11. Follow-up

- 后续 TASK：Create repo-specific Cursor briefs as completion reports unlock work.
- 未完成项：No automation generates briefs yet.
