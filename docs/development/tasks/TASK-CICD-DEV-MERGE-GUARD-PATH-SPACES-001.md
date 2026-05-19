# TASK-CICD-DEV-MERGE-GUARD-PATH-SPACES-001 - Dev Merge Guard Path Spaces Fix

- 状态：Completed
- Owner：CI/CD
- 创建日期：2026-05-20
- 完成日期：2026-05-20
- 主影响仓库：`livemask-ci-cd`
- 受影响仓库：`livemask-docs`
- 关联里程碑：Development Governance / CI-CD Safety

## 1. Background

`livemask-ci-cd/scripts/dev-merge-guard.sh` is the required path for merging
task branches into `dev`. The local workspace path includes a space:
`/Users/sammytan/Documents/New project 2`. Guard operations must therefore be
safe when repo paths contain spaces.

This task closes the follow-up raised by `TASK-APP-INTEGRITY-RECONCILE-001`.

## 2. Scope

### In Scope

- Make `dev-merge-guard.sh` safe for repo paths containing spaces.
- Resolve repo paths consistently before validation and dry-run output.
- Preserve existing guarded merge semantics.
- Sync completion evidence to `livemask-docs`.

### Out of Scope

- No change to core guard merge policy.
- No branch protection policy change.
- No changes to runtime services or smoke domains.

## 3. Implementation Summary

- `scripts/dev-merge-guard.sh` now uses `cd -- "${repo}"` and `pwd -P`.
- `run_validation` uses `cd -- "${repo}"`.
- Dry-run output now includes resolved path, task ref, rescue branch,
  integration branch, and push mode.
- No core guard semantics changed.

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-ci-cd` | Fix guarded merge path handling for workspace directories with spaces | 是 | Shell syntax check, help output, dry-run, full `--push` guarded merge |
| `livemask-docs` | Sync completed status, evidence, and task ledger | 是 | `bash scripts/check-docs.sh` |
| Other LiveMask repos | Continue using the guard as the required dev merge path | 否 | Covered by future guarded merges |

## 5. Validation

| Check | Result |
| --- | --- |
| `bash -n scripts/dev-merge-guard.sh` | PASS |
| `bash scripts/dev-merge-guard.sh --help` | PASS |
| Dry-run from spaced path | PASS |
| Full merge run with `--push` | PASS |
| Integration validation | PASS |
| Dev validation | PASS |
| Push `origin/dev` | PASS |

## 6. Dev Merge Evidence

| Field | Value |
| --- | --- |
| Repository | `livemask-ci-cd` |
| Task branch commit | `716209c` |
| Integration merge commit | `37c763a` |
| Dev merge commit | `e18ddf0` |
| Remote dev ref at completion | `e18ddf0` |
| Evidence status | Complete |

Note: `livemask-ci-cd origin/dev` may now be newer due later `.cursorrules`
governance commit.

## 7. Blockers

None.

## 8. Rollback

- Revert the `livemask-ci-cd` commits from this task if the guard blocks a
  legitimate merge.
- Re-run `bash -n scripts/dev-merge-guard.sh`,
  `bash scripts/dev-merge-guard.sh --help`, and a dry-run from the spaced
  workspace path before attempting any guarded merge.

## 9. Follow-up

- 未完成项：none.
