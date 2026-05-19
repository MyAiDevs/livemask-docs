# Branch, Environment, and Release Model

> This document closes the multi-repo branch discipline for LiveMask AI-assisted
> development. It applies to `livemask-docs`, `livemask-backend`,
> `livemask-nodeagent`, `livemask-app`, `livemask-admin`, `livemask-website`,
> and `livemask-ci-cd`.

## 1. Branch Meaning

| Branch / ref | Meaning | Environment | Trigger |
| --- | --- | --- | --- |
| `dev` | Daily development integration branch | Local Go tests + local Docker compose | AI windows, developer commits, PRs into `dev` |
| `main` | Remote pre-release branch | Pre-release promotion bookkeeping | Merge `dev` into `main` after dev smoke is green |
| GitHub Release / `v*` tag | Production release | Production CI/CD gate | Manual versioned release |

Rules:

- Every repository must have a remote `dev` branch.
- AI editors must start from `dev`. If local `dev` does not exist, create it
  from `origin/main` or `origin/dev`, then switch to it.
- Direct feature work on `main` is forbidden.
- `main` is updated only by reviewed merge from `dev`.
- CI/CD smoke / staging validation uses `dev` as the source ref. Do not run
  final smoke from `task/*`, `codex/*`, or feature branches.
- Production is not deployed from `main`; production starts from a manually
  created release version such as `v0.1.0`.

## 2. AI Editor Startup Procedure

At the beginning of every Cursor / Codex window:

```bash
git fetch origin main dev
if git show-ref --verify --quiet refs/heads/dev; then
  git checkout dev
else
  git checkout -b dev origin/dev 2>/dev/null || git checkout -b dev origin/main
fi
git pull --ff-only origin dev
```

Then read the active TASK and continue work from `dev`.

## 3. Development Flow

```text
AI / developer window
  -> checkout dev
  -> implement TASK-XXXX
  -> run local Go / frontend / Docker verification
  -> commit with TASK-XXXX
  -> merge task branch into dev if one was used
  -> re-run validation on dev
  -> push dev
  -> CI validates dev
  -> task-sync comments Issue and unlocks other repo windows
```

`task/*`, `codex/*`, and other feature branches may run prechecks, but their
results are not final acceptance evidence. Final smoke must run after merge to
`dev` and push to `origin/dev`.

`task-sync` is a coordination signal, not a staging deployment signal. It may
dispatch `task-unlocked` to child repositories, but it must not deploy staging
or production by itself.

## 4. Pre-Release Flow

```text
dev smoke is green across required repos
  -> reviewed merge dev -> main
  -> child repo push on main records pre-release promotion
  -> livemask-ci-cd reports the already-validated dev smoke evidence
  -> Lark receives pre-release report
```

`main` therefore represents the latest pre-release candidate. If staging fails,
rollback is a Git revert on `main` or a new merge from a fixed `dev`.

## 5. Production Release Flow

```text
main staging smoke is green
  -> create GitHub Release / tag vX.Y.Z manually
  -> child repo dispatches production-release to livemask-ci-cd
  -> livemask-ci-cd runs production release gate
  -> production deploy can proceed only from this versioned ref
```

Until production deployment scripts are implemented, the production gate may
only validate and notify. It must still be triggered only by release events.

## 6. CI/CD Event Contract

| Event | Producer | Consumer | Purpose |
| --- | --- | --- | --- |
| `task-unlocked` | `livemask-docs` task sync | child repo CI | Notify another repo window that development can start or compatibility CI can run |
| `docs-contract-changed` | `livemask-docs` contract updates on `dev` | child repo CI | Validate compatibility against new docs/contracts |
| `staging-promote` | child repo push to `main` | `livemask-ci-cd` promotion report | Pre-release coordination after dev smoke |
| `production-release` | child repo GitHub Release / `v*` tag | `livemask-ci-cd` production gate | Versioned production release |

## 7. Closed-Loop Assumption Matrix

| Assumption | Expected result | Guard |
| --- | --- | --- |
| Repo has no `dev` branch | Create `dev` from `origin/dev` or `origin/main` | startup procedure |
| AI starts on `main` | AI must switch to `dev` before editing | `.cursorrules` and completion report |
| Task sync unlocks a repo | Child CI checks `dev`, not production | `target_branch=dev` payload |
| A task branch requests CI/CD smoke | Reject or treat as precheck only | dev-only smoke ref guard |
| Docs contract changes on `dev` | Child repos receive `docs-contract-changed` | docs dispatch workflow |
| Merge reaches `main` | Only then notify `livemask-ci-cd` staging | `staging-promote` event |
| Release is created | Only then production gate can run | `production-release` event |
| Staging fails | Do not create release; revert/fix `main` | Lark + CI failure |
| Production fails | Keep previous release active | versioned release rollback |

## 8. Repair Record

| Date | Change | Evidence |
| --- | --- | --- |
| 2026-05-17 | Created remote `dev` branches for all seven LiveMask repos | `livemask-*` branches pushed to `origin/dev` |
| 2026-05-17 | Reclassified `task-unlocked` as development coordination, not deployment | this runbook + AI rules |
| 2026-05-17 | Defined `dev -> main -> release` promotion model | this runbook |
| 2026-05-17 | Updated child repo workflows to test `dev` and dispatch `staging-promote` / `production-release` | `livemask-backend@7c35ad8`, `livemask-nodeagent@c7c8671`, `livemask-app@be12f24`, `livemask-admin@6318e29`, `livemask-website@30273bc` |
| 2026-05-17 | Split CI/CD staging smoke from production release gate | `livemask-ci-cd@1eae151` |
| 2026-05-17 | Updated docs, AI rules, and branch bootstrap script | `livemask-docs@cbc3869`, `livemask-docs@8673a8f` |
| 2026-05-19 | Required task branches to merge into `dev` before completion and required CI/CD smoke to validate `dev` only | `TASK-DOCS-DEV-MERGE-GATE-001`, `TASK-RULES-CICD-DEV-REF-001` |
