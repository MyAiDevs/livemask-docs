# TASK-CICD-WORKSPACE-PATH-MIGRATION-001 — Workspace Path Migration

- Status: Completed
- Owner: DevOps / Docs
- Created: 2026-05-20
- Primary repository: `livemask-ci-cd`
- Affected repositories: `livemask-app`, `livemask-admin`, `livemask-backend`,
  `livemask-nodeagent`, `livemask-job-service`, `livemask-website`,
  `livemask-ci-cd`, `livemask-docs`
- Milestone: Local dev reliability

## 1. Background

The current local LiveMask workspace is under:

```text
/Users/sammytan/Documents/New project 2
```

This path has two known operational problems:

- `Documents` is a macOS managed location and can attach provenance/quarantine
  extended attributes that break Xcode/Flutter codesign for iOS.
- `New project 2` contains spaces, which increases shell-script quoting risk.

The new target workspace root is:

```text
/Users/sammytan/Developer/LiveMask
```

## 2. Scope

In scope:

- Define migration rules for moving all LiveMask repositories to
  `~/Developer/LiveMask`.
- Update docs, `.cursorrules`, local runtime runbooks, and CI/CD scripts to
  avoid hardcoded personal paths.
- Make scripts prefer `LIVEMASK_WORKSPACE_ROOT` when available.
- Ensure Cursor windows work only against the new path after migration.
- Provide verification commands for path discovery, guard merge, local runtime,
  and App iOS safe-workdir builds.

Out of scope:

- Physically moving repositories during this docs task.
- Force-resetting or deleting old working trees.
- Moving secrets, certificates, provisioning profiles, or local keychains.
- Production deployment or release tagging.

## 3. Required Cursor Rules

After migration, every Cursor / Codex window must start by confirming:

```bash
pwd
git remote -v
git branch --show-current
git status --short
```

Rules:

- If `pwd` starts with `/Users/sammytan/Documents/New project 2`, the window must
  stop and reopen the corresponding repo under `/Users/sammytan/Developer/LiveMask`.
- Do not edit, commit, or merge from the old workspace after migration.
- Do not keep old and new copies of the same repo open in Cursor at the same
  time.
- Do not hardcode `/Users/sammytan/Developer/LiveMask` into scripts when
  `LIVEMASK_WORKSPACE_ROOT` can be used.
- Do not claim iOS device build success from the old `Documents` path.
- Runtime repos must not update `livemask-docs` task ledgers directly; docs sync
  remains owned by the docs window.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-app` | iOS/Xcode builds should run from `~/Developer/LiveMask/livemask-app` or the existing safe workdir path to avoid Sequoia xattr/codesign failures. |
| `livemask-ci-cd` | Local runtime and smoke scripts should discover workspace root via `LIVEMASK_WORKSPACE_ROOT` and continue to support paths with spaces defensively. |
| `livemask-docs` | AI rules, task handoffs, and runbooks must document new workspace root and old-path stop rule. |
| `livemask-admin` / `livemask-backend` / `livemask-nodeagent` / `livemask-job-service` / `livemask-website` | Cursor windows must reopen the new repo path and verify `origin/dev` before development. |

## 5. Implementation Plan

1. Create `~/Developer/LiveMask`.
2. Ensure all existing task branches are committed or clean before migration.
3. Re-clone or move each repo into the new workspace.
4. Set environment variable in local shell profile:

   ```bash
   export LIVEMASK_WORKSPACE_ROOT="$HOME/Developer/LiveMask"
   ```

5. Update `livemask-ci-cd` scripts and runbooks so repo discovery uses:

   ```bash
   "${LIVEMASK_WORKSPACE_ROOT:-$HOME/Developer/LiveMask}"
   ```

6. Update `.cursorrules` / AI rules to enforce old-path stop behavior.
7. Reopen every Cursor window from the new path.
8. Run validation from the new workspace.

## 6. Validation

Required validation after implementation:

```bash
cd "$LIVEMASK_WORKSPACE_ROOT/livemask-ci-cd"
bash scripts/dev-merge-guard.sh --help
bash scripts/dev-merge-guard.sh --repo "$LIVEMASK_WORKSPACE_ROOT/livemask-docs" --task-branch task/EXAMPLE --task-id TASK-EXAMPLE --dry-run
bash scripts/local-dev-status.sh
```

For `livemask-app`:

```bash
cd "$LIVEMASK_WORKSPACE_ROOT/livemask-app"
flutter analyze
flutter test
flutter build ios --simulator --no-codesign
```

If a real iPhone is connected:

```bash
flutter run -d <device-id> -v
```

Expected result:

- New workspace path is used in every active Cursor window.
- Old `Documents/New project 2` path is not used for new edits.
- CI/CD scripts still support explicit `--repo` paths.
- App iOS simulator does not fail with `resource fork, Finder information, or
  similar detritus not allowed`.
- iOS device signing is reported separately from workspace path migration.

## 7. Completion Report Requirements

Completion report must include:

- New workspace root.
- List of repos verified under the new path.
- Any remaining old-path references and whether they are historical examples or
  active script paths.
- Validation command output summary.
- Dev merge commit and remote dev ref.
- Any repos still blocked by environment dependencies.

## 8. Completion Evidence

| Field | Value |
| --- | --- |
| Repository | `livemask-ci-cd` |
| Task branch | `task/TASK-CICD-WORKSPACE-PATH-MIGRATION-001` |
| Previous dev ref | `1f630f0` |
| Rescue branch | `rescue/livemask-ci-cd-dev-before-task-cicd-workspace-path-migration-001-20260520155016` |
| Validation on dev | `bash -n scripts/dev-merge-guard.sh` PASS; `bash -n scripts/local-dev-status.sh` PASS; `bash -n scripts/local-dev.sh` PASS; `bash -n scripts/lib/base_service.sh` PASS; `git diff --check` PASS; `scripts/dev-merge-guard.sh --help` PASS |

Implemented files:

- `scripts/lib/base_service.sh` added `lm_workspace_check()` with
  `LIVEMASK_WORKSPACE_ROOT`, repository presence checks, and Docker checks.
- `scripts/local-dev.sh` now reads `WORKSPACE_DIR` from
  `LIVEMASK_WORKSPACE_ROOT` with fallback to parent directory discovery.
- `scripts/dev-merge-guard.sh` added `_guard_old_path()` startup protection and
  fails closed if run from `/Users/sammytan/Documents/New project 2`.
- `.cursorrules` gained a workspace pre-check section, banned old path, and
  default workspace root rule.
- `scripts/local-dev-status.sh` was created as the workspace/runtime diagnostic
  status report.

## 9. Follow-Up

`livemask-ci-cd` now enforces the workspace pre-check. Other runtime repos must
mirror the same old-path stop rule in their repo-local `.cursorrules`.

Follow-up task:

- `TASK-DOCS-WORKSPACE-RULES-SYNC-001` — replicate the workspace pre-check and
  old-path ban across `livemask-app`, `livemask-admin`, `livemask-backend`,
  `livemask-nodeagent`, `livemask-job-service`, `livemask-website`, and
  `livemask-docs` rules where missing.
