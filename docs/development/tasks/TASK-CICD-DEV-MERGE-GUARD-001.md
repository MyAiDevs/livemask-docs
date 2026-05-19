# TASK-CICD-DEV-MERGE-GUARD-001 - Guarded Dev Merge Workflow

- 状态：Done
- Owner：CI/CD / Docs / All repos
- 创建日期：2026-05-20
- 目标完成日期：2026-05-20
- 主影响仓库：`livemask-ci-cd`
- 受影响仓库：`livemask-docs`, `livemask-backend`, `livemask-admin`, `livemask-app`, `livemask-nodeagent`, `livemask-job-service`, `livemask-website`
- 关联里程碑：Development Governance / CI-CD Safety

## 1. Background

LiveMask 多仓库 task 分支曾出现机械批量合并和脏工作区混合操作，导致
`dev` 集成状态难以审计。只写“合并到 dev”的规则不够，必须把危险命令变成
默认不可执行：一次只允许合并一个 task 分支，先在 integration 分支验证，再合并
到 `dev`，并且 task-sync 必须校验 dev merge evidence。

## 2. Scope

### In Scope

- `livemask-ci-cd/scripts/dev-merge-guard.sh`
- `livemask-ci-cd/scripts/apply-branch-protection.sh`
- `livemask-ci-cd/scripts/validate-dev-ref.sh` 继续作为 dev-only smoke ref guard
- `livemask-docs/scripts/task-sync.py` completed evidence gate
- `.github/workflows/task-sync.yml` 新增 dev merge evidence inputs
- 全部相关仓库 `.cursorrules` 强制通过 guard 合并
- GitHub branch protection baseline：禁止 force push 和删除分支

### Out of Scope

- 不强制绑定 required status check 名称；待各 repo CI 名称稳定后再收紧。
- 不自动修复已有的业务代码冲突或历史错误 merge。
- 不允许 `git reset --hard`、force push、删除 volume 或清理他人改动。

## 3. Contracts

- API：无运行时 API 变更
- Config：无运行时 config 变更
- Events：task-sync `completed` 事件必须包含 `dev_merge_commit` 和 `remote_dev_ref`
- Error Codes：无
- State Machines：task completion 从 task branch precheck → guarded dev merge → dev validation → push origin/dev → completed

## 4. Cross-Repo Impact

| 仓库 | 影响 | 必须修改 | 验证方式 |
| --- | --- | --- | --- |
| `livemask-ci-cd` | 新增 guard / branch protection 脚本 | 是 | `bash -n`, dry-run, dev ref rejection |
| `livemask-docs` | 更新规则、task-sync、总文档 | 是 | `bash scripts/check-docs.sh` |
| `livemask-backend` | `.cursorrules` 强制 guard | 是 | `git diff --check` |
| `livemask-admin` | `.cursorrules` 强制 guard | 是 | `git diff --check` |
| `livemask-app` | `.cursorrules` 强制 guard | 是 | `git diff --check` |
| `livemask-nodeagent` | `.cursorrules` 强制 guard | 是 | `git diff --check` |
| `livemask-job-service` | `.cursorrules` 强制 guard | 是 | `git diff --check` |
| `livemask-website` | `.cursorrules` 强制 guard | 是 | `git diff --check` |

## 5. Role Handoff Chain

| Step | From | To | Handoff Evidence | Blocker |
| --- | --- | --- | --- | --- |
| 1 | Owner | CI/CD | Required safety gates | Missing branch policy |
| 2 | CI/CD | All repo windows | `dev-merge-guard.sh` usage | Repo bypasses guard |
| 3 | Docs | Cursor windows | `.cursorrules` and completion report rules | Inconsistent repo rules |
| 4 | CI/CD | GitHub | Branch protection baseline | Missing admin permission |
| 5 | QA | Owner | Validation and task-sync evidence | task-sync failure |

## 6. Implementation Plan

- [x] Add guarded one-task merge script.
- [x] Add branch protection helper.
- [x] Require dev-only CI/CD smoke refs.
- [x] Require task-sync dev merge evidence for `completed`.
- [x] Update all related `.cursorrules`.
- [x] Apply branch protection baseline where branches exist.

## 7. Validation Plan

- [x] `bash -n scripts/dev-merge-guard.sh`
- [x] `bash -n scripts/apply-branch-protection.sh`
- [x] `bash -n scripts/validate-dev-ref.sh`
- [x] `validate-dev-ref.sh` accepts `dev`
- [x] `validate-dev-ref.sh` rejects `task/foo`
- [x] task-sync rejects `completed` without `dev_merge_commit` / `remote_dev_ref`
- [x] `bash scripts/check-docs.sh`
- [x] `git diff --check`

## 8. Risks

| 风险 | 影响 | 缓解措施 | Owner |
| --- | --- | --- | --- |
| Repo CI check names not stable | Cannot safely require named checks yet | Start with no force push / no deletion; add required checks later | CI/CD |
| Existing dirty worktrees | Guard refuses merge | Clean worktree or new worktree required | Repo owner |
| Missing branch, such as `livemask-job-service/main` | Protection script cannot apply | Script skips missing branch and reports it | CI/CD |

## 9. Rollback

- 回滚触发条件：guard script blocks legitimate merges due to script bug.
- 回滚步骤：revert `TASK-CICD-DEV-MERGE-GUARD-001` commits in affected repo, then fix script on a new task.
- 回滚验证：repo can still merge via explicitly approved manual process and branch protection remains no-force/no-delete.

## 10. Completion Evidence

- Issue：`https://github.com/MyAiDevs/livemask-docs/issues/9`
- `livemask-ci-cd`: `5508082`
- `livemask-docs`: `f286125`, `0e849c0`
- `livemask-backend`: `9171177`
- `livemask-admin`: `a496d41`
- `livemask-app`: `ac46370`
- `livemask-nodeagent`: `f31cdeb`
- `livemask-job-service`: `6b70c7b`
- `livemask-website`: `252815b`
- Branch protection：all existing `dev` / `main` branches have `allow_force_pushes=false` and `allow_deletions=false`; `livemask-job-service/main` does not exist and was skipped.

## 11. Follow-up

- 后续 TASK：add required status checks once CI check names are stable.
- 未完成项：none for the baseline guard.
