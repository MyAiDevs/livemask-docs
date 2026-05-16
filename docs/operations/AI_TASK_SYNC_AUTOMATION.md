# AI Task Sync Automation

> TASK: `TASK-INFRA-002`

LiveMask uses GitHub as the event bus for multi-window AI development. Cursor,
Codex, and other AI editors do not run as always-on listeners. Instead, every
window writes traceable evidence to GitHub, and GitHub Actions synchronizes task
state, repository unlocks, and Lark reports.

## 1. Source of Truth

| Layer | Source of truth |
| --- | --- |
| Task definition | `livemask-docs/docs/development/tasks/TASK-*.md` |
| Live task state | GitHub Issue in `MyAiDevs/livemask-docs` |
| Cross-repo status | GitHub Issue comments + Project fields |
| Automation event bus | GitHub Actions + `repository_dispatch` |
| Human notification | Lark bot |

## 2. Required Discipline for AI Windows

Every AI window must:

1. Read the current `TASK-XXXX`.
2. Include `TASK-XXXX` in commit / PR / completion report.
3. Use the standard completion report from
   `ai-rules/v3.7/16-Task-Completion-Report.md`.
4. Explicitly declare unlocked and blocked repositories.
5. Never claim another repo is unblocked unless the API / config / DB / Redis
   contract it depends on is stable enough to implement against.

## 3. Manual Sync Flow

Use this when Codex or Cursor completes a meaningful subtask:

```bash
gh workflow run task-sync.yml \
  --repo MyAiDevs/livemask-docs \
  -f task_id=TASK-P0-03 \
  -f result=completed \
  -f summary="Backend config center core implemented and CI passed." \
  -f verification="Backend CI 25966150751 success." \
  -f unlocked_repos="livemask-admin,livemask-app,livemask-nodeagent" \
  -f blocked_repos="livemask-ci-cd" \
  -f next_steps="Add config center staging smoke."
```

The workflow will:

- find the TASK issue,
- add a status comment,
- dispatch `task-unlocked` to each unlocked repo,
- send a Lark project report,
- skip Project movement unless Project variables are configured.

Important: if `unlocked_repos` contains any child repository, the workflow
requires `LIVEMASK_BOT_TOKEN`. The default `GITHUB_TOKEN` can comment on the
current repository, but it cannot create `repository_dispatch` events in sibling
repositories. The script fails before writing the TASK Issue comment when this
token is missing, so the audit trail cannot claim a repo was unlocked when no
dispatch was sent.

## 4. Issue Comment Sync Flow

When a developer posts a standard AI completion report to a TASK issue,
`task-sync.yml` can parse the comment if it contains:

- `/task-sync`, or a level-2 heading named `任务完成报告` / `Task Completion Report`
- `TASK ID`
- `Result`
- `Unlocked Repositories`

Unrelated comments are ignored. Comments from GitHub bot users are ignored to
avoid automation feedback loops. The workflow-generated `AI Task Sync` audit
comment is intentionally not a trigger phrase.

## 5. Child Repo Consumer Contract

Child repos should eventually listen for:

```yaml
on:
  repository_dispatch:
    types:
      - task-unlocked
```

The first useful consumer is compatibility CI. For example, when Backend unlocks
`livemask-admin`, Admin can run API client generation or contract checks.

Current baseline: all child repositories must include `task-unlocked` in their
existing `repository_dispatch` CI workflow triggers. This guarantees that a
sync event is not silently dropped.

## 6. Project Automation

Project auto movement requires ProjectV2 node IDs. Keep it disabled until the
project fields are confirmed. The workflow is designed to skip this step safely
when variables are absent.

## 7. Failure Modes

| Failure | Behavior |
| --- | --- |
| TASK issue not found | Workflow fails; create the issue first |
| Lark secret missing | Lark notification skips; sync still succeeds |
| Child repo unlock requested but `LIVEMASK_BOT_TOKEN` is missing | Workflow fails before writing the Issue comment |
| Unlocked repo dispatch fails | Workflow fails; fix token or repo access |
| Project variables missing | Project move skips; sync still succeeds |
| Comment cannot be parsed | Workflow exits with neutral skip |

## 8. Required Token Closure

`LIVEMASK_BOT_TOKEN` must be available to `livemask-docs` Actions whenever
task sync needs to unlock another repository.

Recommended setup:

```bash
gh secret set LIVEMASK_BOT_TOKEN \
  --org MyAiDevs \
  --visibility selected \
  --repos livemask-docs
```

The token owner must have access to all repositories that can be unlocked:

- `livemask-backend`
- `livemask-nodeagent`
- `livemask-app`
- `livemask-admin`
- `livemask-website`
- `livemask-ci-cd`

Minimum practical permissions:

- `livemask-docs`: Issues read/write, Contents read
- child repositories: Contents read/write or repository administration scope
  sufficient for `POST /repos/{owner}/{repo}/dispatches`
- Metadata read

Validation command after the secret is configured:

```bash
gh workflow run task-sync.yml \
  --repo MyAiDevs/livemask-docs \
  --ref main \
  -f task_id=TASK-INFRA-002 \
  -f result=partial \
  -f summary="Task sync closure validation." \
  -f verification="Expect repository_dispatch to start livemask-backend CI." \
  -f unlocked_repos="livemask-backend" \
  -f blocked_repos="" \
  -f next_steps="Confirm backend task-unlocked run."
```

## 9. Closure Assumption Matrix

Before relying on task sync for multi-window development, verify these scenarios:

| Assumption | Expected result | Current guard |
| --- | --- | --- |
| Human manually syncs a TASK | Issue comment is created, Lark report is sent | `workflow_dispatch` |
| Human posts a completion report comment | Comment parser extracts task/result/repos | `issue_comment.created` with explicit trigger phrase |
| Workflow posts its own audit comment | No second sync run is created | bot comments ignored + generated title is not a trigger phrase |
| TASK Issue does not exist | Workflow fails loudly | `find_task_issue()` hard failure |
| `unlocked_repos` contains a typo | Workflow fails before dispatch | repo allowlist in `task-sync.py` |
| Child repo unlock is requested without bot token | Workflow fails before Issue comment | `LIVEMASK_BOT_TOKEN` preflight |
| Unlocked child repo exists but has no consumer | CI would not run; this is invalid | child workflows must listen to `task-unlocked` |
| Lark secrets are missing | Sync still succeeds, Lark step skips | `lark-notify.sh` skip behavior |
| Project variables are missing | No Project move happens | Project movement is documented but disabled |
| Same TASK receives multiple syncs | Multiple comments become audit history | issue comments are append-only evidence |
| `LIVEMASK_BOT_TOKEN` lacks repo access | Dispatch/comment fails loudly | GitHub API errors fail workflow |

## 10. Recommended Next Step

After this automation is merged, create GitHub Issues for:

- `TASK-INFRA-002`
- `TASK-P0-03`
- the next active app/admin/nodeagent tasks

Then start using `task-sync.yml` after each meaningful completion report.
