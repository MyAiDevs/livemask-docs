# Issue, Task Sync, And Multi-Window Governance

Task: `TASK-DOC-ISSUE-TASK-SYNC-GOVERNANCE-001`

Status: Ready

Owner: Docs / CI-CD / All Repositories

## 1. Why This Exists

LiveMask is developed across many repositories and many Cursor/Codex windows at
the same time. A single feature often spans Docs, Backend, NodeAgent, Job
Service, Admin, Website, App, and CI/CD.

The previous task-sync model was too coarse:

```text
completed / partial / blocked
```

This caused several failure modes:

- A single repository reported `completed` while the cross-repo feature was not
  closed.
- CI/CD smoke tasks reported `completed` while many steps were still valid
  `SKIP`.
- Parent/Epic issues were treated like child implementation issues.
- A Cursor window finished one task and started a second/third task while other
  windows still interpreted the first task as incomplete or not unlocked.
- Completion reports were treated as Issue close signals.

This document fixes the governance rule:

```text
Completion reports are events.
Issue state is derived from the task state machine.
Issue closure requires verification gates, not just a report.
```

## 2. Issue Types

| Issue Type | Purpose | Close Condition |
| --- | --- | --- |
| Epic Issue | Cross-repo feature or module, e.g. Protocol Capability Sync, I18N, Observability | All child issues Done + final CI/CD smoke PASS + no remaining SKIP blockers |
| Child Issue | One repo / one implementation task, e.g. Backend Protocol Capability | Repo task Done and pushed, tests pass, no local blockers |
| Verification Issue | CI/CD, QA, smoke, staging validation | Verification PASS or explicitly accepted with documented SKIP blockers |
| Docs Contract Issue | Cross-repo contract and task planning | Docs check PASS, contract indexed, follow-up tasks registered |

An Epic Issue MUST NOT close just because one Child Issue is complete.

## 3. Task State Machine

Allowed implementation statuses:

```text
draft
ready
in_progress
implemented
review
verified
completed
completed_with_skip
blocked
deferred
cancelled
```

Meaning:

| Status | Meaning | Can close child issue? | Can close epic issue? |
| --- | --- | --- | --- |
| `implemented` | Code/docs are implemented in one repo; downstream or final verification may still be pending | No by default | No |
| `verified` | Repo-local verification passed | Maybe, if no downstream blockers | No |
| `completed` | Child task is fully done and can close | Yes | Only if all children and final smoke are done |
| `completed_with_skip` | Task is structurally complete, but smoke has known SKIP paths | No unless Verification Issue explicitly accepts | No |
| `blocked` | Cannot proceed | No | No |
| `deferred` | Intentionally postponed | Only if scoped out by owner | No |

Cursor windows MUST NOT jump directly from `in_progress` to Epic `completed`.

## 4. Lease Rules For AI Windows

Each Cursor/Codex window must treat work as a lease.

### 4.1 Lease Start

Before editing, the window must know:

```text
task_id
repo
parent_task_id
branch
expected_files
depends_on
blocked_by
```

If this is posted as an Issue comment, use:

```text
## TASK LEASE START

task_id:
repo:
parent_task_id:
branch:
expected_files:
depends_on:
blocked_by:
lease_owner:
started_at:
```

### 4.2 Lease End

Before starting a second task in the same window, the first task must have:

- commit created or explicit no-code reason
- push completed when repo changes were made
- tests/checks run or blocker documented
- completion report posted
- task-sync triggered when meaningful

Use:

```text
## TASK LEASE END

task_id:
repo:
result:
implementation_status:
verification_status:
commit:
tests:
blockers:
unlocked:
still_blocked:
next_task:
```

### 4.3 Single Active Lease Rule

One window may work through multiple tasks sequentially, but it must not mix
multiple unrelated TASK completion reports. If a window starts a second task,
the first task must be formally ended.

## 5. Completion Report Template

Every completion report must include this structured block.

```text
TASK RESULT

task_id:
repo:
branch:
commit:
task_branch:
task_branch_commit:
dev_merge_commit:
remote_dev_ref:
parent_task_id:
result: implemented | verified | completed | completed_with_skip | blocked | deferred
implementation_status:
verification_status:
skip_count:
depends_on:

tests:
- unit:
- build:
- smoke:
- docs:

skip_paths:
- none OR exact SKIP list with reason

blockers:
- none OR exact blocker list

unlocked:
- repo/task/reason

still_blocked:
- repo/task/reason

issue_action:
- comment_only
- ready_for_review
- close_child_issue
- keep_parent_open
- reopen_required
```

Rules:

- `completed_with_skip` is not equivalent to `completed`.
- `implemented` is not equivalent to `verified`.
- `issue_action` defaults to `comment_only`.
- Parent issues default to `keep_parent_open`.
- If smoke has SKIP paths that represent missing implementation, parent issue
  must stay open.

## 6. Issue Close/Reopen Rules

### 6.1 Child Issue May Close Only If

- repo task result is `completed`
- commit is pushed or no-code task is explicitly documented
- tests/checks pass or accepted limitations are documented
- no unexplained blockers
- docs/contracts updated if fields, APIs, states, configs, or events changed
- task-sync audit comment exists
- result is not `completed_with_skip`

### 6.2 Epic Issue May Close Only If

- all child issues are closed or explicitly deferred by owner
- final CI/CD smoke PASS
- no remaining SKIP blockers
- no downstream repo still blocked
- release/staging verification is recorded when required
- owner explicitly sets `issue_action=close_child_issue` only for child issues,
  and Epic closure is handled by owner/QA after final verification

### 6.3 Reopen Required If

- a downstream repo reports contract mismatch
- CI/CD converts a previous SKIP into FAIL
- a "completed" task is discovered to have unimplemented required endpoints
- Admin/Website/App uses mock data in production path
- security/redaction test fails

## 7. Task Sync Structured Fields

Task sync must carry structured fields:

| Field | Required | Purpose |
| --- | --- | --- |
| `task_id` | yes | Current TASK. |
| `repo` | recommended | Repo that produced the event. |
| `parent_task_id` | recommended | Epic/cross-repo parent. |
| `result` | yes | One of implemented/verified/completed/completed_with_skip/blocked/deferred. |
| `task_branch` | required for completed when a task branch was used | Task branch merged through `dev-merge-guard.sh`. |
| `task_branch_commit` | recommended | Commit on the task branch. |
| `dev_merge_commit` | required for completed | Merge commit or dev commit after guarded merge. |
| `remote_dev_ref` | required for completed | `origin/dev` ref after push. |
| `implementation_status` | recommended | Free-form repo implementation state. |
| `verification_status` | recommended | Unit/build/smoke/docs state. |
| `skip_count` | recommended | Number of SKIP paths. |
| `blockers` | recommended | Concrete blockers. |
| `unlocked_repos` | optional | Repos that can begin work. |
| `blocked_repos` | optional | Repos still blocked. |
| `issue_action` | recommended | Defaults to `comment_only`. |
| `should_close_issue` | recommended | Defaults to `false`. |

Default behavior:

```text
should_close_issue=false
issue_action=comment_only
```

Automation must not close issues unless explicit future implementation adds a
guarded close path and the close conditions in this document are satisfied.

For `completed`, task-sync must reject reports that do not include
`dev_merge_commit` and `remote_dev_ref`. A feature branch test or smoke result is
not sufficient completion evidence.

Task-sync is owned by the `livemask-docs` window. Runtime repositories must not
run task-sync as a substitute for updating the docs ledger. They must hand off
completion evidence to `livemask-docs`; the docs window updates MVP/task/handoff
state and then triggers task-sync when appropriate.

The `livemask-docs` window must also synchronize GitHub Issues. For every
completion report, it must search for an existing Issue by TASK ID and repo
before creating anything new. Existing Issues are updated with completion
evidence, current status, blockers, unlocked repos, next tasks, and links to the
updated docs ledger. A new Issue is created or explicitly registered only when
no suitable Issue exists and the task is ready to execute.

When a TASK starts from a plain-language request or bug report, task-sync must
not be used as the first record. The runtime repo must first perform TASK intake,
generate a TASK ID, implement and merge through dev, then hand off completion
evidence to `livemask-docs`. The docs window creates or updates the TASK file
and only then runs task-sync.

After processing a report, the `livemask-docs` window must summarize module
state and assign the next Cursor tasks. The summary must distinguish:

- modules with `completed` evidence on `dev` and `origin/dev`;
- modules that are `partial`, `blocked`, or `evidence_missing`;
- repos that are unlocked for parallel work;
- repos still blocked and the concrete unblock condition;
- missing runtime smoke, contract, UI, Backend, App, NodeAgent, CI/CD, QA, or
  runbook evidence.

If no next task exists in the current task ledger but the project is not landed,
the `livemask-docs` window must scan project documents, contracts, handoffs,
runbooks, QA matrices, and existing task state, then create new `TASK-*.md`
entries and update the task ledger before issuing Cursor briefs.

## 8. CI/CD SKIP Rules

CI/CD smoke tasks may report:

```text
completed_with_skip
```

only when:

- all steps are accounted for
- each SKIP has a concrete dependency reason
- secret leak scan still runs
- future task names are listed for every implementation-dependent SKIP

Once the dependency endpoint/feature is implemented, that SKIP must become PASS
or FAIL. A deployed endpoint returning 404 should fail, not skip.

## 9. Cursor Rules For All Repositories

Every repository `.cursorrules` or equivalent AI rule file must include:

```text
Issue/Task Governance Rule:
Completion reports are status events, not Issue close signals.
Use implemented/verified/completed/completed_with_skip/blocked/deferred.
Never mark an Epic complete from a child repo.
Never treat CI SKIP as feature completion.
Before starting a second task in the same window, end the current task lease
with commit/test/blocker evidence.
Do not unlock downstream repos unless the contract they depend on is stable.
Runtime repos must not edit ../livemask-docs directly.
Only the livemask-docs window updates MVP/task/handoff/contract ledger state and
runs task-sync.
Plain-language user requests must go through TASK intake before code changes.
When processing completion reports, livemask-docs must update existing GitHub
Issues, summarize completed/unfinished modules, and assign or create the next
Cursor tasks. If the ledger has no next task but the project is not landed,
scan the project and create new TASK docs before dispatching work.
```

## 10. Follow-Up Tasks

| TASK | Repo | Scope |
| --- | --- | --- |
| `TASK-CICD-TASK-SYNC-GOVERNANCE-001` | `livemask-docs` / `livemask-ci-cd` | Upgrade task-sync workflow/scripts to structured result fields and safer comments. |
| `TASK-DOC-AI-RULES-SYNC-001` | `livemask-docs` + all repos | Sync the governance rule into `.cursorrules` / Copilot instructions for every repo. |
| `TASK-CICD-ISSUE-CLOSE-GUARD-001` | `livemask-ci-cd` | Optional future guard for issue close/reopen automation. |

## 11. Done Criteria

- Governance document exists and is indexed.
- Task-sync docs explain structured states.
- Workflow/script accept extended result statuses.
- Completion reports no longer imply Issue closure.
- Cursor rules can be copied into all repositories.
- Docs check passes.
