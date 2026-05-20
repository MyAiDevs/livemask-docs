# Cursor Task Brief - TASK-DOCS-LEASE-REGISTRY-001

TASK ID: `TASK-DOCS-LEASE-REGISTRY-001`  
Parent / Epic TASK: `TASK-DOCS-COMPLETION-REPORT-DISPATCH-GOVERNANCE-001`  
Target repo: `livemask-docs`  
Branch: `task/TASK-DOCS-LEASE-REGISTRY-001`  
Priority: P1  
Environment: dev-local

## Why

Parallel Cursor / Codex windows can still collide on the same repo, TASK, or
file area. Strict Issue sync now exists in `livemask-ci-cd`, but it checks Issue
presence, not active edit ownership. A lease registry makes active work visible
before edits begin.

## Must Read First

- `docs/development/AI_PROJECT_STATUS_ONBOARDING.md`
- `docs/development/CODEX_TASK_DISPATCHER_ROLE.md`
- `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`
- `docs/development/task-state-ledger.json`
- `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md`
- `docs/development/tasks/TASK-DOCS-LEASE-REGISTRY-001.md`
- `docs/development/tasks/TASK-CICD-ISSUE-SYNC-STRICT-001.md`

## In Scope

- Define an active lease registry format for docs-side coordination.
- Prefer a repo-native file under `docs/development/` unless the implementation
  clearly needs Issue comments.
- Track at least: `task_id`, `repo`, `branch`, `expected_files`, `lease_owner`,
  `started_at`, `expires_at`, `depends_on`, `blocked_by`, `status`.
- Add a validation/check script that detects overlapping active leases for the
  same repo and expected file area.
- Wire the check into `bash scripts/check-docs.sh` if it is deterministic and
  does not require network.
- Update task docs, `tasks/README.md`, `MVP_IMPLEMENTATION_PLAN.md`, and
  `task-state-ledger.json`.

## Out Of Scope / Do Not Touch

- Do not edit runtime repositories.
- Do not implement Issue close/reopen automation; that is
  `TASK-CICD-ISSUE-CLOSE-GUARD-001`.
- Do not require network access for the base docs validation path.
- Do not make stale leases permanently block work; include expiry or abandon
  semantics.

## Expected Files / Areas

- `docs/development/tasks/TASK-DOCS-LEASE-REGISTRY-001.md`
- `docs/development/task-state-ledger.json`
- `docs/development/ISSUE_TASK_SYNC_GOVERNANCE.md`
- `docs/development/CURSOR_TASK_BRIEF_TEMPLATE.md`
- possible new `docs/development/active-leases.*`
- possible new `scripts/check-task-leases.py`
- `scripts/check-docs.sh`

## Contract / API Rules

- No API contract changes.
- If Issue-comment based leases are proposed, keep it as an optional follow-up;
  local docs checks must remain network-independent.

## Implementation Requirements

- Lease check must fail on two active leases with overlapping `repo` and
  `expected_files`.
- Lease check must pass for disjoint repos or disjoint file areas.
- Expired or ended leases must not block new work.
- Completion report must explain how to start, end, expire, and abandon a lease.

## Validation Required On Task Branch

- `python3 <new lease check script>` if added.
- `bash scripts/check-docs.sh`.
- `git diff --check`.

## Dev Merge Requirement

- Merge through `livemask-ci-cd/scripts/dev-merge-guard.sh` or equivalent guard
  evidence.
- Re-run validation on `dev`.
- Push `origin/dev`.

## Completion Report Must Include

- TASK ID
- Repository / Branch / Commit
- Task Branch / Commit
- Dev Merge Commit
- Remote dev Ref
- Tests and validation on `dev`
- Docs handoff evidence
- Whether lease collision examples were tested
- Unlocked repos
- Blocked repos
- Risks / skips / follow-up TASK

## Docs Handoff

- Docs update owner: `livemask-docs`
- Runtime repo must not edit `../livemask-docs`
- Task ledger update needed: yes
- GitHub Issue sync needed: search existing Issue first

## Next Unlock Conditions

- `TASK-CICD-ISSUE-CLOSE-GUARD-001` can proceed independently.
- Child repo AI rule sync can proceed after lease registry semantics are stable.
