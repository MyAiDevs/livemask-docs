# TASK-DOCS-NATURAL-LANGUAGE-TASK-INTAKE-001

> Owner: Docs / All Repositories
> Repo: `livemask-docs`
> Status: Ready
> Environment: dev-local

## 1. Background

The user often reports a requirement or bug as plain text instead of opening a
formal TASK first. Cursor / Codex windows must be able to handle that flow
without bypassing task traceability, dev merge evidence, or docs-led ledger
updates.

This task defines the standard intake flow for plain-language requirements and
bugs.

## 2. Scope

Update shared AI rules, completion-report requirements, and repo-local
`.cursorrules` so every repository follows the same flow:

1. plain text request
2. TASK intake
3. task branch implementation
4. validation
5. guarded dev merge
6. completion report with docs handoff evidence
7. docs window generates or updates task records

## 3. Deliverables

- Shared rules require TASK intake before code changes when the user gives a
  plain-language request or bug.
- Runtime repo `.cursorrules` include a `Natural Language Task Intake` section.
- Docs repo `.cursorrules` explains how to generate/update task records from
  runtime completion evidence.
- Completion report template includes `Task intake summary`.
- Docs governance notes explain that task-sync comes after docs ledger updates,
  not before.

## 4. Cross-Repo Impact

| Repo | Impact |
| --- | --- |
| `livemask-docs` | Owns task files and task-sync after runtime evidence arrives. |
| `livemask-backend` | Must infer task scope and produce docs handoff evidence. |
| `livemask-admin` | Must infer task scope and produce docs handoff evidence. |
| `livemask-app` | Must infer task scope and produce docs handoff evidence. |
| `livemask-nodeagent` | Must infer task scope and produce docs handoff evidence. |
| `livemask-job-service` | Must infer task scope and produce docs handoff evidence. |
| `livemask-ci-cd` | Must infer task scope and produce docs handoff evidence. |
| `livemask-website` | Must infer task scope and produce docs handoff evidence. |

## 5. Runtime Repo Intake Rules

When the user gives a plain-language requirement or bug:

1. Classify the task type:
   - `bugfix`
   - `feature`
   - `docs-only`
   - `test-smoke`
   - `refactor`
   - `investigation`
2. Infer primary and affected repositories.
3. If the current repo does not match, stop with a repository-scope block.
4. Generate a TASK ID:

```text
TASK-<REPO-DOMAIN>-<SHORT-NAME>-<YYYYMMDD>
```

5. Create `task/<TASK-ID>` from latest `origin/dev`.
6. Output a mini task brief before editing:

```text
TASK ID:
Repo:
Problem:
Scope:
Likely files:
Validation plan:
Cross-repo impact:
Docs handoff needed: yes/no
```

7. Implement, test, and merge to dev using `dev-merge-guard.sh`.
8. Output a completion report with `Docs handoff evidence`.
9. Do not directly edit `../livemask-docs`.

## 6. Docs Window Intake Rules

When `livemask-docs` receives runtime completion evidence, it must generate or
update:

- `docs/development/tasks/<TASK-ID>.md`
- `docs/development/tasks/README.md`
- `docs/development/MVP_IMPLEMENTATION_PLAN.md`

If API / DB / event / config / UI contract changed, it must also update:

- `docs/contracts/**`
- `docs/development/cursor-handoffs/**`

If `dev merge commit` or `remote dev ref` is missing, the task must be marked
`partial` or `evidence_missing`, never `completed`.

## 7. Validation

- `bash scripts/check-docs.sh`
- `git diff --check`
- Inspect runtime repo `.cursorrules` for `Natural Language Task Intake`.

