# AI Project Status Onboarding

> START HERE for any AI development tool: Codex, Cursor, Windsurf, Copilot, or a
> human operator using an AI assistant.

This file exists so project state is recoverable from the repository itself. Do
not rely on Codex memory, local chat history, browser tabs, or a human summary
before starting work.

## 1. What This Repository Does

`livemask-docs` is the LiveMask task dispatch, contract, design handoff, and
multi-repo governance source of truth.

Implementation code lives in sibling runtime repositories:

- `livemask-backend`
- `livemask-nodeagent`
- `livemask-app`
- `livemask-admin`
- `livemask-website`
- `livemask-job-service`
- `livemask-ci-cd`

Runtime repositories must not directly edit `../livemask-docs` to close tasks.
They output completion reports; the docs dispatcher updates this repository.

## 2. First Five Files To Read

Read these in order before starting or continuing any task:

1. `docs/development/AI_PROJECT_STATUS_ONBOARDING.md` — this file.
2. `docs/development/task-state-ledger.json` — machine-readable current module
   and task snapshot.
3. `docs/development/MVP_IMPLEMENTATION_PLAN.md` — human-readable cross-repo
   status table and roadmap.
4. `docs/development/tasks/README.md` — TASK index, completion evidence, and
   next-phase task lists.
5. `docs/development/CODEX_TASK_DISPATCHER_ROLE.md` — what Codex/docs dispatcher
   does when reports arrive and when new tasks are dispatched.

Then read the exact `TASK-*.md`, contract, handoff, QA, or runbook files for the
task you are touching.

## 3. Current Project Phase

Current phase: **multi-repo dev integration with docs-side intelligent task
dispatch and reconciliation**.

The project is not considered fully landed. Many implementation tracks have dev
evidence, but some cross-repo modules still need real runtime smoke, strict
Issue sync, lease collision prevention, and platform-specific validation.

The current machine-readable module state is in
`docs/development/task-state-ledger.json`. If this file and a human-readable doc
disagree, do not guess. Treat it as drift, report it, and update the docs ledger
through a TASK.

## 4. Completed Governance Capabilities

The docs-side intelligent workflow has these completed building blocks:

| Capability | Source |
| --- | --- |
| Completion report intake and next-task dispatch governance | `docs/development/tasks/TASK-DOCS-COMPLETION-REPORT-DISPATCH-GOVERNANCE-001.md` |
| Codex dispatcher role source of truth | `docs/development/CODEX_TASK_DISPATCHER_ROLE.md` |
| Machine-readable task state ledger | `docs/development/task-state-ledger.json` |
| Ledger validation in docs checks | `scripts/check-task-state-ledger.py` |
| Standard Cursor task brief template | `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md` |

Validation command:

```bash
bash scripts/check-docs.sh
```

## 5. Known Open Governance Gaps

These are intentional, tracked gaps, not memory-only notes:

| Gap | TASK | Status |
| --- | --- | --- |
| Cross-repo Issue lookup/update by TASK ID | `TASK-CICD-ISSUE-SYNC-STRICT-001` | Ready |
| Active Cursor lease registry / collision detection | `TASK-DOCS-LEASE-REGISTRY-001` | Ready |
| Full historical backfill into `task-state-ledger.json` | Follow-up as reports are processed | Incremental |

Do not claim the governance-control-plane module is fully completed while these
ready tasks remain open. Its current ledger state should remain `partial`.

## 6. Current High-Priority Product/Runtime Gaps

Use `task-state-ledger.json` and `MVP_IMPLEMENTATION_PLAN.md` for the full
snapshot. The currently visible high-priority gaps include:

| Module | Gap | Next TASK |
| --- | --- | --- |
| Protocol stability | App reconnect runtime must cut over to real Backend APIs | `TASK-APP-RECONNECT-RUNTIME-REAL-BACKEND-001` |
| Protocol stability | CI/CD reconnect hint runtime smoke still needs closure | `TASK-CICD-RECONNECT-HINT-RUNTIME-SMOKE-001` |
| Governance | Cross-repo Issue sync is docs-only/manual today | `TASK-CICD-ISSUE-SYNC-STRICT-001` |
| Governance | Parallel Cursor leases are documented but not enforced | `TASK-DOCS-LEASE-REGISTRY-001` |

Before dispatching any new task, check whether the next task is already present
in the ledger or task README. Prefer existing tasks over inventing new ones.

## 7. How To Process A Cursor Completion Report

When the user sends a report:

1. Read `task-state-ledger.json`, `MVP_IMPLEMENTATION_PLAN.md`,
   `tasks/README.md`, and the related `TASK-*.md`.
2. Confirm dev evidence:
   - task branch commit
   - dev merge commit
   - remote `origin/dev` ref
   - validation rerun on `dev`
3. Check whether contracts, QA, handoffs, and docs need updates.
4. Search/update existing GitHub Issues by TASK ID when tools are available.
5. Update task docs, MVP, task README, and ledger.
6. Summarize modules as completed / partial / blocked / evidence_missing.
7. Dispatch the next task using `CURSOR_TASK_BRIEF_TEMPLATE.md`.
8. Run `bash scripts/check-docs.sh`.
9. Commit and push `dev` for docs-side changes when appropriate.

Never mark a task `completed` from task-branch-only evidence.

## 8. How To Start A New Task

If a user asks for work and no TASK ID is provided:

1. Perform TASK intake.
2. Search existing task docs and ledger for a matching TASK.
3. If no suitable TASK exists, create a new `TASK-*.md`.
4. Add or update `task-state-ledger.json`.
5. Dispatch with `CURSOR_TASK_BRIEF_TEMPLATE.md`.

Do not modify runtime repository code from the docs dispatcher unless the user
explicitly changes the workflow boundary.

## 9. Async Health Check

When asked for project health or when resuming after time has passed:

```bash
bash scripts/check-docs.sh
```

Then inspect:

- `docs/development/task-state-ledger.json`
- `docs/development/MVP_IMPLEMENTATION_PLAN.md`
- `docs/development/tasks/README.md`
- related GitHub Issues and CI runs if tools are available

Report drift explicitly. Do not silently choose one source if ledger, MVP, task
docs, Issue state, or CI evidence disagree.

## 10. Rules That Prevent Wrong Work

- No TASK ID, no implementation.
- No dev merge + origin/dev + validation evidence, no `completed`.
- No direct runtime repo edits to `../livemask-docs`.
- No duplicate Issue creation before searching existing Issues.
- No Epic closure from a single child task.
- No module `completed` state while ledger child tasks are still ready/blocked.
- No new Cursor task without the standard task brief.
