# Cursor Task Brief Template

Use this template whenever `livemask-docs` dispatches a new Cursor / Codex task.
The goal is to make every task scoped, verifiable, and easy to reconcile later.

## Task Brief

```markdown
## Cursor Task Brief

TASK ID:
Parent / Epic TASK:
Target repo:
Branch:
Priority:
Environment:
Lease:
- registry: `docs/development/task-leases.json`
- lease_owner:
- expected_files:
- expires_at:

### Why
- 

### Must Read First
- `docs/development/tasks/...`
- `docs/contracts/...`
- `docs/development/cursor-handoffs/...`
- Repo-local `.cursorrules`

### In Scope
- 

### Out of Scope / Do Not Touch
- 

### Expected Files / Areas
- 

### Lease Start / End
- Before editing, register or verify the active lease for this task in
  `docs/development/task-leases.json`.
- The lease must include `task_id`, `repo`, `branch`, `expected_files`,
  `lease_owner`, `started_at`, `expires_at`, `depends_on`, `blocked_by`, and
  `status`.
- Run `python3 scripts/check-task-leases.py` before edits when the task touches
  shared docs/governance files.
- Mark the lease `ended` in the docs completion update, or explain why no
  lease entry was used.

### Contract / API Rules
- 

### Implementation Requirements
- 

### Validation Required On Task Branch
- 

### Dev Merge Requirement
- Merge through `livemask-ci-cd/scripts/dev-merge-guard.sh` or equivalent guard evidence.
- Re-run validation on `dev`.
- Push `origin/dev`.

### Completion Report Must Include
- TASK ID
- Repository / Branch / Commit
- Task Branch / Commit
- Dev Merge Commit
- Remote dev Ref
- Tests and validation on `dev`
- Docs handoff evidence
- Unlocked repos
- Blocked repos
- Risks / skips / follow-up TASK

### Docs Handoff
- Docs update owner: `livemask-docs`
- Runtime repo must not edit `../livemask-docs`
- Task ledger update needed: yes / no
- GitHub Issue sync needed: yes / no

### Next Unlock Conditions
- 
```

## Dispatch Rules

- Do not dispatch a Cursor task without a `TASK ID`.
- Do not dispatch a runtime repo task until the contract or task doc it depends
  on is stable enough for implementation.
- If two tasks may touch the same repo and same file area, assign an explicit
  lease order or split expected files.
- Active leases are tracked in `docs/development/task-leases.json`; overlapping
  active leases for the same repo and expected file area must be resolved before
  dispatch.
- If a task is a smoke task, list existing scripts before instructing Cursor to
  edit or create scripts.
- If a task is App, Admin, Website, Backend, NodeAgent, Job Service, or CI/CD,
  the task brief must say that runtime repos must not edit `../livemask-docs`.

## Reconciliation Fields

Every dispatched task should be added or updated in
`docs/development/task-state-ledger.json` with:

- `task_id`
- `repo`
- `status`
- `task_doc`
- `dev_merge_commit`
- `remote_dev_ref`
- `issue`
- `validation`
- `blocked_by`
- `unlocks`
- `notes`

## Lease Registry Fields

Each active lease entry should include:

- `task_id`
- `repo`
- `branch`
- `expected_files`
- `lease_owner`
- `started_at`
- `expires_at`
- `ended_at`
- `depends_on`
- `blocked_by`
- `status`
