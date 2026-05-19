# TASK-DOCS-CICD-SMOKE-SCRIPT-DISCOVERY-001 — CI/CD Smoke Script Discovery Rule

> Owner: Docs / CI-CD
> Repo: `livemask-docs`, `livemask-ci-cd`
> Status: Completed
> Created: 2026-05-20

## 1. Background

During planning for Admin control plane smoke, `scripts/admin-control-plane-smoke.sh`
was proposed as a possible new script name. The actual `livemask-ci-cd` repository
did not contain that file; it already had nearby domain scripts such as
`system-settings-smoke.sh`, `jobs-smoke.sh`, `protocol-capability-smoke.sh`, and
`release-control-smoke.sh`.

To prevent Cursor windows from treating suggested script names as existing files,
CI/CD tasks need an explicit script discovery gate.

## 2. Scope

- Add a global CI/CD smoke script discovery rule to AI development rules.
- Require CI/CD completion reports to state whether scripts were created or enhanced.
- Add the rule to the task workspace index.
- Mirror the rule in `livemask-ci-cd/.cursorrules`.

## 3. Delivered

- `ai-rules/v3.7/13-Multi-Repo-Development.md` now requires CI/CD windows to list
  existing scripts and search workflows before editing smoke tasks.
- `ai-rules/v3.7/16-Task-Completion-Report.md` now requires CI/CD script discovery
  evidence and forbids completion if workflows reference missing scripts.
- `docs/development/tasks/README.md` now records the rule near the global task
  workspace governance notes.
- `livemask-ci-cd/.cursorrules` mirrors the local repository rule.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-ci-cd` | Must discover existing scripts before adding or wiring smoke scripts. |
| `livemask-docs` | Owns the durable cross-repo rule and task record. |
| Runtime repos | No code impact. Completion reports may reference CI/CD follow-up tasks more accurately. |

## 5. Validation

```text
bash scripts/check-docs.sh PASS
git diff --check PASS
```

## 6. Follow-up

- `TASK-CICD-ADMIN-CONTROL-PLANE-SMOKE-001` should first inspect existing scripts,
  then either enhance the domain scripts or create a new aggregate script and wire
  only real paths into `scripts/smoke.sh` and workflows.
