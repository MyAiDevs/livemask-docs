# TASK-CICD-ISSUE-SYNC-STRICT-FIX-001 - Harden Issue Sync Gate

> Status: Completed  
> Repository: `livemask-ci-cd`  
> Environment: dev-local  
> Created: 2026-05-21  
> Completed: 2026-05-21

## 1. Background

After `TASK-CICD-ISSUE-SYNC-STRICT-001` landed, the docs dispatcher reviewed the
new CI/CD gate against the current project flow. The review found that
`staging-smoke.yml` would run strict Issue sync before starting Docker using
`TASK-CICD-ISSUE-SYNC-STRICT-001` as a self-check task.

During docs sync, no matching Issue existed in either `livemask-docs` or
`livemask-ci-cd` for that completed task. That meant staging smoke could fail
before runtime validation because of a project-management consistency check.

## 2. Defects Fixed

1. `staging-smoke.yml` used strict default mode for a migration/self-check task
   and could block all product smoke before Docker startup.
2. `scripts/issue-sync-strict.sh` defaulted to all runtime repos when no `--repo`
   was provided, which could turn a repo-local gate into an all-repo blocker.
3. `issue-sync-strict.yml` scan-all extracted only TASK IDs from the ledger and
   lost the task's primary repo, causing checks to drift toward the wrong repo.
4. `issue-sync-strict.yml` contained unindented embedded Python inside `run: |`,
   which made the workflow YAML invalid.
5. `scripts/issue-sync-strict.sh --help` printed only the separator line.
6. JSON result generation used shell booleans directly in Python source and
   crashed on `false`.
7. Runtime missing Issue failure overwrote the docs-missing exit code.
8. Workflows used only the current repo `github.token`; cross-repo Issue checks
   should prefer `LIVEMASK_BOT_TOKEN` when available.

## 3. Implementation Summary

- Added `--docs-required true|false`.
- Added `--missing-runtime fail|warn`.
- Changed the no-`--repo` default to the current GitHub repo, or
  `livemask-ci-cd` for local runs.
- Expanded and validated comma-separated repo input.
- Kept strict defaults for manual/audit use.
- Updated staging smoke to check only `livemask-ci-cd` for the self-check task
  and to use warning mode while the historical Issue is absent.
- Updated workflow token selection to prefer `LIVEMASK_BOT_TOKEN`, then
  `github.token`.
- Updated scan-all to read `(task_id, repo)` pairs from
  `task-state-ledger.json`.
- Fixed workflow YAML parsing, help output, JSON boolean handling, and exit-code
  precedence.

## 3.1 Validation

On `livemask-ci-cd`:

- `bash -n scripts/issue-sync-strict.sh` PASS
- `bash scripts/issue-sync-strict.sh --help` PASS
- `bash scripts/issue-sync-strict.sh --task-id TASK-CICD-ISSUE-SYNC-STRICT-001 --repo livemask-ci-cd --docs-required false --missing-runtime warn --gh-token dummy --format json` PASS with `overall_exit: 0`
- Strict default missing-Issue path returns exit code `3`
- `bash -n scripts/*.sh` PASS
- `git diff --check` PASS
- Workflow YAML parse with Ruby `YAML.load_file` PASS for:
  - `.github/workflows/issue-sync-strict.yml`
  - `.github/workflows/staging-smoke.yml`
- `bash scripts/dev-merge-guard.sh ... --push` PASS

## 3.2 Merge Evidence

| Field | Value |
| --- | --- |
| Task branch | `task/TASK-CICD-ISSUE-SYNC-STRICT-FIX-001` |
| Task branch commit | `7934d33` |
| Integration branch | `integration/task-cicd-issue-sync-strict-fix-001-task-TASK-CICD-ISSUE-SYNC-STRICT-FIX-001-20260521010020` |
| Integration commit | `fa0166a` |
| Dev merge commit | `ad9f446` |
| Remote dev ref | `origin/dev` at `ad9f446` |
| Rescue branch | `rescue/livemask-ci-cd-dev-before-task-cicd-issue-sync-strict-fix-001-20260521010020` |

## 3.3 Issue Sync Evidence

`gh issue list` found no existing Issue containing
`TASK-CICD-ISSUE-SYNC-STRICT-FIX-001` in:

- `MyAiDevs/livemask-docs`
- `MyAiDevs/livemask-ci-cd`

It also found no existing Issue containing the parent task
`TASK-CICD-ISSUE-SYNC-STRICT-001` in those two repos during this follow-up
check.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-ci-cd` | Fixed Issue sync gate and workflows on `dev`. |
| `livemask-docs` | Records this governance bug and keeps next tasks accurate. |
| Runtime repos | Not modified. Staging smoke is less likely to be blocked by governance self-check drift. |

## 5. Next Steps

- Continue with `TASK-CICD-ISSUE-CLOSE-GUARD-001` after lease registry / Issue
  ownership rules are clear.
- Keep `TASK-DOCS-LEASE-REGISTRY-001` as the next high-priority governance task
  to prevent parallel Cursor windows from editing the same repo/task family.
