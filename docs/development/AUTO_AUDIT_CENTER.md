# Auto Audit Center

This document defines the docs-side automatic audit mechanism for the LiveMask
multi-repo task center. It is a reproducible audit layer, not a hidden memory
layer and not an automatic code executor.

## 1. Purpose

The audit center must answer these questions from repo-native state:

- What is completed, and what evidence proves it?
- What is open, blocked, or evidence-missing?
- Which next tasks are safe to dispatch?
- Which governance checks should block CI, and which should warn only?
- Which findings are based on concrete files instead of chat memory?

## 2. Audit Layers

| Layer | Meaning | Blocks? | Examples |
| --- | --- | --- | --- |
| Gate | Deterministic invariant violation | Yes | Invalid ledger JSON, missing task doc, completed runtime task without `dev_merge_commit`, remote dev ref mismatch |
| Warning | Real drift or missing metadata that may be valid during migration | No | Missing Issue reference, blocked/evidence-missing task, historical docs task without full merge evidence |
| Suggestion | Next action or task-dispatch hint | No | Ready task with no blockers, module open gap, next task queue |

Only gate findings should fail `bash scripts/check-docs.sh`. Warnings and
suggestions must be visible but must not block local docs work unless a future
task explicitly promotes that rule to a gate.

## 3. Source Of Truth

The default audit is offline and reads only repo-native files:

- `docs/development/task-state-ledger.json`
- `docs/development/tasks/*.md`
- `docs/development/AI_PROJECT_STATUS_ONBOARDING.md`
- `docs/development/CODEX_TASK_DISPATCHER_ROLE.md`
- docs validation scripts

GitHub Issues, GitHub Actions runs, remote refs, and runtime repo state are
future optional audit inputs. They must be added as opt-in checks so the base
docs audit remains reproducible without network credentials.

## 4. Command

```bash
python3 scripts/audit-task-center.py
python3 scripts/audit-task-center.py --verbose
python3 scripts/audit-task-center.py --format json
python3 scripts/audit-task-center.py --log-file .local-dev/logs/auto-task-center.log
```

`bash scripts/check-docs.sh` runs the text audit and fails only on gate
findings. The default text report summarizes warnings and suggestions by rule
to keep CI output readable; use `--verbose` or `--format json` for full details.

Every audit run appends a JSON Lines record to
`.local-dev/logs/auto-task-center.log` by default. The log entry includes:

- `logged_at`
- `tool`
- `argv`
- `cwd`
- `exit_code`
- `summary`
- full `report`

The `.local-dev/` directory is ignored by git, so audit history remains local
and traceable without polluting commits. Use `--log-file` to write a different
path when a CI job wants to upload the log as an artifact. Use `--no-log` only
for exceptional parser tests where no audit trail should be written.

## 5. JSON Contract

The JSON report contains:

- `schema_version`
- `audit_scope`
- `summary`
- `generated_at`
- `log_file`
- `gates`
- `warnings`
- `suggestions`
- `next_task_queue`

Each finding includes:

- `severity`
- `rule_id`
- `message`
- `task_id`
- `module_id`
- `repo`
- `evidence`

## 6. Current Gate Rules

- Ledger file exists and is valid JSON.
- Modules and tasks have valid shape.
- Module and task statuses are listed in `status_values`.
- Task repositories are listed in `repos`.
- Task IDs are valid and unique.
- Task docs exist and mention their TASK ID.
- Git SHAs are valid when present.
- Completed tasks include validation evidence.
- Completed runtime tasks include `dev_merge_commit` and `remote_dev_ref`.
- Completed runtime task `dev_merge_commit` equals `remote_dev_ref`.
- Completed modules cannot contain open tasks.
- Open modules cannot list only closed tasks.
- Blockers and unlocks must reference TASK IDs present in the ledger.

## 7. Current Warning Rules

- Task has no Issue reference in the ledger.
- Task remains `blocked` or `evidence_missing`.

## 8. Current Suggestion Rules

- Ready task has no blockers and can be considered for dispatch.
- Open module gap should remain visible in next-task planning.
- Ready and in-progress tasks are emitted in `next_task_queue`.

## 9. Guardrails

- The audit script must not edit files.
- The audit script must not create, close, or reopen Issues.
- The audit script must not dispatch Cursor tasks by itself.
- Any future network check must be opt-in and must record the exact source used.
- Any rule promoted from warning to gate must have a dedicated TASK and docs
  update explaining the migration path.

## 10. Future Extensions

- Optional GitHub Issue audit using `LIVEMASK_BOT_TOKEN`.
- Optional remote `origin/dev` verification across runtime repos.
- Optional GitHub Actions workflow result audit.
- Lease registry audit is now handled by `scripts/check-task-leases.py`.
- Guarded close/reopen automation is now handled by
  `livemask-ci-cd/scripts/issue-close-guard.sh`.
