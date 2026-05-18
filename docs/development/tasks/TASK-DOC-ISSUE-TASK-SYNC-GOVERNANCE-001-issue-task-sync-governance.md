# TASK-DOC-ISSUE-TASK-SYNC-GOVERNANCE-001 — Issue / Task Sync Governance

- 状态：Done
- Owner：Docs / CI-CD / All Repositories
- 创建日期：2026-05-19
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-admin`, `livemask-app`, `livemask-website`, `livemask-ci-cd`, `livemask-job-service`
- 关联里程碑：AI Multi-Window Governance / Task Sync

## 1. Background

多窗口、多项目并行开发时，现有 task-sync 只区分 `completed / partial / blocked`，导致一些窗口把单仓库实现完成误当成跨仓库 Epic 完成；CI/CD smoke 中的 SKIP 也可能被误认为功能闭环完成。

需要明确：完成报告只是事件，Issue 状态必须由任务状态机、依赖图和验证门禁决定。

## 2. Scope

### In Scope

- 新增 Issue / Task Sync Governance 文档。
- 定义 Epic / Child / Verification / Docs Contract Issue 类型。
- 定义 `implemented / verified / completed / completed_with_skip / blocked / deferred` 等状态。
- 定义多窗口 lease start/end 规则。
- 定义 completion report 结构化模板。
- 更新 task-sync 文档和脚本参数，支持更细状态。
- 更新 docs 索引和任务清单。

### Out of Scope

- 不自动关闭 GitHub Issue。
- 不修改 ProjectV2 字段自动化。
- 不创建真实 GitHub Issues。
- 不同步所有仓库 `.cursorrules` 文件；该动作留给后续规则同步任务。

## 3. Contracts

- Task sync event contract：completion report is an event, not a close signal.
- Issue state machine：Epic cannot close until children + final smoke pass.
- Cursor lease contract：one active task lease per window.
- CI/CD SKIP contract：`completed_with_skip` is not full completion.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增治理文档、更新 task-sync docs/script/workflow | 是 | `bash scripts/check-docs.sh` + workflow syntax sanity |
| `livemask-ci-cd` | 后续可复制规则并强化 smoke/result 上报 | 后续任务 | `TASK-CICD-TASK-SYNC-GOVERNANCE-001` |
| `livemask-backend` | 后续同步 `.cursorrules` governance rule | 后续任务 | AI rule sync |
| `livemask-nodeagent` | 后续同步 `.cursorrules` governance rule | 后续任务 | AI rule sync |
| `livemask-admin` | 后续同步 `.cursorrules` governance rule | 后续任务 | AI rule sync |
| `livemask-app` | 后续同步 `.cursorrules` governance rule | 后续任务 | AI rule sync |
| `livemask-website` | 后续同步 `.cursorrules` governance rule | 后续任务 | AI rule sync |
| `livemask-job-service` | 后续同步 `.cursorrules` governance rule | 后续任务 | AI rule sync |

## 5. Follow-Up Tasks

| TASK | Repo | Purpose |
| --- | --- | --- |
| `TASK-CICD-TASK-SYNC-GOVERNANCE-001` | `livemask-docs` / `livemask-ci-cd` | Enforce structured task-sync fields, safer comments, and optional issue close guards. |
| `TASK-DOC-AI-RULES-SYNC-001` | `livemask-docs` + all repos | Sync governance rule into `.cursorrules` / Copilot instructions. |
| `TASK-CICD-ISSUE-CLOSE-GUARD-001` | `livemask-ci-cd` | Optional future close/reopen automation guarded by final verification state. |

## 6. Validation

Run:

```bash
bash scripts/check-docs.sh
python3 scripts/task-sync.py --help
```

## 7. Completion Evidence

Completion report must include:

- Added governance document.
- Updated task-sync docs/script/workflow.
- Docs check result.
- Confirmation that task-sync still defaults to comment-only/no auto-close.
- Local dev runtime status.

## 8. Local Dev Runtime

This is a docs/automation governance task. Do not run `docker compose down`,
`scripts/local-dev.sh stop`, or any local runtime shutdown command.
