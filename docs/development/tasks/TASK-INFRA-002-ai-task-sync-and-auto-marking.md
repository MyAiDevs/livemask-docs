# TASK-INFRA-002 - AI Task Sync and Auto Marking

- 状态：Ready
- Owner：DevOps / Docs Maintainer
- 主影响仓库：`livemask-docs`
- 受影响仓库：`livemask-backend`, `livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-website`, `livemask-ci-cd`
- 关联里程碑：M0 / AI 多窗口协同
- 依赖：`TASK-INFRA-001`, `TASK-P0-03`

## 1. Background

LiveMask 采用多仓库、多 Cursor / Codex 窗口并行开发。当前规则已经要求所有变更关联 `TASK-XXXX`，并要求 AI 在完成任务后输出标准完成报告。但如果任务状态只停留在聊天窗口，其他窗口仍然需要人工判断：

- 这个 TASK 是否已经完成？
- Backend 契约是否已经稳定？
- Admin / App / NodeAgent 是否可以并行开工？
- CI / smoke / Lark 是否已经验证？
- GitHub Project 是否应该进入 Ready for Review / Done？

分支模型已收口为 `dev -> main -> release`：

- `dev`：日常开发、本地 Go 测试、本地 Docker 验证。
- `main`：远程预发布 staging，只能由 `dev` 合并进入。
- release / `v*`：生产发布，只能手动创建版本。

因此本任务的 `task-unlocked` 事件只负责开发协同，不负责触发 staging
或 production 部署。

本任务将 GitHub 作为事件总线，把 AI 完成报告、CI 结果、Issue、Project、repository_dispatch 和 Lark 报告串成可追踪的自动同步闭环。

## 2. Goal

建立最小可运行的任务同步系统：

```text
AI completion report / GitHub event
  -> task-sync workflow
  -> locate TASK issue
  -> comment status + verification evidence
  -> dispatch unlocked repositories
  -> send Lark project report
  -> optionally update GitHub Project status
```

## 3. Scope

### In Scope

- 每个 TASK 对应一个 GitHub Issue。
- Commit / PR / completion report 必须包含 `TASK-XXXX`。
- `livemask-docs` 提供 `Task Sync and Auto Marking` workflow。
- Workflow 可通过 `workflow_dispatch` 手动触发。
- Workflow 可从 issue comment 中识别标准完成报告并同步。
- 自动在 TASK Issue 下追加同步评论。
- 根据 `unlocked_repos` 触发子仓库 `repository_dispatch`。
- 自动发送 Lark 项目报告。
- 预留 GitHub Project 自动移动字段配置。

### Out of Scope

- 完整替代人工 Review。
- 自动判断业务验收是否真实完成。
- 自动合并 PR。
- 在没有 Project ID / field ID 的情况下强行移动 Project 卡片。

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-docs` | 新增任务同步 workflow、脚本、任务文档和运行手册 | 是 | docs check + workflow dispatch |
| `livemask-backend` | 后续接收 `task-unlocked` 事件并运行兼容 CI | 后续 | repository_dispatch run |
| `livemask-nodeagent` | 后续接收配置/接口解锁事件 | 后续 | repository_dispatch run |
| `livemask-app` | 后续接收 App 可并行开发事件 | 后续 | repository_dispatch run |
| `livemask-admin` | 后续接收 Admin 页面可开发事件 | 后续 | repository_dispatch run |
| `livemask-website` | 后续接收营销/下载页相关事件 | 后续 | repository_dispatch run |
| `livemask-ci-cd` | 后续接收 staging smoke 可执行事件 | 后续 | staging workflow run |

## 5. Required GitHub Secrets

| Secret | 用途 | 必需 |
| --- | --- | --- |
| `LIVEMASK_BOT_TOKEN` | 搜索 Issue、评论 Issue、跨仓库 dispatch、后续 Project 更新 | Yes |
| `LARK_BOT_WEBHOOK` | Lark 项目报告 | Yes for Lark |
| `LARK_BOT_SECRET` | Lark 加签 | Yes for signed bot |

Recommended `LIVEMASK_BOT_TOKEN` permissions:

- Contents: read
- Issues: read/write
- Pull requests: read
- Actions: read/write
- Metadata: read
- Projects: read/write (only when Project auto move is enabled)

Closure rule: if a sync request includes child repositories in
`unlocked_repos`, `LIVEMASK_BOT_TOKEN` must be configured before the workflow
writes an Issue comment. Otherwise the audit trail could say a repo was
unlocked while the cross-repo `repository_dispatch` was never sent.

## 6. Event Sources

| Source | Trigger | Behavior |
| --- | --- | --- |
| Manual | `workflow_dispatch` | Human / Codex inputs TASK ID, result, unlocked repos |
| Issue comment | `issue_comment.created` | If comment contains `TASK-XXXX` and completion markers, sync it |
| Docs push | `dispatch-affected-repos.yml` | Existing docs contract dispatch remains unchanged |
| Child CI | Future extension | Child repo CI can call this workflow after success |

## 7. Standard Input

Manual workflow inputs:

| Input | Required | Example |
| --- | --- | --- |
| `task_id` | yes | `TASK-P0-03` |
| `result` | yes | `implemented` / `verified` / `completed` / `completed_with_skip` / `blocked` / `deferred` |
| `repo` | no | `livemask-backend` |
| `parent_task_id` | no | `TASK-INFRA-002` |
| `summary` | yes | `Config center Backend core is implemented and CI passed.` |
| `verification` | no | `Backend CI #25966150751 success` |
| `implementation_status` | no | `Backend code implemented and pushed.` |
| `verification_status` | no | `Unit/build/smoke passed.` |
| `skip_count` | no | `0` |
| `blockers` | no | `None` |
| `issue_action` | no | `comment_only` |
| `should_close_issue` | no | `false` |
| `unlocked_repos` | no | `livemask-admin,livemask-app,livemask-nodeagent` |
| `blocked_repos` | no | `livemask-ci-cd` |
| `next_steps` | no | `Add config smoke in livemask-ci-cd.` |

## 8. Issue Comment Format

The workflow posts a comment to the TASK Issue:

```markdown
## AI Task Sync

**TASK ID**: TASK-P0-03
**Parent TASK ID**: TASK-INFRA-002
**Repo**: livemask-backend
**Result**: implemented
**Source**: workflow_dispatch
**Issue Action**: comment_only
**Should Close Issue**: false

### Summary
...

### Verification
...

### Implementation Status
...

### Verification Status
...

### Skip Count
0

### Blockers
None

### Unlocked Repositories
- livemask-admin
- livemask-app
- livemask-nodeagent

### Blocked Repositories
- livemask-ci-cd

### Next Steps
...
```

## 9. Repository Dispatch Contract

For each unlocked repo, `livemask-docs` sends:

- event type: `task-unlocked`

Payload:

```json
{
  "task_id": "TASK-P0-03",
  "parent_task_id": "TASK-INFRA-002",
  "repo": "livemask-backend",
  "result": "implemented",
  "source_repo": "livemask-docs",
  "target_branch": "dev",
  "source_run_id": "123456",
  "summary": "Config center Backend core is implemented and CI passed.",
  "issue_action": "comment_only",
  "should_close_issue": "false"
}
```

Child repos may use this event to run compatibility CI or create follow-up comments.

## 10. GitHub Project Status Mapping

Project auto move is enabled only when these repository variables are configured:

| Variable | Meaning |
| --- | --- |
| `LIVEMASK_PROJECT_ID` | GitHub ProjectV2 node id |
| `LIVEMASK_PROJECT_STATUS_FIELD_ID` | Status field node id |
| `LIVEMASK_PROJECT_READY_OPTION_ID` | Ready for Review option id |
| `LIVEMASK_PROJECT_DONE_OPTION_ID` | Done option id |
| `LIVEMASK_PROJECT_BLOCKED_OPTION_ID` | Blocked option id |

Mapping:

| Sync result | Project status |
| --- | --- |
| `completed` | Done |
| `partial` | Ready for Review |
| `blocked` | Blocked |

If variables are missing, workflow must skip Project update and still complete.

## 11. Validation

- [ ] Manual workflow can locate existing TASK issue.
- [ ] Manual workflow comments on TASK issue.
- [ ] Manual workflow dispatches unlocked repositories.
- [ ] Lark receives project report.
- [ ] Missing Lark secrets skip notification without failing task sync.
- [ ] Missing Project variables skip Project update without failing task sync.
- [ ] Issue comment trigger ignores unrelated comments.
- [ ] Issue comment trigger handles standard completion report.
- [ ] Workflow-generated audit comments do not trigger recursive sync.
- [ ] Missing `LIVEMASK_BOT_TOKEN` fails before Issue comment when child repos are unlocked.
- [ ] `task-unlocked` dispatch starts the target child repo workflow against `dev`.
- [ ] `task-unlocked` does not trigger `livemask-ci-cd` staging / production deploy.

## 12. Rollback

- Disable `.github/workflows/task-sync.yml`.
- Remove or pause `task-unlocked` consumers in child repos.
- Keep TASK Issue comments as audit evidence; do not delete unless they contain sensitive data.
- Project auto move can be disabled by removing Project variables.

## 13. Next Tasks

- `TASK-INFRA-003`: child repo consumers for `task-unlocked`.
- `TASK-INFRA-004`: ProjectV2 field discovery and automatic status mutation.
- `TASK-INFRA-005`: CI completion callback from child repos to central TASK issue.
