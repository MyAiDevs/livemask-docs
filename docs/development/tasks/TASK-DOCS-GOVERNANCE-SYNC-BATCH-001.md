# TASK-DOCS-GOVERNANCE-SYNC-BATCH-001 — Docs Governance Sync Batch

> Status: partial / evidence_missing
> Owner: Docs / All repos
> Repo: `livemask-docs`
> Related repos: `livemask-backend`, `livemask-admin`, `livemask-app`, `livemask-nodeagent`, `livemask-job-service`, `livemask-website`, `livemask-ci-cd`
> Created: 2026-05-19 (registered in MVP plan), file created 2026-05-20

## 1. Background

`TASK-CICD-CLOSED-LOOP-BATCH-001` identified documentation governance gaps during
its smoke coverage analysis. This batch task ensures that Cursor multi-window
development, PR reviews, and CI/CD smoke have consistent documentation entry points.

This task does not implement runtime code. It is the governance complement to
the CI/CD smoke batch.

## 2. Scope

### Deliverables

| Gap | Artifact | Status |
|-----|----------|--------|
| Contract index | `docs/contracts/contract-index.md` + `docs/contracts/README.md` | ✅ Ready (exists on dev) |
| Missing Cursor handoffs | `DASHBOARD-CICD-CURSOR_HANDOFF.md`, `JOBS-HARDENING-CICD-CURSOR_HANDOFF.md`, `I18N-CICD-CURSOR_HANDOFF.md`, `CICD-SENTRY-OBSERVABILITY-CURSOR_HANDOFF.md` | ✅ Ready (exists on dev) |
| Tasks / MVP plan linkage | `docs/development/tasks/README.md`, `docs/development/MVP_IMPLEMENTATION_PLAN.md` | ✅ Ready (exists on dev) |
| Auth/RBAC permission index | `docs/contracts/api/auth-rbac.md` | ✅ Ready (exists on dev) |

### Out of Scope

- Implementation of Backend/Admin/App/CI-CD runtime code.
- Cursor handoff content for domains not listed above.

## 3. Dev Merge Evidence

| Field | Value |
|-------|-------|
| **Repository** | `livemask-docs` |
| **Task branch** | Not applicable (direct dev commits) |
| **Task branch commit** | N/A |
| **Dev merge commit** | Commit `85f7291` (TASK-DOCS-MVP-SYNC-001) includes task index updates. Additional commits: `6645544`, `31a5206`, `93c78cb`, `00a9e6c`, `bb566ba` etc. |
| **Remote dev ref** | `origin/dev` at `0a5d984` (latest as of 2026-05-20) |
| **Validation** | `bash scripts/check-docs.sh` PASS on `0a5d984` |
| **Evidence status** | **Partial** — individual artifacts exist but the batch task file itself was missing; this file remedies that. |

## 4. Cross-Repo Impact

| Repo | Impact |
|------|--------|
| `livemask-backend` | Contract index references Backend API contracts; Cursor handoffs reference Backend tasks |
| `livemask-admin` | Cursor handoffs reference Admin implementation tasks |
| `livemask-app` | Handoffs reference App implementation tasks |
| `livemask-nodeagent` | Handoffs reference NodeAgent implementation tasks |
| `livemask-job-service` | Handoffs reference Job Service implementation tasks |
| `livemask-website` | Handoffs reference Website implementation tasks |
| `livemask-ci-cd` | Smoke ownership references contract index |
| `livemask-docs` | Owns and maintains all artifacts listed above |

## 5. Remaining Gaps

- Each Cursor handoff file should be validated against actual dev state (task branches merged or not).
- Contract index covers core/ready contracts but some draft contracts may be missing.
- MVP plan still has status inconsistencies (addressed by TASK-DOCS-TASK-LEDGER-RECONCILE-001).

## 6. Completion Report Requirements

Completion report must include:

- All four deliverable artifacts are present on `origin/dev`.
- `bash scripts/check-docs.sh` PASS.
- `git diff --check` PASS.
- No stale or unlinked task references in contract index.
- This task file status upgraded to `Completed` only when:
  - All four artifacts are verified on dev.
  - Contract index is consistent with filesystem.
  - Cursor handoffs reflect current dev state.
