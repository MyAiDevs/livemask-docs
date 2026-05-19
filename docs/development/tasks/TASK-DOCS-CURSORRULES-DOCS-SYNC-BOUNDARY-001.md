# TASK-DOCS-CURSORRULES-DOCS-SYNC-BOUNDARY-001

> Owner: Docs / All Repositories
> Repo: `livemask-docs`
> Status: Ready
> Environment: dev-local

## 1. Background

Several runtime repository windows completed implementation work and then tried
to update `livemask-docs` or trigger task-sync themselves. That made the task
ledger drift from the actual `origin/dev` state and caused completed reports to
mix runtime evidence with documentation state changes.

This task makes the boundary explicit:

- Runtime repositories implement code and provide completion evidence.
- `livemask-docs` owns MVP status, task files, handoffs, contract indexes, and
  task-sync.

## 2. Scope

Update shared AI rules and repo-local `.cursorrules` so every Cursor / Codex
window follows the same docs-sync ownership model.

## 3. Deliverables

- Shared rules state docs-led task ledger ownership.
- Runtime repo `.cursorrules` prohibit direct writes to `../livemask-docs`.
- Runtime repo `.cursorrules` remove instructions to run task-sync directly.
- Docs repo `.cursorrules` requires dev merge evidence before marking runtime
  tasks completed.
- MVP plan and task index reference this governance task.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-docs` | Owns task ledger updates and task-sync. |
| `livemask-backend` | Reports runtime evidence only. |
| `livemask-admin` | Reports runtime evidence only. |
| `livemask-app` | Reports runtime evidence only. |
| `livemask-nodeagent` | Reports runtime evidence only. |
| `livemask-job-service` | Reports runtime evidence only. |
| `livemask-ci-cd` | Reports runtime evidence only unless the task is docs-owned. |
| `livemask-website` | Reports runtime evidence only. |

## 5. Mandatory Behavior

Runtime repositories must not directly edit `../livemask-docs`.

After completing a task, runtime repositories must output only a completion
report with:

- TASK ID
- repository
- task branch / task branch commit
- dev merge commit
- remote dev ref
- validation on dev
- blockers / follow-up tasks

Only `livemask-docs` may update:

- `docs/development/MVP_IMPLEMENTATION_PLAN.md`
- `docs/development/tasks/README.md`
- `docs/development/tasks/TASK-*.md`
- `docs/development/cursor-handoffs/*.md`
- `docs/contracts/**`
- `ai-rules/**`
- repo-level documentation status tables

Only `livemask-docs` may run task-sync for cross-repo task ledger updates.

## 6. Validation

- `bash scripts/check-docs.sh`
- `git diff --check`
- Inspect every repo `.cursorrules` for a `Docs Sync Boundary` section.

## 7. Completion Report Requirements

Completion report must include:

- updated rule files
- affected repositories
- docs check result
- any pre-existing blockers that prevented full validation

